import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress
} from '@mui/material';

const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch('https://script.google.com/macros/s/AKfycbz7eoDcN16SrbO67pRjm63IOjPte7e5wmH2WQlJPr1B2bak4fYa-GaLVmUv_bsjlVMt/exec', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify({
          ...formData,
          detail: 'registration',
          status: 'Data entered'
        }),
      });

      setSubmitted(true); // hide form and show success message
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Box elevation={3} sx={{ p: 4 }}>
        {!submitted ? (
          <>
            <Typography variant="h5" color="#4A4A4A" align="center" gutterBottom>
              Please fill this form to signup
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                margin="normal"
                required
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                required
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                required
                variant="outlined"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ width: 'auto', alignSelf: 'start', mt: 2, borderRadius: "100px" }}
              >
                {loading ? <CircularProgress size={24} /> : 'Submit'}
              </Button>
            </Box>
          </>
        ) : (
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Typography variant="h6" color="primary">
              Your data is being submitted and reviewed by admin.
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default SignupForm;
