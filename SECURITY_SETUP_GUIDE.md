# 🔒 Security Setup Guide
**Crypto Arbitrage Bot - Production Security Configuration**

---

## ✅ **Security Improvements Implemented**

### **1. Authentication System** ✅ IMPLEMENTED

We've added API Key authentication to protect all sensitive endpoints.

#### **Protected Endpoints:**
- ✅ `POST /api/arbitrage/execute` - Execute trades
- ✅ `PUT /api/settings` - Update bot settings
- ✅ `POST /api/wallet` - Save wallet configuration
- ✅ `POST /api/exchanges` - Add exchange
- ✅ `DELETE /api/exchanges/{id}` - Delete exchange

#### **Public Endpoints** (No Auth Required):
- `GET /api/health` - Health check
- `GET /api/stats` - Statistics
- `GET /api/settings` - View settings
- `GET /api/tokens` - List tokens
- `GET /api/exchanges` - List exchanges
- `GET /api/wallet` - View wallet info (private key hidden)
- `GET /api/arbitrage/opportunities` - View opportunities

---

## 🚀 **Quick Start - Enable Authentication**

### **Step 1: Generate API Key**

Run this command to generate a secure random API key:

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

Example output:
```
kJ7mN9pQ2rT4vW6xY8zA3bC5dE7fG9hI1jK3lM5nO7pQ
```

### **Step 2: Add to Backend .env File**

Edit `/app/backend/.env`:

```bash
# Authentication (REQUIRED for production)
API_KEY=kJ7mN9pQ2rT4vW6xY8zA3bC5dE7fG9hI1jK3lM5nO7pQ

# JWT (optional - for future token-based auth)
JWT_SECRET=your-super-secret-jwt-key-change-this
```

**IMPORTANT:** 
- Replace with YOUR generated key
- Keep this key SECRET - never commit to Git
- Share only with authorized users

### **Step 3: Restart Backend**

```bash
sudo supervisorctl restart backend
```

### **Step 4: Test Authentication**

**Without API Key (Should Fail):**
```bash
curl -X PUT http://localhost:8001/api/settings \
  -H "Content-Type: application/json" \
  -d '{"is_live_mode": false}'
```

Expected Response:
```json
{
  "detail": "Invalid API key. Please provide valid X-API-Key header."
}
```

**With API Key (Should Succeed):**
```bash
curl -X PUT http://localhost:8001/api/settings \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY_HERE" \
  -d '{"is_live_mode": false}'
```

---

## 🛡️ **Using Authentication in Your Applications**

### **Frontend Integration**

Update your Axios calls to include the API key:

```javascript
// /app/frontend/src/App.js or utility file

import axios from 'axios';

const API_KEY = process.env.REACT_APP_API_KEY; // Store in .env

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
  headers: {
    'X-API-Key': API_KEY
  }
});

// Use this API instance for all authenticated requests
export default api;

// Example usage:
await api.put('/api/settings', { is_live_mode: true });
await api.post('/api/arbitrage/execute', { 
  opportunity_id: '123', 
  usdt_amount: 100,
  confirmed: true 
});
```

### **Python/Script Integration**

```python
import requests

API_KEY = "your-api-key-here"
BASE_URL = "http://localhost:8001"

headers = {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json"
}

# Execute arbitrage
response = requests.post(
    f"{BASE_URL}/api/arbitrage/execute",
    headers=headers,
    json={
        "opportunity_id": "abc123",
        "usdt_amount": 100.0,
        "confirmed": True
    }
)

print(response.json())
```

### **cURL Examples**

```bash
# Update settings
curl -X PUT http://localhost:8001/api/settings \
  -H "X-API-Key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"target_sell_spread": 2.0}'

# Execute arbitrage
curl -X POST http://localhost:8001/api/arbitrage/execute \
  -H "X-API-Key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "opportunity_id": "123",
    "usdt_amount": 100,
    "confirmed": true
  }'

# Add wallet
curl -X POST http://localhost:8001/api/wallet \
  -H "X-API-Key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "private_key": "0x...",
    "address": "0x..."
  }'
```

---

## 🔧 **Additional Security Improvements Implemented**

### **2. Balance Verification** ✅ IMPLEMENTED

Before executing any live arbitrage, the system now checks:

- ✅ Wallet has sufficient USDT for the trade amount
- ✅ Wallet has at least 0.05 BNB for gas fees (configurable)
- ✅ Exchanges are properly configured
- ✅ Token exists in database

