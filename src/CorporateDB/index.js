import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Tab, Tabs, Container, Typography, Select, MenuItem } from "@mui/material";
import LocationWiseImpact from "./LocationImpact";
import MonthlyImpact from "./MonthlyImpact";
import YearlyImpact from "./YearlyImpact";
import AmazonLogo from "./Image/amzon.png";

const CorporateDb = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [dateRange, setDateRange] = useState("Sep24-Dec24");

  // Mapping tab names to indices
  const tabMapping = {
    "location-wise-impact": 0,
    "monthly-impact": 1,
    "yearly-impact": 2,
  };

  // Read the tab parameter from the URL when the component loads
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");

    if (tabParam && tabMapping[tabParam] !== undefined) {
      setCurrentTab(tabMapping[tabParam]);
    }
  }, [location]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);

    // Find the corresponding tab key and update the URL
    const tabKey = Object.keys(tabMapping).find((key) => tabMapping[key] === newValue);
    if (tabKey) {
      navigate(`/corpretedb?tab=${tabKey}`, { replace: true });
    }
  };

  // Define tab styles dynamically
  const TabStyle = (index) => ({
    textTransform: "none",
    color: currentTab === index ? "#FFFAF8" : "#4A4A4A",
    backgroundColor: currentTab === index ? "#5C785A" : "#FFFAF8",
    borderRadius: "100px",
    minHeight: "38px",
    marginRight: "24px",
    padding: "8px 24px",
    border: "1px solid #5C785A",
    fontWeight: currentTab === index ? "bold" : "normal",
    "&.Mui-selected": {
      color: "#ffffff",
      backgroundColor: "#5C785A",
    },
    "&:hover": {
      backgroundColor: currentTab === index ? "#5C785A" : "#FFFAF8",
      opacity: 0.9,
    },
  });

  // Render tab content dynamically
  const renderContent = () => {
    switch (currentTab) {
      case 0:
        return <LocationWiseImpact />;
      case 1:
        return <MonthlyImpact />;
      case 2:
        return <YearlyImpact />;
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 8, backgroundColor: "#FFFAF8" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", my: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, marginLeft: "5px" }}>
          <img src={AmazonLogo} alt="Amazon Logo" style={{ height: "40px" }} />
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
            bgcolor: "white",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#e0e0e0",
            },
          }}
        >
          <MenuItem value="Sep24-Dec24">Sep'24 - Dec'24</MenuItem>
        </Select>
      </Box>

      {/* Tabs Section */}
      <Box sx={{ "& .MuiTabs-indicator": { display: "none", backgroundColor:"blue" } }}>
        <Tabs value={currentTab} onChange={handleTabChange} sx={{ mb: 3, backgroundColor: "#FFFAF8" }}>
          <Tab label="Location-Wise Impact" sx={TabStyle(0)} />
          <Tab label="Monthly Impact" sx={TabStyle(1)} />
          <Tab label="Yearly Impact" sx={TabStyle(2)} />
        </Tabs>
      </Box>

      {/* Render the selected tab content */}
      {renderContent()}
    </Container>
  );
};

export default CorporateDb;
