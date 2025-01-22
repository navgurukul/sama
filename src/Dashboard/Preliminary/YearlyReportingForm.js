import React, { useState, useEffect } from 'react';
import { Box, TextField, Typography, Button, Paper, Container, FormLabel } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const YearlyReportingForm = () => {
  const [questions, setQuestions] = useState([]); // Holds fetched questions and their types
  const [error, setError] = useState(""); // For error handling
  const [formData, setFormData] = useState({}); // For storing answers
    const [isFormValid, setIsFormValid] = useState(false);
    const [loading, setLoading] = useState(true);

  const location = useLocation();
  const { month, year } = location.state || {};
  const navigate = useNavigate();
  const NgoId = JSON.parse(localStorage.getItem("_AuthSama_")) || [];
  const ngoId = NgoId[0]?.NgoId;


    useEffect(() => {
      const checkFormValidity = () => {
        if (questions.length === 0) return false;
  
        // Check if all questions have been answered
        const allQuestionsAnswered = questions.every(
          (question) =>
            formData[question.question] &&
            formData[question.question].toString().trim() !== ""
        );
  
        setIsFormValid(allQuestionsAnswered);
      };
  
      checkFormValidity();
    }, [formData, questions]);


  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_NgoInformationApi}?type=Yearly&id=${ngoId}`
        );
        setQuestions(response.data.questions || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError("Failed to load questions.");
      }
      setLoading(false);
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
        `${process.env.REACT_APP_NgoInformationApi}?type=SendYearlyReport`,
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

    if (loading) {
      return (
        <Typography align="center" mt={4}>
          Loading...
        </Typography>
      );
    }
  

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
        <Typography variant="h5" gutterBottom>
          {month && month} {year && year} Report
        </Typography>

        {questions.length > 0 ? (
          <Box component="form" sx={{ mt: 2 }} onSubmit={handleSubmit} noValidate>
            {questions.map((question, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <FormLabel sx={{ color: "#4A4A4A" ,fontSize: "1.125rem",fontFamily:"normal",fontWeight:"700",lineHeight:"170%", }}>{question.question}</FormLabel>
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
                // color="success"
                disabled={!isFormValid}
                sx={{ paddingX: 4, textTransform: 'none', fontSize: '16px' }}
              >
                Submit Answers
              </Button>
            </Box>
          </Box>
        ) : (
          <Typography align="center" color="error">
            Questions Unavailable...
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default YearlyReportingForm;
