import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Button,
  Paper,
  Box,
  Divider,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
  Stack,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import BarChartIcon from '@mui/icons-material/BarChart';
import axios from 'axios';
import { formatNumber, API_BASE_URL } from '../utils/helpers';

const Dashboard = () => {
  const navigate = useNavigate();
  const [marketData, setMarketData] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  
  // Function to refresh data manually
  const refreshData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/market-summary`);
      setMarketData(response.data.data);
      setLastRefreshed(new Date());
      setLoading(false);
      
      // Store the fetched data in localStorage with timestamp
      localStorage.setItem('dashboardData', JSON.stringify({
        data: response.data.data,
        timestamp: new Date().getTime()
      }));
    } catch (error) {
      console.error('Error fetching market data:', error);
      setLoading(false);
    }
  };
  
  // Load data from cache or fetch initial data
  useEffect(() => {
    const cachedData = localStorage.getItem('dashboardData');
    
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      setMarketData(parsedData.data);
      setLastRefreshed(new Date(parsedData.timestamp));
      setLoading(false);
    } else {
      // Only fetch on first load if no cached data
      refreshData();
    }
  }, []);
  
  // Format last refreshed time
  const formattedRefreshTime = lastRefreshed.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  
  // Get current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Helper to determine CSS class for changes
  const getChangeClass = (change) => {
    if (change > 0) return 'positive';
    if (change < 0) return 'negative';
    return 'neutral';
  };

  // Helper to get trend icon
  const getTrendIcon = (change) => {
    if (change > 0) return <TrendingUpIcon fontSize="small" className="positive" />;
    if (change < 0) return <TrendingDownIcon fontSize="small" className="negative" />;
    return null;
  };

  return (
    <div>
      <Box className="page-header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
            Dashboard
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {currentDate}
            </Typography>
            <Chip 
              size="small" 
              label="Market Open" 
              color="success" 
              sx={{ 
                height: 24, 
                fontSize: '0.75rem', 
                fontWeight: 500,
                background: 'rgba(6, 214, 160, 0.1)',
                color: '#06d6a0',
                border: 'none'
              }} 
            />
          </Stack>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            py: 0.75,
            px: 1.5,
            borderRadius: 2,
            backgroundColor: 'rgba(0, 0, 0, 0.03)',
          }}>
            <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
              Last updated: {formattedRefreshTime}
            </Typography>
            <Tooltip title="Refresh data">
              <IconButton 
                onClick={refreshData} 
                disabled={loading}
                color="primary"
                size="small"
                sx={{ 
                  bgcolor: 'background.paper',
                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.08)',
                  '&:hover': {
                    bgcolor: 'background.paper',
                    boxShadow: '0 3px 8px rgba(0, 0, 0, 0.12)',
                  }
                }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Market Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {loading ? (
          // Loading state
          [...Array(4)].map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                sx={{
                  p: 2.5,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 160,
                  bgcolor: 'background.paper',
                  borderRadius: 3,
                }}
              >
                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Box className="skeleton" sx={{ width: '60%', height: 20, mb: 1 }} />
                  <Box className="skeleton" sx={{ width: '80%', height: 30, mb: 1 }} />
                  <Box className="skeleton" sx={{ width: '40%', height: 16 }} />
                </Box>
              </Paper>
            </Grid>
          ))
        ) : (
          // Market Data Cards
          <>
            {/* S&P 500 */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2.5, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  height: 160,
                  borderRadius: 3,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '4px',
                    background: 'linear-gradient(90deg, #3a506b, rgba(58, 80, 107, 0.5))',
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    S&P 500
                  </Typography>
                  <Avatar 
                    variant="rounded" 
                    sx={{ 
                      width: 36, 
                      height: 36, 
                      bgcolor: 'rgba(58, 80, 107, 0.1)',
                      color: 'primary.main'
                    }}
                  >
                    <ShowChartIcon fontSize="small" />
                  </Avatar>
                </Box>
                <Typography variant="subtitle2" color="textSecondary" sx={{ fontSize: 12 }}>
                  US Large Cap Equities
                </Typography>
                <Box sx={{ mt: 'auto' }}>
                  <Typography variant="h4" component="div" sx={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                    {marketData.indices && marketData.indices[0] ? 
                      formatNumber(marketData.indices[0].price) : 'N/A'
                    }
                  </Typography>
                  {marketData.indices && marketData.indices[0] && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {getTrendIcon(marketData.indices[0].changePct)}
                      <Typography 
                        variant="body2" 
                        className={getChangeClass(marketData.indices[0].changePct)}
                        sx={{ fontWeight: 'bold' }}
                      >
                        {formatNumber(marketData.indices[0].changePct, 'percent')}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* NASDAQ */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2.5, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  height: 160,
                  borderRadius: 3,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '4px',
                    background: 'linear-gradient(90deg, #6c63ff, rgba(108, 99, 255, 0.5))',
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    NASDAQ
                  </Typography>
                  <Avatar 
                    variant="rounded" 
                    sx={{ 
                      width: 36, 
                      height: 36, 
                      bgcolor: 'rgba(108, 99, 255, 0.1)',
                      color: 'secondary.main'
                    }}
                  >
                    <ShowChartIcon fontSize="small" />
                  </Avatar>
                </Box>
                <Typography variant="subtitle2" color="textSecondary" sx={{ fontSize: 12 }}>
                  US Tech Equities
                </Typography>
                <Box sx={{ mt: 'auto' }}>
                  <Typography variant="h4" component="div" sx={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                    {marketData.indices && marketData.indices[1] ? 
                      formatNumber(marketData.indices[1].price) : 'N/A'
                    }
                  </Typography>
                  {marketData.indices && marketData.indices[1] && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {getTrendIcon(marketData.indices[1].changePct)}
                      <Typography 
                        variant="body2" 
                        className={getChangeClass(marketData.indices[1].changePct)}
                        sx={{ fontWeight: 'bold' }}
                      >
                        {formatNumber(marketData.indices[1].changePct, 'percent')}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Bitcoin */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2.5, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  height: 160,
                  borderRadius: 3,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '4px',
                    background: 'linear-gradient(90deg, #ef476f, rgba(239, 71, 111, 0.5))',
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Bitcoin
                  </Typography>
                  <Avatar 
                    variant="rounded" 
                    sx={{ 
                      width: 36, 
                      height: 36, 
                      bgcolor: 'rgba(239, 71, 111, 0.1)',
                      color: 'error.main'
                    }}
                  >
                    <ShowChartIcon fontSize="small" />
                  </Avatar>
                </Box>
                <Typography variant="subtitle2" color="textSecondary" sx={{ fontSize: 12 }}>
                  Cryptocurrency Market Leader
                </Typography>
                <Box sx={{ mt: 'auto' }}>
                  <Typography variant="h4" component="div" sx={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                    {marketData.crypto && marketData.crypto[0] ? 
                      `$${formatNumber(marketData.crypto[0].price)}` : 'N/A'
                    }
                  </Typography>
                  {marketData.crypto && marketData.crypto[0] && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {getTrendIcon(marketData.crypto[0].changePct)}
                      <Typography 
                        variant="body2" 
                        className={getChangeClass(marketData.crypto[0].changePct)}
                        sx={{ fontWeight: 'bold' }}
                      >
                        {formatNumber(marketData.crypto[0].changePct, 'percent')}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Apple (replacing EUR/USD) */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2.5, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  height: 160,
                  borderRadius: 3,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '4px',
                    background: 'linear-gradient(90deg, #06d6a0, rgba(6, 214, 160, 0.5))',
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Apple
                  </Typography>
                  <Avatar 
                    variant="rounded" 
                    sx={{ 
                      width: 36, 
                      height: 36, 
                      bgcolor: 'rgba(6, 214, 160, 0.1)',
                      color: 'success.main'
                    }}
                  >
                    <ShowChartIcon fontSize="small" />
                  </Avatar>
                </Box>
                <Typography variant="subtitle2" color="textSecondary" sx={{ fontSize: 12 }}>
                  Leading Tech Stock
                </Typography>
                <Box sx={{ mt: 'auto' }}>
                  <Typography variant="h4" component="div" sx={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                    {marketData.stocks && marketData.stocks[0] ? 
                      `$${formatNumber(marketData.stocks[0].price)}` : 'N/A'
                    }
                  </Typography>
                  {marketData.stocks && marketData.stocks[0] && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {getTrendIcon(marketData.stocks[0].changePct)}
                      <Typography 
                        variant="body2" 
                        className={getChangeClass(marketData.stocks[0].changePct)}
                        sx={{ fontWeight: 'bold' }}
                      >
                        {formatNumber(marketData.stocks[0].changePct, 'percent')}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
          </>
        )}
      </Grid>

      {/* Dashboard Views */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" className="section-title" sx={{ fontWeight: 600 }}>
          Dashboard Views
        </Typography>
      </Box>
      
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', borderRadius: 3 }} elevation={0}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                  <BarChartIcon />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Market Summary
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Chip 
                  size="small" 
                  label="Overview" 
                  sx={{ 
                    mr: 1, 
                    mb: 1, 
                    fontSize: '0.7rem',
                    bgcolor: 'rgba(58, 80, 107, 0.1)',
                    color: 'primary.main',
                  }} 
                />
                <Chip 
                  size="small" 
                  label="Real-time" 
                  sx={{ 
                    mr: 1, 
                    mb: 1, 
                    fontSize: '0.7rem',
                    bgcolor: 'rgba(6, 214, 160, 0.1)',
                    color: 'success.main',
                  }} 
                />
                <Chip 
                  size="small" 
                  label="Indices" 
                  sx={{ 
                    mr: 1, 
                    mb: 1, 
                    fontSize: '0.7rem',
                    bgcolor: 'rgba(108, 99, 255, 0.1)',
                    color: 'secondary.main',
                  }} 
                />
              </Box>
              
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                Get a bird's eye view of all major markets with detailed performance metrics, economic events, and AI-powered market insights.
              </Typography>
            </CardContent>
            <CardActions sx={{ px: 3, pb: 3, pt: 0 }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => navigate('/market-summary')}
                endIcon={<ArrowForwardIcon />}
                sx={{ borderRadius: 2 }}
              >
                View Summary
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📈 Technical Analysis
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Technical indicators, correlations, and chart patterns
              </Typography>
              <Typography variant="body2" paragraph>
                Advanced technical analysis tools including indicator dashboards, correlation matrices, chart pattern detection, and more.
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={() => navigate('/technical-analysis')}
              >
                View Technical Analysis
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🔍 Fundamental Catalysts
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Key drivers and catalysts impacting stock performance
              </Typography>
              <Typography variant="body2" paragraph>
                Analyze important fundamental catalysts that can impact stock prices, including economic events, earnings, regulatory changes, and market sentiment.
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={() => navigate('/fundamental-catalysts')}
              >
                View Catalysts
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Markets */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Markets
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                💹 US Indices
              </Typography>
              <Typography variant="body2" paragraph>
                US stock market indices including S&P 500, NASDAQ, Dow Jones and more.
              </Typography>
            </CardContent>
            <CardActions>
              <Button variant="text" color="primary">
                View Indices
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🪙 Cryptocurrencies
              </Typography>
              <Typography variant="body2" paragraph>
                Bitcoin, Ethereum, and other digital assets with market metrics.
              </Typography>
            </CardContent>
            <CardActions>
              <Button variant="text" color="primary">
                View Crypto
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                💰 US Stocks
              </Typography>
              <Typography variant="body2" paragraph>
                Major US stocks including Apple, Tesla, Microsoft, and more.
              </Typography>
            </CardContent>
            <CardActions>
              <Button variant="text" color="primary">
                View Stocks
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Analysis Tools */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Analysis Tools
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📋 Watchlist
              </Typography>
              <Typography variant="body2" paragraph>
                Track and monitor your selected symbols across markets.
              </Typography>
            </CardContent>
            <CardActions>
              <Button variant="text" color="primary">
                View Watchlist
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🔍 Screener
              </Typography>
              <Typography variant="body2" paragraph>
                Find opportunities with customizable screening criteria.
              </Typography>
            </CardContent>
            <CardActions>
              <Button variant="text" color="primary">
                View Screener
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🧠 AI Market Insights
              </Typography>
              <Typography variant="body2" paragraph>
                AI-powered analysis of market trends, themes, and patterns.
              </Typography>
            </CardContent>
            <CardActions>
              <Button variant="text" color="primary">
                View AI Insights
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard; 