import React, { useState } from "react";
import LocationWiseImpact from "./LocationImpact";
import MonthlyImpact from "./MonthlyImpact";
import YearlyImpact from "./YearlyImpact";
import { Box, Tab, Tabs, Container, Typography, Select, MenuItem ,TabStyle} from "@mui/material";
import AmazonLogo from "./Image/amzon.png";


const CorporateDb = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [dateRange, setDateRange] = useState('Sep24-Dec24');

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const renderContent = () => {
    switch (currentTab) {
      case 0: return <LocationWiseImpact />;
      case 1: return <MonthlyImpact />;
      case 2: return <YearlyImpact />;
      default: return null;
    }
  };



const TabStyle = (index) => ({
    textTransform: 'none',
    color: currentTab === index ? '#ffffff' : '#4A4A4A',
    backgroundColor: currentTab === index ? '#5C785A' : '#ffffff',
    borderRadius: '100px',
    margin: '0 5px',
    minHeight: '38px',
    padding: "8px 24px",
    border: '1px solid #5C785A',
    '&.Mui-selected': {
      color: '#ffffff',
      backgroundColor: '#5C785A'
    },
    '&:hover': {
      backgroundColor: currentTab === index ? '#5C785A' : '#ffffff',
      opacity: 0.9
    }
  });

  return (
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
        
        <Select
          value={dateRange}
          size="small"
          sx={{ 
            minWidth: 150,
            bgcolor: 'white',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#e0e0e0'
            }
          }}
        >
          <MenuItem value="Sep24-Dec24">Sep'24 - Dec'24</MenuItem>
        </Select>
      </Box>

      <Box sx={{ 
        "& .MuiTabs-indicator": {
          display: "none"
        }
      }}>
        <Tabs 
          value={currentTab}
          onChange={handleTabChange}
          sx={{ mb: 3 }}
        >
          <Tab label="Location-Wise Impact" sx={TabStyle(0)} />
          <Tab label="Monthly Impact" sx={TabStyle(1)} />
          <Tab label="Yearly Impact" sx={TabStyle(2)} />
        </Tabs>
      </Box>

      {renderContent()}
    </Container>
  );
};

export default CorporateDb;