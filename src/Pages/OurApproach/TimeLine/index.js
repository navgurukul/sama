import React from 'react';
import { Grid, Box, Container, Typography } from '@mui/material';
import { StepNumber, StepTitle, StepDescription, container, lgContainer, h6, styles } from './style';
import { boxStyle, gridItemStyle, innerBoxStyle } from './style';
import { steps } from "../data"
const TimeLine = () => {
    return (
        <>
            <Container maxWidth="xxl" style={container}>
                <Container maxWidth="lg" style={lgContainer}>
                    <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }} sx={{ display: { xs: 'flex', lg: 'none' } }}>
                        <Grid item xs={12} lg={8} md={10} sm={10} >
                            <Typography style={styles.h5} variant="">Our 3D Model:</Typography>
                            <Typography >Our 3D Model forms the backbone of our approach. Through this comprehensive approach, we transform e-waste into educational tools , thereby providing impact reports to our donors.</Typography>
                        </Grid>
                        {steps.map((step) => (
                            <Grid item xs={12} sm={12} md={4} key={step.number}>
                                <StepNumber sx={{ ml: 4 }}>{step.number}</StepNumber>
                                <ul style={{ marginTop: "30px" }}>
                                    <StepTitle>{step.title}</StepTitle>
                                    {step.description.map((desc, index) => {
                                        const [boldText, normalText] = desc.split(':');
                                        return (
                                            <li key={index}>
                                                <StepDescription>
                                                    <Typography component="span" sx={{ fontWeight: 'bold', fontWeight: 700 }}>
                                                        {boldText}:
                                                    </Typography>
                                                    {normalText}
                                                </StepDescription>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </Grid>
                        ))}
                    </Grid>

                    <Grid container spacing={2} sx={{ display: { xs: 'none', lg: 'flex' }, height: "1200px" }}>
                        <Box sx={boxStyle}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} lg={8} sm={12} style={{ position: "relative", right: "180px" }}>
                                    <Typography style={styles.h5} variant="">Our 3D Model:</Typography>
                                    <Typography >Our 3D Model forms the backbone of our approach. Through this comprehensive approach, we transform e-waste into educational tools , thereby providing impact reports to our donors.</Typography>
                                </Grid>
                                <Grid item xs={12} lg={7} sm={12} sx={{ position: "relative", left: "100px", bottom: "80px" }}>
                                    <Box sx={gridItemStyle}>
                                        <Box sx={innerBoxStyle}>
                                            <StepTitle style={h6} variant="h6" sx={{ mt: 3 }}>
                                                {steps[0].title}
                                            </StepTitle>
                                            <ul>
                                                {steps[0].description.map((desc, idx) => {
                                                    const [boldText, normalText] = desc.split(':');
                                                    return (
                                                        <li>
                                                            <StepDescription>
                                                                <Typography component="span" sx={{ fontWeight: 'bold', fontWeight: 700 }}>
                                                                    {boldText}:
                                                                </Typography>
                                                                {normalText}
                                                            </StepDescription>
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
                                <Grid item md={3} sm={2}></Grid>
                                <Grid item xs={12} lg={11} sm={10} sx={{ position: "relative", bottom: "150px", left: "210px" }}>
                                    <Box sx={gridItemStyle}>
                                        <Box sx={innerBoxStyle}>
                                            <StepTitle>
                                                {steps[1].title}
                                            </StepTitle>
                                            <ul>
                                                {steps[1].description.map((desc, idx) => {
                                                    const [boldText, normalText] = desc.split(':');
                                                    return (
                                                        <li>
                                                            <StepDescription>
                                                                <Typography variant='subtitle1' component="span" sx={{ fontWeight: 'bold', fontWeight: 700 }}>
                                                                    {boldText}:
                                                                </Typography>
                                                                {normalText}
                                                            </StepDescription>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={7} sm={7} style={{ position: "relative", bottom: "200px", right: "30px" }}>
                                    <Box sx={gridItemStyle} >
                                        <Box sx={innerBoxStyle}>
                                            <StepTitle variant='h6'>
                                                {steps[2].title}
                                            </StepTitle>
                                            <ul>
                                                {steps[2].description.map((desc, idx) => {
                                                    const [boldText, normalText] = desc.split(':');
                                                    return (
                                                        <li>
                                                            <StepDescription>
                                                                <Typography component="span" sx={{ fontWeight: 'bold', fontWeight: 700 }}>
                                                                    {boldText}:
                                                                </Typography>
                                                                {normalText}
                                                            </StepDescription>
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
            </Container>
        </>
    );
};

export default TimeLine;

