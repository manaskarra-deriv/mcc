import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

// Layout component
import Layout from './components/Layout';

// Copilot component
import Copilot from './components/Copilot';

// Page components
import Dashboard from './pages/Dashboard';
import MarketSummary from './pages/MarketSummary';
import TechnicalAnalysis from './pages/TechnicalAnalysis';
import CustomDashboard from './pages/CustomDashboard';
import FundamentalCatalysts from './pages/FundamentalCatalysts';

// Create a theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3a506b',
      light: '#5d7599',
      dark: '#1c2e4a',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#6c63ff',
      light: '#9f99ff',
      dark: '#4d45cc',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef476f',
      light: '#ff7597',
      dark: '#ba1a49',
    },
    warning: {
      main: '#ffd166',
      light: '#ffff98',
      dark: '#c8a136',
    },
    info: {
      main: '#118ab2',
      light: '#5cbae5',
      dark: '#005e82',
    },
    success: {
      main: '#06d6a0',
      light: '#6fffd1',
      dark: '#00a371',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#2c3e50',
      secondary: '#64748b',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.01562em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      letterSpacing: '-0.00833em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '0em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '0.00735em',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      letterSpacing: '0em',
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      letterSpacing: '0.0075em',
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      letterSpacing: '0.00938em',
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      letterSpacing: '0.00714em',
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      letterSpacing: '0.00938em',
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      letterSpacing: '0.01071em',
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      letterSpacing: '0.02857em',
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#888',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#555',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.09)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
          transition: 'box-shadow 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 5px 20px rgba(0, 0, 0, 0.08)',
          },
        },
        elevation1: {
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
        },
        elevation2: {
          boxShadow: '0 3px 15px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '8px 24px',
          textTransform: 'none',
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          fontWeight: 600,
        },
        contained: {
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            transform: 'translateY(-2px)',
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
            transform: 'translateY(-2px)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #3a506b 30%, #5d7599 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #1c2e4a 30%, #3a506b 90%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(45deg, #6c63ff 30%, #9f99ff 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #4d45cc 30%, #6c63ff 90%)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.1)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.8), rgba(255,255,255,0.8)), linear-gradient(to bottom, rgba(58, 80, 107, 0.05), rgba(108, 99, 255, 0.05))',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          transition: 'background-color 0.2s ease',
          '&.Mui-selected': {
            backgroundColor: 'rgba(58, 80, 107, 0.08)',
            '&:hover': {
              backgroundColor: 'rgba(58, 80, 107, 0.12)',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(0, 0, 0, 0.06)',
        },
        head: {
          fontWeight: 600,
          backgroundColor: 'rgba(0, 0, 0, 0.02)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/market-summary" element={<MarketSummary />} />
            <Route path="/technical-analysis" element={<TechnicalAnalysis />} />
            <Route path="/custom-dashboard" element={<CustomDashboard />} />
            <Route path="/fundamental-catalysts" element={<FundamentalCatalysts />} />
          </Routes>
        </Layout>
        <Copilot />
      </Box>
    </ThemeProvider>
  );
}

export default App; 