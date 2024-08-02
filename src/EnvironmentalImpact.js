import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Box,
  Avatar,
  Tabs,
  Tab,
} from '@mui/material';
import { styled } from '@mui/system';

const data = {
  wasteReduction: 1956,
  wasteBreakup: {
    Plastic: 1222.5,
    Aluminium: 489,
    Copper: 244.5,
    Gold: 0.0203,
    Silver: 0.203,
  },
  toxicWasteReduction: 7009,
  toxicWasteBreakup: {
    Lead: 5705,
    Mercury: 407.5,
    Cadmium: 81.5,
    Chromium: 815,
  },
  carbonFootprintReduction: 326,
};

const StyledCard = styled(Card)({
  height: '100%',
});

const Dashboard = () => {
  return (
    <Container maxWidth="lg">
      <AppBar position="static" color="default">
        <Toolbar>
          <Box flexGrow={1}>
            <Typography variant="h6">Sama - Environmental Impact</Typography>
          </Box>
          <Avatar alt="User" src="/path-to-avatar.jpg" />
        </Toolbar>
      </AppBar>

      <Box mt={4}>
        <Tabs value={0} indicatorColor="primary" textColor="primary">
          <Tab label="Environmental Impact" />
          <Tab label="Social Impact" />
        </Tabs>
      </Box>

      <Grid container spacing={3} mt={3}>
        <Grid item xs={12} md={4}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6">Key Insights</Typography>
              <Typography variant="body2">
                <strong>Highest Impact Area:</strong> Plastic with {data.wasteReduction} kg of waste reduced and lead with {data.toxicWasteReduction} grams of seepage reduced have the highest impact in their respective categories. It indicates a significant opportunity for cost savings and enhanced brand reputation.
              </Typography>
              <Typography variant="body2">
                <strong>Resource Optimization:</strong> Plastic waste reduction of {data.wasteBreakup.Plastic} kg (62.5%) and lead seepage reduction of {data.toxicWasteBreakup.Lead} grams (81.2%) have the highest percentage in their respective categories, suggesting a high impact on future environmental sustainability and optimization.
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6">Impact Generated</Typography>
              <Typography variant="body2">
                <strong>Cost Savings:</strong> Estimated cost savings of ₹23 lakhs to ₹32 lakhs from resource waste, toxic waste seepage, and carbon footprint reduction.
              </Typography>
              <Typography variant="body2">
                <strong>Enhanced Brand Reputation:</strong> These actions generate influence in the public and can lead to 5% to 10% increase in brand value (approximate) and 3% to 5% increase in customer retention (approximate).
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6">Resource Waste Reduction</Typography>
              <Typography variant="h4" color="primary">
                {data.wasteReduction} Kg
              </Typography>
              <Typography variant="body2">
                <strong>Material wise breakup:</strong>
              </Typography>
              {Object.entries(data.wasteBreakup).map(([material, amount]) => (
                <Typography key={material} variant="body2">
                  {material}: {amount} kg
                </Typography>
              ))}
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6">Toxic Waste Seepage Reduction</Typography>
              <Typography variant="h4" color="secondary">
                {data.toxicWasteReduction} g
              </Typography>
              <Typography variant="body2">
                <strong>Waste wise breakup (grams):</strong>
              </Typography>
              {Object.entries(data.toxicWasteBreakup).map(([material, amount]) => (
                <Typography key={material} variant="body2">
                  {material}: {amount} g
                </Typography>
              ))}
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6">Carbon Footprint Reduction</Typography>
              <Typography variant="h4" color="success">
                {data.carbonFootprintReduction} Tons
              </Typography>
              <Typography variant="body2">
                Approximate CO2 amount prevented from entering into the atmosphere.
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6">Did you know?</Typography>
              <Typography variant="body2">
                5 to 6 Years - Average lifecycle extension of your donated hardware with Sama.
              </Typography>
              <Typography variant="body2">
                Up to 200,000 litres of water contamination prevented by diverting waste from landfills.
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
