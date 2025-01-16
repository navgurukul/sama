import React, {useState, useEffect} from 'react';
import { Box, Typography, Button, Paper, Stack } from '@mui/material';
import { ReportProblem as WarningIcon } from '@mui/icons-material';
import ErrorImagePng from '../../assets/Error1.png'
import { useNavigate, useLocation } from 'react-router-dom';

const AttentionNeeded = () => {
    const [documentsToReupload, setDocumentsToReupload] = React.useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const { failedStatuses } = location.state || {}; // Default to an empty object if state is undefined    
    const NgoId = JSON.parse(localStorage.getItem('_AuthSama_'));
    const storedUserId= NgoId[0].NgoId;

  // Static data representing the failed documents for re-upload
  //   below useeffect is full working
    useEffect(() => {
      
      // Fetch data from the API
      const fetchData = async () => {
        try {
          const response = await fetch(`${process.env.REACT_APP_NgoInformationApi}?type=MultipleDocsGet&userId=${storedUserId}`);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const apiResponse = await response.json();
          // setUserId(apiResponse['User-Id']);
          // setSubfolderId(apiResponse.subfolderId);
          // setNgoName(apiResponse['NGO Name']);
          // Extract failed documents
          
          const failedDocuments = Object.keys(apiResponse)
            .filter(
              (key) =>
                apiResponse[key]?.status !== "Success" &&
                apiResponse[key]?.status !== "Pending Verification" &&
                key !== "User-Id" &&
                key !== "NGO Name" &&
                key !== "isDataAvailable" &&
                key !== "subfolderId"
            )
            .map((key) => ([key]));            
          setDocumentsToReupload(failedDocuments);
        } catch (error) {
          console.error('Error fetching data:', error);

        }
      };

      fetchData();
    }, [storedUserId]);

    const documents = failedStatuses || documentsToReupload;
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 4,
      }}
    >
      <img
        src={ErrorImagePng} // Add the image source here
        alt="Attention Illustration"
        style={{ width: '150px', marginBottom: '20px' }}
      />

      <Typography variant="h6" color="error" gutterBottom>
        Attention Needed!
      </Typography>

      <Typography sx={{ mb: 3, color: 'text.secondary' }}>
        We couldn't verify the documents below. Please re-upload them to <br/> proceed forward.
      </Typography>

      <Stack spacing={3} sx={{ width: '100%', maxWidth: '598px', mb: 4 }}>
        {documents.map((doc, index) => (
          <Paper
            key={index}
            elevation={1}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              bgcolor: 'grey.50',
              mb:2,
              color:'#4A4A4A',
              fontFamily: 'Raleway',
              fontWeight: '700', 
              fontSize: '18px', 
              lineHeight:'30.6px'
            }}
          >
            <Typography>{doc}</Typography>
            <WarningIcon color="error" />
          </Paper>
        ))}
      </Stack>

      <Button
        variant="contained"
        sx={{
          widht: "261px",
          bgcolor: '#5C785A',
          color: 'white',
          fontFamily: 'Raleway',
          fontWeight: '700', 
          fontSize: '18px', 
          lineHeight:'30.6px',
          px: 4,
          py: 1,
          borderRadius: '100px',
        }}
        onClick={() => navigate('/documentreupload')}
      >
        Re-Upload Documents
      </Button>
    </Box>
  );
};

export default AttentionNeeded;


