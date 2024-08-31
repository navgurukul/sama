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

const Upload = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (
      uploadedFile &&
      uploadedFile.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      setFile(uploadedFile);
    } else {
      alert("Please upload an Excel file (.xlsx format).");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("No file selected!");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const binaryStr = event.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });

      // Convert first sheet data to JSON
      const sheetName = workbook.SheetNames[0];
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      // Add the type to the data being sent to the backend
      const dataToSend = {
        type: "bulkupload",
        data: sheetData,
      };

      // Post data to Google Apps Script
      try {
        const response = await fetch(
          "https://script.google.com/macros/s/AKfycbxamFLfoY7ME3D6xCQ9f9z5UrhG2Nui5gq06bR1g4aiidMj3djQ082dM56oYnuPFb2PuA/exec",
          {
            method: "POST",
            body: JSON.stringify(dataToSend),
            mode: "no-cors",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        // Since we can't actually get the response, we'll just alert success here
        alert("Data uploaded successfully!");
      } catch (error) {
        console.error("Error uploading data:", error);
        alert("Failed to upload data. Please try again.");
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: "30px" }}>
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
          href="/sample-file.xlsx"
          download
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
                startIcon={<AttachFileIcon style={{ marginRight: "-5px" }} />} // Adjusting the margin
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
