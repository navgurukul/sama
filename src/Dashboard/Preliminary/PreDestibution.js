import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid,Card,Button,CardContent, Paper, CircularProgress,Container } from '@mui/material';
import axios from 'axios';
const PreDestibution = ({userId, preliminaryId}) => {
  // State for API data
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const monthlyReports = [
    { month: "January 2024", dueDate: "10th January 2024" },
    { month: "February 2024", dueDate: "10th February 2024" },
    { month: "March 2024", dueDate: "10th March 2024" },
    { month: "April 2024", dueDate: "10th April 2024" },
    { month: "May 2024", dueDate: "10th May 2024" },
    { month: "June 2024", dueDate: "10th June 2024" },
    { month: "July 2024", dueDate: "10th July 2024" },
    { month: "August 2024", dueDate: "10th August 2024" },
    { month: "September 2024", dueDate: "10th September 2024" },
    { month: "October 2024", dueDate: "10th October 2024" },
    { month: "November 2024", dueDate: "10th November 2024" },
    { month: "December 2024", dueDate: "10th December 2024" },
  ];
  const yearlyReport = { title: "Jan 2024 - Dec 2024", dueDate: "10th January 2025" };

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      
      try {
        const response = await axios.get(
          `https://script.google.com/macros/s/AKfycbyVi1UX63tdxatOS4-21DytCvYvD2v9fdYH72JD5LHHe1P_qd3SpZqO88mbMM_PXgsJGQ/exec?type=getpre&id=${preliminaryId}`
        ); // Replace with your API endpoint
        const dateComparedData = response.data.map(metric => {
          const unitDate = new Date(metric.Unit); // Parse unit as date
          const currentDate = new Date(); // Current date and time
          const diffInMinutes = (currentDate - unitDate) / 60000; // Difference in minutes
          return { ...metric, disabled: diffInMinutes <= 10 }; // Add disabled flag
        });
        setMetrics(dateComparedData);
        
        // setMetrics(response.data); // Update according to API response structure
        setLoading(false);
        
      } catch (err) {
        console.error(err);
        setError(true);
        setLoading(false);
      }
    };
    fetchData();
  }, [preliminaryId]);
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
      <Box sx={{ mt: 5, textAlign: 'center', background:"#F8F3F0",borderRadius: 2,p:4}}>
        <img
          src={require('../assets/Waiting 2 1.svg').default}
          alt="Illustration"
          style={{ width: 120, marginBottom:14}}
        />
        <Typography variant="body1" color="textSecondary">
          Thanks for submitting the data. Allocation and distribution of laptops will start shortly.
        </Typography>
      </Box>
      <Box sx={{ mt: 5 , backgroundColor: '#F0F4EF', borderRadius: 2,p: 4, mb:5}}>
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
      <Typography variant="h6" gutterBottom sx={{color:"#4A4A4A"}}>
        Monthly Report
      </Typography>
      <Grid container spacing={3}>
        {monthlyReports.map((report, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card  style={{ height: "100%" }} sx={{backgroundColor:"#E0E0E0"}}>
              <CardContent>
                <Typography variant="subtitle1" mt={1} ml={2} sx={{color:"#828282"}}>{report.month}</Typography>
                <Typography color="textSecondary" variant="body1" mt={1} ml={2}>Due by {report.dueDate}</Typography>
                <Button variant="subtitle1" 
                 sx={{ marginTop: "25px", marginLeft:"29%", color:"#828282"}} 
                // disabled
                >
                  Submit Report &rarr;
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Typography variant="h6" gutterBottom style={{ marginTop: "40px",color:"#4A4A4A" }}>
        Yearly Report
      </Typography>
      <Grid container spacing={3} mb={5}>
        <Grid item xs={12} sm={6} md={4}>
          <Card style={{ height: "100%" }} sx={{backgroundColor:"#E0E0E0"}}>
            <CardContent>
              <Typography variant="subtitle1" mt={1} ml={2} sx={{color:"#828282"}}>{yearlyReport.title}</Typography>
              <Typography color="textSecondary" variant="body1" mt={1} ml={2}>Due by {yearlyReport.dueDate}</Typography>
              <Button variant="text" sx={{ marginTop: "25px", marginLeft:"29%", color:"#828282"}}>
                Submit Report &rarr;
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};
export default PreDestibution;