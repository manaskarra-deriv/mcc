import React, { useState, useRef, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { 
  Box, 
  Fab, 
  Paper, 
  Typography, 
  TextField, 
  IconButton, 
  CircularProgress,
  Avatar,
  Collapse,
  Tooltip,
  Zoom
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import EventNoteIcon from '@mui/icons-material/EventNote';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../utils/api-config';

// Styled components
const CopilotButton = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: 24,
  right: 24,
  zIndex: 1299,
  backgroundImage: 'linear-gradient(45deg, #3a506b 30%, #6c63ff 90%)',
  color: 'white',
  boxShadow: '0 6px 20px rgba(108, 99, 255, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 25px rgba(108, 99, 255, 0.4)',
  },
}));

const ChatWindow = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  bottom: 90,
  right: 24,
  width: 360,
  height: 520,
  display: 'flex',
  flexDirection: 'column',
  zIndex: 1298,
  overflow: 'hidden',
  borderRadius: 16,
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  resize: 'both',
  overflow: 'auto',
  minWidth: 300,
  minHeight: 400,
  maxWidth: 800,
  maxHeight: 800,
}));

const ChatHeader = styled(Box)(({ theme }) => ({
  backgroundImage: 'linear-gradient(45deg, #3a506b 30%, #6c63ff 90%)',
  color: 'white',
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const ChatMessages = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  backgroundColor: 'rgba(0, 0, 0, 0.02)',
}));

const ChatInput = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  borderTop: '1px solid rgba(0, 0, 0, 0.06)',
  backgroundColor: theme.palette.background.paper,
}));

const UserMessage = styled(Box)(({ theme }) => ({
  alignSelf: 'flex-end',
  maxWidth: '80%',
  padding: theme.spacing(1.5, 2),
  borderRadius: '18px 18px 4px 18px',
  backgroundColor: theme.palette.secondary.main,
  color: 'white',
  wordBreak: 'break-word',
  position: 'relative',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 0,
    height: 0,
  }
}));

const BotMessage = styled(Box)(({ theme }) => ({
  alignSelf: 'flex-start',
  maxWidth: '80%',
  padding: theme.spacing(1.5, 2),
  borderRadius: '18px 18px 18px 4px',
  backgroundColor: 'white',
  color: theme.palette.text.primary,
  wordBreak: 'break-word',
  position: 'relative',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 0,
    height: 0,
  }
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.main,
  width: 28,
  height: 28,
  marginRight: theme.spacing(1),
}));

const MessageMetadata = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(0.5),
}));

const MessageActionChip = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: theme.spacing(0.5, 1),
  marginRight: theme.spacing(1),
  marginTop: theme.spacing(1),
  backgroundColor: 'rgba(108, 99, 255, 0.1)',
  borderRadius: 12,
  fontSize: '0.75rem',
  color: theme.palette.secondary.main,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(108, 99, 255, 0.2)',
  }
}));

// Add a new styled component for the resize handle
const ResizeHandle = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: 10,
  height: 10,
  cursor: 'nwse-resize',
  zIndex: 1300,
}));

