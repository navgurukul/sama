import { Container, Grid, Typography, Box } from "@mui/material";
import TimeLine from "./TimeLine";
import Icon1 from "./assets/icon1.png";
import Icon2 from "./assets/icon2.png";
import Icon3 from "./assets/icon3.png";
import Icon4 from "./assets/icon4.png";
import Icon5 from "./assets/icon5.png";
import Icon6 from "./assets/icon6.png";

import clases from "./style";

const OurApproach = () => {
  return (
    <>
      <Box sx={clases.backgroundAndPadding} bgcolor="primary.main">
        <Container maxWidth="xl">
          <Grid container spacing={6}>
            <Grid item xs={12} md={7} lg={5}>
              <Typography variant="h5" color="white.main">
                Our Rationale
              </Typography>
              <Typography variant="body1" color="white.main" sx={{ mt: 2 }}>
                We strongly believe that investing in women's digital education can reap
                multifold benefits for society as a whole. As we rapidly advance in technology,
                it's crucial to ensure that underserved women aren't left behind. Sama addresses
                two pressing issues simultaneously:
              </Typography>
            </Grid>
          </Grid>

          <Typography variant="h6" color="white.main" sx={{ marginTop: "60px" }}>
            The E-Waste Crisis
          </Typography>

          <Grid container spacing={6} sx={{mt:1}}>
            <Grid item xs={12} md={4}>
              <Box sx={clases.CardContent}>
                <Box sx={clases.boxStyle}>
                  <img src={Icon1} alt="money logo" />
                  <Typography sx={{ ml: 3 }} variant="h4" color="white.main">
                    2M tons
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ mt: 2 }} color="white.main">
                  of e-waste is generated annually in India, making it the world's third-largest e-waste producer.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={clases.CardContent}>
                <Box sx={clases.boxStyle}>
                  <img src={Icon2} alt="money logo" />
                  <Typography sx={{ ml: 3 }} variant="h4" color="white.main">
                    70%
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ mt: 2 }} color="white.main">
                  of India's e-waste comes from discarded laptops.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={clases.CardContent}>
                <Box sx={clases.boxStyle}>
                  <img src={Icon3} alt="money logo" />
                  <Typography sx={{ ml: 3 }} variant="h4" color="white.main">
                    80%
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ mt: 2 }} color="white.main">
                  of women in India have ever used the internet, compared to 57%
                  of men, highlighting a significant digital divide.
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Typography variant="h6" color="white.main" sx={{ marginTop: "64px" }}>
            The Digital Gender Divide
          </Typography>

          <Grid container spacing={6} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <Box sx={clases.CardContent}>
                <Box sx={clases.boxStyle}>
                  <img src={Icon4} alt="money logo" />
                  <Typography sx={{ ml: 3 }} variant="h4" color="white.main">
                    33%
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ mt: 2 }} color="white.main">
                  of women in India have ever used the internet,
                  compared to 57% of men, highlighting a
                  significant digital divide.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={clases.CardContent}>
                <Box sx={clases.boxStyle}>
                  <img src={Icon5} alt="money logo" />
                  <Typography sx={{ ml: 3 }} variant="h4" color="white.main">
                    158M
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ mt: 2 }} color="white.main">
                  girl students were affected by the COVID-19 lockdown,
                  jeopardizing their education and future prospects.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={clases.CardContent}>
                <Box sx={clases.boxStyle}>
                  <img src={Icon6} alt="money logo" />
                  <Typography sx={{ ml: 3 }} variant="h4" color="white.main">
                    17%
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ mt: 2 }} color="white.main">
                  of rural students have internet access in rural areas, whereas 44%
                  in urban areas do and a mere 2% of
                  the poorest income groups have access to a computer with internet.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <TimeLine />
    </>
  );
};

export default OurApproach;