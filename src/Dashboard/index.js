import React, { useState } from "react";
import { Grid, Tabs, Tab, Typography, Box } from "@mui/material";
import SocialImpactPage from "./SocialImpact";
import EnvironmentalImpact from "./EnvironmentalImpact";
import {
  DigitalHardwareText,
  StyledButton,
  TypographyButton,
  styles,
} from "./style";
import { Container } from "@mui/system";

function DashboardPage() {
  const [activeTab, setActiveTab] = useState(0);
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  return (
    <Box sx={{ background: "#FFFAF8", pb: 6, }}>
      <Container maxWidth="xxl">
        <Container maxWidth="xl">
          <Grid
            container
            spacing={2}
            sx={{ mt: 1 }}
            style={{ marginLeft: "1px" }}
          >
            <Grid item xs={12} md={6} sm={12}>
              <DigitalHardwareText mt={4}>
                Digital Hardware Tracker
              </DigitalHardwareText>
              <Typography
                variant="body1"
              // style={styles.body2}
              >
                Monitor your e-waste management efforts with ease
              </Typography>
            </Grid>
          </Grid>
          <Grid
            container
            spacing={2}
            sx={{ mt: 1 }}
            style={{ marginLeft: "1px" }}
          >
            <Grid item xs={12}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                indicatorColor="none"
              >
                <Tab
                  label={
                    activeTab === 0 ? (
                      <StyledButton>
                        <TypographyButton variant="contained">
                          Environmental Impact
                        </TypographyButton>
                      </StyledButton>
                    ) : (
                      <Typography className="body1">
                        Environmental Impact
                      </Typography>
                    )
                  }
                />
                <Tab
                  label={
                    activeTab === 1 ? (
                      <StyledButton>
                        <TypographyButton variant="contained">Social Impact</TypographyButton>
                      </StyledButton>
                    ) : (
                      <Typography className="body1">Social Impact</Typography>
                    )
                  }
                />
              </Tabs>
            </Grid>
          </Grid>

          <Grid
            container
            spacing={2}
            sx={{
              mt: 2,
              maxWidth: "xl",
              margin: "0 auto",
            }}
          >
            <Grid item xs={12}>
              {activeTab === 0 ? <EnvironmentalImpact /> : <SocialImpactPage />}
            </Grid>
          </Grid>
        </Container>
      </Container>
    </Box>
  );
}

export default DashboardPage;