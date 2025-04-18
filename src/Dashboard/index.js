import React, { useState,useEffect } from "react";
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

  const [data, setData] = useState();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await 
                fetch(
                  `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}`);
                  // 'https://script.google.com/macros/s/AKfycbzWkc8lDkTquwsjj_--B4Qj2GHA_gc_L4ev8uxBsmlWha2vE62hTLNMRaHFbsw7bKzYlg/exec');
                const result = await response.json();
                setData(result);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);
  return (

    <Container maxWidth="xl" sx={{mb:"40px"}}>
      <Grid
        container
        spacing={2}
        sx={{ mt: 1 }}
      >
        <Grid item xs={12} md={6} sm={12} sx={{ml:{lg:3,sm:0,md:3,sm:0}}}>
          <DigitalHardwareText mt={4}>
            Digital Hardware Tracker
          </DigitalHardwareText>
          <Typography
            variant="body1"
          >
            Monitor your e-waste management efforts with ease
          </Typography>
        </Grid>
      </Grid>
      <Grid
        container
        spacing={2}
        sx={{ mt: 1 ,ml:{lg:1,sm:0,md:1,sm:0}}}
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


      {activeTab === 0 ? <EnvironmentalImpact data={data} /> : <SocialImpactPage data={data} />}

    </Container>
  );
}

export default DashboardPage;