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
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Description as FileIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import SubmissionSuccess from '../SubmissionSuccess/SubmissionSuccess'

const DocumentUpload = () => {
  const NgoId = JSON.parse(localStorage.getItem('_AuthSama_'));
  const location = useLocation();

  const { pendingStatuses } = location.state || {}; // Default to an empty object if state is undefined

  
  const userid = NgoId[0].NgoId;
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [fileStates, setFileStates] = useState({});
  const [formData, setFormData] = useState({ name: '', files: [] });
  const [data, setData] = useState([]);
  const [submitted, setSubmitted] = useState(false);


  const fileLabels = [
    "12A Registration",
    "80G Certification",
    "Certificate of Incorporation (COI)",
    "FCRA Approval",
    "Financial Report FY 2023-24",
    "Financial Report FY 2022-23",
    "Financial Report FY 2021-22"
  ];

  const handleFileChange = (event, label) => {
    const file = event.target.files[0];
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
    }
  };

  const handleRemoveFile = (label) => {
    setFileStates((prev) => ({
      ...prev,
      [label]: null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    const files = Object.keys(fileStates).map((label) => ({
      category: label,
      fileName: fileStates[label].file.name,
      mimeType: fileStates[label].file.type,
      file: fileStates[label].base64,
    }));

    const payload = { name: formData.name, files, type: "MultipleDocsUpload" , ngoId: userid,  };

    try {
      await fetch(
        "https://script.google.com/macros/s/AKfycby4zd74Zl-sQYN5b8940ZgOVQEcb5Jam-SNayOzevsrtQmH4nhHFLu936Nwr0-uZVZh/exec"
        , {
        method: "POST",
        mode:"no-cors",
        body: JSON.stringify(payload),
      });
      setUploading(false);
      alert("Documents uploaded successfully!");      
      navigate('/submission-success');
    } catch (error) {
      console.error("Error uploading documents:", error);
      alert("Failed to upload documents. Please try again.");
    } finally {
      setSubmitted(true);
    }
  };
  
  const handleSkip = () => {
    navigate('/beneficiarydata');
  };

  const dropZoneStyles = {
    border: '2px dashed #518672',
    borderRadius: 1,
    p: 3,
    textAlign: 'center',
    cursor: 'pointer',
  };

  return  (
    submitted ? (
      <SubmissionSuccess />
    ) : (
     
      <Grid
      container
      justifyContent="center"
      alignItems="center"
      sx={{ 
        py: 4, 
        width: "592px", 
        margin: "0 auto", 
      }}
    >
      <Grid item>
        <Typography variant="h6" component="h1" align="center" gutterBottom>
          Upload Documents
        </Typography>
    
        <Typography 
          align="center" 
          sx={{ 
            mb: 3, 
            mt: 4, 
            width: "592px", 
            height: "63px", 
            bgcolor: '#F8F3F0', 
            borderRadius: "8px" ,
            alignContent: 'center',
            fontWeight: '700', 
            fontSize: '18px', 
          }}
        >
          Supported File format: PDF only
        </Typography>
    
        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            {fileLabels.map((label) => (
              <Box key={label}>
                <Typography variant="subtitle1" gutterBottom sx={{color: '#4A4A4A',fontWeight: '700', fontSize: '14px'}}>
                  {label}
                </Typography>
                <Box sx={dropZoneStyles}>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange(e, label)}
                    style={{ display: 'none' }}
                    id={`file-${label}`}
                  />
                  <label htmlFor={`file-${label}`} style={{ cursor: 'pointer' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <UploadIcon sx={{ fontSize: 40, color: '#5C785A', mb: 1 }} />
                      <Typography color="#5C785A" 
                        sx={{
                        fontWeight: '700', 
                        fontSize: '14px', 
                        }}>Upload or Drag File</Typography>
                    </Box>
                  </label>
                </Box>
                {fileStates[label] && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderRadius: '8px',
                      height : '79px',
                      border: "1px solid white",
                      boxShadow: '0px 4px 12px 0px rgba(74, 74, 74, 0.08)'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FileIcon color="primary" />
                      <Typography noWrap 
                        sx={{ 
                          maxWidth: 300,
                          fontSize: '18px', 
                          color: '#4A4A4A' }}>
                        Uploaded File: 
                      </Typography>
                      <Typography noWrap 
                        sx={{ 
                          maxWidth: 300,
                          fontWeight: '400', 
                          fontSize: '18px', 
                          color: '#518672' }}>
                        {fileStates[label].file.name}
                      </Typography>
                    </Box>
                    <IconButton onClick={() => handleRemoveFile(label)} size="small" >
                      <CloseIcon sx={{
                        width: '14px',
                        color: '#BDBDBD'}}/>
                    </IconButton>
                  </Box>
                )}
              </Box>
            ))}
          </Stack>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, gap: 2 }}>
            <Button
              variant="contained"
              type="submit"
              disabled={uploading}
              startIcon={uploading ? <CircularProgress size={20} /> : undefined}
              sx={{ width: '230px', borderRadius: '100px', bgColor: '#5C785A', fontSize: '17.2px', fontWeight: '700px' }}
            >
              {uploading ? 'Uploading...' : 'Submit Documents'}
            </Button>
            {/* <Button variant="outlined" onClick={handleSkip} sx={{ minWidth: 200 }}>
              Skip
            </Button> */}
          </Box>
        </form>
      </Grid>
    </Grid>
    
    )
  );
};

export default DocumentUpload;
