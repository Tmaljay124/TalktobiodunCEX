# 🪟 MySQL Setup for Windows - Complete Guide

## Quick Overview

Your Crypto Arbitrage Bot now uses **MySQL** instead of MongoDB. This guide shows you how to set it up on Windows.

---

## Step 1: Install MySQL

### Download MySQL
1. Go to: https://dev.mysql.com/downloads/installer/
2. Download **MySQL Installer for Windows**
3. Choose "mysql-installer-community" (larger file, includes everything)

### Install MySQL
1. Run the installer
2. Choose **"Developer Default"** or **"Server only"**
3. Click **Next** through the configuration
4. **Important Settings:**
   - Port: **3306** (default)
   - Root Password: **Create a strong password and remember it!**
   - Windows Service: **MySQL80** (check "Start at System Startup")
   - Authentication: Choose **"Use Strong Password Encryption"**

5. Click **Execute** to install
6. Click **Finish**

### Verify MySQL is Running
```powershell
# Open PowerShell and run:
sc query MySQL80

# Should show: STATE : 4  RUNNING
```

---

## Step 2: Create Database

### Option A: Using MySQL Command Line
```powershell
# Login to MySQL
mysql -u root -p
# Enter your root password when prompted

# In MySQL console, run:
CREATE DATABASE crypto_arbitrage;
USE crypto_arbitrage;

# Run the schema file (copy from database_schema.sql)
# Or paste each CREATE TABLE statement

# Verify tables were created:
SHOW TABLES;

# Should show:
# - arbitrage_opportunities
# - exchanges
# - settings
# - tokens
# - transaction_logs
# - wallet

# Exit MySQL:
exit;
```

### Option B: Using MySQL Workbench (GUI)
1. Open MySQL Workbench (installed with MySQL)
2. Click on **Local instance MySQL80**
3. Enter root password
4. Click **"Create Schema"** button (cylinder icon)
5. Name: `crypto_arbitrage`
6. Click **Apply**
7. Open `database_schema.sql` file
8. Execute all CREATE TABLE statements
9. Verify tables appear in left sidebar

---

## Step 3: Configure Backend

### Update .env File
Open `backend\.env` and update these lines:

```env
# MySQL Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_actual_password_here
MYSQL_DATABASE=crypto_arbitrage

# Generate Encryption Key
ENCRYPTION_KEY=paste_generated_key_here
```

### Generate Encryption Key
```powershell
cd backend
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

# Copy the output and paste as ENCRYPTION_KEY in .env
```

---

## Step 4: Install Python Dependencies

```powershell
cd backend

# Create virtual environment (if not done)
python -m venv venv

# Activate venv
venv\Scripts\activate

# Install dependencies including MySQL driver
pip install -r requirements.txt

# Should install aiomysql and PyMySQL
```

---

## Step 5: Test MySQL Connection

### Quick Test Script
Create a file `test_mysql.py` in backend folder:

```python
import asyncio
import aiomysql

async def test_connection():
    try:
        conn = await aiomysql.connect(
            host='localhost',
            port=3306,
            user='root',
            password='your_password',  # Change this!
            db='crypto_arbitrage'
        )
        
        async with conn.cursor() as cur:
            await cur.execute("SHOW TABLES")
            tables = await cur.fetchall()
            print("✅ MySQL Connection Successful!")
            print(f"Tables found: {len(tables)}")
            for table in tables:
                print(f"  - {table[0]}")
        
        conn.close()
    except Exception as e:
        print(f"❌ MySQL Connection Failed: {e}")

asyncio.run(test_connection())
```

Run it:
```powershell
python test_mysql.py

# Should show:
# ✅ MySQL Connection Successful!
# Tables found: 6
#   - arbitrage_opportunities
#   - exchanges
#   - settings
#   - tokens
#   - transaction_logs
#   - wallet
```

---

## Step 6: Start the Application

### Start Backend
```powershell
cd backend
venv\Scripts\activate
python server.py

# Should see:
# INFO: MySQL connection pool created: crypto_arbitrage
# INFO: Application started successfully with MySQL
# INFO: Uvicorn running on http://0.0.0.0:8001
```

### Start Frontend (New Window)
```powershell
cd frontend
yarn start

# Browser opens to http://localhost:3000
```

---

## 🔧 Troubleshooting

### Error: "Can't connect to MySQL server"

**Check if MySQL is running:**
```powershell
sc query MySQL80

# If stopped, start it:
net start MySQL80
```

**Check firewall:**
- Windows Defender Firewall might block MySQL
- Add exception for MySQL (port 3306)

