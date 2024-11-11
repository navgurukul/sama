import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, Box, Container, Grid,Link, FormLabel } from '@mui/material';
import login_ngo from "./assets/login_ngo.svg";
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

  console.log(data);
  
  
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
      localStorage.setItem('role', JSON.stringify(user.Role)); // Store the role array in localStorage
      localStorage.setItem('_AuthSama_', JSON.stringify([{
        name: user.Name,
        email: user.Email,
        role: user.Role,
        NgoId:user["Ngo Id"]
      }])); // Store the role array in localStorage
      setError(''); 

      // Redirect based on role
      if (user?.Role?.includes('admin')) {
        navigate('/admin-dashboard'); // Admin gets access to all dashboards
      } 
      else if (user?.Role?.includes('ngo')) {
        navigate('/ngo-dashboard'); // Redirect NGO users
      }
       else if (user?.Role?.includes('ops')) {
        navigate('/ops'); // Redirect OPS users
      } 
      else {
          console.log("no role found");
      }
    } else {
      setError('Invalid Email or password.');
    }
  };

  return (

    <Container maxWidth="md" sx={{ my: 10 }}>
      <Grid container spacing={10} alignItems="center">
        <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
          <img 
            src = {login_ngo}
            alt="Small placeholder" 
            style={{ maxWidth: '100%', borderRadius: '8px' }} 
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <Box component="form" 
           sx={{ 
            display: 'flex',
             flexDirection: 'column',
              gap: 1 }}>
            <Typography variant="h5" gutterBottom>
              Login to Dashboard
            </Typography>
            {error && (
        <Typography color="error" sx={{ marginBottom: 2 }}>
          {error}
        </Typography>
      )}
             <Typography sx = {{color : "dark.main", fontWeight : "bold"}} >User Email</Typography>
             {/* <FormLabel >User Name</FormLabel> */}
             <TextField 
              // label="Username" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined" 
              fullWidth 
              // required 
              InputLabelProps={{
                shrink: true,
              }}
            />

            {/* Password Field with Label above */}
            <FormLabel mt={1} >
              <Typography sx = {{color : "dark.main", fontWeight : "bold"}}  >Password</Typography>

              </FormLabel>
            <TextField 
              // label="Password" 
              type="password" 
              variant="outlined" 
              // fullWidth 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              InputLabelProps={{
                shrink: true,
              }}
            />
           
            {/* Forgot Password Link */}
            <Box sx={{ display: 'flex', flexDirection:"column", gap: 2
              //  justifyContent: 'space-between', alignItems: 'center'
                }}>
            <Link href="#" 
              // onClick={handleForgotPassword}
               underline="hover">
                Forgot Password?
              </Link>
              <Button 
              onClick={handleSubmit}
              type="submit" variant="contained" sx={{ 
              width: 'auto', 
              // borderRadius: '20%', 
              alignSelf: 'start', 
              mt: 2 
              }} >
                Login
              </Button>
            </Box>
          </Box>
        </Grid>

      </Grid>
    </Container>
  );
}

export default Opslogin;
