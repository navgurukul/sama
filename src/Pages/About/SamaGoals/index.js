
import React from 'react';
import { Container, Typography, Grid, Box } from '@mui/material';
import women from "./assets/woman.png";
import renewable from "./assets/renewable.png"
import samaGoalsStyles from './style';
const goals = [
    {
        icon: renewable,
        title: "Ensure no electronic waste, such as a computer ends up in a landfill.",
    },
    {
        icon: women,
        title: "Provide every underserved but deserving woman with access to digital technology to learn, grow and thrive.",
    },
];

const SamaGoals = () => {
    return (
        <Box sx={samaGoalsStyles.boxContainer}>
            <Container maxWidth="lg" sx={samaGoalsStyles.container} >
                <Typography variant="h5" sx={samaGoalsStyles.titleText}>
                    <b>This is how Sama was born,</b> with two simple but audacious <b>goals:</b>
                </Typography>
                <Grid container
                    spacing={2}
                    sx={samaGoalsStyles.gridContainer}>
                    {goals.map((goal, index) => (
                        <Grid item xs={12} sm={6} md={6} key={index}>
                            <Box
                                sx={{ padding: { xs: '0 10px', sm: '0 20px', md: "10px 10px 0px 10px" } }}
                            >
                                <Box
                                    sx={{
                                        padding: "10px",
                                        width: "64px",
                                        height: "64px",
                                        background: "rgba(92, 120, 90, 1)",
                                        borderRadius: "100px",
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden' 
                                    }}
                                >
                                    <img
                                        src={goal.icon}
                                        alt="Woman"
                                        style={{ width: "50px", height: "50px" }} 
                                    />
                                </Box>


                                <Typography
                                    sx={{ mt: 2 }}
                                    variant='body1'
                                >
                                    {goal.title}
                                </Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};
export default SamaGoals;