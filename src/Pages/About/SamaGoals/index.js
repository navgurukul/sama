
import React from 'react';
import { Container, Typography, Grid, Box } from '@mui/material';
import women from "./assets/woman.png";
import renewable from "./assets/renewable.png";
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
        <Box sx={{
            mt:15,
            background: "var(--gray-light, #E0E0E0)"
        }}
        >
            <Container maxWidth="xl" sx={{ mt: 3,p:10}}>
                <Typography variant="h5" >
                    <b>This is how Sama was born,</b> <span style={{ fontWeight: 500 }}>with two simple but audacious</span> <b>goals:</b>
                </Typography>
                <Grid container
                    spacing={2}
                    sx={{ mt: 4 }}
                >
                    {goals.map((goal, index) => (
                        <Grid item xs={12} sm={6} md={6} key={index}>
                            <Box
                                sx={{
                                    padding: {
                                        xs: '0 10px',
                                        sm: '0 20px',
                                        md: "10px"
                                    }
                                }}
                            >
                                <img
                                    src={goal.icon}
                                    style={samaGoalsStyles.gridItem.img}
                                    alt="Woman"
                                />
                                <Typography
                                    sx={{ mt: 4 }}
                                    style={samaGoalsStyles.subtitle}
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