**Configuration:**

Edit minimum BNB requirement in settings:

```json
{
  "min_bnb_for_gas": 0.05
}
```

### **3. Realistic Spread Targets** ✅ FIXED

**OLD (Unrealistic):**
- `target_sell_spread`: 85% (impossible to achieve)
- `max_wait_time`: 3600 seconds (1 hour)

**NEW (Realistic):**
- `target_sell_spread`: 2.0% ✅ (achievable in real markets)
- `max_wait_time`: 600 seconds (10 minutes) ✅
- Added: `stop_loss_spread`: -2.0% ✅ (prevents huge losses)

**What This Means:**
- Bot will sell when spread reaches 2% (realistic target)
- If spread never reaches 2%, sells after 10 minutes (fail-safe)
- **NEW:** If spread drops below -2%, sells immediately (stop-loss protection)

### **4. Stop-Loss Protection** ✅ IMPLEMENTED

**Market Crash Protection:**

The bot now monitors for negative spreads and aborts immediately if:
- Current spread <= stop_loss_spread (default: -2%)

**Example Scenario:**
```
1. Bought token on Exchange A
2. Deposited on Exchange B
3. Monitoring spread: 1.5%, 1.8%, 1.2%...
4. Sudden crash: -3% (negative spread = loss)
5. 🛑 STOP-LOSS TRIGGERED
6. Sells immediately to prevent further loss
7. Telegram alert sent
```

**Configuration:**

```json
{
  "stop_loss_spread": -2.0,  // Sell if spread drops to -2% or below
  "target_sell_spread": 2.0, // Target profit spread
  "max_wait_time": 600        // Max wait: 10 minutes
}
```

---

## 📊 **Updated Settings Reference**

### **Complete Settings Object:**

```json
{
  "is_live_mode": false,
  "telegram_chat_id": "123456789",
  "telegram_enabled": true,
  "min_spread_threshold": 0.5,
  "max_trade_amount": 1000.0,
  "slippage_tolerance": 0.5,
  
  // FAIL-SAFE CONFIGURATION (FIXED)
  "target_sell_spread": 2.0,          // Realistic: was 85%
  "spread_check_interval": 10,        // Check every 10 seconds
  "max_wait_time": 600,                // 10 minutes: was 3600
  
  // NEW: STOP-LOSS & SAFETY
  "stop_loss_spread": -2.0,           // Abort if spread drops to -2%
  "min_bnb_for_gas": 0.05             // Minimum BNB required
}
```

---

## 🔐 **Best Practices**

### **1. API Key Management**

✅ **DO:**
- Generate unique keys for each user/application
- Store keys in environment variables (.env)
- Use HTTPS in production
- Rotate keys periodically (every 90 days)
- Keep keys in password manager

❌ **DON'T:**
- Hardcode keys in source code
- Commit keys to version control
- Share keys via unsecured channels (email, Slack)
- Use default/example keys in production

### **2. Environment Variables**

Create `/app/backend/.env`:

```bash
# Database
MONGO_URL=mongodb://localhost:27017
DB_NAME=crypto_arbitrage

# Security
ENCRYPTION_KEY=your-fernet-key-here
API_KEY=your-api-key-here
JWT_SECRET=your-jwt-secret-here

# External Services
TELEGRAM_BOT_TOKEN=your-telegram-token

# CORS (production)
CORS_ORIGINS=https://yourdomain.com
```

### **3. Frontend Environment**

Create `/app/frontend/.env`:

```bash
REACT_APP_BACKEND_URL=https://api.yourdomain.com
REACT_APP_API_KEY=your-frontend-api-key
```

**⚠️ SECURITY WARNING:**
- Frontend API keys are visible to users (inspect network requests)
- For production, implement proper user authentication
- Consider using JWT tokens with login system
- Limit API key permissions if exposed to frontend

---

## 🚨 **Security Checklist**

Before going to production:

### **CRITICAL:**
- [ ] API_KEY set in backend/.env
- [ ] ENCRYPTION_KEY set (for wallet/exchange keys)
- [ ] Wallet private key encrypted in database
- [ ] Balance checks enabled
- [ ] Stop-loss protection configured
- [ ] target_sell_spread set to realistic value (1-3%)

### **HIGH PRIORITY:**
- [ ] HTTPS enabled (use nginx reverse proxy)
- [ ] Firewall configured (only necessary ports)
- [ ] Database backup automated
- [ ] Telegram notifications tested
- [ ] Exchange API keys have withdrawal permissions
- [ ] IP whitelisting on exchanges (if supported)

