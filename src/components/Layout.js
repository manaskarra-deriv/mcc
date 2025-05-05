import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import SettingsIcon from '@mui/icons-material/Settings';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SearchIcon from '@mui/icons-material/Search';
import EventNoteIcon from '@mui/icons-material/EventNote';
import Button from '@mui/material/Button';
import DragHandleIcon from '@mui/icons-material/DragHandle';

const MIN_DRAWER_WIDTH = 280;
const MAX_DRAWER_WIDTH = 400;

const openedMixin = (theme, width) => ({
  width: width,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
  boxShadow: '0 10px 30px -12px rgba(0, 0, 0, 0.1)',
  borderRight: 'none',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
  boxShadow: '0 10px 30px -12px rgba(0, 0, 0, 0.1)',
  borderRight: 'none',
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  justifyContent: 'space-between',
  height: '64px',
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open' && prop !== 'drawerWidth',
})(({ theme, open, drawerWidth }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  backgroundImage: 'linear-gradient(to right, #3a506b, #5d7599)',
  boxShadow: '0 4px 20px 0px rgba(0, 0, 0, 0.1)',
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { 
  shouldForwardProp: (prop) => prop !== 'open' && prop !== 'drawerWidth'
})(
  ({ theme, open, drawerWidth }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    '& .MuiPaper-root': {
      borderRadius: 0,
      '&:hover': {
        boxShadow: 'none',
      },
    },
    ...(open && {
      ...openedMixin(theme, drawerWidth),
      '& .MuiDrawer-paper': openedMixin(theme, drawerWidth),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

// Resizer handle component
const DrawerResizeHandle = styled('div')(({ theme }) => ({
  position: 'absolute',
  right: 0,
  top: 0,
  bottom: 0,
  width: '8px',
  cursor: 'ew-resize',
  backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0), rgba(0,0,0,0.05))',
  zIndex: theme.zIndex.drawer + 2,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&:hover': {
    backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0), rgba(108, 99, 255, 0.15))',
  },
  '&:active': {
    backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0), rgba(108, 99, 255, 0.25))',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    height: '30px',
    width: '2px',
    backgroundColor: 'rgba(108, 99, 255, 0.3)',
    borderRadius: '1px',
  }
}));

// Custom styled list item button
const StyledListItemButton = styled(ListItemButton)(({ theme, selected }) => ({
  margin: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  transition: 'all 0.2s ease-in-out',
  width: 'calc(100% - 16px)',
  '&.Mui-selected': {
    backgroundColor: 'rgba(108, 99, 255, 0.08)',
    '&:hover': {
      backgroundColor: 'rgba(108, 99, 255, 0.12)',
    },
    '& .MuiListItemIcon-root': {
      color: theme.palette.secondary.main,
    },
    '& .MuiListItemText-primary': {
      fontWeight: 600,
      color: theme.palette.secondary.main,
    },
  },
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    transform: 'translateX(4px)',
  },
}));

