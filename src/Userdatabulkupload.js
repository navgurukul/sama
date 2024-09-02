import React, { useState } from "react";
import {
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import * as XLSX from "xlsx";

function Userdatabulkupload() {
  const [file, setFile] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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

      // Add the type to the data being sent to the backend
      const dataToSend = {
        type: "userdetailsbulkupload",
        data: sheetData,
      };

      // Post data to Google Apps Script
      try {
        const response = await fetch(
          "https://script.google.com/macros/s/AKfycbyFSqHccZqfs0MH5F7I_CQO20_Ar2Tfbos8pU-zSs4ARN38ecBCg7-hk2Tltp7XB_E9EA/exec",
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
        // alert("Data uploaded successfully!");
        setSnackbarOpen(true);
      } catch (error) {
        alert("Failed to upload data. Please try again.");
      } finally {
        setLoading(false); // Stop loading
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <>
      <Card sx={{ maxWidth: 600, margin: "auto", mt: 4, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom align="center" mt={2}>
            Bulk Data Upload
          </Typography>
          <input
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            style={{ display: "none" }}
            id="upload-file"
          />
          <Box mb={2}>
            <Button
              variant="outlined"
              href="/Example-Sheet.xlsx"
              download="example.xlsx"
            >
              Download Example File
            </Button>
          </Box>
          <label htmlFor="upload-file">
            <Button
              variant="contained"
              component="span"
              startIcon={<CloudUploadIcon />}
            >
              Select File
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
          severity="success"
          sx={{ width: "100%" }}
        >
          Data stored successfully!
        </Alert>
      </Snackbar>
    </>
  );
}

export default Userdatabulkupload;
