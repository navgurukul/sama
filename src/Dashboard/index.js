import React, { useState,useEffect } from "react";
import { Grid, Typography } from "@mui/material";
import SocialImpactPage from "./SocialImpact";
import {
  DigitalHardwareText,
} from "./style";
import { Container } from "@mui/system";

function DashboardPage() {
  const [data, setData] = useState();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Use local backend if no valid backend URL is explicitly provided
                let baseUrl = 'http://localhost:8000';
                if (process.env.REACT_APP_NgoInformationApi && !process.env.REACT_APP_NgoInformationApi.includes('script.google.com')) {
                    baseUrl = process.env.REACT_APP_NgoInformationApi.replace('/ngo-exec', '');
                }
                const response = await fetch(`${baseUrl}/api/public/social-impact-stats`);
                const result = await response.json();
                setData(result);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

  return (
    <Container maxWidth="xl" sx={{mb:"20px"}}>
      <Grid
        container
        spacing={2}
        sx={{ mt: 0 }}
      >
        <Grid item xs={12} md={6} sm={12} sx={{ml:{lg:3,sm:0,md:3}}}>
          <DigitalHardwareText mt={2}>
            Digital Hardware Tracker
          </DigitalHardwareText>
          <Typography
            variant="body1"
          >
            Monitor your e-waste management efforts with ease
          </Typography>
        </Grid>
      </Grid>

      <SocialImpactPage data={data} />
    </Container>
  );
}

export default DashboardPage;