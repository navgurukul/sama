import React from "react";
import { Container, Grid, Typography, Link, Box } from "@mui/material";
import samalogo from "../../assets/samalogo.png";
import { matchPath, useLocation } from "react-router-dom";

const isRouteMatch = (pathname, patterns) => {
  return patterns.some((pattern) =>
    matchPath(
      {
        path: pattern,
        exact: true,
        strict: false,
      },
      pathname
    )
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
    "corpretedb",
    "/corpretedb/DataViewDetail",
    "/corpretedb/NGOTrainedTable",
  ];

  // Check if the current route matches any pattern
  if (isRouteMatch(location.pathname, routePatterns)) {
    return null; // Don't render the footer if the route matches
  }
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
                mb: { xs: -2, md: 0 },
              }}
            >
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  textAlign: { xs: "center", md: "left" },
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
                  mt: { xs: 4, md: 0 }, // Add top margin only on mobile
                }}
              >
                Copyright © 2024 reserved
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </footer>
  );
};

export default Footer;
