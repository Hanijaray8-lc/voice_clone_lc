import React from 'react';
import { Typography } from '@mui/material';

const animatedStyle = {
  background: 'linear-gradient(90deg, #6D5DFB 30%, #A685FA 70%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontFamily: 'Poppins, sans-serif',
  fontWeight: 800,
  fontSize: '3rem',
  letterSpacing: 2,
  animation: 'pulse 2s infinite alternate',
};

const keyframes = `
@keyframes pulse {
  0% { text-shadow: 0 0 10px #6D5DFB, 0 0 20px #6D5DFB; }
  100% { text-shadow: 0 0 30px #A685FA, 0 0 60px #A685FA; }
}
`;

const VoiceFunTitle = ({ sx = {}, ...props }) => (
  <>
    <style>{keyframes}</style>
    <Typography sx={{ ...animatedStyle, ...sx }} {...props}>
      NeuroVox
    </Typography>
  </>
);

export default VoiceFunTitle;