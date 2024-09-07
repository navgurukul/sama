// import React from 'react';
// import "./style.css";
// import { Box } from '@mui/material';
// import MobailVeiwTimeLine from "./MobailVeiw/index";
// import TimelineDesktop from "./Desktop/index";
// import { Typography, Grid } from '@mui/material';
// import { Container } from '@mui/system';

// function Index() {

//   return (
//     <>
//       <Container maxWidth="lg" sx={{ py: "80px" }}>
//         <Grid container spacing={2}>
//           <Grid item xs={12} sx={12} lg={6} md={6} >
//             <Typography variant='h5' sx={{ color: "#5C785A" }}>Our 3D model:</Typography>
//             <Typography variant='body1' sx={{ mt: 2,color:"#4A4A4A" }}>Our 3D Model forms the backbone of our approach.
//               Through this comprehensive approach, we transform e-waste
//               into educational tools , thereby providing impact reports
//               to our donors.</Typography>
//           </Grid>
//         </Grid>
//         <Box>
//           <Box sx={{ display: { lg: 'none', md: 'none', sm: 'block', xs: 'block' } }}>
//             <MobailVeiwTimeLine />
//           </Box>

//           <Box sx={{ display: { lg: 'flex', md: 'flex', sm: 'none', xs: 'none' } }}>
//             <TimelineDesktop />
//           </Box>
//         </Box>
//       </Container>
//     </>
//   );
// }

// export default Index;






import React from 'react';
import "./style.css";
import { Box } from '@mui/material';
import MobailVeiwTimeLine from "./MobailVeiw/index";
import TimelineDesktop from "./Desktop/index";
import { Typography, Grid } from '@mui/material';
import { Container } from '@mui/system';
function Index() {
  return (
    <>
      <Container maxWidth="lg" sx={{ py: "80px" }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sx={12} lg={6} md={6} >
            <Typography variant='h5' sx={{ color: "#5C785A" }}>Our 3D model:</Typography>
            <Typography variant='body1' sx={{ mt: 2, color: "#4A4A4A" }}>Our 3D Model forms the backbone of our approach.
              Through this comprehensive approach, we transform e-waste
              into educational tools , thereby providing impact reports
              to our donors.</Typography>
          </Grid>
        </Grid>
        <Box sx={{ display: { lg: 'none', md: 'none', sm: 'block', xs: 'block' } }}>
          <MobailVeiwTimeLine />
        </Box>
        <Box sx={{ display: { lg: 'flex', md: 'flex', sm: 'none', xs: 'none' } }}>
          <TimelineDesktop />
        </Box>
      </Container>
    </>
  );
}

export default Index;


