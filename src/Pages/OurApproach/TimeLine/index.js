import React from 'react';
import { Grid, Box, Container, Typography } from '@mui/material';
import { container, lgContainer, styles } from './style';
import { gridItemStyle, innerBoxStyle, StepNumber } from './style';
import { steps } from "../data"
const TimeLine = () => {
    return (
        <>
            <Box style={container} paddingBottom="80px">
                <Container maxWidth="xl" style={lgContainer}>
                    <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }} sx={{ display: { xs: 'flex', lg: 'none' } }}>
                        <Grid item xs={12} lg={8} md={10} sm={10} >
                            <Typography variant="h5">Our 3D Model:</Typography>
                            <Typography variant='body1' sx={{ mt: 2 }}>Our 3D Model forms the backbone of our approach. Through this comprehensive approach, we transform e-waste into educational tools , thereby providing impact reports to our donors.</Typography>
                        </Grid>
                        {steps.map((step) => (
                            <Grid item xs={12} sm={12} md={4} key={step.number}>
                                <StepNumber sx={{ml:4}}>{step.number}</StepNumber>
                                <ul style={{ marginTop: "30px" }}>
                                    <Typography style={styles.h6}>{step.title}</Typography>
                                    {step.description.map((desc, index) => {
                                        const [boldText, normalText] = desc.split(':');
                                        return (
                                            <li key={index}>
                                                <Typography>
                                                    <Typography variant='body1' component="span" sx={{ fontWeight: 'bold', fontWeight: 700 }}>
                                                        {boldText}:
                                                    </Typography>
                                                    {normalText}
                                                </Typography>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </Grid>
                        ))}
                    </Grid>

                    <Grid container spacing={2} sx={{ display: { xs: 'none', lg: 'flex' }, height: "auto" }}>
                        <Box style={styles.BgImg}
                        >
                            <Grid Container marginTop="48px">
                                <Grid item xs={12} md={5} sm={12}>
                                    <Typography style={styles.h5} variant="">Our 3D Model:</Typography>
                                    <Typography variant='body1' sx={{ mt: 2 }}>Our 3D Model forms the backbone of our approach. Through this comprehensive approach,
                                        we transform e-waste into educational tools , thereby providing impact reports to our donors.</Typography>
                                </Grid>
                            </Grid>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={4} sm={12} >
                                </Grid>
                                <Grid item xs={12} md={5} sm={12}>
                                    <Box sx={gridItemStyle} >
                                        <Box sx={innerBoxStyle}>
                                            <Typography style={styles.h6} sx={{ mt: 2 }}>
                                                {steps[0].title}
                                            </Typography>
                                            <ul>
                                                {steps[0].description.map((desc, idx) => {
                                                    const [boldText, normalText] = desc.split(':');
                                                    return (
                                                        <li>
                                                            <Typography variant='body1'>
                                                                <Typography component="span" sx={{ fontWeight: 'bold', fontWeight: 700 }}>
                                                                    {boldText}:
                                                                </Typography>
                                                                {normalText}
                                                            </Typography>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid item md={4} sm={3}></Grid>
                            </Grid>
                            <Grid container spacing={3}>
                                <Grid item md={5} sm={2}></Grid>
                                <Grid item xs={12} md={6} sm={10} style={styles.gridContainer}>
                                    <Box sx={gridItemStyle}>
                                        <Box sx={innerBoxStyle}>
                                            <Typography style={styles.h6}>
                                                {steps[1].title}
                                            </Typography>
                                            <ul>
                                                {steps[1].description.map((desc, idx) => {
                                                    const [boldText, normalText] = desc.split(':');
                                                    return (
                                                        <li>
                                                            <Typography variant='body1'>
                                                                <Typography variant='' component="span" sx={{ fontWeight: 'bold', fontWeight: 700 }}>
                                                                    {boldText}:
                                                                </Typography>
                                                                {normalText}
                                                            </Typography>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>
                            <Grid container spacing={3}>
                                <Grid item md={3} sm={2}></Grid>
                                <Grid item xs={12} md={5} sm={7} style={styles.gridContainerSecond}>
                                    <Box sx={gridItemStyle} >
                                        <Box sx={innerBoxStyle}>
                                            <Typography style={styles.h6}>
                                                {steps[2].title}
                                            </Typography>
                                            <ul>
                                                {steps[2].description.map((desc, idx) => {
                                                    const [boldText, normalText] = desc.split(':');
                                                    return (
                                                        <li>
                                                            <Typography variant='body1'>
                                                                <Typography component="span" sx={{ fontWeight: 'bold', fontWeight: 700 }}>
                                                                    {boldText}:
                                                                </Typography>
                                                                {normalText}
                                                            </Typography>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid item md={5} sm={4}></Grid>
                            </Grid>
                        </Box>
                    </Grid>
                </Container>
            </Box>
        </>
    );
};

export default TimeLine;


