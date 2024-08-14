import React, { useState } from 'react';
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
    Container
} from '@mui/material';



function Donation() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        contributionType: 'company',
        companyName: '',
        donationType: 'both',
        numberOfLaptops: '',
        hearAbout: 'other',
        other: '',
        updates: false,
    });

    const [errors, setErrors] = useState({});

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });

        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const validate = () => {
        let newErrors = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First Name is required';
        }
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last Name is required';
        }
        if (!formData.email.trim()) {
            newErrors.email = 'Email Address is required';
        }
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone Number is required';
        }
        if (!formData.companyName.trim()) {
            newErrors.companyName = 'Company Name is required';
        }
        if (!formData.numberOfLaptops.trim()) {
            newErrors.numberOfLaptops = 'Estimated Number of Laptops is required';
        }

        return newErrors;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const validationErrors = validate();
    
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
        } else {
            try {
                const response = await fetch('https://script.google.com/macros/s/AKfycbxztuv3JpX9E3ORYvtGoKqfxTwh1cPvn3ZBm4yHwiDPYiqKX8yUDMvJdEoDkU_Yeeuf/exec', {  // Replace 'YOUR_WEB_APP_URL' with your Google Apps Script web app URL
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                    mode:"no-cors"
                });
                
               
                    console.log('Form Data Submitted:', formData);
                    // Optionally show a success message or reset the form
                    setFormData({
                        firstName: '',
                        lastName: '',
                        email: '',
                        phone: '',
                        contributionType: 'company',
                        companyName: '',
                        donationType: 'both',
                        numberOfLaptops: '',
                        hearAbout: 'other',
                        other: '',
                        updates: false,
                    });
                }
             catch (error) {
                console.error('Error:', error);
            }
        }
    };
    
    return (
        <Box sx={{ backgroundColor: '#fef5f2', minHeight: '100vh' }}>
            {/* Section 1: Support Sama's Mission */}
            <Box sx={{ padding: '0', backgroundColor: '#f5f5f5', height:"432px" }}>
                <Container maxWidth="lg" style={{ paddingTop: "80px" }}>
                    <Typography variant="h6" sx={{ marginBottom: '20px' }}>
                        Support Sama's Mission
                    </Typography>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={4}>
                            <Box>
                                <img src={require("./assets/Group 22 (1).svg").default} alt="Corporate Laptop Donation" />
                                <Typography variant="subtitle1" sx={{ margin: '16px 0px' }}>
                                    Corporate Laptop Donation
                                </Typography>
                                <Typography variant='body1'>
                                    Transform your end-of-life laptops into powerful tools for education and empowerment.
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Box>
                                <img src={require("./assets/Group 22.svg").default} alt="Corporate Impact Funding" />
                                <Typography variant="subtitle1" sx={{ margin: '16px 0px' }}>
                                    Corporate Impact Funding
                                </Typography>
                                <Typography variant='body1'>
                                    Partner with us to scale our impact and bridge the digital divide for underserved girls and women.
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Box>
                                <img src={require("./assets/Group 23.svg").default} alt="Individual Contribution" />
                                <Typography variant="subtitle1" sx={{ margin: '16px 0px' }}>
                                    Individual Contribution
                                </Typography>
                                <Typography variant='body1'>
                                    Join our mission to empower girls and women through digital access and education.
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Section 2: Your Details */}
            <Box sx={{ padding: '40px 20px' }}>
                <Container maxWidth="lg">
                    <Typography variant="h5" sx={{ marginBottom: '20px' }}>
                        Your Details
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <InputLabel sx={{ marginBottom: '5px' }}>First Name</InputLabel>
                                <TextField 
                                    fullWidth 
                                    required 
                                    variant="outlined" 
                                    name="firstName"
                                    value={formData.firstName}
                                    label="First Name"
                                    onChange={handleChange}
                                    sx={{ backgroundColor: 'white' }}
                                    error={!!errors.firstName}
                                    helperText={errors.firstName}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <InputLabel sx={{ marginBottom: '5px' }}>Last Name</InputLabel>
                                <TextField 
                                    fullWidth 
                                    required 
                                    label="Last Name"
                                    variant="outlined" 
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    sx={{ backgroundColor: 'white' }}
                                    error={!!errors.lastName}
                                    helperText={errors.lastName}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <InputLabel sx={{ marginBottom: '5px' }}>Email Address</InputLabel>
                                <TextField 
                                    fullWidth 
                                    required 
                                    type="email" 
                                    label="Email Address"
                                    variant="outlined" 
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    sx={{ backgroundColor: 'white' }}
                                    error={!!errors.email}
                                    helperText={errors.email}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <InputLabel sx={{ marginBottom: '5px' }}>Phone Number</InputLabel>
                                <TextField 
                                    fullWidth 
                                    required 
                                    type="tel" 
                                    variant="outlined" 
                                    label="Phone Number"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    sx={{ backgroundColor: 'white' }}
                                    error={!!errors.phone}
                                    helperText={errors.phone}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <FormControl component="fieldset" error={!!errors.contributionType}>
                                    <Typography sx={{ marginBottom: '10px' }}>I am contributing as:</Typography>
                                    <RadioGroup 
                                        row 
                                        name="contributionType" 
                                        value={formData.contributionType} 
                                        onChange={handleChange}
                                    >
                                        <FormControlLabel value="individual" control={<Radio />} label="An individual" />
                                        <FormControlLabel value="company" control={<Radio />} label="On behalf of a company" />
                                    </RadioGroup>
                                    {errors.contributionType && (
                                        <FormHelperText>{errors.contributionType}</FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <InputLabel sx={{ marginBottom: '5px' }}>Company Name</InputLabel>
                                <TextField 
                                    fullWidth 
                                    variant="outlined" 
                                    name="companyName"
                                    label="Company Name"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    sx={{ backgroundColor: 'white' }}
                                    error={!!errors.companyName}
                                    helperText={errors.companyName}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <FormControl component="fieldset" error={!!errors.donationType}>
                                    <Typography sx={{ marginBottom: '10px' }}>I would like to:</Typography>
                                    <RadioGroup 
                                        row 
                                        name="donationType" 
                                        value={formData.donationType} 
                                        onChange={handleChange}
                                    >
                                        <FormControlLabel value="donate-laptops" control={<Radio />} label="Donate laptops" />
                                        <FormControlLabel value="financial-contribution" control={<Radio />} label="Make a financial contribution" />
                                        <FormControlLabel value="both" control={<Radio />} label="Both donate laptops and contribute financially" />
                                    </RadioGroup>
                                    {errors.donationType && (
                                        <FormHelperText>{errors.donationType}</FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <InputLabel sx={{ marginBottom: '5px' }}>Estimated number of laptops</InputLabel>
                                <TextField 
                                    fullWidth 
                                    variant="outlined" 
                                    name="numberOfLaptops"
                                    label="Estimated number of laptops"
                                    value={formData.numberOfLaptops}
                                    onChange={handleChange}
                                    sx={{ backgroundColor: 'white' }}
                                    error={!!errors.numberOfLaptops}
                                    helperText={errors.numberOfLaptops}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <FormControl component="fieldset" error={!!errors.hearAbout}>
                                    <Typography sx={{ marginBottom: '10px' }}>How did you hear about Sama?</Typography>
                                    <RadioGroup 
                                        row 
                                        name="hearAbout" 
                                        value={formData.hearAbout} 
                                        onChange={handleChange}
                                    >
                                        <FormControlLabel value="social-media" control={<Radio />} label="Social Media" />
                                        <FormControlLabel value="website" control={<Radio />} label="Website" />
                                        <FormControlLabel value="friend" control={<Radio />} label="Friend/Colleague" />
                                        <FormControlLabel value="event" control={<Radio />} label="Event" />
                                        <FormControlLabel value="other" control={<Radio />} label="Other" />
                                    </RadioGroup>
                                    {errors.hearAbout && (
                                        <FormHelperText>{errors.hearAbout}</FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <InputLabel sx={{ marginBottom: '5px' }}>Other</InputLabel>
                                <TextField 
                                    fullWidth 
                                    variant="outlined" 
                                    name="other"
                                    value={formData.other}
                                    onChange={handleChange}
                                    sx={{ backgroundColor: 'white' }}
                                />
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

                            <Grid item xs={12}>
                                <Button 
                                    type="submit" 
                                    variant="contained" 
                                    sx={{ backgroundColor: '#F38872', color: '#fff' }}
                                >
                                    Submit
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Container>
            </Box>
        </Box>
    );
}

export default Donation;
