import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // For navigation
import { Button, FormControl, InputLabel, MenuItem, Select } from '@mui/material'; // MUI Components
import { Container } from '@mui/system';

const CompanySelection = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const navigate = useNavigate();

  // Fetch the company names from your backend/API
  useEffect(() => {
    async function fetchCompanies() {
      try {
        const response = await fetch(`${process.env.REACT_APP_NgoInformationApi}?type=donorID`); // Replace with your API URL
        const data = await response.json();
        setCompanies(data); // Assuming data is an array of company names
      } catch (error) {
        console.error('Error fetching company names:', error);
      }
    }
    fetchCompanies();
  }, []);

  // Handle the change in selection
  const handleChange = (event) => {
    setSelectedCompany(event.target.value);
  };

  // Handle navigation after selection
  const handleNavigate = () => {
    if (selectedCompany) {
      // Construct the route path using the selected company name
      const routePath = `/ngoregistration/${selectedCompany}`;
      navigate(routePath);
    }
  };

  return (
    <Container maxWidth="md" style={{ marginTop: "80px" }}>
      <FormControl fullWidth variant="outlined" margin="normal">
        <InputLabel id="companyDropdownLabel">Select Company</InputLabel>
        <Select
          labelId="companyDropdownLabel"
          id="companyDropdown"
          value={selectedCompany}
          onChange={handleChange}
          label="Select Company"
        >
          <MenuItem value="">
            <em>-- Select a Company --</em>
          </MenuItem>
          {companies?.map((company, index) => (
            <MenuItem key={index} value={company["Donner"]}>
              {company.Donner}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleNavigate} 
        disabled={!selectedCompany}
        style={{ marginTop: "20px" }}
      >
        Go to Company
      </Button>
    </Container>
  );
};

export default CompanySelection;
