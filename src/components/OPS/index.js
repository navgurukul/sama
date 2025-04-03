import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
} from "@mui/material";


function Ops() {  
  return (
    <Container>
      {/* Centered OPS Management heading */}
      <Box display="flex" justifyContent="center" mt={5}>
        <Typography variant="h5" component="h1" gutterBottom>
          OPS Management
        </Typography>
      </Box>

      {/* Laptop Detail Form Description and Button */}
      <Box my={4}>
        <Grid container spacing={4} >
          <Grid item xs={12} sm={6}>
            <Card variant="outlined" style={{ height: '100%' }}> 
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                Laptop Detail Form
                </Typography>
                <Typography variant="body1" color="textSecondary" gutterBottom>
                  Use this form to submit details about the laptops for single
                  or bulk upload
                </Typography>
                <Box mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    href="/laptopinventory"
                  >
                    Laptop Detail Form
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* User Detail Form Description and Button */}
          {/* <Grid item xs={12} sm={6} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  User Information
                </Typography>
                <Typography variant="body1" color="textSecondary" gutterBottom>
                  Use this form to submit details about the Users for single or
                  bulk upload
                </Typography>
                <Box mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    href="/user-details"
                  >
                    User Detail Form
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid> */}

          <Grid item xs={12} sm={6} md={6}>
            <Card variant="outlined"
             style={{ height: '100%' }}
            >
              <CardContent style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Typography variant="h6" component="h2" gutterBottom>
                Warehouse Operations
                </Typography>
                {/* <Typography variant="body1" color="textSecondary" gutterBottom>
                  Use this for tagging laptops.
                </Typography> */}
                <Box mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    href="/laptop-tagging"
                  >
                    Warehouse Operations
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  NGO Form 
                </Typography>
                <Typography variant="body1" color="textSecondary" gutterBottom>
                  Use this form for Registration for Specific NGO.
                </Typography>
                <Box mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    href="/ngoregistration"
                  >
                    NGO Forms
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  Edit Questions for NGO Registration
                </Typography>
                <Typography variant="body1" color="textSecondary" gutterBottom>
                  use this button to edit the questions for NGO Registration and add new NGO for Registration Form.
                </Typography>
                <Box mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    href="/donormanager"
                  >
                    Edit Button
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  Laptop with Issues
                </Typography>
                <Typography variant="body1" color="textSecondary" gutterBottom>
                  Check the laptops with issues and their status.
                </Typography>
                <Box mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    href="/laptop-with-issues"
                  >
                    Laptop with Issues
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>       
      </Box>
    </Container>
  );
}

export default Ops;
