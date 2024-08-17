import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { styles } from "./style";
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
            <Grid container spacing={3} sx={{ mt: 1 }}>
                {JobData.map((item, index) => (
                    <Grid item xs={12} md={2.4} key={index}>
                        <StyledCard >
                            <CardContent>
                                <Typography variant="subtitle1" style={styles.subtitle1}>{item.title}</Typography>
                                <Typography style={styles.h5} variant="h5" color="primary" sx={{ mt: 1 }}>{item.number}</Typography>
                                <Typography style={styles.body2} sx={{ width: { lg: "200px" }, mt: 2 }}>{item.description}</Typography>
                            </CardContent>
                        </StyledCard>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={1} mt={3}>
                <Grid item xs={12} md={6}>
                    <StyledCard>
                        <CardContent>
                            <Grid container spacing={3} mt={1}>
                                <Grid item xs={12} md={6} style={{ position: "relative", bottom: "14px" }}>
                                    <Typography variant="" style={styles.subtitle1}>STATES IMPACTED</Typography>
                                    <Typography sx={{ mt: 4 }} variant="h4" style={styles.h5} color="primary">17</Typography>
                                    <Typography sx={{ mt: 1 }} variant="body2" style={styles.body2}>
                                        Delhi, MP, UP, Maharashtra, Uttarakhand, Bihar, Rajasthan, Telangana, Andhra Pradesh, Assam, Sikkim, Karnataka, Odisha, Jharkhand, Punjab, Jammu & Kashmir, Haryana.
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <img
                                        component="img"
                                        src={IndiaImg}
                                        alt="Map of India"
                                        style={{ width: '100%' }}
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </StyledCard>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Typography variant="" sx={{ mt: 2, ml: 2 }} style={styles.subtitle1}>SKILLS IMPARTED</Typography>
                    <Grid container spacing={3} style={{ padding: "16px" }}>
                        {skills.map((skill, index) => (
                            <Grid item xs={12} md={4} key={index}>
                                <Box display="flex" alignItems="center">
                                    <img src={skill.icon} alt={skill.name} style={{ marginRight: '12px' }} />
                                    <Typography style={styles.body2} variant="body2">{skill.name}</Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                    <Grid container style={{ padding: "16px" }}>
                        <Typography variant="" style={styles.subtitle1}>STUDENT SPEAKS</Typography>
                        <Grid item xs={12} md={12} sx={{ mt: 4 }}>
                            <Box display="flex" alignItems="center">
                                <img src={ZiyaImg} style={{ marginRight: '8px' }} />
                                <Box sx={{ ml: 3 }}>
                                    <Typography variant="subtitle1" style={styles.subtitle1}>“ Before, I couldn't even turn a laptop on. Now, I can't imagine a day of learning without it ”</Typography>
                                    <Typography variant='body2' style={styles.body2} sx={{ mt: 2 }}>Ziya Afreen (NavGurukul Student)</Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={12} style={{ marginTop: "32px" }}>
                            <Box display="flex" alignItems="center">
                                <img src={Komal} style={{ marginRight: '8px' }} />
                                <Box sx={{ ml: 3 }}>
                                    <Typography variant="subtitle1" style={styles.subtitle1}> “ This laptop isn't just a tool. It is my bridge from being a novice to a full-fledged future software developer “</Typography>
                                    <Typography variant='body2' style={styles.body2} sx={{ mt: 2 }}>Komal Chaudhary (NavGurukul Student)</Typography>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </>
    );
};

export default SocialImpactPage;
