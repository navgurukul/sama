
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
    "Battery Capacity",
    "Batch"
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

      // Check if all expected columns (or their acceptable aliases) are present in the uploaded file
      const isValid = normalizedExpectedColumns.every((col) => {
        if (col === "manufacturing date(if available)") {
          return fileColumns.includes("manufacturing date(if available)") || fileColumns.includes("manufacturing date");
        }
        return fileColumns.includes(col);
      });

      if (!isValid) {
        setError(
          "The uploaded file does not match the expected format. Please make sure all required columns are present."
        );
        setLoading(false);
        return;
      }

        // ✅ Convert the sheet to JSON format with headers
      const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      const validRows = [];
      const invalidRows = [];

      jsonData.forEach((row, index) => {
        // Skip completely empty rows
        const isEmpty = !Object.values(row).some(
          (val) => val !== null && String(val).trim() !== ""
        );
        if (isEmpty) return;

        const hasId = row["ID"] && String(row["ID"]).trim() !== "";
        const hasDonor = row["Donor Company Name"] && String(row["Donor Company Name"]).trim() !== "";
        const hasLocation = row["Inventory Location"] && String(row["Inventory Location"]).trim() !== "";

        // If the row has ID, Donor, and Location, it is a valid row
        if (hasId && hasDonor && hasLocation) {
          validRows.push(row);
        } else if (hasId && (!hasDonor || !hasLocation)) {
          // Skip incomplete test rows silently so they don't block the upload
          return;
        } else {
          // Row is missing required fields
          invalidRows.push(`Row ${index + 2}: Missing ID or Donor Company Name`);
        }
      });

      if (invalidRows.length > 0) {
        setError(`Please fix validation errors: ${invalidRows.slice(0, 3).join(", ")}${invalidRows.length > 3 ? "..." : ""}`);
        setLoading(false);
        return;
      }

      if (validRows.length === 0) {
        setError("No valid laptop records with complete ID, Donor, and Location were found in the file.");
        setLoading(false);
        return;
      }

      // ✅ Proceed only if validation passed
      const dataToSend = {
        type: "bulkupload",
        data: validRows,
      };

      // If valid, proceed with the upload
      // const dataToSend = {
      //   type: "bulkupload",
      //   data: XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]), // Convert sheet to JSON
      // };

      try {
        const response = await fetch(
          `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}`,
          {
            method: "POST",
            body: JSON.stringify(dataToSend),
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.detail || "Server error occurred during upload.");
        }

        alert("Data uploaded successfully!"); // Success alert
      } catch (error) {
        console.error("Error uploading data:", error); // Log the error
        alert(`Failed to upload data: ${error.message}`); // Error alert
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
          href="https://docs.google.com/spreadsheets/d/13NJWDOFlqC5nuDB7Sf0hJQA3R94O66FjX0oDfSXCgw0/edit?gid=0#gid=0"
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

