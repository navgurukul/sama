import React from 'react';
import Img1 from "./assets/img1 (copy).png";
import Img2 from "./assets/img2.png";
import Img3 from "./assets/img3.png";

import Img5 from "./assets/img5.png";
import Img4 from "./assets/img4.png";
import Img6 from "./assets/img6.png";
import Img7 from "./assets/img7.png";

import { Grid, Box, Container, Typography } from '@mui/material';
import "../OurApproach.css";
import "./style.css";
import classes from "./style.js";

const TimeLine = () => {
  return (
    <>
      <Box paddingBottom="80px" sx={{ background: "rgba(248, 243, 240, 1)" }}>
        <Container maxWidth="xl">
          <Grid container spacing={2}>
            <Grid item xs={12} lg={5} md={7} sx={{ mt: "80px" }}>
              <Typography variant='h5' color="primary.main">Our 3D model:</Typography>
              <Typography variant='body1' sx={{ mt: 3 }}>Our 3D Model forms the backbone of our approach.
                Through this comprehensive approach, we transform e-waste
                into educational tools , thereby providing impact reports
                to our donors.
              </Typography>
            </Grid>
          </Grid>
          <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2 }}
            sx={{ mt: 5, display: { xs: 'flex', lg: 'none', md: "none" } }}>
            <main className="container-main" >
              <Box className="container-timeline">
                <Box className="content-timeline active-content-timeline">
                  <Box className="header-timeline">
                    <Box>
                      <Typography

                        color="primary.main"
                        variant="h6"
                        sx={classes.typographyStyle}
                        style={{ marginBottom: "40px" }}
                      >
                        Digital Resource Recovery
                      </Typography>
                    </Box>
                    <span className="marker-timeline"></span>
                    <img style={{ width: "170px" }} src={Img1}></img>
                  </Box>
                  <Box className="body-timeline">
                    <Typography
                      variant='body1'
                      sx={classes.typographystyle}
                    >
                      We collect end-of-life laptops from corporate partners like you
                    </Typography>
                  </Box>

                </Box>
                <Box className="content-timeline">
                  <Box className="header-timeline">
                    <span className="marker-timeline"></span>
                    <img style={{ width: "170px" }} src={Img2}></img>
                  </Box>
                  <Box className="body-timeline">
                    <Typography
                      variant='body1'
                      sx={classes.typographystyle}
                    >
                      We ensure complete data erasure and privacy protection
                    </Typography>
                  </Box>
                </Box>

                <Box className="content-timeline">
                  <Box className="header-timeline">
                    <span className="marker-timeline"></span>
                    <img style={{ width: "170px" }} src={Img3}></img>
                  </Box>
                  <Box className="body-timeline">
                    <Typography
                      variant='body1'
                      sx={classes.typographystyle}
                    >
                      We restore and upgrade these laptops for educational use
                    </Typography>
                  </Box>
                </Box>
                <Box className="content-timeline">
                  <Box className="header-timeline">

                    <Box >
                      <Typography
                        color="primary.main"
                        variant="h6"
                        sx={classes.typographyStyle}
                      >
                        Digital Inclusion Pipeline
                      </Typography>
                    </Box>
                    <span className="marker-timeline"></span>
                    <img style={{ width: "170px", marginTop: "40px" }} src={Img4}/>
                  </Box>
                  <Box className="body-timeline">
                    <Typography
                      variant='body1'
                      sx={classes.typographystyle}
                    >
                      We create livelihood opportunities through our interventions
                    </Typography>
                  </Box>
                </Box>
                <Box className="content-timeline">
                  <Box className="header-timeline">
                    <span className="marker-timeline"></span>
                    <img style={{ width: "170px" }} src={Img4}></img>
                  </Box>
                  <Box className="body-timeline">
                    <Typography
                      variant='body1'
                      sx={classes.typographystyle}
                    >
                      We provide an ecosystem of pre-installed online and offline learning resources
                    </Typography>
                  </Box>
                </Box>
                <Box className="content-timeline">
                  <Box className="header-timeline">
                    <span className="marker-timeline"></span>
                    <img style={{ width: "170px" }} src={Img5}></img>
                  </Box>
                  <Box className="body-timeline">
                    <Typography
                      variant='body1'
                      sx={classes.typographystyle}
                    >
                      We connect with underserved communities through 200+ verified NGOs/Government Institutions
                    </Typography>
                  </Box>
                </Box>
                <Box className="content-timeline">
                  <Box className="header-timeline">
                    <span className="marker-timeline"></span>
                    <Box style={{ marginTop: "30px" }}>
                      <Typography
                        color="primary.main"
                        variant="h6"
                        sx={classes.typographyStyle}
                      >
                        Digital Tracking and Reporting
                      </Typography>
                    </Box>
                    <img src={Img6} style={{ width: "170px", marginTop: "40px" }}></img>
                  </Box>
                  <Box className="body-timeline">
                    <Typography
                      variant='body1'
                      sx={classes.typographystyle}
                    >
                      We capture data on laptop’s lifecycle and community impact
                    </Typography>
                  </Box>
                </Box>

                <Box className="content-timeline">
                  <Box className="header-timeline">
                    <span className="marker-timeline"></span>
                    <img style={{ width: "170px" }} src={Img7}></img>
                  </Box>
                  <Box className="body-timeline">
                    <Typography
                      variant='body1'
                      sx={classes.typographystyle}
                    >
                      We generate transparent, real-time analytics on ESG outcomes
                    </Typography>
                  </Box>
                </Box>
                <Box className="content-timeline">
                  <Box className="header-timeline">
                    <span className="marker-timeline"></span>
                    <img src={Img7}></img>
                  </Box>
                  <Box className="body-timeline">
                    <Typography
                      variant='body1'
                      sx={classes.typographystyle}
                    >
                      We utilize insights to improve processes and maximize impact
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </main>
          </Grid>

          <Grid container spacing={2} sx={{ display: { xs: 'none', lg: 'flex', md: 'flex' }, height: "auto" }}>
            <div className="timeline" sx={{ border: "1px solid red" }}>
              <ul>
                <li>
                  <Box
                    sx={classes.titleBox}
                  >
                    <Typography variant='h6' color="primary.main">
                      Digital Tracking and Reporting
                    </Typography>
                  </Box>

                  <Box sx={classes.containerBox}>
                    <img
                      style={classes.imageStyle}
                      src={Img1}
                      alt="Digital Tracking and Reporting"
                    />
                    <Typography variant='body1' sx={classes.textStyle}>
                      We collect end-of-life laptops from corporate partners like you
                    </Typography>
                  </Box>
                </li>
                <li>
                  <Box
                    sx={classes.protection}
                  >
                    <img
                      style={{ width: '200px', marginBottom: '8px' }}
                      src={Img2}
                      alt="Digital Tracking and Reporting"
                    />
                    <Typography variant='body1'>
                      We ensure complete data erasure and privacy protection
                    </Typography>
                  </Box>
                </li>
                <li>
                  <Box
                    sx={classes.educational}
                  >
                    <img
                      style={{ width: '200px', marginBottom: '8px' }}
                      src={Img3}
                      alt="Digital Tracking and Reporting"
                    />
                    <Typography variant='body1'>
                      We restore and upgrade these laptops for educational use
                    </Typography>
                  </Box>
                </li>
                <li>
                  <Box
                    sx={classes.InclusionPipelineBox}
                  >
                    <Box sx={{ background: "rgba(206, 215, 206, 1)", width: "431px", height: "60px", borderRadius: "32px" }}>
                      <Typography color="primary.main" variant='h6' sx={{ position: "relative", top: "12px" }}>Digital Inclusion Pipeline</Typography>
                    </Box>
                  </Box>
                </li>
                <li>
                  <Box
                    sx={classes.interventions}
                  >
                    <img
                      style={{ width: '200px', marginBottom: '8px' }}
                      src={Img4}
                      alt="Digital Tracking and Reporting"
                    />
                    <Typography variant='body1'>
                      We create livelihood opportunities through our interventions
                    </Typography>
                  </Box>
                </li>
                <li>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      padding: '16px',
                      position: "relative",
                      height: "15px",

                    }}
                  >

                  </Box>
                </li>
                <li>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      padding: '16px',
                      position: "relative",
                      height: "135px",
                    }}
                  >

                  </Box>
                </li>
                <li>
                  <Box
                    sx={classes.ecosystem}
                  >
                    <img
                      style={{ width: '200px', marginBottom: '8px' }}
                      src={Img4}
                      alt="Digital Tracking and Reporting"
                    />
                    <Typography variant='body1'>
                      We provide an ecosystem of pre-installed online and offline learning resources
                    </Typography>
                  </Box>
                </li>
                <li>
                  <Box
                    sx={classes.communities}
                  >
                    <img
                      style={{ width: '200px', marginBottom: '8px' }}
                      src={Img5}
                      alt="Digital Tracking and Reporting"
                    />
                    <Typography variant='body1'>
                      We connect with underserved communities through 200+ verified NGOs/Government Institutions
                    </Typography>
                  </Box>
                </li>
                <li>
                  <Box
                    sx={classes.Digital}
                  >
                    <Box sx={{ width: "431px", height: "60px", background: "rgba(206, 215, 206, 1)", borderRadius: "32px" }}>
                      <Typography color="primary.main" variant='h6' sx={{ position: "relative", top: "12px" }}>Digital Tracking and Reporting</Typography>
                    </Box>

                  </Box>
                </li>
                <li>
                  <Box
                    sx={classes.lifecycle}
                  >
                    <img
                      style={{ width: '200px', marginBottom: '8px' }}
                      src={Img6}
                      alt="Digital Tracking and Reporting"
                    />
                    <Typography variant='body1'>
                      We capture data on laptop’s lifecycle and community impact
                    </Typography>
                  </Box>
                </li>
                <li>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      padding: '16px',
                      position: "relative",
                      height: "10px",
                    }}
                  >

                  </Box>
                </li>
                <li>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      padding: '16px',
                      position: "relative",
                      height: "150px",
                      top: "30px"
                    }}
                  >

                  </Box>
                </li>
                <li>
                  <Box
                    sx={classes.analytics}
                  >
                    <img
                      style={{ width: '200px', marginBottom: '8px' }}
                      src={Img7}
                      alt="Digital Tracking and Reporting"
                    />
                    <Typography variant='body1'>
                      We generate transparent, real-time analytics on ESG outcomes
                    </Typography>
                  </Box>
                </li>
                <li
                >
                  <Box
                    sx={classes.impact}
                    style={{ marginTop: "-39px" }}

                  >
                    <Box sx={{mt:13}}>
                      <img
                        style={{ width: '200px' }}
                        src={Img7}
                        alt="Digital Tracking and Reporting"
                      />
                      <Typography variant='body1' sx={{mt:4}}>
                        We utilize insights to improve processes and maximize impact
                      </Typography>
                    </Box>
                  </Box>
                </li>
              </ul>
              <Box style={{ clear: "both" }}></Box>
            </div>
          </Grid>
        </Container>
      </Box >
    </>
  );
};

export default TimeLine;