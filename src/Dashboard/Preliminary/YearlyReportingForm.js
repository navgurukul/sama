import React, { useState, useEffect } from 'react';
import { Box, TextField, Typography, Button, Paper, Container, FormLabel } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const YearlyReportingForm = () => {
  const [questions, setQuestions] = useState([]); // Holds fetched questions and their types
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
          `https://script.google.com/macros/s/AKfycbxmnB0YHUm_mPxf1i-Cv465D1kSOrB0w1-dJS1slov_UQPZ0QxMERy_kZ8uZ5KASjBi/exec?type=Yearly&id=${ngoId}`
        );
        setQuestions(response.data.questions || []);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that all questions are answered
    const unanswered = questions.filter((question) => !formData[question.question]);
    if (unanswered.length > 0) {
      setError(`Please answer all questions.`);
      return;
    }

    try {
      await fetch(
        "https://script.google.com/macros/s/AKfycbxmnB0YHUm_mPxf1i-Cv465D1kSOrB0w1-dJS1slov_UQPZ0QxMERy_kZ8uZ5KASjBi/exec?type=SendYearlyReport",
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          mode: 'no-cors',
          body: JSON.stringify({
            ...formData,
            year: `${month} ${year}`,
            ngoId: ngoId,
          }),
        }
      );

      // Clear form and reset state after successful submission
      setFormData({});
      setError(""); // Clear error if any
      navigate('/preliminary'); // Redirect to another page
    } catch (error) {
      console.error('Error submitting form:', error);
      setError("An error occurred during submission.");
    }
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
                <FormLabel>{question.question}</FormLabel>
                {question.type === "number" ? (
                  <TextField
                    name={question.question}
                    value={formData[question.question] || ""}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    type={question.type}
                    placeholder='Enter only number'
                    
                  />
                ) : (
                  // You can handle other types (checkbox, select, etc.) here as needed
                  <TextField
                    name={question.question}
                    value={formData[question.question] || ""}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    type={question.type}
                    

                  />
                )}
              </Box>
            ))}

            {error && (
              <Typography align="center" color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}

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
