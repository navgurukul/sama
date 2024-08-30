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
          <Grid container my={1}>
            <Grid item xs={4} sm={6} md={6}>
              <Link href="/">
                <img src={samalogo} alt="Logo" width={100} />
              </Link>
            </Grid>
            <Grid item xs={4} sm={6} md={6}>
            </Grid>
          </Grid>
          <hr />
          <Box textAlign="center" mt={5}>
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
