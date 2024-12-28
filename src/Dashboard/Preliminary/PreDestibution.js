import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid,Card,Button,CardContent, Paper, CircularProgress,Container, } from '@mui/material';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import MOUCard from '../../Pages/MouUpload/MouUpload';
import MouReviewd from '../../Pages/MouUpload/MouReviewd';
import { set } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MonthlyReport from './MonthlyReport';
import YearlyReport from './YearlyReport';

const generateMonthlyDates = (startDate) => {
  const validDate = convertToValidDate(startDate);
  if (isNaN(validDate)) {
    console.error("Invalid date format");
    return [];
  }

  validDate.setMonth(validDate.getMonth() + 1);
  
  const dates = [];
  for (let i = 0; i < 12; i++) {
    const newDate = new Date(validDate);
    newDate.setMonth(newDate.getMonth() + i);
    dates.push(newDate);
  }
  return dates;
};

const generateYearlyDates = (startDate) => {
  if (!startDate) return [];
  const validDate = convertToValidDate(startDate);
  if (isNaN(validDate)) {
    console.error("Invalid date format");
    return [];
  }
  
  const yearlyDate = new Date(validDate);
  yearlyDate.setFullYear(yearlyDate.getFullYear() + 1);
  return [yearlyDate];
};

const convertToValidDate = (input) => {
  const [date, time] = input.split(", ");
  const [day, month, year] = date.split("/");
  return new Date(`${year}-${month}-${day}T${time}`);
};

const formatDate = (date) => {
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "long" });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};


const PreDestibution = ({userId, preliminaryId}) => {
  // State for API data

  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [monthlyMetrixGet, setMonthlyMetrixGet] = useState([]);
  const [yearlyMetrixGet, setYearlyMetrixGet] = useState(null);
  const [showComponentA, setShowComponentA] = useState(true);
  const [monthlyReportingDate, setMonthlyReportingDate] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDataAvailabel, setIsDataAvailabel] = useState(false);

  const NgoId = JSON.parse(localStorage.getItem('_AuthSama_'));
  const gettingStoredData = NgoId[0].NgoId;
  const { id } = useParams();
  const user = id ? id : NgoId[0].NgoId;
  const navigate = useNavigate();

  const monthlyDates = monthlyReportingDate && generateMonthlyDates(monthlyReportingDate);
  const yearlyDates = monthlyReportingDate && generateYearlyDates(monthlyReportingDate);
  
 
  
  
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
  }, [preliminaryId]);
  

  useEffect(() => {
    if (gettingStoredData) {
      fetch(`https://script.google.com/macros/s/AKfycbwnIYg5R0CIPmTNfy-XDJJoVOwEH34LlDlomCD3sCeMA4mnzt-vLqITkXuaj_FzuO75/exec?type=GetYearlyReport&ngoId=${gettingStoredData}`)
        .then((response) => response.json())
        .then((result) => {
          
          setYearlyMetrixGet(result.data);
          setIsDataAvailabel(result.success);


          // if (result.success) {
          //   const rawData = result.data;
          //   const parsedData = Array.isArray(rawData) ? rawData : JSON.parse(rawData);

            
          //   const transformedData = parsedData
          //     .filter((item) => item.trim() !== '')
          //     .map((item) => {
          //       return item.split(',').reduce((acc, pair) => {
          //         const [key, value] = pair.split(':').map((str) => str.trim());
          //         acc[key] = value;
          //         return acc;
          //       }, {});
          //     });
          //   setYearlyMetrixGet(rawData.success);
          // }
          // else{
          //   setYearlyMetrixGet(result.success);
          // }
        })
        .catch((error) => console.error('API error:', error));
    }
  }, [gettingStoredData]);
  console.log(yearlyMetrixGet)



  const handleCardClick = (monthData, monthName , yearName) => {
    navigate('/monthly-report', { state: { monthlyReportData: monthData , monthName, yearName } });
  };

  const handleYearlyCardClick = (data, monthCurrent, year,formattedstartDate ) => {
    navigate('/yearly-report', { 
      state: { 
        yearlyReportData: data,
        monthCurrent,
        year,
        formattedstartDate
      } 
    });
  };
  const monthlyReportingFormHandler = (monthName, yearN) => {
    const month = monthName;
    const year = yearN;
    navigate('/monthly-reporting', { state: { month, year } });
  };

  const yearlyReportingFormHandler = (month, year) => {
    navigate('/yearly-reporting', { state: { month, year } });
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
        <MonthlyReport 
        monthlyDates={monthlyDates} 
        onCardClick={handleCardClick} 
        monthlyReportingFormHandler={monthlyReportingFormHandler}
        currentDate={currentDate}
        monthlyMetrixGet={monthlyMetrixGet}
        formatDate={formatDate}
        />

      {/* {selectedData && <MonthlyReportData monthlyReportData={selectedData} />} */}

      <YearlyReport 
          yearlyDates={yearlyDates}
          onCardClick={handleYearlyCardClick}
          yearlyReportingFormHandler={yearlyReportingFormHandler}
          currentDate={currentDate}
          yearlyMetrixGet={yearlyMetrixGet}
          formatDate={formatDate}
          isDataAvailabel={isDataAvailabel}
          monthlyReportingDate={monthlyReportingDate}

        />
      </>
      }
    </Container>
  );
};
export default PreDestibution;