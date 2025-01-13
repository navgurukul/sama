import React from "react";
import {
  Container,
  Box,
  Typography,
  Grid,
  Button,
  Paper,
  Divider,
} from "@mui/material";

const BeneficiaryProfile = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb:3 }}>
      <Typography variant="h6" align="center" gutterBottom>
        Beneficiary Profile
      </Typography>

      <Paper elevation={3} sx={{ p: 4, mb: 4, backgroundColor: '#f5f7f4', borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#4a6543',mb:3 }}>Rahul Prakash</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#4a6543'  }}>Beneficiary ID</Typography>
            <Typography variant="body1" sx={{ mb: 2 }} gutterBottom>BP12345</Typography>

            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#4a6543'  }}>Email</Typography>
            <Typography variant="body1" sx={{ mb: 2 }} gutterBottom>rahulp@gmail.com</Typography>

            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#4a6543'  }}>Contact Number</Typography>
            <Typography variant="body1" sx={{ mb: 2 }} gutterBottom>+91 9810 222 333</Typography>

            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#4a6543'  }}>Date of Birth</Typography>
            <Typography variant="body1" sx={{ mb: 2 }} gutterBottom>01 Oct 2007</Typography>

            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#4a6543'  }}>ID Proof and ID Number</Typography>
            <Typography variant="body1" sx={{ mb: 2 }} gutterBottom>Aadhaar Card - 942890829382</Typography>

            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#4a6543'  }}>Qualification</Typography>
            <Typography variant="body1" sx={{ mb: 2 }} gutterBottom>Bachelors of Arts</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#4a6543'  }}>Occupation</Typography>
            <Typography variant="body1" sx={{ mb: 2 }} gutterBottom>Employed - Teacher</Typography>

            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#4a6543'  }}>Use Case</Typography>
            <Typography variant="body1" sx={{ mb: 2 }} gutterBottom>Internships</Typography>

            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#4a6543'  }}>Number of Family Members</Typography>
            <Typography variant="body1" sx={{ mb: 2 }} gutterBottom>5</Typography>

            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#4a6543'  }}>Father/Mother/Guardian's Occupation</Typography>
            <Typography variant="body1" sx={{ mb: 2 }} gutterBottom>Family Business</Typography>

            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#4a6543'  }}>Family Annual Income</Typography>
            <Typography variant="body1" sx={{ mb: 2 }} gutterBottom>Less than 3 LPA</Typography>
          </Grid>
          <Grid item xs={12} sx={{ textAlign: 'center', mt: 2 }}>
            <Button variant="outlined" sx={{ color: '#4a6543', borderColor: '#4a6543' }}>
              Edit Beneficiary Profile
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
        <Paper
          elevation={3}
          sx={{
            flex: 1,
            p: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="body1">ID Proof</Typography>
        </Paper>
        <Paper
          elevation={3}
          sx={{
            flex: 1,
            p: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="body1">Income Certificate</Typography>
        </Paper>
      </Box>

      <Typography variant="h6" gutterBottom>
        Status History
      </Typography>
      {/* <Divider sx={{ mb: 2 }} /> */}

      <Grid container spacing={2}>
        {Array.from({ length: 12 }, (_, index) => (
          <Grid item xs={3} key={index}>
            <Paper elevation={3} sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="body1" gutterBottom>
                {new Date(2024, index).toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </Typography>
              <Typography variant="body1">Status {index + 1}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default BeneficiaryProfile;
