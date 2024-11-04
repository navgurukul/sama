import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import NGODetails from './NgoDetails';
import { Container } from '@mui/system';
import BeneficiaryData from '../BeneficiaryData';


const TabNavigation = () => {
  const [value, setValue] = useState(0);
  const { id } = useParams();
  const [ngo, setNgo] = useState(null);

  useEffect(() => {
    async function fetchNgoDetails() {
      try {
        const response = await axios.get(
          `https://script.google.com/macros/s/AKfycbxm2qA0DvzVUNtbwe4tAqd40hO7NpNU-GNXyBq3gHz_q45QIo9iveYOkV0XqyfZw9V7/exec?type=registration&orgName=${id}`
        );
        setNgo(response.data.data);
      } catch (error) {
        console.error('Error fetching NGO details:', error);
      }
    }
    fetchNgoDetails();
  }, [id]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  console.log(ngo);

  return (
    <Container maxWidth="lg">
      <Tabs value={value} onChange={handleChange} centered sx={{ my: 4 }}>
        <Tab label="NGO Details" />
        <Tab label="Uploaded Documents" />
        <Tab label="Beneficiary Data" />
        <Tab label="Manage Statuses" />
      </Tabs>

      {value === 0 && ngo && <NGODetails ngo={ngo} />}
      {value === 1 && <div>Uploaded Documents Section</div>}
      {value === 2 && <BeneficiaryData />}
      {value === 3 && <div>Manage Statuses Section</div>}
    </Container>
  );
};

export default TabNavigation;
