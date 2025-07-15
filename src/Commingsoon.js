// src/ComingSoonPage.js
import {useState} from 'react';
import { Card, CardContent, Typography, TextField, Button, Box, Grid } from '@mui/material';
import Countdown from 'react-countdown';
import {breakpoints} from "./theme/constant"

const ComingSoonPage = () => {

    const [email_data, setEmail_data] = useState("")
    const [error, setError] = useState("");
    const [submitted, setSubmitted] = useState(false);

  const launchDate = new Date('2024-08-20T14:59:00');

  const handleSubmit = async (e) => {
    
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email_data.trim()) {
      setError("Please enter an email address.");
      return;
    } else if (!emailRegex.test(email_data.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setError(""); // Clear error message if any

    const formData = {
        email_data,
    };
    try {
      const url = "https://script.google.com/macros/s/AKfycbxSJYnC5fpyS9ntix5Tj_Y8DFEzQBlP0I8FTsBqA3ux2y6fzKdaaCUc290p_pqdFTqK8A/exec";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        mode:"no-cors"
      });
      console.log("Response from Google Apps Script:", await response.text());
      setEmail_data("");
      setSubmitted(true);
    } catch (error) {
      console.error("Error sending data to Google Apps Script:", error);
    } 
    // finally {
    //   setLoading(false);
    // }
  };

  const renderer = ({ days, hours, minutes, seconds }) => {
    return (
        <Grid container spacing={2} justifyContent="center" sx={{ marginBottom: '20px' ,}}>
        {[
          { label: 'Days', value: days },
          { label: 'Hours', value: hours },
          { label: 'Minutes', value: minutes },
          { label: 'Seconds', value: seconds },
        ].map((timeUnit, index) => (
          <Grid item key={index}>
            <Box
              sx={{
                padding: '10px',
                borderRadius: '8px',
                backgroundColor: '#5C785A',
                color: 'white',
                textAlign: 'center',
                minWidth: '80px',
              }}
            >
              <Typography variant="h4">{timeUnit.value}</Typography>
              <Typography variant="body2">{timeUnit.label}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f4f4f4',
        padding: '20px ',
      }}
    >
      <Card
        sx={{
          maxWidth: 900,
          width: '100%',
          textAlign: 'center',
          padding: '50px 20px 20px 20px ',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        }}
      >
        <CardContent>
         <img
        src="/samalogo.png"
        alt="Logo"
        style={{ width: '100px', marginBottom: '20px' }}
      />
          <Typography variant="h5" gutterBottom color= "gray" mb = {8}>
            Our website is under construction.
          </Typography>
          <Countdown date={launchDate} renderer={renderer}/>
          <Box
            component="form"
            sx={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}
          >
            {/* Conditional rendering based on submission status */}
          {!submitted ? ( 
              <>
            <Grid xs = {12} sm = {6} >
            <TextField
              label="Enter your email"
              variant="outlined"
              value={email_data}
              onChange={(e) => setEmail_data(e.target.value)}
              required
              sx={{ flexGrow: 1, maxWidth: { xs: '100%', sm: '300px' }, mb: { xs: 2, sm: 0 }, mr: { xs: 0, sm: 2 } }}
            />
            <Button
              variant="contained"
              type="submit"
              onClick = {handleSubmit}
              sx={{
                bgcolor: "#5C785A",
                padding: '15px 20px',
                fontSize: '1em',
                borderRadius: '8px',
                textTransform: 'none',
              }}
            >
              Join the Movement
            </Button>
            </Grid>
            </>
            ) : (
              <Typography variant="h6" color="success.main" mt={2}>
                We appreciate your interest and support for Sama.<br></br> We will be in touch shortly.
              </Typography>
            )}
          </Box>
          {error && (
            <Typography variant="body2" color="error" mt={2}>
              {error}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ComingSoonPage;
