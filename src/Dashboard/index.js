import React, { useState } from 'react';
import { Grid, Typography, Button, Container,Box } from '@mui/material';
import SocialImpactPage from "./SocialImpact";
import EnvironmentalImpact from './EnvironmentalImpact';
import { clases } from './style';
function DashboardPage() {

  const [activeTab, setActiveTab] = useState(0);
  const handleButtonClick = (tabIndex) => {
    setActiveTab(tabIndex);
  };

  return (
    <Box sx={{ background: "#FFFAF8" }}>
      <Container maxWidth="xl">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6} >
            <Typography variant='h5'>Digital Hardware Tracker</Typography>
            <Typography className="body1" sx={{ mt: 2 }}>
              Monitor your e-waste management efforts with ease
            </Typography>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} lg={7} md={7} sx={{ mt: 3 }}>
            <Grid container sx={clases.GridStyle}
            >
              <Grid item xs={12} lg={6} md={6} sm={6}

              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleButtonClick(0)}

                  sx={{
                    ...clases.ontainer,
                    ...(activeTab === 0 ? clases.active : clases.inactive),
                    width: "260px"

                  }}
                >
                  <Typography variant='subtitle1' style={activeTab === 0 ? clases.activeTabText : clases.inactiveTabText}
                  >
                    Environmental Impact
                  </Typography>
                </Button>
              </Grid>
              <Grid item xs={6} lg={6} md={6} sm={6}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleButtonClick(1)}
                  sx={{
                    ...clases.container,
                    ...(activeTab === 1 ? clases.active : clases.inactive),
                    width: "230px"
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
    </Box>
  );
}

export default DashboardPage;