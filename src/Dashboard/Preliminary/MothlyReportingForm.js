import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Paper,
  Container,
  FormLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";

const MonthlyReportingForm = () => {
  const [questions, setQuestions] = useState([]); // Holds fetched questions
  const [error, setError] = useState(""); // For error handling
  const [formData, setFormData] = useState({}); // For storing answers
  const [submittedData, setSubmittedData] = useState(null); // For storing submitted questions and answers
  const [isFormValid, setIsFormValid] = useState(false);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const { month, year } = location.state || {};

  const navigate = useNavigate();
  const NgoId = JSON.parse(localStorage.getItem("_AuthSama_"));
  const { id } = useParams();
  const gettingStoredData = id ? id : NgoId[0].NgoId;

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
          `${process.env.REACT_APP_NgoInformationApi}?type=Monthly&id=${gettingStoredData}`
        );
        const data = response.data;
        setQuestions(data.questions || []); // Assuming questions include text and type
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load questions.");
      }
      setLoading(false);
    }
    if (gettingStoredData) fetchData();
  }, [gettingStoredData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmittedData(formData); // Save submitted data

    fetch(
      `${process.env.REACT_APP_NgoInformationApi}?type=SendMonthlyReport`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: JSON.stringify({
          id: gettingStoredData,
          data: { ...formData },
          type: "SendMonthlyReport",
        }),
      }
    )
      .then((response) => response.json())
      .then((data) => console.log("Success:", data))
      .catch((error) => console.error("Error:", error));

    setFormData({}); // Clear the form
    navigate("/preliminary");
  };

  const renderInputField = (question, index) => {
    switch (question.type) {
      case "number":
        return (
          <TextField
            key={index}
            name={question.question}
            value={formData[question.question] || ""}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            type="number"
          />
        );

      default: // Open-ended or Text
        return (
          <TextField
            key={index}
            name={question.question}
            value={formData[question.question] || ""}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
          />
        );
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
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: "600px",
          padding: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" gutterBottom>
          {month && month} {year && year} Monthly Report
        </Typography>

        {questions.length > 0 ? (
          <Box
            component="form"
            sx={{ mt: 2 }}
            onSubmit={handleSubmit}
            noValidate
          >
            {questions.map((question, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <FormLabel sx={{ color: "#4A4A4A" ,fontSize: "1.125rem",fontFamily:"Raleway",fontWeight:"700",lineHeight:"170%", }}>
                  {question.question}
                </FormLabel>
                {renderInputField(question, index)}
              </Box>
            ))}

            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={!isFormValid}
                sx={{ paddingX: 4, textTransform: "none", fontSize: "16px" }}
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

export default MonthlyReportingForm;
