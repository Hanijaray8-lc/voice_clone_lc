import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import VoiceFunTitle from '../Pages/VoiceFunTitle';

const StartPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/signin');
    }, 5000); // 0.5 seconds
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#0F0F0F',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        position: 'relative',
      }}
    >
      <VoiceFunTitle />
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          left: 0,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <Box
          sx={{
            fontFamily: '"Pacifico", cursive',
            fontSize: { xs: 18, sm: 20 },
            color: '#6D5DFB',
            letterSpacing: 1,
            opacity: 0.85,
            textShadow: '0 2px 8px #0008',
            mb: 1,
          }}
        >
          from <span style={{ fontWeight: 700, color: '#fff' }}>Lifechangers ind</span>
        </Box>
      </Box>
    </Box>
  );
};

export default StartPage;