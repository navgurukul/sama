import React, { useState, useEffect } from 'react';
import { Button, 
  TextField, 
  Typography, 
  Box, 
  Grid, 
  IconButton, 
  Paper, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { Container } from '@mui/system';

const DonorManager = () => {
  const [isEditMode, setIsEditMode] = useState(false); // Toggle between Edit/Add mode
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [donorId, setDonorId] = useState('');
  const [donorName, setDonorName] = useState('');
  const [questionsListId, setQuestionsListId] = useState([]);
  const [donorList, setDonorList] = useState([]);

  useEffect(() => {
    const fetchFormFields = async () => {
      try {
        const baseURL = 'https://script.google.com/macros/s/AKfycbxm2qA0DvzVUNtbwe4tAqd40hO7NpNU-GNXyBq3gHz_q45QIo9iveYOkV0XqyfZw9V7/exec?type=donorQuestion';
        const response = await fetch(baseURL);
        const data = await response.json();
        setQuestionsListId(data);
      } catch (error) {
        console.error('Error fetching form fields:', error);
      }
    };

    const fetchDonorList = async () => {
      try {
        const donorURL = 'https://script.google.com/macros/s/AKfycbxm2qA0DvzVUNtbwe4tAqd40hO7NpNU-GNXyBq3gHz_q45QIo9iveYOkV0XqyfZw9V7/exec?type=donorID';
        const response = await fetch(donorURL);
        const donors = await response.json();
        setDonorList(donors);
      } catch (error) {
        console.error('Error fetching donor list:', error);
      }
    };

    fetchFormFields();
    fetchDonorList();
  }, [donorId, isEditMode]);

  const handleQuestionToggle = (id) => {
    setSelectedQuestions((prev) =>
      prev.includes(id) ? prev.filter((qId) => qId !== id) : [...prev, id]
    );
  };

  const handleDonorSelection = (event) => {
    const selectedId = event.target.value;
    setDonorId(selectedId);

    const selectedDonor = donorList.find((donor) => donor["Donor id"] === selectedId);
    setDonorName(selectedDonor?.Donner || '');
    const associatedQuestions = selectedDonor?.["questions list id"]
      .split(',')
      .map(Number) || [];
    setSelectedQuestions(associatedQuestions);
  };

  const handleSubmit = async () => {
    const questionsList = selectedQuestions.join(',');
    const payload = {
      donorId,
      questionsListId: questionsList,
      donorName,
      type: "Donor",
    };

    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbxm2qA0DvzVUNtbwe4tAqd40hO7NpNU-GNXyBq3gHz_q45QIo9iveYOkV0XqyfZw9V7/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        mode:"no-cors"
      });

      
      alert(isEditMode ? 'Donor updated successfully.' : 'New donor added successfully.');
      setDonorId('');
      setDonorName('');
      setSelectedQuestions([]);
        
      
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Submission failed.');
    }
  };

  const resetForm = () => {
    setDonorId('');
    setDonorName('');
    setSelectedQuestions([]);
  };

  const renderQuestionsList = () => {
    return questionsListId.map((question) => (
      <Grid item key={question.id} xs={12} sm={6} md={4}>
        <Paper elevation={3} style={{ padding: '10px', marginBottom: '10px' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography>{question.question}</Typography>
            <IconButton onClick={() => handleQuestionToggle(question.id)}>
              {selectedQuestions.includes(question.id) ? (
                <CheckCircleIcon style={{ color: 'green' }} />
              ) : (
                <CancelIcon style={{ color: 'red' }} />
              )}
            </IconButton>
          </Box>
        </Paper>
      </Grid>
    ));
  };

  return (

    <Container maxWidth="lg" p={4} style={{ marginTop: '48px',marginBottom: '48px' }}>
      <Typography variant="h5" pt={4} pb={2} gutterBottom>Donor Management</Typography>

      {/* Buttons to toggle between Edit and Add New Donor */}
      <Box mb={3}>
        <Button
          variant="contained"
          color={isEditMode ? 'primary' : 'default'}
          onClick={() => {
            setIsEditMode(true);
            resetForm();  // Clear fields when switching to Edit Donor
          }}
          sx={{ mr: 2 }}
        >
          Edit Donor
        </Button>
        <Button
          variant="contained"
          color={!isEditMode ? 'primary' : 'default'}
          onClick={() => {
            setIsEditMode(false);
            resetForm();  // Clear fields when switching to Add New Donor
          }}
        >
          Add New Donor
        </Button>
      </Box>

      {/* Edit Donor Form */}
      {isEditMode && (
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>Edit Donor</Typography>
          <FormControl fullWidth sx={{ mb: 2, mt:3 }}>
            <InputLabel>Select Donor</InputLabel>
            <Select
              value={donorId}
              onChange={handleDonorSelection}
            >
              {donorList.map((donor) => (
                <MenuItem key={donor["Donor id"]} value={donor["Donor id"]}>
                  {donor.Donner}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="h6">Select Questions:</Typography>
          <Grid container spacing={2} mt={2}>
            {renderQuestionsList()}
          </Grid>
        </Box>
      )}

      {/* Add New Donor Form */}
      {!isEditMode && (
        <Box mb={3}>
          <Typography variant="h5" gutterBottom>Add New Donor</Typography>
          <TextField
            label="Donor Name"
            variant="outlined"
            fullWidth
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            placeholder="Enter Donor Name"
            sx={{ mb: 2 }}
          />
          <Typography variant="h6">Select Questions:</Typography>
          <Grid container spacing={2} mt={2}>
            {renderQuestionsList()}
          </Grid>
        </Box>
      )}

      {/* Submit Button */}
      <Box mt={3}>
        <Button
          variant="contained"
          color="success"
          onClick={handleSubmit}
        >
          {isEditMode ? 'Update Donor' : 'Add Donor'}
        </Button>
      </Box>
    </Container>
  );
};

export default DonorManager;
