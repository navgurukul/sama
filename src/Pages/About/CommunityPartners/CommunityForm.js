import { useState } from "react";
import {
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
} from "@mui/material";
import ourteam from '../OurTeam/style';

const CommunityForm = () => {

    const [selectedState, setSelectedState] = useState("");

    const handleStateChange = (event) => {
        setSelectedState(event.target.value);
    };

    return (
        
        <Box sx={ourteam.ComForm} >
            <Typography variant="h6" gutterBottom sx={ourteam.secondhead}>
                Help Sama in fostering innovation and addressing<br /> grassroot challenges                
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
                                        selected ? selected : <span style={{ color: "#A9A9A9" }}>Select State</span> // Custom styling
                                    }                                    >
                                    <MenuItem value="Maharashtra">Maharashtra</MenuItem>
                                    <MenuItem value="New Delhi">New Delhi</MenuItem>
                                    <MenuItem value="Gujrat">Gujrat</MenuItem>
                                    <MenuItem value="Punjab">Punjab</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <InputLabel sx={ourteam.InputLabel}>
                                <b>Years of Operation</b>
                            </InputLabel>
                            <TextField
                                fullWidth
                                variant="outlined"
                                name="numberOfLaptops"
                                placeholder="Enter number of years"
                                sx={{ backgroundColor: "white" }}
                            />
                        </Grid>
                        <Grid item xs={12} sx={{ textAlign: "left" }}>
                            <FormControl component="fieldset" >
                                <Typography
                                    className="customSubtitle1"
                                    sx={{ marginBottom: "10px" }}
                                >
                                    Communities you serve
                                </Typography>
                                <RadioGroup
                                    row
                                    name="hearAbout"
                                >
                                    <FormControlLabel
                                        value="women"
                                        control={<Radio />}
                                        label="Women"
                                    />
                                    <FormControlLabel
                                        value="children"
                                        control={<Radio />}
                                        label="Children"
                                    />
                                    <FormControlLabel
                                        value="sex workers"
                                        control={<Radio />}
                                        label="Sex Workers"
                                    />
                                    <FormControlLabel
                                        value="physically challenged"
                                        control={<Radio />}
                                        label="Physically Challenged"
                                    />

                                </RadioGroup>
                                <RadioGroup
                                    row
                                    name="hearAbout"
                                >
                                    <FormControlLabel
                                        value="mentally challenged"
                                        control={<Radio />}
                                        label="Mentally Challenged"
                                    />
                                    <FormControlLabel
                                        value="enviroment"
                                        control={<Radio />}
                                        label="Enviroment"
                                    />
                                    <FormControlLabel
                                        value="other"
                                        control={<Radio />}
                                        label="Other"
                                    />
                                    <Grid item xs={12} md={6} sx={{ marginTop: "10px" }}>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            name="numberOfLaptops"
                                            placeholder=" Other"
                                            sx={{ backgroundColor: "white" }}
                                        />
                                    </Grid>
                                </RadioGroup>
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
    );
};


export default CommunityForm;