const Copilot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Initial greeting message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'greeting',
          type: 'bot',
          text: 'Hi there! I\'m your trading assistant. Ask me about any market, asset, or trading idea. For example, try "Is it a good time to trade gold?" or "Tell me about BTC/USD"',
          timestamp: new Date(),
        },
      ]);
    }
  }, [messages]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when chat window opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 300);
    }
  }, [isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = async () => {
    if (input.trim() === '' || isLoading) return;

    // Add user message
    const userMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Detect environment
      const isLocalhost = 
        window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1';
      
      // Use the appropriate API URL based on the environment
      const apiUrl = isLocalhost
        ? 'http://localhost:5004/api/copilot'
        : `${API_BASE_URL}/copilot`;
        
      // Send to API with the appropriate URL
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: input }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        // Add bot response
        const botMessage = {
          id: `bot-${Date.now()}`,
          type: 'bot',
          text: data.response,
          timestamp: new Date(),
          metadata: {
            has_technical: data.has_technical,
            has_fundamental: data.has_fundamental,
            has_market_summary: data.has_market_summary,
            query_info: data.query_info,
          },
        };

        setMessages((prev) => [...prev, botMessage]);
      } else {
        // Add error message
        const errorMessage = {
          id: `error-${Date.now()}`,
          type: 'bot',
          text: `Sorry, I couldn't process your request. ${data.message || 'Please try again later.'}`,
          timestamp: new Date(),
          isError: true,
        };

        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      const errorMessage = {
        id: `error-${Date.now()}`,
        type: 'bot',
        text: 'Sorry, I encountered an error while processing your request. Please try again later.',
        timestamp: new Date(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToSection = (section, symbol = null) => {
    switch (section) {
      case 'technical':
        navigate('/technical-analysis' + (symbol ? `?symbol=${symbol}` : ''));
        break;
      case 'fundamental':
        navigate('/fundamental-catalysts' + (symbol ? `?symbol=${symbol}` : ''));
        break;
      case 'market':
        navigate('/market-summary');
        break;
      default:
        break;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <Tooltip title="Trading Copilot" placement="left" arrow>
        <CopilotButton 
          color="primary" 
          aria-label="copilot" 
          onClick={toggleChat}
        >
          {isOpen ? <CloseIcon /> : <ChatIcon />}
        </CopilotButton>
      </Tooltip>

      <Zoom in={isOpen}>
        <ChatWindow elevation={6}>
          <ChatHeader>
            <Box display="flex" alignItems="center">
              <AutoAwesomeIcon sx={{ mr: 1 }} />
              <Typography variant="subtitle1" fontWeight={600}>
                Trading Copilot
              </Typography>
            </Box>
            <IconButton size="small" onClick={toggleChat} sx={{ color: 'white' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </ChatHeader>

          <ChatMessages>
            {messages.map((message) => (
              <Box key={message.id} sx={{ display: 'flex', flexDirection: 'column' }}>
                {message.type === 'user' ? (
                  <UserMessage>
                    <Typography variant="body2">{message.text}</Typography>
                  </UserMessage>
                ) : (
                  <>
                    <MessageMetadata>
                      <StyledAvatar>
                        <AutoAwesomeIcon fontSize="small" />
                      </StyledAvatar>
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(message.timestamp)}
                      </Typography>
                    </MessageMetadata>
                    <BotMessage sx={{ 
                      backgroundColor: message.isError ? 'rgba(239, 71, 111, 0.1)' : 'white',
                      borderLeft: message.isError ? '3px solid #ef476f' : 'none'
                    }}>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                        {message.text}
                      </Typography>

                      {/* Always show Technical Analysis and Fundamental Data buttons for non-error messages */}
                      {!message.isError && message.metadata && message.metadata.query_info && message.metadata.query_info.is_specific_asset && (
                        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {/* Always show Technical Analysis */}
                          <Tooltip title="View Technical Analysis" arrow>
                            <MessageActionChip 
                              onClick={() => navigateToSection('technical', message.metadata.query_info?.symbol)}
                            >
                              <ShowChartIcon fontSize="small" sx={{ mr: 0.5 }} />
                              <Typography variant="caption">Technical Analysis</Typography>
                            </MessageActionChip>
                          </Tooltip>

                          {/* Always show Fundamental Data */}
                          <Tooltip title="View Fundamental Catalysts" arrow>
                            <MessageActionChip 
                              onClick={() => navigateToSection('fundamental', message.metadata.query_info?.symbol)}
                            >
                              <EventNoteIcon fontSize="small" sx={{ mr: 0.5 }} />
                              <Typography variant="caption">Fundamental Data</Typography>
                            </MessageActionChip>
                          </Tooltip>
                        </Box>
                      )}
                    </BotMessage>
                  </>
                )}
              </Box>
            ))}
            {isLoading && (
              <Box sx={{ display: 'flex', alignItems: 'center', alignSelf: 'flex-start', mt: 2 }}>
                <CircularProgress size={20} thickness={5} sx={{ mr: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Analyzing markets...
                </Typography>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </ChatMessages>

          <ChatInput>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Ask me about any market or asset..."
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              inputRef={inputRef}
              size="small"
              InputProps={{
                sx: { borderRadius: 3 }
              }}
              disabled={isLoading}
            />
            <IconButton 
              color="secondary" 
              onClick={sendMessage} 
              disabled={input.trim() === '' || isLoading}
              sx={{ ml: 1 }}
            >
              {isLoading ? <CircularProgress size={24} thickness={5} /> : <SendIcon />}
            </IconButton>
          </ChatInput>
        </ChatWindow>
      </Zoom>
    </>
  );
};

export default Copilot; 