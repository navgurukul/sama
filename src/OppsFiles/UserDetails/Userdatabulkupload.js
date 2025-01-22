import React, { useState } from "react";
import {
  Button,
  Typography,
  Box,
  Snackbar,
  Alert,
  CircularProgress,
  Link,
  LinearProgress,
  Card,
  CardContent,
} from "@mui/material";
import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import * as XLSX from "xlsx";

function Userdatabulkupload({ user }) {
  const [file, setFile] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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
    "ID Link",
  ];

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    validateAndSetFile(uploadedFile);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const validateHeaders = (sheetData) => {
    const fileHeaders = Object.keys(sheetData[0]);
    return expectedHeaders.every((header) => fileHeaders.includes(header));
  };

  const handleUpload = async () => {
    if (!file) {
      alert("No file selected!");
      return;
    }

    setLoading(true);
    setProgress(0);
    setUploadComplete(false);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const binaryStr = event.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      if (!validateHeaders(sheetData)) {
        setSnackbarMessage(
          "The uploaded file does not match the expected format. Please upload a valid file."
        );
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        setLoading(false);
        return;
      }

      const updatedSheetData = sheetData.map((entry) => ({
        ...entry,
        Ngo: user,
      }));

      const dataToSend = {
        type: "userdetailsbulkupload",
        data: updatedSheetData,
      };

      const simulateUpload = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(simulateUpload);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

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
        setFile(null);
        setUploadComplete(true); // Mark upload as complete
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

  const validateAndSetFile = (uploadedFile) => {
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

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const previousRoute = () => {
    window.history.back();
  }

  return (
    <>
      <Box mt={3}>
        <Typography
          variant="body2"
          align="left"
          backgroundColor="#F8F3F0"
          sx={{
            padding: "10px",
            mt: 3,
            mb: 2,
            height: "80px",
            borderRadius: "8px",
            alignContent: "center",
          }}
        >
          Please upload an Excel file (.xlsx format). You can download the
          sample file to understand the required format.
        </Typography>
        <Box
          sx={{
            border: "2px dashed #518672",
            borderRadius: 1,
            padding: 6,
            textAlign: "center",
            backgroundColor: isDragging ? "#edf7ed" : "#f9f9f9",
            cursor: "pointer",
            transition: "background-color 0.3s ease",
          }}
          onClick={() => document.getElementById("upload-file").click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CloudUploadIcon sx={{ fontSize: 40, color: "#5C785A" }} />
          <Typography
            variant="subtitle1"
            color="primary"
            sx={{ fontWeight: "700" }}
          >
            {isDragging ? "Drop File Here" : "Upload or Drag File"}
          </Typography>
          {file && (
            <Typography variant="body2" mt={1}>
              Selected file: {file.name}
            </Typography>
          )}
        </Box>
        <input
          type="file"
          accept=".xlsx"
          onChange={handleFileChange}
          style={{ display: "none" }}
          id="upload-file"
        />
        <Box mt={2} align="left">
          <Typography
            color="textPrimary"
            sx={{ display: "inline", textAlign: "left", fontSize: "14px" }}
          >
            Format for learner data:{" "}
          </Typography>
          <Link
            href="https://docs.google.com/spreadsheets/d/1rhsK-Hir7J8HQgDCZHsoFNnpONu14tLP3Jp3d5pGuAs/edit?gid=1579348065#gid=1579348065"
            download
            target="_blank"
            sx={{
              display: "inline",
              color: "primary.main",
              textDecoration: "none",
            }}
          >
            Sample_Beneficiary_Data.xlsx
          </Link>
        </Box>
        <Box display="flex" justifyContent="center" mt={4}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={!file || loading}
          >
            {loading ? <CircularProgress size={24} /> : "Upload"}
          </Button>
        </Box>
        {loading && (
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="subtitle1">
                {file ? file.name : ""}
              </Typography>
              <Box display="flex" alignItems="center" my={2}>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{ flexGrow: 1, mr: 2 }}
                />
                <Typography variant="body2" color="textSecondary">
                  {progress}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}
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
        {uploadComplete && (
          <Box display="flex" justifyContent="center" mt={4}>
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              onClick={previousRoute}
            >
              Return to Dashboard
            </Button>
          </Box>
        )}
      </Box>
    </>
  );
}

export default Userdatabulkupload;
