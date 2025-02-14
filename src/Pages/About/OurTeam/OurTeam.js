import React, { useState, useEffect } from "react";
import { Button, Box, Container, Typography, Grid, Card } from "@mui/material";
import ourteam from './style';
import StayConnected from '../../../common/StayConnected';

const originalVideoSources = [
    "/videos/video1.mp4",
    "/videos/video8.mp4",
    "/videos/video2.mp4",
    "/videos/video3.mp4",
    "/videos/video9.mp4",
    "/videos/video6.mp4",
    "/videos/video7.mp4",
    "/videos/video4.mp4",
    "/videos/video8.mp4",
];

const shuffleArray = (array) => {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

const OurTeam = () => {
    const [videoSources, setVideoSources] = useState([]);

    useEffect(() => {
        setVideoSources(shuffleArray(originalVideoSources));
    }, []); 

    return (
        <Container maxWidth="lg" sx={ourteam.container}>
            <Typography variant="h5" gutterBottom>
                Our Team
            </Typography>
            <Typography variant="body1" paragraph>
                Meet the passionate individuals who bring innovation and
                excellence to every project. Together, we're driven by a
                shared vision of creating a lasting impact through our work.
            </Typography>
            <Grid container spacing={0.5} justifyContent="center" sx={ourteam.gridContainer}>
                {videoSources.map((video, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index} sx={ourteam.gridItem}>
                        <Card sx={{ ...ourteam.card }}> 
                            <video
                                src={video}
                                style={{
                                    width: "100%",
                                    height: "100%",  
                                    objectFit: "cover",
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
            <Grid container spacing={2} sx={{ marginTop: "60px", marginLeft: { xs: "0px", md: "140px" } }}>
                <Grid item xs={12} md={6}>
                    <Box sx={ourteam.box}>
                        <Typography variant="h5" gutterBottom>
                            Grow With Us
                        </Typography>
                        <Typography variant="body1" paragraph sx={ourteam.typographyBody}>
                            Your success is our success. We've built a workplace where your well-being matters and your growth is supported every step of the way. Discover the advantages of being part of our team.
                        </Typography>
                        <ul style={{ textAlign: "left", paddingLeft: "20px", listStyleType: "disc", paddingTop: "0px", marginTop: "0px" }}>
                            <li>
                                <Typography variant="body1">
                                    Be part of a mission-driven organization empowering underserved women and youth through technology.
                                </Typography>
                            </li>
                            <li>
                                <Typography variant="body1">
                                    Gain exposure to CSR initiatives, sustainability practices, and community development projects.
                                </Typography>
                            </li>
                            <li>
                                <Typography variant="body1">
                                    Work closely with NGOs, corporate partners, and industry leaders, building a robust professional network.
                                </Typography>
                            </li>
                        </ul>
                        <Button variant="contained" color="primary" sx={ourteam.button}>
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
