import React from "react";
import { 
  Container,
  Grid, 
  Box, 
  Typography,
  List,
  ListItem,
  ListItemText 
} from "@mui/material";
import Image1 from "./assets/1.png"; // Replace with your actual image paths
import Image2 from "./assets/2.png";
import Image3 from "./assets/3.png";
import ourteam from "../OurTeam/style";

const services = [
  {
    image: Image1,
    title: "Mission",
    description: "Empower 1 million women and youth by 2030 through technology, equipping them with the resources needed for education, livelihoods, and growth promoting a circular economy by integrating environmental responsibility into digital inclusion efforts",
  },
  {
    image: Image2,
    title: "Vision",
    description: "To bridge the digital divide and empower underserved communities by providing access to technology, fostering education, and promoting environmental sustainability",
  },
  {
    image: Image3,
    title: "Service Three",
    description: [
      "• Women and Youth",
      "• Empowerment",
      "• Sustainability",
      "• Impact-driven",
      "• Collaboration",
      "• Transparency",
      "• Community-centric approach"
    ],
  },
];

const ServiceIcons = () => {
  return (
    <Container maxWidth="lg" sx={ourteam.container}>
      <Grid container spacing={4} justifyContent="center">
        {services.map((service, index) => (
          <Grid item xs={14} sm={6} md={4} key={index}>
            <Box
              sx={ourteam.AboutCard}>
              <Box
                component="img"
                src={service.image}
                alt="image"
              />
              <Box>
                <Typography mt={2} variant="h6" fontWeight="bold" gutterBottom>
                  {service.title}
                </Typography>
              </Box>
              {index === 2 ? (
                <List dense>
                  {service.description.map((point, i) => (
                     <ListItem key={i} sx={{ padding: "0px 0" }}>
                     <ListItemText
                       primary={point}
                       primaryTypographyProps={{
                        variant: "body1", 
                        color: "textSecondary", 
                       }}
                     />
                   </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" color="textSecondary" mt={3} sx={{textAlign: "left" }}>
                  {service.description}
                </Typography>
              )}
            </Box>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default ServiceIcons;
