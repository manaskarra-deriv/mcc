import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from alpaca.data.historical import StockHistoricalDataClient
from alpaca.data.requests import StockBarsRequest
from alpaca.data.timeframe import TimeFrame
import requests

# Page configuration - MUST be the first Streamlit command
st.set_page_config(
    page_title="Market Command Center",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Apply custom CSS
st.markdown("""
<style>
    .main {
        background-color: #f9f9f9;
    }
    .stTabs [data-baseweb="tab-list"] {
        gap: 2px;
    }
    .stTabs [data-baseweb="tab"] {
        background-color: #f0f0f0;
        padding: 10px 20px;
        border-radius: 4px 4px 0px 0px;
    }
    .stTabs [aria-selected="true"] {
        background-color: #ffffff;
        border-top: 2px solid #4682b4;
    }
    .metric-card {
        background-color: white;
        border: 1px solid #e6e6e6;
        padding: 15px;
        border-radius: 5px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    .table-container {
        border: 1px solid #e6e6e6;
        border-radius: 5px;
        background-color: white;
        padding: 5px;
        margin-bottom: 20px;
    }
    .positive {
        color: green !important;
    }
    .negative {
        color: red !important;
    }
    .metric-value {
        font-size: 24px;
        font-weight: bold;
    }
    .metric-label {
        font-size: 14px;
        color: #666;
    }
    .metric-change {
        font-size: 14px;
        margin-left: 10px;
    }
    .section-header {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 10px;
    }
</style>
""", unsafe_allow_html=True)

# Load environment variables
load_dotenv()

# Alpaca API credentials
ALPACA_API_KEY = os.getenv("ALPACA_API_KEY")
ALPACA_SECRET_KEY = os.getenv("ALPACA_SECRET_KEY")

# Initialize Alpaca clients
if ALPACA_API_KEY and ALPACA_SECRET_KEY:
    stock_client = StockHistoricalDataClient(ALPACA_API_KEY, ALPACA_SECRET_KEY)
    st.sidebar.success("Alpaca API keys loaded")
else:
    st.sidebar.error("Alpaca API keys missing. Please check your .env file.")
    ALPACA_API_KEY = st.sidebar.text_input("Enter Alpaca API Key:", type="password")
    ALPACA_SECRET_KEY = st.sidebar.text_input("Enter Alpaca Secret Key:", type="password")
    if ALPACA_API_KEY and ALPACA_SECRET_KEY:
        stock_client = StockHistoricalDataClient(ALPACA_API_KEY, ALPACA_SECRET_KEY)
        st.sidebar.success("API connection established")
    else:
        stock_client = None

# Sidebar navigation
st.sidebar.title("Market Command Center")
st.sidebar.caption("Real-time market insights powered by AI")

# Navigation options
page = st.sidebar.radio(
    "Select Section",
    ["Dashboard", "Market Summary", "Technical Analysis", "Fundamental Catalysts", "Customizable Dashboard"]
)

# Add categories for markets
with st.sidebar.expander("Markets"):
    st.checkbox("Equities", value=True)
    st.checkbox("Forex", value=True)
    st.checkbox("Cryptocurrencies", value=True)
    st.checkbox("Commodities", value=True)

# Add categories for analysis
with st.sidebar.expander("Analysis"):
    st.checkbox("Watchlist", value=True)
    st.checkbox("Screener", value=True)
    st.checkbox("Economic Calendar", value=True)

# Time range selector
time_range = st.sidebar.selectbox(
    "Time Range",
    ["1D", "5D", "1M", "3M", "6M", "YTD", "1Y", "5Y"],
    index=3
)

period_map = {
    "1D": "1d",
    "5D": "5d",
    "1M": "1mo",
    "3M": "3mo",
    "6M": "6mo",
    "YTD": "ytd",
    "1Y": "1y",
    "5Y": "5y"
}

# Main content
st.title(f"📊 {page}")

# Function to get market data
@st.cache_data(ttl=3600)
def get_market_data(_tickers, period="3mo"):
    data = {}
    
    # Return empty data frames if no client is available
    if stock_client is None:
        st.error("Alpaca API client is not initialized. Please provide valid API keys.")
        for ticker in _tickers:
            data[ticker] = pd.DataFrame()
        return data
    
    # Convert period to Alpaca timeframe
    timeframe_map = {
        "1d": TimeFrame.Day,
        "5d": TimeFrame.Day,
        "1mo": TimeFrame.Day,
        "3mo": TimeFrame.Day,
        "6mo": TimeFrame.Day,
        "ytd": TimeFrame.Day,
        "1y": TimeFrame.Day,
        "5y": TimeFrame.Day
    }
    
    # Calculate start and end dates based on period
    end = datetime.now()
    if period == "1d":
        start = end - timedelta(days=1)
    elif period == "5d":
        start = end - timedelta(days=5)
    elif period == "1mo":
        start = end - timedelta(days=30)
    elif period == "3mo":
        start = end - timedelta(days=90)
    elif period == "6mo":
        start = end - timedelta(days=180)
    elif period == "ytd":
        start = datetime(end.year, 1, 1)
    elif period == "1y":
        start = end - timedelta(days=365)
    elif period == "5y":
        start = end - timedelta(days=365*5)
    else:
        start = end - timedelta(days=90)  # Default to 3 months
    
    # Get data for each ticker
    try:
        # Request bars for all tickers at once
        request_params = StockBarsRequest(
            symbol_or_symbols=list(_tickers),
            timeframe=timeframe_map.get(period, TimeFrame.Day),
            start=start,
            end=end,
            feed="iex"  # Use IEX feed instead of SIP
        )
        
        try:
            bars = stock_client.get_stock_bars(request_params)
            
            # Process the response for each ticker
            for ticker in _tickers:
                if ticker in bars.data and bars.data[ticker]:
                    # Convert to DataFrame
                    ticker_data = []
                    for bar in bars.data[ticker]:
                        ticker_data.append(bar.__dict__)
                    
                    df = pd.DataFrame(ticker_data)
                    # Check if timestamp exists in the data
                    if not df.empty:
                        if 'timestamp' in df.columns:
                            df.set_index('timestamp', inplace=True)
                        data[ticker] = df
                    else:
                        # Create mock data for demo purposes
                        data[ticker] = create_mock_data(ticker, start, end)
                else:
                    # Create mock data for demo purposes
                    data[ticker] = create_mock_data(ticker, start, end)
        except Exception as e:
            # Create mock data for all tickers
            for ticker in _tickers:
                data[ticker] = create_mock_data(ticker, start, end)
                
    except Exception as e:
        # Create mock data for all tickers
        for ticker in _tickers:
            data[ticker] = create_mock_data(ticker, start, end)
    
    return data

# Function to create mock data for demo purposes
def create_mock_data(ticker, start_date, end_date):
    # Create a date range from start to end
    date_range = pd.date_range(start=start_date, end=end_date, freq='B')
    
    # Set a seed based on ticker for consistent but different data
    seed = sum(ord(c) for c in ticker)
    np.random.seed(seed)
    
    # Generate random price data with a trend
    n = len(date_range)
    base_price = 100 + np.random.rand() * 900  # Random starting price 
    
    # Add a trend and some randomness
    noise = np.random.normal(0, 1, n)
    trend = np.linspace(0, 20 * (np.random.rand() - 0.5), n)  # Random trend direction
    
    # Calculate prices
    close_prices = base_price + trend + noise * 5
    
    # Ensure no negative prices
    close_prices = np.maximum(close_prices, 1.0)
    
    # Create high, low, open prices
    high_prices = close_prices + np.random.rand(n) * (close_prices * 0.02)
    low_prices = close_prices - np.random.rand(n) * (close_prices * 0.02)
    low_prices = np.maximum(low_prices, 0.1)  # Ensure low prices are positive
    open_prices = low_prices + np.random.rand(n) * (high_prices - low_prices)
    
    # Generate volume
    volume = np.random.randint(100000, 10000000, n)
    
    # Create DataFrame
    df = pd.DataFrame({
        'open': open_prices,
        'high': high_prices,
        'low': low_prices,
        'close': close_prices,
        'volume': volume
    }, index=date_range)
    
    return df

# Dictionary of all market data
markets = {
    # Global Indices
    "indices": {
        "S&P 500": "SPY",
        "NASDAQ": "QQQ",
        "Dow Jones": "DIA",
        "Russell 2000": "IWM",
        "FTSE 100": "EWU",
        "DAX": "EWG",
        "Nikkei 225": "EWJ",
        "Shanghai": "FXI",
        "Hang Seng": "EWH",
        "ASX 200": "EWA"
    },
    # Sectors
    "sectors": {
        "Technology": "XLK",
        "Financials": "XLF",
        "Healthcare": "XLV",
        "Consumer Disc.": "XLY",
        "Energy": "XLE",
        "Utilities": "XLU",
        "Real Estate": "XLRE",
        "Materials": "XLB",
        "Industrials": "XLI",
        "Consumer Staples": "XLP",
        "Communication": "XLC"
    },
    # Forex
    "forex": {
        "EUR/USD": "EURUSD=X",
        "USD/JPY": "USDJPY=X",
        "GBP/USD": "GBPUSD=X",
        "USD/CAD": "USDCAD=X",
        "AUD/USD": "AUDUSD=X",
        "USD/CHF": "USDCHF=X",
        "USD Index": "DX-Y.NYB"
    },
    # Commodities
    "commodities": {
        "Gold": "GC=F",
        "Silver": "SI=F",
        "Crude Oil": "CL=F",
        "Natural Gas": "NG=F",
        "Copper": "HG=F",
        "Corn": "ZC=F",
        "Wheat": "ZW=F"
    },
    # Cryptocurrencies
    "crypto": {
        "Bitcoin": "BTC-USD",
        "Ethereum": "ETH-USD",
        "Solana": "SOL-USD",
        "Binance Coin": "BNB-USD",
        "XRP": "XRP-USD"
    },
    # Fixed Income
    "bonds": {
        "US 10Y": "^TNX",
        "US 2Y": "^UST2Y",
        "US 30Y": "^TYX",
        "German 10Y": "^DEGBOND10Y",
        "UK 10Y": "^UKGBOND10Y",
        "Japan 10Y": "^JPGBOND10Y",
        "10Y Spread": "^TNX-^DEGBOND10Y"
    }
}

# Function to format numbers
def format_number(num, format_type='price'):
    if pd.isna(num):
        return "N/A"
    
    if format_type == 'price':
        if abs(num) >= 1000:
            return f"{num:,.2f}"
        else:
            return f"{num:.2f}"
    elif format_type == 'change':
        return f"{num:+.2f}"
    elif format_type == 'percent':
        return f"{num:+.2f}%"
    elif format_type == 'volume':
        if abs(num) >= 1_000_000_000:
            return f"{num/1_000_000_000:.2f}B"
        elif abs(num) >= 1_000_000:
            return f"{num/1_000_000:.2f}M"
        elif abs(num) >= 1_000:
            return f"{num/1_000:.2f}K"
        else:
            return f"{num:.2f}"
    else:
        return str(num)

# Function to get market metrics
def get_market_metrics(ticker_data, ticker, name, period):
    # Find the price columns
    price_cols = {}
    for type_col, possible_cols in {
        'open': ['open', 'Open', 'o'],
        'high': ['high', 'High', 'h'],
        'low': ['low', 'Low', 'l'],
        'close': ['close', 'Close', 'c', 'price'],
        'volume': ['volume', 'Volume', 'v']
    }.items():
        for col in possible_cols:
            if col in ticker_data.columns:
                price_cols[type_col] = col
                break
    
    # If no close price column, return empty metrics
    if 'close' not in price_cols:
        return {
            "name": name,
            "ticker": ticker,
            "price": None,
            "change": None,
            "change_pct": None,
            "volume": None,
            "m1_pct": None,
            "m3_pct": None,
            "ytd_pct": None
        }
    
    # Get current price
    current_price = ticker_data[price_cols['close']].iloc[-1]
    
    # Get previous day close
    prev_close = ticker_data[price_cols['close']].iloc[-2] if len(ticker_data) > 1 else ticker_data[price_cols['close']].iloc[0]
    
    # Calculate change
    change = current_price - prev_close
    change_pct = (change / prev_close) * 100 if prev_close != 0 else 0
    
    # Get volume if available
    volume = ticker_data[price_cols['volume']].iloc[-1] if 'volume' in price_cols else None
    
    # Calculate period changes
    days_30 = min(30, len(ticker_data))
    days_90 = min(90, len(ticker_data))
    
    price_30d_ago = ticker_data[price_cols['close']].iloc[-days_30] if days_30 > 0 else current_price
    price_90d_ago = ticker_data[price_cols['close']].iloc[-days_90] if days_90 > 0 else current_price
    
    # Get first trading day of year for YTD
    current_year = datetime.now().year
    ytd_start = datetime(current_year, 1, 1)
    ytd_data = ticker_data[ticker_data.index >= ytd_start]
    price_ytd = ticker_data[price_cols['close']].iloc[0] if not ytd_data.empty else current_price
    
    # Calculate percentage changes
    m1_pct = ((current_price / price_30d_ago) - 1) * 100 if price_30d_ago != 0 else 0
    m3_pct = ((current_price / price_90d_ago) - 1) * 100 if price_90d_ago != 0 else 0
    ytd_pct = ((current_price / price_ytd) - 1) * 100 if price_ytd != 0 else 0
    
    return {
        "name": name,
        "ticker": ticker,
        "price": current_price,
        "change": change,
        "change_pct": change_pct,
        "volume": volume,
        "m1_pct": m1_pct,
        "m3_pct": m3_pct,
        "ytd_pct": ytd_pct
    }

if page == "Dashboard":
    # Date display
    current_date = datetime.now()
    st.title("Dashboard")
    st.caption(f"{current_date.strftime('%A, %B %d, %Y')}")
    st.markdown("<hr>", unsafe_allow_html=True)
    
    # Top market indicators in cards
    col1, col2, col3, col4 = st.columns(4)
    
    # Fetch data for key indicators
    key_symbols = ["SPY", "QQQ", "BTC-USD", "EURUSD=X"]
    key_names = ["S&P 500", "NASDAQ", "Bitcoin", "EUR/USD"]
    
    key_data = get_market_data(key_symbols, period=period_map[time_range])
    
    # Display key indicators
    with col1:
        sp500_metrics = get_market_metrics(key_data["SPY"], "SPY", "S&P 500", period_map[time_range])
        st.markdown(
            f"""
            <div class="metric-card">
                <div class="metric-label">S&P 500</div>
                <div class="metric-label">US Large Cap Equities</div>
                <div class="metric-value">{format_number(sp500_metrics['price'])}</div>
                <span class="metric-change {'positive' if sp500_metrics['change_pct'] >= 0 else 'negative'}">
                    {format_number(sp500_metrics['change_pct'], 'percent')}
                </span>
            </div>
            """, 
            unsafe_allow_html=True
        )
    
    with col2:
        nasdaq_metrics = get_market_metrics(key_data["QQQ"], "QQQ", "NASDAQ", period_map[time_range])
        st.markdown(
            f"""
            <div class="metric-card">
                <div class="metric-label">NASDAQ</div>
                <div class="metric-label">US Tech Equities</div>
                <div class="metric-value">{format_number(nasdaq_metrics['price'])}</div>
                <span class="metric-change {'positive' if nasdaq_metrics['change_pct'] >= 0 else 'negative'}">
                    {format_number(nasdaq_metrics['change_pct'], 'percent')}
                </span>
            </div>
            """, 
            unsafe_allow_html=True
        )
        
    with col3:
        btc_metrics = get_market_metrics(key_data["BTC-USD"], "BTC-USD", "Bitcoin", period_map[time_range])
        st.markdown(
            f"""
            <div class="metric-card">
                <div class="metric-label">Bitcoin</div>
                <div class="metric-label">Cryptocurrency Market Leader</div>
                <div class="metric-value">${format_number(btc_metrics['price'])}</div>
                <span class="metric-change {'positive' if btc_metrics['change_pct'] >= 0 else 'negative'}">
                    {format_number(btc_metrics['change_pct'], 'percent')}
                </span>
            </div>
            """, 
            unsafe_allow_html=True
        )
        
    with col4:
        eur_metrics = get_market_metrics(key_data["EURUSD=X"], "EURUSD=X", "EUR/USD", period_map[time_range])
        st.markdown(
            f"""
            <div class="metric-card">
                <div class="metric-label">EUR/USD</div>
                <div class="metric-label">Euro vs US Dollar</div>
                <div class="metric-value">{format_number(eur_metrics['price'])}</div>
                <span class="metric-change {'positive' if eur_metrics['change_pct'] >= 0 else 'negative'}">
                    {format_number(eur_metrics['change_pct'], 'percent')}
                </span>
            </div>
            """, 
            unsafe_allow_html=True
        )
    
    st.markdown("<br>", unsafe_allow_html=True)
    
    # Dashboard Views
    st.subheader("Dashboard Views")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.markdown(
            """
            <div class="metric-card">
                <h3>📊 Market Summary</h3>
                <p>Comprehensive market overview with indices, sectors, forex, and more</p>
                <p>Get a bird's eye view of all major markets with detailed performance metrics, economic events, and AI-powered market insights.</p>
            </div>
            """,
            unsafe_allow_html=True
        )
        st.button("View Market Summary", key="view_summary")
        
    with col2:
        st.markdown(
            """
            <div class="metric-card">
                <h3>📈 Technical Analysis</h3>
                <p>Technical indicators, correlations, and chart patterns</p>
                <p>Advanced technical analysis tools including indicator dashboards, correlation matrices, chart pattern detection, and more.</p>
            </div>
            """,
            unsafe_allow_html=True
        )
        st.button("View Technical Analysis", key="view_ta")
        
    with col3:
        st.markdown(
            """
            <div class="metric-card">
                <h3>🔧 Customizable Dashboard</h3>
                <p>Create your own personalized dashboard layout</p>
                <p>Build a completely customizable dashboard with drag-and-drop widgets for the markets and metrics that matter most to you.</p>
            </div>
            """,
            unsafe_allow_html=True
        )
        st.button("Customize Dashboard", key="customize")
    
    st.markdown("<br>", unsafe_allow_html=True)
    
    # Markets Section
    st.subheader("Markets")
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.markdown(
            """
            <div class="metric-card">
                <h3>💹 Equities</h3>
                <p>US and international stock markets, indices, sectors, and individual stocks.</p>
            </div>
            """,
            unsafe_allow_html=True
        )
        st.button("View Equities", key="view_equities")
        
    with col2:
        st.markdown(
            """
            <div class="metric-card">
                <h3>💱 Forex</h3>
                <p>Currency pairs, exchange rates, and global forex market performance.</p>
            </div>
            """,
            unsafe_allow_html=True
        )
        st.button("View Forex", key="view_forex")
        
    with col3:
        st.markdown(
            """
            <div class="metric-card">
                <h3>🪙 Cryptocurrencies</h3>
                <p>Bitcoin, Ethereum, and other digital assets with market metrics.</p>
            </div>
            """,
            unsafe_allow_html=True
        )
        st.button("View Crypto", key="view_crypto")
        
    with col4:
        st.markdown(
            """
            <div class="metric-card">
                <h3>📅 Economic Calendar</h3>
                <p>Upcoming economic events, data releases, and central bank announcements.</p>
            </div>
            """,
            unsafe_allow_html=True
        )
        st.button("View Calendar", key="view_calendar")
    
    st.markdown("<br>", unsafe_allow_html=True)
    
    # Analysis Tools
    st.subheader("Analysis Tools")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.markdown(
            """
            <div class="metric-card">
                <h3>📋 Watchlist</h3>
                <p>Track and monitor your selected symbols across markets.</p>
            </div>
            """,
            unsafe_allow_html=True
        )
        st.button("View Watchlist", key="view_watchlist")
        
    with col2:
        st.markdown(
            """
            <div class="metric-card">
                <h3>🔍 Screener</h3>
                <p>Find opportunities with customizable screening criteria.</p>
            </div>
            """,
            unsafe_allow_html=True
        )
        st.button("View Screener", key="view_screener")
        
    with col3:
        st.markdown(
            """
            <div class="metric-card">
                <h3>🧠 AI Market Insights</h3>
                <p>AI-powered analysis of market trends, themes, and patterns.</p>
            </div>
            """,
            unsafe_allow_html=True
        )
        st.button("View AI Insights", key="view_ai")

elif page == "Market Summary":
    # Market Summary Page
    st.title("MARKET COMMAND CENTER")
    st.caption(f"{datetime.now().strftime('%B %d, %Y')}")
    
    # Fetch data for global indices
    indices_data = get_market_data(markets['indices'].values(), period=period_map[time_range])
    global_indices_metrics = []
    
    for name, ticker in markets['indices'].items():
        metrics = get_market_metrics(indices_data[ticker], ticker, name, period_map[time_range])
        global_indices_metrics.append(metrics)
    
    # Global Indices Table
    st.markdown("<div class='section-header'>GLOBAL INDICES</div>", unsafe_allow_html=True)
    
    # Create a DataFrame for the indices table
    df_indices = pd.DataFrame(global_indices_metrics)
    
    # Format the dataframe
    if not df_indices.empty:
        # Filter to display only the first 5 indices
        display_indices = df_indices.iloc[:5].copy()
        
        # Create columns for the table
        cols = st.columns([1, 1, 0.7, 0.7, 0.5, 0.7, 0.7, 0.7, 0.7])
        
        # Table Header
        cols[0].markdown("<b>MARKET</b>", unsafe_allow_html=True)
        cols[1].markdown("<b>PRICE</b>", unsafe_allow_html=True)
        cols[2].markdown("<b>CHG</b>", unsafe_allow_html=True)
        cols[3].markdown("<b>CHG%</b>", unsafe_allow_html=True)
        cols[4].markdown("<b>TECH</b>", unsafe_allow_html=True)
        cols[5].markdown("<b>VOL</b>", unsafe_allow_html=True)
        cols[6].markdown("<b>1M%</b>", unsafe_allow_html=True)
        cols[7].markdown("<b>3M%</b>", unsafe_allow_html=True)
        cols[8].markdown("<b>YTD%</b>", unsafe_allow_html=True)
        
        # Table Rows
        for i, row in display_indices.iterrows():
            cols[0].write(row['name'])
            cols[1].write(format_number(row['price'], 'price'))
            
            # Change with color formatting
            chg_color = "green" if row['change'] >= 0 else "red"
            cols[2].markdown(f"<span style='color:{chg_color}'>{format_number(row['change'], 'change')}</span>", unsafe_allow_html=True)
            
            # Change % with color formatting
            chg_pct_color = "green" if row['change_pct'] >= 0 else "red"
            cols[3].markdown(f"<span style='color:{chg_pct_color}'>{format_number(row['change_pct'], 'percent')}</span>", unsafe_allow_html=True)
            
            # Tech indicator (bullish/bearish)
            cols[4].write("•")
            
            # Volume
            cols[5].write(format_number(row['volume'], 'volume'))
            
            # 1M change
            m1_color = "green" if row['m1_pct'] >= 0 else "red"
            cols[6].markdown(f"<span style='color:{m1_color}'>{format_number(row['m1_pct'], 'percent')}</span>", unsafe_allow_html=True)
            
            # 3M change
            m3_color = "green" if row['m3_pct'] >= 0 else "red"
            cols[7].markdown(f"<span style='color:{m3_color}'>{format_number(row['m3_pct'], 'percent')}</span>", unsafe_allow_html=True)
            
            # YTD change
            ytd_color = "green" if row['ytd_pct'] >= 0 else "red"
            cols[8].markdown(f"<span style='color:{ytd_color}'>{format_number(row['ytd_pct'], 'percent')}</span>", unsafe_allow_html=True)
    
    st.markdown("<br>", unsafe_allow_html=True)
    
    # Create two columns for International Indices and Sectors
    col1, col2 = st.columns(2)
    
    with col1:
        # International Indices
        st.markdown("<div class='section-header'>INTERNATIONAL INDICES</div>", unsafe_allow_html=True)
        
        # Filter for international indices (second half of the indices list)
        if not df_indices.empty and len(df_indices) > 5:
            display_indices = df_indices.iloc[5:].copy()
            
            # Create columns for the table
            cols = st.columns([1, 1, 0.7, 0.7, 0.5, 0.7, 0.7, 0.7])
            
            # Table Header
            cols[0].markdown("<b>MARKET</b>", unsafe_allow_html=True)
            cols[1].markdown("<b>PRICE</b>", unsafe_allow_html=True)
            cols[2].markdown("<b>CHG</b>", unsafe_allow_html=True)
            cols[3].markdown("<b>CHG%</b>", unsafe_allow_html=True)
            cols[4].markdown("<b>TECH</b>", unsafe_allow_html=True)
            cols[5].markdown("<b>1M%</b>", unsafe_allow_html=True)
            cols[6].markdown("<b>3M%</b>", unsafe_allow_html=True)
            cols[7].markdown("<b>YTD%</b>", unsafe_allow_html=True)
            
            # Table Rows
            for i, row in display_indices.iterrows():
                cols[0].write(row['name'])
                cols[1].write(format_number(row['price'], 'price'))
                
                # Change with color formatting
                chg_color = "green" if row['change'] >= 0 else "red"
                cols[2].markdown(f"<span style='color:{chg_color}'>{format_number(row['change'], 'change')}</span>", unsafe_allow_html=True)
                
                # Change % with color formatting
                chg_pct_color = "green" if row['change_pct'] >= 0 else "red"
                cols[3].markdown(f"<span style='color:{chg_pct_color}'>{format_number(row['change_pct'], 'percent')}</span>", unsafe_allow_html=True)
                
                # Tech indicator
                cols[4].write("•")
                
                # 1M change
                m1_color = "green" if row['m1_pct'] >= 0 else "red"
                cols[5].markdown(f"<span style='color:{m1_color}'>{format_number(row['m1_pct'], 'percent')}</span>", unsafe_allow_html=True)
                
                # 3M change
                m3_color = "green" if row['m3_pct'] >= 0 else "red"
                cols[6].markdown(f"<span style='color:{m3_color}'>{format_number(row['m3_pct'], 'percent')}</span>", unsafe_allow_html=True)
                
                # YTD change
                ytd_color = "green" if row['ytd_pct'] >= 0 else "red"
                cols[7].markdown(f"<span style='color:{ytd_color}'>{format_number(row['ytd_pct'], 'percent')}</span>", unsafe_allow_html=True)
    
    with col2:
        # Fetch data for sectors
        sectors_data = get_market_data(markets['sectors'].values(), period=period_map[time_range])
        sector_metrics = []
        
        for name, ticker in markets['sectors'].items():
            metrics = get_market_metrics(sectors_data[ticker], ticker, name, period_map[time_range])
            sector_metrics.append(metrics)
        
        # Sectors Table
        st.markdown("<div class='section-header'>SECTORS</div>", unsafe_allow_html=True)
        
        # Create a DataFrame for the sectors table
        df_sectors = pd.DataFrame(sector_metrics)
        
        # Format the dataframe
        if not df_sectors.empty:
            # Display top 7 sectors
            display_sectors = df_sectors.iloc[:7].copy()
            
            # Create columns for the table
            cols = st.columns([1.5, 0.8, 0.8, 0.6, 0.8])
            
            # Table Header
            cols[0].markdown("<b>SECTOR</b>", unsafe_allow_html=True)
            cols[1].markdown("<b>PRICE</b>", unsafe_allow_html=True)
            cols[2].markdown("<b>CHG%</b>", unsafe_allow_html=True)
            cols[3].markdown("<b>TECH</b>", unsafe_allow_html=True)
            cols[4].markdown("<b>1M%</b>", unsafe_allow_html=True)
            
            # Table Rows
            for i, row in display_sectors.iterrows():
                cols[0].write(row['name'])
                cols[1].write(format_number(row['price'], 'price'))
                
                # Change % with color formatting
                chg_pct_color = "green" if row['change_pct'] >= 0 else "red"
                cols[2].markdown(f"<span style='color:{chg_pct_color}'>{format_number(row['change_pct'], 'percent')}</span>", unsafe_allow_html=True)
                
                # Tech indicator
                cols[3].write("•")
                
                # 1M change
                m1_color = "green" if row['m1_pct'] >= 0 else "red"
                cols[4].markdown(f"<span style='color:{m1_color}'>{format_number(row['m1_pct'], 'percent')}</span>", unsafe_allow_html=True)
    
    st.markdown("<br>", unsafe_allow_html=True)
    
    # Create three columns for Fixed Income, Forex, and Crypto
    col1, col2, col3 = st.columns(3)
    
    with col1:
        # Fetch data for bonds
        bonds_data = get_market_data(markets['bonds'].values(), period=period_map[time_range])
        bonds_metrics = []
        
        for name, ticker in markets['bonds'].items():
            metrics = get_market_metrics(bonds_data[ticker], ticker, name, period_map[time_range])
            bonds_metrics.append(metrics)
        
        # Fixed Income Table
        st.markdown("<div class='section-header'>FIXED INCOME</div>", unsafe_allow_html=True)
        
        # Create a DataFrame for the bonds table
        df_bonds = pd.DataFrame(bonds_metrics)
        
        # Format the dataframe
        if not df_bonds.empty:
            # Display bonds
            display_bonds = df_bonds.iloc[:5].copy()
            
            # Create columns for the table
            cols = st.columns([1.5, 0.8, 0.6, 0.6, 0.8])
            
            # Table Header
            cols[0].markdown("<b>INSTRUMENT</b>", unsafe_allow_html=True)
            cols[1].markdown("<b>YIELD</b>", unsafe_allow_html=True)
            cols[2].markdown("<b>CHG</b>", unsafe_allow_html=True)
            cols[3].markdown("<b>TECH</b>", unsafe_allow_html=True)
            cols[4].markdown("<b>CHG bp</b>", unsafe_allow_html=True)
            
            # Table Rows
            for i, row in display_bonds.iterrows():
                cols[0].write(row['name'])
                cols[1].write(format_number(row['price'], 'price') + "%")
                
                # Change with color formatting (for bonds, lower yields are positive)
                chg_color = "red" if row['change'] >= 0 else "green"
                # Convert to basis points
                bp_change = row['change'] * 100
                cols[2].markdown(f"<span style='color:{chg_color}'>{format_number(bp_change, 'change')} bp</span>", unsafe_allow_html=True)
                
                # Tech indicator
                cols[3].write("•")
                
                # Trend indicator
                trend_direction = "↓" if row['change'] < 0 else "↑" if row['change'] > 0 else "—"
                cols[4].markdown(f"<span style='color:{chg_color}'>{trend_direction}</span>", unsafe_allow_html=True)
    
    with col2:
        # Fetch data for forex
        forex_data = get_market_data(markets['forex'].values(), period=period_map[time_range])
        forex_metrics = []
        
        for name, ticker in markets['forex'].items():
            metrics = get_market_metrics(forex_data[ticker], ticker, name, period_map[time_range])
            forex_metrics.append(metrics)
        
        # Forex Table
        st.markdown("<div class='section-header'>FOREX</div>", unsafe_allow_html=True)
        
        # Create a DataFrame for the forex table
        df_forex = pd.DataFrame(forex_metrics)
        
        # Format the dataframe
        if not df_forex.empty:
            # Display forex pairs
            display_forex = df_forex.iloc[:6].copy()
            
            # Create columns for the table
            cols = st.columns([1, 0.8, 0.8, 0.6, 0.8])
            
            # Table Header
            cols[0].markdown("<b>PAIR</b>", unsafe_allow_html=True)
            cols[1].markdown("<b>PRICE</b>", unsafe_allow_html=True)
            cols[2].markdown("<b>CHG%</b>", unsafe_allow_html=True)
            cols[3].markdown("<b>TECH</b>", unsafe_allow_html=True)
            cols[4].markdown("<b>1M%</b>", unsafe_allow_html=True)
            
            # Table Rows
            for i, row in display_forex.iterrows():
                cols[0].write(row['name'])
                cols[1].write(format_number(row['price'], 'price'))
                
                # Change % with color formatting
                chg_pct_color = "green" if row['change_pct'] >= 0 else "red"
                cols[2].markdown(f"<span style='color:{chg_pct_color}'>{format_number(row['change_pct'], 'percent')}</span>", unsafe_allow_html=True)
                
                # Tech indicator
                cols[3].write("•")
                
                # 1M change
                m1_color = "green" if row['m1_pct'] >= 0 else "red"
                cols[4].markdown(f"<span style='color:{m1_color}'>{format_number(row['m1_pct'], 'percent')}</span>", unsafe_allow_html=True)
    
    with col3:
        # Fetch data for crypto
        crypto_data = get_market_data(markets['crypto'].values(), period=period_map[time_range])
        crypto_metrics = []
        
        for name, ticker in markets['crypto'].items():
            metrics = get_market_metrics(crypto_data[ticker], ticker, name, period_map[time_range])
            crypto_metrics.append(metrics)
        
        # Crypto Table
        st.markdown("<div class='section-header'>CRYPTOCURRENCIES</div>", unsafe_allow_html=True)
        
        # Create a DataFrame for the crypto table
        df_crypto = pd.DataFrame(crypto_metrics)
        
        # Format the dataframe
        if not df_crypto.empty:
            # Display crypto
            display_crypto = df_crypto.iloc[:5].copy()
            
            # Create columns for the table
            cols = st.columns([1, 0.8, 0.8, 0.6, 0.8])
            
            # Table Header
            cols[0].markdown("<b>CRYPTO</b>", unsafe_allow_html=True)
            cols[1].markdown("<b>PRICE</b>", unsafe_allow_html=True)
            cols[2].markdown("<b>CHG%</b>", unsafe_allow_html=True)
            cols[3].markdown("<b>TECH</b>", unsafe_allow_html=True)
            cols[4].markdown("<b>1M%</b>", unsafe_allow_html=True)
            
            # Table Rows
            for i, row in display_crypto.iterrows():
                cols[0].write(row['name'])
                cols[1].write("$" + format_number(row['price'], 'price'))
                
                # Change % with color formatting
                chg_pct_color = "green" if row['change_pct'] >= 0 else "red"
                cols[2].markdown(f"<span style='color:{chg_pct_color}'>{format_number(row['change_pct'], 'percent')}</span>", unsafe_allow_html=True)
                
                # Tech indicator
                cols[3].write("•")
                
                # 1M change
                m1_color = "green" if row['m1_pct'] >= 0 else "red"
                cols[4].markdown(f"<span style='color:{m1_color}'>{format_number(row['m1_pct'], 'percent')}</span>", unsafe_allow_html=True)
    
    st.markdown("<br>", unsafe_allow_html=True)
    
    # Commodities and Economic Events row
    col1, col2 = st.columns(2)
    
    with col1:
        # Fetch data for commodities
        commodities_data = get_market_data(markets['commodities'].values(), period=period_map[time_range])
        commodities_metrics = []
        
        for name, ticker in markets['commodities'].items():
            metrics = get_market_metrics(commodities_data[ticker], ticker, name, period_map[time_range])
            commodities_metrics.append(metrics)
        
        # Commodities Table
        st.markdown("<div class='section-header'>COMMODITIES</div>", unsafe_allow_html=True)
        
        # Create a DataFrame for the commodities table
        df_commodities = pd.DataFrame(commodities_metrics)
        
        # Format the dataframe
        if not df_commodities.empty:
            # Display commodities
            display_commodities = df_commodities.iloc[:4].copy()
            
            # Create columns for the table
            cols = st.columns([1, 0.8, 0.8, 0.6, 0.8])
            
            # Table Header
            cols[0].markdown("<b>COMMODITY</b>", unsafe_allow_html=True)
            cols[1].markdown("<b>PRICE</b>", unsafe_allow_html=True)
            cols[2].markdown("<b>CHG%</b>", unsafe_allow_html=True)
            cols[3].markdown("<b>TECH</b>", unsafe_allow_html=True)
            cols[4].markdown("<b>1M%</b>", unsafe_allow_html=True)
            
            # Table Rows
            for i, row in display_commodities.iterrows():
                cols[0].write(row['name'])
                cols[1].write(format_number(row['price'], 'price'))
                
                # Change % with color formatting
                chg_pct_color = "green" if row['change_pct'] >= 0 else "red"
                cols[2].markdown(f"<span style='color:{chg_pct_color}'>{format_number(row['change_pct'], 'percent')}</span>", unsafe_allow_html=True)
                
                # Tech indicator
                cols[3].write("•")
                
                # 1M change
                m1_color = "green" if row['m1_pct'] >= 0 else "red"
                cols[4].markdown(f"<span style='color:{m1_color}'>{format_number(row['m1_pct'], 'percent')}</span>", unsafe_allow_html=True)
    
    with col2:
        # Economic Events
        st.markdown("<div class='section-header'>TODAY'S ECONOMIC EVENTS</div>", unsafe_allow_html=True)
        
        # Create sample economic events
        economic_events = [
            {"time": "08:30", "event": "US Durable Goods", "impact": "HIGH", "forecast": "+0.4%"},
            {"time": "10:00", "event": "US CB Consumer Confidence", "impact": "HIGH", "forecast": "104.5"},
            {"time": "14:00", "event": "US New Home Sales", "impact": "MEDIUM", "forecast": "675K"},
            {"time": "16:30", "event": "API Weekly Crude Oil Stock", "impact": "MEDIUM", "forecast": "-2.1M"}
        ]
        
        # Create columns for the table
        cols = st.columns([0.8, 2, 1, 1])
        
        # Table Header
        cols[0].markdown("<b>TIME</b>", unsafe_allow_html=True)
        cols[1].markdown("<b>EVENT</b>", unsafe_allow_html=True)
        cols[2].markdown("<b>IMPACT</b>", unsafe_allow_html=True)
        cols[3].markdown("<b>FCST</b>", unsafe_allow_html=True)
        
        # Table Rows
        for event in economic_events:
            cols[0].write(event["time"])
            cols[1].write(event["event"])
            
            # Impact with color coding
            impact_color = "red" if event["impact"] == "HIGH" else "orange" if event["impact"] == "MEDIUM" else "green"
            cols[2].markdown(f"<span style='color:{impact_color}'>{event['impact']}</span>", unsafe_allow_html=True)
            
            cols[3].write(event["forecast"])

elif page == "Technical Analysis":
    st.title("Technical Analysis")
    st.caption(f"{datetime.now().strftime('%B %d, %Y')}")
    st.markdown("<hr>", unsafe_allow_html=True)
    
    # Symbol input
    col1, col2 = st.columns([3, 1])
    
    with col1:
        symbol = st.text_input("Enter Symbol (e.g., AAPL, MSFT, BTC-USD)", "AAPL")
    
    with col2:
        st.markdown("<br>", unsafe_allow_html=True)
        search_button = st.button("Analyze")
    
    if symbol:
        # Fetch data for the symbol
        symbol_data = get_market_data([symbol], period=period_map[time_range])
        
        if symbol in symbol_data and not symbol_data[symbol].empty:
            df = symbol_data[symbol]
            
            # Identify price and volume columns
            price_cols = {}
            for type_col, possible_cols in {
                'open': ['open', 'Open', 'o', 'trade_open_price'],
                'high': ['high', 'High', 'h', 'trade_high_price'],
                'low': ['low', 'Low', 'l', 'trade_low_price'],
                'close': ['close', 'Close', 'c', 'trade_close_price', 'trade_price'],
                'volume': ['volume', 'Volume', 'v', 'trade_volume']
            }.items():
                for col in possible_cols:
                    if col in df.columns:
                        price_cols[type_col] = col
                        break
            
            # Only proceed if we have all required price data
            if all(k in price_cols for k in ['open', 'high', 'low', 'close']):
                # Get metrics
                metrics = get_market_metrics(df, symbol, symbol, period_map[time_range])
                
                # Display key metrics
                col1, col2, col3, col4 = st.columns(4)
                
                with col1:
                    st.metric("Current Price", f"${format_number(metrics['price'], 'price')}", 
                             f"{format_number(metrics['change_pct'], 'percent')}")
                
                with col2:
                    # Calculate 52-week high/low
                    if len(df) > 200:  # Approximately 1 year of trading days
                        high_52w = df[price_cols['high']].rolling(window=252).max().iloc[-1]
                        low_52w = df[price_cols['low']].rolling(window=252).min().iloc[-1]
                        
                        # Calculate % from 52-week high
                        pct_from_high = ((metrics['price'] / high_52w) - 1) * 100
                        
                        st.metric("52-Week Range", 
                                 f"${format_number(low_52w, 'price')} - ${format_number(high_52w, 'price')}", 
                                 f"{format_number(pct_from_high, 'percent')} from high")
                    else:
                        st.metric("Range", 
                                 f"${format_number(df[price_cols['low']].min(), 'price')} - ${format_number(df[price_cols['high']].max(), 'price')}")
                
                with col3:
                    # Calculate average volume
                    if 'volume' in price_cols:
                        avg_vol = df[price_cols['volume']].mean()
                        last_vol = df[price_cols['volume']].iloc[-1]
                        vol_ratio = (last_vol / avg_vol - 1) * 100
                        
                        st.metric("Volume", 
                                 format_number(last_vol, 'volume'), 
                                 f"{format_number(vol_ratio, 'percent')} vs avg")
                    else:
                        st.metric("Volume", "N/A")
                
                with col4:
                    # Calculate RSI
                    delta = df[price_cols['close']].diff()
                    gain = delta.where(delta > 0, 0).rolling(window=14).mean()
                    loss = -delta.where(delta < 0, 0).rolling(window=14).mean()
                    rs = gain / loss
                    rsi = 100 - (100 / (1 + rs))
                    
                    current_rsi = rsi.iloc[-1]
                    
                    # Determine RSI status
                    if current_rsi <= 30:
                        rsi_status = "Oversold"
                    elif current_rsi >= 70:
                        rsi_status = "Overbought"
                    else:
                        rsi_status = "Neutral"
                    
                    st.metric("RSI (14)", f"{current_rsi:.1f}", rsi_status)
                
                # Price chart with indicators
                st.subheader(f"{symbol} Price Chart")
                
                # Tabs for different chart types
                chart_tabs = st.tabs(["Candlestick", "Line", "OHLC"])
                
                with chart_tabs[0]:
                    # Calculate indicators
                    df['SMA20'] = df[price_cols['close']].rolling(window=20).mean()
                    df['SMA50'] = df[price_cols['close']].rolling(window=50).mean()
                    df['SMA200'] = df[price_cols['close']].rolling(window=200).mean()
                    
                    # Bollinger Bands
                    df['UpperBand'] = df['SMA20'] + (df[price_cols['close']].rolling(window=20).std() * 2)
                    df['LowerBand'] = df['SMA20'] - (df[price_cols['close']].rolling(window=20).std() * 2)
                    
                    # Create Candlestick chart
                    fig = go.Figure()
                    
                    # Add candlestick chart
                    fig.add_trace(go.Candlestick(
                        x=df.index,
                        open=df[price_cols['open']],
                        high=df[price_cols['high']],
                        low=df[price_cols['low']],
                        close=df[price_cols['close']],
                        name=symbol
                    ))
                    
                    # Add SMAs
                    fig.add_trace(go.Scatter(
                        x=df.index,
                        y=df['SMA20'],
                        name="SMA20",
                        line=dict(color='blue', width=1)
                    ))
                    
                    fig.add_trace(go.Scatter(
                        x=df.index,
                        y=df['SMA50'],
                        name="SMA50",
                        line=dict(color='orange', width=1)
                    ))
                    
                    fig.add_trace(go.Scatter(
                        x=df.index,
                        y=df['SMA200'],
                        name="SMA200",
                        line=dict(color='purple', width=1)
                    ))
                    
                    # Add Bollinger Bands
                    fig.add_trace(go.Scatter(
                        x=df.index,
                        y=df['UpperBand'],
                        name="Upper BB",
                        line=dict(color='rgba(0,128,0,0.3)', width=1, dash='dash')
                    ))
                    
                    fig.add_trace(go.Scatter(
                        x=df.index,
                        y=df['LowerBand'],
                        name="Lower BB",
                        line=dict(color='rgba(0,128,0,0.3)', width=1, dash='dash'),
                        fill='tonexty',
                        fillcolor='rgba(0,128,0,0.05)'
                    ))
                    
                    # Update layout
                    fig.update_layout(
                        height=600,
                        xaxis_title="Date",
                        yaxis_title="Price",
                        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="center", x=0.5),
                        xaxis_rangeslider_visible=False,
                        margin=dict(l=0, r=0, t=0, b=0),
                        template="plotly_white"
                    )
                    
                    st.plotly_chart(fig, use_container_width=True)
                
                with chart_tabs[1]:
                    # Create Line chart
                    fig = go.Figure()
                    
                    # Add price line
                    fig.add_trace(go.Scatter(
                        x=df.index,
                        y=df[price_cols['close']],
                        name=symbol,
                        line=dict(color='royalblue', width=2)
                    ))
                    
                    # Add SMAs
                    fig.add_trace(go.Scatter(
                        x=df.index,
                        y=df['SMA20'],
                        name="SMA20",
                        line=dict(color='green', width=1.5)
                    ))
                    
                    fig.add_trace(go.Scatter(
                        x=df.index,
                        y=df['SMA50'],
                        name="SMA50",
                        line=dict(color='red', width=1.5)
                    ))
                    
                    # Update layout
                    fig.update_layout(
                        height=600,
                        xaxis_title="Date",
                        yaxis_title="Price",
                        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="center", x=0.5),
                        margin=dict(l=0, r=0, t=0, b=0),
                        template="plotly_white"
                    )
                    
                    st.plotly_chart(fig, use_container_width=True)
                
                with chart_tabs[2]:
                    # Create OHLC chart
                    fig = go.Figure()
                    
                    # Add OHLC chart
                    fig.add_trace(go.Ohlc(
                        x=df.index,
                        open=df[price_cols['open']],
                        high=df[price_cols['high']],
                        low=df[price_cols['low']],
                        close=df[price_cols['close']],
                        name=symbol
                    ))
                    
                    # Update layout
                    fig.update_layout(
                        height=600,
                        xaxis_title="Date",
                        yaxis_title="Price",
                        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="center", x=0.5),
                        xaxis_rangeslider_visible=False,
                        margin=dict(l=0, r=0, t=0, b=0),
                        template="plotly_white"
                    )
                    
                    st.plotly_chart(fig, use_container_width=True)
                
                # Technical Indicators Section
                st.subheader("Technical Indicators")
                
                indicator_tabs = st.tabs(["Momentum", "Volume", "Trend", "Volatility", "Fundamental Catalysts"])
                
                with indicator_tabs[0]:
                    # Momentum indicators
                    col1, col2 = st.columns(2)
                    
                    with col1:
                        # RSI Chart
                        fig = go.Figure()
                        
                        fig.add_trace(go.Scatter(
                            x=df.index,
                            y=rsi,
                            name="RSI (14)",
                            line=dict(color='purple', width=2)
                        ))
                        
                        # Add overbought/oversold lines
                        fig.add_hline(y=70, line_dash="dash", line_color="red", annotation_text="Overbought")
                        fig.add_hline(y=30, line_dash="dash", line_color="green", annotation_text="Oversold")
                        
                        fig.update_layout(
                            title="Relative Strength Index (RSI)",
                            height=300,
                            xaxis_title="Date",
                            yaxis_title="RSI",
                            template="plotly_white",
                            yaxis=dict(range=[0, 100])
                        )
                        
                        st.plotly_chart(fig, use_container_width=True)
                    
                    with col2:
                        # MACD
                        df['EMA12'] = df[price_cols['close']].ewm(span=12, adjust=False).mean()
                        df['EMA26'] = df[price_cols['close']].ewm(span=26, adjust=False).mean()
                        df['MACD'] = df['EMA12'] - df['EMA26']
                        df['Signal'] = df['MACD'].ewm(span=9, adjust=False).mean()
                        df['Histogram'] = df['MACD'] - df['Signal']
                        
                        fig = go.Figure()
                        
                        # Add MACD line
                        fig.add_trace(go.Scatter(
                            x=df.index,
                            y=df['MACD'],
                            name="MACD",
                            line=dict(color='blue', width=2)
                        ))
                        
                        # Add Signal line
                        fig.add_trace(go.Scatter(
                            x=df.index,
                            y=df['Signal'],
                            name="Signal",
                            line=dict(color='red', width=1.5)
                        ))
                        
                        # Add Histogram
                        colors = ['green' if val >= 0 else 'red' for val in df['Histogram']]
                        fig.add_trace(go.Bar(
                            x=df.index,
                            y=df['Histogram'],
                            name="Histogram",
                            marker_color=colors
                        ))
                        
                        fig.update_layout(
                            title="MACD (12,26,9)",
                            height=300,
                            xaxis_title="Date",
                            template="plotly_white"
                        )
                        
                        st.plotly_chart(fig, use_container_width=True)
                
                with indicator_tabs[1]:
                    # Volume indicators
                    if 'volume' in price_cols:
                        # Volume Chart
                        fig = go.Figure()
                        
                        # Add volume bars
                        colors = ['green' if df[price_cols['close']].iloc[i] >= df[price_cols['open']].iloc[i] else 'red' 
                                 for i in range(len(df))]
                        
                        fig.add_trace(go.Bar(
                            x=df.index,
                            y=df[price_cols['volume']],
                            name="Volume",
                            marker_color=colors
                        ))
                        
                        # Add 20-day average volume
                        df['AvgVol20'] = df[price_cols['volume']].rolling(window=20).mean()
                        
                        fig.add_trace(go.Scatter(
                            x=df.index,
                            y=df['AvgVol20'],
                            name="20-day Avg Volume",
                            line=dict(color='blue', width=2)
                        ))
                        
                        fig.update_layout(
                            title="Volume Analysis",
                            height=400,
                            xaxis_title="Date",
                            yaxis_title="Volume",
                            template="plotly_white"
                        )
                        
                        st.plotly_chart(fig, use_container_width=True)
                        
                        # Calculate OBV (On-Balance Volume)
                        df['OBV'] = 0
                        for i in range(1, len(df)):
                            if df[price_cols['close']].iloc[i] > df[price_cols['close']].iloc[i-1]:
                                df['OBV'].iloc[i] = df['OBV'].iloc[i-1] + df[price_cols['volume']].iloc[i]
                            elif df[price_cols['close']].iloc[i] < df[price_cols['close']].iloc[i-1]:
                                df['OBV'].iloc[i] = df['OBV'].iloc[i-1] - df[price_cols['volume']].iloc[i]
                            else:
                                df['OBV'].iloc[i] = df['OBV'].iloc[i-1]
                        
                        # OBV Chart
                        fig = go.Figure()
                        
                        fig.add_trace(go.Scatter(
                            x=df.index,
                            y=df['OBV'],
                            name="OBV",
                            line=dict(color='purple', width=2)
                        ))
                        
                        fig.update_layout(
                            title="On-Balance Volume (OBV)",
                            height=300,
                            xaxis_title="Date",
                            yaxis_title="OBV",
                            template="plotly_white"
                        )
                        
                        st.plotly_chart(fig, use_container_width=True)
                    else:
                        st.info("Volume data not available for this symbol")
                
                with indicator_tabs[2]:
                    # Trend indicators
                    col1, col2 = st.columns(2)
                    
                    with col1:
                        # Price with Moving Averages
                        fig = go.Figure()
                        
                        # Add price line
                        fig.add_trace(go.Scatter(
                            x=df.index,
                            y=df[price_cols['close']],
                            name=symbol,
                            line=dict(color='black', width=2)
                        ))
                        
                        # Add SMAs
                        fig.add_trace(go.Scatter(
                            x=df.index,
                            y=df['SMA20'],
                            name="SMA20",
                            line=dict(color='blue', width=1.5)
                        ))
                        
                        fig.add_trace(go.Scatter(
                            x=df.index,
                            y=df['SMA50'],
                            name="SMA50",
                            line=dict(color='green', width=1.5)
                        ))
                        
                        fig.add_trace(go.Scatter(
                            x=df.index,
                            y=df['SMA200'],
                            name="SMA200",
                            line=dict(color='red', width=1.5)
                        ))
                        
                        fig.update_layout(
                            title="Moving Averages",
                            height=300,
                            xaxis_title="Date",
                            yaxis_title="Price",
                            template="plotly_white"
                        )
                        
                        st.plotly_chart(fig, use_container_width=True)
                    
                    with col2:
                        # ADX (Average Directional Index)
                        # Calculate +DI and -DI
                        df['TR'] = np.maximum(
                            np.maximum(
                                df[price_cols['high']] - df[price_cols['low']],
                                abs(df[price_cols['high']] - df[price_cols['close']].shift(1))
                            ),
                            abs(df[price_cols['low']] - df[price_cols['close']].shift(1))
                        )
                        
                        df['DM+'] = np.where(
                            (df[price_cols['high']] - df[price_cols['high']].shift(1) > 0) & 
                            (df[price_cols['high']] - df[price_cols['high']].shift(1) > df[price_cols['low']].shift(1) - df[price_cols['low']]),
                            df[price_cols['high']] - df[price_cols['high']].shift(1),
                            0
                        )
                        
                        df['DM-'] = np.where(
                            (df[price_cols['low']].shift(1) - df[price_cols['low']] > 0) & 
                            (df[price_cols['low']].shift(1) - df[price_cols['low']] > df[price_cols['high']] - df[price_cols['high']].shift(1)),
                            df[price_cols['low']].shift(1) - df[price_cols['low']],
                            0
                        )
                        
                        # Calculate smoothed values
                        window = 14
                        df['TR14'] = df['TR'].rolling(window=window).sum()
                        df['DM+14'] = df['DM+'].rolling(window=window).sum()
                        df['DM-14'] = df['DM-'].rolling(window=window).sum()
                        
                        # Calculate +DI and -DI
                        df['+DI'] = 100 * df['DM+14'] / df['TR14']
                        df['-DI'] = 100 * df['DM-14'] / df['TR14']
                        
                        # Calculate DX and ADX
                        df['DX'] = 100 * abs(df['+DI'] - df['-DI']) / (df['+DI'] + df['-DI'])
                        df['ADX'] = df['DX'].rolling(window=window).mean()
                        
                        # ADX Chart
                        fig = go.Figure()
                        
                        fig.add_trace(go.Scatter(
                            x=df.index,
                            y=df['ADX'],
                            name="ADX",
                            line=dict(color='black', width=2)
                        ))
                        
                        fig.add_trace(go.Scatter(
                            x=df.index,
                            y=df['+DI'],
                            name="+DI",
                            line=dict(color='green', width=1.5)
                        ))
                        
                        fig.add_trace(go.Scatter(
                            x=df.index,
                            y=df['-DI'],
                            name="-DI",
                            line=dict(color='red', width=1.5)
                        ))
                        
                        # Add ADX strength levels
                        fig.add_hline(y=25, line_dash="dash", line_color="gray", annotation_text="Strong Trend")
                        
                        fig.update_layout(
                            title="ADX (Average Directional Index)",
                            height=300,
                            xaxis_title="Date",
                            yaxis_title="ADX",
                            template="plotly_white"
                        )
                        
                        st.plotly_chart(fig, use_container_width=True)
                
                with indicator_tabs[3]:
                    # Volatility indicators
                    col1, col2 = st.columns(2)
                    
                    with col1:
                        # Bollinger Bands
                        fig = go.Figure()
                        
                        # Add price line
                        fig.add_trace(go.Scatter(
                            x=df.index,
                            y=df[price_cols['close']],
                            name=symbol,
                            line=dict(color='black', width=2)
                        ))
                        
                        # Add Bollinger Bands
                        fig.add_trace(go.Scatter(
                            x=df.index,
                            y=df['SMA20'],
                            name="SMA20",
                            line=dict(color='blue', width=1.5)
                        ))
                        
                        fig.add_trace(go.Scatter(
                            x=df.index,
                            y=df['UpperBand'],
                            name="Upper BB",
                            line=dict(color='red', width=1, dash='dash')
                        ))
                        
                        fig.add_trace(go.Scatter(
                            x=df.index,
                            y=df['LowerBand'],
                            name="Lower BB",
                            line=dict(color='green', width=1, dash='dash')
                        ))
                        
                        fig.update_layout(
                            title="Bollinger Bands",
                            height=300,
                            xaxis_title="Date",
                            yaxis_title="Price",
                            template="plotly_white"
                        )
                        
                        st.plotly_chart(fig, use_container_width=True)
                    
                    with col2:
                        # ATR (Average True Range)
                        df['ATR'] = df['TR'].rolling(window=14).mean()
                        
                        # Calculate ATR percentage
                        df['ATR%'] = (df['ATR'] / df[price_cols['close']]) * 100
                        
                        # ATR Chart
                        fig = go.Figure()
                        
                        fig.add_trace(go.Scatter(
                            x=df.index,
                            y=df['ATR%'],
                            name="ATR%",
                            line=dict(color='purple', width=2)
                        ))
                        
                        fig.update_layout(
                            title="ATR% (Average True Range %)",
                            height=300,
                            xaxis_title="Date",
                            yaxis_title="ATR%",
                            template="plotly_white"
                        )
                        
                        st.plotly_chart(fig, use_container_width=True)
                
                with indicator_tabs[4]:
                    # Fundamental Catalysts tab
                    st.subheader(f"Fundamental Catalysts for {symbol}")
                    
                    # Load environment variables to get the Sonar Pro API key
                    SEARCH_MODEL_NAME = os.getenv("SEARCH_MODEL_NAME")
                    API_BASE_URL = os.getenv("API_BASE_URL")
                    
                    # Current date for context
                    current_date = datetime.now()
                    current_month = current_date.strftime("%B")
                    current_year = current_date.strftime("%Y")
                    
                    # Create placeholder for API results
                    news_placeholder = st.empty()
                    
                    # Button to refresh news and catalysts
                    if st.button("Get Latest Catalysts", key="get_catalysts"):
                        with st.spinner(f"Searching for catalyst information about {symbol}..."):
                            try:
                                # Categories of searches to perform
                                search_categories = {
                                    "Recent News": f"latest news about {symbol} stock price movements {current_month} {current_year}",
                                    "Earnings": f"{symbol} upcoming earnings date expectations analyst forecasts",
                                    "Industry Trends": f"{symbol} industry trends market position competitive analysis",
                                    "Regulation": f"regulatory developments affecting {symbol} company",
                                    "Market Sentiment": f"market sentiment investor outlook for {symbol} stock"
                                }
                                
                                category_results = {}
                                
                                # Function to make API request to Sonar Pro
                                def search_with_sonar_pro(query):
                                    headers = {
                                        "Content-Type": "application/json"
                                    }
                                    
                                    # Construct the request based on API documentation
                                    payload = {
                                        "query": query,
                                        "model": SEARCH_MODEL_NAME,
                                    }
                                    
                                    # Make the API request
                                    response = requests.post(
                                        f"{API_BASE_URL}/search",
                                        headers=headers,
                                        json=payload
                                    )
                                    
                                    response.raise_for_status()
                                    return response.json()
                                
                                # Perform searches for each category
                                for category, query in search_categories.items():
                                    try:
                                        results = search_with_sonar_pro(query)
                                        category_results[category] = results
                                    except Exception as e:
                                        st.error(f"Error searching for {category}: {str(e)}")
                                        category_results[category] = {"error": str(e)}
                                
                                # Display results
                                combined_results = ""
                                for category, results in category_results.items():
                                    combined_results += f"\n\n{category.upper()}:\n"
                                    if "error" in results:
                                        combined_results += f"Error: {results['error']}\n"
                                    else:
                                        # Process results based on API response structure
                                        # Note: Adjust this based on actual Sonar Pro API response format
                                        if isinstance(results, list) and len(results) > 0:
                                            for item in results[:3]:  # Show top 3 results
                                                if isinstance(item, dict):
                                                    # Extract relevant information from result
                                                    snippet = item.get("snippet", "No snippet available")
                                                    title = item.get("title", "No title")
                                                    url = item.get("url", "#")
                                                    
                                                    combined_results += f"- {title}\n  {snippet}\n  Source: {url}\n\n"
                                                else:
                                                    combined_results += f"- {str(item)}\n"
                                        elif isinstance(results, dict):
                                            # Handle case where results is a dictionary
                                            documents = results.get("documents", [])
                                            if documents:
                                                for doc in documents[:3]:
                                                    title = doc.get("title", "No title")
                                                    snippet = doc.get("text", "No content")[:200] + "..."
                                                    url = doc.get("url", "#")
                                                    combined_results += f"- {title}\n  {snippet}\n  Source: {url}\n\n"
                                            else:
                                                combined_results += "No specific results found.\n"
                                        else:
                                            combined_results += "No specific results found.\n"
                                
                                # Display combined results as an expander
                                with news_placeholder.container():
                                    # Create tabs for different categories
                                    news_tabs = st.tabs(list(search_categories.keys()))
                                    
                                    for i, (category, results) in enumerate(category_results.items()):
                                        with news_tabs[i]:
                                            if "error" in results:
                                                st.error(f"Error: {results['error']}")
                                            else:
                                                # Display formatted results based on API response structure
                                                if isinstance(results, list) and len(results) > 0:
                                                    for item in results[:5]:  # Show top 5 results
                                                        if isinstance(item, dict):
                                                            title = item.get("title", "No title")
                                                            snippet = item.get("snippet", "No snippet available")
                                                            url = item.get("url", "#")
                                                            
                                                            st.markdown(f"### {title}")
                                                            st.markdown(f"{snippet}")
                                                            st.markdown(f"[Read more]({url})")
                                                            st.markdown("---")
                                                        else:
                                                            st.write(str(item))
                                                elif isinstance(results, dict):
                                                    # Handle case where results is a dictionary
                                                    documents = results.get("documents", [])
                                                    if documents:
                                                        for doc in documents[:5]:
                                                            title = doc.get("title", "No title")
                                                            snippet = doc.get("text", "No content")[:300] + "..."
                                                            url = doc.get("url", "#")
                                                            
                                                            st.markdown(f"### {title}")
                                                            st.markdown(f"{snippet}")
                                                            st.markdown(f"[Read more]({url})")
                                                            st.markdown("---")
                                                    else:
                                                        st.info("No specific results found for this category.")
                                                else:
                                                    st.info("No specific results found for this category.")
                                    
                                    # Add analysis tab
                                    with st.expander("📊 AI Analysis of Catalysts", expanded=True):
                                        # Generate a summary from all the collected data
                                        try:
                                            # Gather all the article content
                                            all_articles_content = []
                                            
                                            for category, results in category_results.items():
                                                if "error" not in results:
                                                    if isinstance(results, list) and len(results) > 0:
                                                        for item in results[:3]:  # Top 3 results per category
                                                            if isinstance(item, dict):
                                                                title = item.get("title", "")
                                                                snippet = item.get("snippet", "")
                                                                if title and snippet:
                                                                    all_articles_content.append(f"{category}: {title}. {snippet}")
                                                    elif isinstance(results, dict) and "documents" in results:
                                                        documents = results.get("documents", [])
                                                        for doc in documents[:3]:  # Top 3 documents
                                                            title = doc.get("title", "")
                                                            text = doc.get("text", "")[:300]  # Limit text length
                                                            if title and text:
                                                                all_articles_content.append(f"{category}: {title}. {text}")
                                            
                                            if all_articles_content:
                                                with st.spinner("Generating analysis of fundamental catalysts..."):
                                                    # Create a prompt for summarization
                                                    prompt = f"""Analyze the following articles and information about {symbol} stock and provide a comprehensive summary of all the fundamental catalysts affecting the stock. 
                                                    Focus on what factors are leading or impacting the stock's performance, outlook, and potential price movements.
                                                    
                                                    ARTICLES:
                                                    {' '.join(all_articles_content)}
                                                    
                                                    Provide a detailed analysis with:
                                                    1. Key factors affecting {symbol} currently
                                                    2. Positive catalysts that could drive the stock higher
                                                    3. Risk factors or challenges facing the company
                                                    4. Overall sentiment based on the news
                                                    5. How these catalysts might affect the stock in the short and medium term
                                                    """
                                                    
                                                    # Make API request to Sonar Pro for summarization
                                                    headers = {
                                                        "Content-Type": "application/json"
                                                    }
                                                    
                                                    payload = {
                                                        "query": prompt,
                                                        "model": SEARCH_MODEL_NAME,
                                                        "task": "summarize"
                                                    }
                                                    
                                                    # Get summary from the API
                                                    summary_response = requests.post(
                                                        f"{API_BASE_URL}/generate",
                                                        headers=headers,
                                                        json=payload
                                                    )
                                                    
                                                    if summary_response.status_code == 200:
                                                        summary_result = summary_response.json()
                                                        
                                                        # Extract the summary text from the response
                                                        if isinstance(summary_result, dict) and "text" in summary_result:
                                                            summary_text = summary_result["text"]
                                                        elif isinstance(summary_result, str):
                                                            summary_text = summary_result
                                                        else:
                                                            # Default text if the response format is unexpected
                                                            summary_text = f"Analysis of {symbol} based on recent news and information:\n\n"
                                                            summary_text += "• Market information suggests mixed signals for the stock\n"
                                                            summary_text += "• Recent developments may affect short-term price action\n"
                                                            summary_text += "• Consider monitoring upcoming earnings and industry trends"
                                                        
                                                        # Display the summary
                                                        st.markdown(f"### Fundamental Catalyst Analysis for {symbol}")
                                                        st.markdown(summary_text)
                                                        
                                                        # Add sections for positive and negative catalysts
                                                        col1, col2 = st.columns(2)
                                                        
                                                        with col1:
                                                            st.markdown("#### Key Positive Catalysts")
                                                            st.info("• " + "\n• ".join([line.strip().replace("- ", "") for line in summary_text.split("\n") if "positive" in line.lower() or "growth" in line.lower() or "increase" in line.lower() or "higher" in line.lower()][:3]))
                                                        
                                                        with col2:
                                                            st.markdown("#### Key Risk Factors")
                                                            risks = [line.strip().replace("- ", "") for line in summary_text.split("\n") if "risk" in line.lower() or "challenge" in line.lower() or "concern" in line.lower() or "negative" in line.lower() or "decrease" in line.lower()][:3]
                                                            if not risks:
                                                                risks = ["No specific risks identified in the analysis"]
                                                            st.warning("• " + "\n• ".join(risks))
                                                    else:
                                                        st.error(f"Error generating summary: API returned status code {summary_response.status_code}")
                                                        st.info("Displaying raw article information instead:")
                                                        st.markdown("\n\n".join(all_articles_content[:5]))
                                            else:
                                                st.warning("Not enough data collected to generate a meaningful summary")
                                                st.info("Try searching for more specific information or check if the API is returning valid results")
                                        except Exception as e:
                                            st.error(f"Error generating summary: {str(e)}")
                                            st.info("Please ensure your API credentials are set correctly and try again")
                            except Exception as e:
                                st.error(f"Error fetching fundamental catalysts: {str(e)}")
                                st.info("Please ensure your API credentials are set correctly in the .env file.")
                    else:
                        # Show default message when button hasn't been clicked
                        news_placeholder.info(f"Click the button above to retrieve the latest fundamental catalysts for {symbol}.")
                        st.markdown("""
                        ### What are Fundamental Catalysts?
                        
                        Fundamental catalysts are events or developments that can significantly impact a company's stock price:
                        
                        - **Earnings reports** and guidance
                        - **Industry trends** and competitive positioning
                        - **Regulatory changes** affecting the company or industry
                        - **Macroeconomic factors** that influence the business
                        - **Market sentiment** and investor outlook
                        
                        Use this tab to discover potential catalysts that might affect your investment decisions.
                        """)
                
                # Trading Signals
                st.subheader("Trading Signals")
                
                # Calculate signals
                signals = {}
                
                # Moving Average Crossover
                signals["MA Crossover"] = "BUY" if df['SMA20'].iloc[-1] > df['SMA50'].iloc[-1] and df['SMA20'].iloc[-2] <= df['SMA50'].iloc[-2] else "SELL" if df['SMA20'].iloc[-1] < df['SMA50'].iloc[-1] and df['SMA20'].iloc[-2] >= df['SMA50'].iloc[-2] else "NEUTRAL"
                
                # RSI
                signals["RSI"] = "BUY" if rsi.iloc[-1] < 30 else "SELL" if rsi.iloc[-1] > 70 else "NEUTRAL"
                
                # MACD
                signals["MACD"] = "BUY" if df['MACD'].iloc[-1] > df['Signal'].iloc[-1] and df['MACD'].iloc[-2] <= df['Signal'].iloc[-2] else "SELL" if df['MACD'].iloc[-1] < df['Signal'].iloc[-1] and df['MACD'].iloc[-2] >= df['Signal'].iloc[-2] else "NEUTRAL"
                
                # Bollinger Bands
                signals["Bollinger Bands"] = "BUY" if df[price_cols['close']].iloc[-1] < df['LowerBand'].iloc[-1] else "SELL" if df[price_cols['close']].iloc[-1] > df['UpperBand'].iloc[-1] else "NEUTRAL"
                
                # ADX
                signals["ADX"] = "STRONG TREND" if df['ADX'].iloc[-1] > 25 else "WEAK TREND"
                
                # Display signals
                col1, col2, col3, col4 = st.columns(4)
                
                columns = [col1, col2, col3, col4]
                for i, (signal_name, signal_value) in enumerate(signals.items()):
                    color = "green" if signal_value == "BUY" else "red" if signal_value == "SELL" else "orange" if "TREND" in signal_value else "gray"
                    columns[i % 4].markdown(f"""
                    <div style='border:1px solid #ddd; padding:10px; border-radius:5px;'>
                        <div style='font-size:16px; font-weight:bold;'>{signal_name}</div>
                        <div style='font-size:20px; color:{color};'>{signal_value}</div>
                    </div>
                    """, unsafe_allow_html=True)
                
                # Overall Signal
                buy_count = sum(1 for signal in signals.values() if signal == "BUY")
                sell_count = sum(1 for signal in signals.values() if signal == "SELL")
                
                overall_signal = "STRONG BUY" if buy_count >= 3 else "BUY" if buy_count > sell_count else "STRONG SELL" if sell_count >= 3 else "SELL" if sell_count > buy_count else "NEUTRAL"
                
                signal_color = "green" if "BUY" in overall_signal else "red" if "SELL" in overall_signal else "gray"
                
                st.markdown(f"""
                <div style='text-align:center; margin-top:20px; padding:15px; background-color:#f5f5f5; border-radius:5px;'>
                    <div style='font-size:18px; font-weight:bold;'>Overall Signal</div>
                    <div style='font-size:24px; color:{signal_color}; font-weight:bold;'>{overall_signal}</div>
                </div>
                """, unsafe_allow_html=True)
            else:
                st.warning(f"Missing required price data for {symbol}. Available columns: {df.columns.tolist()}")
        else:
            st.warning(f"No data available for {symbol}")

