// Add API_BASE_URL at the top of the file
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5004/api';

/**
 * Format a number for display
 * @param {number} value - The number to format
 * @param {string} format - The format type: 'number', 'price', 'percent', 'volume'
 * @returns {string} - The formatted number as a string
 */
export const formatNumber = (value, format = 'number') => {
  if (value === undefined || value === null) return 'N/A';
  
  const numValue = Number(value);
  
  if (isNaN(numValue)) return 'N/A';
  
  switch(format) {
    case 'price':
      return numValue >= 1000 
        ? numValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : numValue.toFixed(2);
        
    case 'percent':
      return `${numValue >= 0 ? '+' : ''}${numValue.toFixed(2)}%`;
      
    case 'volume':
      if (numValue >= 1_000_000_000) {
        return `${(numValue / 1_000_000_000).toFixed(2)}B`;
      } else if (numValue >= 1_000_000) {
        return `${(numValue / 1_000_000).toFixed(2)}M`;
      } else if (numValue >= 1_000) {
        return `${(numValue / 1_000).toFixed(2)}K`;
      } else {
        return numValue.toFixed(0);
      }
      
    case 'change':
      return numValue >= 0 
        ? `+${numValue.toFixed(2)}`
        : numValue.toFixed(2);
        
    default:
      return numValue.toLocaleString('en-US');
  }
};

/**
 * Get CSS class for positive/negative values
 * @param {number} value - The number to check
 * @returns {string} - CSS class name
 */
export const getValueClass = (value) => {
  if (value === undefined || value === null || isNaN(Number(value))) return '';
  return Number(value) > 0 ? 'positive' : Number(value) < 0 ? 'negative' : '';
};

/**
 * Format a date string
 * @param {string|Date} date - The date to format
 * @param {string} format - The format type: 'full', 'date', 'time'
 * @returns {string} - The formatted date string
 */
export const formatDate = (date, format = 'full') => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (!(dateObj instanceof Date) || isNaN(dateObj)) return '';
  
  switch(format) {
    case 'date':
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      
    case 'time':
      return dateObj.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
    default:
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
  }
};

/**
 * Generate technical analysis using OpenAI API
 * @param {Object} technicalData - The technical indicator data
 * @param {string} ticker - The stock ticker symbol
 * @returns {Promise<string>} - The AI-generated analysis
 */
export const generateAIAnalysis = async (technicalData, ticker) => {
  try {
    if (!technicalData || technicalData.length === 0) {
      return "Insufficient data for analysis.";
    }
    
    const latest = technicalData[technicalData.length - 1];
    
    // Extract key technical indicators
    const indicators = {
      ticker,
      date: latest.date,
      close: parseFloat(latest.close),
      sma20: latest.sma20 !== "null" ? parseFloat(latest.sma20) : null,
      sma50: latest.sma50 !== "null" ? parseFloat(latest.sma50) : null,
      sma200: latest.sma200 !== "null" ? parseFloat(latest.sma200) : null,
      rsi: latest.rsi !== "null" ? parseFloat(latest.rsi) : null,
      macd: latest.macd !== "null" ? parseFloat(latest.macd) : null,
      signal: latest.signal !== "null" ? parseFloat(latest.signal) : null,
      histogram: latest.histogram !== "null" ? parseFloat(latest.histogram) : null,
      upper_band: latest.upper_band !== "null" ? parseFloat(latest.upper_band) : null,
      lower_band: latest.lower_band !== "null" ? parseFloat(latest.lower_band) : null
    };
    
    // Create a prompt for OpenAI
    const prompt = `
      You are a professional financial analyst specializing in technical analysis.
      Please provide a concise, expert analysis of the following technical indicators for ${ticker}:
      
      Date: ${indicators.date}
      Close Price: ${indicators.close}
      SMA 20: ${indicators.sma20 !== null ? indicators.sma20.toFixed(2) : 'N/A'}
      SMA 50: ${indicators.sma50 !== null ? indicators.sma50.toFixed(2) : 'N/A'}
      SMA 200: ${indicators.sma200 !== null ? indicators.sma200.toFixed(2) : 'N/A'}
      RSI: ${indicators.rsi !== null ? indicators.rsi.toFixed(2) : 'N/A'}
      MACD: ${indicators.macd !== null ? indicators.macd.toFixed(4) : 'N/A'}
      Signal Line: ${indicators.signal !== null ? indicators.signal.toFixed(4) : 'N/A'}
      MACD Histogram: ${indicators.histogram !== null ? indicators.histogram.toFixed(4) : 'N/A'}
      Bollinger Upper Band: ${indicators.upper_band !== null ? indicators.upper_band.toFixed(2) : 'N/A'}
      Bollinger Lower Band: ${indicators.lower_band !== null ? indicators.lower_band.toFixed(2) : 'N/A'}
      
      Provide a brief but comprehensive technical analysis focusing on:
      1. Price position relative to moving averages
      2. RSI interpretation
      3. MACD signal interpretation
      4. Overall market sentiment based on these indicators
      
      Keep your response under 4 sentences and be specific about the technical patterns.
    `;
    
    // Make API call to OpenAI
    const response = await fetch('http://localhost:5004/api/openai-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ prompt, indicators }),
      mode: 'cors',
      credentials: 'same-origin'
    });
    
    if (!response.ok) {
      console.error('Error from OpenAI API:', response.status, response.statusText);
      try {
        const errorData = await response.json();
        console.error('Error details:', errorData);
      } catch (e) {
        console.error('Could not parse error response');
      }
      return getFallbackAnalysis(technicalData); // Use fallback if API fails
    }
    
    const data = await response.json();
    return data.analysis;
  } catch (error) {
    console.error('Error generating AI analysis:', error);
    return getFallbackAnalysis(technicalData); // Use fallback if API fails
  }
};

