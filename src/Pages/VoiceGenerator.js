// src/Pages/VoiceGenerator.js
import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  useMediaQuery,
  useTheme,
  Paper,
  CircularProgress,
} from '@mui/material';// Import the upload icon
import AppTitleBar from '../Pages/AppTitleBar';
// ...existing imports...
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import AppNavigation from './AppNavigation';
import axios from 'axios';
import WaveSurfer from '@wavesurfer/react';
import { franc } from 'franc';
import Sample1 from '../Assets/sample1.mp3';
import Sample2 from '../Assets/sample2.mp3';
import Sample3 from '../Assets/sample3.mp3';
import Sample4 from '../Assets/sample4.mp3';
import Sample5 from '../Assets/sample5.mp3';
import DiscImg from '../Assets/disc.png';
import AvatarImg from '../Assets/avathar.png'; // Place your avatar image in Assets folder

// filepath: d:\React 3\Voice_clone\client\src\Pages\VoiceGenerator.js

const API = 'http://localhost:8000'; // Adjust this to your API URL

const sampleAudios = [
  { name: 'Sample 1', file: Sample1 },
  { name: 'Sample 2', file: Sample2 },
  { name: 'Sample 3', file: Sample3 },
  { name: 'Sample 4', file: Sample4 },
  { name: 'Sample 5', file: Sample5 },
  // Add more objects for additional samples
];