### Error: "Access denied for user 'root'@'localhost'"

**Wrong password:**
1. Check your password in `.env`
2. Try resetting MySQL root password:
   ```powershell
   # Stop MySQL
   net stop MySQL80
   
   # Start in safe mode and reset password
   # (Search online for "reset MySQL root password Windows")
   ```

### Error: "Unknown database 'crypto_arbitrage'"

**Database not created:**
```powershell
mysql -u root -p
CREATE DATABASE crypto_arbitrage;
exit;
```

### Error: "Table doesn't exist"

**Tables not created:**
1. Run all CREATE TABLE statements from `database_schema.sql`
2. Or import the schema file:
   ```powershell
   mysql -u root -p crypto_arbitrage < database_schema.sql
   ```

### Error: "Module 'aiomysql' not found"

**Missing dependency:**
```powershell
venv\Scripts\activate
pip install aiomysql PyMySQL
```

---

## 📊 MySQL Management Tools

### MySQL Workbench (Recommended)
- Included with MySQL installation
- Visual database management
- Easy to view data, run queries
- Execute SQL scripts

### phpMyAdmin (Optional)
- Web-based management
- Requires separate installation
- Good for those familiar with it

### Command Line (Advanced)
```powershell
# Login
mysql -u root -p

# Use database
USE crypto_arbitrage;

# View tables
SHOW TABLES;

# View data
SELECT * FROM settings;
SELECT * FROM tokens;
SELECT * FROM exchanges;

# Count records
SELECT COUNT(*) FROM arbitrage_opportunities;

# Exit
exit;
```

---

## 🔒 Security Best Practices

### Create Non-Root User (Recommended)
```sql
-- Login as root
mysql -u root -p

-- Create new user
CREATE USER 'arbitrage_user'@'localhost' IDENTIFIED BY 'strong_password_here';

-- Grant permissions
GRANT ALL PRIVILEGES ON crypto_arbitrage.* TO 'arbitrage_user'@'localhost';
FLUSH PRIVILEGES;

-- Test new user
exit;
mysql -u arbitrage_user -p
```

Then update `.env`:
```env
MYSQL_USER=arbitrage_user
MYSQL_PASSWORD=strong_password_here
```

### Secure MySQL Installation
```powershell
# Run secure installation script
mysql_secure_installation

# Answer:
# - Set root password? [Already done]
# - Remove anonymous users? YES
# - Disallow root login remotely? YES
# - Remove test database? YES
# - Reload privilege tables? YES
```

---

## 📈 Performance Tuning (Optional)

### MySQL Configuration
Edit `my.ini` (usually in `C:\ProgramData\MySQL\MySQL Server 8.0\`)

```ini
[mysqld]
# Increase buffer pool for better performance
innodb_buffer_pool_size = 1G

# Increase connections
max_connections = 200

# Optimize for SSDs
innodb_flush_method = O_DIRECT
```

Restart MySQL after changes:
```powershell
net stop MySQL80
net start MySQL80
```

---

## ✅ Verification Checklist

Before running the bot, verify:

- [ ] MySQL installed and running (sc query MySQL80)
- [ ] Database created (crypto_arbitrage)
- [ ] All 6 tables created (SHOW TABLES)
- [ ] .env file updated with MySQL credentials
- [ ] Python dependencies installed (aiomysql)
- [ ] Test connection successful (python test_mysql.py)
- [ ] Backend starts without errors
- [ ] Frontend connects successfully

---

## 🎯 Quick Start Summary

```powershell
# 1. Install MySQL and create database
mysql -u root -p
CREATE DATABASE crypto_arbitrage;
# Run database_schema.sql

# 2. Configure backend
cd backend
# Edit .env file with MySQL credentials

# 3. Install dependencies
venv\Scripts\activate
pip install -r requirements.txt

# 4. Start backend
python server.py

# 5. Start frontend (new window)
cd frontend
yarn start
```

---

## 📚 Additional Resources

- **MySQL Documentation:** https://dev.mysql.com/doc/
- **MySQL Workbench Guide:** https://dev.mysql.com/doc/workbench/en/
- **MySQL Windows Install:** https://dev.mysql.com/doc/refman/8.0/en/windows-installation.html

---

**🎉 MySQL setup complete! Your bot now uses MySQL instead of MongoDB.**

For application usage, see:
- `/app/WINDOWS_SETUP_GUIDE.md` - General Windows setup
- `/app/FULL_ARBITRAGE_IMPLEMENTED.md` - Features guide
- `/app/LOCAL_INSTALLATION_COMPLETE_GUIDE.md` - Complete guide
