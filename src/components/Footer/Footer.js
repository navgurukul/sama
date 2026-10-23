import React from "react";
import { Container, Grid, Typography, Link, Box } from "@mui/material";
import samalogo from "../../assets/samalogo.png";
import Email from "./email.png";
import LinkedInIcon from "./linkdin.png";
import { matchPath, useLocation } from "react-router-dom";

const isRouteMatch = (pathname, patterns) => {
  return patterns.some((pattern) =>
    matchPath({ path: pattern, exact: true, strict: false }, pathname)
  );
};

const Footer = () => {
  const location = useLocation(); // Get the current location
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
    "/corporate",
    "/corpretedb/DataViewDetail",
    "/corpretedb/NGOTrainedTable",

  ];

  const isMatch = isRouteMatch(location.pathname, routePatterns);
  if (isMatch) {
    return null;
  }

  return (
    <footer>
      <Box maxWidth="false" bgcolor="primary.light" py={5}>
        <Container maxWidth="lg">
          <Grid container spacing={3} alignItems="center" marginBottom={"32px"}>
            <Grid item xs={12} md={2} textAlign={{ xs: "center", md: "left" }} mb={{ xs: 2, md: 12 }}>
              <Link href="/">
                <img src={samalogo} alt="Sama Digital Foundation Logo" width={170} /> {/* Increased Size */}
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
                        Discover Us
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
                      <Link href="/our-government" underline="none" color="#4A4A4A">
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

                <Grid item xs={12} sm={2} justifyItems={{ xs: "center", md: "left" }} sx={{ marginRight: { xs: "10px", md: "30px" } }}>
                  <Typography variant="subtitle2" fontWeight="bold" color="#4A4A4A">
                    Support
                  </Typography>
                  <Box display="flex" justifyContent="center" alignItems="center" mt={1} gap={1}>
                    <img src={Email} alt="Email" fontSize="small" sx={{ mr: 1 }} />
                    <Link href="mailto:operations@thesama.in" underline="none" target="_blank" rel="noopener noreferrer">
                      <Typography variant="body2" >operations@thesama.in</Typography>
                    </Link>
                  </Box>
                  <Box display="flex" justifyContent={{ xs: "center", md: "flex-start" }} mt={2} gap={1.5}>
                    <Link href="https://www.linkedin.com/company/thesama/posts/" underline="none" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                      <img src={LinkedInIcon} alt="LinkedIn" width="24" height="24" />
                    </Link>
                    <Link href="https://www.instagram.com/samadigitalfoundation/" underline="none" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4A4A4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                    </Link>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <hr />

          <Grid container alignItems="center" mt={4}>
            <Grid item xs={12} md={8} textAlign={{ xs: "center", md: "left" }}>
              <Typography variant="body1" color="text.secondary">
                <Link href="/privacy-policy" color="inherit" underline="none">
                  Legal & Privacy Policy
                </Link>
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} textAlign="center">
              <Typography variant="body1" color="text.secondary">
                Copyright © 2025 reserved
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