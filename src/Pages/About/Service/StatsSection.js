import { Container, Box, Grid, Typography } from "@mui/material";
import ourteam from "../OurTeam/style";

const StatsGrid = () => {
  return (
    <>
      <Box sx={{backgroundColor: " #F0F4EF", marginTop:"80px"}} >
        <Container maxWidth="lg" sx={ourteam.FullBox} >
          <Grid container spacing={2} justifyContent="center" >
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h5" textAlign="center">1,59,810</Typography>
              <Typography mt={1} variant="body1" textAlign="center">Number of beneficiaries</Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h5" textAlign="center">81,548</Typography>
              <Typography mt={1} variant="body1" textAlign="center">Number of females reached</Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h5" textAlign="center">1,200</Typography>
              <Typography mt={1} variant="body1" textAlign="center">Number of schools reached</Typography>
            </Grid>
          </Grid>
          <Grid container spacing={2} justifyContent="center" sx={{ mt: { xs: 2, md: "63px" } }}>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h5" textAlign="center">4,131</Typography>
              <Typography mt={1} variant="body1" textAlign="center">Number of laptops distributed</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h5" textAlign="center">PAN India</Typography>
              <Typography mt={1} variant="body1" textAlign="center">Regions Covered</Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  )
}
export default StatsGrid;
