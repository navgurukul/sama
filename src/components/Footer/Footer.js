import React from "react";
import { Container, Grid, Typography, Link, Box } from "@mui/material";
import Divider from "@mui/material/Divider";
import samalogo from "../../assets/samalogo.png";

const Footer = () => {
  return (
    <footer>
      <Box
        maxWidth="false"
        bgcolor="primary.light"
        p={[2, 4, 2, 4]}
      >
        <Container maxWidth="lg">
          <Grid
            container
            my={4}
          >
            <Grid item xs={4} sm={9} md={8}>
              <img src={samalogo} alt="Logo" width={100} />
            </Grid>
            <Grid item xs={4} sm={2} md={2} align="right">
              <Link
                href="/about"
                variant="body1"
                sx={{
                  textDecoration: "none",
                  color: "text.secondary",
                  "&:hover": {
                    color: "black", // Optional: Change color on hover
                  },
                }}
                color="text.secondary"
              >
                About Us
              </Link>
            </Grid>
            <Grid item xs={4} sm={2} md={2} align="right">
              <Link
                href = "/our-approach"
                variant="body1"
                sx={{
                  textDecoration: "none",
                  color: "text.secondary",
                  "&:hover": {
                    color: "black", // Optional: Change color on hover
                  },
                }}
              >
                Our Approach
              </Link>
            </Grid>
          </Grid>
          <hr />
          <Box mt={3} textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Copyright © 2024 reserved
            </Typography>
          </Box>
        </Container>
      </Box>
    </footer>
  );
};

export default Footer;
