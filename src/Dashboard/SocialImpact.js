import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { styles } from "./style";
import { Container, styled } from '@mui/system';
import IndiaImg from './assets/india.png';
import { skills, JobData } from './data.js';
import Avatar from '@mui/material/Avatar';

import { useEffect, useState, useRef } from 'react';
const StyledCard = styled(Card)({
    height: '100%',
    borderRadius: '8px',
    background: '#FFF',
    boxShadow: '0px 2px 10px 0px rgba(0, 0, 0, 0.10)',
});
const students = [
    {
        src: require('./assets/Komal.png'),
        name: "Komal Chaudhary (NavGurukul Student)",
        width: "99px",
        height: "99px",
        text: "Before, I couldn't even turn a laptop on. Now, I can't imagine a day of learning without it",
    },
    {
        src: require('./assets/ZiyaImg .png'),
        name: "Ziya Afreen (NavGurukul Student)",
        width: "99px",
        height: "99px",
        text: "This laptop isn't just a tool. It is my bridge from being a novice to a full-fledged future software developer",
    },
    {
        src: require('./assets/shahnaaz.jpg'),
        name: "shahnaaz (NavGurukul Student)",
        width: "99px",
        height: "99px",
        text: "From a rural student without resources to a skilled coder at Natwest, the laptop I received from Navgurukul was the key that unlocked my potential and transformed my future."
    },
    {
        src: require('./assets/riya.png'),
        name: "Riya kumari (NavGurukul Student)",
        width: "99px",
        height: "99px",
        text: "From not knowing how to use a laptop to S&P Global employee: NavGurukul's tech-enabled training launched my career in just one year."
    },
    {
        src: require('./assets/anjali.jpg'),
        name: "anjali Singh (NavGurukul Student)",
        width: "99px",
        height: "99px",
        text: "With a laptop as my tool, I've transitioned from a NavGurukul " +
            "student to an academic intern, connecting with diverse learners across India and fostering personal growth."
    },



];

const SocialImpactPage = ({data}) => {
    const [isScrolling, setIsScrolling] = useState(true);
    const [currentY, setCurrentY] = useState(0);
    const containerRef = useRef(null);

    useEffect(() => {
        let animationFrame;
        const step = () => {
            if (isScrolling) {
                setCurrentY(prevY => {
                    const nextY = prevY - 1;
                    const containerHeight = containerRef.current.clientHeight;
                    const contentHeight = containerRef.current.scrollHeight / 2;
                    if (Math.abs(nextY) >= contentHeight) {
                        return 0;
                    }
                    containerRef.current.style.transform = `translateY(${nextY}px)`;
                    return nextY;
                });
            }
            animationFrame = requestAnimationFrame(step);
        };
        animationFrame = requestAnimationFrame(step);
        return () => cancelAnimationFrame(animationFrame);
    }, [isScrolling]);

    const handleMouseEnter = () => {
        setIsScrolling(false);
    };

    const handleMouseLeave = () => {
        setIsScrolling(true);
    };
    return (
        <>
            <Container maxWidth="xl">
                <Grid container spacing={3} sx={{ mt: 1 }}>
                    {JobData.map((item, index) => (
                        <Grid item xs={12} md={2.4} key={index}
                        >
                            <StyledCard sx={{ p: 1 }}>
                                <CardContent>
                                    <Typography variant="subtitle1" style={styles.subtitle1}>{item.title}</Typography>
                                    <Typography style={styles.h5} variant="h5" color="primary" sx={{ mt: 1 }}>{item.number}</Typography>
                                    <Typography style={styles.body2} sx={{ width: { lg: "200px" }, mt: 2 }}>{item.description}</Typography>
                                </CardContent>
                            </StyledCard>
                        </Grid>
                    ))}
                </Grid>
                <Grid container spacing={1} mt={4}>
                    <Grid item xs={12} md={6}>
                        <StyledCard>
                            <CardContent sx={{ p: 3 }}>
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
                                            style={{ width: '100%', height: 'auto' }}
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
                            <Typography variant="h6" style={styles.subtitle1}>
                                STUDENT SPEAKS
                            </Typography>
                            <Grid item xs={12} md={12} sx={{ mt: 4 }}>
                                <Box
                                    sx={{
                                        overflow: 'hidden',
                                        position: 'relative',
                                        height: '220px',
                                    }}
                                    onMouseEnter={handleMouseEnter}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <Box
                                        ref={containerRef}
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            height: '100%',
                                            transform: `translateY(${currentY}px)`,
                                        }}
                                    >
                                        {[...students, ...students].map((student, index) => (
                                            <Box key={index}>
                                                <Box display="flex" alignItems="center">
                                                    <Box
                                                    >
                                                        <Avatar
                                                            alt="Remy Sharp"
                                                            src={student.src}
                                                            style={{
                                                                width: student.width,
                                                                height: student.height,
                                                                marginRight: '8px',
                                                            }}
                                                        >
                                                            B
                                                        </Avatar>
                                                    </Box>
                                                    <Box sx={{ ml: 3, mt: 3 }}>
                                                        <Typography variant="subtitle1" style={styles.subtitle1}>
                                                            {`"${student.text}"`}
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            style={styles.body2}
                                                            sx={{ mt: 2 }}
                                                        >
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
            </Container>
        </>
    );
};

export default SocialImpactPage;