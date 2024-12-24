import React, { useState } from "react";
import { Box, TextField, Button, Typography, Container, Snackbar, Alert } from "@mui/material";

const FormSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    organization: "",
    designation: "",
    email: ""
  });
  
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      await fetch('https://script.google.com/macros/s/AKfycbyY7OyIUye4MaFhlX4Y-Z8tEv69WHzpK1IhWZCEeK1AtQq5ygfTSMqlWi0pwH6UgLwqig/exec', {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
  
      // Since we can't read the response in no-cors mode, 
      // we'll assume success if the fetch doesn't throw an error
      setSnackbarMessage("Form submitted successfully!");
      setSnackbarSeverity("success");
      // Reset form
      setFormData({
        name: "",
        organization: "",
        designation: "",
        email: ""
      });
      
    } catch (error) {
      setSnackbarMessage("Failed to submit form");
      setSnackbarSeverity("error");
    } finally {
      setLoading(false);
      setOpenSnackbar(true);
    }
  };
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          backgroundColor: "#fff",
          padding: 3,
          boxShadow: 3,
          borderRadius: "8px",
        }}
      >
     
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <TextField 
            label="Name" 
            name="name"
            value={formData.name}
            onChange={handleChange}
            variant="outlined" 
            fullWidth 
            required
          />
          <TextField 
            label="Organization" 
            name="organization"
            value={formData.organization}
            onChange={handleChange}
            variant="outlined" 
            fullWidth 
            required
          />
          <TextField 
            label="Designation" 
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            variant="outlined" 
            fullWidth 
            required
          />
          <TextField 
            label="Email" 
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            variant="outlined" 
            fullWidth 
            required
          />
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              backgroundColor: "#5b7048",
              borderRadius: "100px",
              "&:hover": { backgroundColor: "#4a5e3c" },
              color: "#fff",
              textTransform: "none",
              fontWeight: "bold",
            }}
            size="large"
          >
            {loading ? "Submitting..." : "Request a Callback"}
          </Button>
        </Box>
      </Box>

      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={6000} 
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default FormSection;
