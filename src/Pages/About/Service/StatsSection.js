import { Container, Box, Grid, Typography } from "@mui/material";
import ourteam from "../OurTeam/style";

const StatsGrid = () => {
  return (
    <>
      <Container maxWidth="xl" sx={{backgroundColor: " #F0F4EF", marginTop:"80px"}}  >
        <Box sx={ourteam.FullBox} >
        <Grid container spacing={2} justifyContent="center" >
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h5" textAlign="center">1 Lakh +</Typography>
              <Typography mt={1} variant="body1" textAlign="center">Students Impacted</Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h5" textAlign="center">25107</Typography>
              <Typography mt={1} variant="body1" textAlign="center">Women Reached</Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h5" textAlign="center">371</Typography>
              <Typography mt={1} variant="body1" textAlign="center">Schols Reached</Typography>
            </Grid>
          </Grid>
          <Grid container spacing={2} justifyContent="center" sx={{ mt: { xs: 2, md: "63px" } }}>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h5" textAlign="center">1,665</Typography>
              <Typography mt={1} variant="body1" textAlign="center">Laptops Distributed</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h5" textAlign="center">PAN India</Typography>
              <Typography mt={1} variant="body1" textAlign="center">Presence</Typography>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  )
}
export default StatsGrid;
