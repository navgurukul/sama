import React from "react";
import { Container, Grid, Box, Typography, useMediaQuery } from "@mui/material";
import {
  container,
  lgContainer,
  statItem,
  statLogo,
  styleh5,
  styles
} from "./style.js";
import { data } from "./data.js";
import Model from './model.png';
import { breakpoints } from "../../theme/constant";
import ourteam from "../../Pages/About/OurTeam/style.js";

const OurApproach = () => {
  const isActive = useMediaQuery(`(max-width:${breakpoints.values.sm}px)`);

  return (
    <>
      <Box
        style={container}
        sx={{
          paddingLeft: isActive ? "16px" : "0px",
          paddingRight: isActive ? "16px" : "0px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Container maxWidth="lg" style={lgContainer}>
          <Grid 
            container 
            sx={{ 
              paddingTop: "80px", 
              textAlign: { xs: "left", md: "center" }, 
              justifyContent: "center" 
            }}
          >
            <Grid 
              item 
              xs={12} 
              md={7} 
              sm={12} 
              sx={{ px: { lg: 0, sm: 5, md: 3, xs: 5 } }}
            >
              <Typography sx={styleh5} variant="h5">
                Our Rationale
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: "var(--white, #FFF)", 
                  textAlign: { xs: "left", md: "left" } 
                }} 
                paddingTop="16px"
              >
                We strongly believe that investing in women and youth's digital education
                can reap multifold benefits for society as a whole. As we
                rapidly advance in technology, it's crucial to ensure that
                underserved women and youth aren't left behind. Sama addresses two
                pressing issues simultaneously:
              </Typography>
            </Grid>
          </Grid>
          
          <Grid 
            container 
            color="#fff" 
            paddingTop="40px" 
            sx={{ 
              px: { lg: 0, sm: 5, md: 3, xs: 5 }, 
              justifyContent: "center" 
            }}
          >
            {data.map((section, sectionIndex) => (
              <React.Fragment key={sectionIndex}>
                <Typography
                  variant="h6"
                  sx={{
                    textAlign: "center",
                    paddingTop: isActive ? 6 : undefined,
                    mt: sectionIndex === 1 ? 8 : 4,
                    color: "#fff",
                    marginBottom: "16px",
                  }}
                >
                  {section.title}
                </Typography>
                <Grid container spacing={3}>
                  {section.statistics.map((stat, statIndex) => (
                   <Grid
                   item
                   xs={12}
                   md={4}
                   lg={4}
                   key={statIndex}
                   style={statItem}
                   sx={{
                     marginTop: isActive ? "16px" : undefined,
                     padding: "16px", // Add padding to create space between items
                   }}
                 >
                      <Box 
                        display="flex" 
                        alignItems="center" 
                        sx={{ 
                          paddingTop: "32px",
                          paddingRight: "32px" 
                        }}
                      >
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
                        sx={{ color: "var(--white, #FFF)", mt: 2,paddingRight: "32px" }}
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
      </Box>

      <Container maxWidth="md">
        <Box 
          sx={{
            ...ourteam.ApproachBox,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center"
          }} 
          mt={5}
        >
          <Typography 
            variant="h5" 
            color="#5C785A" 
            gutterBottom 
            sx={{ textAlign: "center" }}
          >
            Our Working Model
          </Typography>
          <Typography 
            variant="body1" 
            paragraph 
            align="center"
            sx={{ 
              maxWidth: "90%",
              mx: "auto",
              textAlign: "center"
            }}
          >
            Through this comprehensive working model, we transform e-waste into educational tools, thereby providing impact reports to our donors
          </Typography>
          <img 
            src={Model}
            alt="Logo"
            style={{
              display: 'block',
              maxWidth: '100%',
              margin: '0 auto 100px auto',
            }}
          />
        </Box>
      </Container>
    </>
  );
};

export default OurApproach;