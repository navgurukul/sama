import React from 'react';
import { useNavigate } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Typography from '@mui/material/Typography';

function BackButton({ fallback = '/', className }) {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1); // Navigate to the previous route
    } else {
      navigate(fallback); // Navigate to the fallback route
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} className={className}>
      <IconButton onClick={handleGoBack} aria-label="back" style={{ padding: '0' }}>
        <ChevronLeftIcon style={{ color: 'black' }} />
      </IconButton>
      <Typography
        variant="body1"
        onClick={handleGoBack}
        style={{ marginLeft: '8px', color: 'black', fontWeight: 'bold' }}
      >
        Back
      </Typography>
    </div>
  );
}

export default BackButton;

