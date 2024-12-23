import React, { useState, useEffect } from 'react';
import { Box, TextField, Typography, Button, Paper, Container, FormLabel } from '@mui/material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';

const MonthlyReportingForm = () => {
  const [questions, setQuestions] = useState([]); // Holds fetched questions
  const [error, setError] = useState(""); // For error handling
  const [formData, setFormData] = useState({}); // For storing answers
  const [submittedData, setSubmittedData] = useState(null); // For storing submitted questions and answers
  
  const location = useLocation();
  const { month, year } = location.state || {};

  
  const navigate = useNavigate();
  const NgoId = JSON.parse(localStorage.getItem("_AuthSama_"));
  const { id } = useParams();
  const gettingStoredData = id ? id : NgoId[0].NgoId;

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(
          `https://script.google.com/macros/s/AKfycby4zd74Zl-sQYN5b8940ZgOVQEcb5Jam-SNayOzevsrtQmH4nhHFLu936Nwr0-uZVZh/exec?type=Monthly&id=${gettingStoredData}`
        );
        const data = response.data;
        setQuestions(data.questions || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError("Failed to load questions.");
      }
    }
    if (gettingStoredData) fetchData();
  }, [gettingStoredData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmittedData(formData); // Save submitted data

    fetch(
      "https://script.google.com/macros/s/AKfycby4zd74Zl-sQYN5b8940ZgOVQEcb5Jam-SNayOzevsrtQmH4nhHFLu936Nwr0-uZVZh/exec"
      , {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      mode: 'no-cors',
      body: JSON.stringify({
        id: gettingStoredData,
        data: { ...formData },
        type: 'SendMonthlyReport'
      }),
    })
      .then(response => response.json())
      .then(data => console.log('Success:', data))
      .catch(error => console.error('Error:', error));
      

    setFormData({}); // Clear the form
    navigate('/preliminary');
  };

  

  return (
    <Container maxWidth="sm">
      <Paper
        sx={{
          width: '100%',
          maxWidth: '600px',
          padding: 4,
          borderRadius: 2,
          // backgroundColor: '#fffdf3',
        }}
      >
        <Typography variant="h5" align="center" gutterBottom>
         {month && month} {year && year} Monthly Report
        </Typography>

        {questions.length > 0 ? (
          <Box component="form" sx={{ mt: 2 }} onSubmit={handleSubmit} noValidate>

            {questions.map((question, index) => (
              <>
              <FormLabel>{question}</FormLabel>              
              <TextField
                key={index}
                // label={question}
                name={question}
                value={formData[question] || ""}
                onChange={handleChange}
                fullWidth
                margin="normal"
                variant="outlined"
              />
              </>
            ))}

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                color="success"
                sx={{ paddingX: 4, textTransform: 'none', fontSize: '16px' }}
              >
                Submit Answers
              </Button>
            </Box>
          </Box>
        ) : (
          <Typography align="center" color="error">
            {error || "Questions Unavailable..."}
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default MonthlyReportingForm;
