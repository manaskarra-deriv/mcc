import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Grid, 
  Paper, 
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  TextField,
  MenuItem,
  FormControl,
  Button,
  Tooltip
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import axios from 'axios';
import { formatNumber, getValueClass, API_BASE_URL } from '../utils/helpers';

// Create a global state to persist market data
let globalMarketData = null;
let lastFetchedPeriod = null;

const MarketSummary = () => {
  const [marketData, setMarketData] = useState(globalMarketData || {});
  const [loading, setLoading] = useState(globalMarketData === null);
  const [period, setPeriod] = useState(lastFetchedPeriod || '1mo');  // Default period is 1 month
  
  // Define available time periods
  const periods = [
    { value: '1d', label: '1 Day' },
    { value: '5d', label: '5 Days' },
    { value: '1mo', label: '1 Month' },
    { value: '3mo', label: '3 Months' },
    { value: '6mo', label: '6 Months' },
    { value: 'ytd', label: 'Year to Date' },
    { value: '1y', label: '1 Year' },
  ];
  
  // Define market categories and symbols that will always be shown
  const marketStructure = {
    'indices': [
      { name: 'S&P 500', ticker: 'SPY' },
      { name: 'NASDAQ', ticker: 'QQQ' },
      { name: 'Dow Jones', ticker: 'DIA' },
      { name: 'Russell 2000', ticker: 'IWM' },
      { name: 'S&P 400 Mid Cap', ticker: 'MDY' },
      { name: 'S&P 600 Small Cap', ticker: 'SLY' },
      { name: 'NASDAQ 100', ticker: 'QQQ' },
      { name: 'Dow Jones Transport', ticker: 'IYT' },
      { name: 'Dow Jones Utilities', ticker: 'IDU' },
      { name: 'Vanguard Total Stock', ticker: 'VTI' }
    ],
    'stocks': [
      { name: 'Apple', ticker: 'AAPL' },
      { name: 'Tesla', ticker: 'TSLA' },
      { name: 'Microsoft', ticker: 'MSFT' },
      { name: 'Amazon', ticker: 'AMZN' },
      { name: 'Google', ticker: 'GOOGL' },
      { name: 'Meta', ticker: 'META' },
      { name: 'Nvidia', ticker: 'NVDA' },
      { name: 'Netflix', ticker: 'NFLX' },
      { name: 'Berkshire', ticker: 'BRK.B' },
      { name: 'JP Morgan', ticker: 'JPM' }
    ],
    'crypto': [
      { name: 'Bitcoin', ticker: 'BTC/USD' },
      { name: 'Ethereum', ticker: 'ETH/USD' },
      { name: 'Solana', ticker: 'SOL/USD' },
      { name: 'Bitcoin Cash', ticker: 'BCH/USD' },
      { name: 'Litecoin', ticker: 'LTC/USD' },
      { name: 'Cardano', ticker: 'ADA/USD' },
      { name: 'Dogecoin', ticker: 'DOGE/USD' },
      { name: 'Polygon', ticker: 'MATIC/USD' },
      { name: 'Avalanche', ticker: 'AVAX/USD' },
      { name: 'Chainlink', ticker: 'LINK/USD' }
    ]
  };
  
  // Function to fetch market data
  const fetchData = async () => {
    try {
      setLoading(true);
      // Use the API_BASE_URL for consistent API calls
      const response = await axios.get(`${API_BASE_URL}/market-summary?period=${period}`);
      console.log('API response:', response.data); // Add logging to debug
      setMarketData(response.data.data);
      // Save to global state
      globalMarketData = response.data.data;
      lastFetchedPeriod = period;
      setLoading(false);
    } catch (error) {
      console.error('Error fetching market data:', error);
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Only fetch data if it's not available or if period changed
    if (globalMarketData === null || period !== lastFetchedPeriod) {
      fetchData();
    }
  }, [period]); // Only re-fetch when period changes
  
  // Handle manual refresh
  const handleRefresh = () => {
    fetchData();
  };

  // Handle period change
  const handlePeriodChange = (event) => {
    setPeriod(event.target.value);
  };

  const renderMarketTable = (category, title) => {
    const hasData = marketData && marketData[category];
    
    return (
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Change</TableCell>
              <TableCell align="right">Change %</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {marketStructure[category]
              .filter(item => {
                // Only include the item if it's still loading or has valid data
                if (loading) return true;
                if (!hasData) return false;
                
                // Check if data exists for this ticker
                const fetchedItem = marketData[category].find(
                  marketItem => marketItem.ticker === item.ticker
                );
                return !!fetchedItem; // Only keep items with data
              })
              .map((item) => {
                // Look for this item in the fetched data
                const fetchedItem = hasData ? 
                  marketData[category].find(marketItem => marketItem.ticker === item.ticker) : null;
                
                return (
                  <TableRow key={item.ticker}>
                    <TableCell component="th" scope="row">
                      {item.name}
                    </TableCell>
                    <TableCell align="right">
                      {loading ? (
                        <CircularProgress size={16} />
                      ) : (
                        formatNumber(fetchedItem.price, 'price')
                      )}
                    </TableCell>
                    <TableCell align="right" className={!loading ? getValueClass(fetchedItem.change) : ''}>
                      {loading ? (
                        <CircularProgress size={16} />
                      ) : (
                        formatNumber(fetchedItem.change, 'change')
                      )}
                    </TableCell>
                    <TableCell align="right" className={!loading ? getValueClass(fetchedItem.changePct) : ''}>
                      {loading ? (
                        <CircularProgress size={16} />
                      ) : (
                        formatNumber(fetchedItem.changePct, 'percent')
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            {!loading && marketStructure[category].filter(item => {
                if (!hasData) return false;
                const fetchedItem = marketData[category].find(
                  marketItem => marketItem.ticker === item.ticker
                );
                return !!fetchedItem;
              }).length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No data available for this category
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <div>
      <Box className="page-header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Market Summary
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Tooltip title="Refresh market data">
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={handleRefresh}
              disabled={loading}
              startIcon={<RefreshIcon />}
            >
              Refresh
            </Button>
          </Tooltip>
          <FormControl sx={{ minWidth: 150 }}>
            <TextField
              select
              label="Time Period"
              variant="outlined"
              value={period}
              onChange={handlePeriodChange}
              size="small"
            >
              {periods.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </FormControl>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Indices */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            US Indices
          </Typography>
          {renderMarketTable('indices', 'US Indices')}
        </Grid>

        {/* Stocks */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            US Stocks
          </Typography>
          {renderMarketTable('stocks', 'US Stocks')}
        </Grid>

        {/* Crypto */}
        <Grid item xs={12} md={12} sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Cryptocurrencies
          </Typography>
          {renderMarketTable('crypto', 'Cryptocurrencies')}
        </Grid>
      </Grid>
    </div>
  );
};

export default MarketSummary; 