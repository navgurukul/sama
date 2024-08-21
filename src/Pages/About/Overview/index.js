import React from 'react';
import { Container, Grid, Box, Typography, Paper } from '@mui/material';
import student from "./assets/Group.png";
import { ContainerStyle, PaperStyle, BoxStyle } from './style';
function Overview() {
    return (
        <>
            <Container maxWidth="xl" sx={ContainerStyle}>
                <Grid container justifyContent="center">
                    <Grid item xs={12} md={12} lg={8}>
                        <Paper elevation={3} sx={PaperStyle} >
                            <Typography variant="h5" sx={{ color: "rgba(92, 120, 90, 1)" }} >
                                Where it all began?
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 3 }}>
                                We started 8 years ago with a vision to
                                bring quality higher education and jobs to
                                underprivileged women in India. This vision
                                of NavGurukul has since grown into 7 residential
                                centres with a capacity for 1200+ students, resulting
                                in 800+ job placements and a strong network of 100+
                                ecosystem supporters until now.
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 3 }}>
                                One of the most crucial tools enabling this journey
                                is a laptop. Our ecosystem partners, including industry
                                leaders like Amazon, Macquarie, DXC, MSDF, Tiger Analytics
                                and Fossil Fuels have contributed about 1000 End-of-Life
                                laptops already, thus multiplying the impact significantly.
                                These donations have resulted in XXXX jobs created and
                                1200XXXX females from the remotest corners of 11 states becoming digitally adept, thereby breaking social and cultural barriers. Not only that, we also played a small part in enabling the donors move towards Net Zero in their Scope 3 GHG emissions.
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 3 }}>
                                If a number as small as 1000 laptops can create such a
                                profound impact on few lives, imagine what we could achieve
                                if we solved this not only for NavGurukul students but for
                                all students.
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={12} lg={4}
                        sx={{
                            mt: { md: 4, lg: 1 }
                        }}>
                        <Box sx={BoxStyle}>
                            <Box sx={{
                                position: { lg: "relative" },
                                left: { lg: "120px" },
                            }}>
                                <img
                                    src={student}
                                    alt="Illustration"
                                    style={{
                                        width: '100%',
                                        height: 'auto',
                                        maxWidth: "768.23px",
                                    }}
                                />
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Container >
        </>
    )
}
export default Overview;