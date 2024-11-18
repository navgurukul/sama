import React, { useState } from "react";
import { TextField, Button, Box, Typography, Container } from "@mui/material";

const MonthlyReportForm = () => {
  const [formData, setFormData] = useState({
    teachersTrained: "",
    schoolVisits: "",
    sessionsConducted: "",
    modulesCompleted: "",
    intentRating: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbyVi1UX63tdxatOS4-21DytCvYvD2v9fdYH72JD5LHHe1P_qd3SpZqO88mbMM_PXgsJGQ/exec",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (result.status === "success") {
        alert("Data submitted successfully!");
        setFormData({
          teachersTrained: "",
          schoolVisits: "",
          sessionsConducted: "",
          modulesCompleted: "",
          intentRating: "",
        });
      } else {
        throw new Error(result.message || "Submission failed");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      alert(
        "There was an issue with the submission. Please check your input and try again."
      );
    }
  };

  return (
    <Container maxWidth="sm" sx={{ marginTop: "2rem", marginBottom: "2rem" }}>
      <Typography
        variant="h5"
        sx={{
          textAlign: "center",
          marginBottom: "1.5rem",
          fontWeight: 600,
          color: "#4d4d4d",
        }}
      >
        January 2024 Report
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Number of Teachers Trained"
          name="teachersTrained"
          value={formData.teachersTrained}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
          required
          type="number"
        />
        <TextField
          fullWidth
          label="Number of School Visits"
          name="schoolVisits"
          value={formData.schoolVisits}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
          required
          type="number"
        />
        <TextField
          fullWidth
          label="Number of Sessions Conducted"
          name="sessionsConducted"
          value={formData.sessionsConducted}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
          required
          type="number"
        />
        <TextField
          fullWidth
          label="Number of Modules Completed"
          name="modulesCompleted"
          value={formData.modulesCompleted}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
          required
          type="number"
        />
        <TextField
          fullWidth
          label="Total Students' Intent to Pursue Rating per Module"
          name="intentRating"
          value={formData.intentRating}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
          required
          type="number"
        />
        <Box
          sx={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}
        >
          <Button type="submit" variant="contained">
            Submit Report
          </Button>
        </Box>
      </form>
    </Container>
  );
};

export default MonthlyReportForm;
