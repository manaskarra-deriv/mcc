import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Box, 
  Tab, 
  Tabs,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  Grid,
  Link,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import EventIcon from '@mui/icons-material/Event';
import PublicIcon from '@mui/icons-material/Public';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ViewListIcon from '@mui/icons-material/ViewList';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import WarningIcon from '@mui/icons-material/Warning';

// Styled components
const SearchContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(4)
}));

const SearchForm = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column'
  }
}));

const ResultsContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2)
}));

const CategoryContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3)
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
  margin: theme.spacing(3, 0)
}));

const CatalystHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(3)
}));

const CatalystSummary = styled(Typography)(({ theme }) => ({
  fontSize: '1.1rem',
  lineHeight: 1.8,
  marginBottom: theme.spacing(3),
  color: theme.palette.text.primary,
  whiteSpace: 'pre-line',
  '& strong': {
    fontWeight: 600
  }
}));

const TradingImplicationsCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  background: 'linear-gradient(to right, rgba(25, 118, 210, 0.05), rgba(25, 118, 210, 0.02))',
  borderLeft: '4px solid #1976d2'
}));

const EventStrategyCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  background: 'linear-gradient(to right, rgba(76, 175, 80, 0.05), rgba(76, 175, 80, 0.02))',
  borderLeft: '4px solid #4caf50'
}));

const GeopoliticalCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  background: 'linear-gradient(to right, rgba(156, 39, 176, 0.05), rgba(156, 39, 176, 0.02))',
  borderLeft: '4px solid #9c27b0'
}));

const SentimentCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  background: 'linear-gradient(to right, rgba(255, 152, 0, 0.05), rgba(255, 152, 0, 0.02))',
  borderLeft: '4px solid #ff9800'
}));

const TechnicalCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  background: 'linear-gradient(to right, rgba(233, 30, 99, 0.05), rgba(233, 30, 99, 0.02))',
  borderLeft: '4px solid #e91e63'
}));

const SourcesContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4)
}));

const SourceItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1)
}));

// Enhanced styled components for better readability
const ResearchSourcesContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5)
}));

const SourceLink = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  textDecoration: 'none',
  color: theme.palette.primary.main,
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    textDecoration: 'none'
  }
}));

const DetailedAnalysisText = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  lineHeight: 1.7,
  color: theme.palette.text.primary,
  whiteSpace: 'pre-line', // Preserve line breaks for better formatting
  marginBottom: theme.spacing(3)
}));

const TradingImplicationBox = styled(Box)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: theme.spacing(2),
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
}));

