import React from "react";
import { Container, Grid, Box, Typography } from "@mui/material";
import {
  container,
  lgContainer,
  h6,
  statItem,
  h4,
  statLogo,
  subtitle1,
  styleh5,
  Modelbody1,
  styles,
} from "./style.js";
import { data } from "./data.js";
import Model from './model.png'
import useMediaQuery from "@mui/material/useMediaQuery";
import { breakpoints } from "../../theme/constant";
import ourteam from "../../Pages/About/OurTeam/style.js";
import we from "./we.svg";
import { Mode } from "@mui/icons-material";
import { border } from "@mui/system";
const OurApproach = () => {
  const isActive = useMediaQuery("(max-width:" + breakpoints.values.sm + "px)");

  return (
    <>
      <Box

        style={container}
        sx={{
          ...container,
          paddingLeft: isActive ? "16px" : "0px",
          paddingRight: isActive ? "16px" : "0px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Container maxWidth="lg" style={lgContainer} sx={{}}>
          <Grid container sx={{ paddingTop: "80px", textAlign: {xs:"left", md:"center"}, justifyContent: "center" }} >
            <Grid item xs={12} md={7} sm={12} sx={{ px: { lg: 0, sm: 5, md: 3, sx: 5 } }}>
              <Typography sx={styleh5} variant="h5">
                Our Rationale
              </Typography>
              <Typography variant="body1" sx={{ color: "var(--white, #FFF)", textAlign: {xs:"left", md:"left"} }} paddingTop="16px">
                We strongly believe that investing in women and youth’s digital education
                can reap multifold benefits for society as a whole. As we
                rapidly advance in technology, it's crucial to ensure that
                underserved women aren't left behind. Sama addresses two
                pressing issues simultaneously:
              </Typography>
            </Grid>
          </Grid>
          <Grid container color="#fff" paddingTop="40px" sx={{ px: { lg: 0, sm: 5, md: 3, sx: 5 }, justifyContent: "center" }}>
            {data.map((section, sectionIndex) => (
              <React.Fragment key={sectionIndex}>
                <Typography
                  variant="h6"
                  mt={3}
                  sx={{
                    textAlign: "center",
                    ...container,
                    paddingTop: isActive && 6,
                    mt: sectionIndex === 1 ? 8 : 4,

                  }}
                >
                  {section.title}
                </Typography>
                <Grid
                  container
                >
                  {section.statistics.map((stat, statIndex) => (
                    <Grid
                      item
                      xs={12}
                      md={4}
                      lg={4}
                      key={statIndex}
                      style={statItem}
                      sx={{
                        ...container,
                        marginTop: isActive && "16px",
                      }}
                    >
                      <Box display="flex" alignItems="center" sx={{ paddingTop: "32px" }}>
                        <img
                          src={stat.moneyLogo}
                          alt="money logo"
                          style={statLogo}
                        />
                        <Typography
                          style={styles.h4}
                          variant="h6"
                          component="span"
                        >
                          {stat.value}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body1"
                        sx={{ color: "var(--white, #FFF)", mt: 2, width: { md: "305px" } }}
                      >
                        {stat.description}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </React.Fragment>
            ))}
          </Grid>

        </Container>
      </Box >
      <Container>

        <Box sx={ourteam.ApproachBox} mt={5}>
          <Typography variant="h5" color="#5C785A" gutterBottom>
            Our Working Model
          </Typography>
          <Typography variant="body1" paragraph textAlign="center">
            Through this comprehensive working model, we 
            transform e-waste into educational tools , thereby 
            providing impact reports to our donors
          </Typography>
          <img src={Model}
            alt="Logo"
            style={{
              display: 'block',
              maxWidth: '100%',
              marginBottom: '100px',
            }}>

          </img>

        </Box>
      </Container>

    </>
  );
};

export default OurApproach;