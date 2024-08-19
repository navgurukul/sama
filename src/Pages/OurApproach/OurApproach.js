import { Container, Grid, Box, Typography } from "@mui/material";
import { container, lgContainer } from "./style.js";
import { data } from "./data.js";
import TimeLine from "./TimeLine/index.js";
const OurApproach = () => {
    return (
        <>
            <Box style={container} >
                <Container maxWidth="xl" style={lgContainer} >
                    <Grid container my={8} >
                        <Grid item xs={12} md={7} sx={{ p: { sm: "20px", xs: "20px", md: "20px", lg: "10px" } }} >
                            <Typography style={{ color: "white" }} variant="h5">Our Rationale</Typography>
                            <Typography variant="body1" sx={{ mt: 1,width:{lg:"636px"} }} style={{ color: "white" }}>
                                We strongly believe that investing in women's digital education can reap
                                multifold benefits for society as a whole. As we rapidly advance in technology,
                                it's crucial to ensure that underserved women aren't left behind. Sama addresses
                                two pressing issues simultaneously:
                            </Typography>
                        </Grid>
                    </Grid>
                    <Grid container color="#fff" sx={{ p: { sm: "20px", xs: "20px", md: "20px", lg: "20px", position: "relative", bottom: "30px" } }}>
                        {data.map((section, sectionIndex) => (
                            <>
                                <Typography variant="h6"  >
                                    {section.title}
                                </Typography>
                                <Grid container spacing={3}>
                                    {section.statistics.map((stat, statIndex) => (
                                        <Grid item xs={12} md={4} lg={4} key={statIndex} sx={{ mt: 2}}>
                                            <Box display="flex" alignItems="center" >
                                                <img src={stat.moneyLogo} alt="money logo" />
                                                <Typography variant="h4" sx={{ ml: 3 }} component="span" >
                                                    {stat.value}
                                                </Typography>
                                            </Box>
                                            <Typography variant="subtitle1" sx={{ mt: 2, width: { lg: "400px" } }}>
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
            <TimeLine />
        </>
    );
};

export default OurApproach;