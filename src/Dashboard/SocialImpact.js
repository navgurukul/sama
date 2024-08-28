import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { styles } from "./style";
import { styled } from '@mui/system';
import IndiaImg from './assets/india.png';
import { skills, JobData } from './data.js';

const StyledCard = styled(Card)({
    height: '100%',
    borderRadius: '8px',
    background: '#FFF',
    boxShadow: '0px 2px 10px 0px rgba(0, 0, 0, 0.10)',
});

const SocialImpactPage = () => {
    const [visibleStudents, setVisibleStudents] = useState([0, 1]);

    useEffect(() => {
        const interval = setInterval(() => {
            setVisibleStudents((prev) => {
                const nextIndex = (prev[1] + 1) % students.length;
                return [prev[1], nextIndex];
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);


    const students = [
        {
            src: require('./assets/shahnaaz.jpg'),
            alt: 'Student 1',
            name: "Shahnaaz",
            place: "Bangalore",
            text: "From a rural student without resources to a skilled coder at Natwest, the laptop I received from Navgurukul was the key that unlocked my potential and transformed my future."
        },
        {
            src: require('./assets/anjali.png'),
            alt: 'Student 2',
            name: "Anjali Singh",
            place: "Pune",
            text: "With a laptop as my tool, I've transitioned from a NavGurukul " +
                "student to an academic intern, connecting with diverse learners across India and fostering personal growth."
        },
        {
            src: require('./assets/riya.png'),
            alt: 'Student 3',
            name: "Riya Kumari",
            place: "Maharashtra",
            text: "From not knowing how to use a laptop to S&P Global employee: NavGurukul's tech-enabled training launched my career in just one year."

        },
        {
            src: require('./assets/ziya.png'),
            alt: 'Student 4',
            name: "Ziya Afreen",
            place: "Delhi",
            text: "This laptop isn't just a tool; it's my bridge from a novice to a future software developer."
        },
        {
            src: require('./assets/Komal.png'),
            alt: 'Student 5',
            name: "Komal Chaudhary",
            place: "Bangalore",
            text: "Before, I couldn't even turn a laptop on. Now, I can't imagine a day of learning without it"
        },
    ];


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
                    <Typography sx={{ mt: 2, ml: 2 }} style={styles.subtitle1}>SKILLS IMPARTED</Typography>
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

                    <Typography variant="" style={styles.subtitle1}>STUDENT SPEAKS</Typography>
                    <Grid container style={{ padding: '16px', overflow: 'hidden', position: 'relative', height: '400px' }}>
                        <Box
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                animation: 'scroll 20s linear infinite',
                            }}
                        >
                            {[...students, ...students].map((student, index) => (
                                <Grid item xs={12} md={12} sx={{ mt: 2 }} key={index}>
                                    <Box display="flex" alignItems="center">
                                        <img
                                            src={student.src}
                                            alt={student.alt}
                                            style={{ marginRight: '8px', width: '64px', height: '64px', borderRadius: "50%", objectFit: 'cover' }}
                                        />
                                        <Box sx={{ ml: 3 }}>
                                            <Typography variant="subtitle1" style={styles.subtitle1}>
                                                {student.text}
                                            </Typography>
                                            <Typography style={styles.body2} sx={{ mt: 1 }}>
                                                {student.name}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            ))}
                        </Box>

                        <style jsx="true">{`
                                            @keyframes scroll {
                                            0% {
                                                    transform: translateY(0);
                                                }
                                            100% {
                                                    transform: translateY(-50%);
                                                }
                                            }
                                        `}
                        </style>

                    </Grid>

                </Grid>
            </Grid>
        </>
    );
};

export default SocialImpactPage;
