import { Container, Box, Grid, Typography } from "@mui/material";
import ourteam from "../OurTeam/style";

const StatsGrid = () => {
  return (
    <>
        <Box sx={ourteam.FullBox}>
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h5">1 Lakh +</Typography>
              <Typography mt={1} variant="body1">Students Impacted</Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h5">25107</Typography>
              <Typography mt={1} variant="body1">Women Reached</Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h5">371</Typography>
              <Typography mt={1} variant="body1">Schols Reached</Typography>
            </Grid>
          </Grid>
          <Grid container spacing={2} justifyContent="center" sx={{ mt: { xs: 2, md: 8 } }}>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h5">1,665</Typography>
              <Typography mt={1} variant="body1">Laptops Distributed</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h5">PAN India</Typography>
              <Typography mt={1} variant="body1">Presence</Typography>
            </Grid>
          </Grid>
        </Box>
    </>
  )
}
export default StatsGrid;
