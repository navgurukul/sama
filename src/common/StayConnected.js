import { useState } from "react";
import TeamImg2 from "../Pages/About/OurTeam/Email Campaign 1.png";
import ourteam from "../Pages/About/OurTeam/style";
import { Button, Typography, Grid, TextField, Box, Container  } from "@mui/material";


const StayConnected = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState(false);



    const handleSubscribe = async () => {
        setMessage("");
        setErrors({});

        if (!email.trim()) {
            setErrors({ email: "Please enter an email." });
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            setErrors({ email: "Invalid email format." });
            return;
        }

        try {
            const capitalizedData = {
                formType: "email",
                email: email.trim()
            };
            
            await fetch(
                `${process.env.REACT_APP_GetInvolvedForm}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(capitalizedData),
                    mode: "no-cors",
                }
            );

            setSuccessMessage(true);
            setTimeout(() => {
                setSuccessMessage(false);
            }, 5000);
            setEmail(""); // Clear input field after success
        } catch (error) {
            setMessage("Failed to subscribe. Please try again.");
            console.error("Error subscribing:", error);
        }
    };

    return (
        <Box sx={ourteam.StayConnectedGrid}>
            <Container maxWidth="lg" >
                <Grid container sx={ourteam.mainGrid}>
                    <Grid item xs={12} md={7} sx={ourteam.leftGrid}>
                        <Typography variant="h6" sx={ourteam.headingText}>
                            Stay Connected with Sama’s Journey
                        </Typography>
                        <Typography variant="body1" sx={ourteam.paragraphText}>
                        Subscribe to our monthly newsletter, Ripplez, bringing you from the latest inspiring impact 
                        stories to updates from our mission to empower underserved communities.
                         Don’t miss out and join the conversation!
                        </Typography>
                        <TextField
                            variant="outlined"
                            placeholder="Email ID"
                            fullWidth
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            sx={ourteam.inputField}
                            error={!!errors.email}
                            helperText={errors.email}
                        />

                        <Grid container alignItems="center" spacing={2}>
                            <Grid item>
                                <Button
                                    variant="contained"
                                    sx={ourteam.subscribeButton}
                                    onClick={handleSubscribe}
                                >
                                    Subscribe
                                </Button>
                            </Grid>
                            {successMessage && (
                                <Grid item>
                                    <Typography
                                        className="customSubtitle1"
                                        sx={{ color: "#5C785A" }}
                                    >
                                        Subscribed successfully.
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    </Grid>

                    <Grid item xs={12} md={3} sx={ourteam.rightGrid}>
                        <img src={TeamImg2} alt="Newsletter" style={ourteam.image} />

                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default StayConnected;