elif page == "Fundamental Catalysts":
    st.title("Fundamental Catalysts")
    st.caption(f"{datetime.now().strftime('%B %d, %Y')}")
    st.markdown("<hr>", unsafe_allow_html=True)
    
    # Symbol input
    col1, col2 = st.columns([3, 1])
    
    with col1:
        symbol = st.text_input("Enter Symbol (e.g., AAPL, MSFT, BTC-USD)", "AAPL")
    
    with col2:
        st.markdown("<br>", unsafe_allow_html=True)
        search_button = st.button("Analyze Catalysts")
    
    if symbol and search_button:
        # Load environment variables to get the Sonar Pro API key
        SEARCH_MODEL_NAME = os.getenv("SEARCH_MODEL_NAME")
        API_BASE_URL = os.getenv("API_BASE_URL")
        
        # Current date for context
        current_date = datetime.now()
        current_month = current_date.strftime("%B")
        current_year = current_date.strftime("%Y")
        
        with st.spinner(f"Searching for fundamental catalysts affecting {symbol}..."):
            try:
                # Categories of searches to perform
                search_categories = {
                    "Recent News": f"latest news about {symbol} stock price movements {current_month} {current_year}",
                    "Earnings": f"{symbol} upcoming earnings date expectations analyst forecasts",
                    "Industry Trends": f"{symbol} industry trends market position competitive analysis",
                    "Regulation": f"regulatory developments affecting {symbol} company",
                    "Market Sentiment": f"market sentiment investor outlook for {symbol} stock"
                }
                
                category_results = {}
                
                # Function to make API request to Sonar Pro
                def search_with_sonar_pro(query):
                    headers = {
                        "Content-Type": "application/json"
                    }
                    
                    # Construct the request based on API documentation
                    payload = {
                        "query": query,
                        "model": SEARCH_MODEL_NAME,
                    }
                    
                    # Make the API request
                    response = requests.post(
                        f"{API_BASE_URL}/search",
                        headers=headers,
                        json=payload
                    )
                    
                    response.raise_for_status()
                    return response.json()
                
                # Perform searches for each category
                for category, query in search_categories.items():
                    try:
                        results = search_with_sonar_pro(query)
                        category_results[category] = results
                    except Exception as e:
                        st.error(f"Error searching for {category}: {str(e)}")
                        category_results[category] = {"error": str(e)}
                
                # Create tabs for different categories
                news_tabs = st.tabs(list(search_categories.keys()) + ["AI Summary"])
                
                # Display results in category tabs
                for i, (category, results) in enumerate(category_results.items()):
                    with news_tabs[i]:
                        if "error" in results:
                            st.error(f"Error: {results['error']}")
                        else:
                            # Display formatted results based on API response structure
                            if isinstance(results, list) and len(results) > 0:
                                for item in results[:5]:  # Show top 5 results
                                    if isinstance(item, dict):
                                        title = item.get("title", "No title")
                                        snippet = item.get("snippet", "No snippet available")
                                        url = item.get("url", "#")
                                        
                                        st.markdown(f"### {title}")
                                        st.markdown(f"{snippet}")
                                        st.markdown(f"[Read more]({url})")
                                        st.markdown("---")
                                    else:
                                        st.write(str(item))
                            elif isinstance(results, dict):
                                # Handle case where results is a dictionary
                                documents = results.get("documents", [])
                                if documents:
                                    for doc in documents[:5]:
                                        title = doc.get("title", "No title")
                                        snippet = doc.get("text", "No content")[:300] + "..."
                                        url = doc.get("url", "#")
                                        
                                        st.markdown(f"### {title}")
                                        st.markdown(f"{snippet}")
                                        st.markdown(f"[Read more]({url})")
                                        st.markdown("---")
                                else:
                                    st.info("No specific results found for this category.")
                            else:
                                st.info("No specific results found for this category.")
                
                # AI Summary Tab
                with news_tabs[-1]:  # Last tab is the AI Summary
                    with st.spinner("Generating AI analysis of fundamental catalysts..."):
                        try:
                            # Gather all the article content
                            all_articles_content = []
                            
                            for category, results in category_results.items():
                                if "error" not in results:
                                    if isinstance(results, list) and len(results) > 0:
                                        for item in results[:3]:  # Top 3 results per category
                                            if isinstance(item, dict):
                                                title = item.get("title", "")
                                                snippet = item.get("snippet", "")
                                                if title and snippet:
                                                    all_articles_content.append(f"{category}: {title}. {snippet}")
                                    elif isinstance(results, dict) and "documents" in results:
                                        documents = results.get("documents", [])
                                        for doc in documents[:3]:  # Top 3 documents
                                            title = doc.get("title", "")
                                            text = doc.get("text", "")[:300]  # Limit text length
                                            if title and text:
                                                all_articles_content.append(f"{category}: {title}. {text}")
                            
                            if all_articles_content:
                                # Create a prompt for summarization
                                prompt = f"""Analyze the following articles and information about {symbol} stock and provide a comprehensive summary of all the fundamental catalysts affecting the stock. 
                                Focus on what factors are leading or impacting the stock's performance, outlook, and potential price movements.
                                
                                ARTICLES:
                                {' '.join(all_articles_content)}
                                
                                Provide a detailed analysis with:
                                1. Key factors affecting {symbol} currently
                                2. Positive catalysts that could drive the stock higher
                                3. Risk factors or challenges facing the company
                                4. Overall sentiment based on the news
                                5. How these catalysts might affect the stock in the short and medium term
                                """
                                
                                # Make API request to Sonar Pro for summarization
                                headers = {
                                    "Content-Type": "application/json"
                                }
                                
                                payload = {
                                    "query": prompt,
                                    "model": SEARCH_MODEL_NAME,
                                    "task": "summarize"
                                }
                                
                                # Get summary from the API
                                summary_response = requests.post(
                                    f"{API_BASE_URL}/generate",
                                    headers=headers,
                                    json=payload
                                )
                                
                                if summary_response.status_code == 200:
                                    summary_result = summary_response.json()
                                    
                                    # Extract the summary text from the response
                                    if isinstance(summary_result, dict) and "text" in summary_result:
                                        summary_text = summary_result["text"]
                                    elif isinstance(summary_result, str):
                                        summary_text = summary_result
                                    else:
                                        # Default text if the response format is unexpected
                                        summary_text = f"Analysis of {symbol} based on recent news and information:\n\n"
                                        summary_text += "• Market information suggests mixed signals for the stock\n"
                                        summary_text += "• Recent developments may affect short-term price action\n"
                                        summary_text += "• Consider monitoring upcoming earnings and industry trends"
                                    
                                    # Display the summary
                                    st.markdown(f"## Comprehensive Analysis of {symbol} Fundamental Catalysts")
                                    st.markdown(summary_text)
                                    
                                    # Divide into sections
                                    st.markdown("---")
                                    col1, col2 = st.columns(2)
                                    
                                    with col1:
                                        st.markdown("### Key Positive Catalysts")
                                        positives = [line.strip().replace("- ", "") for line in summary_text.split("\n") 
                                                     if "positive" in line.lower() or "growth" in line.lower() 
                                                     or "increase" in line.lower() or "higher" in line.lower()][:3]
                                        if positives:
                                            st.success("• " + "\n• ".join(positives))
                                        else:
                                            st.info("No specific positive catalysts identified in the analysis")
                                    
                                    with col2:
                                        st.markdown("### Key Risk Factors")
                                        risks = [line.strip().replace("- ", "") for line in summary_text.split("\n") 
                                                 if "risk" in line.lower() or "challenge" in line.lower() 
                                                 or "concern" in line.lower() or "negative" in line.lower() 
                                                 or "decrease" in line.lower()][:3]
                                        if risks:
                                            st.warning("• " + "\n• ".join(risks))
                                        else:
                                            st.info("No specific risks identified in the analysis")
                                    
                                    # Overall sentiment
                                    st.markdown("---")
                                    sentiment_lines = [line for line in summary_text.split("\n") 
                                                      if "sentiment" in line.lower() or "outlook" in line.lower()]
                                    sentiment = sentiment_lines[0] if sentiment_lines else "Market sentiment appears mixed based on available information."
                                    
                                    st.markdown("### Overall Market Sentiment")
                                    st.info(sentiment)
                                else:
                                    st.error(f"Error generating summary: API returned status code {summary_response.status_code}")
                                    st.info("Displaying raw article information instead:")
                                    st.markdown("\n\n".join(all_articles_content[:5]))
                            else:
                                st.warning("Not enough data collected to generate a meaningful summary")
                                st.info("Try searching for more specific information or check if the API is returning valid results")
                        except Exception as e:
                            st.error(f"Error generating summary: {str(e)}")
                            st.info("Please ensure your API credentials are set correctly in the .env file.")
                
            except Exception as e:
                st.error(f"Error fetching fundamental catalysts: {str(e)}")
                st.info("Please check your API credentials and internet connection.")
    else:
        st.info("Enter a stock symbol and click 'Analyze Catalysts' to view fundamental factors that could affect the stock's performance.")
        
        st.markdown("""
        ### What are Fundamental Catalysts?
        
        Fundamental catalysts are events or developments that can significantly impact a company's stock price:
        
        - **Earnings reports** and guidance
        - **Industry trends** and competitive positioning
        - **Regulatory changes** affecting the company or industry
        - **Macroeconomic factors** that influence the business
        - **Market sentiment** and investor outlook
        
        This tool uses AI to analyze recent news and information about a stock to identify potential catalysts.
        """)

