import React, { useState } from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, BottomNavigation, BottomNavigationAction, useMediaQuery, useTheme } from '@mui/material';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import DownloadIcon from '@mui/icons-material/Download';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle'; // <-- Add this import
import { useNavigate } from 'react-router-dom';

const AppNavigation = ({ navValue, setNavValue }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();

  const handleNav = (value) => {
    setNavValue(value);
    if (value === 0) navigate('/voice');
    if (value === 1) navigate('/download');
    if (value === 2) navigate('/settings');
    if (value === 3) navigate('/account'); // <-- Add this line
  };

  return (
    <>
      {isDesktop && (
        <Drawer
          variant="permanent"
          sx={{
            width: 80,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: 80, bgcolor: '#181828', color: '#fff', borderRight: 'none' },
          }}
          open
        >
          <List sx={{ mt: 8 }}>
            <ListItem button selected={navValue === 0} onClick={() => handleNav(0)}>
              <ListItemIcon sx={{ color: '#6D5DFB' }}><RecordVoiceOverIcon /></ListItemIcon>
            </ListItem>
            <ListItem button selected={navValue === 1} onClick={() => handleNav(1)}>
              <ListItemIcon sx={{ color: '#6D5DFB' }}><DownloadIcon /></ListItemIcon>
            </ListItem>
            <ListItem button selected={navValue === 2} onClick={() => handleNav(2)}>
              <ListItemIcon sx={{ color: '#6D5DFB' }}><SettingsIcon /></ListItemIcon>
            </ListItem>
            <ListItem button selected={navValue === 3} onClick={() => handleNav(3)}>
              <ListItemIcon sx={{ color: '#6D5DFB' }}><AccountCircleIcon /></ListItemIcon>
            </ListItem>
          </List>
        </Drawer>
      )}
      {(isMobile || isTablet) && (
        <BottomNavigation
          value={navValue}
          onChange={(e, newValue) => handleNav(newValue)}
          showLabels
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100vw',
            bgcolor: '#181828',
            zIndex: 1201,
            borderTop: '1px solid #222',
          }}
        >
          <BottomNavigationAction label="Voice" icon={<RecordVoiceOverIcon />} />
          <BottomNavigationAction label="Download" icon={<DownloadIcon />} />
          <BottomNavigationAction label="Settings" icon={<SettingsIcon />} />
          <BottomNavigationAction label="Account" icon={<AccountCircleIcon />} /> {/* Add this line */}
        </BottomNavigation>
      )}
    </>
  );
};

export default AppNavigation;