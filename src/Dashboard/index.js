import React, { useState } from 'react';
import { Grid, Typography, Button } from '@mui/material';
import SocialImpactPage from "./SocialImpact";
import EnvironmentalImpact from './EnvironmentalImpact';
import { TypographyButton, styles } from './style';
import { Container } from '@mui/system';

function DashboardPage() {
    const [activeTab, setActiveTab] = useState(0);

    const handleButtonClick = (tabIndex) => {
        setActiveTab(tabIndex);
    };

    return (
        <Container maxWidth="xxl">
            <Container maxWidth="xl">
                <Grid container spacing={2} sx={{ mt: 1 }} style={{ marginLeft: "1px" }}>
                    <Grid item xs={12} md={6} sm={12} >
                        <Typography style={styles.DigitalTitle} sx={{ width: { sm: "100%" } }}>Digital Hardware Tracker</Typography>
                        <Typography className="body1" style={styles.body1} sx={{ mt: 1 }}>
                            Monitor your e-waste management efforts with ease
                        </Typography>
                    </Grid>
                </Grid>

                <Grid container spacing={2} sx={{ mt: 1 }} style={{ marginLeft: "1px" }}>
                    <Grid item xs={12} lg={4} md={8}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} lg={6} md={6} sm={6}>
                                <Button
                                    variant="outlined"
                                    onClick={() => handleButtonClick(0)}
                                    sx={{
                                        width: { xs: '100%', sm: '80%',lg:"100%" }, // 50% on small screens, 100% on larger screens
                                        padding: '8px 16px',
                                        backgroundColor: activeTab === 0 ? 'primary.main' : 'transparent',
                                        color: activeTab === 0 ? 'white' : 'black',
                                        border: 'none',
                                        '&:hover': {
                                            backgroundColor: activeTab === 0 ? 'primary.main' : 'transparent',
                                            color: activeTab === 0 ? 'white' : 'black',
                                            border: 'none',
                                        },
                                        borderRadius: "50px",
                                    }}
                                >
                                    <TypographyButton style={{ color: activeTab === 0 ? 'white' : 'var(--text, #4A4A4A)' }}>Environmental Impact</TypographyButton>
                                </Button>
                            </Grid>
                            <Grid item xs={12} md={6} sm={6}>
                                <Button
                                    variant="outlined"
                                    onClick={() => handleButtonClick(1)}
                                    sx={{
                                        width: { xs: '100%', sm: '80%',lg:"100%" },
                                        backgroundColor: activeTab === 1 ? 'primary.main' : 'transparent',
                                        color: activeTab === 1 ? 'white' : 'black',
                                        border: 'none',
                                        '&:hover': {
                                            backgroundColor: activeTab === 1 ? 'primary.main' : 'transparent',
                                            color: activeTab === 1 ? 'white' : 'black',
                                            border: 'none',
                                        },
                                        borderRadius: "50px"
                                    }}
                                >
                                    <TypographyButton style={{ color: activeTab === 1 ? 'white' : 'var(--text, #4A4A4A)' }}>Social Impact</TypographyButton>
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>

                <Grid
                    container
                    spacing={2}
                    sx={{
                        mt: 2,
                        maxWidth: 'xl',
                        margin: '0 auto'
                    }}
                >
                    <Grid item xs={12} sm={12} md={12}>
                        {activeTab === 0 && (
                            <EnvironmentalImpact />
                        )}
                        {activeTab === 1 && (
                            <SocialImpactPage />
                        )}
                    </Grid>
                </Grid>
            </Container>
        </Container>
    );
}

export default DashboardPage;
