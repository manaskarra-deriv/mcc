# Market Command Center

A comprehensive dashboard for real-time market data, AI-powered insights, and technical analysis.

## Features

- **Market Overview**: Track major indices, market sectors, and get a quick snapshot of market performance
- **Performance Tracker**: Multi-timeframe performance analysis across global markets, sectors, and asset classes
- **Technical Analysis**: Advanced signal generation and pattern recognition across multiple timeframes
- **Correlation Matrix**: Deep insight into market relationships and dependencies

## Architecture

This application uses a modern stack:

- **Frontend**: React with Material UI
- **Backend**: Python Flask API
- **Data**: Mock data with plans to integrate with real market data providers

## Setup Instructions

### Backend Setup

1. Create a Python virtual environment (optional but recommended):
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install backend dependencies:
   ```
   pip install flask flask-cors pandas numpy python-dotenv
   ```

3. Create a `.env` file with your API keys (if applicable):
   ```
   ALPACA_API_KEY=your_alpaca_key
   ALPACA_SECRET_KEY=your_alpaca_secret
   ```

4. Run the backend:
   ```
   python api.py
   ```

### Frontend Setup

1. Install Node.js dependencies:
   ```
   npm install
   ```

2. Run the frontend:
   ```
   npm start
   ```

The application will be available at http://localhost:3000, and the API at http://localhost:5000.

## Development

### Project Structure

- `/public` - Static assets
- `/src` - React application code
  - `/components` - Reusable UI components
  - `/pages` - Page components
  - `/utils` - Utility functions
- `api.py` - Flask backend API

### Adding New Features

1. Add new API endpoints in `api.py` as needed
2. Create React components in the `/src/components` directory
3. Add new pages in the `/src/pages` directory
4. Update routing in `App.js` if necessary

## Future Enhancements

- Real-time data integration using WebSockets
- AI Market Intelligence System
- Portfolio management and tracking
- Enhanced technical indicators and charting
- User authentication and personalization
- Mobile optimization 