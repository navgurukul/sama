import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Button, Paper, CircularProgress,Divider } from '@mui/material';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Container } from '@mui/system';
import { classes } from './style';

const BeneficiaryProfile = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  const API_URL = `https://script.google.com/macros/s/AKfycbxDcI2092h6NLFcV2yvJN-2NaHVp1jc9_T5qs0ntLDcltIdRRZw5nfHiZTT9prPLQsf2g/exec?type=getUserData&userIdQuery=${id}`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(API_URL);
        setData(response.data[0]);
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container maxWidth="lg" sx={{ padding: '24px' }}>
      {/* Header */}
      <Typography variant="h4" align="center" sx={{ marginBottom: 4 }}>
        Beneficiary Profile
      </Typography>

      {/* Beneficiary Profile Data */}
      <Paper elevation={1} sx={{ padding: '32px', backgroundColor: "primary.light" }}>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>{data.name}</Typography>

            {/* Beneficiary ID */}
            <Typography variant="subtitle1" sx={classes.BeneficiaryData} >Beneficiary ID</Typography>
            <Typography variant="body1" marginBottom="16px">{data.ID}</Typography>
            
            {/* Additional Fields */}
            <Typography variant="subtitle1" sx={classes.BeneficiaryData}>Email</Typography>
            <Typography variant="body1" marginBottom="16px">{data.email}</Typography>

            <Typography variant="subtitle1" sx={classes.BeneficiaryData}>Contact Number</Typography>
            <Typography variant="body1" marginBottom="16px">{data["contact number"]}</Typography>

            <Typography variant="subtitle1" sx={classes.BeneficiaryData}>Date of Birth</Typography>
            <Typography variant="body1" marginBottom="16px">{new Date(data["Date Of Birth"]).toLocaleDateString()}</Typography>

            <Typography variant="subtitle1" sx={classes.BeneficiaryData}>ID Proof Type</Typography>
            <Typography variant="body1" marginBottom="16px">{data["ID Proof type"]}</Typography>

            <Typography variant="subtitle1" sx={classes.BeneficiaryData}>ID Proof Number</Typography>
            <Typography variant="body1" marginBottom="16px">{data["ID Proof number"]}</Typography>

            <Typography variant="subtitle1" sx={classes.BeneficiaryData}>Qualification</Typography>
            <Typography variant="body1" marginBottom="16px">{data.Qualification}</Typography>

            <Typography variant="subtitle1" sx={classes.BeneficiaryData}>Occupation</Typography>
            <Typography variant="body1" marginBottom="16px">{data.Occupation}</Typography>

            <Button variant="outlined" color="primary" sx={{ marginTop: 2 }} >
              Edit Beneficiary Profile
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" sx={classes.BeneficiaryData}>Use Case</Typography>
            <Typography variant="body1" marginBottom="16px">{data["Use case"]}</Typography>

            <Typography variant="subtitle1" sx={classes.BeneficiaryData}>Number of Family Members</Typography>
            <Typography variant="body1" marginBottom="16px">{data["Number of Family members(who might use the laptop)"]}</Typography>

            <Typography variant="subtitle1" sx={classes.BeneficiaryData}>Status</Typography>
            <Typography variant="body1" marginBottom="16px">{data.status}</Typography>

            <Typography variant="subtitle1" sx={classes.BeneficiaryData}>Laptop Assigned</Typography>
            <Typography variant="body1" marginBottom="16px">{data["Laptop Assigned"] ? 'Yes' : 'No'}</Typography>

            <Typography variant="subtitle1" sx={classes.BeneficiaryData}>Family Address</Typography>
            <Typography variant="body1" marginBottom="16px">{data.Address}</Typography>

            <Typography variant="subtitle1" sx={classes.BeneficiaryData}>Address State</Typography>
            <Typography variant="body1" marginBottom="16px">{data["Address State"]}</Typography>

            <Typography variant="subtitle1" sx={classes.BeneficiaryData}>Family Annual Income</Typography>
            <Typography variant="body1" marginBottom="16px">{data["Family Annual Income"]}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Additional Sections */}
      <Grid container spacing={4} sx={{ marginTop: 4 }}>
        <Grid item xs={12} sm={6}>
          <Paper elevation={1} sx={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2 }}>
            {data["ID Link"] ? (
              <img 
                src={data["ID Link"]} 
                alt="ID Proof" 
                style={{ maxHeight: '100%', maxWidth: '100%', borderRadius: '4px' }} 
              />
            ) : (
              <Typography variant="subtitle1" color="textSecondary">
                ID Proof not available
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Paper elevation={1} sx={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2 }}>
            <Typography variant="subtitle1" color="textSecondary">Income Certificate</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Status History
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={2} sx={{ mb: 2 }}>
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
