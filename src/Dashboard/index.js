import React, { useState } from 'react';
import { Grid, Typography, Button ,Box} from '@mui/material';
import SocialImpactPage from "./SocialImpact";
import EnvironmentalImpact from './EnvironmentalImpact';
import { TypographyButton, styles } from './style';
import { Container } from '@mui/system';

function DashboardPage() {
  const [activeTab, setActiveTab] = useState(0);

  const handleButtonClick = (tabIndex) => {
    setActiveTab(tabIndex);
  };

  return (
    <Box sx={{ background: "#FFFAF8", pb: 6, }}>
      <Container maxWidth="xxl">
        <Container maxWidth="xl">
          <Grid container spacing={2} sx={{ mt: 1 }} style={{ marginLeft: "1px" }}>
            <Grid item xs={12} md={6} sm={12}>
              <Typography variant='h5' sx={{ width: { sm: "100%" } }}>Digital Hardware Tracker</Typography>
              <Typography  variant='body1' sx={{ mt: 1 }}>
                Monitor your e-waste management efforts with ease
              </Typography>
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mt: 1 }} style={{ marginLeft: "1px" }}>
            <Grid item xs={12} lg={6} md={7} >
              <Grid container>
                <Grid item xs={12} lg={6} md={6} sm={6}>
                  <Button
                    onClick={() => handleButtonClick(0)}
                    sx={{
                      width: { xs: '100%', sm: '100%', lg: '70%' },
                      padding: "8px, 24px, 8px, 24px",
                      marginRight: { xs: '8px', lg: '4px' },
                      backgroundColor: activeTab === 0 ? 'rgba(92, 120, 90, 1)' : 'transparent',
                      color: activeTab === 0 ? 'white' : 'rgba(74, 74, 74, 1)',
                      border: 'none',
                      borderRadius: '50px',
                      textTransform: 'none',
                      position: 'relative',
                      overflow: 'hidden',
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
                    <TypographyButton style={{ color: activeTab === 0 ? 'white' : 'rgba(74, 74, 74, 1)' }}>Environmental Impact</TypographyButton>
                  </Button>
                </Grid>
                <Grid item xs={12} lg={6} md={6} sm={6}>
                  <Button
                    onClick={() => handleButtonClick(1)}
                    sx={{
                      width: { xs: '100%', sm: '100%', lg: "60%" },
                      position: "relative",
                      right: { lg: "70px" },
                      padding: '8px, 24px, 8px, 24px',
                      backgroundColor: activeTab === 1 ? 'rgba(92, 120, 90, 1)' : 'transparent',
                      color: activeTab === 1 ? 'white' : 'black',
                      border: 'none',
                      borderRadius: '50px',
                      textTransform: 'none',
                      position: 'relative',
                      overflow: 'hidden',
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

          <Grid
            container
            spacing={2}
            sx={{
              mt: 2,
              maxWidth: 'xl',
              margin: '0 auto'
            }}
          >
            <Grid item xs={12} sm={12} md={12}>
              {activeTab === 0 && (
                <EnvironmentalImpact />
              )}
              {activeTab === 1 && (
                <SocialImpactPage />
              )}
            </Grid>
          </Grid>

        </Container>
      </Container>
    </Box>
  );
}

export default DashboardPage;
