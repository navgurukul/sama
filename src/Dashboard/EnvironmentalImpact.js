import React from "react";
import { styled } from '@mui/material/styles';
import WaterContaminationLogo from "./assets/WaterContaminationLogo.png";
import lifecycleLogo from "./assets/lifecycleLogo.png";
import { data } from "./data";
import { styles } from "./style"
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

const EnvironmenttalImpact = () => {
    return (
        <>
            <Grid container spacing={3} mt={1}
            >
                <Grid item xs={12} md={4}>
                    <StyledCard>
                        <CardContent>
                            <Typography variant="subtitle1">
                                KEY INSIGHTS
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                <b>Highest Impact Area:</b> Plastic with 1956 kg of waste reduced and lead with 5705 grams of seepage reduced have the highest impact in their respective categories. It indicates a significant opportunity for cost savings and enhanced brand reputation.
                            </Typography>
                            <Typography mt={2} variant="body2">
                                <b>Resource Optimization:</b> Plastic waste reduction of 1222.5 kg (62.5%) and lead seepage reduction of 5705 grams (81.2%) have the highest percentage in their respective categories, suggesting a high impact on future environmental sustainability and optimization.
                            </Typography>
                        </CardContent>
                    </StyledCard>
                </Grid>
                <Grid item xs={12} md={4}>
                    <StyledCard>
                        <CardContent>
                            <Typography variant="subtitle1">IMPACT GENERATED</Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                <b>Cost Savings:</b> Estimated cost savings of ₹23 lakhs to ₹32 lakhs from resource waste, toxic waste seepage, and carbon footprint reduction.
                            </Typography>
                            <Typography variant="body2" mt={2}>
                                <b>Enhanced Brand Reputation:</b> These actions generate influence in public and can lead to a 5% to 10% increase in brand value (approximate) and a 3% to 5% increase in customer retention (approximate).
                            </Typography>
                        </CardContent>
                    </StyledCard>
                </Grid>
                <Grid item xs={12} md={4}>
                    <StyledCard>
                        <CardContent>
                            <Typography variant="subtitle1">RESOURCE WASTE REDUCTION</Typography>
                            <Typography variant="h5" sx={{ mt: 1 }}>1956 Kg</Typography>
                            <Typography sx={{ mt: 1 }}>
                                <b>Material wise breakup (Kg)</b>
                            </Typography>
                            {Object.entries(data.wasteBreakup).map(([material, amount]) => (
                                <Typography key={material} variant="body2" style={{ display: 'flex', justifyContent: 'space-between' ,marginTop:"10px"}}>
                                    <Typography variant="body2">{material}</Typography>
                                    <Typography variant="body2">{amount} kg</Typography>
                                </Typography>
                            ))}
                        </CardContent>
                    </StyledCard>
                </Grid>
                <Grid item xs={12} md={4}>
                    <StyledCard>
                        <CardContent>
                            <Typography variant="subtitle1">TOXIC WASTE SEEPAGE REDUCTION</Typography>
                            <Typography variant="h5" sx={{ mt: 1 }}>7009 g</Typography>
                            <Typography sx={{ mt: 1 }} variant="subtitle2">
                                <b>Waste wise breakup (grams)</b>
                            </Typography>
                            {Object.entries(data.toxicWasteBreakup).map(([material, amount]) => (
                                <Typography key={material} variant="body2" style={{ display: 'flex', justifyContent: 'space-between',marginTop:"20px" }}>
                                    <Typography variant="body2">{material}</Typography>
                                    <Typography variant="body2">{amount} kg</Typography>
                                </Typography>
                            ))}
                        </CardContent>
                    </StyledCard>
                </Grid>
                <Grid item xs={12} md={4}>
                    <StyledCard sx={{ height: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <CardContent>
                            <Typography variant="subtitle1">CARBON FOOTPRINT REDUCTION</Typography>
                            <Typography variant="h5" sx={{ mt: 1 }}>326 Tons</Typography>
                            <Typography variant="body2">
                                Approximate CO2 amount prevented from entering into the atmosphere.
                            </Typography>
                        </CardContent>
                    </StyledCard>
                </Grid>

                <Grid item xs={12} md={4}>
                    <CardContent>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Typography variant="h6" sx={{ ml: 2 }}>Did you know?</Typography>
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                <Grid item xs={3}>
                                    <img src={WaterContaminationLogo} alt="Water Contamination Logo" />
                                </Grid>
                                <Grid item xs={8} sx={{ ml: 2 }}>
                                    <Typography style={styles.h6}>5 to 6 Years</Typography>
                                    <Typography variant="body2" sx={{ mt: 2 }}>
                                        Average lifecycle extension of your donated hardware with Sama.
                                    </Typography>
                                </Grid>
                            </Grid>
                            <Grid container spacing={2}>
                                <Grid item xs={3}>
                                    <img src={lifecycleLogo} alt="Lifecycle Logo" />
                                </Grid>
                                <Grid item xs={8} sx={{ ml: 3 }}>
                                    <Typography sx={styles.h6} >5 to 6 Years</Typography>
                                    <Typography variant="body2" sx={{ mt: 2 }}>
                                        Average lifecycle extension of your donated hardware with Sama.
                                    </Typography>
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
