# 💰 How to Add Wallet for Arbitrage Funding

## Quick Answer
**To add the wallet that will fund your arbitrage trades:**

### Option 1: Click Wallet Link in Sidebar
1. Click the **"Wallet"** link in the left sidebar (4th item)
2. The Wallet Configuration modal will open automatically
3. Fill in your wallet details (see step-by-step guide below)

### Option 2: Click Wallet Card on Dashboard
1. On the Dashboard, find the **USDT Balance** card (top right stats)
2. Click on this card
3. The Wallet Configuration modal will open

---

## 📝 Step-by-Step: Adding Your Wallet

### Step 1: Open Wallet Configuration
- Click **Wallet** in the sidebar OR click the USDT Balance card on Dashboard
- The "Wallet Configuration" modal will appear

### Step 2: Enter Your Wallet Details

#### **Private Key** (Required)
- Enter your BSC wallet's private key in the "PRIVATE KEY" field
- Click the eye icon to show/hide the key as you type
- ⚠️ **Security**: Your private key is encrypted using Fernet encryption before being stored in the database
- ⚠️ **Warning**: Never share your private key with anyone

#### **Wallet Address** (Optional)
- You can enter your wallet address in the "WALLET ADDRESS (OPTIONAL)" field
- If you leave this empty, the address will be auto-derived from your private key
- Format: Must be a valid BSC address (e.g., `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4`)

### Step 3: Save Your Wallet
- Click the green **"SAVE WALLET"** button
- Your wallet will be validated and saved
- The modal will close automatically on success

### Step 4: Verify Your Wallet
After saving, the "CURRENT WALLET" section will display:
- **Address**: Your BSC wallet address with copy button
- **BNB Balance**: Current BNB balance on the blockchain
- **USDT Balance**: Current USDT (BEP20) balance on the blockchain
- **Network**: Shows whether you're on BSC Mainnet (LIVE mode) or BSC Testnet (TEST mode)
- **Refresh Balance**: Button to fetch latest balances from blockchain

---

## 🔄 How the Wallet is Used for Arbitrage

### TEST Mode (Default)
- ✅ **Safe**: No real funds are used
- ✅ **Simulated**: All trades are simulated
- ✅ **Network**: Connected to BSC Testnet
- ✅ **Purpose**: Test your strategies without risk

### LIVE Mode (Real Trading)
- 🔴 **Real Funds**: Uses actual USDT from your wallet
- 🔴 **Real Orders**: Places real buy/sell orders on exchanges
- 🔴 **Network**: Connected to BSC Mainnet
- 🔴 **Requirements**: 
  - Sufficient USDT balance in your wallet
  - Exchange API keys configured
  - Double confirmation required (mode toggle + execute checkbox)

---

## 💡 Important Notes

### Network Switching
The wallet automatically connects to different BSC networks based on your trading mode:
- **TEST Mode** → BSC Testnet (for testing with test tokens)
- **LIVE Mode** → BSC Mainnet (for real trading with real funds)

### Balance Display
- Balances are fetched in real-time from the BSC blockchain
- Click **"Refresh Balance"** to update balances at any time
- The network indicator shows which blockchain you're connected to

### Security Best Practices
1. ✅ Only use wallets designated for trading
2. ✅ Start with TEST mode to verify everything works
3. ✅ Use small amounts when first starting with LIVE mode
4. ✅ Never share your private key
5. ✅ Keep your private key secure and backed up

### Funding Your Wallet
Before executing arbitrage in LIVE mode:
1. **BNB**: You need some BNB for gas fees (even small amounts, ~0.01 BNB)
2. **USDT**: You need USDT (BEP20) for executing trades
3. Transfer these from an exchange or another wallet to your configured address

---

## 🎯 Quick Checklist

Before executing your first arbitrage:
- [ ] Wallet configured with private key
- [ ] Wallet shows correct address
- [ ] BNB balance available (for gas fees in LIVE mode)
- [ ] USDT balance available (for trading in LIVE mode)
- [ ] At least one token added for monitoring
- [ ] At least one exchange configured with API keys
- [ ] Tested in TEST mode first
- [ ] Understood the difference between TEST and LIVE mode

---

## 🆘 Troubleshooting

### "Invalid BSC address format" error
- Check that your address starts with `0x`
- Ensure it's 42 characters long (0x + 40 hex characters)
- Verify it's a BSC (BEP20) address, not Ethereum mainnet

### Balance shows 0.00 but I have funds
- Click the **"Refresh Balance"** button
- Check that you're on the correct network (Mainnet vs Testnet)
- Verify the address shown matches your actual wallet
- Make sure funds are on BSC network (BEP20), not another chain

### Can't save wallet
- Ensure private key field is not empty
- Check that your address format is valid (if provided)
- Look for error messages in the toast notifications

---

## 📚 Related Documentation

- **Settings**: Configure trading mode, Telegram notifications, and trading parameters
- **Exchanges**: Add exchange API keys for price monitoring and order execution
- **Tokens**: Add BEP20 tokens to monitor for arbitrage opportunities
- **Activity**: View history of all executed trades and transaction logs

---

## Support

For technical issues or questions, please check:
1. Browser console for error messages
2. Backend logs at `/var/log/supervisor/backend.err.log`
3. Network connectivity to BSC RPC endpoints
