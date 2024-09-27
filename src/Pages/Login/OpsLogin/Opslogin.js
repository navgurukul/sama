import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, Box } from '@mui/material';

function Opslogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [data, setData] = useState();
  const navigate = useNavigate(); 

  // Fetching data from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          'https://script.google.com/macros/s/AKfycbzuFPeG0cosIEGBocwuJ72DWUH6zcg7MtawkOuvOifXqHnm1QlaR7ESxiLKzGua-WQp/exec'
        );
        const result = await response.json();
        setData(result)
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate if both fields are filled
    if (email === '' || password === '') {
      setError('Please fill in both Email and password.');
      return;
    }

    const user = data.find((user) => {
        return user.Email === email && user.Password === password;
      });

    if (user) {
      localStorage.setItem('isLoggedIn', 'true'); 
      setError(''); 

      // Redirect based on role
      if (user.Role === 'Partners') {
        navigate('/dashboard');
      } else if (user.Role === 'ops') {
        navigate('/ops'); 
      } else {
        // navigate('/user');
      }
    } else {
      setError('Invalid Email or password.');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography variant="h4" component="h2" gutterBottom>
        Login
      </Typography>
      {error && (
        <Typography color="error" sx={{ marginBottom: 2 }}>
          {error}
        </Typography>
      )}
      <Box
        component="form"
        sx={{ display: 'flex', flexDirection: 'column', width: '300px' }}
      >
        <TextField
          label="Email"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <TextField
          label="Password"
          variant="outlined"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <Button variant="contained" type="submit" sx={{ marginBottom: 2 }} 
        onClick={handleSubmit}
        >
          Login
        </Button>
      </Box>
    </Box>
  );
}

export default Opslogin;
