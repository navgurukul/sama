// import React from 'react';
// import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
// import { styles } from "./style";
// import { styled } from '@mui/system';
// import IndiaImg from './assets/india.png';
// import Komal from "./assets/Komal.png";
// import ZiyaImg from "./assets/ZiyaImg .png";
// import { skills, JobData } from './data.js';

// const StyledCard = styled(Card)({
//     height: '100%',
//     borderRadius: '8px',
//     background: '#FFF',
//     boxShadow: '0px 2px 10px 0px rgba(0, 0, 0, 0.10)',
// });

// const SocialImpactPage = () => {

//     return (
//         <>
//             <Grid container spacing={3} sx={{ mt: 1 }}>
//                 {JobData.map((item, index) => (
//                     <Grid item xs={12} md={2.4} key={index}>
//                         <StyledCard >
//                             <CardContent>
//                                 <Typography variant="subtitle1" style={styles.subtitle1}>{item.title}</Typography>
//                                 <Typography style={styles.h5} variant="h5" color="primary" sx={{ mt: 1 }}>{item.number}</Typography>
//                                 <Typography style={styles.body2} sx={{ width: { lg: "200px" }, mt: 2 }}>{item.description}</Typography>
//                             </CardContent>
//                         </StyledCard>
//                     </Grid>
//                 ))}
//             </Grid>

//             <Grid container spacing={1} mt={3}>
//                 <Grid item xs={12} md={6}>
//                     <StyledCard>
//                         <CardContent>
//                             <Grid container spacing={3} mt={1}>
//                                 <Grid item xs={12} md={6} style={{ position: "relative", bottom: "14px" }}>
//                                     <Typography variant="" style={styles.subtitle1}>STATES IMPACTED</Typography>
//                                     <Typography sx={{ mt: 4 }} variant="h4" style={styles.h5} color="primary">17</Typography>
//                                     <Typography sx={{ mt: 1 }} variant="body2" style={styles.body2}>
//                                         Delhi, MP, UP, Maharashtra, Uttarakhand, Bihar, Rajasthan, Telangana, Andhra Pradesh, Assam, Sikkim, Karnataka, Odisha, Jharkhand, Punjab, Jammu & Kashmir, Haryana.
//                                     </Typography>
//                                 </Grid>
//                                 <Grid item xs={12} md={6}>
//                                     <img
//                                         component="img"
//                                         src={IndiaImg}
//                                         alt="Map of India"
//                                         style={{ width: '100%' }}
//                                     />
//                                 </Grid>
//                             </Grid>
//                         </CardContent>
//                     </StyledCard>
//                 </Grid>
//                 <Grid item xs={12} md={6}>
//                     <Typography variant="" sx={{ mt: 2, ml: 2 }} style={styles.subtitle1}>SKILLS IMPARTED</Typography>
//                     <Grid container spacing={3} style={{ padding: "16px" }}>
//                         {skills.map((skill, index) => (
//                             <Grid item xs={12} md={4} key={index}>
//                                 <Box display="flex" alignItems="center">
//                                     <img src={skill.icon} alt={skill.name} style={{ marginRight: '12px' }} />
//                                     <Typography style={styles.body2} variant="body2">{skill.name}</Typography>
//                                 </Box>
//                             </Grid>
//                         ))}
//                     </Grid>
//                     <Grid container style={{ padding: "16px" }}>
//                         <Typography variant="" style={styles.subtitle1}>STUDENT SPEAKS</Typography>
//                         <Grid item xs={12} md={12} sx={{ mt: 4 }}>
//                             <Box display="flex" alignItems="center">
//                                 <img src={ZiyaImg} style={{ marginRight: '8px' }} />
//                                 <Box sx={{ ml: 3 }}>
//                                     <Typography variant="subtitle1" style={styles.subtitle1}>“ Before, I couldn't even turn a laptop on. Now, I can't imagine a day of learning without it ”</Typography>
//                                     <Typography variant='body2' style={styles.body2} sx={{ mt: 2 }}>Ziya Afreen</Typography>
//                                 </Box>
//                             </Box>
//                         </Grid>
//                         <Grid item xs={12} md={12} style={{ marginTop: "32px" }}>
//                             <Box display="flex" alignItems="center">
//                                 <img src={Komal} style={{ marginRight: '8px' }} />
//                                 <Box sx={{ ml: 3 }}>
//                                     <Typography variant="subtitle1" style={styles.subtitle1}> “ This laptop isn't just a tool. It is my bridge from being a novice to a full-fledged future software developer “</Typography>
//                                     <Typography variant='body2' style={styles.body2} sx={{ mt: 2 }}>Komal Chaudhary</Typography>
//                                 </Box>
//                             </Box>
//                         </Grid>
//                     </Grid>
//                 </Grid>
//             </Grid>
//         </>
//     );
// };

