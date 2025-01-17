import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Alert,
  Button,
  Container,
  IconButton,
  Stack,
  CircularProgress,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Description as FileIcon,
  Close as CloseIcon,
//   CircularProgress
} from '@mui/icons-material';

const Ngodashboard = () => {
  // Labels for file inputs
  const fileLabels = [
    "Employee Details Sheet",
    "Salary Information Document",
    "Performance Review Report",
    "Employee Details Sheet",
    "Salary Information Document",
    "Performance Review Report"
  ];

  // State to store files and their statuses
  const [fileStates, setFileStates] = useState(
    fileLabels.reduce((acc, label) => ({
      ...acc,
      [label]: { file: null, status: 'pending' }
    }), {})
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = '#1976d2'; // MUI primary color
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = '';
  };

  // Handle file drop
  const handleDrop = useCallback((e, label) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = '';

    const file = e.dataTransfer.files[0];
    if (validateFile(file)) {
      handleFileSelection(file, label);
    }
  }, []);

  // Validate file type
  const validateFile = (file) => {
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!validTypes.includes(file.type)) {
      setError('Please upload only PDF or XLSX files');
      return false;
    }
    setError('');
    return true;
  };

  // Handle file selection
  const handleFileSelection = (file, label) => {
    setFileStates(prev => ({
      ...prev,
      [label]: { file, status: 'pending' }
    }));
  };

  // Handle file input change
  const handleFileChange = (event, label) => {
    const file = event.target.files[0];
    if (validateFile(file)) {
      handleFileSelection(file, label);
    }
  };

  // Remove file
  const handleRemoveFile = (label) => {
    setFileStates(prev => ({
      ...prev,
      [label]: { file: null, status: 'pending' }
    }));
  };

  const toBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Check if all required files are present
    const missingFiles = fileLabels.filter(label => !fileStates[label].file);
    if (missingFiles.length > 0) {
      setError(`Please upload all required files: ${missingFiles.join(', ')}`);
      return;
    }

    setUploading(true);

    try {
        // Convert files to base64 and prepare payload
        // const payload = await Promise.all(
        //   Object.keys(fileStates).map(async (label) => {
        //     const file = fileStates[label].file;
        //     const base64 = await toBase64(file);
        //     return {
        //       label,
        //       fileContent: base64, // File content in base64
        //       status: fileStates[label].status // Current status
        //     };
        //   })
        // );
         // Utility function to convert file to Base64
        const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        });
        };

        const ngoName = "xyz-ngo";
        const ngoId = "xyz-ngo-id";
        const type = "PDFdoc"
    
        // Prepare files for upload
        const files = await Promise.all(Object.entries(fileStates).map(async ([label, { file, status }]) => {
          const fileContent = await convertFileToBase64(file); // Convert each file to base64
          return { label, fileContent, status };
        }));
    
        // Construct the payload with ngoName, ngoId, and files data
        const payload = {
          ngoName,
          ngoId,
          files,
          type
        };        
        
        // Send the payload to the Google Apps Script API
        const response = await fetch(
          `${process.env.REACT_APP_NgoInformationApi}`, {
          // 'https://script.google.com/macros/s/AKfycbxm2qA0DvzVUNtbwe4tAqd40hO7NpNU-GNXyBq3gHz_q45QIo9iveYOkV0XqyfZw9V7/exec', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),

        //   body: JSON.stringify({ files: payload }),
          mode: 'no-cors',
        });
    
        if (response.ok) {
          setError('');
          setFileStates(
            fileLabels.reduce((acc, label) => ({
              ...acc,
              [label]: { file: null, status: 'completed' },
            }), {})
            
          );
        } else {
          setError('Failed to upload files. Please try again.');
        }
      } catch (error) {
        console.error('Error uploading files:', error);
        setError('An error occurred during file upload.');
      } finally {
        setUploading(false);
      }

   
    // Your API call logic here
    // setTimeout(() => setUploading(false), 2000); // Simulated upload delay
  };

  // Drop zone styles
  const dropZoneStyles = {
    border: '2px dashed #ccc',
    borderRadius: 1,
    p: 3,
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease',
    '&:hover': {
      borderColor: 'primary.main',
    },
  };

  // File display styles
  const fileDisplayStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    p: 2,
    bgcolor: 'grey.50',
    borderRadius: 1,
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Document Upload System
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={4}>
          {fileLabels.map((label) => (
            <Box key={label}>
              <Typography variant="h6" gutterBottom>
                {label} <Typography component="span" color="error">*</Typography>
              </Typography>

              {!fileStates[label].file ? (
                <Box
                  sx={dropZoneStyles}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, label)}
                >
                  <input
                    type="file"
                    accept=".pdf,.xlsx"
                    onChange={(e) => handleFileChange(e, label)}
                    style={{ display: 'none' }}
                    id={`file-${label}`}
                  />
                  <label htmlFor={`file-${label}`} style={{ cursor: 'pointer' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <UploadIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                      <Typography color="textSecondary">
                        Drag and drop or click to upload PDF or XLSX
                      </Typography>
                    </Box>
                  </label>
                </Box>
              ) : (
                <Box sx={fileDisplayStyles}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FileIcon color="primary" />
                    <Typography noWrap sx={{ maxWidth: 400 }}>
                      {fileStates[label].file.name}
                    </Typography>
                  </Box>
                  <IconButton
                    onClick={() => handleRemoveFile(label)}
                    size="small"
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              )}
            </Box>
          ))}
        </Stack>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={uploading}
            startIcon={uploading ? <CircularProgress size={20} /> : undefined}
            sx={{ minWidth: 200 }}
          >
            {uploading ? 'Uploading...' : 'Submit All Files'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Ngodashboard;














// // export default Ngodashboard;
