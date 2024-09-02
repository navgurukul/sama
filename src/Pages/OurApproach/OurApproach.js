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
import useMediaQuery from "@mui/material/useMediaQuery";
import { breakpoints } from "../../theme/constant";
import we from "./we.svg"
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
        }}
      >
        <Container maxWidth="lg" style={lgContainer}>
          <Grid container my={isActive ? 0 : 4}>
            <Grid item xs={12} md={7}>
              <Typography sx={styleh5} variant="h5">
                Our Rationale
              </Typography>
              <Typography style={Modelbody1} variant="body1" sx={{ mt: 2 }}>
                We strongly believe that investing in women's digital education
                can reap multifold benefits for society as a whole. As we
                rapidly advance in technology, it's crucial to ensure that
                underserved women aren't left behind. Sama addresses two
                pressing issues simultaneously:
              </Typography>
            </Grid>
          </Grid>

          <Grid container color="#fff">
            {data.map((section, sectionIndex) => (
              <>
                <Typography
                  variant="h6"
                  mt={4}
                  sx={{
                    ...container,
                    paddingTop: isActive && 6,
                  }}
                >
                  {section.title}
                </Typography>
                <Grid container sx={{ mt: 4 }}>
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
                      <Box display="flex" alignItems="center">
                        <img
                          src={stat.moneyLogo}
                          alt="money logo"
                          style={statLogo}
                        />
                        <Typography style={styles.h4} component="span">
                          {stat.value}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body1"
                        style={subtitle1}
                        sx={{ mt: 2, width: { md: "305px" } }}
                      >
                        {stat.description}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </>
            ))}
          </Grid>
        </Container>
      </Box>
      <Container>
      <Typography variant="h5" my={6} sx = {{align : "left"}} >
               This is how we transform your donated laptops into tools of impact!
              </Typography>
        <Box
            component="img"
            src={we}
            alt="Logo"
            sx={{
                width: '100%', 
                height: 'auto', 
                display: 'block', 
                maxWidth: '100%', 
                marginBottom: '60px',
            }}
        />
    </Container>

    </>
  );
};

export default OurApproach;