import React, { useState } from 'react';
import { Box, TextField, Typography, Button, Paper, Container } from '@mui/material';


const MonthlyReportingForm = () => {
  const [formData, setFormData] = useState({
    type: 'monthly',
    ngoId: 'SAM-1',
    month: 'january',
    teachersTrained: '',
    schoolVisits: '',
    sessionsConducted: '',
    modulesCompleted: '',
    studentsIntentRating: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("https://script.google.com/macros/s/AKfycbzuFPeG0cosIEGBocwuJ72DWUH6zcg7MtawkOuvOifXqHnm1QlaR7ESxiLKzGua-WQp/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        alert(result.message);
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Container
      maxWidth="sm"
     
    >
      <Paper
        // elevation={3}
        sx={{
          width: '100%',
          maxWidth: '600px',
          padding: 4,
          borderRadius: 2,
          backgroundColor: '#fffdf3',
        }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          January 2024 Report
        </Typography>
        <Box component="form" sx={{ mt: 2 }} onSubmit={handleSubmit} noValidate>
          <TextField
            label="Number of Teachers Trained"
            name="teachersTrained"
            value={formData.teachersTrained}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
          />
          <TextField
            label="Number of School Visits"
            name="schoolVisits"
            value={formData.schoolVisits}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
          />
          <TextField
            label="Number of Sessions Conducted"
            name="sessionsConducted"
            value={formData.sessionsConducted}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
          />
          <TextField
            label="Number of Modules Completed"
            name="modulesCompleted"
            value={formData.modulesCompleted}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
          />
          <TextField
            label="Total Students' Intent to Pursue Rating per Module"
            name="studentsIntentRating"
            value={formData.studentsIntentRating}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
          />
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              color="success"
              sx={{ paddingX: 4, textTransform: 'none', fontSize: '16px' }}
            >
              Submit Report
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default MonthlyReportingForm;
