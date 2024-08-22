import React, { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  InputLabel,
  FormHelperText,
  FormControl,
  Container,
  Snackbar, // Import Snackbar
  Alert,
} from "@mui/material";
import "./Donate.css";

function Donation() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    contributionType: "",
    companyName: "",
    donationType: "",
    numberOfLaptops: "",
    donateAmount: "",
    hearAbout: "",
    updates: false,
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [otherText, setOtherText] = useState("");
  const [successMessage, setSuccessMessage] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleOtherTextChange = (event) => {
    setOtherText(event.target.value);
  };

  const validate = () => {
    let newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First Name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last Name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email Address is required";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone Number is required";
    }
    if (
      formData.contributionType === "company" &&
      !formData.companyName.trim()
    ) {
      newErrors.companyName = "Company Name is required";
    }
    if (
      (formData.donationType === "donate-laptops" ||
        formData.donationType === "both") &&
      !formData.numberOfLaptops.trim()
    ) {
      newErrors.numberOfLaptops = "Estimated Number of Laptops is required";
    }
    if (
      (formData.donationType === "financial-contribution" ||
        formData.donationType === "both") &&
      !formData.donateAmount.trim()
    ) {
      newErrors.donateAmount = "Donate Amount is required";
    }

    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const submissionData = {
      ...formData,
      companyName:
        formData.contributionType === "company" ? formData.companyName : "",
      numberOfLaptops:
        formData.donationType === "donate-laptops" ||
        formData.donationType === "both"
          ? formData.numberOfLaptops
          : "",
      donateAmount:
        formData.donationType === "financial-contribution" ||
        formData.donationType === "both"
          ? formData.donateAmount
          : "",
      hearAbout:
        formData.hearAbout === "other" ? otherText : formData.hearAbout,
    };
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      try {
        const response = await fetch(
          "https://script.google.com/macros/s/AKfycbzpJM1YwhElNojDizOb1ksc56XxwfWuZzpz-T3A9Tw9vh90XIAP5E__FQZT-idBRY4DBw/exec",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(submissionData),
            mode: "no-cors",
          }
        );
        // console.log("Response--------", response);

        console.log("Form Data Submitted:", formData);

        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          contributionType: "",
          companyName: "",
          donationType: "",
          numberOfLaptops: "",
          donateAmount: "",
          hearAbout: "",
          updates: false,
          message: "",
        });
        setOtherText("");
        setSuccessMessage(true);
        setTimeout(() => {
          setSuccessMessage(false);
        }, 5000);
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  return (
    <>
      <Container maxWidth="xl" style={{ backgroundColor: "#E0E0E0" }}>
        <Box sx={{ padding: "10", backgroundColor: "#E0E0E0",py:10 }}>
          <Container maxWidth="lg" sx={{ paddingBottom: "4%" }}>
            <Typography
              variant="h6"
              sx={{ marginBottom: "25px", color: "#4A4A4A", fontSize: "24px" }}
            >
              Support Sama's Mission
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Box>
                  <img
                    src={require("./assets/Group 22 (1).svg").default}
                    alt="Corporate Laptop Donation"
                  />
                  <Typography
                    className="customSubtitle1"
                    // variant="subtitle1"
                    sx={{ margin: "14px 0px" }}
                  >
                    Corporate Laptop Donation
                  </Typography>
                  <Typography variant="body1">
                    Transform your end-of-life laptops into powerful tools for
                    education and empowerment.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box>
                  <img
                    src={require("./assets/Group 22.svg").default}
                    alt="Corporate Impact Funding"
                  />
                  <Typography
                    className="customSubtitle1"
                    // variant="subtitle1"
                    sx={{ margin: "14px 0px" }}
                  >
                    Corporate Impact Funding
                  </Typography>
                  <Typography variant="body1">
                    Partner with us to scale our impact and bridge the digital
                    divide for underserved girls and women.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box>
                  <img
                    src={require("./assets/Group 23.svg").default}
                    alt="Individual Contribution"
                  />
                  <Typography
                    className="customSubtitle1"
                    // variant="subtitle1"
                    sx={{ margin: "14px 0px" }}
                  >
                    Individual Contribution
                  </Typography>
                  <Typography variant="body1">
                    Join our mission to empower girls and women through digital
                    access and education.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Container>

      <Container maxWidth="lg" sx={{ pt: "70px" }}>
        <Typography variant="h5">Your Details</Typography>
        <Box sx={{ pt: "32px" }}>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <InputLabel sx={{ marginBottom: "5px", color: "black" }}>
                  First Name
                </InputLabel>
                <TextField
                  fullWidth
                  required
                  variant="outlined"
                  name="firstName"
                  value={formData.firstName}
                  placeholder="First Name"
                  onChange={handleChange}
                  sx={{ backgroundColor: "white" }}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <InputLabel sx={{ marginBottom: "5px", color: "black" }}>
                  Last Name
                </InputLabel>
                <TextField
                  fullWidth
                  required
                  placeholder="Last Name"
                  variant="outlined"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  sx={{ backgroundColor: "white" }}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <InputLabel sx={{ marginBottom: "5px", color: "black" }}>
                  Email Address
                </InputLabel>
                <TextField
                  fullWidth
                  required
                  type="email"
                  placeholder="Email Address"
                  variant="outlined"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  sx={{ backgroundColor: "white" }}
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <InputLabel sx={{ marginBottom: "5px", color: "black" }}>
                  Phone Number
                </InputLabel>
                <TextField
                  fullWidth
                  required
                  type="tel"
                  variant="outlined"
                  placeholder="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  sx={{ backgroundColor: "white" }}
                  error={!!errors.phone}
                  helperText={errors.phone}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl
                  component="fieldset"
                  error={!!errors.contributionType}
                >
                  <Typography
                    className="customSubtitle1"
                    // variant="subtitle1"
                    sx={{ marginBottom: "10px" }}
                  >
                    I am contributing:
                  </Typography>
                  <RadioGroup
                    row
                    name="contributionType"
                    value={formData.contributionType}
                    onChange={handleChange}
                  >
                    <FormControlLabel
                      value="company"
                      control={<Radio />}
                      label="On behalf of a company"
                    />
                    <FormControlLabel
                      value="individual"
                      control={<Radio />}
                      label=" As an individual"
                    />
                  </RadioGroup>
                  {errors.contributionType && (
                    <FormHelperText>{errors.contributionType}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {formData.contributionType === "company" && (
                <Grid item xs={12} md={6}>
                  <InputLabel sx={{ marginBottom: "5px" }}>
                    Company Name
                  </InputLabel>
                  <TextField
                    fullWidth
                    variant="outlined"
                    name="companyName"
                    placeholder="Company Name"
                    value={formData.companyName}
                    onChange={handleChange}
                    sx={{ backgroundColor: "white" }}
                    error={!!errors.companyName}
                    helperText={errors.companyName}
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <FormControl component="fieldset" error={!!errors.donationType}>
                  <Typography
                    className="customSubtitle1"
                    // variant="subtitle1"
                    sx={{ marginBottom: "10px" }}
                  >
                    I would like to:
                  </Typography>
                  <RadioGroup
                    row
                    name="donationType"
                    value={formData.donationType}
                    onChange={handleChange}
                  >
                    <FormControlLabel
                      value="donate-laptops"
                      control={<Radio />}
                      label="Donate laptops"
                    />
                    <FormControlLabel
                      value="financial-contribution"
                      control={<Radio />}
                      label="Make a financial contribution"
                    />
                    <FormControlLabel
                      value="both"
                      control={<Radio />}
                      label="Both donate laptops and contribute financially"
                    />
                  </RadioGroup>
                  {errors.donationType && (
                    <FormHelperText>{errors.donationType}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {formData.donationType === "donate-laptops" && (
                <Grid item xs={12} md={6}>
                  <InputLabel sx={{ marginBottom: "5px" }}>
                    Estimated number of laptops
                  </InputLabel>
                  <TextField
                    fullWidth
                    variant="outlined"
                    name="numberOfLaptops"
                    placeholder="Estimated number of laptops"
                    value={formData.numberOfLaptops}
                    onChange={handleChange}
                    sx={{ backgroundColor: "white" }}
                    error={!!errors.numberOfLaptops}
                    helperText={errors.numberOfLaptops}
                  />
                </Grid>
              )}

              {formData.donationType === "financial-contribution" && (
                <Grid item xs={12} md={6}>
                  <InputLabel sx={{ marginBottom: "5px" }}>
                    Donate Amount
                  </InputLabel>
                  <TextField
                    fullWidth
                    variant="outlined"
                    name="donateAmount"
                    placeholder="Donate Amount"
                    value={formData.donateAmount}
                    onChange={handleChange}
                    sx={{ backgroundColor: "white" }}
                    error={!!errors.donateAmount}
                    helperText={errors.donateAmount}
                  />
                </Grid>
              )}

              {formData.donationType === "both" && (
                <>
                  <Grid item xs={12} md={6}>
                    <InputLabel sx={{ marginBottom: "5px" }}>
                      Estimated number of laptops
                    </InputLabel>
                    <TextField
                      fullWidth
                      variant="outlined"
                      name="numberOfLaptops"
                      placeholder="Estimated number of laptops"
                      value={formData.numberOfLaptops}
                      onChange={handleChange}
                      sx={{ backgroundColor: "white" }}
                      error={!!errors.numberOfLaptops}
                      helperText={errors.numberOfLaptops}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <InputLabel sx={{ marginBottom: "5px" }}>
                      Donate Amount
                    </InputLabel>
                    <TextField
                      fullWidth
                      variant="outlined"
                      name="donateAmount"
                      placeholder="Donate Amount"
                      value={formData.donateAmount}
                      onChange={handleChange}
                      sx={{ backgroundColor: "white" }}
                      error={!!errors.donateAmount}
                      helperText={errors.donateAmount}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <FormControl component="fieldset" error={!!errors.hearAbout}>
                  <Typography
                    className="customSubtitle1"
                    // variant="subtitle1"
                    sx={{ marginBottom: "10px" }}
                  >
                    How did you hear about Sama?
                  </Typography>
                  <RadioGroup
                    row
                    name="hearAbout"
                    value={formData.hearAbout}
                    onChange={handleChange}
                  >
                    <FormControlLabel
                      value="social-media"
                      control={<Radio />}
                      label="Social Media"
                    />
                    <FormControlLabel
                      value="website"
                      control={<Radio />}
                      label="Website"
                    />
                    <FormControlLabel
                      value="friend"
                      control={<Radio />}
                      label="Friend/Colleague"
                    />
                    <FormControlLabel
                      value="event"
                      control={<Radio />}
                      label="Event"
                    />
                    <FormControlLabel
                      value="other"
                      control={<Radio />}
                      label="Other"
                    />
                  </RadioGroup>
                  {errors.hearAbout && (
                    <FormHelperText>{errors.hearAbout}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {formData.hearAbout === "other" && (
                <Grid item xs={12} md={6}>
                  <InputLabel sx={{ marginBottom: "5px" }}>Other</InputLabel>
                  <TextField
                    fullWidth
                    variant="outlined"
                    name="other"
                    value={otherText}
                    onChange={handleOtherTextChange}
                    sx={{ backgroundColor: "white" }}
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ marginBottom: "10px" }}>
                    Any additional information or questions <span style={{color:"#4A4A4A"}}>(Optional)</span> 
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    name="message"
                    placeholder="Message"
                    value={formData.message}
                    onChange={handleChange}
                    sx={{ backgroundColor: "white" }}
                    multiline
                    rows={4}
                    error={!!errors.message}
                    helperText={errors.message}
                  />
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="updates"
                      checked={formData.updates}
                      onChange={handleChange}
                    />
                  }
                  label="I would like to receive updates from Sama"
                />
              </Grid>

            
              <Grid
                item
                xs={12}
                sx={{
                  paddingBottom: "4%",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Button type="submit" variant="contained" color="primary">
                  Submit
                </Button>
                {successMessage && (
                  <Typography className="customSubtitle1" sx={{ marginLeft: "22px", color: "#5C785A" }}>
                  Your donation details have been successfully submitted. We will reach out to you soon
                  </Typography>
                )}
              </Grid>
            </Grid>
          </form>
          
        </Box>
      </Container>
    </>
  );
}

export default Donation;
