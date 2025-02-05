import { useState } from "react";
import {
    Button,
    Box,
    Container,
    Typography,
    Grid,
    InputLabel,
    TextField,
    Select,
    MenuItem,
    FormControl,
} from "@mui/material";
import StayConnected from '../../../common/StayConnected'
import ourteam from '../OurTeam/style';

const OurGoverment = () => {

    const [selectedState, setSelectedState] = useState("");

    const handleStateChange = (event) => {
        setSelectedState(event.target.value);
    };

    return (
        <Container maxWidth="lg" sx={ourteam.container}>
            <Box sx={ourteam.GovBox}>
                <Typography variant="h5" gutterBottom>
                    Our Government Partners
                </Typography>
                <Typography variant="body1" paragraph sx={ourteam.Para}>
                    Through government collaborations, we scale our efforts
                    to reach rural and underserved <br /> areas, ensuring equitable
                    access to technology and opportunity
                </Typography>
                <Typography variant="h6" gutterBottom sx={ourteam.secondhead}>
                    Help Sama bridge the digital divide in rural and <br />underserved areas
                </Typography>
                <Box sx={ourteam.Form}>
                    <form >
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
                                    sx={{ backgroundColor: "white" }}
                                />
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
                                    sx={{ backgroundColor: "white" }}
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
                                    sx={{ backgroundColor: "white" }}
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
                                    sx={{ backgroundColor: "white" }}
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
                                    sx={{ backgroundColor: "white" }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <InputLabel sx={ourteam.InputLabel}>
                                    <b>City</b>
                                </InputLabel>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    name="numberOfLaptops"
                                    placeholder="Enter City"
                                    sx={{ backgroundColor: "white" }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <InputLabel sx={ourteam.InputLabel}>
                                    <b>State</b>
                                </InputLabel>
                                <FormControl fullWidth sx={{ backgroundColor: "white" }}>
                                    <Select
                                        value={selectedState}
                                        onChange={handleStateChange}
                                        variant="outlined"
                                        displayEmpty
                                        sx={{ textAlign: "left" }} 
                                        renderValue={(selected) =>
                                            selected ? selected : <span style={{ color: "#A9A9A9"}}>Select State</span> // Custom styling
                                        }                                    >
                                        <MenuItem value="Maharashtra">Maharashtra</MenuItem>
                                        <MenuItem value="New Delhi">New Delhi</MenuItem>
                                        <MenuItem value="Gujrat">Gujrat</MenuItem>
                                        <MenuItem value="Punjab">Punjab</MenuItem>
                                    </Select>
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
                                        sx={{ backgroundColor: "white" }}
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
                                }}
                            >
                                <Button type="submit" variant="contained" color="primary" style={{ width: "227px", height: "48px", alignItems: "center" }}>
                                    Become a Partner
                                </Button>

                            </Grid>
                        </Grid>
                    </form>
                </Box>
            </Box>
            <StayConnected />
        </Container>
    );
};


export default OurGoverment;