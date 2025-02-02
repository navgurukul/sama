import React from "react";
import { Button, Box, Container, Typography, Grid, Card, CardMedia, TextField } from "@mui/material";
import TeamImg from './StudentImg.png';
import TeamImg2 from './Being Patient 1.png';
import ourteam from './style';


const OurTeam = () => {
    return (
        <Container maxWidth="lg" sx={ourteam.container}>
            <Typography variant="h5" gutterBottom>
                Our Team
            </Typography>
            <Typography variant="body1" paragraph>
                Meet the passionate individuals who bring innovation and
                excellence to every project.<br /> Together, we're driven by a
                shared vision of creating lasting impact through our work
            </Typography>
            <Grid container spacing={0.3} justifyContent="center" sx={ourteam.gridContainer}>
                {[...Array(9)].map((_, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index} sx={ourteam.gridItem}>
                        <Card sx={ourteam.card}>
                            <CardMedia
                                component="img"
                                image={TeamImg}
                                alt={`Team member ${index + 1}`}
                                sx={ourteam.cardMedia}
                            />
                        </Card>
                    </Grid>
                ))}
            </Grid>
            <Grid container spacing={2} sx={{ marginTop: "60px", marginLeft: { xs: "0px", md: "140px" } }}>
                <Grid item xs={12} md={6}>
                    <Box
                        sx={ourteam.box}
                    >
                        <Typography variant="h5" gutterBottom >
                            Grow With Us
                        </Typography>
                        <Typography
                            variant="body1"
                            paragraph
                            sx={ourteam.typographyBody}
                        >
                            Your success is our success. We've built a workplace where your wellbeing matters and your growth is supported every step of the way. Discover the advantages of being part of our team.
                        </Typography>
                        <ul style={{ textAlign: "left", paddingLeft: "20px", listStyleType: "disc", paddingTop: "0px", marginTop: "0px" }}>
                            <li>
                                <Typography variant="body1" >
                                    Be part of a mission-driven organization empowering underserved women and<br />
                                    youth through technology.
                                </Typography>
                            </li>
                            <li>
                                <Typography variant="body1" >
                                    Gain exposure to CSR initiatives, sustainability practices, and community<br />
                                    development projects.
                                </Typography>
                            </li>
                            <li>
                                <Typography variant="body1" >
                                    Work closely with NGOs, corporate partners, and industry leaders, building a robust<br />
                                    professional network.
                                </Typography>
                            </li>
                        </ul>
                        <Button
                            variant="contained"
                            color="primary"
                            sx={ourteam.button}
                        >
                            Explore Current Openings
                        </Button>
                    </Box>
                </Grid>
            </Grid>
            <Grid container sx={ourteam.mainGrid}>
                {/* Left Side Content */}
                <Grid item xs={12} md={7} sx={ourteam.leftGrid}>
                    <Typography variant="h6" sx={ourteam.headingText}>
                        Stay Connected with Sama’s Journey
                    </Typography>
                    <Typography variant="body1" sx={ourteam.paragraphText}>
                        Subscribe to our monthly newsletter,<b>Ripplez</b> , bringing you 
                        from the latest inspiring impact stories to updates from our 
                        mission to empower underserved communities. Don’t miss out 
                        and join the conversation!                    
                    </Typography>
                    <TextField
                        variant="outlined"
                        placeholder="Email ID"
                        fullWidth
                        sx={ourteam.inputField}
                    />
                    <Button variant="contained" sx={ourteam.subscribeButton}>
                        Subscribe
                    </Button>
                </Grid>

                {/* Right Side Image */}
                <Grid item xs={12} md={5} sx={ourteam.rightGrid}>
                    <img src={TeamImg2} alt="Newsletter" style={ourteam.image} />
                </Grid>
            </Grid>
        </Container>
    );
};


export default OurTeam;