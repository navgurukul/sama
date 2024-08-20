import React from "react";
import { styled } from '@mui/material/styles';
import WaterContaminationLogo from "./assets/WaterContaminationLogo.png";
import lifecycleLogo from "./assets/lifecycleLogo.png";
import { data } from "./data";
import {
    Typography,
    Grid,
    Card,
    CardContent,
} from '@mui/material';
const StyledCard = styled(Card)({
    borderRadius: '8px',
    background: '#FFF',
    boxShadow: '0px 2px 10px 0px rgba(0, 0, 0, 0.10)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
});

const EnvironmentalImpact = () => {
    return (
        <>
            <>
                <Grid container spacing={3} sx={{ p: 2}}>
                    <Grid item xs={12} md={4} >
                        <StyledCard >
                            <CardContent sx={{ p: 4 }}>
                                <Typography variant="subtitle1"  sx={{ fontWeight: 700 }}>
                                    KEY INSIGHTS
                                </Typography>
                                <Typography variant="body1" sx={{ mt: 2 }}>
                                    <b>Highest Impact Area:</b> Plastic with 1956 kg of waste reduced and lead with 5705 grams of seepage reduced have the highest impact in their respective categories. It indicates a significant opportunity for cost savings and enhanced brand reputation.
                                </Typography>

                                <Typography variant="body1" mt={2}>
                                    <b>Resource Optimization:</b> Plastic waste reduction of 1222.5 kg (62.5%) and lead seepage reduction of 5705 grams (81.2%) have the highest percentage in their respective categories, suggesting a high impact on future environmental sustainability and optimization.
                                </Typography>
                            </CardContent>
                        </StyledCard>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <StyledCard >
                            <CardContent sx={{ p: 5 }} className="body2">
                                <Typography sx={{ fontWeight: 700 }}>IMPACT GENERATED</Typography>
                                <Typography variant="body1" sx={{ mt: 2 }}>
                                    <b>Cost Savings:</b> Estimated cost savings of ₹23 lakhs to ₹32 lakhs from resource waste, toxic waste seepage, and carbon footprint reduction.
                                </Typography>

                                <Typography variant="body1" mt={2}>
                                    <b>Enhanced Brand Reputation:</b> These actions generate influence in public and can lead to a 5% to 10% increase in brand value (approximate) and a 3% to 5% increase in customer retention (approximate).
                                </Typography>
                            </CardContent>
                        </StyledCard>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <StyledCard>
                            <CardContent sx={{ p: 4 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>RESOURCE WASTE REDUCTION</Typography>
                                <Typography variant="h5" sx={{ mt: 2 }}>1956 Kg</Typography>
                                <Typography sx={{ mt: 1 }}>
                                    <b>Material wise breakup (Kg)</b>
                                </Typography>
                                {Object.entries(data.wasteBreakup).map(([material, amount]) => (
                                    <Typography key={material} variant="body2" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography>{material}</Typography>
                                        <Typography>{amount} kg</Typography>
                                    </Typography>
                                ))}
                            </CardContent>
                        </StyledCard>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <StyledCard sx={{width:{lg:"(437.33px)"}}}>
                            <CardContent sx={{ p: 4 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>TOXIC WASTE SEEPAGE REDUCTION</Typography>
                                <Typography variant="h5" sx={{ mt: 2 }}>7009 g</Typography>
                                <Typography variant="body1" sx={{ mt: 1 }}>
                                    <b>Waste wise breakup (grams)</b>
                                </Typography>
                                {Object.entries(data.toxicWasteBreakup).map(([material, amount]) => (
                                    <Typography key={material} variant="body1" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body1">{material}</Typography>
                                        <Typography variant="body1">{amount} kg</Typography>
                                    </Typography>
                                ))}
                            </CardContent>
                        </StyledCard>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <StyledCard sx={{ height: { lg: "250px" } }}>
                            <CardContent sx={{ p: 5 }} >
                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                    CARBON FOOTPRINT REDUCTION
                                </Typography>
                                <Typography variant="h5" sx={{ mt: 2 }}>
                                    326 Tons
                                </Typography>
                                <Typography
                                    variant="body1" sx={{ mt: 2 }}
                                >
                                    Approximate CO2 amount prevented from entering into the atmosphere.
                                </Typography>
                            </CardContent>
                        </StyledCard>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <CardContent sx={{ p: 4 }}>
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                <Typography
                                    sx={{
                                        ml: 2,
                                        color: 'var(--text, #4A4A4A)',
                                        fontFamily: 'Montserrat',
                                        fontSize: '24px',
                                        fontStyle: 'normal',
                                        fontWeight: 700,
                                        lineHeight: '130%',
                                    }}

                                >Did you know?</Typography>
                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                    <Grid item xs={3}>
                                        <img src={WaterContaminationLogo} alt="Water Contamination Logo" />
                                    </Grid>
                                    <Grid item xs={8}>
                                        <Typography
                                            sx={{
                                                color: 'var(--text, #4A4A4A)',
                                                fontFamily: 'Montserrat',
                                                fontSize: '24px',
                                                fontStyle: 'normal',
                                                fontWeight: 700,
                                                lineHeight: '130%',
                                            }}
                                        >5 to 6 Years</Typography>
                                        <Typography variant="body1" sx={{ mt: 2 }}>
                                            Average lifecycle extension of your donated hardware with Sama.
                                        </Typography>
                                    </Grid>
                                </Grid>
                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                    <Grid item xs={3}>
                                        <img src={lifecycleLogo} alt="Lifecycle Logo" />
                                    </Grid>
                                    <Grid item xs={8} >
                                        <Typography
                                            sx={{
                                                color: 'var(--text, #4A4A4A)',
                                                fontFamily: 'Montserrat',
                                                fontSize: '24px',
                                                fontStyle: 'normal',
                                                fontWeight: 700,
                                                lineHeight: '130%',
                                            }}
                                        >5 to 6 Years</Typography>
                                        <Typography variant="body1" sx={{ mt: 2 }}>
                                            Average lifecycle extension of your donated hardware with Sama.
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Grid>
                </Grid>
            </>
        </>
    );
};

export default EnvironmentalImpact;
