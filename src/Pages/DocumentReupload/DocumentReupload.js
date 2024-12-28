import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  IconButton,
  Stack,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  Description as FileIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

import SubmissionSuccess from "../../components/SubmissionSuccess/SubmissionSuccess";
import { useNavigate } from 'react-router-dom';


const DocumentReupload = () => {
  const [documentsToReupload, setDocumentsToReupload] = useState([]);
  const [fileStates, setFileStates] = useState({});
  const [uploading, setUploading] = useState(false);
  const [subfolderId, setSubfolderId] = useState("");
  const [userId, setUserId] = useState(null);
  const [ngoName, setNgoName] = useState("");
  const [reSubmited, setReSubmited] = useState(false);

  const NgoId = JSON.parse(localStorage.getItem('_AuthSama_'));
  const storedUserId = NgoId[0].NgoId;

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
        setUserId(apiResponse['User-Id']);
        setSubfolderId(apiResponse.subfolderId);
        setNgoName(apiResponse['NGO Name']);
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
          .map((key) => ({
            name: key,
            reason: "Some other documents has been upload",
            link: apiResponse[key]?.link,
          }));


        setDocumentsToReupload(failedDocuments);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Handle the error as needed
      }
    };

    fetchData();
  }, [storedUserId]);


  const handleFileChange = (event, document) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileStates((prev) => ({
          ...prev,
          [document.name]: {
            file,
            base64: reader.result.split(",")[1],
          },
        }));
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please upload a PDF file.");
    }
  };

  const handleRemoveFile = (document) => {
    setFileStates((prev) => ({
      ...prev,
      [document.name]: null,
    }));
  };

  const handleSubmit = async () => {
    if (uploading) return;
    setUploading(true);

    const files = Object.keys(fileStates).map((key) => ({
      name: key,
      mimeType: fileStates[key].file.type,
      file: fileStates[key].base64,
    }));

    const payload = {
      userId: userId,
      ngoName: ngoName,
      subfolderId: subfolderId,
      files,
      type: "MultpleDocsUpdate"
    };

    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbxm2qA0DvzVUNtbwe4tAqd40hO7NpNU-GNXyBq3gHz_q45QIo9iveYOkV0XqyfZw9V7/exec",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          mode: "no-cors",
        }
      );

      setReSubmited(true);
      navigate('/submission-success');
      setUploading(false)
    } catch (error) {
      console.error("Error during re-upload:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    reSubmited ? <SubmissionSuccess /> :
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

          {/* <Alert severity="info" align="center"  */}
          <Typography
          sx={{ 
            mb: 3, 
            mt: 4, 
            width: "592px", 
            height: "94px", 
            bgcolor: '#F8F3F0', 
            padding: '16px',
            borderRadius: "8px" ,
            alignContent: 'center',
            fontWeight: '400', 
            fontSize: '18px', 
            lineHeight:'30.6px',
            color: "#6E6E6E"
          }}>
          Please re-upload the following documents which failed Sama’s verification process.
          {/* </Alert> */}
          </Typography>


          <Stack spacing={4}>
            {documentsToReupload.map((doc, index) => (
              <Box key={index}>
                <Typography variant="subtitle1" gutterBottom sx={{color: '#000000CC',fontWeight: '700', fontSize: '18px', lineHeight:'23.8px'}}>
                  {doc.name}
                </Typography>

                <Typography
                  severity="error"
                  sx={{ mt: 3, mb: 2, height: "56px",bgcolor: "#F8F3F0",padding: "16px", alignContent: "center", color: "#F44336",fontWeight: '400', fontSize: '14px' }}
                >
                  Reason for decline: {doc.reason}
                </Typography>

                <Box
                  sx={{
                    border: "2px dashed #518672",
                    borderRadius: 1,
                    p: 3,
                    textAlign: "center",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange(e, doc)}
                    style={{ display: "none" }}
                    id={`file-${index}`}
                  />
                  <label htmlFor={`file-${index}`} style={{ cursor: "pointer" }}>
                    <UploadIcon
                      sx={{ fontSize: 40, color: "#5C785A", mb: 1 }}
                    />
                    <Typography color="#5C785A">
                      Upload or Drag File
                    </Typography>
                  </label>
                </Box>

                {fileStates[doc.name]?.file && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      border: "1px solid #ccc",
                      borderRadius: 1,
                      bgcolor: "grey.100",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                        {fileStates[doc.name].file.name}
                        </Typography>
                      
                    </Box>
                    <IconButton
                      onClick={() => handleRemoveFile(doc)}
                      size="small"
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                )}
              </Box>
            ))}
          </Stack>

          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{
                bgcolor: "#5C785A",
                color: "white",
                px: 4,
                py: 1,
                borderRadius: "100px",
              }}
              disabled={uploading}
            >
              {uploading ? <CircularProgress size={24} /> : "Submit Documents"}
            </Button>
          </Box>
        </Grid>
      </Grid>
  );
};

export default DocumentReupload;
