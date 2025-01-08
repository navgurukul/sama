import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, CircularProgress, Container } from '@mui/material';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import MOUCard from '../../Pages/MouUpload/MouUpload';
import MouReviewd from '../../Pages/MouUpload/MouReviewd';
import MonthlyNgoReport from './MonthlyNgoReport';
import YearlyNgoReport from './YearlyNgoReport';

// Helper functions for date handling
const parseDate = (dateString) => {
  // Handle ISO format dates (e.g., "2025-01-31T19:51:34.000Z")
  if (dateString.includes('T')) {
    return new Date(dateString);
  }
  
  // Handle format "DD/MM/YYYY, HH:mm:ss"
  const [datePart, timePart] = dateString.split(', ');
  if (!datePart || !timePart) return null;
  
  const [day, month, year] = datePart.split('/');
  if (!day || !month || !year) return null;
  
  // JavaScript months are 0-based
  return new Date(year, parseInt(month) - 1, day);
};

const generateMonthlyDates = (startDate) => {
  if (!startDate) return [];
  
  const parsedStartDate = parseDate(startDate);
  if (!parsedStartDate || isNaN(parsedStartDate.getTime())) {
    console.error("Invalid start date:", startDate);
    return [];
  }

  const dates = [];
  for (let i = 0; i < 12; i++) {
    const newDate = new Date(parsedStartDate);
    newDate.setMonth(parsedStartDate.getMonth() + i + 1); // Start from next month
    dates.push(newDate);
  }
  
  return dates;
};

const generateYearlyDates = (startDate) => {
  if (!startDate) return [];
  
  const parsedStartDate = parseDate(startDate);
  if (!parsedStartDate || isNaN(parsedStartDate.getTime())) {
    console.error("Invalid start date:", startDate);
    return [];
  }

  const yearlyDate = new Date(parsedStartDate);
  yearlyDate.setFullYear(yearlyDate.getFullYear() + 1);
  return [yearlyDate];
};

const formatDate = (date) => {
  if (!date || isNaN(date.getTime())) return '';
  
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "long" });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

// Metrics display component
const MetricsDisplay = ({ metrics }) => (
  <Grid container spacing={2}>
    {metrics.map((metric, index) => (
      <React.Fragment key={index}>
        <Grid item xs={12} sm={6} md={4}>
          <MetricItem label="Number of Schools" value={metric["Number of school"]} />
          <MetricItem label="Number of Teachers" value={metric["Number of teacher"]} />
          <MetricItem label="Number of Students" value={metric["Number of student"]} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MetricItem label="Number of Female Students" value={metric["Number of Female student"]} />
          <MetricItem label="Number of States" value={metric.States.length} />
          <MetricItem label="Name of States" value={metric.States.join(', ')} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MetricItem label="Number of Courses" value={metric.Courses.length} />
          <MetricItem 
            label="Duration of Each Course" 
            value={metric.Courses.map(course => `${course.name}: ${course.duration}`).join(', ')} 
          />
        </Grid>
      </React.Fragment>
    ))}
  </Grid>
);

const MetricItem = ({ label, value }) => (
  <>
    <Typography variant="subtitle1" sx={{color:"#828282"}}>{label}</Typography>
    <Typography variant="body1" mb={2} color="textSecondary">{value}</Typography>
  </>
);

