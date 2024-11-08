import React from 'react';
import { Box, Typography, Button, Paper, Stack } from '@mui/material';
import { ReportProblem as WarningIcon } from '@mui/icons-material';
import ErrorImagePng from '../../assets/Error1.png'
import { useNavigate } from 'react-router-dom';


const AttentionNeeded = () => {
    const navigate = useNavigate();

  const documentsToReupload = [
    "12A Registration",
    "FCRA",
    "Financial Report (FY 2023-24)"
  ];

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
        We couldn't verify the documents below. Please re-upload them to proceed forward.
      </Typography>

      <Stack spacing={3} sx={{ width: '100%', maxWidth: '650px', mb: 4 }}>
        {documentsToReupload.map((doc, index) => (
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
          bgcolor: 'green',
          color: 'white',
          ':hover': {
            bgcolor: 'darkgreen',
          },
          px: 4,
          py: 1,
          borderRadius: '5px',
        }}
        onClick={() => navigate('/documentreupload')}
      >
        Re-Upload Documents
      </Button>
    </Box>
  );
};

export default AttentionNeeded;
