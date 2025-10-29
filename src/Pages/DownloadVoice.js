// src/Pages/DownloadVoice.js
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  useMediaQuery,
  useTheme,
  IconButton,
  Divider,
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditOffIcon from '@mui/icons-material/EditOff'; // Optional for cancel
import AppNavigation from '../Pages/AppNavigation';
import AppTitleBar from '../Pages/AppTitleBar';

// Group downloads by date
const groupByDate = (items) => {
  return items.reduce((acc, item) => {
    acc[item.date] = acc[item.date] || [];
    acc[item.date].push(item);
    return acc;
  }, {});
};

const getDownloads = () => {
  const downloads = JSON.parse(localStorage.getItem('downloads') || '[]');
  return downloads;
};

const DownloadVoice = () => {
  const [navValue, setNavValue] = useState(1); // 1 for Download
  const [currentAudioId, setCurrentAudioId] = useState(null);
  const [audioInstance, setAudioInstance] = useState(null);
  const [progress, setProgress] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const handlePlay = (item) => {
    if (audioInstance) {
      audioInstance.pause();
      audioInstance.currentTime = 0;
    }

    const newAudio = new Audio(item.file);
    newAudio.play();
    setAudioInstance(newAudio);
    setCurrentAudioId(item.id);

    newAudio.ontimeupdate = () => {
      if (newAudio.duration) {
        setProgress((newAudio.currentTime / newAudio.duration) * 100);
      }
    };

    newAudio.onended = () => {
      setCurrentAudioId(null);
      setAudioInstance(null);
      setProgress(0);
    };
  };

  const handleStop = () => {
    if (audioInstance) {
      audioInstance.pause();
      audioInstance.currentTime = 0;
      setAudioInstance(null);
      setCurrentAudioId(null);
      setProgress(0);
    }
  };

  // Edit handler
  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditName(item.name || 'Voice Message');
  };

  // Save edit
  const handleEditSave = (item) => {
    const downloads = getDownloads().map((d) =>
      d.id === item.id ? { ...d, name: editName } : d
    );
    localStorage.setItem('downloads', JSON.stringify(downloads));
    setEditingId(null);
    setEditName('');
  };

  // Cancel edit
  const handleEditCancel = () => {
    setEditingId(null);
    setEditName('');
  };

  // Delete handler
  const handleDelete = (item) => {
    const downloads = getDownloads().filter((d) => d.id !== item.id);
    localStorage.setItem('downloads', JSON.stringify(downloads));
    setCurrentAudioId(null);
    setAudioInstance(null);
    setProgress(0);
  };

  // Download handler (already works)
  const handleDownload = (url) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ai-voice.wav';
    link.click();

    // Increment download count
    let downloadCount = parseInt(localStorage.getItem('downloadCount') || '0', 10);
    downloadCount += 1;
    localStorage.setItem('downloadCount', downloadCount);
  };

  const grouped = groupByDate(getDownloads());

  return (
    <>
      <AppTitleBar title="Download" />
      <Box sx={{ pt: 0 }}>
        <Box
          sx={{
            display: 'flex',
            height: '100vh',
            bgcolor: '#0F0F0F',
            overflow: 'hidden',
          }}
        >
          <AppNavigation navValue={navValue} setNavValue={setNavValue} />
          <Box
            sx={{
              flex: 1,
              height: '100vh',
              bgcolor: '#0F0F0F',
              color: '#fff',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              ml: isDesktop ? '0px' : 0,
              pb: !isDesktop ? '70px' : 0,
              pt: 2,
              overflow: 'hidden', // Prevent outer scroll
            }}
          >
            <Paper
              sx={{
                p: 0,
                paddingTop: 3.5,
                borderRadius: 4,
                bgcolor: '#1A1A1A',
                width: isDesktop ? "1000vh" : '100%',
                height: '100vh', // Fixed height
                minHeight: 320,
                overflow: 'hidden', // Prevent Paper scroll except content
                boxShadow: '0 2px 16px #6D5DFB22',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  overflowY: 'auto', // Only this box scrolls
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  '&::-webkit-scrollbar': { display: 'none' },
                  px: 2,
                  py: 2,
                }}
              >
                {Object.keys(grouped).map((date) => (
                  <Box key={date} sx={{ mb: 4 }}>
                    {/* Date Header with Line */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ flex: 1, height: 1, bgcolor: '#333' }} />
                      <Typography
                        sx={{
                          mx: 2,
                          color: '#A685FA',
                          fontWeight: 600,
                          fontSize: 16,
                          letterSpacing: 1,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {date}
                      </Typography>
                      <Box sx={{ flex: 1, height: 1, bgcolor: '#333' }} />
                    </Box>

                    {/* Audio Items */}
                    {grouped[date].map((item, idx) => (
                      <React.Fragment key={item.id}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderRadius: 3,
                            p: 1.5,
                            mb: 2,
                            gap: 2,
                            bgcolor: '#1F1F2E',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              bgcolor: '#262640',
                              boxShadow: '0 0 10px #6D5DFB55',
                            },
                          }}
                        >
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ position: 'relative', width: 36, height: 36 }}>
                                {currentAudioId === item.id && (
                                  <CircularProgress
                                    variant="determinate"
                                    value={progress}
                                    size={40}
                                    thickness={4}
                                    sx={{
                                      color: '#fff',
                                      position: 'absolute',
                                      top: '-2px',
                                      left: '-2px',
                                      zIndex: 1,
                                    }}
                                  />
                                )}
                                <IconButton
                                  sx={{
                                    bgcolor: '#181828',
                                    color: '#6D5DFB',
                                    '&:hover': { bgcolor: '#6D5DFB22' },
                                    width: 36,
                                    height: 36,
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    zIndex: 2,
                                  }}
                                  onClick={() =>
                                    currentAudioId === item.id
                                      ? handleStop()
                                      : handlePlay(item)
                                  }
                                >
                                  {currentAudioId === item.id ? (
                                    <StopIcon />
                                  ) : (
                                    <PlayArrowIcon />
                                  )}
                                </IconButton>
                              </Box>
                              <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                                {editingId === item.id ? (
                                  <TextField
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    size="small"
                                    sx={{
                                      bgcolor: '#222',
                                      color: '#fff',
                                      borderRadius: 1,
                                      width: 120,
                                    }}
                                  />
                                ) : (
                                  item.name || 'Voice Message'
                                )}
                              </Typography>
                            </Box>
                            <Typography
                              variant="caption"
                              sx={{ color: '#aaa', pl: '44px' }}
                            >
                              {item.duration}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {editingId === item.id ? (
                              <>
                                <IconButton
                                  sx={{
                                    bgcolor: '#181828',
                                    color: '#A685FA',
                                    width: 36,
                                    height: 36,
                                  }}
                                  aria-label="save"
                                  onClick={() => handleEditSave(item)}
                                >
                                  <CheckCircleIcon />
                                </IconButton>
                                <IconButton
                                  sx={{
                                    bgcolor: '#181828',
                                    color: '#F44336',
                                    width: 36,
                                    height: 36,
                                  }}
                                  aria-label="cancel"
                                  onClick={handleEditCancel}
                                >
                                  <EditOffIcon />
                                </IconButton>
                              </>
                            ) : (
                              <>
                                <IconButton
                                  sx={{
                                    bgcolor: '#181828',
                                    color: '#A685FA',
                                    width: 36,
                                    height: 36,
                                  }}
                                  aria-label="edit"
                                  onClick={() => handleEdit(item)}
                                >
                                  <EditIcon />
                                </IconButton>
                                <IconButton
                                  sx={{
                                    bgcolor: '#181828',
                                    color: '#F44336',
                                    width: 36,
                                    height: 36,
                                  }}
                                  aria-label="delete"
                                  onClick={() => {
                                    setDeleteTarget(item);
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                                <IconButton
                                  sx={{
                                    bgcolor: '#181828',
                                    color: '#6D5DFB',
                                    width: 36,
                                    height: 36,
                                  }}
                                  aria-label="download"
                                  onClick={() => handleDownload(item.file)}
                                >
                                  <CloudDownloadIcon />
                                </IconButton>
                              </>
                            )}
                          </Box>
                        </Box>
                        {idx < grouped[date].length - 1 && (
                          <Divider sx={{ my: 1, bgcolor: '#222' }} />
                        )}
                      </React.Fragment>
                    ))}
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Voice</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this voice?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>No</Button>
          <Button
            color="error"
            onClick={() => {
              if (deleteTarget) {
                const downloads = getDownloads().filter((d) => d.id !== deleteTarget.id);
                localStorage.setItem('downloads', JSON.stringify(downloads));
                setCurrentAudioId(null);
                setAudioInstance(null);
                setProgress(0);
              }
              setDeleteDialogOpen(false);
              setDeleteTarget(null);
            }}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DownloadVoice;
