
import { Container, Grid, Box, Typography } from "@mui/material";
import { container, lgContainer, h6, statItem,statLogo, subtitle1, styleh5, Modelbody1, styles } from "./style.js";
import { data } from "./data.js";
import TimeLine from "./TimeLine/index.js";
const OurApproach = () => {
    return (
        <>
            <Container maxWidth="xxl" style={container}>
                <Container maxWidth="lg" style={lgContainer} >

                    <Grid container spacing={2} style={{position:"relative",right:"35px"}}>
                        <Grid item xs={12} md={6} lg={6} >
                            <Typography sx={styleh5} variant="h5">Our Rationale</Typography>
                            <Typography style={Modelbody1} variant="body1" sx={{ mt: 2 }}>
                                We strongly believe that investing in women's digital education can reap
                                multifold benefits for society as a whole. As we rapidly advance in technology,
                                it's crucial to ensure that underserved women aren't left behind. Sama addresses
                                two pressing issues simultaneously:
                            </Typography>
                        </Grid>
                    </Grid>

                    <Grid container spacing={2} alignItems="flex-start"  >
                        {data.map((section, sectionIndex) => (
                            <>
                                <Typography variant="h6" style={h6} sx={{ mt: 4,}}>
                                    {section.title}
                                </Typography>

                                <Grid container spacing={2} rowSpacing={3.75} sx={{ mt: 3 }}>
                                    {section.statistics.map((stat, statIndex) => (
                                        <Grid item xs={12} md={4} key={statIndex} style={statItem}>
                                            <Box display="flex" alignItems="center" sx={{ p: 0 }}>
                                                <img src={stat.moneyLogo} alt="money logo" style={statLogo} />
                                                <Typography style={styles.h4} component="span" >
                                                    {stat.value}
                                                </Typography>
                                            </Box>
                                            <Typography variant="body1" style={subtitle1} sx={{ mt: 2 }}>
                                                {stat.description}
                                            </Typography>
                                        </Grid>

                                    ))}
                                </Grid>
                            </>
                        ))}
                    </Grid>
                </Container>
            </Container>
            <TimeLine></TimeLine>
        </>
    );
};

export default OurApproach;