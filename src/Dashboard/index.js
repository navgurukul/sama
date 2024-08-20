import React, { useState } from 'react';
import { Grid, Typography, Button, Container } from '@mui/material';
import SocialImpactPage from "./SocialImpact";
import EnvironmentalImpact from './EnvironmentalImpact';
import { TypographyButton, styles } from './style';

function DashboardPage() {
  const [activeTab, setActiveTab] = useState(0);
  const handleButtonClick = (tabIndex) => {
    setActiveTab(tabIndex);
  };

  return (
    <>

      <Container maxWidth="xxl">
        <Grid container spacing={2} sx={{ mt: 1 }} style={{ marginLeft: "1px" }}>
          <Grid item xs={12} md={6} sm={12}>
            <Typography variant='h5' sx={{ width: { sm: "100%" } }}>Digital Hardware Tracker</Typography>
            <Typography className="body1" sx={{ mt: 2 }}>
              Monitor your e-waste management efforts with ease
            </Typography>
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ ml: 1, mt: 2 }} >
          <Grid item xs={12} lg={7} md={7} >
            <Grid container sx={{ mt: 1, width: { lg: "524px" } }} >
              <Grid item xs={12} lg={6} md={6} sm={12} >
                <Button
                  variant="contained" color="primary"
                  onClick={() => handleButtonClick(0)}
                  sx={{
                    width: { xs: '90%', sm: '50%', lg: '100%', md: "100%" },
                    padding: "8px, 24px, 8px, 24px",
                    marginRight: { xs: '8px', lg: '4px' },
                    backgroundColor: activeTab === 0 ? 'rgba(92, 120, 90, 1)' : 'transparent',
                    color: activeTab === 0 ? 'white' : 'rgba(74, 74, 74, 1)',
                    border: 'none',
                    borderRadius: '50px',
                    textTransform: 'none',
                    position: 'relative',
                    overflow: 'hidden',
                    border: "1px solid rgba(92, 120, 90, 0.8)",
                    '&:hover': {
                      backgroundColor: 'rgba(92, 120, 90, 0.8)',
                      color: 'white',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: '100%',
                        background: 'linear-gradient(45deg, rgba(92, 120, 90, 0.4), rgba(92, 120, 90, 0.8))',
                        opacity: 0.4,
                        transition: 'opacity 0.3s ease-in-out',
                      },
                    },
                  }}
                >
                  <TypographyButton style={{ color: activeTab === 0 ? 'white' : 'rgba(74, 74, 74, 1)' }}>Environmental Impact</TypographyButton>
                </Button>
              </Grid>
              <Grid item xs={12} lg={6} md={6} sm={12}>
                <Button
                  variant="contained" color="primary"
                  onClick={() => handleButtonClick(1)}
                  sx={{
                    marginTop: { sm: "30px", xs: "10px", lg: "0", md: "0" },
                    width: { xs: '90%', sm: '50%', lg: "80%", md: "100%" },
                    ml: { lg: 5 },
                    position: "relative",
                    backgroundColor: activeTab === 1 ? 'rgba(92, 120, 90, 1)' : 'transparent',
                    color: activeTab === 1 ? 'white' : 'black',
                    border: 'none',
                    borderRadius: '50px',
                    textTransform: 'none',
                    position: 'relative',
                    overflow: 'hidden',
                    border: "1px solid rgba(92, 120, 90, 0.8)",
                    '&:hover': {
                      backgroundColor: 'rgba(92, 120, 90, 0.8)',
                      color: 'white',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(45deg, rgba(92, 120, 90, 0.4), rgba(92, 120, 90, 0.8))',
                        opacity: 0.4,
                        transition: 'opacity 0.3s ease-in-out',
                      },
                    },
                  }}
                >
                  <TypographyButton style={{ color: activeTab === 1 ? 'white' : 'rgba(74, 74, 74, 1)' }}>Social Impact</TypographyButton>
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>


        {activeTab === 0 && (
          <EnvironmentalImpact />
        )}
        {activeTab === 1 && (
          <SocialImpactPage />
        )}
      </Container >

    </>

  );
}

export default DashboardPage;