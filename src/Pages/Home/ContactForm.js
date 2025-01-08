import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  InputLabel,
} from "@mui/material";

function ContactForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    setErrors({
      ...errors,
      [name]: validateField(name, value),
    });
  };

  const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const validateField = (name, value) => {
    switch (name) {
      case "firstName":
      case "lastName":
      case "message":
        return value.length < 3
          ? `${name} must be at least 3 characters long`
          : "";
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? "Invalid Gmail address" : "";
      case "contact":
        const contactRegex = /^[0-9]{10}$/;
        return !contactRegex.test(value) ? "Contact must be 10 digits" : "";
      default:
        return "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      const errorMessage = validateField(field, formData[field]);
      if (errorMessage) {
        newErrors[field] = errorMessage;
      }
    });
    setErrors(newErrors);

    if (
      Object.keys(newErrors).length > 0 ||
      Object.values(formData).some((value) => value === "")
    ) {
      return;
    }

    const capitalizedData = {
      firstName: capitalizeFirstLetter(formData.firstName),
      lastName: capitalizeFirstLetter(formData.lastName),
      email: formData.email.toLowerCase(),
      message: capitalizeFirstLetter(formData.message),
      contact: formData.contact,
    };

    try {
      await fetch(
        "https://script.google.com/macros/s/AKfycbz-1unt1cD-8gQFAm8JVUcLblr924i_1fCxZxJpDzy9Xt0dCs3u_Fjx-DK5InIpee-JAw/exec",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(capitalizedData),
          mode: "no-cors",
        }
      );

      setSuccess(true);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        message: "",
        contact: "",
      });

      // Hide the success message after 10 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 10000);
    } catch (error) {
      console.error("Error:", error);
      alert("There was an error sending your message.");
    }
  };

  return (
    <Box
      className="contact-form"
      sx={{
        paddingBottom: {
          lg: "110.74px",
          sm: "55px",
          xs: "30px",
        },
        paddingTop: "80px",
        backgroundColor: "#FFFAF8",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Typography variant="h5">Contact Us</Typography>
            <Typography variant="body1" mt={2}>
              Fill out the form, and we’ll get back to you as soon as possible.
            </Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={6}>
                  <InputLabel sx={{ mt: 5, color: "#4A4A4A" }}>
                    <b>First Name</b>
                  </InputLabel>
                  <TextField
                    label="Ex : John"
                    margin="normal"
                    fullWidth
                    variant="outlined"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    sx={{ backgroundColor: "white" }}
                    error={!!errors.firstName}
                    helperText={errors.firstName}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InputLabel sx={{ mt: 5, color: "#4A4A4A" }}>
                    <b>Last Name</b>
                  </InputLabel>
                  <TextField
                    label="Ex :  Doe"
                    margin="normal"
                    fullWidth
                    variant="outlined"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    sx={{ backgroundColor: "white" }}
                    error={!!errors.lastName}
                    helperText={errors.lastName}
                  />
                </Grid>
              </Grid>
              <InputLabel sx={{ mt: 2, color: "#4A4A4A" }}>
                <b>Email Address</b>
              </InputLabel>
              <TextField
                fullWidth
                label="Ex : John@gmail.com"
                margin="normal"
                variant="outlined"
                name="email"
                sx={{ backgroundColor: "white" }}
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
              />
              <InputLabel sx={{ mt: 2, color: "#4A4A4A" }}>
                <b>Message</b>
              </InputLabel>
              <TextField
                fullWidth
                label="message"
                margin="normal"
                multiline
                rows={4}
                variant="outlined"
                name="message"
                sx={{ backgroundColor: "white" }}
                value={formData.message}
                onChange={handleChange}
                error={!!errors.message}
                helperText={errors.message}
              />
              <Box style={{ display: "flex" }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ borderRadius: "100px", mt: 2 }}
                >
                  Send Message
                </Button>

                {success && (
                  <Typography
                    variant="body1"
                    color="green"
                    sx={{ mt: 4, ml: 3 }}
                  >
                    Message sent successfully!
                  </Typography>
                )}
              </Box>
            </form>
          </Grid>
          <Grid item xs={12} sm={12} md={4}>
            <img
              src={require("./assets/Frame outer.svg").default}
              alt="Contact"
              width="100%"
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default ContactForm;
