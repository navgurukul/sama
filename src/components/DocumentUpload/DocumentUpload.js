import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
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
    border: '2px dashed',
    borderColor: 'primary.main',
    borderRadius: 1,
    p: 3,
    textAlign: 'center',
    cursor: 'pointer',
  };

  return  (
    submitted ? (
      <SubmissionSuccess />
    ) : (
      <Container maxWidth="md" sx={{ py: 4 }}>
     
        <Paper elevation={0} sx={{ p: 4 }}>
         
          <Typography variant="h6" component="h1" align="center" mb="48px" gutterBottom>
            Upload Documents
          </Typography>
  
          <Typography align="center" sx={{ mb: 3, color: '#6E6E6E',bgcolor:"#F8F3F0",p:"16px" ,mb:"48px"}}>
            Supported File format: PDF only
          </Typography>
  
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
          
              {fileLabels.map((label) => (
                <Box key={label}>
                  <Typography variant="subtitle1"  gutterBottom>
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
                        <UploadIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                        <Typography color="primary.main" fontSize="18px">
                          Upload or Drag File
                        </Typography>
                      </Box>
                    </label>
                  </Box>
  
                  {fileStates[label] && (
                    <Paper
                    elevation={2}
                      sx={{
                        mt: 2,
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        // border: '1px solid #ccc',
                        borderRadius: 1,
                        // bgcolor: 'grey.100',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {/* <FileIcon color="primary" /> */}
                        <Typography variant='subtitle1'>Uploaded File: </Typography>
                        <Typography noWrap sx={{ maxWidth: 300,color:"primary.main" }}>
                          {fileStates[label].file.name}
                        </Typography>
                      </Box>
                      <IconButton onClick={() => handleRemoveFile(label)} size="small">
                        <CloseIcon sx={{color:"#828282"}}/>
                      </IconButton>
                    </Paper>
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
                sx={{ minWidth: 200 }}
              >
                {uploading ? 'Uploading...' : 'Submit Documents'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleSkip}
                sx={{ minWidth: 200 }}
              >
                Skip
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
    )
  );
};

export default DocumentUpload;