### **RECOMMENDED:**
- [ ] Rate limiting on API endpoints
- [ ] Request logging enabled
- [ ] Error tracking (Sentry, etc.)
- [ ] Health monitoring (UptimeRobot, etc.)
- [ ] 2FA on exchange accounts
- [ ] Hardware wallet for crypto storage

---

## 🧪 **Testing Authentication**

### **Test Script**

Create `/app/test_auth.py`:

```python
#!/usr/bin/env python3
import requests

BASE_URL = "http://localhost:8001"
API_KEY = "YOUR_API_KEY_HERE"  # Replace with your key

def test_protected_endpoint_without_key():
    """Should fail with 401"""
    print("1. Testing without API key...")
    response = requests.put(
        f"{BASE_URL}/api/settings",
        json={"is_live_mode": False}
    )
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}\n")
    assert response.status_code == 401, "Should return 401"

def test_protected_endpoint_with_key():
    """Should succeed with 200"""
    print("2. Testing with API key...")
    response = requests.put(
        f"{BASE_URL}/api/settings",
        json={"target_sell_spread": 2.0},
        headers={"X-API-Key": API_KEY}
    )
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}\n")
    assert response.status_code == 200, "Should return 200"

def test_public_endpoint():
    """Should work without key"""
    print("3. Testing public endpoint...")
    response = requests.get(f"{BASE_URL}/api/health")
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}\n")
    assert response.status_code == 200, "Should return 200"

if __name__ == "__main__":
    try:
        test_protected_endpoint_without_key()
        test_protected_endpoint_with_key()
        test_public_endpoint()
        print("✅ All tests passed!")
    except Exception as e:
        print(f"❌ Test failed: {e}")
```

Run:
```bash
python3 /app/test_auth.py
```

---

## 📝 **Migration Guide**

If you have existing clients/scripts using the API:

### **1. Update All POST/PUT/DELETE Calls**

**Before:**
```javascript
await axios.put('/api/settings', { is_live_mode: true });
```

**After:**
```javascript
await axios.put('/api/settings', 
  { is_live_mode: true },
  { headers: { 'X-API-Key': 'YOUR_KEY' } }
);
```

### **2. GET Requests (No Change Needed)**

All GET requests still work without authentication:
```javascript
// These still work without API key
await axios.get('/api/settings');
await axios.get('/api/tokens');
await axios.get('/api/health');
```

### **3. Development Mode**

For development/testing, you can disable auth by NOT setting API_KEY in .env:

```bash
# .env file - no API_KEY set
MONGO_URL=mongodb://localhost:27017
```

The system will show warning:
```
⚠️ API_KEY not set - authentication disabled (development mode)
```

---

## 🔍 **Troubleshooting**

### **Issue: "Invalid API key" Error**

**Check:**
1. API_KEY is set in `/app/backend/.env`
2. Backend restarted after setting key
3. Correct header name: `X-API-Key` (case-sensitive)
4. No extra spaces in key value
5. Key matches exactly (no newlines, quotes)

**Debug:**
```bash
# Check .env file
cat /app/backend/.env | grep API_KEY

# Check backend logs
tail -f /var/log/supervisor/backend.out.log

# Test with explicit key
curl -X PUT http://localhost:8001/api/settings \
  -H "X-API-Key: $(cat /app/backend/.env | grep API_KEY | cut -d'=' -f2)" \
  -H "Content-Type: application/json" \
  -d '{"is_live_mode": false}'
```

### **Issue: CORS Error from Frontend**

If using API key from frontend, ensure CORS is configured:

```python
# server.py - update CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specific domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],  # Important: allows X-API-Key header
)
```

---

## 🎓 **Next Steps**

1. **Enable Authentication**: Follow Quick Start guide above
2. **Test All Endpoints**: Use test script to verify
3. **Update Frontend**: Add API key to requests
4. **Configure Fail-Safe**: Set realistic spread targets
5. **Test on Testnet**: Run full arbitrage cycle
6. **Monitor Logs**: Check Telegram notifications
7. **Start Small**: Begin with $10-50 in live mode

---

## 📞 **Support**

For security concerns or questions:
1. Review `/app/LIVE_TRADING_ANALYSIS.md`
2. Check logs: `tail -f /var/log/supervisor/backend.out.log`
3. Test individual components with curl
4. Verify balances before live trading

**Remember:** Better safe than sorry with real money! 💰🔒
