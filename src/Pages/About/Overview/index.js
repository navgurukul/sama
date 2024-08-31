import React from 'react';
import { Container, Grid, Box, Typography, Paper } from '@mui/material';
import student from "./assets/Group.png";
import { ContainerStyle, PaperStyle, TypographyH4Style, TypographyBodyStyle, BoxStyle, ImageStyle } from './style';
function Overview() {
    return (
        <>
            <Container maxWidth="xl" sx={ContainerStyle} style={{marginTop:"90px"}}>
                <Grid container justifyContent="center" rowSpacing={2}>
                    <Grid item xs={12} md={6} lg={6}>
                        <Paper elevation={3} sx={PaperStyle} >
                            <Typography variant="h5" component="h2" sx={TypographyH4Style}>
                                Where it all began?
                            </Typography>
                            <Typography variant="body1" component="p" sx={TypographyBodyStyle}>
                            We started 8 years ago with a vision to bring quality higher education and jobs to underprivileged women in India. Our vision has since grown into 7 residential centres with a capacity for 1200+ students, resulting in 800+ job placements and a strong network of 100+ ecosystem supporters until now.
                            </Typography>
                            <Typography variant="body1" component="p" sx={TypographyBodyStyle}>
                                In this journey, we realised that a laptop is one of the most crucial enablers. Our ecosystem partners, including industry leaders like Amazon, Macquarie, DXC, MSDF, Tiger Analytics and Fossil have contributed about 1000 End-of-Life laptops already, thus multiplying the impact significantly. These donations have resulted in 314 jobs created and 900+ females from the remotest corners of 11 states becoming digitally adept, thereby breaking social and cultural barriers.
                            </Typography>
                            
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={5} lg={5}>
                        <Box sx={BoxStyle}>
                            <img
                                src={student}
                                alt="Illustration"
                                style={ImageStyle}
                            />
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </>
    )
}
export default Overview;