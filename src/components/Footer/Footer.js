import React from "react";
import { Container, Grid, Typography, Link, Box } from "@mui/material";
import samalogo from "../../assets/samalogo.png";



const Footer = () => {
  return (
    <footer>
      <Box maxWidth="false" bgcolor="primary.light"
       py={5}
       
       >
        <Container maxWidth="lg" >
          <Grid container spacing={2} my={2}>
            <Grid item xs={4} sm={9} md={8}>
              <Link href="/">
              <img src={samalogo} alt="Logo" width={100} />
              </Link>
            </Grid>
            {/* <Grid item xs={3} sm={2} md={2} align="right">
              <Link
                href="/about"
                variant="body1"
                sx={{
                  textDecoration: "none",
                  color: "text.secondary",
                  "&:hover": {
                    color: "black",
                  },
                }}
              >
                About Us
              </Link>
            </Grid>
            <Grid item xs={5} sm={2} md={2} align="right">
              <Link
                href="/our-approach"
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
            </Grid> */}
          </Grid>
          <hr />
          <Box textAlign="center" mt={4}>
            <Typography variant="body1" color="text.secondary">
              Copyright © 2024 reserved
            </Typography>
          </Box>
        </Container>
      </Box>
    </footer>
  );
};

export default Footer;
