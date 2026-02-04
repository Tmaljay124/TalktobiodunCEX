# 🌐 cPanel Deployment Guide
## BSC Multi-Exchange Crypto Arbitrage Bot

This guide will help you deploy the Crypto Arbitrage Bot on a cPanel shared hosting environment.

---

## ⚠️ Important Limitations

### cPanel Hosting Considerations
- **WebSocket Support**: Limited on shared hosting - real-time features may not work
- **Python Version**: Must support Python 3.9+ (check with your host)
- **MongoDB**: Usually not available on shared hosting - requires external service
- **Process Management**: Limited background process support
- **Resource Limits**: CPU and memory restrictions may affect performance

### Recommended Hosting
For best results, consider:
- **VPS/Cloud** (DigitalOcean, Linode, AWS) - Full control
- **Managed Node.js hosting** (Heroku, Railway, Render) - Easier setup
- **Shared hosting with Node.js support** (A2 Hosting, InMotion) - Budget option

---

## 📋 Prerequisites

### What You'll Need
- ✅ cPanel hosting account with:
  - Python 3.9+ support
  - Node.js 16+ support (or ability to upload built files)
  - SSH access (highly recommended)
  - At least 1GB storage
  - SSL certificate for your domain

- ✅ External MongoDB database:
  - **MongoDB Atlas** (Free tier available) - Recommended
  - **mLab** or other MongoDB hosting

- ✅ Domain or subdomain configured in cPanel

- ✅ FTP/SFTP client (FileZilla) or SSH access

---

## 🗄️ Step 1: Setup MongoDB Atlas (Required)

Since cPanel doesn't include MongoDB, use MongoDB Atlas (free tier):

### 1. Create MongoDB Atlas Account
- Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Sign up for free account

### 2. Create a Cluster
- Click "Build a Cluster"
- Choose "Shared" (free tier)
- Select region closest to your server
- Click "Create Cluster"

### 3. Configure Database Access
- Go to "Database Access"
- Click "Add New Database User"
- Create username and password (save these!)
- Set privileges to "Read and write to any database"

### 4. Configure Network Access
- Go to "Network Access"
- Click "Add IP Address"
- Choose "Allow Access from Anywhere" (0.0.0.0/0)
- Or add your cPanel server IP specifically

### 5. Get Connection String
- Click "Connect" on your cluster
- Choose "Connect your application"
- Copy the connection string:
  ```
  mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
  ```
- Replace `<username>` and `<password>` with your credentials

---

## 📦 Step 2: Prepare Files for Upload

### On Your Local Machine

#### 1. Build the Frontend
```bash
cd frontend
yarn install
yarn build
```

This creates `frontend/build/` with production-ready files.

#### 2. Create Production Backend Package

Create a deployment package:
```bash
# Create deployment directory
mkdir crypto-arbitrage-deploy
cd crypto-arbitrage-deploy

# Copy backend files
cp -r ../backend .
cp -r ../frontend/build ./frontend-build

# Create directory structure
mkdir -p public_html
```

#### 3. Create Production .env File

Create `backend/.env`:
```bash
# MongoDB Atlas connection
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=crypto_arbitrage

# Generate encryption key
ENCRYPTION_KEY=your-generated-encryption-key-here

# Telegram (optional)
TELEGRAM_BOT_TOKEN=

# CORS - Add your domain
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Server config
HOST=0.0.0.0
PORT=8001
```

