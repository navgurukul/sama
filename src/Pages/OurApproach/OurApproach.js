import { Container, Grid, Typography, Box } from "@mui/material";
import TimeLine from "./TimeLine";
import moneylogo from "./assets/Sama Internal Edits (1) 1 (2).png"
const OurApproach = () => {
    return (
        <>
            <Box sx={{ background: "rgba(92, 120, 90, 1)", py: "80px" }}>
                <Container maxWidth="xl">
                    <Grid container spacing={6}>
                        <Grid item xs={12} md={7}>
                            <Typography variant="h5" style={{ color: "var(--white, #FFF)" }}>
                                Our Rationale
                            </Typography>

                            <Typography variant="body1" sx={{ mt: 6, width: { lg: "636px", color: "var(--white, #FFF)" } }}>
                                We strongly believe that investing in women's digital education can reap
                                multifold benefits for society as a whole. As we rapidly advance in technology,
                                it's crucial to ensure that underserved women aren't left behind. Sama addresses
                                two pressing issues simultaneously:
                            </Typography>
                        </Grid>
                    </Grid>
                    <Typography variant="h6" sx={{ color: "white", color: "var(--white, #FFF)" }}>
                        The E-Waste Crisis
                    </Typography>

                    <Grid container spacing={6} >
                        <Grid item xs={12} md={4}>
                            <Box
                                sx={{
                                    position: 'relative',
                                    color: "var(--white, #FFF)",
                                    width: { lg: "348.33px" }
                                }}
                            >
                                <Box display="flex" alignItems="center" >
                                    <img src={moneylogo} alt="money logo" />
                                    <Typography component="span" sx={{ ml: 3 }} variant="h4" >
                                        2M tons
                                    </Typography>
                                </Box>
                                <Typography variant="body1" sx={{ mt: 2 }}>
                                    of e-waste is generated annually in India, making it the world's third-largest e-waste producer.
                                </Typography>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Box
                                sx={{
                                    position: 'relative',
                                    width: { lg: "348.33px" },
                                    color: "var(--white, #FFF)"
                                }}
                            >
                                <Box display="flex" alignItems="center" >
                                    <img src={moneylogo} alt="money logo" />
                                    <Typography component="span" sx={{ ml: 3 }} variant="h4">
                                        80%
                                    </Typography>
                                </Box>
                                <Typography variant="body1" sx={{ mt: 2 }}>
                                    of India's e-waste comes from discarded laptops.
                                </Typography>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Box
                                sx={{
                                    position: 'relative',
                                    width: { lg: "348.33px" },
                                    color: "var(--white, #FFF)"

                                }}
                            >
                                <Box display="flex" alignItems="center" >
                                    <img src={moneylogo} alt="money logo" />
                                    <Typography component="span" sx={{ ml: 3 }} variant="h4">
                                        70%
                                    </Typography>
                                </Box>
                                <Typography variant="body1" sx={{ mt: 2 }}>
                                    of e-waste is processed informally
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    <Typography variant="h6" sx={{ color: "var(--white, #FFF)" }}>
                        The Digital Gender Divide
                    </Typography>
                    <Grid container spacing={6}>
                        <Grid item xs={12} md={4}>
                            <Box
                                sx={{
                                    position: 'relative',
                                    width: { lg: "348.33px" },
                                    color: "var(--white, #FFF)"

                                }}
                            >
                                <Box display="flex" alignItems="center" >
                                    <img src={moneylogo} alt="money logo" />
                                    <Typography component="span" sx={{ ml: 3 }} variant="h4">
                                        33%
                                    </Typography>
                                </Box>
                                <Typography variant="body1" sx={{ mt: 2 }}>
                                    of women in India have ever used the internet, compared to 57% of men, highlighting a significant digital divide.
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Box
                                sx={{
                                    position: 'relative',
                                    width: { lg: "348.33px" },
                                    color: "var(--white, #FFF)"

                                }}
                            >
                                <Box display="flex" alignItems="center" >
                                    <img src={moneylogo} alt="money logo" />
                                    <Typography component="span" sx={{ ml: 3 }} variant="h4">
                                        158M
                                    </Typography>
                                </Box>
                                <Typography variant="body1" sx={{ mt: 2 }}>
                                    girl students were affected by the COVID-19 lockdown, jeopardizing their education and future prospects.
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Box
                                sx={{
                                    position: 'relative',
                                    width: { lg: "348.33px" },
                                    color: "var(--white, #FFF)"

                                }}
                            >
                                <Box display="flex" alignItems="center" >
                                    <img src={moneylogo} alt="money logo" />
                                    <Typography component="span" sx={{ ml: 3 }} variant="h4">
                                        44%
                                    </Typography>
                                </Box>
                                <Typography variant="body1" sx={{ mt: 2 }}>
                                    girl students were affected by the COVID-19 lockdown, jeopardizing their education and future prospects.
                                </Typography>
                            </Box>
                        </Grid>

                    </Grid>
                </Container>
            </Box >
            <TimeLine></TimeLine>
        </>
    );
};

export default OurApproach;