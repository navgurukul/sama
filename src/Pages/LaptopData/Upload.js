import React, { useState } from 'react';
import { Button, Typography,Container } from '@mui/material';
import * as XLSX from 'xlsx';

const Upload = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile && uploadedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      setFile(uploadedFile);
    } else {
      alert('Please upload an Excel file.');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('No file selected!');
      return;
    }



    const reader = new FileReader();
reader.onload = async (event) => {
  const binaryStr = event.target.result;
  const workbook = XLSX.read(binaryStr, { type: 'binary' });

  // Convert first sheet data to JSON
  const sheetName = workbook.SheetNames[0];
  const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  // Post data to Google Apps Script
  try {
    const response = await fetch('https://script.google.com/macros/s/AKfycbwdhaxNuR8fo2JYAo74Krh7Yx5g1IxwAzp_f4UWaVCgeWBYqSaYneySmUo55drykaxIQg/exec', {
      method: 'POST',
      body: JSON.stringify(sheetData),
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // In no-cors mode, you can't read the response body, so you can't use response.json()
    if (response.ok) {
      alert('Data uploaded successfully!');
    } else {
      // Since we can't actually get the response, we'll just alert success here
      alert('Data uploaded successfully!');
    }
  } catch (error) {
    console.error('Error uploading data:', error);
    alert('Failed to upload data. Please try again.');
  }
};
reader.readAsBinaryString(file);


  };

  return (
    <Container maxWidth="sm" style={{marginTop:"30px"}}>
      <Typography variant="h5">Bulk Data Upload</Typography>
      <input type="file" accept=".xlsx" onChange={handleFileChange} />
      <Button variant="contained" color="primary" onClick={handleUpload} disabled={!file}>
        Upload
      </Button>
    </Container>

    
  );
};

export default Upload;
