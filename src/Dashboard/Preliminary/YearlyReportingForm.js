import React, { useState, useEffect } from 'react';
import { Box, TextField, Typography, Button, Paper, Container, FormLabel } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const YearlyReportingForm = () => {
  const [questions, setQuestions] = useState([]); // Holds fetched questions
  const [error, setError] = useState(""); // For error handling
  const [formData, setFormData] = useState({}); // For storing answers

  const location = useLocation();
  const { month, year } = location.state || {};
  const navigate = useNavigate();
  const NgoId = JSON.parse(localStorage.getItem("_AuthSama_")) || [];
  const ngoId = NgoId[0]?.NgoId;

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(
          `https://script.google.com/macros/s/AKfycbwnIYg5R0CIPmTNfy-XDJJoVOwEH34LlDlomCD3sCeMA4mnzt-vLqITkXuaj_FzuO75/exec?type=Yearly&id=${ngoId}`
        );
        const data = response.data;
        setQuestions(data.questions || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError("Failed to load questions.");
      }
    }
    if (ngoId) fetchData();
  }, [ngoId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch(
      "https://script.google.com/macros/s/AKfycbwnIYg5R0CIPmTNfy-XDJJoVOwEH34LlDlomCD3sCeMA4mnzt-vLqITkXuaj_FzuO75/exec?type=SendYearlyReport"
      , {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      mode: 'no-cors',
      body: JSON.stringify({ ...formData,
          year: `${month} ${year}`,
          ngoId: ngoId,
         
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
        }}
        elevation={0}
      >
        <Typography variant="h5" align="center" gutterBottom>
          {month && month} {year && year} Report
        </Typography>

        {questions.length > 0 ? (
          <Box component="form" sx={{ mt: 2 }} onSubmit={handleSubmit} noValidate>
            {questions.map((question, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <FormLabel>{question}</FormLabel>
                <TextField
                  name={question}
                  value={formData[question] || ""}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                />
              </Box>
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

export default YearlyReportingForm;
