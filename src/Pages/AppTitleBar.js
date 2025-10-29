import React from 'react';
import { AppBar, Toolbar, Box, Typography } from '@mui/material';
import VoiceFunTitle from './VoiceFunTitle'; // Import the logo

const gradientStyle = {
  background: 'linear-gradient(90deg, #6D5DFB 30%, #A685FA 70%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontFamily: 'Poppins, sans-serif',
  fontWeight: 800,
  fontSize: '2rem',
  letterSpacing: 2,
};

const AppTitleBar = ({ title, showLogo }) => (
  <AppBar position="fixed" elevation={0} sx={{ bgcolor: '#181828', zIndex: 1300 }}>
    <Toolbar>
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {showLogo ? (
          <VoiceFunTitle sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }} />
        ) : (
          title && (
            <Typography
              variant="h6"
              sx={{
                ...gradientStyle,
                fontSize: { xs: '1.5rem', md: '2rem' },
                fontWeight: 800,
              }}
            >
              {title}
            </Typography>
          )
        )}
      </Box>
    </Toolbar>
  </AppBar>
);

export default AppTitleBar;