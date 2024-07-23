import React from 'react';
import { Container, Grid, Typography, Link, Box } from '@mui/material';

const Footer = () => {
  return (
    <footer>
      <Box maxWidth="false" bgcolor="primary.light" mt = {6}>
      <Container maxWidth="md">
        <Grid container spacing={4} align = "center">
          {['Column 1', 'Column 2', 'Column 3'].map((column, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Typography variant="h6" gutterBottom>
                {column}
              </Typography>
              {['Item 1', 'Item 2', 'Item 3', 'Item 4'].map((item, idx) => (
                <Link href="#" key={idx} display="block" variant="body1" color="inherit" gutterBottom>
                  {item}
                </Link>
              ))}
            </Grid>
          ))}
        </Grid>
      </Container>
      </Box>
    </footer>
  );
};

export default Footer;
