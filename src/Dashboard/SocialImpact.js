import React from 'react';
import { Grid, CardContent, Typography, Box, Container } from '@mui/material';
import IndiaImg from './assets/india.png';
import Komal from "./assets/Komal.png";
import ZiyaImg from "./assets/ZiyaImg .png";
import { skills, JobData } from './data.js';
import { clases } from './style.js';

const SocialImpactPage = () => {
    return (
        <Container maxWidth="xxl" sx={{ mt: 3 }}>
            <Grid container spacing={3}>
                {JobData.map((item, index) => (
                    <Grid item xs={12} lg={2.4} md={4} key={index}>
                        <Box sx={clases.card}>
                            <CardContent>
                                <Typography variant="subtitle1">{item.title}</Typography>
                                <Typography variant="h5" sx={{ mt: 3 }}>{item.number}</Typography>
                                <Typography variant='body1' sx={{ mt: 2 }}>{item.description}</Typography>
                            </CardContent>
                        </Box>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={2} sx={{ mt: 3 }}>
                <Grid item xs={12} md={6}>
                    <Box sx={clases.MapCard}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} lg={6}>
                                <Typography variant="subtitle1">STATES IMPACTED</Typography>
                                <Typography variant="h4">17</Typography>
                                <Typography variant="body1">
                                    Delhi, MP, UP, Maharashtra, Uttarakhand, Bihar, Rajasthan,
                                    Telangana, Andhra Pradesh, Assam, Sikkim, Karnataka, Odisha,
                                    Jharkhand, Punjab, Jammu & Kashmir, Haryana.
                                </Typography>
                            </Grid>
                            <Grid item xs={12} lg={6}>
                                <img
                                    src={IndiaImg}
                                    alt="Map of India"
                                    style={clases.Img}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>

                <Grid item xs={12} md={6} sx={{ mt: 1 }}>
                    <Box>
                        <Typography variant="subtitle1">SKILLS IMPARTED</Typography>
                        <Grid container spacing={3} sx={{ mt: 1 }}>
                            {skills.map((skill, index) => (
                                <Grid item xs={12} lg={4} md={6} sm={6} key={index}>
                                    <Box sx={clases.student}>
                                        <img src={skill.icon} alt={skill.name} />
                                        <Typography variant="body1" sx={{ ml: 3 }}>{skill.name}</Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>

                        <Typography variant="subtitle1" sx={{ mt: 3 }}>STUDENT SPEAKS</Typography>
                        <Grid container spacing={3} sx={{ mt: 3 }}>
                            <Grid item xs={12} md={12}>
                                <Box sx={clases.student}>
                                    <img src={ZiyaImg} alt="Ziya Afreen" />
                                    <Box sx={{ ml: 3 }}>
                                        <Typography variant="subtitle1">
                                            “ Before, I couldn't even turn a laptop on. Now, I can't imagine a day of learning without it ”
                                        </Typography>
                                        <Typography variant='body1'>
                                            Ziya Afreen (NavGurukul Student)
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={12}>
                                <Box sx={clases.student}>
                                    <img src={Komal} alt="Komal Chaudhary" />
                                    <Box sx={{ ml: 3 }}>
                                        <Typography variant="subtitle1">
                                            “ This laptop isn't just a tool. It is my bridge from being a novice to a full-fledged future software developer ”
                                        </Typography>
                                        <Typography variant='body1'>
                                            Komal Chaudhary (NavGurukul Student)
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
};

export default SocialImpactPage;
