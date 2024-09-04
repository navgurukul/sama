import React, { useEffect, useState } from "react";
import { styled } from '@mui/material/styles';
import WaterContaminationLogo from "./assets/WaterContaminationLogo.png";
import lifecycleLogo from "./assets/lifecycleLogo.png";


import { TypographySubtitle1, TypographyTitle, TypographyBody2, TypographyAmountText, Typographyh5 } from "./style";
import {
    Typography,
    Grid,
    Card,
    CardContent,
} from '@mui/material';
import { Box } from "@mui/system";

const StyledCard = styled(Card)({
    borderRadius: '8px',
    background: '#FFF',
    boxShadow: '0px 2px 10px 0px rgba(0, 0, 0, 0.10)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
});

const EnvironmenttalImpact = ({data}) => {
    
    return (
        <>
            <Grid container spacing={3} mt={1}
            >
                <Grid item xs={12} md={4}>
                    <StyledCard>
                        <CardContent sx={{ p: 3 }}>
                            <TypographySubtitle1>
                                KEY INSIGHTS
                            </TypographySubtitle1>
                            <TypographyTitle sx={{ mt: 1 }}>
                                <b>Highest Impact Area:</b> Plastic with 1956 kg of waste reduced and lead with 5705 grams of seepage reduced have the highest impact in their respective categories. It indicates a significant opportunity for cost savings and enhanced brand reputation.
                            </TypographyTitle>
                            <TypographyTitle mt={2}>
                                <b>Resource Optimization:</b> Plastic waste reduction of 1222.5 kg (62.5%) and lead seepage reduction of 5705 grams (81.2%) have the highest percentage in their respective categories, suggesting a high impact on future environmental sustainability and optimization.
                            </TypographyTitle>
                        </CardContent>
                    </StyledCard>
                </Grid>
                <Grid item xs={12} md={4}>
                    <StyledCard >
                        <CardContent sx={{ p: 3 }}>
                            <TypographySubtitle1>IMPACT GENERATED</TypographySubtitle1>
                            <TypographyTitle sx={{ mt: 1 }}>
                                <b>Cost Savings:</b> Estimated cost savings of ₹23 lakhs to ₹32 lakhs from resource waste, toxic waste seepage, and carbon footprint reduction.
                            </TypographyTitle>

                            <TypographyTitle mt={2}>
                                <b>Enhanced Brand Reputation:</b> These actions generate influence in public and can lead to a 5% to 10% increase in brand value (approximate) and a 3% to 5% increase in customer retention (approximate).
                            </TypographyTitle>
                        </CardContent>
                    </StyledCard>
                </Grid>
                <Grid item xs={12} md={4}>
                    <StyledCard>
                        <CardContent sx={{ p: 3 }}>
                            <TypographySubtitle1>RESOURCE WASTE REDUCTION</TypographySubtitle1>
                            <TypographyAmountText sx={{ mt: 1 }}>{data && data["Resource Waste Reduction"]} Kg</TypographyAmountText>
                            <TypographyTitle sx={{ mt: 1 }}>
                                <b>Material wise breakup (Kg)</b>
                            </TypographyTitle>
                            <Typography component='div'
                                style={{ display: 'flex', justifyContent: 'space-between', }}
                            >
                                <TypographyBody2>Plastic</TypographyBody2>
                                <TypographyBody2>{data?.Plastic} kg</TypographyBody2>

                            </Typography>
                            <Typography component='div'
                                style={{ display: 'flex', justifyContent: 'space-between' }}
                            >
                                <TypographyBody2>Aluminium</TypographyBody2>
                                <TypographyBody2>{data?.Aluminium} kg</TypographyBody2>

                            </Typography>
                            <Typography component='div'
                                style={{ display: 'flex', justifyContent: 'space-between' }}
                            >
                                <TypographyBody2>Copper</TypographyBody2>
                                <TypographyBody2>{data?.Copper} kg</TypographyBody2>

                            </Typography>
                            <Typography component='div'
                                style={{ display: 'flex', justifyContent: 'space-between' }}
                            >
                                <TypographyBody2>Gold</TypographyBody2>
                                <TypographyBody2>{data?.Gold} kg</TypographyBody2>

                            </Typography>
                            <Typography component='div'
                                style={{ display: 'flex', justifyContent: 'space-between' }}
                            >
                                <TypographyBody2>Silver</TypographyBody2>
                                <TypographyBody2>{data?.Silver} kg</TypographyBody2>

                            </Typography>
                            
                        </CardContent>
                    </StyledCard>
                </Grid>
                <Grid item xs={12} md={4}>
                    <StyledCard>
                        <CardContent sx={{ p: 3 }}>
                            <TypographySubtitle1>TOXIC WASTE SEEPAGE REDUCTION</TypographySubtitle1>
                            <TypographyAmountText sx={{ mt: 1 }}>{data && data["Toxic Waste Seepage Reduction"]} g</TypographyAmountText>
                            <TypographyTitle sx={{ mt: 1 }}>
                            
                                <b> Waste wise breakup (grams)</b>
                            </TypographyTitle>
                            <Typography component='div' style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <TypographyBody2>Lead</TypographyBody2>
                                <TypographyBody2>{data?.Lead} g</TypographyBody2>
                            </Typography>
                            <Typography component='div' style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <TypographyBody2>Mercury</TypographyBody2>
                                <TypographyBody2>{data?.Mercury} g</TypographyBody2>
                            </Typography>
                            <Typography component='div' style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <TypographyBody2>Cadmium</TypographyBody2>
                                <TypographyBody2>{data?.Cadmium} g</TypographyBody2>
                            </Typography>
                            <Typography component='div' style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <TypographyBody2>Chromium</TypographyBody2>
                                <TypographyBody2>{data?.Chromium} g</TypographyBody2>
                            </Typography>
                        </CardContent>
                    </StyledCard>
                </Grid>
                <Grid item xs={12} md={4}>
                    <StyledCard sx={{height:"auto"}}>
                        <CardContent sx={{p: 3}}>
                            <TypographySubtitle1>CARBON FOOTPRINT REDUCTION</TypographySubtitle1>
                            <TypographyAmountText sx={{ mt: 1 }}>{data && data["Carbon Footprint Reduction"]} Tons</TypographyAmountText>
                            <TypographyBody2>
                                Approximate CO2 amount prevented from entering into the atmosphere.
                            </TypographyBody2>
                        </CardContent>
                    </StyledCard>
                </Grid>

                <Grid item xs={12} md={4}>
                    <CardContent sx={{ p: 3 }}>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Typographyh5 sx={{ ml: 2 }}>Did you know?</Typographyh5>
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                <Grid item xs={3}>
                                    <img src={WaterContaminationLogo} alt="Water Contamination Logo" />
                                </Grid>
                                <Grid item xs={8} sx={{ ml: 2 }}>
                                    <Typographyh5>Upto 2,00,000 litres</Typographyh5>
                                    <TypographyBody2>
                                        of water contamination prevented by diverting waste from landfills.
                                    </TypographyBody2>
                                </Grid>
                            </Grid>
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                <Grid item xs={3}>
                                    <img src={lifecycleLogo} alt="Lifecycle Logo" />
                                </Grid>
                                <Grid item xs={8} sx={{ ml: 3 }}>
                                    <Typographyh5>5 to 6 Years</Typographyh5>
                                    <TypographyBody2>
                                        Average lifecycle extension of your donated hardware with Sama.
                                    </TypographyBody2>
                                </Grid>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Grid>
            </Grid>
        </>
    );
};

export default EnvironmenttalImpact;