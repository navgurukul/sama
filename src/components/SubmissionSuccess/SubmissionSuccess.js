import React from 'react';
import { Box, Typography } from '@mui/material';
import SubmissionSuccessImage from "../../assets/QualityCheck.png"

const SubmissionSuccess = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
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
        Your documents are being reviewed by Sama team. We will reach you within 48 hours.
      </Typography>
    </Box>
  );
};

export default SubmissionSuccess;
