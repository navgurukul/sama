import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress,Container } from '@mui/material';
import axios from 'axios';


const Preliminary = () => {
  // State for API data
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          'https://script.google.com/macros/s/AKfycbyVi1UX63tdxatOS4-21DytCvYvD2v9fdYH72JD5LHHe1P_qd3SpZqO88mbMM_PXgsJGQ/exec?type=getpre&id=5'
        ); // Replace with your API endpoint
        setMetrics(response.data); // Update according to API response structure
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(true);

        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography variant="h6" color="error">
          Failed to load data. Please try again later.
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" mt="10" >
      {/* Main Content */}
      <Box sx={{ mt: 5, textAlign: 'center', background:"#f8f3f0",borderRadius: 2,p:4}}>
        <img
          src={require('../assets/Waiting 2 1.svg').default}
          alt="Illustration"
          style={{ width: 120, marginBottom:14}}
        />
        <Typography variant="body1" color="textSecondary">
          Thanks for submitting the data. Allocation and distribution of laptops will start shortly.
        </Typography>
      </Box>
      <Box sx={{ mt: 5 , backgroundColor: '#f0f4ef', borderRadius: 2,p: 4, mb:5}}>
        <Typography variant="h6" color="primary" sx={{ mb: 3}}>
          Pre-Distribution Metrics
        </Typography>
        
          <Grid container spacing={2}>
            {metrics.map((metric, index) => (
              <React.Fragment key={index}>
                {/* <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle1">NGO ID</Typography>
                  <Typography variant="h6">{metric.ngoId}</Typography>
                </Grid> */}
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle1" sx={{color:"#828282"}}>Number of Schools</Typography>
                  <Typography variant="body1" mb={2} color="textSecondary">{metric["Number of school"]}</Typography>
                
                
                  <Typography variant="subtitle1" sx={{color:"#828282"}}>Number of Teachers</Typography>
                  <Typography variant="body1" mb={2} color="textSecondary">{metric["Number of teacher"]}</Typography>
                
                
                  <Typography variant="subtitle1" sx={{color:"#828282"}}>Number of Students</Typography>
                  <Typography variant="body1" mb={2} color="textSecondary">{metric["Number of student"]}</Typography>
                </Grid>


                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle1" sx={{color:"#828282"}}>Number of Female Students</Typography>
                  <Typography variant="body1" mb={2} color="textSecondary">{metric["Number of Female student"]}</Typography>
               
                 
                
                  <Typography variant="subtitle1" sx={{color:"#828282"}}>Number of States</Typography>
                  <Typography variant="body1" mb={2} color="textSecondary">{metric.States.length}</Typography>

                  <Typography variant="subtitle1" sx={{color:"#828282"}}>Name of States</Typography>
                  <Typography variant="body1" mb={2} color="textSecondary">{metric.States.join(', ')}</Typography>


                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle1" sx={{color:"#828282"}}>Number of Courses</Typography>
                  <Typography variant="body1" mb={2} color="textSecondary">{metric.Courses.length}</Typography>

                  <Typography variant="subtitle1" sx={{color:"#828282"}}>Duration of Each Course</Typography>
                  <Typography variant="body1" mb={2} color="textSecondary">
                    {metric.Courses.map((course, idx) => (
                      <div key={idx}>{course.name}: {course.duration}</div>
                    ))}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>

                </Grid>
                
              </React.Fragment>
            ))}
          </Grid>
       
      </Box>
    </Container>
  );
};

export default Preliminary;