/**
 * Generate a fallback analysis when API calls fail
 * @param {Object} data - The technical indicator data
 * @returns {string} - The fallback analysis
 */
const getFallbackAnalysis = (data) => {
  if (!data || data.length === 0) return "Insufficient data for analysis.";
  
  const latest = data[data.length - 1];
  const priceClose = parseFloat(latest.close);
  const sma20 = latest.sma20 !== "null" ? parseFloat(latest.sma20) : null;
  const sma50 = latest.sma50 !== "null" ? parseFloat(latest.sma50) : null;
  const rsi = latest.rsi !== "null" ? parseFloat(latest.rsi) : null;
  const macd = latest.macd !== "null" ? parseFloat(latest.macd) : null;
  const signal = latest.signal !== "null" ? parseFloat(latest.signal) : null;
  
  let analysis = [];
  
  // SMA Analysis
  if (sma20 !== null && sma50 !== null) {
    if (priceClose > sma20 && priceClose > sma50) {
      analysis.push("Price is above both 20 and 50-day SMAs, suggesting a bullish trend.");
    } else if (priceClose < sma20 && priceClose < sma50) {
      analysis.push("Price is below both 20 and 50-day SMAs, suggesting a bearish trend.");
    } else if (priceClose > sma20 && priceClose < sma50) {
      analysis.push("Price is above 20-day SMA but below 50-day SMA, suggesting a potential short-term bullish reversal.");
    } else {
      analysis.push("Price is below 20-day SMA but above 50-day SMA, suggesting a potential short-term bearish reversal.");
    }
  }
  
  // RSI Analysis
  if (rsi !== null) {
    if (rsi > 70) {
      analysis.push(`RSI is in overbought territory at ${rsi.toFixed(2)}, suggesting potential price reversal or pullback.`);
    } else if (rsi < 30) {
      analysis.push(`RSI is in oversold territory at ${rsi.toFixed(2)}, suggesting potential price reversal or bounce.`);
    } else if (rsi > 50) {
      analysis.push(`RSI at ${rsi.toFixed(2)} indicates positive momentum.`);
    } else {
      analysis.push(`RSI at ${rsi.toFixed(2)} indicates negative momentum.`);
    }
  }
  
  // MACD Analysis
  if (macd !== null && signal !== null) {
    if (macd > signal) {
      analysis.push("MACD is above signal line, suggesting bullish momentum.");
    } else {
      analysis.push("MACD is below signal line, suggesting bearish momentum.");
    }
  }
  
  return analysis.join(" ");
}; 