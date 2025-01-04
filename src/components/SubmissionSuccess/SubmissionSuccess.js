import React, {useState, useEffect} from 'react';
import { Box, Typography } from '@mui/material';
import SubmissionSuccessImage from "../../assets/QualityCheck.png"
import AttentionNeeded from '../AttentionNeeded/AttentionNeeded';
import { useNavigate } from 'react-router-dom';

const SubmissionSuccess = () => {

  const NgoId = JSON.parse(localStorage.getItem('_AuthSama_'));
  const storedUserId= NgoId[0].NgoId;
  const navigate = useNavigate();

  // Static data representing the failed documents for re-upload
  //   below useeffect is full working
  useEffect(() => {
    // Fetch data from the API
    const fetchData = async () => {
      try {
        const response = await fetch(`https://script.google.com/macros/s/AKfycbxm2qA0DvzVUNtbwe4tAqd40hO7NpNU-GNXyBq3gHz_q45QIo9iveYOkV0XqyfZw9V7/exec?type=MultipleDocsGet&userId=${storedUserId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const apiResponse = await response.json();
        
        const statuses = Object.entries(apiResponse).reduce(
          (acc, [key, value]) => {
            if (value?.status) {
              acc[value.status === "Success" ? "success" : value.status === "Pending Verification" ? "pending" : "failed"].push({
                name: key,
                ...value,
              });
            }
            return acc;
          },
          { success: [], pending: [], failed: [] }
        );

        // Log based on priority
        if (statuses.failed.length > 0) {
          navigate('/attentionneeded');
        } else if (statuses.pending.length > 0) {
          navigate('');
        }
        else {
          try {
            const response = await fetch("https://script.google.com/macros/s/AKfycbxm2qA0DvzVUNtbwe4tAqd40hO7NpNU-GNXyBq3gHz_q45QIo9iveYOkV0XqyfZw9V7/exec?type=registration")
            const result = await response.json();
            const finduser = result.data.find(item => item.Id === storedUserId);
            if (finduser["Ngo Type"] === "1 to one") {
              navigate("/beneficiarydata");
            }
            else {
              navigate("/preliminary");
            }
          }
          catch (error) {
            console.error('Error fetching data:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Handle the error as needed
      }
    };

    fetchData();
  }, [storedUserId, navigate]);


  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        // height: '100vh',
        textAlign: 'center',
        padding: '20px',
      }}
    >
      <img
        src={SubmissionSuccessImage} 
        alt="Success Illustration"
        style={{ width: '150px', marginBottom: '20px' }}
      />
      <Typography variant="body1">
        Your documents are being reviewed by Sama team.We <br/>will reach you within 48 hours.
      </Typography>
    </Box>
  );
};

export default SubmissionSuccess;
