import React from 'react';
import { Container, List, ListItem, ListItemText, Typography, Grid, Card, Button, Box } from '@mui/material';
import { classes } from "./style";

const messages = [
    {
        id: 1,
        primary: "NGO ID",
        secondaryText: "NG12345",
    },
    {
        id: 2,
        primary: "Point Of Contact",
        secondaryText: "Anjali Garg",
    },
    {
        id: 3,
        primary: "Contact Number",
        secondaryText: "+91 9810 222 333",
    },
    {
        id: 4,
        primary: "Email Id",
        secondaryText: "anjali@giveindia.com",
    },
    {
        id: 5,
        primary: "State of Operation",
        secondaryText: "Bangalore",
    },
    {
        id: 6,
        primary: "Operation Type",
        secondaryText: "Urban",
    },
    {
        id: 7,
        primary: "Work with Underprivileged Women",
        secondaryText: "Yes",
    },
    {
        id: 8,
        primary: "Years of Operation",
        secondaryText: "2-5 years",
    }
];


const LaptopAcquisitionPlan = [
    {
        id: 1,
        primary: "Selection Criteria",
        secondaryText: "Based on educational background (dropouts or currently pursuing education)",
    },
    {
        id: 2,
        primary: "Number Of Required Laptops",
        secondaryText: "150",
    },
    {
        id: 3,
        primary: "Age group of beneficiaries",
        secondaryText: "22-30 years (seeking employment)",
    },
    {
        id: 4,
        primary: "Primary Purpose",
        secondaryText: "Completing education (school or college)",
    },
    {
        id: 5,
        primary: "Expected Outcome",
        secondaryText: "Securing part-time employment or freelance work.",
    },
    {
        id: 6,
        primary: "Strategy for usage tracking",
        secondaryText: "Progress reports from beneficiaries",
    },
    {
        id: 7,
        primary: "Job Anticipation for next year",
        secondaryText: "30-50",
    },
    {
        id: 8,
        primary: "Undertaken Similar Projects",
        secondaryText: "Yes, but on a smaller scale",
    },
    {
        id: 9,
        primary: "Staff Support",
        secondaryText: "Yes, dedicated staff for digital literacy/employment",
    }
];
const NGODetails = () => {
    return (
        <Container>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: "48px" }}>
                <Grid container spacing={2} sx={{ display: { xs: 'flex', md: 'none' } }}>
                    <Grid item xs={12}>
                        <Button variant="contained" color="primary" sx={{ ...classes.NGODetailsBtn }}>
                            NGO Details
                        </Button>
                    </Grid>
                    <Grid item xs={12}>
                        <Button variant="outlined" sx={{ ...classes.Uploaded }}>
                            Uploaded Documents
                        </Button>
                    </Grid>
                    <Grid item xs={12}>
                        <Button variant="outlined" sx={classes.Uploaded}>
                            Beneficiary Data
                        </Button>
                    </Grid>
                </Grid>

                <Box sx={classes.buttonContainer}>
                    <Button variant="contained" color="primary" sx={{ ...classes.NGODetailsBtn }}>
                        NGO Details
                    </Button>
                    <Button variant="outlined" sx={{ ...classes.Uploaded }}>
                        Uploaded Documents
                    </Button>
                    <Button variant="outlined" sx={classes.Uploaded}>
                        Beneficiary Data
                    </Button>
                </Box>
            </Box>
            <Grid container spacing={4} sx={{ mt: 3 }}>
                <Grid item xs={12} lg={6} md={6} style={{ height: 'auto' }}>
                    <Card>
                        <List sx={classes.list}>
                            <Typography variant="h6" sx={classes.title}>Give India Foundations</Typography>
                            {messages.map((message) => (
                                <ListItem key={message.id} alignItems="flex-start">
                                    <ListItemText
                                        primary={message.primary}
                                        secondary={
                                            <>
                                                <Typography
                                                    component="span"
                                                    variant="subtitle1"
                                                >
                                                    {message.secondaryText}
                                                </Typography>
                                                <Typography variant="body1" sx={{ marginTop: 1 }}>
                                                    {message.secondaryDescription}
                                                </Typography>
                                            </>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Card>

                </Grid>

                <Grid item xs={12} lg={6} md={6} >
                    <Card sx={{p:3}}>
                        <List sx={{ width: '100%', bgcolor: 'background.paper'}}>
                            <Typography variant="h6" sx={classes.title}>Laptop Acquisition Plan</Typography>
                            {LaptopAcquisitionPlan.map((message) => (
                                <ListItem key={message.id} alignItems="flex-start">
                                    <ListItemText
                                        primary={message.primary}
                                        secondary={
                                            <>
                                                <Typography
                                                    component="span"
                                                    variant="subtitle1"
                                                    style={{ color: "#828282" }}
                                                >
                                                    {message.secondaryText}
                                                </Typography>
                                                <Typography variant="body1">{message.secondaryDescription}</Typography>
                                            </>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Card>
                </Grid>
            </Grid>
        </Container >
    );
};

export default NGODetails;
