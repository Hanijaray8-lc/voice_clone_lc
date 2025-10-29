import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import
import {
  Box,
  Typography,
  Avatar,
  Button,
  Paper,
  TextField,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import AppNavigation from './AppNavigation';
import AppTitleBar from './AppTitleBar';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || "http://localhost:8000";
const NAV_TITLES = ['Voice Generator', 'Download', 'Settings', 'Account'];

const AccountPage = () => {
  const [navValue, setNavValue] = useState(3);
  const [bio, setBio] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [user, setUser] = useState({ name: '', email: '', profileUrl: '' });
  const [voiceGenerated, setVoiceGenerated] = useState(0);
  const [downloadCount, setDownloadCount] = useState(0);

  // Add state
  const [changePwdStep, setChangePwdStep] = useState(0); // 0: email, 1: new pwd
  const [changeEmail, setChangeEmail] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [changePwdError, setChangePwdError] = useState('');
  const [changePwdSuccess, setChangePwdSuccess] = useState('');
  const navigate = useNavigate();
  const [signOutDialogOpen, setSignOutDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteRand, setDeleteRand] = useState('');
  const [deleteInput, setDeleteInput] = useState('');
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    axios.get(`${API}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setUser({
          name: res.data.name,
          email: res.data.email,
          profileUrl: '', // If you add profile image support, set here
        });
        setBio(res.data.bio || ''); // If you add bio to backend, otherwise set default
      })
      .catch(() => {
        setUser({ name: '', email: '', profileUrl: '' });
      });

    // Get counts from localStorage
    const downloads = JSON.parse(localStorage.getItem('downloads') || '[]');
    setVoiceGenerated(downloads.length);
    setDownloadCount(parseInt(localStorage.getItem('downloadCount') || '0', 10));
  }, []);

  const title = NAV_TITLES[navValue];

  const handleSignOut = () => {
    setSignOutDialogOpen(true);
  };

  const confirmSignOut = () => {
    localStorage.removeItem('token');
    setSignOutDialogOpen(false);
    navigate('/signin');
  };

  const cancelSignOut = () => {
    setSignOutDialogOpen(false);
  };

  const handleDeleteAccount = () => {
    // Generate a random 4-digit number
    const rand = Math.floor(1000 + Math.random() * 9000).toString();
    setDeleteRand(rand);
    setDeleteInput('');
    setDeleteError('');
    setDeleteDialogOpen(true);
  };

  const confirmDeleteAccount = async () => {
    if (deleteInput !== deleteRand) {
      setDeleteError('Number does not match.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/api/auth/delete-account`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.removeItem('token');
      setDeleteDialogOpen(false);
      navigate('/signin');
    } catch (err) {
      setDeleteError('Failed to delete account.');
    }
  };

  const cancelDeleteAccount = () => {
    setDeleteDialogOpen(false);
  };

  // Handler for "Change Password" button
  const handleOpenPasswordDialog = () => {
    setOpenPasswordDialog(true);
    setChangePwdStep(0);
    setChangeEmail('');
    setNewPwd('');
    setConfirmPwd('');
    setChangePwdError('');
    setChangePwdSuccess('');
  };

  // Handler for email step
  const handleEmailSubmit = () => {
    if (changeEmail !== user.email) {
      setChangePwdError('Email does not match your account.');
      return;
    }
    setChangePwdStep(1);
    setChangePwdError('');
  };

  // Handler for password change
  const handlePasswordChangeSubmit = async () => {
    if (!newPwd || newPwd.length < 6) {
      setChangePwdError('Password must be at least 6 characters.');
      return;
    }
    if (newPwd !== confirmPwd) {
      setChangePwdError('Passwords do not match.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/api/auth/change-password`, {
        email: changeEmail,
        new_password: newPwd,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChangePwdSuccess('Password changed successfully!');
      setOpenPasswordDialog(false);
    } catch (err) {
      setChangePwdError(err.response?.data?.detail || 'Failed to change password.');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0F0F0F', fontFamily: 'Poppins, sans-serif' }}>
      <AppTitleBar title={title} />
      <AppNavigation navValue={navValue} setNavValue={setNavValue} />
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Paper
          elevation={4}
          sx={{
            p: 4,
            paddingTop:10,
            bgcolor: '#1A1A1A',
            width: '100%',
            maxWidth: 450,
            height: '95vh',
            overflow: 'auto',
          }}
        >
          <Avatar
            src={user.profileUrl}
            sx={{
              width: 80,
              height: 80,
              mx: 'auto',
              mb: 2,
              bgcolor: '#6D5DFB',
              fontSize: 36,
            }}
          >
            {user.name ? user.name[0] : ''}
          </Avatar>

          <Typography variant="h6" sx={{ color: '#fff', mb: 0.5, textAlign: 'center' }}>
            {user.name}
          </Typography>

          <Typography variant="body2" sx={{ color: '#aaa', mb: 2, textAlign: 'center' }}>
            {user.email}
          </Typography>

          {/* Editable Bio */}
          <TextField
            multiline
            minRows={2}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            variant="outlined"
            fullWidth
            InputProps={{
              readOnly: !isEditing,
              style: { color: '#fff' },
            }}
            sx={{
              mb: 1.5,
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#6D5DFB' },
              },
            }}
          />
          <Button
            onClick={() => setIsEditing(!isEditing)}
            size="small"
            sx={{ color: '#6D5DFB', mb: 2 }}
          >
            {isEditing ? 'Save Bio' : 'Edit Bio'}
          </Button>

          <Divider sx={{ my: 2, borderColor: '#333' }} />

          {/* Voice Stats */}
          <Box sx={{ textAlign: 'left', mb: 2 }}>
            <Typography variant="subtitle2" sx={{ color: '#aaa' }}>
              Voice Generated: <span style={{ color: '#fff' }}>{voiceGenerated}</span>
            </Typography>
            <Typography variant="subtitle2" sx={{ color: '#aaa' }}>
              Downloads: <span style={{ color: '#fff' }}>{downloadCount}</span>
            </Typography>
          </Box>

          <Divider sx={{ my: 2, borderColor: '#333' }} />

          <Button
            fullWidth
            variant="outlined"
            onClick={handleOpenPasswordDialog}
            sx={{ mb: 2, borderColor: '#6D5DFB', color: '#6D5DFB' }}
          >
            Change Password
          </Button>

          <Button
            variant="contained"
            color="secondary"
            fullWidth
            sx={{
              bgcolor: '#6D5DFB',
              borderRadius: 3,
              fontWeight: 600,
              fontSize: 16,
              py: 1.2,
              textTransform: 'none',
              boxShadow: '0 2px 8px #6D5DFB33',
              mb: 1.5,
            }}
            onClick={handleSignOut}
          >
            Sign Out
          </Button>

          <Button
            fullWidth
            variant="outlined"
            color="error"
            onClick={handleDeleteAccount}
            sx={{ borderColor: '#ff5555', color: '#ff5555' }}
          >
            Delete Account
          </Button>
        </Paper>
      </Box>

      {/* Password Dialog */}
      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          {changePwdStep === 0 && (
            <TextField
              label="Current Email"
              type="email"
              fullWidth
              value={changeEmail}
              onChange={(e) => setChangeEmail(e.target.value)}
              sx={{ mt: 1, mb: 2 }}
            />
          )}
          {changePwdStep === 1 && (
            <>
              <TextField
                label="New Password"
                type="password"
                fullWidth
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Confirm New Password"
                type="password"
                fullWidth
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
              />
            </>
          )}
          {changePwdError && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {changePwdError}
            </Typography>
          )}
          {changePwdSuccess && (
            <Typography color="success.main" variant="body2" sx={{ mt: 1 }}>
              {changePwdSuccess}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)}>Cancel</Button>
          {changePwdStep === 0 ? (
            <Button onClick={handleEmailSubmit}>Next</Button>
          ) : (
            <Button onClick={handlePasswordChangeSubmit}>Update</Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Sign Out Confirmation Dialog */}
      <Dialog open={signOutDialogOpen} onClose={cancelSignOut}>
        <DialogTitle>Sign Out</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to sign out?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelSignOut}>No</Button>
          <Button onClick={confirmSignOut} color="error">Yes</Button>
        </DialogActions>
      </Dialog>

      {/* Account Deletion Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={cancelDeleteAccount}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            To confirm deletion, type this number: <b>{deleteRand}</b>
          </Typography>
          <TextField
            label="Enter the number"
            value={deleteInput}
            onChange={e => setDeleteInput(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          {deleteError && (
            <Typography color="error" variant="body2" sx={{ mb: 1 }}>
              {deleteError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDeleteAccount}>Cancel</Button>
          <Button onClick={confirmDeleteAccount} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccountPage;
