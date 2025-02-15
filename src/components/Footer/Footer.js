import React from "react";
import { Container, Grid, Typography, Link, Box } from "@mui/material";
import samalogo from "../../assets/samalogo.png";
import Email from "./email.png";
import TwitterIcon from "./twitter.png";
import LinkedInIcon from "./linkdin.png";
import { matchPath, useLocation } from "react-router-dom";

const routePatterns = [
  "/user-details",
  "/userdetails/:id",
  "ngo/:id",
  "edit-yearly-form/:id",
  "yearly-reporting/:id",
  "/monthly-reporting/:id",
  "/edit-form/:id",
  "monthly-reporting",
  "yearly-reporting",
  "monthly-report",
  "yearly-report",
  "ngo",
  "beneficiarydata",
  "preliminary"
];

const isRouteMatch = (pathname, patterns) => {
  return patterns.some((pattern) =>
    matchPath({ path: pattern, exact: true, strict: false }, pathname)
  );
};

const Footer = () => {
  const location = useLocation();
  
  // If current route matches any pattern in routePatterns, don't show footer
  if (isRouteMatch(location.pathname, routePatterns)) {
    return null;
  }
 
  return (
    <footer>
      <Box maxWidth="false" bgcolor="primary.light" py={5}>
        <Container maxWidth="lg">
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={2} textAlign={{ xs: "center", md: "left" }} mb={{ xs: 2, md: 12 }}>
              <Link href="/">
                <img src={samalogo} alt="Logo" width={170} />
              </Link>
            </Grid>

            <Grid item xs={12} md={10} >
              <Grid container spacing={6} gap={{ xs: 2, md: 16 }} justifyContent="center" >
                <Grid item xs={12} sm={2} textAlign={{ xs: "center", md: "left" }}>
                  <Typography variant="subtitle2" fontWeight="bold" color="#4A4A4A">
                    About Sama
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2} mt={2}>
                    <Typography variant="body2" >
                      <Link href="/about" underline="none" color="#4A4A4A">
                        About Us
                      </Link>
                    </Typography>
                    <Typography variant="body2" >
                      <Link href="/our-approach" underline="none" color="#4A4A4A">
                        Our Approach
                      </Link>
                    </Typography>
                    <Typography variant="body2" >
                      <Link href="/ourteam" underline="none" color="#4A4A4A">
                        Our Team
                      </Link>
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={3} textAlign={{ xs: "center", md: "left" }} >
                  <Typography variant="subtitle2" fontWeight="bold" color="#4A4A4A">
                    Get Involved
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2} mt={2}>
                    <Typography variant="body2"  >
                      <Link href="/corporatepartner" underline="none" color="#4A4A4A">
                        Corporate Partners
                      </Link>
                    </Typography>
                    <Typography variant="body2" >
                      <Link href="/ourgoverment" underline="none" color="#4A4A4A">
                        Government Partners
                      </Link>
                    </Typography>
                    <Typography variant="body2" >
                      <Link href="/communitypartners" underline="none" color="#4A4A4A">
                        Community Partners
                      </Link>
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={2} justifyItems={{ xs: "center", md: "left" }} sx={{ marginRight:{ xs: "10px", md: "30px" }}}>
                  <Typography variant="subtitle2" fontWeight="bold" color="#4A4A4A">
                    Support
                  </Typography>
                  <Box display="flex" justifyContent="center" alignItems="center" mt={1} gap={1}>
                    <img src={Email} fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2" >support@example.com</Typography>
                  </Box>
                  <Box display="flex" justifyContent="center" mt={2} gap={1}>
                    <img src={LinkedInIcon}  />
                    <img src={TwitterIcon}  />
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <hr />

          <Grid container alignItems="center" mt={5}>
            <Grid item xs={12} md={8} textAlign={{ xs: "center", md: "left" }}>
              <Typography variant="body1" color="text.secondary">
                <Link href="/privacy-policy" color="inherit" underline="none">
                  Legal & Privacy Policy
                </Link>
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} textAlign="center">
              <Typography variant="body1" color="text.secondary">
                Copyright © 2024 reserved
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}></Grid>
          </Grid>
        </Container>
      </Box>
    </footer>
  );
};

export default Footer;