// Main component
const FundamentalCatalystsFixed = () => {
  const [symbol, setSymbol] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [catalystData, setCatalystData] = useState(null);
  // const [tabValue, setTabValue] = useState(0); // Comment out tabValue state
  
  // Add loading status for each category
  const [searchProgress, setSearchProgress] = useState({
    overnight: false,
    economic_events: false,
    geopolitical: false,
    analysis: false
  });

  const handleSearchWithSymbol = useCallback(async () => {
    if (!symbol) {
      setError('Please enter a symbol');
      return;
    }

    setLoading(true);
    setError(null);
    setCatalystData(null);
    
    // Reset search progress - remove sentiment
    setSearchProgress({
      overnight: true,  // Start with all true to show loading
      economic_events: true,
      geopolitical: true,
      analysis: true
    });

    try {
      // Use the fundamental catalyst summary endpoint
      const response = await axios.post('/api/fundamental-catalyst-summary', {
        symbol
      });

      // Set the data
      setCatalystData(response.data);
      
      // All loading complete - remove sentiment
      setSearchProgress({
        overnight: false,
        economic_events: false,
        geopolitical: false,
        analysis: false
      });
    } catch (err) {
      console.error("Error fetching catalyst data:", err);
      setError(`Unable to generate analysis for ${symbol}. Error: ${err.response?.data?.message || err.message}`);
      
      // Reset progress on error - remove sentiment
      setSearchProgress({
        overnight: false,
        economic_events: false,
        geopolitical: false,
        analysis: false
      });
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSearchWithSymbol();
    }
  }, [handleSearchWithSymbol]);

  // const handleTabChange = (event, newValue) => { // Comment out handleTabChange
  //   setTabValue(newValue);
  // };

  // Extract data from analysis text for trading implications
  const extractTradeDataFromAnalysis = useCallback(() => {
    if (!catalystData?.analysis) return {
      gapBehavior: "Recent gaps of this magnitude have filled within 3 sessions 65% of the time.",
      firstHourSetup: "Watch for rejection of pre-market lows as potential long entry.",
      dailyRange: "Historical volatility suggests a potential $3.51 intraday price range."
    };
    
    const analysis = catalystData.analysis;
    
    // Extract support and resistance from analysis
    const supportMatch = analysis.match(/[Ss]upport.{1,30}?(\$\d+\.\d+|\$\d+|\d+\.\d+)/);
    const support = supportMatch ? supportMatch[0] : null;
    
    const resistanceMatch = analysis.match(/[Rr]esistance.{1,30}?(\$\d+\.\d+|\$\d+|\d+\.\d+)/);
    const resistance = resistanceMatch ? resistanceMatch[0] : null;
    
    // Extract time-sensitive events
    const timeMatch = analysis.match(/(\d+:\d+\s*(?:AM|PM)\s*ET)/i);
    const timeEvent = timeMatch ? `Key event at ${timeMatch[0]}` : null;
    
    // Extract volatility mention
    const volatilityMatch = analysis.match(/[Vv]olatility.{1,50}?(\d+%|\d+\.\d+%|elevated|increasing)/);
    const volatility = volatilityMatch ? volatilityMatch[0] : null;
    
    // Format data for cards
    return {
      gapBehavior: support ? `Watch key support at ${support.match(/\$\d+\.\d+|\$\d+|\d+\.\d+/)[0]}` : 
                  "Recent gaps of this magnitude have filled within 3 sessions 65% of the time.",
      firstHourSetup: timeEvent || "Watch for price action at the open for directional bias",
      dailyRange: volatility ? 
                 `${volatility.charAt(0).toUpperCase() + volatility.slice(1)}` : 
                 "Historical volatility suggests potential for increased price movement"
    };
  }, [catalystData]);

  // Comment out getAnalysisByType function
  // const getAnalysisByType = useCallback((type) => {
  //   if (!catalystData?.analysis) return '';
  //   
  //   const analysis = catalystData.analysis;
  //   const paragraphs = analysis.split("\\n\\n");
  //   
  //   if (type === 'combined') {
  //     // For combined overnight and geopolitical analysis
  //     let overnightText = '';
  //     let geopoliticalText = '';
  //     
  //     // First paragraph typically contains price data and overnight action
  //     overnightText = paragraphs[0] || '';
  //     
  //     // Look for geopolitical keywords to identify relevant paragraph
  //     const geopoliticalKeywords = ['geopolitical', 'tensions', 'international', 'global', 'china', 'europe', 'middle east', 'iran', 'missile'];
  //     
  //     // Find the paragraph with geopolitical content that isn't the same as overnight
  //     for (let i = 1; i < paragraphs.length; i++) {
  //       const paragraph = paragraphs[i];
  //       if (geopoliticalKeywords.some(keyword => paragraph.toLowerCase().includes(keyword)) && 
  //           paragraph !== overnightText) {
  //         geopoliticalText = paragraph;
  //         break;
  //       }
  //     }
  //     
  //     // If we found distinct paragraphs, return them together
  //     if (overnightText && geopoliticalText && overnightText !== geopoliticalText) {
  //       return overnightText + '. ' + geopoliticalText;
  //     } 
  //     
  //     // If we only have overnight text, just return that to avoid duplication
  //     if (overnightText) {
  //       return overnightText;
  //     }
  //     
  //     // If we couldn't find paragraphs in the analysis, check search_results
  //     // const overnight = catalystData.search_results?.overnight || ''; // search_results no longer sent
  //     // const geopolitical = catalystData.search_results?.geopolitical || ''; // search_results no longer sent
  //     const overnight = ''; 
  //     const geopolitical = '';
  //     
  //     // Make sure we're not duplicating content from search results either
  //     if (overnight && geopolitical && !overnight.includes(geopolitical) && !geopolitical.includes(overnight)) {
  //       return overnight + '. ' + geopolitical;
  //     } else if (overnight) {
  //       return overnight;
  //     } else if (geopolitical) {
  //       return geopolitical;
  //     }
  //     
  //     // If we still have nothing, just return the first paragraph
  //     return paragraphs[0] || '';
  //   }
  //   
  //   // Original handling for specific types
  //   // First paragraph typically contains price data and overnight action
  //   if (type === 'overnight') {
  //     return paragraphs[0] || '';
  //   }
  //   
  //   // Second paragraph typically contains economic events
  //   if (type === 'economic') {
  //     return paragraphs[1] || '';
  //   }
  //   
  //   // Look for specific keywords to identify paragraph types
  //   const keywordMap = {
  //     'geopolitical': ['geopolitical', 'tensions', 'international', 'global', 'china', 'europe'],
  //     'sentiment': ['sentiment', 'bullish', 'bearish', 'analyst', 'institutional', 'flows'],
  //     'economic': ['economic', 'data', 'report', 'fed', 'inflation', 'employment']
  //   };
  //   
  //   // Search for paragraphs matching keywords
  //   const keywords = keywordMap[type] || [];
  //   for (const paragraph of paragraphs) {
  //     if (keywords.some(keyword => paragraph.toLowerCase().includes(keyword))) {
  //       return paragraph;
  //     }
  //   }
  //   
  //   // Fallback if we can't extract from analysis (search_results no longer sent from backend)
  //   return ''; // catalystData.search_results?.[type === 'economic' ? 'economic_events' : type] || '';
  // }, [catalystData]);

  // Comment out formatAnalysisText function
  // const formatAnalysisText = (text, type) => {
  //   if (!text) return null;
  //   
  //   // Define emojis for different event types
  //   const typeEmojis = {
  //     overnight: { 
  //       price: "💵", 
  //       volume: "📊", 
  //       gain: "📈", 
  //       loss: "📉", 
  //       time: "⏰", 
  //       report: "📝"
  //     },
  //     economic: { 
  //       report: "📢", 
  //       fed: "🏦", 
  //       data: "📊", 
  //       time: "⏰", 
  //       forecast: "🔮",
  //       impact: "💥"
  //     },
  //     geopolitical: { 
  //       tension: "🌍", 
  //       policy: "🏛️", 
  //       risk: "⚠️", 
  //       trade: "🚢",
  //       security: "🔒"
  //     },
  //     combined: {
  //       price: "💵",
  //       volume: "📊",
  //       gain: "📈",
  //       loss: "📉",
  //       time: "⏰",
  //       report: "📝",
  //       tension: "🌍",
  //       policy: "🏛️",
  //       risk: "⚠️",
  //       trade: "🚢",
  //       security: "🔒"
  //     }
  //   };
  //   
  //   // Keywords to match for emoji selection
  //   const emojiKeywords = {
  //     price: ["price", "trading", "$", "open", "close", "high", "low"],
  //     volume: ["volume", "shares", "million", "trading"],
  //     gain: ["gain", "rise", "increase", "higher", "jumped", "rally", "grew", "bull"],
  //     loss: ["loss", "fell", "decrease", "lower", "dropped", "decline", "bear"],
  //     time: ["am", "pm", "hour", "minute", "time", "morning", "afternoon", "session"],
  //     report: ["report", "announced", "stated", "released", "published"],
  //     forecast: ["forecast", "expect", "predict", "outlook", "projection", "estimate"],
  //     impact: ["impact", "affect", "influence", "significant", "major", "important"],
  //     tension: ["tension", "conflict", "war", "military", "dispute", "crisis"],
  //     policy: ["policy", "regulation", "law", "rule", "governance", "compliance"],
  //     risk: ["risk", "threat", "danger", "concern", "warning", "caution"],
  //     trade: ["trade", "tariff", "export", "import", "commerce", "shipping"],
  //     security: ["security", "defense", "protection", "safety", "breach"],
  //     fed: ["federal reserve", "fed", "central bank", "interest rate", "monetary"]
  //   };
  //   
  //   // Helper to find the appropriate emoji
  //   const findEmoji = (sentence, type) => {
  //     // Default emojis by type if no specific match is found
  //     const defaultEmoji = {
  //       overnight: "📈",
  //       economic: "📊",
  //       geopolitical: "🌍",
  //       combined: "📈"
  //     };
  //     
  //     // Check if any keywords match
  //     for (const [category, keywords] of Object.entries(emojiKeywords)) {
  //       if (keywords.some(keyword => sentence.toLowerCase().includes(keyword.toLowerCase()))) {
  //         return typeEmojis[type]?.[category] || defaultEmoji[type];
  //       }
  //     }
  //     
  //     return defaultEmoji[type];
  //   };
  //   
  //   // List of continuation words that indicate a sentence is continuing from the previous one
  //   const continuationWords = [
  //     "and", "but", "or", "yet", "so", "for", "nor",
  //     "because", "although", "though", "while", "as",
  //     "since", "unless", "until", "whereas", "however",
  //     "therefore", "thus", "hence", "consequently",
  //     "furthermore", "additionally", "moreover", "similarly",
  //     "likewise", "meanwhile", "nonetheless", "nevertheless",
  //     "instead", "accordingly", "subsequently", "concurrently",
  //     "specifically", "particularly", "especially", "namely"
  //   ];
  //   
  //   // Break the text into individual sentences and apply formatting
  //   // This improved version will detect sentence fragments that should be merged
  //   let sentences = text.split(". ").filter(s => s.trim());
  //   
  //   // Detect and merge continuation sentences
  //   let mergedSentences = [];
  //   let currentSentence = "";
  //   
  //   sentences.forEach((sentence, index) => {
  //     const trimmedSentence = sentence.trim();
  //     
  //     // Check if this sentence starts with a lowercase letter or a continuation word
  //     const startsWithLowercase = /^[a-z]/.test(trimmedSentence);
  //     const startsWithContinuationWord = continuationWords.some(word => 
  //       new RegExp(\`^${word}\\\\b\`, 'i').test(trimmedSentence)
  //     );
  //     
  //     // Check for continuation words anywhere in the sentence if it's short
  //     // This helps detect fragments like "Concurrently, the U.S."
  //     const containsContinuationWord = 
  //       trimmedSentence.length < 60 && 
  //       continuationWords.some(word => 
  //         new RegExp(\`\\\\b${word}\\\\b\`, 'i').test(trimmedSentence) &&
  //         !new RegExp(\`^${word}\\\\b\`, 'i').test(trimmedSentence) // Not at start
  //       );
  //     
  //     if ((startsWithLowercase || startsWithContinuationWord || containsContinuationWord) && currentSentence && index > 0) {
  //       // This is a continuation - append to the current sentence
  //       currentSentence += ". " + trimmedSentence;
  //     } else {
  //       // This is a new sentence
  //       if (currentSentence) {
  //         mergedSentences.push(currentSentence);
  //       }
  //       currentSentence = trimmedSentence;
  //     }
  //     
  //     // Handle the last sentence
  //     if (index === sentences.length - 1 && currentSentence) {
  //       mergedSentences.push(currentSentence);
  //     }
  //   });
  //   
  //   // If we didn't merge anything, use the original sentences
  //   if (mergedSentences.length === 0 && sentences.length > 0) {
  //     mergedSentences = sentences;
  //   }
  //   
  //   return mergedSentences.map((sentence, idx) => {
  //     if (!sentence.trim()) return null;
  //     
  //     // Apply formatting based on content
  //     let formattedSentence = sentence.trim();
  //     
  //     // Add bold to key numbers and dollar amounts
  //     formattedSentence = formattedSentence.replace(/(\\$\\d+\\.?\\d*|\\d+\\.?\\d*%|\\d+\\.\\d+|\\d+ million|\\d+ billion)/g, '<strong>$1</strong>');
  //     
  //     // Italicize important terms
  //     formattedSentence = formattedSentence.replace(/(key|significant|important|critical|major|primary|essential)/gi, '<em>$1</em>');
  //     
  //     // Add emphasis to time references
  //     formattedSentence = formattedSentence.replace(/(\\d+:\\d+\\s*(?:AM|PM)\\s*ET)/gi, '<strong>$1</strong>');
  //     
  //     // Find appropriate emoji
  //     const emoji = findEmoji(formattedSentence, type);
  //     
  //     // Return formatted content
  //     return (
  //       <Box 
  //         key={idx} 
  //         sx={{ 
  //           display: 'flex', 
  //           alignItems: 'flex-start',
  //           mb: 1,
  //           py: 1,
  //           borderBottom: '1px solid rgba(0,0,0,0.05)' 
  //         }}
  //       >
  //         <Typography 
  //           component="span" 
  //           sx={{ 
  //             mr: 1.5, 
  //             fontSize: '1.2rem',
  //             lineHeight: 1.6,
  //             mt: '2px' 
  //           }}
  //         >
  //           {emoji}
  //         </Typography>
  //         <Typography 
  //           variant="body1" 
  //           component="div" 
  //           sx={{ 
  //             pl: 0.5, 
  //             borderRadius: 1,
  //             fontSize: '1rem',
  //             lineHeight: 1.6,
  //             '& strong': {
  //               fontWeight: 600,
  //               color: 'primary.main'
  //             },
  //             '& em': {
  //               fontStyle: 'italic',
  //               color: 'text.secondary'
  //             }
  //           }}
  //           dangerouslySetInnerHTML={{ __html: formattedSentence + (idx < mergedSentences.length - 1 && formattedSentence.length > 0 ? "." : "") }}
  //         />
  //       </Box>
  //     );
  //   });
  // };

  return (
    <Paper sx={{ p: 3, maxWidth: '100%', overflow: 'hidden' }}>
      <Typography variant="h5" gutterBottom>
        FUNDAMENTAL CATALYSTS
      </Typography>
      
      <SearchContainer>
        <SearchForm>
          <TextField
            label="Enter Symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            placeholder="e.g., AAPL, TSLA, MSFT"
            variant="outlined"
            fullWidth
          />
          <Button
            variant="contained"
            onClick={handleSearchWithSymbol}
            disabled={loading || !symbol}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </Button>
        </SearchForm>
      </SearchContainer>
      
      {error && (
        <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
      )}
      
      {/* Loading indicator showing progress for each category - remove sentiment */}
      {loading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', my: 8 }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Analyzing {symbol}...
          </Typography>
          
          <Box sx={{ width: '80%', maxWidth: '500px', mt: 3 }}>
            <Grid container spacing={1}>
              {Object.entries(searchProgress).map(([category, inProgress]) => (
                <Grid item xs={6} key={category}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CircularProgress 
                      size={16} 
                      thickness={6} 
                      sx={{ 
                        mr: 1,
                        opacity: inProgress ? 1 : 0.3,
                        color: inProgress ? 'primary.main' : 'grey.400'
                      }} 
                    />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        opacity: inProgress ? 1 : 0.6,
                        fontWeight: inProgress ? 'medium' : 'normal'
                      }}
                    >
                      {category.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      )}

      {catalystData && (
        <ResultsContainer>
          <CatalystHeader>
            <Typography variant="h5" fontWeight="500">
              {catalystData.symbol}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {catalystData.date}
            </Typography>
          </CatalystHeader>
          
          {/* Main Analysis */}
          <CatalystSummary variant="body1">
            {catalystData.analysis}
          </CatalystSummary>
          
          <StyledDivider />
          
          {/* Research Sources */}
          <Typography variant="h6" gutterBottom fontWeight="500">
            Research Sources
          </Typography>
          
          <Grid container spacing={2}>
            {catalystData.news_sources?.map((source, index) => (
              <Grid item xs={12} md={4} key={index}>
                <SourceLink 
                  href={source.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  sx={{ 
                    height: '100%', 
                    display: 'block',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: '0 0 0 1px rgba(25, 118, 210, 0.2)'
                    }
                  }}
                >
                  <Box sx={{ p: 2 }}>
                    <Typography 
                      variant="body2" 
                      component="span" 
                      sx={{ 
                        backgroundColor: 'action.selected', 
                        px: 1, 
                        py: 0.5, 
                        borderRadius: 1,
                        mr: 2,
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        display: 'inline-block',
                        mb: 1
                      }}
                    >
                      {source.source}
                    </Typography>
                    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                      {source.title}
                      <OpenInNewIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />
                    </Typography>
                  </Box>
                </SourceLink>
              </Grid>
            ))}
          </Grid>
          
          <StyledDivider />
          
          {/* Detailed Analysis - Section to be removed/commented out */}
          {/*
          <Typography variant="h6" gutterBottom fontWeight="500">
            Detailed Analysis
          </Typography>
          */}
          
          {/* Tabs for different analysis categories - Merge Overnight and Geopolitical tabs */}
          {/*
          <Box sx={{ mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="analysis categories"
            >
              <Tab label="Geopolitical & Overnight" icon={<AccessTimeIcon />} iconPosition="start" />
              <Tab label="Economic Events" icon={<EventIcon />} iconPosition="start" />
            </Tabs>
          </Box>
          */}
          
          {/* Geopolitical & Overnight tab panel with improved formatting */}
          {/*
          {tabValue === 0 && (
            <CategoryContainer>
              <Box sx={{ my: 2 }}>
                {formatAnalysisText(getAnalysisByType('combined'), 'combined')}
              </Box>
            </CategoryContainer>
          )}
          */}
          
          {/* Economic Events tab panel with improved formatting */}
          {/*
          {tabValue === 1 && (
            <CategoryContainer>
              <Box sx={{ my: 2 }}>
                {formatAnalysisText(getAnalysisByType('economic'), 'economic')}
              </Box>
            </CategoryContainer>
          )}
          */}
        </ResultsContainer>
      )}
      
      {!loading && !catalystData && !error && (
        <Paper sx={{ p: 4, borderRadius: '8px', mt: 3 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            What are Fundamental Catalysts?
          </Typography>
          <Typography variant="body1" paragraph>
            Fundamental catalysts are events or developments that can significantly impact a stock's price:
          </Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', borderLeft: '4px solid #f44336' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccessTimeIcon sx={{ mr: 1, color: '#f44336' }} />
                    <Typography variant="h6" fontWeight="bold">Overnight Developments</Typography>
                  </Box>
                  <Typography variant="body2">
                    Price movements and news that occurred after market close, which could impact the stock when trading resumes.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', borderLeft: '4px solid #2196f3' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EventIcon sx={{ mr: 1, color: '#2196f3' }} />
                    <Typography variant="h6" fontWeight="bold">Economic Events</Typography>
                  </Box>
                  <Typography variant="body2">
                    Scheduled economic data releases, Federal Reserve announcements, and other macroeconomic events.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', borderLeft: '4px solid #ff9800' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PublicIcon sx={{ mr: 1, color: '#ff9800' }} />
                    <Typography variant="h6" fontWeight="bold">Geopolitical Factors</Typography>
                  </Box>
                  <Typography variant="body2">
                    International developments, trade policies, and regulatory changes that could affect business operations.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', borderLeft: '4px solid #4caf50' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <SentimentSatisfiedAltIcon sx={{ mr: 1, color: '#4caf50' }} />
                    <Typography variant="h6" fontWeight="bold">Market Sentiment</Typography>
                  </Box>
                  <Typography variant="body2">
                    Investor perception, analyst ratings, and institutional positioning that reflects market expectations.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <Alert severity="info" variant="outlined" sx={{ mt: 2 }}>
            Enter a stock symbol and click "Analyze" to generate a comprehensive fundamental catalyst report.
          </Alert>
        </Paper>
      )}
    </Paper>
  );
};

export default FundamentalCatalystsFixed; 