import React, { useState, useEffect } from "react";
import LocationWiseImpact from "./LocationImpact";
import MonthlyImpact from "./MonthlyImpact";
import YearlyImpact from "./YearlyImpact";
import { Box, Tab, Tabs, Container, Typography, CircularProgress } from "@mui/material";
import AmazonLogo from "./Image/amzon.png";
import CompactDateRangePicker from "./CompactDateRangePicker";
import { useLocation, useNavigate } from "react-router-dom";

const CorporateDb = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(location.state?.tabIndex || 0);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [apiData, setApiData] = useState({}); // Default empty object
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
  
        const response = await fetch(
          "https://script.google.com/macros/s/AKfycbzjIvQJgBpdYwShV6LQOuyNtccmafG3iHFYzmEBQ6FBjiSeT3TuSEyAM46OMYMTsPBC/exec?type=corporatedbStatewise&doner=Amazon"
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
  
        const data = await response.json();
       
        setApiData(data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [dateRange]); // Keep the dependency on dateRange for when user selects dates

  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange);
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      );
    }
  
    if (error) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <Typography variant="h6" color="text.secondary">
            {error}
          </Typography>
        </Box>
      );
    }
  
    if (!apiData || Object.keys(apiData).length === 0) {
      return (
        <Typography variant="h6" align="center">
          No data available
        </Typography>
      );
    }
  
    switch (currentTab) {
      case 0:
        return <LocationWiseImpact dateRange={dateRange} apiData={apiData} />;
      case 1:
        return <MonthlyImpact dateRange={dateRange} apiData={apiData} />;
      case 2:
        return <YearlyImpact />;
      default:
        return null;
    }
  };
  

  const TabStyle = (index) => ({
    textTransform: 'none',
    color: currentTab === index ? '#ffffff' : '#4A4A4A',
    backgroundColor: currentTab === index ? '#FFFAF8' : '#FFFAF8',
    fontWeight: currentTab === index ? 'bold' : 'normal', // Bold selected tab
    borderRadius: '100px',
    marginRight: '10px',
    minHeight: '38px',
    padding: "8px 24px",
    border: '1px solid #5C785A',
    '&.Mui-selected': {
      color: '#ffffff',
      backgroundColor: '#5C785A',
      fontWeight: 'bold' // Ensures bold stays on selected tab
    },
    '&:hover': {
      opacity: 0.9 // Prevents background color change on hover
    }
  });
  useEffect(() => {
    if (location.state?.tabIndex !== undefined) {
      setCurrentTab(location.state.tabIndex);
      navigate("/corporate", { replace: true, state: {} }); // Clears state safely
    }
  }, [location.state, navigate]);
  

  return (
    <Container maxWidth="xl" sx={{ backgroundColor: "#FFFAF8" , marginTop: '-3rem', paddingTop: '3rem' }}>
    <Container maxWidth="lg" sx={{ mt: 8 }}>
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        my: 3 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <img 
            src={AmazonLogo}
            alt="Amazon Logo"
            style={{ height: '40px' }}
          />
          <Box>
            <Typography variant="h6">Digital Hardware Tracker</Typography>
            <Typography variant="body2" color="text.secondary">
              Monitor your e-waste management efforts with ease
            </Typography>
          </Box>
        </Box>
        <CompactDateRangePicker onDateRangeChange={handleDateRangeChange}/>
      </Box>

      <Box sx={{ 
        "& .MuiTabs-indicator": {
          display: "none",
        }
      }}>
        <Tabs 
          value={currentTab}
          onChange={handleTabChange}
          sx={{ mb: 3 }}
        >
          <Tab label="Location-Wise Impact" sx={TabStyle(0)} />
          <Tab label="Monthly Impact" sx={TabStyle(1)} />
          {/* <Tab label="Yearly Impact" sx={TabStyle(2)} /> */}
        </Tabs>
      </Box>

      {renderContent()}
    </Container>
    </Container>
  );
};

export default CorporateDb;
