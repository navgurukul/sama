import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Container } from '@mui/material';
import { styled } from '@mui/system';
import IndiaImg from './assets/india.png';
import Komal from "./assets/Komal.png";
import ZiyaImg from "./assets/ZiyaImg .png";
import { skills, JobData } from './data.js';

const StyledCard = styled(Card)({
    height: '100%',
    borderRadius: '8px',
    background: '#FFF',
    boxShadow: '0px 2px 10px 0px rgba(0, 0, 0, 0.10)',
});

const SocialImpactPage = () => {
    return (
        <>
            <Container maxWidth="xxl">
                <Grid container spacing={3} sx={{ mt: 1 }}>
                    {JobData.map((item, index) => (
                        <Grid item xs={12} lg={2.4} md={4} key={index}>
                            <StyledCard >
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{item.title}</Typography>
                                    <Typography variant="h5" sx={{ mt: 1 }}>{item.number}</Typography>
                                    <Typography sx={{ width: { lg: "250px" }, mt: 2 }}>{item.description}</Typography>
                                </CardContent>
                            </StyledCard>
                        </Grid>
                    ))}
                </Grid>

                <Grid container spacing={1} sx={{ mt: 1 }}>

                    <Grid item xs={12} md={6} >
                        <StyledCard sx={{ height: { lg: "454px" } }}>
                            <CardContent sx={{ p: 4 }}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={12} lg={6}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }} >STATES IMPACTED</Typography>
                                        <Typography sx={{ mt: 4 }} variant="h4">17</Typography>
                                        <Typography sx={{ mt: 1 }} variant="body1" >
                                            Delhi, MP, UP, Maharashtra, Uttarakhand, Bihar, Rajasthan, Telangana, Andhra Pradesh, Assam, Sikkim, Karnataka, Odisha, Jharkhand, Punjab, Jammu & Kashmir, Haryana.
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={12} lg={6}>
                                        <img
                                            component="img"
                                            src={IndiaImg}
                                            alt="Map of India"
                                            style={{ width: '80%', height: 'auto' }}
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </StyledCard>
                    </Grid>

                    <Grid item xs={12} md={6} sx={{ mt: 3 }}>

                        <Typography variant="subtitle1" sx={{ fontWeight: 700, ml: 2 }}>SKILLS IMPARTED</Typography>
                        <Grid container spacing={3} sx={{ p: 2 }} >
                            {skills.map((skill, index) => (
                                <Grid item xs={12} lg={4} md={6} sm={6} key={index}>
                                    <Box display="flex" alignItems="center">
                                        <img src={skill.icon} alt={skill.name} style={{ marginRight: '12px' }} />
                                        <Typography variant="body1">{skill.name}</Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>

                        <Grid container sx={{ p: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>STUDENT SPEAKS</Typography>

                            <Grid item xs={12} md={12} sx={{ mt: 3 }}>
                                <Box display="flex" alignItems="center">
                                    <img src={ZiyaImg} style={{ marginRight: '8px' }} />
                                    <Box sx={{ ml: 3 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }} >“ Before, I couldn't even turn a laptop on. Now, I can't imagine a day of learning without it ”</Typography>
                                        <Typography variant='body1' sx={{ mt: 2 }}>Ziya Afreen (NavGurukul Student)</Typography>
                                    </Box>
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={12} sx={{ mt: 2 }}>
                                <Box display="flex" alignItems="center">
                                    <img src={Komal} style={{ marginRight: '8px' }} />
                                    <Box sx={{ ml: 3 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }} > “ This laptop isn't just a tool. It is my bridge from being a novice to a full-fledged future software developer “</Typography>
                                        <Typography variant='body1' sx={{ mt: 2 }}>Komal Chaudhary (NavGurukul Student)</Typography>
                                    </Box>
                                </Box>
                            </Grid>

                        </Grid>
                    </Grid>
                </Grid>
            </Container>
        </>
    );
};

export default SocialImpactPage;
