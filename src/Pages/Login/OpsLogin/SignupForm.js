import React, { useState, useEffect } from 'react';
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
    Name: '',
    Email: '',
    Password: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const [existingEmails, setExistingEmails] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');


  useEffect(() => {
    // Fetch the registration data from the backend
    fetch(`${process.env.REACT_APP_UserDetailsApis}?type=getRegistration`) // Replace with your actual Google Apps Script URL
      .then((response) => response.json())
      .then((data) => {
        // Extract email addresses from the response
        const emails = data.map((user) => user.Email.toLowerCase());
        setExistingEmails(emails);
      })
      .catch((err) => {
        console.error('Error fetching registration data:', err);
      });
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(''); // Reset error message before submitting

    const normalizedEmail = formData.Email.trim().toLowerCase();

    // Check if email already exists in the list
    if (existingEmails.includes(normalizedEmail)) {
      setErrorMessage('Your account already exists.'); // Show error message below submit button
      setLoading(false);
      return; // Stop further submission if email exists
    }

    try {
      await fetch(process.env.REACT_APP_UserDetailsApis, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors', // Continue using no-cors for now
        body: JSON.stringify({
          ...formData,
          type: 'addRegistration',
          status: 'Data entered',
        }),
      });

      setSubmitted(true); // Hide form and show success message
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Something went wrong.');
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
                name="Name"
                value={formData.name}
                onChange={handleChange}
                margin="normal"
                required
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Email"
                name="Email"
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
                name="Password"
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
              {errorMessage && (
                <Box sx={{mt: 1}}>
                  <Typography sx={{color: 'red',}}>{errorMessage}</Typography>
                </Box>
              )}
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
