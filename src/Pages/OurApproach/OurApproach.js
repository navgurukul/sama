import { Container, Grid, Typography, Box } from "@mui/material";
import TimeLine from "./TimeLine";
import moneylogo from "./assets/Sama Internal Edits (1) 1 (2).png";
import clases from "./style";

const OurApproach = () => {
    return (
        <>
            <Box sx={clases.backgroundAndPadding} bgcolor="primary.main">
                <Container maxWidth="xl">
                    <Grid container spacing={6}>
                        <Grid item xs={12} md={7}>
                            <Typography variant="h5" color="white.main">
                                Our Rationale
                            </Typography>
                            <Typography variant="body1" color="white.main" sx={{mt:2}}>
                                We strongly believe that investing in women's digital education can reap
                                multifold benefits for society as a whole. As we rapidly advance in technology,
                                it's crucial to ensure that underserved women aren't left behind. Sama addresses
                                two pressing issues simultaneously:
                            </Typography>
                        </Grid>
                    </Grid>

                    <Typography variant="h6" color="white.main">
                        The E-Waste Crisis
                    </Typography>

                    <Grid container spacing={6}>
                        <Grid item xs={12} md={4}>
                            <Box sx={clases.CardContent}>
                                <Box sx={clases.boxStyle}>
                                    <img src={moneylogo} alt="money logo" />
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
                                    <img src={moneylogo} alt="money logo" />
                                    <Typography sx={{ ml: 3 }} variant="h4" color="white.main">
                                        80%
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
                                    <img src={moneylogo} alt="money logo" />
                                    <Typography sx={{ ml: 3 }} variant="h4" color="white.main">
                                        70%
                                    </Typography>
                                </Box>
                                <Typography variant="body1" sx={{ mt: 2 }} color="white.main">
                                    of e-waste is processed informally.
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    <Typography variant="h6" color="white.main">
                        The Digital Gender Divide
                    </Typography>

                    <Grid container spacing={6}>
                        <Grid item xs={12} md={4}>
                            <Box sx={clases.CardContent}>
                                <Box sx={clases.boxStyle}>
                                    <img src={moneylogo} alt="money logo" />
                                    <Typography sx={{ ml: 3 }} variant="h4" color="white.main">
                                        33%
                                    </Typography>
                                </Box>
                                <Typography variant="body1" sx={{ mt: 2 }} color="white.main">
                                    of women in India have ever used the internet, compared to 57% of men, highlighting a significant digital divide.
                                </Typography>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Box sx={clases.CardContent}>
                                <Box sx={clases.boxStyle}>
                                    <img src={moneylogo} alt="money logo" />
                                    <Typography sx={{ ml: 3 }} variant="h4" color="white.main">
                                        158M
                                    </Typography>
                                </Box>
                                <Typography variant="body1" sx={{ mt: 2 }} color="white.main">
                                    girl students were affected by the COVID-19 lockdown, jeopardizing their education and future prospects.
                                </Typography>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Box sx={clases.CardContent}>
                                <Box sx={clases.boxStyle}>
                                    <img src={moneylogo} alt="money logo" />
                                    <Typography sx={{ ml: 3 }} variant="h4" color="white.main">
                                        44%
                                    </Typography>
                                </Box>
                                <Typography variant="body1" sx={{ mt: 2 }} color="white.main">
                                    of girl students were affected by the COVID-19 lockdown, jeopardizing their education and future prospects.
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
