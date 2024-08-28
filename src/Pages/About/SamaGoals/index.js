import React from 'react';
import { Container, Typography, Grid, Box } from '@mui/material';
import women from "./assets/woman.png";
import renewable from "./assets/renewable.png";
import classes from './style'; 

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
        <Box
            
            sx={classes.BackgroundStyle} 
        >
            <Container maxWidth="xl">
                <Typography variant="h5" >
                    <b>This is how Sama was born,</b> <span>with two simple but audacious</span> <b>goals:</b>
                </Typography>
                <Grid container
                    spacing={2}
                    sx={{ mt: 4 }}
                >
                    {goals.map((goal, index) => (
                        <Grid item xs={12} sm={6} md={6} key={index}>
                            <Box
                            >
                                <img
                                    src={goal.icon}
                                    style={classes.img} 
                                    alt="Icon" 
                                />
                                <Typography
                                    sx={{ mt: 4 }}
                                    variant='subtitle1'
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