**Generate encryption key:**
```bash
python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

#### 4. Create Requirements File
Verify `backend/requirements.txt` contains all dependencies.

---

## 📤 Step 3: Upload Files to cPanel

### Method A: Using cPanel File Manager

1. **Login to cPanel**

2. **Open File Manager**

3. **Upload Backend Files**
   - Navigate to home directory (not public_html)
   - Create folder: `arbitrage-bot`
   - Upload entire `backend/` folder into `arbitrage-bot/`
   - Upload `.env` file

4. **Upload Frontend Files**
   - Navigate to `public_html/` (or subdomain directory)
   - Upload all files from `frontend/build/` directory
   - Should include: `index.html`, `static/`, `asset-manifest.json`, etc.

### Method B: Using SSH/SFTP (Recommended)

```bash
# Using SCP (replace with your details)
scp -r backend/ username@yourserver.com:~/arbitrage-bot/
scp -r frontend/build/* username@yourserver.com:~/public_html/

# Or using SFTP (with FileZilla)
# Connect to your server
# Upload backend/ to ~/arbitrage-bot/
# Upload frontend/build/* to ~/public_html/
```

---

## 🐍 Step 4: Setup Python Application

### 1. Access cPanel Terminal or SSH

```bash
ssh username@yourserver.com
```

### 2. Navigate to Backend Directory
```bash
cd ~/arbitrage-bot/backend
```

### 3. Create Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate
```

### 4. Install Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 5. Test Backend Manually
```bash
python3 server.py
# Or
uvicorn server:app --host 0.0.0.0 --port 8001
```

Press `Ctrl+C` to stop after testing.

---

## 🔧 Step 5: Configure Python Application in cPanel

### Option A: Using cPanel Python App Manager (If Available)

1. **Setup Python App**
   - Go to cPanel → "Setup Python App"
   - Click "Create Application"
   - Python version: 3.9+
   - Application root: `/home/username/arbitrage-bot/backend`
   - Application URL: `/api` or subdomain
   - Application startup file: `server.py`
   - Application Entry point: `app`
   - Click "Create"

2. **Add Environment Variables**
   - In the Python app configuration
   - Add each variable from your `.env` file
   - Save configuration

3. **Start Application**
   - Click "Start" button
   - Note the URL where it's running

### Option B: Using Passenger (If Available)

Create `passenger_wsgi.py` in backend directory:
```python
import sys
import os

# Add your application directory to path
sys.path.insert(0, os.path.dirname(__file__))

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Import FastAPI app
from server import app as application
```

Create `.htaccess` in backend directory:
```apache
PassengerEnabled On
PassengerAppType wsgi
PassengerStartupFile passenger_wsgi.py
PassengerPython /home/username/arbitrage-bot/backend/venv/bin/python3
```

---

## 🌐 Step 6: Configure Domain/Subdomain

### Option A: Main Domain
If deploying to main domain (yourdomain.com):

1. Frontend files should be in `public_html/`
2. Backend runs on subdomain or port

### Option B: Subdomain (Recommended)
Create two subdomains:

**Frontend Subdomain: `app.yourdomain.com`**
1. cPanel → Domains → Subdomains
2. Create `app` subdomain
3. Point to directory with frontend build files

**Backend Subdomain: `api.yourdomain.com`**
1. Create `api` subdomain
2. Point to backend directory
3. Setup Python app here

---

## 🔗 Step 7: Configure Frontend to Connect to Backend

### Update Frontend Build

**Before building**, edit `frontend/.env`:
```bash
# Use your backend subdomain
REACT_APP_BACKEND_URL=https://api.yourdomain.com

# Or if backend is on same domain
REACT_APP_BACKEND_URL=https://yourdomain.com/api
```

Then rebuild:
```bash
cd frontend
yarn build
# Re-upload build files to cPanel
```

### Alternative: Environment Variable in HTML

Edit `public_html/index.html` (after upload):
```html
<script>
  window.ENV = {
    REACT_APP_BACKEND_URL: 'https://api.yourdomain.com'
  };
</script>
```

---

## 🚀 Step 8: Setup Process Management

### Option A: Supervisor (If Available)

Create `/home/username/supervisor-arbitrage.conf`:
```ini
[program:arbitrage-backend]
command=/home/username/arbitrage-bot/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001
directory=/home/username/arbitrage-bot/backend
autostart=true
autorestart=true
stderr_logfile=/home/username/logs/arbitrage-error.log
stdout_logfile=/home/username/logs/arbitrage-out.log
user=username
```

### Option B: Cron Job (Fallback)

Create startup script `~/arbitrage-bot/start.sh`:
```bash
#!/bin/bash
cd ~/arbitrage-bot/backend
source venv/bin/activate
nohup uvicorn server:app --host 0.0.0.0 --port 8001 > ~/logs/arbitrage.log 2>&1 &
```

Make executable:
```bash
chmod +x ~/arbitrage-bot/start.sh
```

Add to cron (cPanel → Cron Jobs):
```
@reboot ~/arbitrage-bot/start.sh
```

### Option C: Keep Alive Script

Create `keep-alive.sh`:
```bash
#!/bin/bash
if ! pgrep -f "uvicorn server:app" > /dev/null; then
    cd ~/arbitrage-bot/backend
    source venv/bin/activate
    nohup uvicorn server:app --host 0.0.0.0 --port 8001 > ~/logs/arbitrage.log 2>&1 &
fi
```

Add to cron (run every 5 minutes):
```
*/5 * * * * ~/arbitrage-bot/keep-alive.sh
```

---

## 🔐 Step 9: Configure SSL/HTTPS

### 1. Install SSL Certificate
- cPanel → SSL/TLS Status
- Run AutoSSL for your domain
- Ensure both app and api subdomains have SSL

### 2. Force HTTPS
Create/edit `.htaccess` in `public_html/`:
```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

