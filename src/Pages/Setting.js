// src/Pages/Setting.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  Paper,
  Divider,
  useMediaQuery,
  useTheme,
  Slider,
} from '@mui/material';
import AppNavigation from '../Pages/AppNavigation';
import AppTitleBar from '../Pages/AppTitleBar';

const Setting = () => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [voicePitch, setVoicePitch] = useState(0);
  const [voicePreview, setVoicePreview] = useState(false);
  const [betaFeatures, setBetaFeatures] = useState(false);

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [navValue, setNavValue] = useState(2); // Settings tab

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('settings') || '{}');
    if (saved.notifications !== undefined) setNotifications(saved.notifications);
    if (saved.darkMode !== undefined) setDarkMode(saved.darkMode);
    if (saved.voicePitch !== undefined) setVoicePitch(saved.voicePitch);
    if (saved.voicePreview !== undefined) setVoicePreview(saved.voicePreview);
    if (saved.betaFeatures !== undefined) setBetaFeatures(saved.betaFeatures);
  }, []);

  // Save settings to localStorage
  const handleSave = () => {
    localStorage.setItem('settings', JSON.stringify({
      notifications,
      darkMode,
      voicePitch,
      voicePreview,
      betaFeatures,
    }));
    // Optionally show a toast/snackbar
  };

  // Apply dark mode to <body>
  useEffect(() => {
    document.body.style.background = darkMode ? '#0F0F0F' : '#fff';
    document.body.style.color = darkMode ? '#fff' : '#222';
  }, [darkMode]);

  return (
    <>
      <AppTitleBar title="Settings" />
      <Box sx={{ pt: { xs: 7, md: 8 } }}>
        <Box
          sx={{
            display: 'flex',
            height: '100vh', // Fixed height to viewport
            bgcolor: '#0F0F0F',
            overflow: 'hidden', // Prevent scrolling
          }}
        >
          <AppNavigation navValue={navValue} setNavValue={setNavValue} />
          <Box
            sx={{
              flex: 1,
              height: '100vh', // Fixed height
              bgcolor: '#0F0F0F',
              color: '#fff',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              ml: isDesktop ? '80px' : 0,
              pb: !isDesktop ? '70px' : 0,
              overflow: 'hidden', // Prevent scrolling
            }}
          >
            <Paper
              sx={{
                p: 4,
                bgcolor: '#1A1A1A',
                width: '100%',
                maxWidth: 450,
                height: '95vh',
                overflow: 'auto', // Allow scroll only inside Paper if needed
              }}
            >
         
              {/* App Toggles */}
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                    sx={{ '& .MuiSwitch-thumb': { bgcolor: '#6D5DFB' } }}
                  />
                }
                label="Enable Notifications"
                sx={{ mb: 2, color: '#fff' }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                    sx={{ '& .MuiSwitch-thumb': { bgcolor: '#6D5DFB' } }}
                  />
                }
                label="Dark Mode"
                sx={{ mb: 2, color: '#fff' }}
              />

              <Divider sx={{ my: 3, borderColor: '#333' }} />

              {/* Voice Options */}
              <Typography variant="subtitle1" sx={{ color: '#aaa', mb: 1 }}>
                Voice Settings
              </Typography>

              <Typography variant="body2" sx={{ color: '#888', mb: 0.5 }}>
                Voice Pitch
              </Typography>
              <Slider
                value={voicePitch}
                min={-3}
                max={3}
                step={1}
                marks
                onChange={(e, newValue) => setVoicePitch(newValue)}
                sx={{ color: '#6D5DFB', mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={voicePreview}
                    onChange={(e) => setVoicePreview(e.target.checked)}
                    sx={{ '& .MuiSwitch-thumb': { bgcolor: '#6D5DFB' } }}
                  />
                }
                label="Auto-play Generated Voice"
                sx={{ mb: 2, color: '#fff' }}
              />

              <Divider sx={{ my: 3, borderColor: '#333' }} />

              {/* Experimental */}
              <FormControlLabel
                control={
                  <Switch
                    checked={betaFeatures}
                    onChange={(e) => setBetaFeatures(e.target.checked)}
                    sx={{ '& .MuiSwitch-thumb': { bgcolor: '#6D5DFB' } }}
                  />
                }
                label="Enable Experimental Features"
                sx={{ mb: 3, color: '#fff' }}
              />

              <Button
                variant="contained"
                fullWidth
                sx={{ bgcolor: '#6D5DFB', borderRadius: 3 }}
                onClick={handleSave}
              >
                Save Settings
              </Button>
            </Paper>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Setting;