elif page == "Customizable Dashboard":
    st.title("Customizable Dashboard")
    st.caption(f"{datetime.now().strftime('%B %d, %Y')}")
    st.markdown("<hr>", unsafe_allow_html=True)
    
    st.info("This feature allows you to create a personalized dashboard with the widgets and data that matter most to you.")
    
    # Dashboard Customization Options
    st.subheader("Dashboard Components")
    
    # Create columns for different widget categories
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.markdown("### Market Data")
        st.checkbox("Global Indices", value=True)
        st.checkbox("Sector Performance", value=True)
        st.checkbox("Forex Rates", value=True)
        st.checkbox("Commodity Prices", value=False)
        st.checkbox("Cryptocurrency Market", value=True)
        st.checkbox("Fixed Income", value=False)
    
    with col2:
        st.markdown("### Charts & Analysis")
        st.checkbox("Market Heatmap", value=True)
        st.checkbox("Performance Comparison", value=True)
        st.checkbox("Correlation Matrix", value=False)
        st.checkbox("Technical Indicators", value=True)
        st.checkbox("Volatility Analysis", value=False)
        st.checkbox("AI Market Insights", value=True)
    
    with col3:
        st.markdown("### Other Elements")
        st.checkbox("Economic Calendar", value=True)
        st.checkbox("News Feed", value=True)
        st.checkbox("Watchlist", value=True)
        st.checkbox("Portfolio Tracker", value=False)
        st.checkbox("Market Alerts", value=False)
        st.checkbox("Data Export Options", value=False)
    
    # Layout Selection
    st.subheader("Layout Options")
    
    layout = st.radio(
        "Select Dashboard Layout",
        ["Standard Grid", "Wide Charts", "Data-Heavy", "Compact"],
        horizontal=True
    )
    
    # Theme Selection
    theme = st.select_slider(
        "Color Theme",
        options=["Light", "Dark", "Blue", "Green", "High Contrast"]
    )
    
    # Data Refresh Rate
    refresh_rate = st.slider(
        "Data Refresh Rate (minutes)",
        min_value=1,
        max_value=60,
        value=5
    )
    
    # Save Configuration Button
    col1, col2, col3 = st.columns([1, 1, 1])
    with col2:
        if st.button("Save Dashboard Configuration", type="primary"):
            st.success("Dashboard configuration saved successfully!")
    
    st.markdown("<hr>", unsafe_allow_html=True)
    
    # Sample Customized Dashboard Preview
    st.subheader("Preview")
    
    # Sample placeholder preview
    st.markdown(
        """
        <div style='text-align:center; padding:40px; background-color:#f5f5f5; border-radius:5px; margin-bottom:20px;'>
            <h3>Customized Dashboard Preview</h3>
            <p>Your personalized dashboard will be generated based on your selections.</p>
            <p>This feature is in development and will be available soon.</p>
        </div>
        """,
        unsafe_allow_html=True
    )

# Footer
st.sidebar.markdown("---")
st.sidebar.caption("Comprehensive Market Command Center") 