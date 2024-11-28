import React, { useState } from 'react';
import { Container, Typography, Button, TextField, Radio, RadioGroup, FormControlLabel, Grid, Paper, IconButton } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { useParams } from 'react-router-dom';

const MonthlyForm = () => {
  const { id } = useParams();
  const [fields, setFields] = useState([
    { id: 1, type: 'text', label: '' },
  ]);

  const addField = () => {
    setFields([...fields, { id: fields.length + 1, type: 'text', label: '' }]);
  };

  const removeField = (id) => {
    setFields(fields.filter((field) => field.id !== id));
  };

  const handleChange = (id, key, value) => {
    setFields(fields.map((field) => (field.id === id ? { ...field, [key]: value } : field)));
  };

  const handleSubmit = async () => {
    // Prepare the payload
    const payload = {
      Id: id, // You can replace this with a dynamic ID if required
      Questions: fields.map((field) => field.label),
      Types: fields.map((field) => field.type),
      type:"question"
    };

    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbxm2qA0DvzVUNtbwe4tAqd40hO7NpNU-GNXyBq3gHz_q45QIo9iveYOkV0XqyfZw9V7/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        mode: 'no-cors',
      });

      const data = await response.json();
      if (data.success) {
        alert('Form submitted successfully!');
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        justifyContent: 'center',
        alignItems: 'center',
        p: 3,
      }}
    >
      <Paper
        elevation={1}
        sx={{
          p: 3,
          borderRadius: 2,
          backgroundColor: '#fff',
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          Monthly Form
        </Typography>
        {fields.map((field) => (
          <Grid container spacing={2} alignItems="center" key={field.id} sx={{ mb: 2 }}>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <RadioGroup
                row
                value={field.type}
                onChange={(e) => handleChange(field.id, 'type', e.target.value)}
              >
                <FormControlLabel value="text" control={<Radio />} label="Text Field" />
                <FormControlLabel value="number" control={<Radio />} label="Number Field" />
              </RadioGroup>
              <IconButton color="error" onClick={() => removeField(field.id)}>
                <CloseIcon />
              </IconButton>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Metric Name"
                value={field.label}
                onChange={(e) => handleChange(field.id, 'label', e.target.value)}
                placeholder="Enter metric name"
              />
            </Grid>
          </Grid>
        ))}
      </Paper>
      <Button
        variant="text"
        startIcon={<AddIcon />}
        onClick={addField}
        sx={{ mb: 2, color: 'primary', mt: 2, padding: 0, backgroundColor: 'none' }}
      >
        Add Metric
      </Button>
      <Button
        variant="contained"
        fullWidth
        onClick={handleSubmit}
      >
        Create Form
      </Button>
    </Container>
  );
};

export default MonthlyForm;
