
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
  const [error, setError] = useState(""); // State to store any error messages

  // Define the expected columns (from the sample file)
  const expectedColumns = [
    "ID",
    "Donor Company Name",
    "RAM",
    "ROM",
    "Manufacturer Model",
    "Processor",
    "Manufacturing Date(if available)",
    "Condition Status",
    "Minor Issues",
    "Major Issues",
    "Other Issues",
    "Inventory Location",
    "Laptop Weight",
    "Mac Address",
    "Status",
    "Working",
    "Battery Capacity"
  ];

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0]; // Get the uploaded file
    if (
      uploadedFile &&
      uploadedFile.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      setFile(uploadedFile); // Set the file if it's a valid Excel file
      setError(""); // Clear any previous errors
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
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 1, // Get headers (first row)
      });

      // Get the column headers from the first row and normalize them by trimming spaces and converting to lowercase
      const fileColumns = sheetData[0].map(col => col.trim().toLowerCase());

      // Normalize expected columns in the same way
      const normalizedExpectedColumns = expectedColumns.map(col =>
        col.trim().toLowerCase()
      );

      // Check if the uploaded file has the same columns as the expected ones
      const isValid = normalizedExpectedColumns.every(
        (col, index) => col === fileColumns[index]
      );

      if (!isValid) {
        setError(
          "The uploaded file does not match the expected format. Please upload a valid file."
        );
        setLoading(false);
        return;
      }

      // ✅ Convert the sheet to JSON format with headers
    const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // ✅ Validation: check Inventory Location for each row
    const allowedLocations = [
      "Sarjapur Campus Bangalore",
      "Anish Jadhav Memorial Foundation Navgurukul Campus Pune",
    ];

    const invalidRows = jsonData.filter((row) => {
      const inventoryValid = allowedLocations.some(
        (loc) => loc.toLowerCase() === String(row["Inventory Location"]).toLowerCase()
      );
    
      const idValid = row["ID"] && String(row["ID"]).trim() !== "";
      const donorValid = row["Donor Company Name"] && String(row["Donor Company Name"]).trim() !== "";
    
      return !inventoryValid || !idValid || !donorValid;
    });

    
    // const invalidRows = jsonData.filter(
    //   (row) =>
    //     !allowedLocations.some(
    //       (loc) => loc.toLowerCase() === String(row["Inventory Location"]).toLowerCase()
    //     )
    // );
    

    if (invalidRows.length > 0) {
      setError(
        "Please enter valid Inventory Location as mentioned in the template and ensure ID and Donor Company Name are not empty."
      );
      setLoading(false);
      return;
    }

    // ✅ Proceed only if validation passed
    const dataToSend = {
      type: "bulkupload",
      data: jsonData,
    };

      // If valid, proceed with the upload
      // const dataToSend = {
      //   type: "bulkupload",
      //   data: XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]), // Convert sheet to JSON
      // };

      // Post data to Google Apps Script
      try {
        await fetch(
          `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}`,
          // "https://script.google.com/macros/s/AKfycbxDcI2092h6NLFcV2yvJN-2NaHVp1jc9_T5qs0ntLDcltIdRRZw5nfHiZTT9prPLQsf2g/exec",
          {
            method: "POST",
            body: JSON.stringify(dataToSend),
            mode: "no-cors",
            headers: {
              "Content-Type": "application/json",
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

       {/* ✅ Guide Section */}
  <Paper
    elevation={2}
    style={{
      padding: "16px",
      marginBottom: "30px",
      backgroundColor: "#f9f9f9",
    }}
  >
    <Typography variant="h6" gutterBottom>
      Guide
    </Typography>
    <Typography variant="subtitle1" gutterBottom>
      Before uploading the sheet, please ensure the Inventory Location is correctly entered. Only the following values are allowed:
    </Typography>
    <ul style={{ paddingLeft: "20px", marginTop: "10px" }}>
      <li>"Sarjapur Campus Bangalore"</li>
      <li>"Anish Jadhav Memorial Foundation Navgurukul Campus Pune"</li>
    </ul>
  </Paper>

      <Paper
        elevation={3}
        style={{ padding: "20px", textAlign: "center", marginBottom: "50px" }}
      >
        <Typography variant="h5" gutterBottom>
          Bulk Data Upload
        </Typography>
        <Alert severity="info" style={{ marginBottom: "20px" }}>
          Please upload an Excel file (.xlsx format). You can download the sample file to understand the required format.
        </Alert>
        <Link
          href="https://docs.google.com/spreadsheets/d/1Ph-fjbZmDr9J3V_irEZuShMv21rkFpBspaErCqgZqck/edit?gid=0#gid=0"
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
        {error && (
          <Alert severity="error" style={{ marginTop: "20px" }}>
            {error}
          </Alert>
        )}
      </Paper>
    </Container>
  );
};

export default Upload;

