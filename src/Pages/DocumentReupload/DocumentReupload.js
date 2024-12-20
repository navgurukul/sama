import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Container,
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

const DocumentReupload = () => {
  const [documentsToReupload, setDocumentsToReupload] = useState([]);
  const [fileStates, setFileStates] = useState({});
  const [uploading, setUploading] = useState(false);
  const [subfolderId, setSubfolderId] = useState("");
  const [userId, setUserId] = useState(null);
  const [ngoName, setNgoName] = useState("");

  // Static data representing the failed documents for re-upload
  //   below useeffect is full working
  //   useEffect(() => {
  //     // Fetch data from the API
  //     const fetchData = async () => {
  //       try {
  //         const response = await fetch('https://script.google.com/macros/s/AKfycbyvLJpbaoDF6PxGGVjDRTWdxr7AZ6IWXniX2y_VgjMj2nLQ4aMD3AulwdyzDO59Eztb/exec?userId=7');
  //         if (!response.ok) {
  //           throw new Error('Network response was not ok');
  //         }
  //         const apiResponse = await response.json();
  //   console.log(apiResponse, "apiResponse")
  //         setUserId(apiResponse['User-Id']);
  //         setSubfolderId(apiResponse.subfolderId);
  //         setNgoName(apiResponse['NGO Name']);
  //         // Extract failed documents
  //         const failedDocuments = Object.keys(apiResponse)
  //           .filter(
  //             (key) =>
  //               apiResponse[key]?.status === "Failed" &&
  //               key !== "User-Id" &&
  //               key !== "NGO Name"
  //           )
  //           .map((key) => ({
  //             name: key,
  //             reason: "Document failed verification",
  //             link: apiResponse[key].link,
  //           }));

  //         setDocumentsToReupload(failedDocuments);
  //       } catch (error) {
  //         console.error('Error fetching data:', error);
  //         // Handle the error as needed
  //       }
  //     };

  //     fetchData();
  //   }, []);

  useEffect(() => {
    // Static data simulating the API response
    const staticApiResponse = {
      "User-Id": 1,
      "NGO Name": "docs",
      subfolderId: "1WH5j7A_RECPz13SLiKXj4X09lj6RfP6c",
      "12A Registration": {
        link: "https://drive.google.com/drive/folders/1WH5j7A_RECPz13SLiKXj4X09lj6RfP6c",
        status: "Failed",
      },
      "80G Certification": {
        link: "https://drive.google.com/drive/folders/1WH5j7A_RECPz13SLiKXj4X09lj6RfP6c",
        status: "Failed",
      },
      "Certificate of Incorporation (COI)": {
        link: "https://drive.google.com/drive/folders/1WH5j7A_RECPz13SLiKXj4X09lj6RfP6c",
        status: "Success",
      },
      "FCRA Approval": {
        link: "https://drive.google.com/drive/folders/1WH5j7A_RECPz13SLiKXj4X09lj6RfP6c",
        status: "Success",
      },
      "Financial Report FY 2021-22": {
        link: "https://drive.google.com/drive/folders/1WH5j7A_RECPz13SLiKXj4X09lj6RfP6c",
        status: "Success",
      },
      "Financial Report FY 2022-23": {
        link: "https://drive.google.com/drive/folders/1WH5j7A_RECPz13SLiKXj4X09lj6RfP6c",
        status: "Success",
      },
      "Financial Report FY 2023-24": {
        link: "https://drive.google.com/drive/folders/1WH5j7A_RECPz13SLiKXj4X09lj6RfP6c",
        status: "Failed",
      },
    };

    setUserId(staticApiResponse["User-Id"]);
    setSubfolderId(staticApiResponse.subfolderId);
    setNgoName(staticApiResponse["NGO Name"]);
    // Extract failed documents
    const failedDocuments = Object.keys(staticApiResponse)
      .filter(
        (key) =>
          staticApiResponse[key]?.status === "Failed" &&
          key !== "User-Id" &&
          key !== "NGO Name"
      )
      .map((key) => ({
        name: key,
        reason: "Document failed verification",
        link: staticApiResponse[key].link,
      }));

    setDocumentsToReupload(failedDocuments);
  }, []);

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

    console.log(payload, "PAYLOAD");
    
    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbwCS2hthFkL5DInylFWpa2tufJVBumLkSSMfrXNdoSbicHUMenpD4qoN7uB-u5jKNl3/exec",
        {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        alert("Documents re-uploaded successfully!");
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error during re-upload:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 4, bgcolor: "grey.100" }}>
        <Typography variant="h6" component="h1" align="center" gutterBottom>
          Re-upload Documents
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          Please re-upload the following documents which failed verification.
        </Alert>

        <Stack spacing={4}>
          {documentsToReupload.map((doc, index) => (
            <Box key={index}>
              <Typography variant="subtitle1" gutterBottom>
                {doc.name}
              </Typography>

              <Alert
                severity="error"
                sx={{ mb: 2, bgcolor: "rgba(255, 235, 238, 0.5)" }}
              >
                Reason for decline: {doc.reason}
              </Alert>

              <Box
                sx={{
                  border: "2px dashed #ccc",
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
                    sx={{ fontSize: 40, color: "text.secondary", mb: 1 }}
                  />
                  <Typography color="textSecondary">
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
                    <Typography noWrap sx={{ maxWidth: 300 }}>
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
              bgcolor: "green",
              color: "white",
              ":hover": { bgcolor: "darkgreen" },
              px: 4,
              py: 1,
              borderRadius: "5px",
            }}
            disabled={uploading}
          >
            {uploading ? <CircularProgress size={24} /> : "Submit Documents"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default DocumentReupload;
