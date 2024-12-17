import React from "react";
import { Container, Grid, Typography, Link, Box } from "@mui/material";
import samalogo from "../../assets/samalogo.png";

const Footer = () => {
  return (
    <footer>
      <Box maxWidth="false" bgcolor="primary.light" py={5}>
        <Container maxWidth="lg">
          <Grid container my={1}>
            <Grid item xs={4} sm={6} md={6}>
              <Link href="/">
                <img src={samalogo} alt="Logo" width={100} />
              </Link>
            </Grid>
            <Grid item xs={4} sm={6} md={6}></Grid>
          </Grid>
          <hr />
          <Grid container alignItems="center" mt={5}>
            <Grid 
              item 
              xs={12} 
              md={4}
              sx={{ 
                mb: { xs: -2, md: 0 } 
              }}
            >
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{
                  textAlign: { xs: 'center', md: 'left' }
                }}
              >
                <Link
                  href="/privacy-policy"
                  color="inherit"
                  underline="none"
                  sx={{ cursor: "pointer" }}
                >
                  Legal & Privacy Policy
                </Link>
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography 
                variant="body1" 
                color="text.secondary" 
                align="center"
                sx={{
                  mt: { xs: 4, md: 0 }  // Add top margin only on mobile
                }}
              >
                Copyright © 2024 reserved
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              {/* Empty grid item for balance */}
            </Grid>
          </Grid>
        </Container>
      </Box>
    </footer>
  );
};

export default Footer;
