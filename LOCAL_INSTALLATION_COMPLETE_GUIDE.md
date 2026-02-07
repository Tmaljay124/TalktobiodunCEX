# 🚀 LOCAL INSTALLATION GUIDE - Complete Setup

## System Requirements

### Minimum Requirements:
- **Operating System:** Windows 10/11, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **RAM:** 4GB minimum (8GB recommended)
- **Disk Space:** 2GB free space
- **Internet:** Stable broadband connection

### Software Prerequisites:
- **Node.js** v16+ (Download: https://nodejs.org/)
- **Python** 3.9+ (Download: https://python.org/)
- **MySQL** 8.0+ (Download: https://dev.mysql.com/downloads/mysql/)
- **Yarn** (Install: `npm install -g yarn`)
- **Git** (Optional, Download: https://git-scm.com/)

---

## Step 1: Install Prerequisites

### Windows:

#### 1.1 Install Node.js
```powershell
# Download and run installer from nodejs.org
# Verify installation:
node --version  # Should show v16+ 
npm --version
```

#### 1.2 Install Python
```powershell
# Download Python 3.9+ from python.org
# During installation, CHECK "Add Python to PATH"
# Verify:
python --version  # Should show 3.9+
pip --version
```

#### 1.3 Install MySQL
```powershell
# Download MySQL Installer from dev.mysql.com
# Choose "MySQL Server" and "MySQL Workbench"
# During setup:
# - Root password: create a strong password (remember it!)
# - Port: 3306 (default)
# - Start MySQL as Windows Service: YES
```

#### 1.4 Install Yarn
```powershell
npm install -g yarn
yarn --version
```

### macOS:

#### 1.1 Install Homebrew (if not installed)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### 1.2 Install Node.js
```bash
brew install node@18
node --version
npm --version
```

#### 1.3 Install Python
```bash
brew install python@3.11
python3 --version
pip3 --version
```

#### 1.4 Install MySQL
```bash
brew install mysql
brew services start mysql

# Secure installation
mysql_secure_installation
# Set root password when prompted
```

#### 1.5 Install Yarn
```bash
npm install -g yarn
yarn --version
```

### Linux (Ubuntu/Debian):

#### 1.1 Update System
```bash
sudo apt update
sudo apt upgrade -y
```

#### 1.2 Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

#### 1.3 Install Python
```bash
sudo apt install -y python3.11 python3-pip python3.11-venv
python3 --version
pip3 --version
```

#### 1.4 Install MySQL
```bash
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql

# Secure installation
sudo mysql_secure_installation
# Set root password when prompted
```

#### 1.5 Install Yarn
```bash
sudo npm install -g yarn
yarn --version
```

---

## Step 2: Download/Clone Project

### Option A: Download ZIP (if you have the files)
```bash
# Extract the ZIP file to a folder, e.g., C:\crypto-arbitrage-bot or ~/crypto-arbitrage-bot
cd /path/to/crypto-arbitrage-bot
```

### Option B: Clone from Git (if using version control)
```bash
git clone <your-repository-url>
cd crypto-arbitrage-bot
```

---

## Step 3: Setup MySQL Database

### 3.1 Start MySQL (if not running)

**Windows:**
```powershell
# MySQL should start automatically
# If not, open Services and start MySQL80
```

**macOS:**
```bash
brew services start mysql
```

**Linux:**
```bash
sudo systemctl start mysql
sudo systemctl status mysql
```

### 3.2 Create Database
```bash
# Login to MySQL
mysql -u root -p
# Enter your root password

# In MySQL console:
CREATE DATABASE crypto_arbitrage;
USE crypto_arbitrage;

# Create tables by running the schema file
source /path/to/crypto-arbitrage-bot/database_schema.sql;

# Or copy-paste from database_schema.sql

# Verify tables created:
SHOW TABLES;

# Should show:
# - settings
# - wallet  
# - tokens
# - exchanges
# - arbitrage_opportunities
# - transaction_logs

# Exit MySQL:
exit;
```

### 3.3 Create MySQL User (Recommended for Security)
```sql
# Login as root
mysql -u root -p

# Create user
CREATE USER 'arbitrage_user'@'localhost' IDENTIFIED BY 'strong_password_here';

# Grant permissions
GRANT ALL PRIVILEGES ON crypto_arbitrage.* TO 'arbitrage_user'@'localhost';
FLUSH PRIVILEGES;

# Exit
exit;
```

---

## Step 4: Configure Backend

### 4.1 Navigate to Backend
```bash
cd backend
```

### 4.2 Create Python Virtual Environment (Recommended)
```bash
# Create venv
python -m venv venv

# Activate venv
# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```

### 4.3 Install Python Dependencies
```bash
pip install -r requirements.txt

# This installs all required packages including:
# - fastapi
# - aiomysql
# - ccxt
# - web3
# - cryptography
# - etc.
```

### 4.4 Create Environment File
```bash
# Create .env file in backend folder
# Copy this template:
```

**backend/.env:**
```bash
# MySQL Database Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=arbitrage_user
MYSQL_PASSWORD=your_strong_password_here
MYSQL_DATABASE=crypto_arbitrage

# Encryption Key (generate a new one!)
# Generate with: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
ENCRYPTION_KEY=your-generated-key-here

# Telegram Bot (Optional - leave empty if not using)
TELEGRAM_BOT_TOKEN=

# Server Configuration
HOST=0.0.0.0
PORT=8001

# CORS Origins (for local development)
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### 4.5 Generate Encryption Key
```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

# Copy the output and paste it as ENCRYPTION_KEY in .env
```

### 4.6 Test Backend
```bash
# Make sure you're in backend folder with venv activated
python server.py

# Or with uvicorn:
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# You should see:
# INFO:     Uvicorn running on http://0.0.0.0:8001
# INFO:     Application startup complete.

# Test API:
# Open browser: http://localhost:8001/api/health
# Should return: {"status": "healthy", ...}

# Stop with Ctrl+C
```

---

## Step 5: Configure Frontend

### 5.1 Navigate to Frontend
```bash
cd ../frontend  # or from root: cd frontend
```

### 5.2 Install Node Dependencies
```bash
yarn install

# This installs all React dependencies
# Takes 2-5 minutes depending on internet speed
```

### 5.3 Create Environment File
```bash
# Create .env file in frontend folder
```

**frontend/.env:**
```bash
# Backend API URL (for local development)
REACT_APP_BACKEND_URL=http://localhost:8001
```

### 5.4 Test Frontend
```bash
yarn start

# This starts development server
# Should automatically open browser to http://localhost:3000
# If not, manually open: http://localhost:3000

# You should see the Arbitrage Dashboard

# Stop with Ctrl+C
```

---

## Step 6: Running Both Services

### Option A: Run in Separate Terminals (Development)

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python server.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
yarn start
```

### Option B: Run with Process Manager (Recommended)

**Install PM2:**
```bash
npm install -g pm2
```

**Create ecosystem file:**

**ecosystem.config.js** (in root folder):
```javascript
module.exports = {
  apps: [
    {
      name: 'arbitrage-backend',
      script: 'server.py',
      cwd: './backend',
      interpreter: './backend/venv/bin/python',  // Adjust for Windows
      watch: false,
      env: {
        PORT: 8001
      }
    },
    {
      name: 'arbitrage-frontend',
      script: 'yarn',
      args: 'start',
      cwd: './frontend',
      watch: false,
      env: {
        PORT: 3000
      }
    }
  ]
};
```

**Run both:**
```bash
pm2 start ecosystem.config.js
pm2 logs  # View logs
pm2 stop all  # Stop all
pm2 restart all  # Restart all
```

---

## Step 7: Initial Configuration

### 7.1 Access Application
```
Open browser: http://localhost:3000
```

### 7.2 Configure Wallet
```
1. Click "Wallet" in sidebar
2. Enter your BSC wallet address
3. Enter your private key (will be encrypted)
4. Click "Save Wallet"
5. Click "Refresh Balance" to verify connection
```

### 7.3 Add Exchange API Keys
```
1. Click "Add Exchange" button
2. Select exchange (Binance, KuCoin, etc.)
3. Enter API Key and Secret
4. Save

Repeat for each exchange you want to use.
```

### 7.4 Add Tokens to Monitor
```
1. Click "Add Token" button
2. Enter token details:
   - Name: Binance Coin
   - Symbol: BNB
   - Contract Address: 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c
   - Select exchanges to monitor
3. Save

Repeat for each token (BNB, ETH, MATIC, etc.)
```

### 7.5 Configure Settings
```
1. Click Settings icon (gear)
2. Configure:
   - Trading Mode: TEST (for testing)
   - Telegram: Optional
   - Min Spread: 0.5%
   - Max Trade: $1000
   - Slippage: 0.5%
3. Save Settings
```

---

## Step 8: Testing

### 8.1 Test in TEST Mode
```
1. Ensure "TEST MODE" is active (yellow badge)
2. Wait for opportunities to appear
3. Click "EXECUTE TEST" on an opportunity
4. Enter amount (e.g., $100)
5. Click Execute
6. Check Activity page for results
```

### 8.2 Monitor Logs

**Backend Logs:**
```bash
# If running directly:
# Check terminal where backend is running

# If using PM2:
pm2 logs arbitrage-backend
```

**Frontend Logs:**
```bash
# Check browser console (F12)
# Look for errors or warnings
```

---

## Step 9: Going LIVE (When Ready)

### 9.1 Prerequisites Checklist
```
☐ Wallet configured with real BSC address
☐ Wallet has USDT for trading
☐ Wallet has BNB for gas fees (minimum 0.01 BNB)
☐ Exchange API keys added with WITHDRAW permissions
☐ Tested thoroughly in TEST mode
☐ Understand risks and fees
☐ Read all documentation
```

### 9.2 Switch to LIVE Mode
```
1. Settings → Trading Mode → Toggle to LIVE
2. Confirm the switch
3. Red warnings will appear everywhere
4. Button changes to "START ARBITRAGE"
```

### 9.3 Execute First LIVE Trade
```
1. Start with small amount ($50-100)
2. Wait for good opportunity (spread > 1.5%)
3. Click "START ARBITRAGE"
4. Review all details carefully
5. Check confirmation checkbox
6. Click Execute
7. Monitor in Activity page (takes 5-15 minutes)
8. Check your wallet for profit
```

---

## Troubleshooting

### Issue: Backend Won't Start

**Error: "Can't connect to MySQL"**
```bash
# Check MySQL is running:
# Windows: Check Services for MySQL80
# macOS: brew services list
# Linux: sudo systemctl status mysql

# Check credentials in backend/.env
# Try connecting manually:
mysql -u arbitrage_user -p crypto_arbitrage
```

**Error: "Module not found"**
```bash
# Make sure venv is activated:
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate  # Windows

# Reinstall dependencies:
pip install -r requirements.txt
```

**Error: "Port 8001 already in use"**
```bash
# Find and kill process:
# Windows:
netstat -ano | findstr :8001
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:8001 | xargs kill -9

# Or change port in backend/.env:
PORT=8002
```

### Issue: Frontend Won't Start

**Error: "Port 3000 already in use"**
```bash
# Kill process on port 3000:
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Or use different port:
PORT=3001 yarn start
```

**Error: "Module not found" or "Cannot resolve"**
```bash
# Delete node_modules and reinstall:
rm -rf node_modules yarn.lock
yarn install
```

**Error: "Cannot connect to backend"**
```bash
# Check backend is running:
curl http://localhost:8001/api/health

# Check REACT_APP_BACKEND_URL in frontend/.env
# Should be: http://localhost:8001
```

### Issue: Database Errors

**Error: "Table doesn't exist"**
```bash
# Run schema again:
mysql -u root -p crypto_arbitrage < database_schema.sql

# Or login and check:
mysql -u root -p
USE crypto_arbitrage;
SHOW TABLES;
```

**Error: "Access denied"**
```bash
# Check MySQL user permissions:
mysql -u root -p

SHOW GRANTS FOR 'arbitrage_user'@'localhost';

# If no grants, recreate user:
DROP USER 'arbitrage_user'@'localhost';
CREATE USER 'arbitrage_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON crypto_arbitrage.* TO 'arbitrage_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## Performance Optimization

### 1. MySQL Configuration
```sql
# For better performance, add to my.cnf or my.ini:
[mysqld]
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
max_connections = 200
```

### 2. Python Process
```bash
# Use production ASGI server:
pip install gunicorn

# Run with multiple workers:
gunicorn server:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8001
```

### 3. Frontend Build
```bash
# For production, build static files:
cd frontend
yarn build

# Serve with simple server:
npm install -g serve
serve -s build -l 3000
```

---

## Security Recommendations

### 1. MySQL Security
```sql
# Don't use root in production
# Create limited user as shown above
# Use strong passwords
# Enable firewall to restrict MySQL port
```

### 2. Environment Files
```bash
# Never commit .env files to git
# Add to .gitignore:
echo "backend/.env" >> .gitignore
echo "frontend/.env" >> .gitignore
```

### 3. API Keys
```bash
# On exchanges:
# - Use IP whitelist
# - Use separate API keys for testing
# - Limit withdrawal amounts
# - Enable 2FA
```

### 4. Wallet Security
```bash
# For production:
# - Consider hardware wallet integration
# - Use separate wallet for trading (not main holdings)
# - Keep private keys encrypted
# - Regular backups
```

---

## Maintenance

### Daily Tasks
```
☐ Check Activity logs for errors
☐ Monitor profit/loss
☐ Verify exchange connections
☐ Check MySQL disk space
```

### Weekly Tasks
```
☐ Update dependencies (if needed)
☐ Review transaction logs
☐ Backup database
☐ Check exchange API limits
```

### Backup Database
```bash
# Create backup:
mysqldump -u root -p crypto_arbitrage > backup_$(date +%Y%m%d).sql

# Restore from backup:
mysql -u root -p crypto_arbitrage < backup_20260207.sql
```

---

## Updating the Application

### Update Backend
```bash
cd backend
git pull  # If using git
pip install -r requirements.txt --upgrade
```

### Update Frontend
```bash
cd frontend
git pull  # If using git
yarn install
```

### Update Database Schema
```bash
# If schema changed, run migration:
mysql -u root -p crypto_arbitrage < new_schema.sql
```

---

## Getting Help

### Check Logs
```bash
# Backend:
tail -f backend/logs/app.log

# MySQL:
# Linux: tail -f /var/log/mysql/error.log
# macOS: tail -f /usr/local/var/mysql/*.err
# Windows: Check MySQL data directory
```

### Common Issues
- See `/app/FULL_ARBITRAGE_IMPLEMENTED.md` for complete guide
- Check `/app/CRITICAL_ANALYSIS.md` for technical details
- Read `/app/FLASH_ARBITRAGE_COMPLETE_GUIDE.md` for strategies

---

## Quick Start Commands

### Development (Quick Start)
```bash
# Terminal 1 - Backend:
cd backend
source venv/bin/activate
python server.py

# Terminal 2 - Frontend:
cd frontend
yarn start

# Browser:
# Open http://localhost:3000
```

### Production (Quick Start)
```bash
# Install PM2
npm install -g pm2

# Start services
pm2 start ecosystem.config.js

# View logs
pm2 logs

# Stop all
pm2 stop all
```

---

**🎉 You're all set! The arbitrage bot should now be running locally.**

For questions or issues, review the troubleshooting section above or check the comprehensive documentation files included with the project.
