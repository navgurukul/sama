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

  console.log(pendingStatuses, "pendingStatuses");
  
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
    console.log(payload, "PAYLOAD")

    try {
      await fetch(
        "https://script.google.com/macros/s/AKfycbxm2qA0DvzVUNtbwe4tAqd40hO7NpNU-GNXyBq3gHz_q45QIo9iveYOkV0XqyfZw9V7/exec"
        // "https://script.google.com/macros/s/AKfycbyxrgFSvdxkC02T96WQ_44qPpiOGeEQi3Bj_d4T86WUbjTDp6v7aIANEztJp2zpnzD_/exec"
        , {
        method: "POST",
        mode:"no-cors",
        body: JSON.stringify(payload),
      });

      alert("Documents uploaded successfully!");
    } catch (error) {
      console.error("Error uploading documents:", error);
      alert("Failed to upload documents. Please try again.");
    } finally {
      setUploading(false);
      setSubmitted(true);
    }
  };

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await fetch("https://script.google.com/macros/s/AKfycbxm2qA0DvzVUNtbwe4tAqd40hO7NpNU-GNXyBq3gHz_q45QIo9iveYOkV0XqyfZw9V7/exec");
  //       const result = await response.json();
  //       setData(result);
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //     }
  //   };
    

  //   fetchData();
  // }, []);

  
  const handleSkip = () => {
    navigate('/beneficiarydata');
  };

  const dropZoneStyles = {
    border: '2px dashed #ccc',
    borderRadius: 1,
    p: 3,
    textAlign: 'center',
    cursor: 'pointer',
  };

  return  (
    submitted || pendingStatuses ? (
      <SubmissionSuccess />
    ) : (
      <Container maxWidth="md" sx={{ py: 4 }}>
     
        <Paper elevation={3} sx={{ p: 4 }}>
         
          <Typography variant="h6" component="h1" align="center" gutterBottom>
            Upload Documents
          </Typography>
  
          <Typography align="center" sx={{ mb: 3, color: 'text.secondary' }}>
            Supported File format: PDF only
          </Typography>
  
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              {/* <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Name
                </Typography>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{
                    display: "block",
                    marginTop: "10px",
                    width: "100%",
                    padding: "8px",
                  }}
                />
              </Box> */}
  
              {fileLabels.map((label) => (
                <Box key={label}>
                  <Typography variant="subtitle1" gutterBottom>
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
                        <UploadIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                        <Typography color="textSecondary">
                          Upload or Drag File
                        </Typography>
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
                        border: '1px solid #ccc',
                        borderRadius: 1,
                        bgcolor: 'grey.100',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FileIcon color="primary" />
                        <Typography noWrap sx={{ maxWidth: 300 }}>
                          {fileStates[label].file.name}
                        </Typography>
                      </Box>
                      <IconButton onClick={() => handleRemoveFile(label)} size="small">
                        <CloseIcon />
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
