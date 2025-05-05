import React, { useState, useEffect, useCallback } from 'react';
import { 
  Typography, 
  Grid, 
  Paper, 
  Box,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Card,
  CardHeader,
  CardContent,
  Chip
} from '@mui/material';
import axios from 'axios';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Area, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ReferenceLine
} from 'recharts';
import { formatNumber, generateAIAnalysis, API_BASE_URL } from '../utils/helpers';

const TechnicalAnalysis = () => {
  const [ticker, setTicker] = useState('SPY');
  const [period, setPeriod] = useState('3mo');
  const [technicalData, setTechnicalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [response, setResponse] = useState(null);

  // Read URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const symbolParam = urlParams.get('symbol');
    
    if (symbolParam) {
      setTicker(symbolParam);
      // Automatically analyze when a symbol is provided in URL
      setTimeout(() => {
        fetchTechnicalData(symbolParam);
      }, 100);
    }
  }, []);

  const periods = [
    { value: '1d', label: '1 Day' },
    { value: '5d', label: '5 Days' },
    { value: '1mo', label: '1 Month' },
    { value: '3mo', label: '3 Months' },
    { value: '6mo', label: '6 Months' },
    { value: 'ytd', label: 'Year to Date' },
    { value: '1y', label: '1 Year' },
    { value: '5y', label: '5 Years' },
  ];

  const fetchTechnicalData = useCallback(async (symbolOverride) => {
    try {
      setLoading(true);
      setAiAnalysis('');
      // Use the overridden symbol if provided, otherwise use state
      const symbolToUse = symbolOverride || ticker;
      
      // Check if ticker has a slash (cryptocurrency)
      const hasCryptoFormat = symbolToUse.includes('/');
      
      // Use query parameter format for all symbols to avoid URL issues
      const apiResponse = await axios.get(`${API_BASE_URL}/technical-indicators`, {
        params: {
          symbol: symbolToUse,
          period: period
        }
      });
      
      setResponse(apiResponse); // Store the full response
      setTechnicalData(apiResponse.data.data.indicators);
      setLoading(false);
      setAnalyzed(true);
      
      // Generate AI analysis after data is loaded
      setAnalysisLoading(true);
      try {
        console.log("Requesting AI analysis for", symbolToUse);
        const analysis = await generateAIAnalysis(apiResponse.data.data.indicators, symbolToUse);
        setAiAnalysis(analysis);
        console.log("AI analysis received:", analysis.substring(0, 50) + "...");
      } catch (analysisError) {
        console.error("Error generating AI analysis:", analysisError);
        setAiAnalysis("Unable to generate AI analysis. Using fallback analysis instead.");
      } finally {
        setAnalysisLoading(false);
      }
    } catch (error) {
      console.error('Error fetching technical data:', error);
      setLoading(false);
      setAnalysisLoading(false);
    }
  }, [ticker, period]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchTechnicalData();
  };

  // Transform the data for charts - keep only important data points to avoid cluttering
  const getChartData = () => {
    if (!technicalData || technicalData.length === 0) return [];

    // If we have a lot of data points, sample them to reduce clutter
    let dataToUse = technicalData;
    if (technicalData.length > 100) {
      // Take every nth data point
      const n = Math.ceil(technicalData.length / 100);
      dataToUse = technicalData.filter((_, i) => i % n === 0);
    }

    return dataToUse.map(item => ({
      date: item.date,
      open: parseFloat(item.open),
      high: parseFloat(item.high),
      low: parseFloat(item.low),
      close: parseFloat(item.close),
      volume: parseFloat(item.volume),
      // Convert technical indicators from strings to numbers where necessary
      sma20: item.sma20 !== "null" ? parseFloat(item.sma20) : null,
      sma50: item.sma50 !== "null" ? parseFloat(item.sma50) : null,
      sma200: item.sma200 !== "null" ? parseFloat(item.sma200) : null,
      upper_band: item.upper_band !== "null" ? parseFloat(item.upper_band) : null,
      lower_band: item.lower_band !== "null" ? parseFloat(item.lower_band) : null,
      rsi: item.rsi !== "null" ? parseFloat(item.rsi) : null,
      macd: item.macd !== "null" ? parseFloat(item.macd) : null,
      signal: item.signal !== "null" ? parseFloat(item.signal) : null,
      histogram: item.histogram !== "null" ? parseFloat(item.histogram) : null
    }));
  };

  const chartData = getChartData();

  return (
    <div>
      <Box className="page-header">
        <Typography variant="h4" component="h1">
          Technical Analysis
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Symbol"
                variant="outlined"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                helperText="Enter a stock symbol (e.g., AAPL, SPY)"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="Time Period"
                variant="outlined"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                {periods.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button 
                fullWidth 
                variant="contained" 
                color="primary" 
                type="submit"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Analyze'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Analysis Results
          </Typography>
          {loading ? (
            <Paper sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
              <CircularProgress />
            </Paper>
          ) : !analyzed ? (
            <Paper sx={{ p: 3 }}>
              <Typography>Enter a symbol and click Analyze to view technical indicators.</Typography>
            </Paper>
          ) : chartData.length > 0 ? (
            <>
              {/* Main Price Chart with SMA and Bollinger Bands */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {ticker} Price Chart with Moving Averages & Bollinger Bands
                </Typography>
                <Box sx={{ height: 400, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis 
                        domain={['auto', 'auto']}
                        tickFormatter={(value) => formatNumber(value)}
                      />
                      <Tooltip 
                        formatter={(value) => formatNumber(value)}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="upper_band" 
                        fill="#8884d8" 
                        fillOpacity={0.1} 
                        stroke="none" 
                        name="Upper Band"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="lower_band" 
                        fill="#8884d8" 
                        fillOpacity={0.1} 
                        stroke="none" 
                        name="Lower Band" 
                        baseLine={[1]}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="close" 
                        stroke="#000000" 
                        dot={false} 
                        name="Price" 
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="sma20" 
                        stroke="#2196F3" 
                        dot={false} 
                        name="SMA 20" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="sma50" 
                        stroke="#FF9800" 
                        dot={false} 
                        name="SMA 50" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="sma200" 
                        stroke="#E91E63" 
                        dot={false} 
                        name="SMA 200" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="upper_band" 
                        stroke="#8884d8" 
                        dot={false} 
                        name="Upper BB" 
                        strokeDasharray="5 5"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="lower_band" 
                        stroke="#8884d8" 
                        dot={false} 
                        name="Lower BB" 
                        strokeDasharray="5 5"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>

              {/* RSI Chart */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Relative Strength Index (RSI)
                </Typography>
                <Box sx={{ height: 200, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => value ? value.toFixed(2) : 'N/A'} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="rsi" 
                        stroke="#8884d8" 
                        dot={false} 
                        name="RSI" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="rsi70" 
                        stroke="#ff0000" 
                        strokeDasharray="3 3" 
                        dot={false} 
                        name="Overbought (70)" 
                        legendType="none"
                        isAnimationActive={false}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="rsi30" 
                        stroke="#00ff00" 
                        strokeDasharray="3 3" 
                        dot={false} 
                        name="Oversold (30)" 
                        legendType="none"
                        isAnimationActive={false}
                      />
                      {/* Horizontal lines for overbought and oversold levels */}
                      <ReferenceLine y={70} stroke="red" strokeDasharray="3 3" label="Overbought" />
                      <ReferenceLine y={30} stroke="green" strokeDasharray="3 3" label="Oversold" />
                      <ReferenceLine y={50} stroke="gray" strokeDasharray="3 3" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>

              {/* MACD Chart */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  MACD (Moving Average Convergence Divergence)
                </Typography>
                <Box sx={{ height: 200, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => value ? value.toFixed(4) : 'N/A'} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="macd" 
                        stroke="#0088FE" 
                        dot={false} 
                        name="MACD" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="signal" 
                        stroke="#FF8042" 
                        dot={false} 
                        name="Signal" 
                      />
                      <Bar 
                        dataKey="histogram" 
                        name="Histogram" 
                        fill={(entry) => (entry.histogram >= 0 ? '#00C49F' : '#FF0000')}
                      />
                      <ReferenceLine y={0} stroke="gray" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>

              {/* Technical Analysis Summary */}
              <Paper sx={{ 
                p: 4, 
                mt: 3, 
                borderRadius: 3,
                background: 'linear-gradient(to right, #f8f9fa, #ffffff)',
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
              }}>
                <Typography variant="h6" gutterBottom fontWeight="600" color="primary.dark" sx={{ mb: 3 }}>
                  Technical Analysis Summary
                </Typography>
                {technicalData.length > 0 && (
                  <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
                        <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
                          Most Recent Data:
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={4}>
                            <Typography variant="body2" color="text.secondary">Date:</Typography>
                          </Grid>
                          <Grid item xs={8}>
                            <Typography variant="body2" fontWeight="500">{technicalData[technicalData.length - 1].date}</Typography>
                          </Grid>
                          
                          <Grid item xs={4}>
                            <Typography variant="body2" color="text.secondary">Close:</Typography>
                          </Grid>
                          <Grid item xs={8}>
                            <Typography variant="body2" fontWeight="500">{formatNumber(technicalData[technicalData.length - 1].close)}</Typography>
                          </Grid>
                          
                          <Grid item xs={4}>
                            <Typography variant="body2" color="text.secondary">RSI:</Typography>
                          </Grid>
                          <Grid item xs={8}>
                            <Typography 
                              variant="body2" 
                              fontWeight="500"
                              color={
                                technicalData[technicalData.length - 1].rsi > 70 ? 'error.main' : 
                                technicalData[technicalData.length - 1].rsi < 30 ? 'success.main' : 
                                'inherit'
                              }
                            >
                              {technicalData[technicalData.length - 1].rsi !== "null" 
                                ? parseFloat(technicalData[technicalData.length - 1].rsi).toFixed(2) 
                                : "N/A"}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ 
                        p: 2.5, 
                        borderRadius: 2, 
                        bgcolor: 'rgba(108, 99, 255, 0.03)',
                        border: '1px solid rgba(108, 99, 255, 0.1)',
                      }}>
                        <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2, color: 'secondary.main' }}>
                          Indicator Analysis:
                        </Typography>
                        {/* AI-generated analysis */}
                        {analysisLoading ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            <Typography variant="body2">Generating AI analysis...</Typography>
                          </Box>
                        ) : (
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              lineHeight: 1.7,
                              wordBreak: 'break-word',
                              fontWeight: 500,
                              color: 'text.primary',
                              letterSpacing: '0.01em',
                            }}
                          >
                            {aiAnalysis}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                )}
              </Paper>

              {/* Timeframe Analysis - NEW COMPONENT */}
              {response?.data?.data?.timeframe_analysis && (
                <Paper sx={{ 
                  p: 4, 
                  mt: 3, 
                  borderRadius: 3,
                  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                }}>
                  <Typography variant="h6" gutterBottom fontWeight="600" color="primary.dark">
                    Timeframe Analysis
                  </Typography>
                  
                  {/* Timeframe Trends Table */}
                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 600, color: 'text.primary' }}>
                    Timeframe Trend Analysis
                  </Typography>
                  <Box sx={{ 
                    mb: 4, 
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                  }}>
                    <Table size="small">
                      <TableHead sx={{ backgroundColor: 'rgba(108, 99, 255, 0.05)' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, width: '20%', py: 1.5, px: 3 }}>Timeframe</TableCell>
                          <TableCell sx={{ fontWeight: 600, width: '45%', py: 1.5, px: 3 }}>Trend</TableCell>
                          <TableCell sx={{ fontWeight: 600, width: '35%', py: 1.5, px: 3 }}>Volume</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {/* 5-minute timeframe */}
                        {response.data.data.timeframe_analysis.trends["5m"] && (
                          <TableRow>
                            <TableCell sx={{ py: 1.5, px: 3 }}>
                              <Typography variant="body2" fontWeight="600">5m</Typography>
                            </TableCell>
                            <TableCell sx={{ py: 1.5, px: 3 }}>
                              <Chip
                                label={`${response.data.data.timeframe_analysis.trends["5m"].direction} (${response.data.data.timeframe_analysis.trends["5m"].strength})`}
                                size="small"
                                sx={{ 
                                  fontWeight: 500,
                                  bgcolor: response.data.data.timeframe_analysis.trends["5m"].direction === "Bullish" 
                                    ? 'rgba(6, 214, 160, 0.1)' 
                                    : response.data.data.timeframe_analysis.trends["5m"].direction === "Bearish" 
                                      ? 'rgba(239, 71, 111, 0.1)' 
                                      : 'rgba(255, 209, 102, 0.1)',
                                  color: response.data.data.timeframe_analysis.trends["5m"].direction === "Bullish" 
                                    ? '#06d6a0' 
                                    : response.data.data.timeframe_analysis.trends["5m"].direction === "Bearish" 
                                      ? '#ef476f' 
                                      : '#ffd166',
                                  borderRadius: '4px',
                                  px: 1,
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ py: 1.5, px: 3 }}>
                              <Chip
                                label={response.data.data.timeframe_analysis.trends["5m"].volume}
                                size="small"
                                sx={{ 
                                  fontWeight: 500,
                                  bgcolor: response.data.data.timeframe_analysis.trends["5m"].volume === "Increasing" 
                                    ? 'rgba(6, 214, 160, 0.1)' 
                                    : response.data.data.timeframe_analysis.trends["5m"].volume === "Decreasing" 
                                      ? 'rgba(239, 71, 111, 0.1)' 
                                      : 'rgba(108, 99, 255, 0.1)',
                                  color: response.data.data.timeframe_analysis.trends["5m"].volume === "Increasing" 
                                    ? '#06d6a0' 
                                    : response.data.data.timeframe_analysis.trends["5m"].volume === "Decreasing" 
                                      ? '#ef476f' 
                                      : '#6c63ff',
                                  borderRadius: '4px',
                                  px: 1,
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        )}
                        
                        {/* 15-minute timeframe */}
                        {response.data.data.timeframe_analysis.trends["15m"] && (
                          <TableRow sx={{ bgcolor: 'rgba(0, 0, 0, 0.01)' }}>
                            <TableCell sx={{ py: 1.5, px: 3 }}>
                              <Typography variant="body2" fontWeight="600">15m</Typography>
                            </TableCell>
                            <TableCell sx={{ py: 1.5, px: 3 }}>
                              <Chip
                                label={`${response.data.data.timeframe_analysis.trends["15m"].direction} (${response.data.data.timeframe_analysis.trends["15m"].strength})`}
                                size="small"
                                sx={{ 
                                  fontWeight: 500,
                                  bgcolor: response.data.data.timeframe_analysis.trends["15m"].direction === "Bullish" 
                                    ? 'rgba(6, 214, 160, 0.1)' 
                                    : response.data.data.timeframe_analysis.trends["15m"].direction === "Bearish" 
                                      ? 'rgba(239, 71, 111, 0.1)' 
                                      : 'rgba(255, 209, 102, 0.1)',
                                  color: response.data.data.timeframe_analysis.trends["15m"].direction === "Bullish" 
                                    ? '#06d6a0' 
                                    : response.data.data.timeframe_analysis.trends["15m"].direction === "Bearish" 
                                      ? '#ef476f' 
                                      : '#ffd166',
                                  borderRadius: '4px',
                                  px: 1,
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ py: 1.5, px: 3 }}>
                              <Chip
                                label={response.data.data.timeframe_analysis.trends["15m"].volume}
                                size="small"
                                sx={{ 
                                  fontWeight: 500,
                                  bgcolor: response.data.data.timeframe_analysis.trends["15m"].volume === "Increasing" 
                                    ? 'rgba(6, 214, 160, 0.1)' 
                                    : response.data.data.timeframe_analysis.trends["15m"].volume === "Decreasing" 
                                      ? 'rgba(239, 71, 111, 0.1)' 
                                      : 'rgba(108, 99, 255, 0.1)',
                                  color: response.data.data.timeframe_analysis.trends["15m"].volume === "Increasing" 
                                    ? '#06d6a0' 
                                    : response.data.data.timeframe_analysis.trends["15m"].volume === "Decreasing" 
                                      ? '#ef476f' 
                                      : '#6c63ff',
                                  borderRadius: '4px',
                                  px: 1,
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        )}
                        
                        {/* 1-hour timeframe */}
                        {response.data.data.timeframe_analysis.trends["1h"] && (
                          <TableRow>
                            <TableCell sx={{ py: 1.5, px: 3 }}>
                              <Typography variant="body2" fontWeight="600">1h</Typography>
                            </TableCell>
                            <TableCell sx={{ py: 1.5, px: 3 }}>
                              <Chip
                                label={`${response.data.data.timeframe_analysis.trends["1h"].direction} (${response.data.data.timeframe_analysis.trends["1h"].strength})`}
                                size="small"
                                sx={{ 
                                  fontWeight: 500,
                                  bgcolor: response.data.data.timeframe_analysis.trends["1h"].direction === "Bullish" 
                                    ? 'rgba(6, 214, 160, 0.1)' 
                                    : response.data.data.timeframe_analysis.trends["1h"].direction === "Bearish" 
                                      ? 'rgba(239, 71, 111, 0.1)' 
                                      : 'rgba(255, 209, 102, 0.1)',
                                  color: response.data.data.timeframe_analysis.trends["1h"].direction === "Bullish" 
                                    ? '#06d6a0' 
                                    : response.data.data.timeframe_analysis.trends["1h"].direction === "Bearish" 
                                      ? '#ef476f' 
                                      : '#ffd166',
                                  borderRadius: '4px',
                                  px: 1,
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ py: 1.5, px: 3 }}>
                              <Chip
                                label={response.data.data.timeframe_analysis.trends["1h"].volume}
                                size="small"
                                sx={{ 
                                  fontWeight: 500,
                                  bgcolor: response.data.data.timeframe_analysis.trends["1h"].volume === "Increasing" 
                                    ? 'rgba(6, 214, 160, 0.1)' 
                                    : response.data.data.timeframe_analysis.trends["1h"].volume === "Decreasing" 
                                      ? 'rgba(239, 71, 111, 0.1)' 
                                      : 'rgba(108, 99, 255, 0.1)',
                                  color: response.data.data.timeframe_analysis.trends["1h"].volume === "Increasing" 
                                    ? '#06d6a0' 
                                    : response.data.data.timeframe_analysis.trends["1h"].volume === "Decreasing" 
                                      ? '#ef476f' 
                                      : '#6c63ff',
                                  borderRadius: '4px',
                                  px: 1,
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        )}
                        
                        {/* 1-day timeframe */}
                        {response.data.data.timeframe_analysis.trends["1d"] && (
                          <TableRow sx={{ bgcolor: 'rgba(0, 0, 0, 0.01)' }}>
                            <TableCell sx={{ py: 1.5, px: 3 }}>
                              <Typography variant="body2" fontWeight="600">1d</Typography>
                            </TableCell>
                            <TableCell sx={{ py: 1.5, px: 3 }}>
                              <Chip
                                label={`${response.data.data.timeframe_analysis.trends["1d"].direction} (${response.data.data.timeframe_analysis.trends["1d"].strength})`}
                                size="small"
                                sx={{ 
                                  fontWeight: 500,
                                  bgcolor: response.data.data.timeframe_analysis.trends["1d"].direction === "Bullish" 
                                    ? 'rgba(6, 214, 160, 0.1)' 
                                    : response.data.data.timeframe_analysis.trends["1d"].direction === "Bearish" 
                                      ? 'rgba(239, 71, 111, 0.1)' 
                                      : 'rgba(255, 209, 102, 0.1)',
                                  color: response.data.data.timeframe_analysis.trends["1d"].direction === "Bullish" 
                                    ? '#06d6a0' 
                                    : response.data.data.timeframe_analysis.trends["1d"].direction === "Bearish" 
                                      ? '#ef476f' 
                                      : '#ffd166',
                                  borderRadius: '4px',
                                  px: 1,
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ py: 1.5, px: 3 }}>
                              <Chip
                                label={response.data.data.timeframe_analysis.trends["1d"].volume}
                                size="small"
                                sx={{ 
                                  fontWeight: 500,
                                  bgcolor: response.data.data.timeframe_analysis.trends["1d"].volume === "Increasing" 
                                    ? 'rgba(6, 214, 160, 0.1)' 
                                    : response.data.data.timeframe_analysis.trends["1d"].volume === "Decreasing" 
                                      ? 'rgba(239, 71, 111, 0.1)' 
                                      : 'rgba(108, 99, 255, 0.1)',
                                  color: response.data.data.timeframe_analysis.trends["1d"].volume === "Increasing" 
                                    ? '#06d6a0' 
                                    : response.data.data.timeframe_analysis.trends["1d"].volume === "Decreasing" 
                                      ? '#ef476f' 
                                      : '#6c63ff',
                                  borderRadius: '4px',
                                  px: 1,
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        )}
                        
                        {/* 1-month timeframe */}
                        {response.data.data.timeframe_analysis.trends["1mo"] && (
                          <TableRow>
                            <TableCell sx={{ py: 1.5, px: 3 }}>
                              <Typography variant="body2" fontWeight="600">1mo</Typography>
                            </TableCell>
                            <TableCell sx={{ py: 1.5, px: 3 }}>
                              <Chip
                                label={`${response.data.data.timeframe_analysis.trends["1mo"].direction} (${response.data.data.timeframe_analysis.trends["1mo"].strength})`}
                                size="small"
                                sx={{ 
                                  fontWeight: 500,
                                  bgcolor: response.data.data.timeframe_analysis.trends["1mo"].direction === "Bullish" 
                                    ? 'rgba(6, 214, 160, 0.1)' 
                                    : response.data.data.timeframe_analysis.trends["1mo"].direction === "Bearish" 
                                      ? 'rgba(239, 71, 111, 0.1)' 
                                      : 'rgba(255, 209, 102, 0.1)',
                                  color: response.data.data.timeframe_analysis.trends["1mo"].direction === "Bullish" 
                                    ? '#06d6a0' 
                                    : response.data.data.timeframe_analysis.trends["1mo"].direction === "Bearish" 
                                      ? '#ef476f' 
                                      : '#ffd166',
                                  borderRadius: '4px',
                                  px: 1,
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ py: 1.5, px: 3 }}>
                              <Chip
                                label={response.data.data.timeframe_analysis.trends["1mo"].volume}
                                size="small"
                                sx={{ 
                                  fontWeight: 500,
                                  bgcolor: response.data.data.timeframe_analysis.trends["1mo"].volume === "Increasing" 
                                    ? 'rgba(6, 214, 160, 0.1)' 
                                    : response.data.data.timeframe_analysis.trends["1mo"].volume === "Decreasing" 
                                      ? 'rgba(239, 71, 111, 0.1)' 
                                      : 'rgba(108, 99, 255, 0.1)',
                                  color: response.data.data.timeframe_analysis.trends["1mo"].volume === "Increasing" 
                                    ? '#06d6a0' 
                                    : response.data.data.timeframe_analysis.trends["1mo"].volume === "Decreasing" 
                                      ? '#ef476f' 
                                      : '#6c63ff',
                                  borderRadius: '4px',
                                  px: 1,
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </Box>
                  
                  {/* Trading Strategy Cards */}
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>
                    Trading Strategies
                  </Typography>
                  <Grid container spacing={3} sx={{ mb: 4 }}>
                    {/* Intraday Strategy Card */}
                    <Grid item xs={12} md={4}>
                      <Card 
                        sx={{ 
                          borderRadius: 3, 
                          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
                          height: '100%',
                          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
                          },
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        <CardHeader
                          title={
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'error.main' }}>
                              Intraday Strategy
                            </Typography>
                          }
                          sx={{ 
                            bgcolor: 'rgba(239, 71, 111, 0.05)', 
                            pb: 1.5,
                            pt: 1.5,
                            borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
                          }}
                        />
                        <CardContent sx={{ 
                          p: 2.5, 
                          flex: 1, 
                          display: 'flex', 
                          flexDirection: 'column', 
                          justifyContent: 'space-between'
                        }}>
                          <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                            {response.data.data.timeframe_analysis.strategies.intraday}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  
                    {/* Weekly Strategy Card */}
                    <Grid item xs={12} md={4}>
                      <Card 
                        sx={{ 
                          borderRadius: 3, 
                          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
                          height: '100%',
                          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
                          },
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        <CardHeader
                          title={
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                              Weekly Strategy
                            </Typography>
                          }
                          sx={{ 
                            bgcolor: 'rgba(58, 80, 107, 0.05)', 
                            pb: 1.5,
                            pt: 1.5,
                            borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
                          }}
                        />
                        <CardContent sx={{ 
                          p: 2.5, 
                          flex: 1, 
                          display: 'flex', 
                          flexDirection: 'column', 
                          justifyContent: 'space-between'
                        }}>
                          <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                            {response.data.data.timeframe_analysis.strategies.weekly}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    {/* Monthly Strategy Card */}
                    <Grid item xs={12} md={4}>
                      <Card 
                        sx={{ 
                          borderRadius: 3, 
                          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
                          height: '100%',
                          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
                          },
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        <CardHeader
                          title={
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                              Monthly Strategy
                            </Typography>
                          }
                          sx={{ 
                            bgcolor: 'rgba(108, 99, 255, 0.05)', 
                            pb: 1.5,
                            pt: 1.5,
                            borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
                          }}
                        />
                        <CardContent sx={{ 
                          p: 2.5, 
                          flex: 1, 
                          display: 'flex', 
                          flexDirection: 'column', 
                          justifyContent: 'space-between'
                        }}>
                          <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                            {response.data.data.timeframe_analysis.strategies.monthly}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                  
                  {/* Key Levels & Pivot Points */}
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>
                        Key Price Levels
                      </Typography>
                      <Card sx={{ 
                        borderRadius: 3, 
                        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
                        backgroundImage: 'linear-gradient(to bottom, rgba(248, 250, 252, 0.8), rgba(248, 250, 252, 0.4))',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(0, 0, 0, 0.05)',
                        overflow: 'hidden'
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          <Grid container spacing={3}>
                            <Grid item xs={12}>
                              <Typography variant="subtitle2" gutterBottom sx={{ 
                                color: 'success.main', 
                                fontWeight: 700, 
                                display: 'flex', 
                                alignItems: 'center',
                                fontSize: '0.95rem',
                                mb: 2
                              }}>
                                <Box 
                                  component="span" 
                                  sx={{ 
                                    width: 12, 
                                    height: 12, 
                                    borderRadius: '50%', 
                                    bgcolor: 'success.main', 
                                    display: 'inline-block',
                                    mr: 1 
                                  }} 
                                />
                                Support Levels
                              </Typography>
                              <Box sx={{ 
                                display: 'flex', 
                                flexWrap: 'wrap', 
                                gap: 2, 
                                mb: 3.5, 
                                mt: 1.5,
                                justifyContent: 'flex-start' 
                              }}>
                                {response.data.data.timeframe_analysis.key_levels.strong_support.map((level, index) => (
                                  <Box 
                                    key={index}
                                    sx={{
                                      background: 'linear-gradient(to right bottom, rgba(6, 214, 160, 0.12), rgba(6, 214, 160, 0.05))',
                                      color: '#06d6a0',
                                      fontWeight: 700,
                                      fontSize: '1rem',
                                      borderRadius: '10px',
                                      padding: '10px 20px',
                                      border: '1px solid rgba(6, 214, 160, 0.3)',
                                      boxShadow: '0 2px 8px rgba(6, 214, 160, 0.12)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      minWidth: '100px',
                                      position: 'relative',
                                      overflow: 'hidden',
                                      transition: 'all 0.3s ease'
                                    }}
                                  >
                                    ${level}
                                  </Box>
                                ))}
                              </Box>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography variant="subtitle2" gutterBottom sx={{ 
                                color: 'error.main', 
                                fontWeight: 700, 
                                display: 'flex', 
                                alignItems: 'center',
                                fontSize: '0.95rem',
                                mb: 2
                              }}>
                                <Box 
                                  component="span" 
                                  sx={{ 
                                    width: 12, 
                                    height: 12, 
                                    borderRadius: '50%', 
                                    bgcolor: 'error.main', 
                                    display: 'inline-block',
                                    mr: 1 
                                  }} 
                                />
                                Resistance Levels
                              </Typography>
                              <Box sx={{ 
                                display: 'flex', 
                                flexWrap: 'wrap', 
                                gap: 2, 
                                mt: 1.5,
                                justifyContent: 'flex-start' 
                              }}>
                                {response.data.data.timeframe_analysis.key_levels.key_resistance.map((level, index) => (
                                  <Box 
                                    key={index}
                                    sx={{
                                      background: 'linear-gradient(to right bottom, rgba(239, 71, 111, 0.12), rgba(239, 71, 111, 0.05))',
                                      color: '#ef476f',
                                      fontWeight: 700,
                                      fontSize: '1rem',
                                      borderRadius: '10px',
                                      padding: '10px 20px',
                                      border: '1px solid rgba(239, 71, 111, 0.3)',
                                      boxShadow: '0 2px 8px rgba(239, 71, 111, 0.12)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      minWidth: '100px',
                                      position: 'relative',
                                      overflow: 'hidden',
                                      transition: 'all 0.3s ease'
                                    }}
                                  >
                                    ${level}
                                  </Box>
                                ))}
                              </Box>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>
                        Pivot Points
                      </Typography>
                      <Card sx={{ 
                        borderRadius: 3, 
                        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
                        height: '100%',
                        backgroundImage: 'linear-gradient(to bottom, rgba(248, 250, 252, 0.8), rgba(248, 250, 252, 0.4))',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(0, 0, 0, 0.05)',
                        overflow: 'hidden'
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
                            {/* Resistance Levels */}
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              padding: '12px 18px', 
                              background: 'linear-gradient(to right, rgba(239, 71, 111, 0.15), rgba(239, 71, 111, 0.05))', 
                              borderRadius: 2.5,
                              border: '1px solid rgba(239, 71, 111, 0.2)',
                              boxShadow: '0 2px 6px rgba(239, 71, 111, 0.08)',
                              transition: 'transform 0.2s ease'
                            }}>
                              <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>R3</Typography>
                              <Typography variant="body1" sx={{ color: 'error.main', fontWeight: 700, fontSize: '1rem' }}>
                                ${response.data.data.timeframe_analysis.pivot_points.r3}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center', 
                              padding: '12px 18px', 
                              background: 'linear-gradient(to right, rgba(239, 71, 111, 0.1), rgba(239, 71, 111, 0.02))', 
                              borderRadius: 2.5,
                              border: '1px solid rgba(239, 71, 111, 0.15)',
                              boxShadow: '0 2px 6px rgba(239, 71, 111, 0.06)',
                              transition: 'transform 0.2s ease'
                            }}>
                              <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>R2</Typography>
                              <Typography variant="body1" sx={{ color: 'error.main', fontWeight: 700, fontSize: '1rem' }}>
                                ${response.data.data.timeframe_analysis.pivot_points.r2}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center', 
                              padding: '12px 18px', 
                              background: 'linear-gradient(to right, rgba(239, 71, 111, 0.05), rgba(239, 71, 111, 0.01))', 
                              borderRadius: 2.5,
                              border: '1px solid rgba(239, 71, 111, 0.1)',
                              boxShadow: '0 2px 6px rgba(239, 71, 111, 0.04)',
                              transition: 'transform 0.2s ease'
                            }}>
                              <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>R1</Typography>
                              <Typography variant="body1" sx={{ color: 'error.main', fontWeight: 700, fontSize: '1rem' }}>
                                ${response.data.data.timeframe_analysis.pivot_points.r1}
                              </Typography>
                            </Box>
                            
                            {/* Pivot */}
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center', 
                              padding: '14px 18px', 
                              background: 'linear-gradient(to right, rgba(108, 99, 255, 0.15), rgba(108, 99, 255, 0.05))', 
                              borderRadius: 2.5,
                              border: '1px solid rgba(108, 99, 255, 0.3)',
                              boxShadow: '0 3px 10px rgba(108, 99, 255, 0.12)',
                              my: 1.2,
                              transform: 'scale(1.03)',
                              transition: 'transform 0.2s ease'
                            }}>
                              <Typography variant="body1" sx={{ fontWeight: 800, fontSize: '1rem' }}>PIVOT</Typography>
                              <Typography variant="body1" sx={{ color: 'secondary.main', fontWeight: 800, fontSize: '1.05rem' }}>
                                ${response.data.data.timeframe_analysis.pivot_points.pivot}
                              </Typography>
                            </Box>
                            
                            {/* Support Levels */}
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center', 
                              padding: '12px 18px', 
                              background: 'linear-gradient(to right, rgba(6, 214, 160, 0.05), rgba(6, 214, 160, 0.01))', 
                              borderRadius: 2.5,
                              border: '1px solid rgba(6, 214, 160, 0.1)',
                              boxShadow: '0 2px 6px rgba(6, 214, 160, 0.04)',
                              transition: 'transform 0.2s ease'
                            }}>
                              <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>S1</Typography>
                              <Typography variant="body1" sx={{ color: 'success.main', fontWeight: 700, fontSize: '1rem' }}>
                                ${response.data.data.timeframe_analysis.pivot_points.s1}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center', 
                              padding: '12px 18px', 
                              background: 'linear-gradient(to right, rgba(6, 214, 160, 0.1), rgba(6, 214, 160, 0.02))', 
                              borderRadius: 2.5,
                              border: '1px solid rgba(6, 214, 160, 0.15)',
                              boxShadow: '0 2px 6px rgba(6, 214, 160, 0.06)',
                              transition: 'transform 0.2s ease'
                            }}>
                              <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>S2</Typography>
                              <Typography variant="body1" sx={{ color: 'success.main', fontWeight: 700, fontSize: '1rem' }}>
                                ${response.data.data.timeframe_analysis.pivot_points.s2}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center', 
                              padding: '12px 18px', 
                              background: 'linear-gradient(to right, rgba(6, 214, 160, 0.15), rgba(6, 214, 160, 0.05))', 
                              borderRadius: 2.5,
                              border: '1px solid rgba(6, 214, 160, 0.2)',
                              boxShadow: '0 2px 6px rgba(6, 214, 160, 0.08)',
                              transition: 'transform 0.2s ease'
                            }}>
                              <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>S3</Typography>
                              <Typography variant="body1" sx={{ color: 'success.main', fontWeight: 700, fontSize: '1rem' }}>
                                ${response.data.data.timeframe_analysis.pivot_points.s3}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Paper>
              )}
            </>
          ) : (
            <Paper sx={{ p: 3 }}>
              <Typography>No data available. Try a different symbol or time period.</Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </div>
  );
};

export default TechnicalAnalysis; 