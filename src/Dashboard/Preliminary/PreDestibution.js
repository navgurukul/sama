import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid,Card,Button,CardContent, Paper, CircularProgress,Container, } from '@mui/material';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import MOUCard from '../../Pages/MouUpload/MouUpload';
import MouReviewd from '../../Pages/MouUpload/MouReviewd';
import { set } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MonthlyReportData from './MonthlyReportData';

const generateMonthlyDates = (startDate) => {
  const validDate = convertToValidDate(startDate);
  if (isNaN(validDate)) {
    console.error("Invalid date format");
    return [];
  }
  
  const dates = [];
  for (let i = 0; i < 12; i++) {
    const newDate = new Date(validDate);
    newDate.setMonth(newDate.getMonth() + i);
    dates.push(newDate);
  }
  return dates;
};

const convertToValidDate = (input) => {
  const [date, time] = input.split(", ");
  const [day, month, year] = date.split("/");
  return new Date(`${year}-${month}-${day}T${time}`);
};


// Helper function to format the date
const formatDate = (date) => {
  // const day = "10th"; // Fixed day
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "long" }); // Get full month name
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

const PreDestibution = ({userId, preliminaryId}) => {
  // State for API data

  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [monthlyMetrixGet, setMonthlyMetrixGet] = useState([]);
  const [showComponentA, setShowComponentA] = useState(true); // Start with Component A
  const NgoId = JSON.parse(localStorage.getItem('_AuthSama_'));
  const gettingStoredData = NgoId[0].NgoId ;
  const { id } = useParams();
  const user = id? id : NgoId[0].NgoId;
  const navigate = useNavigate();
  const [monthlyReportingDate, setMonthlyReportingDate] = useState(""); // Set your start date here
  const [currentDate, setCurrentDate] = useState(new Date());
  const monthlyDates = monthlyReportingDate && generateMonthlyDates(monthlyReportingDate);
  const [selectedData, setSelectedData] = useState(null);
  
  
  // this is to fetch monthly report 
  useEffect(() => {
    // Fetch data when the component mounts
    fetch(`https://script.google.com/macros/s/AKfycby4zd74Zl-sQYN5b8940ZgOVQEcb5Jam-SNayOzevsrtQmH4nhHFLu936Nwr0-uZVZh/exec?type=GetMonthlyReport&id=${gettingStoredData}`)
      .then((response) => response.json())
      .then((result) => {
        if (result.status === 'success') {

          const rawData = result.data;
          const parsedData = Array.isArray(rawData)
            ? rawData
            : JSON.parse(rawData);

          // Filter out empty values and transform strings into objects
          const transformedData = parsedData
            .filter((item) => item.trim() !== '')
            .map((item) => {
              return item.split(',').reduce((acc, pair) => {
                const [key, value] = pair.split(':').map((str) => str.trim());
                acc[key] = value; // Create key-value pairs
                return acc;
              }, {});
            });
          setMonthlyMetrixGet(transformedData);

        } else {
          console.error('Error fetching data:', result.message);
        }
      })
      .catch((error) => console.error('API error:', error));
  }, [gettingStoredData]);  
  
    useEffect(() => {
      // Set the date once
      setCurrentDate(new Date());
    }, []);


  const yearlyReport = { title: "Jan 2024 - Dec 2024", dueDate: "10th January 2025" };

  const [mouFound, setMouFound] = useState(true);


  // this is to get the data from the mou tab of ngo data sheet
  useEffect(() => {
    async function fetchData() {
      const id = gettingStoredData;      
      try {
        const response = await axios.get(`https://script.google.com/macros/s/AKfycbxm2qA0DvzVUNtbwe4tAqd40hO7NpNU-GNXyBq3gHz_q45QIo9iveYOkV0XqyfZw9V7/exec?type=GetMou&id=${id}`);
        const data = response.data;
        setMouFound(data);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    gettingStoredData && fetchData();
    
  }, [gettingStoredData]); 

  useEffect(() => {
    // Set a timer to switch to Component B after 10 seconds
    const timer = setTimeout(() => {
      setShowComponentA(false);
    }, 10000);

    // Cleanup the timer when the component unmounts
    return () => clearTimeout(timer);
  }, []); 

  // Fetch data from API for the stored preliminary.
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
        if (!monthlyReportingDate && dateComparedData.length > 0) {          
          setMonthlyReportingDate(dateComparedData[0]?.Unit);
        }
      } catch (err) {
        setError(true);
        setLoading(false);
      }
    };
    fetchData();
    // setMonthlyReportingDate(metrics[0]?.Unit);
  }, [preliminaryId]);

  const monthlyReportClickHandler = (month) => {
    const dataForMonth = monthlyMetrixGet.find((data) => new Date(data.date).getMonth() === month);
    if (dataForMonth) {
      navigate(`/monthly-reporting/${month}`);
    }
  };
  const handleCardClick = (monthData) => {
    navigate('/monthly-report', { state: { monthlyReportData: monthData } });
    // setSelectedData(monthData); // Set the selected data to display
  };

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
      {(NgoId[0]?.role[0] === "ngo") ? showComponentA 
      ?
      (<Box sx={{ mt: 5, textAlign: 'center', background:"#F8F3F0",borderRadius: 2,p:4}}>
        <img
          src={require('../assets/Waiting 2 1.svg').default}
          alt="Illustration"
          style={{ width: 120, marginBottom:14}}
        />
        <Typography variant="body1" color="textSecondary">
          Thanks for submitting the data. Allocation and distribution of laptops will start shortly.
        </Typography>
      </Box>) 
       : (mouFound?.data ?  <MouReviewd /> : <MOUCard ngoid = {user}/>) 
       : ""}
      <Box sx={{ mt: 5 , backgroundColor: '#F0F4EF', borderRadius: 2,p: 4, mb:5}}>
        <Typography variant="h6" color="primary" sx={{ mb: 3}}>
          Pre-Distribution Metrics
        </Typography>
          <Grid container spacing={2}>
            {metrics.map((metric, index) => (
              <React.Fragment key={index}>
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
      {(NgoId[0]?.role[0] === "ngo") && 
      <>
        <Typography variant="h6" gutterBottom sx={{color:"#4A4A4A"}}>
          Monthly Report
        </Typography>
        <Grid container spacing={3} mb = {8}>
        {monthlyDates.map((report, index) => {
          const isEnabled = currentDate >= report; // Check if current date has passed the card's date
          const monthName = report.toLocaleString("default", { month: "long" }); // Get full month name
          const year = report.getFullYear(); // Get the year
          
          return (
          <Grid item xs={12} sm={6} md={4} key={index}>
            {monthlyMetrixGet[index] ? 
            <Card  style={{ height: "100%" }} 
            sx={{backgroundColor: !isEnabled && "#E0E0E0"}}
            >
              <CardContent>
                <Typography variant="subtitle1" mt={1} ml={2} sx={{color:"#828282"}}>
                {monthName} {year}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={1} ml={2}>
                    <CheckCircleIcon color="success" />
                    <Typography color="#48A145" variant="subtitle1" ml={1}>
                      Submitted
                    </Typography>
                  </Box>                  
                <Button variant="subtitle1" 
                 sx={{ marginTop: "25px", marginLeft:"29%",
                  }}
                  color = "primary"
                disabled={!isEnabled}
                onClick={() => handleCardClick(monthlyMetrixGet[index])}
                >
                  View Report &rarr;
                </Button>
              </CardContent>
            </Card>
          : 
            <Card  style={{ height: "100%" }} 
            sx={{backgroundColor: !isEnabled && "#E0E0E0"}}
            >
              <CardContent>
                <Typography variant="subtitle1" mt={1} ml={2} sx={{color:"#828282"}}>
                {monthName} {year}
                  </Typography>
                <Typography color="textSecondary" variant="body1" mt={1} ml={2}>
                {"Due by " + formatDate(report)}
                  </Typography>
                <Button 
                variant="subtitle1" 
                 sx={{ marginTop: "25px", marginLeft:"29%",
                  }}
                  color = "primary"
                //  color={isEnabled ? "primary" : "default"}
                disabled={!isEnabled}
                onClick={() => navigate('/monthly-reporting')}
                >
                  Submit Report &rarr;
                </Button>
              </CardContent>
            </Card>
        }
          </Grid>
          )
          })}
      </Grid>

      {/* {selectedData && <MonthlyReportData monthlyReportData={selectedData} />} */}

      {/* <Typography variant="h6" gutterBottom style={{ marginTop: "40px",color:"#4A4A4A" }}>
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
      </Grid>  */}
      </>
      }
    </Container>
  );
};
export default PreDestibution;