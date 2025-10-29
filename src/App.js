import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Pages
import SignIn from './Pages/SignIn';
import SignUp from './Pages/SignUP';
import DownloadVoice from './Pages/DownloadVoice';
import VoiceGenerator from './Pages/VoiceGenerator';
import Setting from './Pages/Setting';
import AccountPage from './Pages/AccountPage';
import StartPage from './Pages/StartPage';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0F0F0F',
      paper: '#1A1A1A',
    },
    text: {
      primary: '#ffffff',
      secondary: '#cccccc',
    },
    primary: {
      main: '#6D5DFB',
    },
  },
  typography: {
    fontFamily: 'Poppins, sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<StartPage />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/download" element={<DownloadVoice />} />
          <Route path="/voice" element={<VoiceGenerator />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/settings" element={<Setting />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
