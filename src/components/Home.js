import React from 'react';
// import './Home.css';
import { Container, Grid, Typography, Link, Box, Button, Card, CardContent } from '@mui/material';

function Home() {
  return (
    <Container height = {"100%"}>
    <Typography variant="h4" gutterBottom>
      OLPC Learning happens everywhere
    </Typography>
    <Typography variant="body1" paragraph>
      Let learning go where you decide to go.
    </Typography>
    <Button variant="contained" color="primary">Give Today</Button>
    
    <Grid container spacing={3} style={{ marginTop: 20 }}>
      <Grid item xs={12} md={4}>
        
        <Card>
          <CardContent>
            <Typography variant="h5">Our Causes</Typography>
            <Typography variant="body2">We enable social change through learning.</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        
        <Card>
          <CardContent>
            <Typography variant="h5">Our Donors</Typography>
            <Typography variant="body2">Support from generous individuals and organizations.</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        
        <Card>
          <CardContent>
            <Typography variant="h5">Contact Info</Typography>
            <Typography variant="body2">Miami: +1 305-371-3755</Typography>
            <Typography variant="body2">info@laptop.org</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
    added 
  </Container>
  );
}

export default Home;
