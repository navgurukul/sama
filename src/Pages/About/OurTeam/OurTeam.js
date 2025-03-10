import React, { useState, useEffect } from "react";
import { Button, Box, Container, Typography, Grid, Card } from "@mui/material";
import ourteam from "./style";
import StayConnected from "../../../common/StayConnected";

const originalTeamMembers = [
  {
    video: "https://sama-app-gifs.s3.ap-south-1.amazonaws.com/video2.mp4",
    name: "Aman Sharma",
    Designation: "(Frontend Developer)",
  },
  {
    video: "https://sama-app-gifs.s3.ap-south-1.amazonaws.com/video3.mp4",
    name: "Shivani Bawa",
    Designation: "(CEO's Office Intern)",
  },
  {
    video: "https://sama-app-gifs.s3.ap-south-1.amazonaws.com/video4.mp4",
    name: "Nitesh Sharma",
    Designation: "(COO, Co- Founder)",
  },
  {
    video: "https://sama-app-gifs.s3.ap-south-1.amazonaws.com/video6.mp4",
    name: "Sudiksha Yadav",
    Designation: "(Design)",
  },
  {
    video: "https://sama-app-gifs.s3.ap-south-1.amazonaws.com/video7.mp4",
    name: "Shweta Deshmukh",
    Designation: "(Operation)",
  },
  {
    video: "https://sama-app-gifs.s3.ap-south-1.amazonaws.com/video8.mp4",
    name: "Pradeep Thakur",
    Designation: "(Operation)",
  },
  {
    video: "https://sama-app-gifs.s3.ap-south-1.amazonaws.com/video9.mp4",
    name: "Rahul Bauddha",
    Designation: "(Operation)",
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
              <Card 
                sx={{ 
                  ...ourteam.card, 
                  position: "relative",
                  aspectRatio: "1/1", // Make card a perfect square
                  overflow: "hidden", // Ensure content doesn't overflow
                }}
              >
                {!videoErrors[index] ? (
                  <>
                    <video
                      key={member.video}
                      src={member.video}
                      style={{
                        width: "500.89px",
                        height: "317.212px",
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
                        flexDirection: "column", // Stacks elements vertically
                        alignItems: "flex-end", // Aligns text to the right
                        justifyContent: "flex-end",
                        transition: "padding-bottom 0.3s ease",
                        "&:hover": {
                          "& .designation": {
                            maxHeight: "50px",
                            opacity: 1,
                            marginTop: "5px",
                          }
                        }
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          color: "#FFF",
                          textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                        }}
                      >
                        {member.name}
                      </Typography>
                      <Typography
                        className="designation"
                        variant="body1"
                        sx={{
                          color: "#FFF",
                          textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                          opacity: 0, // Hidden by default
                          maxHeight: 0, // Takes no space when hidden
                          overflow: "hidden", // Hide overflow
                          marginTop: 0, // No margin initially
                          transition: "all 0.3s ease", // Smooth transition for all properties
                        }}
                      >
                        {member.Designation}
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
          sx={{ marginTop: "48px",marginBottom:"32px", marginLeft: { xs: "0px", md: "140px" } }}
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
                  paddingLeft: "20px",
                  listStyleType: "disc",
                  paddingTop: "0px",
                  marginTop: "0px",
                }}
              >
                <li>
                  <Typography variant="body1" sx={{ textAlign: { xs: "center", md: "left" } }}>
                    Be part of a mission-driven organization empowering
                    underserved women and youth through technology.
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1" sx={{ textAlign: { xs: "center", md: "left" } }}>
                    Gain exposure to CSR initiatives, sustainability practices,
                    and community development projects.
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1" sx={{ textAlign: { xs: "center", md: "left" } }}>
                    Work closely with NGOs, corporate partners, and industry
                    leaders, building a robust professional network.
                  </Typography>
                </li>
              </ul>
              <Button
                variant="contained"
                color="primary"
                sx={ourteam.button}
                onClick={() => window.open("https://www.navgurukul.org/careers", "_blank")}
              >
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