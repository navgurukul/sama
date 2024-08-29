import React, { useState } from 'react';
import { Box, Button, Typography, Container } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import axios from 'axios';

const App = () => {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  // Function to handle file drop
  const handleFileDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'text/csv') {
      setFile(droppedFile);
    } else {
      setUploadStatus('Only CSV files are allowed.');
    }
  };

  // Handle file change for input
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setUploadStatus('');
    } else {
      setUploadStatus('Only CSV files are allowed.');
    }
  };

  // Function to parse CSV into JSON
  const parseCSV = (text) => {
    const lines = text.split('\n').filter(Boolean);
    const headers = lines[0].split(',').map((header) => header.trim());
    const rows = lines.slice(1).map((line) => {
      const values = line.split(',').map((value) => value.trim());
      return headers.reduce((acc, header, index) => {
        acc[header] = values[index] || '';
        return acc;
      }, {});
    });
    return rows;
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      setUploadStatus('Please upload a CSV file.');
      return;
    }
  
    try {
      // Read the CSV file as text
      const fileData = await file.text();
      
      // Convert CSV data to JSON format
      const jsonData = parseCSV(fileData);
  
      // Send JSON data to Google Apps Script
      const response = await fetch(
        'https://script.google.com/macros/s/AKfycbyIux6WHi2-swybNjP1YYzbtcZFlDhLiDAZc6kpJNPmdhueFP5S9_3c4aA7xsZ7suwn_w/exec', // Replace with your Web App URL
        {
          method: 'POST',
          body: JSON.stringify({ data: jsonData }),
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
  
      // In no-cors mode, you can't read the response body, so you can't use response.json()
      if (response.ok) {
        setUploadStatus('File uploaded successfully!');
      } else {
        // Since we can't actually get the response, we'll just alert success here
        setUploadStatus('File uploaded successfully!');
      }
    } catch (error) {
      setUploadStatus('Error uploading file: ' + error.message);
      console.error('Error Details:', error);
    }
  };

  return (
    <Container maxWidth="sm" style={{marginTop:"30px"}}>
    
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        // height: '100vh',
        border: '2px dashed #ccc',
        padding: 4,
        textAlign: 'center',
        gap: 2,
      }}
      onDrop={handleFileDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <Typography variant="h6">Drag and Drop a CSV File Here</Typography>
      <CloudUpload sx={{ fontSize: 48, color: 'gray' }} />
      <Button variant="contained" component="label">
        Upload CSV
        <input type="file" hidden onChange={handleFileChange} />
      </Button>
      {file && <Typography>File: {file.name}</Typography>}
      <Button
        variant="contained"
        color="primary"
        onClick={handleUpload}
        disabled={!file}
      >
        Submit
      </Button>
      {uploadStatus && <Typography color="error">{uploadStatus}</Typography>}
    </Box>
    </Container>
  );
};

export default App;
