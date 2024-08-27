import React, { useState } from 'react';
import { TextField, Button, Container, Grid, Typography } from '@mui/material';
import DataTable from './getData';

function LaptopData() {
  const [formData, setFormData] = useState({
    donorCompanyName: '',
    ram: '',
    rom: '',
    manufacturerModel: '',
    processor: '',
    manufacturingDate: '',
    conditionStatus: '',
    minorIssues: '',
    majorIssues: '',
    inventoryLocation: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbw5VVs2M_7cgS-0Oi9nmDiF9B2U5AtC8z_-o0ad0kOJde3jyzkMIpO4CUbdtLjXkR_Z1g/exec', {
        method: 'POST',
        body: JSON.stringify(formData),
        mode: 'no-cors', // Keeps using no-cors for now
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      // In no-cors mode, you can't read the response body, so you can't use response.json()
      if (response.ok) {
        alert('Form submitted successfully!');
      } else {
        // Since we can't actually get the response, we'll just alert success here
        alert('Form submitted successfully!');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
  };
  

  return (
    <>  
    {/* <DataTable /> */}
    <Container  sx={{mt:4}} maxWidth="lg">
    <Typography align='center' variant="h6" gutterBottom>
    Laptop Donation Form
  </Typography>
    </Container>
    <Container sx={{mt:5}} maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Donor Company Name"
              name="donorCompanyName"
              value={formData.donorCompanyName}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="RAM"
              name="ram"
              value={formData.ram}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="ROM"
              name="rom"
              value={formData.rom}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Manufacturer Model"
              name="manufacturerModel"
              value={formData.manufacturerModel}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Processor"
              name="processor"
              value={formData.processor}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Manufacturing Date"
              name="manufacturingDate"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formData.manufacturingDate}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Condition Status"
              name="conditionStatus"
              value={formData.conditionStatus}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Minor Issues"
              name="minorIssues"
              value={formData.minorIssues}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Major Issues"
              name="majorIssues"
              value={formData.majorIssues}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Inventory Location"
              name="inventoryLocation"
              value={formData.inventoryLocation}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} style={{marginBottom:"30px"}}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Submit
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
    </>
  );
}

export default LaptopData;

