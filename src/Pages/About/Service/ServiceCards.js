import React from "react";
import {
  Container,
  Grid,
  Box,
  Typography,
} from "@mui/material";
import Image1 from "./assets/1.png"; 
import Image2 from "./assets/2.png";
import Image3 from "./assets/3.png";
import ourteam from "../OurTeam/style";

const services = [
  {
    image: Image1,
    title: "Mission",
    description:
      "Empower 1 million women and youth by 2030 through technology, equipping them with the resources needed for education, livelihoods, and growth promoting a circular economy by integrating environmental responsibility into digital inclusion efforts",
  },
  {
    image: Image2,
    title: "Vision",
    description:
      "To bridge the digital divide and empower underserved communities by providing access to technology, fostering education, and promoting environmental sustainability",
  },
  {
    image: Image3,
    title: "Values",
    description: [
      "Women and Youth",
      "Empowerment",
      "Sustainability",
      "Impact-driven",
      "Collaboration",
      "Transparency",
      "Community-centric approach",
    ],
  },
];

const ServiceIcons = () => {
  return (
    // <Container maxWidth="lg" sx={{margin:"80px 0px"}}>
      <Grid container spacing={3} align="left" sx={{margin:"48px 0px", paddingRight:"41px"}}>
        {services.map((service, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Box
              sx={{
                ...ourteam.AboutCard,
                textAlign: "center",
                p: 3,
                borderRadius: 2,
                bgcolor: "background.paper",
              }}
            >
              <Box
                component="img"
                src={service.image}
                alt={service.title}
                sx={{ width: 100, height: 100, objectFit: "contain", mb: 2 }}
              />
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {service.title}
              </Typography>

              { service.title === "Values"? (
                <Box component="ul" sx={{ pl: 3, textAlign: "left" }}>
                  {service.description.map((point, i) => (
                    <Box component="li" key={i}>
                      <Typography color="textSecondary" variant="body1">
                        {point}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography
                  variant="body1"
                  color="textSecondary"
                  sx={{ textAlign: "left", mt: 1 }}
                >
                  {service.description}
                </Typography>
              )}
            </Box>
          </Grid>
        ))}
      </Grid>
    // </Container>
  );
};

export default ServiceIcons;
