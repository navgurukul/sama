import React, { useEffect, useState } from 'react';
import EditUserForm from './EditUserForm';
import { Container, Typography, CircularProgress, Alert } from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const EditUserPage = () => {
  const user = JSON.parse(localStorage.getItem('_AuthSama_'));
  console.log(user)
  const { id } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`https://script.google.com/macros/s/AKfycbxDcI2092h6NLFcV2yvJN-2NaHVp1jc9_T5qs0ntLDcltIdRRZw5nfHiZTT9prPLQsf2g/exec?type=getUserData&userIdQuery=${id}`);
        setUserData(response.data[0]); // Assumes response.data is an array with at least one object
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (formData) => {
    console.log('Submitting form data:', formData);
    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbxDcI2092h6NLFcV2yvJN-2NaHVp1jc9_T5qs0ntLDcltIdRRZw5nfHiZTT9prPLQsf2g/exec', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        mode: 'no-cors',
        body: JSON.stringify({ ...formData,type: "userdetails", ngoId : user[0].NgoId }),
      });
      const result = await response.json();
      if (result.status === 'success') {
        alert('User updated successfully');
      } else {
        alert(`Failed to update user: ${result.message}`);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('An error occurred while updating the user.');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm">
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" align="center" gutterBottom>
        Edit User
      </Typography>
      {userData ? (
        <EditUserForm userData={userData} onSubmit={handleSubmit} />
      ) : (
        <Typography variant="body1" align="center">
          User data not found.
        </Typography>
      )}
    </Container>
  );
};

export default EditUserPage;
