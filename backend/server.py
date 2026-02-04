from fastapi import FastAPI, APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import asyncio
import json
from cryptography.fernet import Fernet
import base64
import hashlib
import ccxt.async_support as ccxt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Encryption key for API secrets
ENCRYPTION_KEY = os.environ.get('ENCRYPTION_KEY', Fernet.generate_key().decode())
fernet = Fernet(ENCRYPTION_KEY.encode() if isinstance(ENCRYPTION_KEY, str) else ENCRYPTION_KEY)

app = FastAPI(title="Crypto Arbitrage Bot API", version="1.0.0")
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

manager = ConnectionManager()

# ============== MODELS ==============
class TokenCreate(BaseModel):
    name: str
    symbol: str
    contract_address: str
    monitored_exchanges: List[str] = []

class Token(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    symbol: str
    contract_address: str
    monitored_exchanges: List[str] = []
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    is_active: bool = True

class ExchangeCreate(BaseModel):
    name: str
    api_key: str
    api_secret: str
    additional_params: Optional[Dict[str, str]] = None

class Exchange(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    api_key_encrypted: str
    api_secret_encrypted: str
    additional_params_encrypted: Optional[str] = None
    is_active: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class WalletConfigCreate(BaseModel):
    private_key: str
    address: Optional[str] = None

class WalletConfig(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    address: str
    private_key_encrypted: str
    balance_bnb: float = 0.0
    balance_usdt: float = 0.0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ArbitrageOpportunity(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    token_id: str
    token_symbol: str
    buy_exchange: str
    sell_exchange: str
    buy_price: float
    sell_price: float
    spread_percent: float
    confidence: float
    recommended_usdt_amount: float
    status: str = "detected"  # detected, executing, completed, failed
    is_manual_selection: bool = False
    detected_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    persistence_minutes: int = 0

class ManualSelectionCreate(BaseModel):
    token_id: str
    buy_exchange: str
    sell_exchange: str

class ExecuteArbitrageRequest(BaseModel):
    opportunity_id: str
    usdt_amount: float

class PriceData(BaseModel):
    exchange: str
    symbol: str
    bid: float
    ask: float
    last: float
    timestamp: str

class TransactionLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    opportunity_id: str
    step: str
    status: str
    details: Dict[str, Any] = {}
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# ============== ENCRYPTION HELPERS ==============
def encrypt_data(data: str) -> str:
    return fernet.encrypt(data.encode()).decode()

def decrypt_data(encrypted_data: str) -> str:
    return fernet.decrypt(encrypted_data.encode()).decode()

# ============== EXCHANGE INSTANCES ==============
exchange_instances: Dict[str, ccxt.Exchange] = {}

async def get_exchange_instance(exchange_name: str) -> Optional[ccxt.Exchange]:
    """Get or create an exchange instance"""
    if exchange_name.lower() in exchange_instances:
        return exchange_instances[exchange_name.lower()]
    
    # Fetch exchange config from DB
    exchange_doc = await db.exchanges.find_one({"name": {"$regex": f"^{exchange_name}$", "$options": "i"}, "is_active": True}, {"_id": 0})
    if not exchange_doc:
        return None
    
    try:
        api_key = decrypt_data(exchange_doc['api_key_encrypted'])
        api_secret = decrypt_data(exchange_doc['api_secret_encrypted'])
        
        config = {
            'apiKey': api_key,
            'secret': api_secret,
            'enableRateLimit': True,
            'timeout': 30000,
        }
        
        exchange_class = getattr(ccxt, exchange_name.lower(), None)
        if not exchange_class:
            return None
        
        instance = exchange_class(config)
        await instance.load_markets()
        exchange_instances[exchange_name.lower()] = instance
        return instance
    except Exception as e:
        logger.error(f"Error creating exchange instance for {exchange_name}: {e}")
        return None

async def close_exchange_instances():
    """Close all exchange instances"""
    for name, instance in exchange_instances.items():
        try:
            await instance.close()
        except Exception:
            pass
    exchange_instances.clear()

# ============== TOKEN ENDPOINTS ==============
@api_router.post("/tokens", response_model=Token)
async def create_token(token_data: TokenCreate):
    token = Token(**token_data.model_dump())
    doc = token.model_dump()
    await db.tokens.insert_one(doc)
    return token

@api_router.get("/tokens", response_model=List[Token])
async def get_tokens():
    tokens = await db.tokens.find({"is_active": True}, {"_id": 0}).to_list(100)
    return tokens

@api_router.get("/tokens/{token_id}", response_model=Token)
async def get_token(token_id: str):
    token = await db.tokens.find_one({"id": token_id}, {"_id": 0})
    if not token:
        raise HTTPException(status_code=404, detail="Token not found")
    return Token(**token)

@api_router.delete("/tokens/{token_id}")
async def delete_token(token_id: str):
    result = await db.tokens.update_one({"id": token_id}, {"$set": {"is_active": False}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Token not found")
    return {"status": "deleted"}

# ============== EXCHANGE ENDPOINTS ==============
@api_router.post("/exchanges")
async def create_exchange(exchange_data: ExchangeCreate):
    exchange = Exchange(
        name=exchange_data.name,
        api_key_encrypted=encrypt_data(exchange_data.api_key),
        api_secret_encrypted=encrypt_data(exchange_data.api_secret),
        additional_params_encrypted=encrypt_data(json.dumps(exchange_data.additional_params)) if exchange_data.additional_params else None
    )
    doc = exchange.model_dump()
    await db.exchanges.insert_one(doc)
    return {
        "id": exchange.id,
        "name": exchange.name,
        "is_active": exchange.is_active,
        "created_at": exchange.created_at
    }

@api_router.get("/exchanges")
async def get_exchanges():
    exchanges = await db.exchanges.find({"is_active": True}, {"_id": 0, "api_key_encrypted": 0, "api_secret_encrypted": 0, "additional_params_encrypted": 0}).to_list(100)
    return exchanges

@api_router.delete("/exchanges/{exchange_id}")
async def delete_exchange(exchange_id: str):
    result = await db.exchanges.update_one({"id": exchange_id}, {"$set": {"is_active": False}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Exchange not found")
    # Remove from active instances
    exchange = await db.exchanges.find_one({"id": exchange_id}, {"_id": 0})
    if exchange and exchange['name'].lower() in exchange_instances:
        try:
            await exchange_instances[exchange['name'].lower()].close()
        except Exception:
            pass
        del exchange_instances[exchange['name'].lower()]
    return {"status": "deleted"}

@api_router.post("/exchanges/test")
async def test_exchange_connection(exchange_data: ExchangeCreate):
    """Test exchange API connection"""
    try:
        exchange_class = getattr(ccxt, exchange_data.name.lower(), None)
        if not exchange_class:
            raise HTTPException(status_code=400, detail=f"Exchange {exchange_data.name} not supported")
        
        config = {
            'apiKey': exchange_data.api_key,
            'secret': exchange_data.api_secret,
            'enableRateLimit': True,
            'timeout': 15000,
        }
        
        instance = exchange_class(config)
        await instance.load_markets()
        balance = await instance.fetch_balance()
        await instance.close()
        
        return {"status": "success", "message": f"Connected to {exchange_data.name} successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Connection failed: {str(e)}")

# ============== WALLET ENDPOINTS ==============
@api_router.post("/wallet")
async def save_wallet_config(wallet_data: WalletConfigCreate):
    # Simple address derivation placeholder (in production, use web3)
    address = wallet_data.address or f"0x{hashlib.sha256(wallet_data.private_key.encode()).hexdigest()[:40]}"
    
    wallet = WalletConfig(
        address=address,
        private_key_encrypted=encrypt_data(wallet_data.private_key)
    )
    
    # Upsert wallet config
    await db.wallet.update_one(
        {},
        {"$set": wallet.model_dump()},
        upsert=True
    )
    
    return {
        "id": wallet.id,
        "address": wallet.address,
        "balance_bnb": wallet.balance_bnb,
        "balance_usdt": wallet.balance_usdt
    }

@api_router.get("/wallet")
async def get_wallet_config():
    wallet = await db.wallet.find_one({}, {"_id": 0, "private_key_encrypted": 0})
    if not wallet:
        return None
    return wallet

@api_router.put("/wallet/balance")
async def update_wallet_balance(balance_bnb: float = 0, balance_usdt: float = 0):
    await db.wallet.update_one(
        {},
        {"$set": {"balance_bnb": balance_bnb, "balance_usdt": balance_usdt, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"status": "updated"}

# ============== PRICE MONITORING ==============
@api_router.get("/prices/{symbol}")
async def get_prices(symbol: str):
    """Get prices for a symbol across all configured exchanges"""
    exchanges = await db.exchanges.find({"is_active": True}, {"_id": 0}).to_list(100)
    prices = []
    
    for exchange_doc in exchanges:
        try:
            instance = await get_exchange_instance(exchange_doc['name'])
            if instance and symbol in instance.symbols:
                ticker = await instance.fetch_ticker(symbol)
                prices.append({
                    "exchange": exchange_doc['name'],
                    "symbol": symbol,
                    "bid": ticker.get('bid', 0) or 0,
                    "ask": ticker.get('ask', 0) or 0,
                    "last": ticker.get('last', 0) or 0,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                })
        except Exception as e:
            logger.warning(f"Error fetching price from {exchange_doc['name']}: {e}")
    
    return prices

@api_router.get("/prices/all/tokens")
async def get_all_token_prices():
    """Get prices for all monitored tokens across all exchanges"""
    tokens = await db.tokens.find({"is_active": True}, {"_id": 0}).to_list(100)
    exchanges = await db.exchanges.find({"is_active": True}, {"_id": 0}).to_list(100)
    
    all_prices = []
    
    for token in tokens:
        symbol = f"{token['symbol']}/USDT"
        token_prices = []
        
        for exchange_doc in exchanges:
            try:
                instance = await get_exchange_instance(exchange_doc['name'])
                if instance:
                    # Try different symbol formats
                    symbols_to_try = [symbol, symbol.upper(), symbol.lower()]
                    for sym in symbols_to_try:
                        if sym in instance.symbols:
                            ticker = await instance.fetch_ticker(sym)
                            token_prices.append({
                                "exchange": exchange_doc['name'],
                                "bid": ticker.get('bid', 0) or 0,
                                "ask": ticker.get('ask', 0) or 0,
                                "last": ticker.get('last', 0) or 0,
                            })
                            break
            except Exception as e:
                logger.warning(f"Error fetching {symbol} from {exchange_doc['name']}: {e}")
        
        if token_prices:
            all_prices.append({
                "token_id": token['id'],
                "token_symbol": token['symbol'],
                "prices": token_prices
            })
    
    return all_prices

# ============== ARBITRAGE DETECTION ==============
@api_router.get("/arbitrage/detect")
async def detect_arbitrage_opportunities():
    """Detect arbitrage opportunities across all tokens and exchanges"""
    tokens = await db.tokens.find({"is_active": True}, {"_id": 0}).to_list(100)
    exchanges = await db.exchanges.find({"is_active": True}, {"_id": 0}).to_list(100)
    
    opportunities = []
    
    for token in tokens:
        symbol = f"{token['symbol']}/USDT"
        prices = []
        
        for exchange_doc in exchanges:
            try:
                instance = await get_exchange_instance(exchange_doc['name'])
                if instance:
                    symbols_to_try = [symbol, symbol.upper(), symbol.lower()]
                    for sym in symbols_to_try:
                        if sym in instance.symbols:
                            ticker = await instance.fetch_ticker(sym)
                            if ticker.get('bid') and ticker.get('ask'):
                                prices.append({
                                    "exchange": exchange_doc['name'],
                                    "bid": ticker['bid'],
                                    "ask": ticker['ask'],
                                })
                            break
            except Exception as e:
                logger.warning(f"Error in arbitrage detection for {symbol} on {exchange_doc['name']}: {e}")
        
        # Find arbitrage opportunities
        if len(prices) >= 2:
            # Find lowest ask (buy) and highest bid (sell)
            lowest_ask = min(prices, key=lambda x: x['ask'])
            highest_bid = max(prices, key=lambda x: x['bid'])
            
            if lowest_ask['exchange'] != highest_bid['exchange']:
                spread = highest_bid['bid'] - lowest_ask['ask']
                spread_percent = (spread / lowest_ask['ask']) * 100
                
                if spread_percent > 0.5:  # Minimum threshold
                    # Calculate confidence (simplified)
                    confidence = min(95, 50 + spread_percent * 5)
                    
                    # Calculate recommended amount based on spread
                    recommended_amount = min(1000, max(100, spread_percent * 100))
                    
                    opportunity = ArbitrageOpportunity(
                        token_id=token['id'],
                        token_symbol=token['symbol'],
                        buy_exchange=lowest_ask['exchange'],
                        sell_exchange=highest_bid['exchange'],
                        buy_price=lowest_ask['ask'],
                        sell_price=highest_bid['bid'],
                        spread_percent=round(spread_percent, 4),
                        confidence=round(confidence, 2),
                        recommended_usdt_amount=round(recommended_amount, 2)
                    )
                    opportunities.append(opportunity.model_dump())
    
    # Save opportunities to DB
    if opportunities:
        await db.arbitrage_opportunities.insert_many(opportunities)
    
    return opportunities

@api_router.get("/arbitrage/opportunities")
async def get_arbitrage_opportunities():
    """Get recent arbitrage opportunities"""
    opportunities = await db.arbitrage_opportunities.find(
        {"status": {"$in": ["detected", "manual"]}},
        {"_id": 0}
    ).sort("detected_at", -1).to_list(50)
    return opportunities

@api_router.post("/arbitrage/manual-selection")
async def create_manual_selection(selection: ManualSelectionCreate):
    """Create a manual CEX selection for arbitrage"""
    token = await db.tokens.find_one({"id": selection.token_id}, {"_id": 0})
    if not token:
        raise HTTPException(status_code=404, detail="Token not found")
    
    # Get current prices for the manual selection
    symbol = f"{token['symbol']}/USDT"
    buy_price = 0
    sell_price = 0
    
    try:
        buy_instance = await get_exchange_instance(selection.buy_exchange)
        sell_instance = await get_exchange_instance(selection.sell_exchange)
        
        if buy_instance:
            for sym in [symbol, symbol.upper(), symbol.lower()]:
                if sym in buy_instance.symbols:
                    ticker = await buy_instance.fetch_ticker(sym)
                    buy_price = ticker.get('ask', 0) or 0
                    break
        
        if sell_instance:
            for sym in [symbol, symbol.upper(), symbol.lower()]:
                if sym in sell_instance.symbols:
                    ticker = await sell_instance.fetch_ticker(sym)
                    sell_price = ticker.get('bid', 0) or 0
                    break
    except Exception as e:
        logger.error(f"Error fetching prices for manual selection: {e}")
    
    spread_percent = ((sell_price - buy_price) / buy_price * 100) if buy_price > 0 else 0
    
    opportunity = ArbitrageOpportunity(
        token_id=selection.token_id,
        token_symbol=token['symbol'],
        buy_exchange=selection.buy_exchange,
        sell_exchange=selection.sell_exchange,
        buy_price=buy_price,
        sell_price=sell_price,
        spread_percent=round(spread_percent, 4),
        confidence=100.0,  # Manual selection has 100% confidence
        recommended_usdt_amount=100.0,
        status="manual",
        is_manual_selection=True
    )
    
    doc = opportunity.model_dump()
    await db.arbitrage_opportunities.insert_one(doc)
    
    return opportunity

@api_router.delete("/arbitrage/opportunities/{opportunity_id}")
async def delete_opportunity(opportunity_id: str):
    result = await db.arbitrage_opportunities.delete_one({"id": opportunity_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return {"status": "deleted"}

# ============== EXECUTE ARBITRAGE ==============
@api_router.post("/arbitrage/execute")
async def execute_arbitrage(request: ExecuteArbitrageRequest):
    """Execute an arbitrage opportunity (simulation mode)"""
    opportunity = await db.arbitrage_opportunities.find_one({"id": request.opportunity_id}, {"_id": 0})
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    
    # Update status to executing
    await db.arbitrage_opportunities.update_one(
        {"id": request.opportunity_id},
        {"$set": {"status": "executing"}}
    )
    
    # Simulate execution steps
    steps = [
        {"step": "validate_balance", "status": "completed", "details": {"usdt_amount": request.usdt_amount}},
        {"step": "deposit_to_buy_exchange", "status": "completed", "details": {"exchange": opportunity['buy_exchange']}},
        {"step": "place_buy_order", "status": "completed", "details": {"price": opportunity['buy_price']}},
        {"step": "withdraw_to_wallet", "status": "completed", "details": {}},
        {"step": "deposit_to_sell_exchange", "status": "completed", "details": {"exchange": opportunity['sell_exchange']}},
        {"step": "place_sell_order", "status": "completed", "details": {"price": opportunity['sell_price']}},
        {"step": "withdraw_profits", "status": "completed", "details": {}}
    ]
    
    # Log transaction steps
    for step in steps:
        log = TransactionLog(
            opportunity_id=request.opportunity_id,
            step=step['step'],
            status=step['status'],
            details=step['details']
        )
        await db.transaction_logs.insert_one(log.model_dump())
    
    # Calculate simulated profit
    token_amount = request.usdt_amount / opportunity['buy_price']
    sell_value = token_amount * opportunity['sell_price']
    profit = sell_value - request.usdt_amount
    profit_percent = (profit / request.usdt_amount) * 100
    
    # Update opportunity status
    await db.arbitrage_opportunities.update_one(
        {"id": request.opportunity_id},
        {"$set": {"status": "completed"}}
    )
    
    # Broadcast completion via WebSocket
    await manager.broadcast({
        "type": "arbitrage_completed",
        "opportunity_id": request.opportunity_id,
        "profit": round(profit, 4),
        "profit_percent": round(profit_percent, 4)
    })
    
    return {
        "status": "completed",
        "opportunity_id": request.opportunity_id,
        "usdt_invested": request.usdt_amount,
        "tokens_bought": round(token_amount, 8),
        "sell_value": round(sell_value, 4),
        "profit": round(profit, 4),
        "profit_percent": round(profit_percent, 4)
    }

@api_router.get("/transactions/{opportunity_id}")
async def get_transaction_logs(opportunity_id: str):
    """Get transaction logs for an arbitrage opportunity"""
    logs = await db.transaction_logs.find({"opportunity_id": opportunity_id}, {"_id": 0}).to_list(100)
    return logs

# ============== WEBSOCKET ==============
@api_router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming messages if needed
            message = json.loads(data)
            if message.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)

# ============== HEALTH & STATUS ==============
@api_router.get("/")
async def root():
    return {"message": "Crypto Arbitrage Bot API", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "exchanges_active": len(exchange_instances)
    }

@api_router.get("/stats")
async def get_stats():
    """Get dashboard statistics"""
    token_count = await db.tokens.count_documents({"is_active": True})
    exchange_count = await db.exchanges.count_documents({"is_active": True})
    opportunity_count = await db.arbitrage_opportunities.count_documents({"status": {"$in": ["detected", "manual"]}})
    completed_count = await db.arbitrage_opportunities.count_documents({"status": "completed"})
    
    wallet = await db.wallet.find_one({}, {"_id": 0, "private_key_encrypted": 0})
    
    return {
        "tokens": token_count,
        "exchanges": exchange_count,
        "opportunities": opportunity_count,
        "completed_trades": completed_count,
        "wallet": wallet
    }

# Include router
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_exchange_instances()
    client.close()
