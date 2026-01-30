import React, { useState } from "react";
import { Box, TextField, Button, Typography, Grid, CircularProgress } from "@mui/material";

// Function to format date as DD-MM-YYYY HH:mm:ss
const formatDateTime = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const Pickup = () => {
  const initialState = {
    donorCompany: "",
    email: "",
    pocName: "",
    pocContact: "",
    numberOfLaptops: "",
    pickupLocation: "",
    pickupBy: "",
    type: "Pickup",
    currentDate: formatDateTime(),
  };

  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const fields = [
    { name: "donorCompany", label: "Donor Company" },
    { name: "email", label: "Email", type: "email" },
    { name: "pocName", label: "POC Name" },
    { name: "pocContact", label: "POC Contact Number" },
    { name: "numberOfLaptops", label: "Number of Laptops", type: "number" },
    { name: "pickupLocation", label: "Pickup Location" },
    { name: "pickupBy", label: "Pickup By" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // clear error for the field while user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.donorCompany?.trim()) newErrors.donorCompany = 'Donor company is required';
    if (!formData.email?.trim()) newErrors.email = 'Email is required';
    else if (!validateEmail(formData.email)) newErrors.email = 'Enter a valid email';
    if (!formData.pocName?.trim()) newErrors.pocName = 'POC name is required';
    if (!formData.pocContact?.trim()) newErrors.pocContact = 'POC contact is required';
    else if (!/^[0-9+\-\s]{7,15}$/.test(formData.pocContact)) newErrors.pocContact = 'Enter a valid contact number';
    if (!formData.numberOfLaptops?.toString().trim()) newErrors.numberOfLaptops = 'Number of laptops is required';
    else if (Number(formData.numberOfLaptops) <= 0) newErrors.numberOfLaptops = 'Must be greater than 0';
    if (!formData.pickupLocation?.trim()) newErrors.pickupLocation = 'Pickup location is required';
    if (!formData.pickupBy?.trim()) newErrors.pickupBy = 'Pickup by is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    // lightweight check to enable/disable button without running full validation each render
    return (
      formData.donorCompany?.trim() &&
      formData.email?.trim() &&
      validateEmail(formData.email) &&
      formData.pocName?.trim() &&
      formData.pocContact?.trim() &&
      String(formData.numberOfLaptops).trim() &&
      Number(formData.numberOfLaptops) > 0 &&
      formData.pickupLocation?.trim() &&
      formData.pickupBy?.trim()
    );
  };

  const handleSubmit = async () => {
    // run validation first
    if (!validateForm()) return;

    const payload = { ...formData, currentDate: formatDateTime() };
    setLoading(true);
    try {
        await fetch(
        //   `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}
          `https://script.google.com/macros/s/AKfycbxWGV8prp8U6oPvej2Qm6_w3c38qzMmHFidxhDBvMa1Cek5TAn9DHrloIbrx74OfBY2_Q/exec?type=Pickup`,
          {
            method: "POST",
            body: JSON.stringify(payload),
            mode: "no-cors",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        alert("Data uploaded successfully!"); // Success alert
        setFormData({ ...initialState, currentDate: formatDateTime() });
        setErrors({});
      } catch (error) {
        console.error("Error uploading data:", error); // Log the error
        alert("Failed to upload data. Please try again."); // Error alert
      } finally {       
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 5, p: 3, boxShadow: 3, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom>
        Pickup Form
      </Typography>
      <Grid container spacing={2}>
        {fields.map(({ name, label, type }) => (
          <Grid item xs={12} sm={name === "pocName" || name === "pocContact" ? 6 : 12} key={name}>
            <TextField
              fullWidth
              label={label}
              name={name}
              type={type || "text"}
              value={formData[name]}
              onChange={handleChange}
              error={Boolean(errors[name])}
              helperText={errors[name] || ''}
              InputProps={
                name === 'numberOfLaptops'
                  ? { inputProps: { min: 1 } }
                  : undefined
              }
            />
          </Grid>
        ))}

        <Grid item xs={12}>
          <TextField fullWidth label="Current Date & Time" value={formData.currentDate} InputProps={{ readOnly: true }} />
        </Grid>

        <Grid item xs={12}>
          <Button variant="contained" fullWidth onClick={handleSubmit} disabled={loading || !isFormValid()}>
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Submit Pickup'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Pickup;
