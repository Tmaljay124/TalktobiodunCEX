# Crypto Arbitrage Bot - PRD

## Original Problem Statement
Build a BSC Multi-Exchange Arbitrage Bot with:
- Dashboard for monitoring tokens and arbitrage opportunities
- Manual CEX selection for buy/sell exchanges
- Token management (BEP20 tokens)
- Exchange management (Binance, Gate.io, Huobi with API credentials)
- Wallet configuration with encrypted private key storage
- Real-time WebSocket updates
- Arbitrage execution with USDT amount specification

## Architecture
- **Frontend**: React + Tailwind CSS + Framer Motion
- **Backend**: FastAPI + MongoDB + ccxt + Web3.py
- **Real-time**: WebSocket for live updates
- **Security**: Fernet encryption for API keys and private keys
- **Notifications**: Telegram Bot API

## User Personas
1. **Crypto Trader**: Monitors arbitrage opportunities across exchanges
2. **Bot Operator**: Configures tokens, exchanges, and executes trades

## Core Requirements (Static)
- [x] Dashboard with stats and opportunities
- [x] Add/manage BEP20 tokens
- [x] Add/manage CEX with encrypted API credentials
- [x] Manual buy/sell exchange selection
- [x] Wallet configuration with encrypted private key
- [x] Arbitrage opportunity detection
- [x] Execute arbitrage (simulation mode)
- [x] WebSocket real-time updates

## Latest Implementation (Feb 2026)

### Real Order Execution
- **Test/Live Mode Toggle**: Users can switch between simulated and real trading
- **Confirmation Required**: Live trades require explicit user confirmation with checkbox
- **Slippage Protection**: Configurable tolerance (default 0.5%) to prevent execution if prices change too much
- **Order Tracking**: Buy/sell order IDs returned for verification

### Web3 BSC Integration
- **BSC Mainnet/Testnet**: Automatically switches based on trading mode
- **Real Balance Fetching**: BNB and USDT (BEP20) balances from blockchain
- **Wallet Validation**: Checksum address validation

### Telegram Notifications
- **Opportunity Detection**: Alerts when new arbitrage opportunities are found
- **Trade Execution**: Notifications when trades start and complete
- **Profit/Loss Reporting**: Detailed results with profit percentage
- **Error Alerts**: Immediate notification of any failures

## API Endpoints

### Settings
- `GET /api/settings` - Get bot configuration
- `PUT /api/settings` - Update settings (mode, Telegram, thresholds)

### Telegram
- `POST /api/telegram/test?chat_id=<id>` - Test notification

### Wallet
- `GET /api/wallet/balance` - Fetch real BSC balance

### Arbitrage
- `POST /api/arbitrage/execute` - Execute with `confirmed: true` for live trades

## Safety Features
1. **Default to Test Mode**: No real trades without explicit mode change
2. **Double Confirmation**: UI checkbox + API confirmed parameter
3. **Price Validation**: Cannot execute with zero or missing prices
4. **Slippage Protection**: Automatic abort if prices change too much
5. **Warning Banners**: Clear visual indicators for live mode

## Prioritized Backlog
### P0 (Critical) - ✅ COMPLETED
- [x] Real order execution via ccxt
- [x] Web3.py integration for BSC wallet
- [x] Telegram notifications

### P1 (High Priority)
- [ ] Historical arbitrage logs with real PnL
- [ ] Multi-token monitoring improvements
- [ ] Order status polling

### P2 (Medium Priority)
- [ ] ML-based spread prediction
- [ ] Risk management settings
- [ ] Portfolio analytics

## Configuration
- **Telegram Bot Token**: Set in backend/.env as `TELEGRAM_BOT_TOKEN`
- **Encryption Key**: Auto-generated or set as `ENCRYPTION_KEY`
- **Database**: MongoDB with `MONGO_URL` and `DB_NAME`

## Next Tasks
1. Test with real exchange API keys in Test mode first
2. Configure Telegram chat ID in Settings
3. Verify wallet balance fetching works
4. Gradually transition to Live mode with small amounts
