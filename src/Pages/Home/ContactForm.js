import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Typography, TextField, Button } from '@mui/material';

function ContactForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    setErrors({
      ...errors,
      [name]: validateField(name, value)
    });
  };

  const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
      case 'lastName':
      case 'message':
        return value.length < 3 ? `${name} must be at least 3 characters long` : '';
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? 'Invalid email address' : '';
      default:
        return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      const errorMessage = validateField(field, formData[field]);
      if (errorMessage) {
        newErrors[field] = errorMessage;
      }
    });
    setErrors(newErrors);

    const capitalizedData = {
      "First Name": capitalizeFirstLetter(formData.firstName),
      "Last Name": capitalizeFirstLetter(formData.lastName),
      "Email": formData.email.toLowerCase(),
      "Message": capitalizeFirstLetter(formData.message)
    };

    try {
      await fetch('https://script.google.com/macros/s/AKfycbzvE_7seAHD6CIIaztbdgg79priaBdoNl-yrQcJFtbQ1i8uSnK1Ki2DBb1_eLzkTqG28g/exec', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(capitalizedData),
        mode: 'no-cors'
      });

      setSuccess(true);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        message: ''
      });

      // Hide the success message after 10 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 10000);
    } catch (error) {
      console.error('Error:', error);
      alert('There was an error sending your message.');
    }
  };

  return (
    <Box sx={{ py: 10, backgroundColor:"#FFFAF8" }}>
      <Container maxWidth="lg" style={{ marginBottom: "40px" }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Typography variant="h5">Contact Us</Typography>
            <Typography variant="body1" mt={2}>
              Fill out the form, and we’ll get back to you as soon as possible.
            </Typography>
            
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={6}>
                  <TextField 
                    label="First Name"
                    margin="normal" 
                    fullWidth 
                    variant="outlined" 
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    sx={{ backgroundColor: 'white' }}
                    error={!!errors.firstName}
                    helperText={errors.firstName}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    label="Last Name"
                    margin="normal" 
                    fullWidth 
                    variant="outlined" 
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    sx={{ backgroundColor: 'white' }}
                    error={!!errors.lastName}
                    helperText={errors.lastName}
                  />
                </Grid>
              </Grid>
              
              <TextField 
                fullWidth 
                label="Email" 
                margin="normal" 
                variant="outlined" 
                name="email"
                sx={{ backgroundColor: 'white' }}
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
              />
              <TextField 
                fullWidth 
                label="Message" 
                margin="normal" 
                multiline 
                rows={4} 
                variant="outlined"
                name="message"
                sx={{ backgroundColor: 'white' }}
                value={formData.message}
                onChange={handleChange}
                error={!!errors.message}
                helperText={errors.message}
              />
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                sx={{ borderRadius: "100px", padding: "16px", mt: 2 }}
              >
                Send Message
              </Button>
              {success && (
              <Typography variant="subtitle2" color="green" mt={2}>
                Message sent successfully!
              </Typography>
            )}
            </form>
          </Grid>
          <Grid item xs={12} sm={12} md={4}>
            <img src={require("./assets/Frame outer.svg").default} alt="Contact" width="100%" />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default ContactForm;