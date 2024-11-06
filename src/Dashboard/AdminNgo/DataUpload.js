import React from 'react';
import { Typography, Paper, Grid } from '@mui/material';
import './style.css';
import { Container } from '@mui/system';

const DataUpload = ({ ngo }) => {
  return (
   <Container maxWidth="sm" sx={{alignItems: 'center', justifyContent: 'center', textAlign: 'center',mt: 5 }}>
    
   <img src={require("./assets/Files and Folder 1.svg").default} alt="Give India Foundations" />
   <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
   Documents for verification of the laptop request can be approved or declined once uploaded here
   </Typography>
   </Container>
 
  );
};

export default DataUpload;
