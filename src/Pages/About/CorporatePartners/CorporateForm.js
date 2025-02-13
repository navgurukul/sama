import React, { useState, useEffect } from "react";
import {
    Container,
    Button,
    Box,
    RadioGroup,
    Typography,
    Grid,
    FormControlLabel,
    Radio,
    InputLabel,
    TextField,
    Select,
    MenuItem,
    FormControl,
    FormHelperText,
} from "@mui/material";
import ourteam from '../OurTeam/style';

const stateOptions = ["Maharashtra", "New Delhi", "Gujarat", "Punjab", "Karnataka", "Tamil Nadu"];


function CorporateForm() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        companyName: "",
        phone: "",
        state: "",
        city: "",
        email: "",
        message: "",
        other: "",
    });
    const [errors, setErrors] = useState({});
    const [otherText, setOtherText] = useState("");
    const [successMessage, setSuccessMessage] = useState(false);
    const [selectedOutcome, setSelectedOutcome] = useState("");
    const [otherValue, setOtherValue] = useState("");
    const [showOtherField, setShowOtherField] = useState(false);

    const handleRadioChange = (event) => {
        const value = event.target.value;
        setSelectedOutcome(value);

        if (value === "other") {
            setShowOtherField(true);
        } else {
            setShowOtherField(false);
            setOtherValue(""); // Reset other field when another option is selected
        }
    };

    const handleOtherChange = (event) => {
        setOtherValue(event.target.value);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
            otherValue: e.target.value,
            outcome: selectedOutcome === "other" ? e.target.value : selectedOutcome,
        });

        setErrors({
            ...errors,
            [name]: validateField(name, value),
        });
    };

    const capitalizeFirstLetter = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };
    const handleStateChange = (event) => {
        setFormData({
            ...formData,
            state: event.target.value,  // Correctly updating state
        });

        setErrors({
            ...errors,
            state: validateField("state", event.target.value),
        });
    };




    const validateField = (name, value) => {
        const lettersOnlyRegex = /^[A-Za-z\s]+$/;
        switch (name) {
            case "firstName":
            case "lastName":
            case "message":
            case "companyName":
            case "city":

                if (!lettersOnlyRegex.test(value)) {
                    return "Must contain letters only";;
                } else if (value.length < 3) {
                    return `${name} must be at least 3 characters long`;
                }
                return "";
            case "email":
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return !emailRegex.test(value) ? "Invalid Gmail address" : "";
            case "phone":
                const contactRegex = /^[0-9]{10}$/;
                return !contactRegex.test(value) ? "Contact must be 10 digits" : "";
            case "state":
                return value ? "" : "Please select a state";

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

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            console.log("Form has errors:", newErrors);
            return;
        }

        const capitalizedData = {
            firstName: capitalizeFirstLetter(formData.firstName),
            lastName: capitalizeFirstLetter(formData.lastName),
            email: formData.email.toLowerCase(),
            message: capitalizeFirstLetter(formData.message),
            phone: formData.phone,
            companyName: formData.companyName,
            state: formData.state,
            city: formData.city,
            other: formData.other,
            outcome: selectedOutcome === "other" ? otherValue : selectedOutcome,
        };

        try {
            await fetch(
                "https://script.google.com/macros/s/AKfycbzBwnZJAPjjx1x33Sbwv_xc0SHqjYwhcHGxiWfkR7WCjtTS2gMSYa2K1sIUe-WOPTA/exec",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(capitalizedData),
                    mode: "no-cors",
                }
            );

            setFormData({
                firstName: "",
                lastName: "",
                companyName: "",
                phone: "",
                state: "",
                city: "",
                email: "",
                message: "",
                outcome: "",

            });
            setSelectedOutcome("");
            setOtherValue("");
            setShowOtherField(false);
            setSuccessMessage(true);
            setTimeout(() => {
                setSuccessMessage(false);
            }, 5000);
        } catch (error) {
            console.error("Error:", error);
        }
    };


    console.log(formData)

    return (
        <Container maxWidth="lg" sx={ourteam.container} style={{ marginTop: "0px" }}>
            <Box sx={ourteam.ComForm}  >
                <Typography variant="h6" gutterBottom sx={ourteam.secondhead}>
                    Maximize Social and Environmental Impact via Strategic<br />
                    CSR Partnership with Sama
                </Typography>
                <Box sx={ourteam.Form}>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <InputLabel sx={ourteam.InputLabel}>
                                    <b>First Name</b>
                                </InputLabel>
                                <TextField
                                    fullWidth
                                    required
                                    variant="outlined"
                                    name="firstName"
                                    placeholder="First Name"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    sx={{ backgroundColor: "white" }}
                                    error={!!errors.firstName}
                                    helperText={errors.firstName} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <InputLabel sx={ourteam.InputLabel}>
                                    <b>Last Name</b>
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
                            <Grid item xs={12} md={12}>
                                <InputLabel sx={ourteam.InputLabel}>
                                    <b>Organisation Name</b>
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
                            <Grid item xs={12} md={6}>
                                <InputLabel sx={ourteam.InputLabel}>
                                    <b>Phone Number</b>
                                </InputLabel>
                                <TextField
                                    fullWidth
                                    required
                                    type="tel"
                                    variant="outlined"
                                    placeholder="+91xxxx xxx xxx"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    sx={{ backgroundColor: "white" }}
                                    error={!!errors.phone}
                                    helperText={errors.phone}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <InputLabel sx={ourteam.InputLabel}>
                                    <b>Email Address</b>
                                </InputLabel>
                                <TextField
                                    fullWidth
                                    required
                                    type="email"
                                    placeholder="E-mail"
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
                                <InputLabel sx={ourteam.InputLabel}>
                                    <b>City</b>
                                </InputLabel>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    name="city"
                                    placeholder="Enter City"
                                    value={formData.city}
                                    onChange={handleChange}
                                    sx={{ backgroundColor: "white" }}
                                    error={!!errors.city}
                                    helperText={errors.city}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <InputLabel sx={ourteam.InputLabel}><b>State</b></InputLabel>
                                <FormControl fullWidth sx={{ backgroundColor: "white" }} error={!!errors.state}>
                                    <Select
                                        value={formData.state}
                                        onChange={handleStateChange}
                                        name="state"
                                        variant="outlined"
                                        displayEmpty
                                        sx={{ textAlign: "left" }}
                                    >
                                        <MenuItem value="" disabled>Select State</MenuItem>
                                        {stateOptions.map((state, index) => (
                                            <MenuItem key={index} value={state}>{state}</MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText>{errors.state}</FormHelperText>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sx={{ textAlign: "left" }}>
                                <FormControl component="fieldset" >
                                    <Typography
                                        className="customSubtitle1"
                                        sx={{ marginBottom: "10px" }}
                                    >
                                        Which of the following outcomes is most important for your organization?
                                    </Typography>
                                    <RadioGroup row name="outcome" onChange={handleRadioChange} value={selectedOutcome}>
                                        <FormControlLabel value="Fund Utilization" control={<Radio />} label="Fund Utilization" />
                                        <FormControlLabel value="Sustainability and Environmental Impact" control={<Radio />} label="Sustainability and Environmental Impact" />
                                        <FormControlLabel value="Social Impact" control={<Radio />} label="Social Impact" />
                                        <FormControlLabel value="other" control={<Radio />} label="Other" />
                                    </RadioGroup>


                                    {showOtherField && (
                                        <Grid item xs={12} md={6} sx={{ marginTop: "10px" }}>
                                            <TextField
                                                fullWidth
                                                variant="outlined"
                                                name="other"
                                                placeholder="Other"
                                                value={formData.other}
                                                onChange={handleChange}
                                                sx={{ backgroundColor: "white" }}
                                                error={!!errors.other}
                                                helperText={errors.other}
                                            />
                                        </Grid>
                                    )}
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <Grid item xs={12}>
                                    <Typography className="customSubtitle1"
                                        sx={ourteam.InputLabel}>
                                        Anything else you would like us to know?                                        <span style={{ color: "#4A4A4A" }}>(Optional)</span>
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        name="message"
                                        placeholder="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        sx={{ backgroundColor: "white" }}
                                        error={!!errors.message}
                                        helperText={errors.message}
                                        multiline
                                        rows={4}
                                    />
                                </Grid>
                            </Grid>


                            <Grid
                                item
                                xs={12}
                                sx={{
                                    paddingBottom: "4%",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    gap: "16px",
                                    flexWrap: "wrap",
                                }}
                            >
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    style={{
                                        width: "227px",
                                        height: "48px",
                                        alignItems: "center",
                                    }}
                                >
                                    Become a Partner
                                </Button>

                                {successMessage && (
                                    <Typography className="customSubtitle1" sx={{ color: "#5C785A" }}>
                                        Your Form details have been successfully submitted.
                                    </Typography>
                                )}
                            </Grid>
                        </Grid>
                    </form>
                </Box>
            </Box>
        </Container>
    );
};
export default CorporateForm;


