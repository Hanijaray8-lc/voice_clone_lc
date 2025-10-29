// src/Pages/SignUp.js
import React, { useState } from "react";
import { Box, Button, TextField, Typography, Paper, Alert, CircularProgress } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post(`${API}/api/auth/signup`, { name, email, password });
      // successful signup -> go to signin
      navigate("/signin");
    } catch (err) {
      if (Array.isArray(err.response?.data?.detail)) {
        setError(err.response.data.detail);
      } else {
        setError(err.response?.data?.detail || "Signup failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ height: "100vh", bgcolor: "#0F0F0F", display: "flex", justifyContent: "center", alignItems: "center", color: "#fff" }}>
      <Paper elevation={4} sx={{ p: 4, bgcolor: "#1A1A1A", borderRadius: 4, width: 360 }}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Sign Up
        </Typography>

        {error && Array.isArray(error) ? (
          error.map((e, idx) => (
            <Alert severity="error" sx={{ mb: 2 }} key={idx}>
              {e.msg}
            </Alert>
          ))
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        ) : null}

        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="Full Name" value={name} onChange={(e) => setName(e.target.value)} variant="outlined" sx={{ mt: 1 }} InputProps={{ style: { color: "#fff" } }} InputLabelProps={{ style: { color: "#aaa" } }} />
          <TextField fullWidth label="Email" value={email} onChange={(e) => setEmail(e.target.value)} variant="outlined" sx={{ mt: 2 }} InputProps={{ style: { color: "#fff" } }} InputLabelProps={{ style: { color: "#aaa" } }} />
          <TextField fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} variant="outlined" sx={{ mt: 2 }} InputProps={{ style: { color: "#fff" } }} InputLabelProps={{ style: { color: "#aaa" } }} />

          <Button type="submit" variant="contained" fullWidth sx={{ mt: 3, borderRadius: 3, bgcolor: "#6D5DFB" }} disabled={loading}>
            {loading ? <CircularProgress size={22} /> : "Sign Up"}
          </Button>
        </form>

        <Typography variant="body2" sx={{ mt: 2, color: "#ccc" }}>
          Already have an account? <Link to="/signin" style={{ color: "#6D5DFB" }}>Sign In</Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default SignUp;
