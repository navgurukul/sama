import React from 'react';
import { Container, Grid, Typography, Link, Box } from '@mui/material';

const Footer = () => {
  return (
    <footer>
      <Box
      maxWidth="false" bgcolor="primary.light" 
      // mt = {6}
      >
      <Container maxWidth="md" >
        <Grid 
        container 
        spacing={4}
        //  align = "center" 
        // pb = {4}
        >
            <Grid item xs={12} sm={10} md={10} >
              <Typography variant="h6" gutterBottom>
                aman
              </Typography>
            </Grid>
            <Grid item xs={12} sm={1} md={1} >
              <Typography variant="h6" gutterBottom>
                aman
              </Typography>
            </Grid>
            <Grid item xs={12} sm={1} md={1} >
              <Typography variant="h6" gutterBottom>
                aman
              </Typography>
            </Grid>
        </Grid>
      </Container>
      </Box>
    </footer>
  );
};

export default Footer;
