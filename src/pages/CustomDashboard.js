import React from 'react';
import { 
  Typography, 
  Grid, 
  Paper, 
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Alert
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';

const CustomDashboard = () => {
  return (
    <div>
      <Box className="page-header" sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4" component="h1">
          Custom Dashboard
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<SettingsIcon />}
        >
          Edit Layout
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        This is a placeholder for the customizable dashboard feature. You can create your own dashboard by selecting widgets and arranging them as you prefer.
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Available Widgets
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" component="div">
                      Market Overview
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Quick view of major market indices
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" startIcon={<AddIcon />}>Add to Dashboard</Button>
                  </CardActions>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" component="div">
                      Performance Tracker
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Track performance across different timeframes
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" startIcon={<AddIcon />}>Add to Dashboard</Button>
                  </CardActions>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" component="div">
                      Watchlist
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Monitor your favorite symbols
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" startIcon={<AddIcon />}>Add to Dashboard</Button>
                  </CardActions>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" component="div">
                      Technical Signals
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Key technical indicators and signals
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" startIcon={<AddIcon />}>Add to Dashboard</Button>
                  </CardActions>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6} lg={8}>
          <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="h5" gutterBottom sx={{ textAlign: 'center' }}>
              Your Custom Dashboard
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', maxWidth: '500px', mb: 3 }}>
              Drag and drop widgets to create your personalized market dashboard. 
              Choose from a variety of widgets to monitor the markets that matter most to you.
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<AddIcon />}
            >
              Add Your First Widget
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default CustomDashboard; 