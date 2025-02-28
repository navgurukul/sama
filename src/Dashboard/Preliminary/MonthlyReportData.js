import React, { useState } from 'react';
import { Box, Paper, Typography, Button, IconButton, Container } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

function MonthlyReportData() {
  const [expandedState, setExpandedState] = useState('');
  const [isAllStatesExpanded, setIsAllStatesExpanded] = useState(true);
  
  const NgoId = JSON.parse(localStorage.getItem('_AuthSama_'));
  const gettingStored = NgoId[0].role[0];
  const { id } = useParams();
  const user = id ? id : NgoId[0].NgoId;
  const location = useLocation();
  const navigate = useNavigate();
  const { monthlyReportData, monthName, yearName } = location.state || {};

  const toggleState = (stateName) => {
    setExpandedState(expandedState === stateName ? '' : stateName);
  };

  const toggleAllStates = () => {
    setIsAllStatesExpanded(!isAllStatesExpanded);
  };

  if (!monthlyReportData) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Typography variant="h6">No Report Data Found!</Typography>
      </Box>
    );
  }

  // Get the first state's data to know what metrics to show
  const firstState = Object.values(monthlyReportData)[0];
  const metrics = Object.keys(firstState);

  return (
    <Container maxWidth="lg">
      <Box 
        sx={{
          width: '528px',
          margin: '0 auto',
          mt: "3rem"
        }}
      >
        <Typography variant="h6" fontWeight="bold" color="primary.main" mb={2}>
          {monthName && monthName} {yearName && yearName} Report
        </Typography>

        {/* All States Section */}
        <Paper 
          sx={{ 
            mb: 2, 
            bgcolor: isAllStatesExpanded ? '#F0F4EF' : 'grey.50',
            transition: 'background-color 0.3s'
          }}
        >
          <Box
            onClick={toggleAllStates}
            sx={{
              p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer'
            }}
          >
            <Typography variant="subtitle1" fontWeight="medium">
              Overall Data
            </Typography>
            <IconButton size="small">
              {isAllStatesExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </Box>
          
          {isAllStatesExpanded && (
            <Box p={2} pt={0}>
              {metrics.map((metric) => (
                <Box key={metric} mb={2}>
                  <Typography variant="subtitle1" color="#828282">
                    {metric}
                  </Typography>
                  <Typography variant="body1" color="#4A4A4A">
                    {Object.values(monthlyReportData).reduce((sum, state) => 
                      sum + parseInt(state[metric] || 0), 0
                    )}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Paper>

        {/* State Wise Data */}
        <Typography variant="h6" fontWeight="medium" mb={2}>
          State Wise Data
        </Typography>

        {Object.entries(monthlyReportData).map(([stateName, stateData]) => (
          <Paper 
            key={stateName} 
            sx={{ 
              mb: 2,
              bgcolor: expandedState === stateName ? '#e8f5e9' : 'white',
              transition: 'background-color 0.3s',
              border: '1px solid',
              borderColor: 'grey.200'
            }}
          >
            <Box
              onClick={() => toggleState(stateName)}
              sx={{
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <Typography variant="subtitle1" fontWeight="medium">
                {stateName}
              </Typography>
              <IconButton size="small">
                {expandedState === stateName ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>
            </Box>

            {expandedState === stateName && (
              <Box p={2} pt={0}>
                {Object.entries(stateData).map(([key, value]) => (
                  <Box key={key} mb={2}>
                    <Typography variant="subtitle1" color="#828282">
                      {key}
                    </Typography>
                    <Typography variant="body1" color="#4A4A4A">
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        ))}
      </Box>

      <Box display="flex" justifyContent="center" mt="32px">
        <Button
          variant="contained"
          onClick={() => gettingStored === "admin" ? navigate(`/ngo`) : navigate('/preliminary')}
        >
          Go to Dashboard
        </Button>
      </Box>
    </Container>
  );
}

export default MonthlyReportData;