// Styled ListItemText for consistent text truncation
const StyledListItemText = styled(ListItemText)(({ theme }) => ({
  '& .MuiTypography-root': {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  }
}));

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const [marketsOpen, setMarketsOpen] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState(MIN_DRAWER_WIDTH);
  
  const resizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(drawerWidth);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleMarketsClick = () => {
    setMarketsOpen(!marketsOpen);
  };

  const handleAnalysisClick = () => {
    setAnalysisOpen(!analysisOpen);
  };

  // Function to check if a route is active
  const isRouteActive = (path) => {
    return location.pathname === path;
  };

  // Start resize handler
  const handleResizeStart = useCallback((e) => {
    resizingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = drawerWidth;
    document.body.style.cursor = 'ew-resize';
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
    e.preventDefault();
  }, [drawerWidth]);

  // Move (drag) resize handler
  const handleResizeMove = useCallback((e) => {
    if (!resizingRef.current) return;
    
    const newWidth = startWidthRef.current + (e.clientX - startXRef.current);
    
    // Keep within min and max bounds
    if (newWidth >= MIN_DRAWER_WIDTH && newWidth <= MAX_DRAWER_WIDTH) {
      setDrawerWidth(newWidth);
    }
  }, []);

  // End resize handler
  const handleResizeEnd = useCallback(() => {
    resizingRef.current = false;
    document.body.style.cursor = '';
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  }, [handleResizeMove]);

  // Clean up event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [handleResizeMove, handleResizeEnd]);

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" open={open} drawerWidth={drawerWidth}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{
                marginRight: 2,
                ...(open && { display: 'none' }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, letterSpacing: '-0.5px' }}>
              Market Command Center
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton color="inherit" size="small" sx={{ ml: 1 }}>
              <SearchIcon />
            </IconButton>
            <IconButton color="inherit" size="small" sx={{ ml: 1 }}>
              <SettingsIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open} drawerWidth={drawerWidth}>
        <DrawerHeader>
          <Box sx={{ display: 'flex', alignItems: 'center', pl: 2 }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 700, 
              background: 'linear-gradient(to right, #3a506b, #6c63ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: open ? 'block' : 'none'
            }}>
              MCC
            </Typography>
          </Box>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>
        <Divider sx={{ mb: 1 }} />
        <List component="nav" sx={{ px: 1 }}>
          <Box sx={{ mb: 1 }}>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ 
                ml: 2, 
                fontWeight: 600, 
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                opacity: open ? 1 : 0,
              }}
            >
              Main
            </Typography>
          </Box>
          <ListItem disablePadding sx={{ display: 'block' }}>
            <StyledListItemButton
              selected={isRouteActive('/')}
              onClick={() => navigate('/')}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              >
                <DashboardIcon />
              </ListItemIcon>
              <StyledListItemText primary="Dashboard" sx={{ opacity: open ? 1 : 0 }} />
            </StyledListItemButton>
          </ListItem>

          <ListItem disablePadding sx={{ display: 'block' }}>
            <StyledListItemButton
              selected={isRouteActive('/market-summary')}
              onClick={() => navigate('/market-summary')}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              >
                <BarChartIcon />
              </ListItemIcon>
              <StyledListItemText primary="Market Summary" sx={{ opacity: open ? 1 : 0 }} />
            </StyledListItemButton>
          </ListItem>

          <ListItem disablePadding sx={{ display: 'block' }}>
            <StyledListItemButton
              selected={isRouteActive('/technical-analysis')}
              onClick={() => navigate('/technical-analysis')}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              >
                <ShowChartIcon />
              </ListItemIcon>
              <StyledListItemText primary="Technical Analysis" sx={{ opacity: open ? 1 : 0 }} />
            </StyledListItemButton>
          </ListItem>

          <ListItem disablePadding sx={{ display: 'block' }}>
            <StyledListItemButton
              selected={isRouteActive('/fundamental-catalysts')}
              onClick={() => navigate('/fundamental-catalysts')}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              >
                <EventNoteIcon />
              </ListItemIcon>
              <StyledListItemText primary="Fundamental Catalysts" sx={{ opacity: open ? 1 : 0 }} />
            </StyledListItemButton>
          </ListItem>

          <ListItem disablePadding sx={{ display: 'block' }}>
            <StyledListItemButton
              selected={isRouteActive('/custom-dashboard')}
              onClick={() => navigate('/custom-dashboard')}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              >
                <SettingsIcon />
              </ListItemIcon>
              <StyledListItemText 
                primary="Customizable Dashboard" 
                sx={{ 
                  opacity: open ? 1 : 0,
                }} 
              />
            </StyledListItemButton>
          </ListItem>
        </List>
        <Divider sx={{ my: 1 }} />
        <List sx={{ px: 1 }}>
          <Box sx={{ mb: 1 }}>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ 
                ml: 2, 
                fontWeight: 600, 
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                opacity: open ? 1 : 0,
              }}
            >
              Categories
            </Typography>
          </Box>
          <ListItem disablePadding sx={{ display: 'block' }}>
            <StyledListItemButton
              onClick={handleMarketsClick}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              >
                <AttachMoneyIcon />
              </ListItemIcon>
              <StyledListItemText primary="Markets" sx={{ opacity: open ? 1 : 0 }} />
              {open && (marketsOpen ? <ExpandLess /> : <ExpandMore />)}
            </StyledListItemButton>
          </ListItem>
          
          <Collapse in={marketsOpen && open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ pl: 2, pr: 1 }}>
              <StyledListItemButton sx={{ pl: 3 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <ShowChartIcon fontSize="small" />
                </ListItemIcon>
                <StyledListItemText primary="Equities" primaryTypographyProps={{ fontSize: '0.875rem' }} />
              </StyledListItemButton>
              <StyledListItemButton sx={{ pl: 3 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CurrencyExchangeIcon fontSize="small" />
                </ListItemIcon>
                <StyledListItemText primary="Forex" primaryTypographyProps={{ fontSize: '0.875rem' }} />
              </StyledListItemButton>
              <StyledListItemButton sx={{ pl: 3 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CurrencyBitcoinIcon fontSize="small" />
                </ListItemIcon>
                <StyledListItemText primary="Cryptocurrencies" primaryTypographyProps={{ fontSize: '0.875rem' }} />
              </StyledListItemButton>
              <StyledListItemButton sx={{ pl: 3 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <ShoppingCartIcon fontSize="small" />
                </ListItemIcon>
                <StyledListItemText primary="Commodities" primaryTypographyProps={{ fontSize: '0.875rem' }} />
              </StyledListItemButton>
            </List>
          </Collapse>
        </List>
        <Divider sx={{ my: 1 }} />
        <List sx={{ px: 1 }}>
          <Box sx={{ mb: 1 }}>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ 
                ml: 2, 
                fontWeight: 600, 
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                opacity: open ? 1 : 0,
              }}
            >
              Tools
            </Typography>
          </Box>
          <ListItem disablePadding sx={{ display: 'block' }}>
            <StyledListItemButton
              onClick={handleAnalysisClick}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              >
                <BarChartIcon />
              </ListItemIcon>
              <StyledListItemText primary="Analysis" sx={{ opacity: open ? 1 : 0 }} />
              {open && (analysisOpen ? <ExpandLess /> : <ExpandMore />)}
            </StyledListItemButton>
          </ListItem>
          
          <Collapse in={analysisOpen && open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ pl: 2, pr: 1 }}>
              <StyledListItemButton sx={{ pl: 3 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <ListAltIcon fontSize="small" />
                </ListItemIcon>
                <StyledListItemText primary="Watchlist" primaryTypographyProps={{ fontSize: '0.875rem' }} />
              </StyledListItemButton>
              <StyledListItemButton sx={{ pl: 3 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <SearchIcon fontSize="small" />
                </ListItemIcon>
                <StyledListItemText primary="Screener" primaryTypographyProps={{ fontSize: '0.875rem' }} />
              </StyledListItemButton>
              <StyledListItemButton sx={{ pl: 3 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <EventNoteIcon fontSize="small" />
                </ListItemIcon>
                <StyledListItemText primary="Economic Calendar" primaryTypographyProps={{ fontSize: '0.875rem' }} />
              </StyledListItemButton>
            </List>
          </Collapse>
        </List>

        {open && (
          <Box sx={{ 
            mt: 'auto', 
            mb: 2, 
            mx: 2, 
            p: 2, 
            borderRadius: 2,
            background: 'linear-gradient(45deg, rgba(58, 80, 107, 0.05) 0%, rgba(108, 99, 255, 0.1) 100%)',
            border: '1px solid rgba(108, 99, 255, 0.1)',
          }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Pro Version
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mb: 2, 
                fontSize: '0.8rem',
                wordWrap: 'break-word',
                whiteSpace: 'normal',
              }}
            >
              Upgrade to access premium features and real-time data
            </Typography>
            <Button
              size="small"
              variant="contained"
              color="secondary"
              fullWidth
              sx={{ 
                py: 0.5,
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              Upgrade Now
            </Button>
          </Box>
        )}
        
        {/* Resize handle */}
        {open && <DrawerResizeHandle onMouseDown={handleResizeStart} />}
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
        <Container maxWidth="xl">
          {children}
        </Container>
      </Box>
    </Box>
  );
} 