// src/Pages/SignIn.js
import React, { useState } from "react";
import { Box, Button, TextField, Typography, Paper, Alert, CircularProgress } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/auth/login`, { email, password });
      const token = res.data.access_token;
      // store token (for dev). In production prefer httpOnly cookies.
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      navigate("/voice");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ height: "100vh", bgcolor: "#0F0F0F", display: "flex", justifyContent: "center", alignItems: "center", color: "#fff" }}>
      <Paper elevation={4} sx={{ p: 4, bgcolor: "#1A1A1A", borderRadius: 4, width: 360 }}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Sign In
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleLogin}>
          <TextField fullWidth label="Email" value={email} onChange={(e) => setEmail(e.target.value)} variant="outlined" sx={{ mt: 2 }} InputProps={{ style: { color: "#fff" } }} InputLabelProps={{ style: { color: "#aaa" } }} />
          <TextField fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} variant="outlined" sx={{ mt: 2 }} InputProps={{ style: { color: "#fff" } }} InputLabelProps={{ style: { color: "#aaa" } }} />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 3, borderRadius: 3, bgcolor: "#6D5DFB" }} disabled={loading}>
            {loading ? <CircularProgress size={22} /> : "Sign In"}
          </Button>
        </form>

        <Typography variant="body2" sx={{ mt: 2, color: "#ccc" }}>
          Don’t have an account? <Link to="/signup" style={{ color: "#6D5DFB" }}>Sign Up</Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default SignIn;