// export default SocialImpactPage;







import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { styles } from "./style";
import { styled } from '@mui/system';
import IndiaImg from './assets/india.png';
import { skills, JobData } from './data.js';
import { useEffect } from 'react';
const StyledCard = styled(Card)({
    height: '100%',
    borderRadius: '8px',
    background: '#FFF',
    boxShadow: '0px 2px 10px 0px rgba(0, 0, 0, 0.10)',
});

const students = [
    {
        // src: require("./assets/shahnaaz.jpg"),
        src: require('./assets/Komal.png'),
        alt: 'Student 1',
        name: "Shahnaaz",
        place: "Bangalore",
        text: "From a rural student without resources to a skilled coder at Natwest, the laptop I received from Navgurukul was the key that unlocked my potential and transformed my future."
    },
    {
        // src: require('./assets/anjali.jpg'),
        src: require('./assets/Komal.png'),
        alt: 'Student 2',
        name: "Anjali Singh",
        place: "Pune",
        text: "With a laptop as my tool, I've transitioned from a NavGurukul student to an academic intern, connecting with diverse learners across India and fostering personal growth."
    },
    {
        // src: require("./assets/riya.png"),
        src: require('./assets/Komal.png'),
        alt: 'Student 3',
        name: "Riya Kumari",
        place: "Maharashtra",
        text: "From not knowing how to use a laptop to S&P Global employee: NavGurukul's tech-enabled training launched my career in just one year."
    },
    {
        // src: require('./assets/Ziya.png'),
        src: require('./assets/Komal.png'),
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
        text: "Before, I couldn't even turn a laptop on. Now, I can't imagine a day of learning without it."
    },
];


const SocialImpactPage = () => {
    useEffect(() => {
        const element = document.getElementById('some-id');
        if (element) {
            const height = element.clientHeight;
            console.log(height);
        }
    }, []);

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
                                        src={IndiaImg}
                                        alt="Map of India"
                                        style={{ width: '100%', height: 'auto' }} // Ensure image scales correctly
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
                        <Typography variant="h6" style={styles.subtitle1}>STUDENT SPEAKS</Typography>
                        <Grid item xs={12} md={12} sx={{ mt: 4 }}>
                            <Box
                                sx={{
                                    overflow: 'hidden',
                                    position: 'relative',
                                    height: '330px',
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '100%',
                                        animation: 'scrollUp 5s linear infinite',
                                        '@keyframes scrollUp': {
                                            '0%': { transform: 'translateY(0)' },
                                            '100%': { transform: `translateY(-250px)` },
                                        },

                                    }}
                                >
                                    {students.map((student, index) => (
                                        <Box key={index} sx={{ height: '125px' }}>
                                            <Box display="flex" alignItems="center">
                                                <Box sx={{ borderRadius: '50px', overflow: 'hidden', width: '99px', height: '90px' }}>
                                                    <img
                                                        src={student.src}
                                                        alt={student.alt}
                                                        style={{ height: 'auto', width: '100%', objectFit: 'cover' }}
                                                    />
                                                </Box>

                                                <Box sx={{ ml: 3 }}>
                                                    <Typography variant="subtitle1" style={styles.subtitle1}>
                                                        {`“ ${student.text} ”`}
                                                    </Typography>
                                                    <Typography variant="body2" style={styles.body2} sx={{ mt: 2 }}>
                                                        {student.name}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    ))}
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



