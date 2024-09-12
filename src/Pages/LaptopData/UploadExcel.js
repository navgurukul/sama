import React, { useState } from "react";
import {
  Button,
  Typography,
  Container,
  Box,
  Alert,
  Link,
  Paper,
} from "@mui/material";
import * as XLSX from "xlsx";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import "./common.css";

const Upload = () => {
  const [file, setFile] = useState(null); // State to store the selected file
  const [loading, setLoading] = useState(false); // State to manage loading state

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0]; // Get the uploaded file
    if (
      uploadedFile &&
      uploadedFile.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      setFile(uploadedFile); // Set the file if it's a valid Excel file
    } else {
      alert("Please upload an Excel file (.xlsx format)."); // Alert if the file is not valid
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("No file selected!"); // Alert if no file is selected
      return;
    }

    setLoading(true); // Show loader when starting the upload
    const reader = new FileReader(); // Create a FileReader object
    reader.onload = async (event) => {
      const binaryStr = event.target.result; // Read file as binary string
      const workbook = XLSX.read(binaryStr, { type: "binary" }); // Parse the binary string to workbook

      // Convert first sheet data to JSON
      const sheetName = workbook.SheetNames[0]; // Get the first sheet name
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]); // Convert sheet to JSON

      // Add the type to the data being sent to the backend
      const dataToSend = {
        type: "bulkupload",
        data: sheetData,
      };

      // Post data to Google Apps Script
      try {
        await fetch(
          "https://script.google.com/macros/s/AKfycbxDcI2092h6NLFcV2yvJN-2NaHVp1jc9_T5qs0ntLDcltIdRRZw5nfHiZTT9prPLQsf2g/exec",
          {
            method: "POST", 
            body: JSON.stringify(dataToSend), // Data to send
            mode: "no-cors", // Mode for cross-origin request
            headers: {
              "Content-Type": "application/json", // Content-Type header
            },
          }
        );

        alert("Data uploaded successfully!"); // Success alert
      } catch (error) {
        console.error("Error uploading data:", error); // Log the error
        alert("Failed to upload data. Please try again."); // Error alert
      }
      setLoading(false); // Hide loader after completion
    };
    reader.readAsBinaryString(file); // Read the file as binary string
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: "30px" }}>
      {/* Display the loader and overlay if loading is true */}
      {loading && (
        <div className="overlay">
          <div className="loader">Loading...</div>
        </div>
      )}
      <Paper
        elevation={3}
        style={{ padding: "20px", textAlign: "center", marginBottom: "50px" }}
      >
        <Typography variant="h5" gutterBottom>
          Bulk Data Upload
        </Typography>
        <Alert severity="info" style={{ marginBottom: "20px" }}>
          Please upload an Excel file (.xlsx format). You can download the
          sample file to understand the required format.
        </Alert>
        <Link
          href="https://docs.google.com/spreadsheets/d/1GjbjBH1YhzQDD3sVtUJbtht-fKw0zi4Ac5UuvvRfv84/edit?gid=0#gid=0"
          download
          target="_blank"
          style={{ display: "block", marginBottom: "20px" }}
        >
          Download Sample File
        </Link>
        <Box>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            style={{ marginBottom: "12px" }}
          >
            <input
              type="file"
              accept=".xlsx"
              id="file-input"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <label htmlFor="file-input">
              <Button
                variant="contained"
                component="span"
                style={{
                  backgroundColor: "grey",
                  color: "white",
                  marginRight: "13px",
                  padding: "6px 12px",
                }}
                startIcon={<AttachFileIcon style={{ marginRight: "-5px" }} />} 
              >
                Choose File
              </Button>
            </label>
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              disabled={!file} 
            >
              Upload
            </Button>
          </Box>
          {file && (
            <Typography
              variant="body2"
              style={{ marginTop: "10px", color: "gray" }}
            >
              Selected file: {file.name}
            </Typography>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Upload; 
