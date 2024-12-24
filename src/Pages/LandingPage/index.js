import React from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import FormSection from "./FormSection";

import Corporates from "./Images/corporates.svg";
import NGO from "./Images/NGOs.svg";
import Collaborators from "./Images/Collaborators.svg";
import Logo from "./Images/samalogo.svg";

const LandingPage = () => {
  return (
    <>
      <Box
        sx={{
          backgroundColor: "#F9F6F2",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 2,
        }}
      >
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "center", md: "flex-start" },
              gap: { xs: 3, md: 8 },
              maxWidth: "1200px",
              mx: "auto",
              px: { xs: 2, md: 4 },
            }}
          >
            {/* Left Section - Text Content */}

            <Box
              sx={{
                flex: 1,
                textAlign: { xs: "center", md: "left" },
                maxWidth: { md: "546px" },
              }}
            >
              <Box sx={{ mb: 2 }}>
                <img
                  src={Logo}
                  alt="Sama Logo"
                  style={{
                    width: "130px",
                    marginBottom: "10px",
                  }}
                />
              </Box>

              <Typography variant="h5">
                Empower Tomorrow's Innovators with Yesterday's Devices
              </Typography>

              <Typography variant="body1" sx={{ py: 2 }}>
                Donate laptops to enable students from marginalized communities
                to open pathways for higher education or exciting careers.
              </Typography>
            </Box>

            {/* Right Section - Form */}
         
        
            <Box
              sx={{
                flex: 1,
                width: "110%", 
                maxWidth: { xs: "110%", md: "400px" },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                transform: { xs: "scale(1.1)", md: "none" },
                "& > div": {
                  // Form container
                  width: "100%",
                  bgcolor: "white",
                  borderRadius: "12px",

                  pb: 3,
                  "& .MuiButton-root": {
                    whiteSpace: "nowrap",
                  },
                },
              }}
            >
              <FormSection />
            </Box>
          </Box>
        </Container>
      </Box>
      <Container maxWidth="md">
        <Box sx={{ py: 6 }}>
          <Typography
            textAlign="center"
            variant="h5"
            fontWeight="bold"
            color="#5B7048"
            gutterBottom
          >
            About Us
          </Typography>

          <Typography variant="body1" color="#555" sx={{ mt: 2 }}>
            Sama is a pioneering initiative solving the dual problem of digital
            divide and the growing e-waste crisis. By refurbishing end-of-life
            laptops donated by corporations, we empower underserved women and
            youth across India with the tools they need to access education,
            secure employment, and build a sustainable future. Our mission is
            simple yet transformative, to empower 1 million women and youth with
            technology by 2030.
          </Typography>
        </Box>
      </Container>

      <Box
        sx={{
          backgroundColor: "#F1F3EE",
          py: 6,

        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          color="#5B7048"
          textAlign="center"
          sx={{ mb: 4 }}
        >
          Our Impact Till Date
        </Typography>
        <Container maxWidth="md">
          <Typography variant="body1" sx={{ textAlign: "left", mb: 2 }}>
            <ul style={{ paddingLeft: "0" }}>
              <li>
                <strong>Empowered 317 students</strong> to secure jobs,{" "}
                <strong>supported 700+ individuals</strong> in their career
                journeys, and <strong>trained 102 trainers</strong>, creating a
                ripple effect.
              </li>
              <li>
                Helped <strong>180 underserved students</strong> gain admissions
                to top universities, opening new pathways to success.
              </li>
              <li>
                Established computer labs in 1489 government schools,{" "}
                <strong>
                  impacting 386,970 students, including 121,157 young women.
                </strong>
              </li>
            </ul>
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Title */}
        <Typography
          variant="h5"
          fontWeight="bold"
          color="#5B7048"
          textAlign="center"
          sx={{ mb: 4, mt: 6 }}
        >
          Our Partners
        </Typography>

        {/* Cards */}
        <Grid
          container
          spacing={0}
          justifyContent="center"
          sx={{ maxWidth: "100%" }}
        >
          {/* Card 1 */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{ display: "flex", justifyContent: "center" }}
          >
            <Box
              component="img"
              src={Corporates}
              alt="Corporate Logo"
              sx={{
                width: "100%",
                maxWidth: "550px",
                height: "auto",
                objectFit: "contain",
                display: "block",
              }}
            />
          </Grid>

          {/* Card 2 */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{ display: "flex", justifyContent: "center" }}
          >
            <Box
              component="img"
              src={NGO}
              alt="NGO Logo"
              sx={{
                width: "100%",
                maxWidth: "550px",
                height: "auto",
                objectFit: "contain",
                display: "block",
              }}
            />
          </Grid>

          {/* Card 3 */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{ display: "flex", justifyContent: "center", mt: 2 }}
          >
            <Box
              component="img"
              src={Collaborators}
              alt="Ecosystem Collaborators"
              sx={{
                width: "100%",
                maxWidth: "550px",
                height: "auto",
                objectFit: "contain",
                display: "block",
              }}
            />
          </Grid>
        </Grid>
      </Container>
      <Box sx={{ backgroundColor: "#F8F3F0", mb: 5 }}>
        <Container maxWidth="md" sx={{ mt: 6 }}>
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography variant="h5" sx={{ color: "#5C785A", pt: 7 }}>
              Creating Impact Together
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              Funding from partners like helps us in the following ways:
            </Typography>
            <List sx={{ listStyle: "disc", pl: 4 }}>
              {[
                "To provide refurbished laptops to students preloaded with offline and online courses, equipping them with skills and tools for employment which otherwise would have not been affordable by them",
                "Help underserved students access technology, enabling them to pursue and excel in higher education",
                "With our PAN India network, your contributions impact rural and underserved communities across the country",
                "We provide detailed, transparent reports on the impact of your contributions, ensuring accountability and meaningful outcomes",
                "Align your contributions with your sustainability and social impact targets",
              ].map((text, index) => (
                <ListItem key={index} sx={{ display: "list-item", pl: 0 }}>
                  <ListItemText
                    primary={text}
                    sx={{
                      margin: 0,
                      padding: 0,
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          <Typography variant="subtitle1" sx={{ py: 2 }}>
            To know more about how you can support Sama and help us create a
            brighter future for India's youth, reach out to us-
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
              maxWidth: "480px",
              margin: "0 auto",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
                maxWidth: "400px",
                bgcolor: "white",
                borderRadius: "12px",
                pb: 3,
              }}
            >
              <FormSection />
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default LandingPage;
