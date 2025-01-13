import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  Container,
  IconButton,
  Stack,
  CircularProgress,
  Paper,
  Snackbar,
  Alert
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Description as FileIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import SubmissionSuccess from '../SubmissionSuccess/SubmissionSuccess';

const DocumentUpload = (filename) => {
  const NgoId = JSON.parse(localStorage.getItem('_AuthSama_'));
  const location = useLocation();
  const { pendingStatuses } = location.state || {};
  
  const userid = NgoId[0].NgoId;
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [fileStates, setFileStates] = useState({});
  const [formData, setFormData] = useState({ name: '', files: [] });
  const [data, setData] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const fileLabels = [
    "12A Registration",
    "80G Certification",
    "Certificate of Incorporation (COI)",
    "FCRA Approval",
    "Financial Report FY 2023-24",
    "Financial Report FY 2022-23",
    "Financial Report FY 2021-22"
  ];

  const areAllDocumentsUploaded = () => {
    return fileLabels.every(label => 
      fileStates[label] && fileStates[label].file && fileStates[label].base64
    );
  };
  const handleFileChange = (file, label) => {
  // const handleFileChange = (event, label) => {
    // event.preventDefault();
    // const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileStates((prev) => ({
          ...prev,
          [label]: {
            file,
            base64: reader.result.split(",")[1],
          },
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setSnackbar({
        open: true,
        message: 'Please upload a PDF file',
        severity: 'error'
      });
    }
  };

  const onDrop = (e, label) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileChange(file, label);
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };


  const handleRemoveFile = (label) => {
    setFileStates((prev) => ({
      ...prev,
      [label]: null,
    }));
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!areAllDocumentsUploaded()) {
      setSnackbar({
        open: true,
        message: 'Please upload all required documents',
        severity: 'error'
      });
      return;
    }

    setUploading(true);
    const files = Object.keys(fileStates).map((label) => ({
      category: label,
      fileName: fileStates[label].file.name,
      mimeType: fileStates[label].file.type,
      file: fileStates[label].base64,
    }));
    const payload = { name: formData.name, files, type: "MultipleDocsUpload", ngoId: userid };
    
    try {
      await fetch(
        "https://script.google.com/macros/s/AKfycbxmnB0YHUm_mPxf1i-Cv465D1kSOrB0w1-dJS1slov_UQPZ0QxMERy_kZ8uZ5KASjBi/exec?type=MultipleDocsUpload",
        {
          method: "POST",
          mode: "no-cors",
          body: JSON.stringify(payload),
        }
      );
      setUploading(false);
      setSnackbar({
        open: true,
        message: 'Documents uploaded successfully!',
        severity: 'success'
      });
      
      setTimeout(() => {
        navigate('/submission-success', { replace: true });
      }, 2000);
    } catch (error) {
      console.error("Error uploading documents:", error);
      setSnackbar({
        open: true,
        message: 'Failed to upload documents. Please try again.',
        severity: 'error'
      });
      setUploading(false);
    }
  };

  const dropZoneStyles = {
    border: '2px dashed #A7A7A7',
    borderRadius: '4px',
    p: 2,
    textAlign: 'center',
    cursor: 'pointer',
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    '&:hover': {
      backgroundColor: '#F8F9FA',
      borderColor: '#678761'
    }
  };

  return (
    <>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          elevation={6}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Container maxWidth="sm" sx={{ py: 2 }}>
        <Paper elevation={0} sx={{ p: 3 }}>
          <Typography 
            variant="h6" 
            component="h1" 
            align="center" 
            sx={{ 
              mb: 2, 
              fontWeight: 500,
              fontSize: '20px',
              color: '#333333'
            }}
          >
            Upload Documents
          </Typography>

          <Typography 
            align="center" 
            sx={{ 
              mb: 3, 
              color: '#6E6E6E', 
              bgcolor: "#F8F3F0", 
              p: "12px",
              fontSize: '14px',
              borderRadius: '4px'
            }}
          >
            Supported File format: PDF only
          </Typography>

          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              {fileLabels.map((label) => (
                <Box key={label}>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      mb: 1, 
                      color: '#4B4B4B',
                      fontSize: '14px',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {label}
                    <span style={{ color: '#E53E3E' }}>*</span>
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={dropZoneStyles}
                    onDragOver={onDragOver}
                    onDrop={(e) => onDrop(e, label)}
                    >
                      <input
                        type="file"
                        accept=".pdf"
                        // onChange={(e) => handleFileChange(e, label)}
                        onChange={(e) => handleFileChange(e.target.files[0], label)}
                        
                        style={{ display: 'none' }}
                        id={`file-${label}`}
                      />
                      <label htmlFor={`file-${label}`} style={{ cursor: 'pointer', width: '100%' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <UploadIcon sx={{ fontSize: 24, color: '#678761', mb: 0.5 }} />
                          <Typography 
                            color="#678761" 
                            fontSize="13px" 
                            sx={{ fontWeight: 500 }}
                          >
                            Upload or Drag File
                          </Typography>
                        </Box>
                      </label>
                    </Box>

                    {fileStates[label] && (
                      <Paper
                        elevation={0}
                        sx={{
                          mt: 1,
                          p: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderRadius: '4px',
                          border: '2px solid #E0E0E0',
                          backgroundColor: '#FAFAFA'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant='body2' color="#666666">
                            Uploaded File:
                          </Typography>
                          <Typography 
                            noWrap 
                            sx={{ 
                              maxWidth: 200, 
                              color: "#678761",
                              fontSize: '13px'
                            }}
                          >
                            {fileStates[label].file.name}
                          </Typography>
                        </Box>
                        <IconButton 
                          onClick={() => handleRemoveFile(label)} 
                          size="small"
                          sx={{ padding: '4px' }}
                        >
                          <CloseIcon sx={{ fontSize: 16, color: "#828282" }} />
                        </IconButton>
                      </Paper>
                    )}
                  </Box>
                </Box>
              ))}
            </Stack>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button
                variant="contained"
                type="submit"
                disabled={uploading || !areAllDocumentsUploaded()}
                startIcon={uploading ? <CircularProgress size={16} /> : undefined}
                sx={{
                  minWidth: 180,
                  height: '40px',
                  textTransform: 'none',
                  fontSize: '14px',
                  backgroundColor: '#678761',
                  '&:hover': {
                    backgroundColor: '#527A4C'
                  },
                  '&.Mui-disabled': {
                    backgroundColor: '#A7A7A7',
                    color: '#FFFFFF'
                  }
                }}
              >
                {uploading ? 'Uploading...' : 'Submit Documents'}
              </Button>
            </Box>
          </form>

          {data && data.length > 0 && (
            <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
              <h2>Document Data</h2>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>User-Id</th>
                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>NGO Name</th>
                    {fileLabels.map((label) => (
                      <th key={label} style={{ border: "1px solid #ddd", padding: "8px" }}>{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={index}>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>{item["User-Id"]}</td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>{item["NGO Name"]}</td>
                      {fileLabels.map((label) => (
                        <td key={label} style={{ border: "1px solid #ddd", padding: "8px" }}>
                          {item[label]?.link ? (
                            <a href={item[label].link} target="_blank" rel="noopener noreferrer">
                              View Document
                            </a>
                          ) : (
                            "No Document"
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Paper>
      </Container>
    </>
  );
};

export default DocumentUpload;