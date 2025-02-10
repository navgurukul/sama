
// import React from 'react';
// import { Grid, Box, Typography, Container, styled } from '@mui/material';

// const StatContainer = styled(Box)(({ theme }) => ({
//   backgroundColor: '#f8f9fa',
//   padding: theme.spacing(4),
//   borderRadius: theme.spacing(1),
// }));

// const StatItem = styled(Box)(({ theme }) => ({
//   textAlign: 'center',
// }));

// const StatValue = styled(Typography)(({ theme }) => ({
//   fontSize: '1.5rem',
//   fontWeight: 600,
//   color: '#1976d2',
//   marginBottom: theme.spacing(1),
// }));

// const StatLabel = styled(Typography)(({ theme }) => ({
//   fontSize: '0.875rem',
//   color: '#666',
// }));

// const StatsGrid = () => {
//   const stats = [
//     { value: "1 Lakh +", label: "Revenue Generated" },
//     { value: "25107", label: "Service Engaged" },
//     { value: "371", label: "Business Network" },
//     { value: "1,665", label: "Latest Download" },
//     { value: "PAN India", label: "Presence" }
//   ];

//   return (
//       <StatContainer sx={{ p: "5rem" }}>
//         <Grid container spacing={2}>
//           {stats.map((stat, index) => (
//             <Grid item xs={6} md={2.4} key={index}>
//               <StatItem>
//                 <StatValue>{stat.value}</StatValue>
//                 <StatLabel>{stat.label}</StatLabel>
//               </StatItem>
//             </Grid>
//           ))}
//         </Grid>
//       </StatContainer>
//   );
// };

// export default StatsGrid;









import { Box, Grid, Typography } from "@mui/material";
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
                  <Typography variant="h5">1,661</Typography>
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