const VoiceGenerator = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [navValue, setNavValue] = useState(0);

  // voice state
  const [ownVoice, setOwnVoice] = useState('');
  const [sampleVoice, setSampleVoice] = useState('');
  const [outcomeVoice, setOutcomeVoice] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [sampleVoiceBlob, setSampleVoiceBlob] = useState(null);
  const [ownVoiceFile, setOwnVoiceFile] = useState(null); // new state for the uploaded file
  const [ownText, setOwnText] = useState('');
  const [language, setLanguage] = useState('en'); // Add a dropdown for language selection

  // generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [personImage, setPersonImage] = useState(null);
  const [personImageUrl, setPersonImageUrl] = useState('');
  // removed video state

  // refs for recording
  const micIconRef = useRef(null);
  const fieldRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioRefs = useRef([]);
  const outcomeAudioRef = useRef(null);

  // Add this state for disc playback and animation
  const [playingSampleIdx, setPlayingSampleIdx] = useState(null);
  // Add this state to control mouth animation
  const [isMouthMoving, setIsMouthMoving] = useState(false);

  // Add these states for mouth animation
  const [mouthShape, setMouthShape] = useState('closed');
  const mouthShapes = {
    closed: isMobile
      ? "M70,120 Q80,125 90,120"
      : "M110,200 Q130,210 150,200",
    mid: isMobile
      ? "M70,120 Q80,130 90,120 Q80,135 70,120"
      : "M110,200 Q130,225 150,200 Q130,235 110,200",
    open: isMobile
      ? "M70,120 Q80,135 90,120 Q80,140 70,120"
      : "M110,200 Q130,235 150,200 Q130,250 110,200",
  };

  // Clean up object URLs on unmount / when replaced
  useEffect(() => {
    return () => {
      if (ownVoice) URL.revokeObjectURL(ownVoice);
      if (sampleVoice) URL.revokeObjectURL(sampleVoice);
      if (outcomeVoice) URL.revokeObjectURL(outcomeVoice);
      // stop any active stream
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
    // we only want this on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start recording
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      let chunks = [];
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setRecordedBlob(blob);
        // createObjectURL for playback
        if (ownVoice) URL.revokeObjectURL(ownVoice);
        setOwnVoice(URL.createObjectURL(blob));
        chunks = [];
      };
      mr.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Cannot access microphone:', err);
      alert('Microphone access denied or not available.');
    }
  };

  // Stop recording (and stop tracks)
  const handleStopRecording = () => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
    } catch (e) {
      console.warn('Stop recording error', e);
    } finally {
      setIsRecording(false);
    }
  };

  // New function to handle file upload for own voice
  const handleOwnVoiceUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setRecordedBlob(file); // set the file as the recorded blob
    if (ownVoice) URL.revokeObjectURL(ownVoice);
    setOwnVoice(URL.createObjectURL(file)); // set the object URL for playback
    setOwnVoiceFile(file); // store the file
  };

  // delete recorded audio
  const handleDeleteRecording = () => {
    if (ownVoice) URL.revokeObjectURL(ownVoice);
    setOwnVoice('');
    setRecordedBlob(null);
    setIsRecording(false);
    setOwnVoiceFile(null); // clear the file
  };

  // handle sample upload
  const handleSampleVoiceUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (sampleVoice) URL.revokeObjectURL(sampleVoice);
    setSampleVoice(URL.createObjectURL(file));
    setSampleVoiceBlob(file);
  };

  // handle text change
  const handleOwnTextChange = (e) => setOwnText(e.target.value);

  // removed person image upload handler to eliminate video generation

  // Generate — upload both files and get the cloned audio back
  const handleGenerate = async () => {
    if (!ownText || !sampleVoiceBlob) return;
    setIsGenerating(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('text', ownText);
    formData.append('sample_voice', sampleVoiceBlob);
    formData.append('language', language);
    // removed person_image append - audio-only flow

    try {
      const response = await axios.post(
        `${API}/api/voice/clone`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          responseType: 'blob',
          timeout: 120000,
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setProgress(percent);
            }
          },
        }
      );

      // Always treat as audio response (blob -> base64)
      if (outcomeVoice) URL.revokeObjectURL(outcomeVoice);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Audio = reader.result;
        setOutcomeVoice(base64Audio);

        // --- Save to localStorage ---
        const downloads = JSON.parse(localStorage.getItem('downloads') || '[]');
        downloads.unshift({
          id: Date.now(),
          date: new Date().toISOString().slice(0, 10),
          file: base64Audio,
          duration: '',
          name: 'Voice Message', // default name
        });
        localStorage.setItem('downloads', JSON.stringify(downloads));
        // Voice Generated count is downloads.length
        // ---------------------------
      };
      reader.readAsDataURL(response.data);
    } catch (err) {
      console.error('Generate failed:', err);
      // prefer nicer message for user
      const message = err?.response?.data?.message || err.message || 'Unknown error';
      alert('Voice generation failed: ' + message);
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  // drag end logic (keeps your original)
  const handleMicDragEnd = (e) => {
    const micBounds = micIconRef.current?.getBoundingClientRect();
    const fieldBounds = fieldRef.current?.getBoundingClientRect();

    if (micBounds && fieldBounds) {
      const micCenterX = micBounds.left + micBounds.width / 2;
      const fieldRightEdge = fieldBounds.right;

      const threshold = 40; // You can adjust this
      if (fieldRightEdge - micCenterX < threshold) {
        // drop to the right — start recording as you previously intended
        handleStartRecording();
      }
    }
  };

  // --- Auto-playback effect for outcomeVoice ---
  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    if (settings.voicePreview && outcomeVoice) {
      const audio = new Audio(outcomeVoice);
      audio.play();
    }
  }, [outcomeVoice]);
  // ------------------------------------------------

  // Map franc codes to your dropdown values
  const francToLang = {
    'eng': 'en',
    'hin': 'hi',
    'cmn': 'zh-cn',
    'jpn': 'ja',
    'tam': 'ta',
    'mal': 'ml',
    // Add more mappings as needed
  };

  useEffect(() => {
    if (ownText.trim().length > 0) {
      const detected = franc(ownText);
      if (francToLang[detected]) {
        setLanguage(francToLang[detected]);
      }
    }
  }, [ownText]);

  // Play/pause disc audio and animate disc
  const handleSampleDiscClick = async (sample, idx) => {
    const audioEl = audioRefs.current[idx];
    if (!audioEl) return;

    // If already playing, pause and stop animation
    if (playingSampleIdx === idx && !audioEl.paused) {
      audioEl.pause();
      setPlayingSampleIdx(null);
    } else {
      // Pause any other playing audio
      audioRefs.current.forEach((el, i) => {
        if (el && i !== idx) el.pause();
      });
      audioEl.currentTime = 0;
      audioEl.play();
      setPlayingSampleIdx(idx);
      if (sampleVoice) URL.revokeObjectURL(sampleVoice);
      setSampleVoice(sample.file);

      // Fetch the sample file as a Blob and set sampleVoiceBlob
      try {
        const response = await fetch(sample.file);
        const blob = await response.blob();
        setSampleVoiceBlob(blob);
      } catch (err) {
        console.error("Failed to fetch sample file as blob", err);
        setSampleVoiceBlob(null);
      }
    }
  };

  // Stop animation when audio ends
  const handleSampleAudioEnded = () => {
    setPlayingSampleIdx(null);
  };

  // Listen for play/pause events on outcome audio
  useEffect(() => {
    const audio = outcomeAudioRef.current;
    if (!audio) return;
    const handlePlay = () => setIsMouthMoving(true);
    const handlePause = () => setIsMouthMoving(false);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handlePause);
    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handlePause);
    };
  }, [outcomeVoice]);

  // Animate mouth shape when audio is playing
  useEffect(() => {
    let interval;
    if (isMouthMoving) {
      interval = setInterval(() => {
        setMouthShape((prev) =>
          prev === 'closed' ? 'mid' : prev === 'mid' ? 'open' : 'closed'
        );
      }, 180); // Change every 180ms for a talking effect
    } else {
      setMouthShape('closed');
    }
    return () => clearInterval(interval);
  }, [isMouthMoving, isMobile]);

  return (
    <>
      <AppTitleBar showLogo />
      <Box sx={{ pt: { xs: 7, md: 8 } }}>
        <AppNavigation navValue={navValue} setNavValue={setNavValue} />
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0F0F0F' }}>
          <Box
            sx={{
              flex: 1,
              minHeight: '100vh',
              bgcolor: '#0F0F0F',
              color: '#fff',
              px: isMobile ? 1 : isTablet ? 6 : 12,
              py: isMobile ? 1 : 4,
              fontFamily: 'Poppins, sans-serif',
              pb: isMobile || isTablet ? '70px' : 0,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mt: isMobile ? 2 : 6,
              }}
            >
              {/* Face Emoji with animated mouth */}
              <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center', position: 'relative', height: isMobile ? 180 : 260 }}>
                {/* Avatar Image */}
                <img
                  src={AvatarImg}
                  alt="Avatar"
                  style={{
                    width: isMobile ? 160 : 260,
                    height: isMobile ? 160 : 260,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    boxShadow: '0 2px 8px #6D5DFB33',
                    zIndex: 1,
                    position: 'relative',
                  }}
                />
                {/* Animated Realistic Mouth Overlay (SVG) */}
                <svg
                  width={isMobile ? 160 : 260}
                  height={isMobile ? 160 : 260}
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: isMobile ? -23 : -42,
                    pointerEvents: 'none',
                    zIndex: 2,
                  }}
                >
                  <path
                    id="mouth-shape"
                    d={mouthShapes[mouthShape]}
                    fill={mouthShape === 'closed' ? "none" : "#222"}
                    stroke="#222"
                    strokeWidth={isMobile ? 4 : 7}
                    style={{
                      transition: 'd 0.18s cubic-bezier(.4,2,.6,1), fill 0.18s',
                    }}
                  />
                </svg>
                {/* Mouth animation keyframes for fallback (optional) */}
                <style>
                  {`
                    @keyframes mouth-move {
                      0% { d: path('${isMobile ? "M70,120 Q80,125 90,120" : "M110,200 Q130,210 150,200"}'); }
                      100% { d: path('${isMobile ? "M70,120 Q80,135 90,120 Q80,140 70,120" : "M110,200 Q130,235 150,200 Q130,250 110,200"}'); }
                    }
                  `}
                </style>
              </Box>
              {/* Sample Audios Title */}
              <Typography
                sx={{
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: isMobile ? 16 : 20,
                  mb: 2,
                  textAlign: 'center',
                }}
              >
                Sample Voice (Use to make audio trial)
              </Typography>

              {/* Sample Audios as Rounded Discs in 2 rows */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
                {/* First row: 3 discs */}
                <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
                  {sampleAudios.slice(0, 3).map((sample, idx) => (
                    <Box
                      key={sample.name}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      <Box
                        sx={{
                          width: isMobile ? 60 : 80,
                          height: isMobile ? 60 : 80,
                          borderRadius: '50%',
                          background: '#181828',
                          boxShadow: '0 2px 8px #6D5DFB33',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          border: sampleVoice === sample.file ? '3px solid #6D5DFB' : '2px solid #333',
                          transition: 'border 0.2s',
                          position: 'relative',
                          overflow: 'hidden',
                          animation: playingSampleIdx === idx ? 'spin 1s linear infinite' : 'none',
                        }}
                        onClick={() => handleSampleDiscClick(sample, idx)}
                      >
                        <img
                          src={DiscImg}
                          alt="Sample Disc"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            zIndex: 1,
                            pointerEvents: 'none',
                          }}
                        />
                        <audio
                          ref={el => audioRefs.current[idx] = el}
                          src={sample.file}
                          onEnded={handleSampleAudioEnded}
                          style={{ display: 'none' }}
                        />
                      </Box>
                      <Typography
                        sx={{
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: isMobile ? 12 : 16,
                          textShadow: '0 1px 4px #000',
                          mt: 1, // margin-top to separate from disc
                          textAlign: 'center',
                          width: isMobile ? 60 : 80,
                        }}
                      >
                        {sample.name}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                {/* Second row: 2 discs */}
                <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', mt: 2 }}>
                  {sampleAudios.slice(3, 5).map((sample, idx) => (
                    <Box
                      key={sample.name}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      <Box
                        sx={{
                          width: isMobile ? 60 : 80,
                          height: isMobile ? 60 : 80,
                          borderRadius: '50%',
                          background: '#181828',
                          boxShadow: '0 2px 8px #6D5DFB33',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          border: sampleVoice === sample.file ? '3px solid #6D5DFB' : '2px solid #333',
                          transition: 'border 0.2s',
                          position: 'relative',
                          overflow: 'hidden',
                          animation: playingSampleIdx === idx + 3 ? 'spin 1s linear infinite' : 'none',
                        }}
                        onClick={() => handleSampleDiscClick(sample, idx + 3)}
                      >
                        <img
                          src={DiscImg}
                          alt="Sample Disc"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            zIndex: 1,
                            pointerEvents: 'none',
                          }}
                        />
                        <audio
                          ref={el => audioRefs.current[idx + 3] = el}
                          src={sample.file}
                          onEnded={handleSampleAudioEnded}
                          style={{ display: 'none' }}
                        />
                      </Box>
                      <Typography
                        sx={{
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: isMobile ? 12 : 16,
                          textShadow: '0 1px 4px #000',
                          mt: 1, // margin-top to separate from disc
                          textAlign: 'center',
                          width: isMobile ? 60 : 80,
                        }}
                      >
                        {sample.name}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Add this CSS for spinning animation */}
              <style>
                {`
                  @keyframes spin {
                    0% { transform: rotate(0deg);}
                    100% { transform: rotate(360deg);}
                  }
                `}
              </style>

              {/* Voice Fields */}
              <Paper
                elevation={4}
                sx={{
                  bgcolor: '#181828',
                  borderRadius: 4,
                  p: isMobile ? 2 : 4,
                  width: isMobile ? '100%' : isTablet ? 400 : 480,
                  mb: 3,
                  mt: 1,
                }}
              >
                {/* Text Input for Content */}
                <Box ref={fieldRef}>
                  <TextField
                    fullWidth
                    label="Enter Text"
                    variant="outlined"
                    value={ownText}
                    onChange={handleOwnTextChange}
                    placeholder="Type your message here"
                    sx={{
                      mb: 3,
                      input: { color: '#fff' },
                      label: { color: '#aaa' },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#6D5DFB' },
                        '&:hover fieldset': { borderColor: '#6D5DFB' },
                      },
                    }}
                  />
                </Box>

                {/* Sample Voice Upload */}
                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ color: '#aaa', mb: 1 }}>Sample Voice (Upload .wav/.mp3)</Typography>
                  <input type="file" accept="audio/*" onChange={handleSampleVoiceUpload} style={{ color: '#fff' }} />
                  {sampleVoice && <audio controls src={sampleVoice} style={{ width: '100%', marginTop: 8 }} />}
                </Box>

                {/* Language Selection Dropdown */}
                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ color: '#aaa', mb: 1 }}>Select Language</Typography>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: 4,
                      border: '1px solid #6D5DFB',
                      backgroundColor: '#181828',
                      color: '#fff',
                      fontSize: 16,
                    }}
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="zh-cn">Chinese</option>
                    <option value="ja">Japanese</option>
                    <option value="thanglish">Thanglish</option>
                    {/* Add more as needed */}
                  </select>
                </Box>

                {/* Person Image upload removed - audio-only flow */}

                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    bgcolor: '#6D5DFB',
                    borderRadius: 3,
                    fontWeight: 600,
                    fontSize: isMobile ? 16 : 18,
                    py: 1.2,
                    mt: 1,
                    textTransform: 'none',
                    boxShadow: '0 2px 8px #6D5DFB33',
                  }}
                  onClick={handleGenerate}
                  disabled={!ownText || !sampleVoiceBlob || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <CircularProgress size={20} sx={{ color: '#fff', mr: 1 }} />
                      Generating{progress ? ` ${progress}%` : ''}
                    </>
                  ) : (
                    'Generate Audio'
                  )}
                </Button>
              </Paper>

              {/* Waveforms */}
              {/* Own Voice Waveform */}
              {ownVoice && (
                <Box sx={{ mt: 3, mb: 4 }}>
                  <Typography sx={{ color: '#aaa', mb: 1 }}>Your Own Voice Waveform</Typography>
                  <WaveSurfer
                    height={80}
                    waveColor="#6D5DFB"
                    progressColor="#fff"
                    url={ownVoice}
                    barWidth={2}
                    barGap={2}
                    barRadius={2}
                    cursorColor="#A685FA"
                  />
                </Box>
              )}

              {/* Sample Voice Waveform */}
              {sampleVoice && (
                <Box sx={{ mb: 4 }}>
                  <Typography sx={{ color: '#aaa', mb: 1 }}>Sample Voice Waveform</Typography>
                  <WaveSurfer
                    height={80}
                    waveColor="#FFA726"
                    progressColor="#fff"
                    url={sampleVoice}
                    barWidth={2}
                    barGap={2}
                    barRadius={2}
                    cursorColor="#FFA726"
                  />
                </Box>
              )}

              {/* Outcome Voice Waveform */}
              {outcomeVoice && (
                <Box sx={{ mb: 4 }}>
                  <Typography sx={{ color: '#aaa', mb: 1 }}>Outcome Voice Waveform</Typography>
                  <WaveSurfer
                    height={80}
                    waveColor="#A685FA"
                    progressColor="#6D5DFB"
                    url={outcomeVoice}
                    barWidth={2}
                    barGap={2}
                    barRadius={2}
                    cursorColor="#6D5DFB"
                  />
                </Box>
              )}

              {/* Outcome Audio Only */}
              {outcomeVoice && (
                <Paper
                  elevation={3}
                  sx={{
                    bgcolor: '#1A1A1A',
                    borderRadius: 3,
                    p: isMobile ? 2 : 3,
                    width: isMobile ? '100%' : isTablet ? 400 : 480,
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="subtitle1" sx={{ mb: 1, color: '#ccc' }}>
                    Outcome Voice Source
                  </Typography>
                  <audio
                    id="outcome-audio"
                    controls
                    src={outcomeVoice}
                    style={{ width: '100%' }}
                    ref={outcomeAudioRef}
                  />
                  {/* Download and Share Buttons */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      sx={{
                        bgcolor: '#181828',
                        color: '#6D5DFB',
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: 16,
                        boxShadow: 'none',
                        '&:hover': { bgcolor: '#23234a' },
                      }}
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = outcomeVoice;
                        link.download = 'voice_clone.wav';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                    >
                      Download Audio
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<ShareIcon />}
                      sx={{
                        bgcolor: '#181828',
                        color: '#6D5DFB',
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: 16,
                        boxShadow: 'none',
                        '&:hover': { bgcolor: '#23234a' },
                      }}
                      onClick={async () => {
                        if (navigator.share) {
                          const res = await fetch(outcomeVoice);
                          const blob = await res.blob();
                          const file = new File([blob], 'voice_clone.wav', { type: blob.type });
                          navigator.share({
                            title: 'Voice Clone',
                            text: 'Listen to my cloned voice!',
                            files: [file],
                          });
                        } else {
                          alert('Share is not supported on this device/browser.');
                        }
                      }}
                    >
                      Share Audio
                    </Button>
                  </Box>
                </Paper>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default VoiceGenerator;
