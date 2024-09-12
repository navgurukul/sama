import React, { useState } from "react";
import {
  Button,
  Typography,
  Card,
  CardContent,
  CardActions,
  Snackbar,
  Alert,
  CircularProgress,
  Link
} from "@mui/material";
import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import * as XLSX from "xlsx";

function Userdatabulkupload() {
  const [file, setFile] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [loading, setLoading] = useState(false);

  const expectedHeaders = [
    "name",
    "email",
    "contact number",
    "Address",
    "Address State",
    "ID Proof type",
    "ID Proof number",
    "Qualification",
    "Occupation",
    "Date Of Birth",
    "Use case",
    "Number of Family members(who might use the laptop)",
    "status",
    "Laptop Assigned",
    "ID Link"
  ];

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

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const validateHeaders = (sheetData) => {
    const fileHeaders = Object.keys(sheetData[0]); // Get headers from the first row
    return expectedHeaders.every((header) => fileHeaders.includes(header));
  };

  const handleUpload = async () => {
    if (!file) {
      alert("No file selected!");
      return;
    }
    setLoading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const binaryStr = event.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });

      // Convert first sheet data to JSON
      const sheetName = workbook.SheetNames[0];
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      // Validate the headers
      if (!validateHeaders(sheetData)) {
        setSnackbarMessage(
          "The uploaded file does not match the expected format. Please upload a valid file."
        );
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        setLoading(false);
        return;
      }

      // Add the type to the data being sent to the backend
      const dataToSend = {
        type: "userdetailsbulkupload",
        data: sheetData,
      };

      // Post data to Google Apps Script
      try {
        await fetch(
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

        setSnackbarMessage("Data stored successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        setFile(null);  // Clear file after successful upload
      } catch (error) {
        setSnackbarMessage("Failed to upload data. Please try again.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <>
      <Card sx={{ maxWidth: 600, margin: "auto", mt: 4, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Bulk Data Upload
          </Typography>
          <input
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            style={{ display: "none" }}
            id="upload-file"
          />
          <Alert severity="info" style={{ marginBottom: "20px" }}>
            Please upload an Excel file (.xlsx format). You can download the
            sample file to understand the required format.
          </Alert>
          <Link
            href="/Example-Sheet.xlsx"
            download="example.xlsx"
            target="_blank"
            style={{ display: "block", marginBottom: "20px" }}
          >
            Download Sample File
          </Link>

          <label htmlFor="upload-file">
            <Button
              variant="contained"
              component="span"
              startIcon={<CloudUploadIcon />}
            >
              Select .xlsx File
            </Button>
          </label>
          {file && (
            <Typography variant="body1" mt={2}>
              {file.name}
            </Typography>
          )}
        </CardContent>
        <CardActions sx={{ justifyContent: "center" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={!file || loading}
          >
            {loading ? <CircularProgress size={24} /> : "Upload"}
          </Button>
        </CardActions>
      </Card>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default Userdatabulkupload;
