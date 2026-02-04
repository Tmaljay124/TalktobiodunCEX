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
- **Backend**: FastAPI + MongoDB + ccxt
- **Real-time**: WebSocket for live updates
- **Security**: Fernet encryption for API keys and private keys

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

## What's Been Implemented (Jan 2026)
- Full dashboard UI with dark theme and professional trading aesthetic
- Token CRUD operations
- Exchange CRUD with API key encryption and test connection
- Manual CEX selection modal
- Wallet configuration with balance display
- Arbitrage opportunity cards with execute button
- Simulated arbitrage execution flow
- WebSocket connectivity

## Prioritized Backlog
### P0 (Critical - Next Phase)
- Integrate Web3.py for real BSC wallet interactions
- Real price fetching from connected exchanges
- Actual arbitrage execution (non-simulated)

### P1 (High Priority)
- Historical arbitrage logs and profit tracking
- Telegram notifications for opportunities
- Multi-token monitoring improvements

### P2 (Medium Priority)
- ML-based spread prediction
- Risk management settings
- Portfolio analytics

## Next Tasks
1. Test with real exchange API keys
2. Implement actual price monitoring loop
3. Add transaction history view
