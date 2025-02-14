import React from "react";
import { Button, Box, Container, Typography, Grid, Card, CardMedia, TextField } from "@mui/material";
import ourteam from './style';
import StayConnected from '../../../common/StayConnected'

const videoSources = [
    "/videos/video1.mp4",
<<<<<<< HEAD
    "/videos/video8.mp4",
    "/videos/video2.mp4",
    "/videos/video3.mp4",
    "/videos/video9.mp4",
    "/videos/video6.mp4",
    "/videos/video7.mp4",
    "/videos/video4.mp4",
    "/videos/video8.mp4",
=======
    "/videos/video3.mp4",
    "/videos/video2.mp4",
    "/videos/video4.mp4",
    "/videos/video5.mp4",
    "/videos/video3.mp4",
    "/videos/video1.mp4",
    "/videos/video6.mp4",
    "/videos/video7.mp4",
>>>>>>> d9a44eb (our team)
];


const OurTeam = () => {
    return (
        <Container maxWidth="lg" sx={ourteam.container}>
            <Typography variant="h5" gutterBottom>
                Our Team
            </Typography>
            <Typography variant="body1" paragraph>
                Meet the passionate individuals who bring innovation and
                excellence to every project. Together, we're driven by a
                shared vision of creating lasting impact through our work
            </Typography>
            <Grid container spacing={0.5} justifyContent="center" sx={ourteam.gridContainer}>
<<<<<<< HEAD
                {videoSources.map((video, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index} sx={ourteam.gridItem}>
                        <Card sx={{ ...ourteam.card }}> {/* Ensure Card takes full height */}
                            <video
                                src={video}
                                style={{
                                    width: "100%",
                                    height: "100%",  // Force video to fill card height
                                    objectFit: "cover", // Crop the video to fill the space
                                }}
                                autoPlay
                                loop
                                muted
                                playsInline
                                controls={false}
                            />
                        </Card>
                    </Grid>
                ))}
            </Grid>
=======
    {videoSources.map((video, index) => (
        <Grid item xs={12} sm={6} md={4} key={index} sx={ourteam.gridItem}>
            <Card sx={{ ...ourteam.card}}> {/* Ensure Card takes full height */}
                <video
                    src={video}
                    style={{
                        width: "100%",
                        height: "100%",  // Force video to fill card height
                        objectFit: "cover", // Crop the video to fill the space
                    }}
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls={false}
                />
            </Card>
        </Grid>
    ))}
</Grid>



>>>>>>> d9a44eb (our team)
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
            <StayConnected />
        </Container>
    );
};


export default OurTeam;