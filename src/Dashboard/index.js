import React, { useState } from 'react';
import { Grid, Typography, Button, Container } from '@mui/material';
import SocialImpactPage from "./SocialImpact";
import EnvironmentalImpact from './EnvironmentalImpact';
import { clases } from './style';
function DashboardPage() {
  const [activeTab, setActiveTab] = useState(0);
  const handleButtonClick = (tabIndex) => {
    setActiveTab(tabIndex);
  };
  return (
    <Container maxWidth="xxl">
      <Grid container spacing={2}>
        <Grid item xs={12} md={6} sx={{ ml: 3 }}>
          <Typography variant='h5'>Digital Hardware Tracker</Typography>
          <Typography className="body1" sx={{ mt: 2 }}>
            Monitor your e-waste management efforts with ease
          </Typography>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={7} md={7} sx={{ ml: 2, mt: 3 }}>
          <Grid container sx={clases.GridStyle}
          >
            <Grid item xs={12} lg={6} md={6} sm={12}

            >
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleButtonClick(0)}
                sx={{
                  ...clases.container,
                  ...(activeTab === 0 ? clases.active : clases.inactive),
                }}
              >
                <Typography variant='subtitle1' style={activeTab === 0 ? clases.activeTabText : clases.inactiveTabText}
                >
                  Environmental Impact
                </Typography>
              </Button>
            </Grid>
            <Grid item xs={12} lg={6} md={6} sm={12}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleButtonClick(1)}
                sx={{
                  marginLeft: { md: 10 },
                  ...clases.container,
                  ...(activeTab === 1 ? clases.active : clases.inactive)
                }}

              >
                <Typography variant='subtitle1' style={activeTab === 1 ? clases.activeText : clases.inactiveText}
                >
                  Social Impact
                </Typography>
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {activeTab === 0 && <EnvironmentalImpact />}
      {activeTab === 1 && <SocialImpactPage />}
    </Container >
  );
}

export default DashboardPage;