const PreDistribution = ({ userId, preliminaryId }) => {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [monthlyMetrixGet, setMonthlyMetrixGet] = useState([]);
  const [yearlyMetrixGet, setYearlyMetrixGet] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [monthlyReportingDate, setMonthlyReportingDate] = useState("");
  const [currentDate] = useState(new Date());
  const [isDataAvailable, setIsDataAvailable] = useState(false);
  const [mouFound, setMouFound] = useState(true);

  
  const { id } = useParams();
  const navigate = useNavigate();
  const NgoId = JSON.parse(localStorage.getItem('_AuthSama_'));
  const gettingStoredData = NgoId[0].NgoId;
  const user = id ? id : NgoId[0].NgoId;

  const monthlyDates = monthlyReportingDate ? generateMonthlyDates(monthlyReportingDate) : [];
  const yearlyDates = monthlyReportingDate ? generateYearlyDates(monthlyReportingDate) : [];


  useEffect(() => {
    // Hide welcome message after 10 seconds
    const timer = setTimeout(() => setShowWelcome(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch preliminary data
  useEffect(() => {
    const fetchPreliminaryData = async () => {
      try {
        const response = await axios.get(
          `https://script.google.com/macros/s/AKfycbyVi1UX63tdxatOS4-21DytCvYvD2v9fdYH72JD5LHHe1P_qd3SpZqO88mbMM_PXgsJGQ/exec?type=getpre&id=${preliminaryId}`
        );
        
        const processedData = response.data.map(metric => ({
          ...metric,
          disabled: isWithinLastTenMinutes(new Date(metric.Unit))
        }));
        
        setMetrics(processedData);
        setMonthlyReportingDate(processedData[0]?.Unit || "");
        setLoading(false);
      } catch (err) {
        console.error('Error fetching preliminary data:', err);
        setError(true);
        setLoading(false);
      }
    };

    preliminaryId && fetchPreliminaryData();
  }, [preliminaryId]);

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
    if (gettingStoredData) {
      fetch(`https://script.google.com/macros/s/AKfycbwnIYg5R0CIPmTNfy-XDJJoVOwEH34LlDlomCD3sCeMA4mnzt-vLqITkXuaj_FzuO75/exec?type=GetYearlyReport&ngoId=${gettingStoredData}`)
        .then((response) => response.json())
        .then((result) => {
          
          setYearlyMetrixGet(result.data);
          setIsDataAvailable(result.success);


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
  

  // Navigation handlers
  const handleMonthlyReport = (monthData, monthName, yearName) => {
    navigate('/monthly-report', { 
      state: { monthlyReportData: monthData, monthName, yearName } 
    });
  };

  const handleYearlyReport = (data, monthCurrent, year, formattedstartDate) => {
    navigate('/yearly-report', { 
      state: { 
        yearlyReportData: data,
        monthCurrent,
        year,
        formattedstartDate
      } 
    });
  };

  const handleMonthlyReporting = (monthName, yearN) => {
    navigate('/monthly-reporting', { state: { month: monthName, year: yearN } });
  };

  const handleYearlyReporting = (month, year) => {
    navigate('/yearly-reporting', { state: { month, year } });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
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
    <Container maxWidth="md" className="mt-10">
      {NgoId[0]?.role[0] === "ngo" && (
        showWelcome ? (
          <WelcomeMessage />
        ) : (
          mouFound?.data ? <MouReviewd /> : <MOUCard ngoid={user} />
        )
      )}

      <Box sx={{ mt: 5, backgroundColor: '#F0F4EF', borderRadius: 2, p: 4, mb: 5 }}>
        <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
          Pre-Distribution Metrics
        </Typography>
        <MetricsDisplay metrics={metrics} />
      </Box>

      {NgoId[0]?.role[0] === "ngo" && (
        <>
          <MonthlyNgoReport 
            monthlyDates={monthlyDates}
            onCardClick={handleMonthlyReport}
            monthlyReportingFormHandler={handleMonthlyReporting}
            currentDate={currentDate}
            monthlyMetrixGet={monthlyMetrixGet}
            formatDate={formatDate}
          />

          <YearlyNgoReport 
            yearlyDates={yearlyDates}
            onCardClick={handleYearlyReport}
            yearlyReportingFormHandler={handleYearlyReporting}
            currentDate={currentDate}
            yearlyMetrixGet={yearlyMetrixGet}
            formatDate={formatDate}
            isDataAvailable={isDataAvailable}
            monthlyReportingDate={monthlyReportingDate}
          />
        </>
      )}
    </Container>
  );
};

const WelcomeMessage = () => (
  <Box sx={{ mt: 5, textAlign: 'center', background: "#F8F3F0", borderRadius: 2, p: 4 }}>
    <img
      src={require('../assets/Waiting 2 1.svg').default}
      alt="Illustration"
      style={{ width: 120, marginBottom: 14 }}
    />
    <Typography variant="body1" color="textSecondary">
      Thanks for submitting the data. Allocation and distribution of laptops will start shortly.
    </Typography>
  </Box>
);

const isWithinLastTenMinutes = (date) => {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  return date > tenMinutesAgo;
};

export default PreDistribution;