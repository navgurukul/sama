import React, {useState} from 'react'
import { Box, Paper, Typography, Button } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

function MonthlyReportData() {
    const NgoId = JSON.parse(localStorage.getItem('_AuthSama_'));
    
    const gettingStored = NgoId[0].role[0] ;
    const { id } = useParams();
    const user = id? id : NgoId[0].NgoId;    
    const location = useLocation();
    const navigate = useNavigate();
    const { monthlyReportData, monthName, yearName } = location.state || {};
    
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

  return (
    monthlyReportData && 
        <>
        <Box
        display="flex"
        justifyContent="center"
      >
        <Paper
          sx={{
            width: '528px',
            padding: '32px',
            backgroundColor: 'primary.light',
            textAlign: 'left',
          }}
        >
          <Typography variant="h6" fontWeight="bold" color="primary.main" mb={2}>
          {monthName && monthName} {yearName && yearName} Monthly Report
          </Typography>
          {Object.entries(monthlyReportData).map(([question, answer], index) => (
            <Box key={index} mb={2}>
              <Typography variant="subtitle1" 
              color="#828282"
              >
                {question}
              </Typography>
              <Typography variant="body1" color="#4A4A4A">{answer}</Typography>
            </Box>
          ))}
  
          
        </Paper>
       
      </Box> 
       <Box display="flex" justifyContent="center" mt={2}>
            <Button
              variant="contained"
              // sx={{
              //   backgroundColor: '#2e523c',
              //   color: '#ffffff',
              //   '&:hover': { backgroundColor: '#3a6e4b' },
              // }}
             onClick={() =>  (gettingStored === "admin") ? navigate(`/ngo`) : navigate('/preliminary')} 
            >
              Go to Dashboard
            </Button>
          </Box>
      </>
  )
}

export default MonthlyReportData