---

## ✅ Step 10: Testing & Verification

### 1. Test Backend API
```bash
curl https://api.yourdomain.com/api/health
# Should return: {"status":"healthy",...}

curl https://api.yourdomain.com/api/settings
# Should return settings JSON
```

### 2. Test Frontend
- Visit `https://app.yourdomain.com` or `https://yourdomain.com`
- Open browser DevTools (F12) → Console
- Check for errors
- Look at Network tab for API calls

### 3. Test Functionality
- Try opening Settings modal
- Try adding a token
- Try opening wallet configuration
- Navigate to Activity page

---

## 🔧 Troubleshooting

### Backend Not Starting

**Check Python version:**
```bash
python3 --version
# Should be 3.9+
```

**Check logs:**
```bash
tail -f ~/logs/arbitrage-error.log
tail -f ~/logs/arbitrage-out.log
```

**Check if running:**
```bash
ps aux | grep uvicorn
netstat -tulpn | grep 8001
```

### Frontend Can't Connect to Backend

**CORS errors:**
- Check `CORS_ORIGINS` in backend .env
- Restart backend after changes
- Verify SSL on both domains

**Wrong API URL:**
- Check `REACT_APP_BACKEND_URL` used during build
- Rebuild frontend if needed

### MongoDB Connection Issues

**Authentication failed:**
- Verify username/password in connection string
- Check Database Access in MongoDB Atlas

**Network error:**
- Verify IP whitelist in MongoDB Atlas
- Try 0.0.0.0/0 to allow all IPs

### WebSocket Issues

**WebSocket not connecting:**
- Many shared hosting providers block WebSockets
- Real-time features may not work
- Consider disabling WebSocket in code or using polling

---

## 📊 Monitoring & Maintenance

### Check Backend Status
```bash
# SSH into server
ps aux | grep uvicorn

# View logs
tail -f ~/logs/arbitrage-out.log
tail -f ~/logs/arbitrage-error.log
```

### Restart Backend
```bash
# Kill existing process
pkill -f uvicorn

# Start again
cd ~/arbitrage-bot/backend
source venv/bin/activate
nohup uvicorn server:app --host 0.0.0.0 --port 8001 > ~/logs/arbitrage.log 2>&1 &
```

### Update Application
```bash
# Stop backend
pkill -f uvicorn

# Upload new files via FTP/SSH
# Reinstall dependencies if needed
pip install -r requirements.txt

# Restart
~/arbitrage-bot/start.sh
```

---

## 🎯 Performance Optimization

### 1. Enable Gzip Compression
Add to `.htaccess`:
```apache
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
```

### 2. Enable Caching
```apache
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
</IfModule>
```

### 3. Optimize Database Queries
- Use MongoDB indexes
- Limit query results
- Cache frequently accessed data

---

## 🔒 Security Checklist

- [ ] SSL certificate installed and forced HTTPS
- [ ] MongoDB connection uses authentication
- [ ] Strong encryption key generated
- [ ] `.env` file has proper permissions (600)
- [ ] API keys encrypted in database
- [ ] CORS properly configured
- [ ] File upload directory secured
- [ ] Error messages don't expose sensitive info
- [ ] Regular backups scheduled

---

## 🆘 Alternative Deployment Solutions

If cPanel proves too restrictive:

### 1. **Heroku** (Easiest)
```bash
# Install Heroku CLI
heroku create your-app-name
heroku addons:create mongolab
git push heroku main
```

### 2. **Railway** (Simple)
- Connect GitHub repository
- Auto-deploy on push
- Built-in MongoDB addon

### 3. **DigitalOcean App Platform**
- Deploy from GitHub
- Managed database available
- $5/month starting price

### 4. **VPS (Full Control)**
- DigitalOcean, Linode, Vultr
- Install everything yourself
- Use the local deployment guide

---

## 📚 Additional Resources

- [cPanel Documentation](https://docs.cpanel.net/)
- [MongoDB Atlas Setup](https://docs.atlas.mongodb.com/getting-started/)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [React Deployment](https://create-react-app.dev/docs/deployment/)

---

**⚠️ Important Note:** cPanel shared hosting may not be ideal for this application due to WebSocket limitations and process management restrictions. For production use, consider a VPS or Platform-as-a-Service (PaaS) solution for better performance and reliability.

---

**✨ Good luck with your deployment! ✨**
