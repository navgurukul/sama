import React, { useState, useEffect } from "react";
import { Button, Box, Container, Typography, Grid, Card } from "@mui/material";
import ourteam from "./style";
import StayConnected from "../../../common/StayConnected";

const originalTeamMembers = [
  {
    video: "https://sama-app-gifs.s3.ap-south-1.amazonaws.com/video2.mp4",
    name: "Aman Sharma",
  },
  {
    video: "https://sama-app-gifs.s3.ap-south-1.amazonaws.com/video3.mp4",
    name: "Shivani Bawa",
  },
  {
    video: "https://sama-app-gifs.s3.ap-south-1.amazonaws.com/video4.mp4",
    name: "Nitesh Sharma",
  },
  {
    video: "https://sama-app-gifs.s3.ap-south-1.amazonaws.com/video6.mp4",
    name: "Sudiksha Yadav",
  },
  {
    video: "https://sama-app-gifs.s3.ap-south-1.amazonaws.com/video7.mp4",
    name: "Shweta Deshmukh",
  },
  {
    video: "https://sama-app-gifs.s3.ap-south-1.amazonaws.com/video8.mp4",
    name: "Pradeep Thakur",
  },
  {
    video: "https://sama-app-gifs.s3.ap-south-1.amazonaws.com/video9.mp4",
    name: "Rahul Bauddha",
  },
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
  const [teamMembers, setTeamMembers] = useState([]);
  const [videoErrors, setVideoErrors] = useState({});

  useEffect(() => {
    setTeamMembers(shuffleArray(originalTeamMembers));
  }, []);

  const handleVideoError = (index, videoSrc) => {
    console.error(`Failed to load video at index ${index}: ${videoSrc}`);
    setVideoErrors((prev) => ({
      ...prev,
      [index]: true,
    }));
  };

  return (
    <>
      <Container maxWidth="lg" sx={ourteam.container}>
        <Typography variant="h5" gutterBottom>
          Our Team
        </Typography>
        <Typography variant="body1" paragraph>
          Meet the passionate individuals who bring innovation and excellence to
          every project. Together, we're driven by a shared vision of creating a
          lasting impact through our work.
        </Typography>
        <Grid
          container
          spacing={0.5}
          justifyContent="center"
          sx={ourteam.gridContainer}
        >
          {teamMembers.map((member, index) => (
            <Grid item xs={12} sm={6} md={4} key={index} sx={ourteam.gridItem}>
              <Card sx={{ ...ourteam.card, position: "relative" }}>
                {!videoErrors[index] ? (
                  <>
                    <video
                      key={member.video}
                      src={member.video}
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
                      onError={() => handleVideoError(index, member.video)}
                    />
                    {/* Name overlay */}
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: "20px",
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)",
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "flex-end", // This line moves the name to the right
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          color: "#FFF",
                          // fontWeight: 500,
                          textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                        }}
                      >
                        {member.name}
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "grey.200",
                      minHeight: "200px",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Video unavailable
                    </Typography>
                  </Box>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
        <Grid
          container
          spacing={2}
          sx={{ marginTop: "60px", marginLeft: { xs: "0px", md: "140px" } }}
        >
          <Grid item xs={12} md={6}>
            <Box sx={ourteam.box}>
              <Typography variant="h5" gutterBottom>
                Grow With Us
              </Typography>
              <Typography variant="body1" paragraph sx={ourteam.typographyBody}>
                Your success is our success. We've built a workplace where your
                well-being matters and your growth is supported every step of the
                way. Discover the advantages of being part of our team.
              </Typography>
              <ul
                style={{
                  textAlign: "left",
                  paddingLeft: "20px",
                  listStyleType: "disc",
                  paddingTop: "0px",
                  marginTop: "0px",
                }}
              >
                <li>
                  <Typography variant="body1">
                    Be part of a mission-driven organization empowering
                    underserved women and youth through technology.
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    Gain exposure to CSR initiatives, sustainability practices,
                    and community development projects.
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    Work closely with NGOs, corporate partners, and industry
                    leaders, building a robust professional network.
                  </Typography>
                </li>
              </ul>
              <Button variant="contained" color="primary" sx={ourteam.button}>
                Explore Current Openings
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
      <StayConnected />
    </>
  );
};

export default OurTeam;
