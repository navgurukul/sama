import React from "react";
import WaterContaminationLogo from "./assets/WaterContaminationLogo.png";
import lifecycleLogo from "./assets/lifecycleLogo.png";
import { data } from "./data";
import { clases } from "./style.js";

import {
    Typography,
    Grid,
    CardContent,
    Box
} from '@mui/material';

const EnvironmentalImpact = () => {
    return (
        <Grid container spacing={3} sx={{ p: 3 }}>
            <Grid item xs={12} md={6} lg={4}>
                <Box sx={clases.card}>
                    <CardContent sx={clases.CardContent}>
                        <Typography variant="subtitle1" color="secondary">
                            KEY INSIGHTS
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 2 }}>
                            <b>Highest Impact Area:</b> Plastic with 1956 kg of waste reduced and
                            lead with 5705 grams of seepage reduced have the highest impact in their respective categories.
                            It indicates a significant opportunity for cost savings and enhanced brand reputation.
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 2 }}>
                            <b>Resource Optimization:</b> Plastic waste reduction of 1222.5 kg (62.5%) and lead seepage
                            reduction of 5705 grams (81.2%) have the highest percentage in their respective categories,
                            suggesting a high impact on future environmental sustainability and optimization.
                        </Typography>
                    </CardContent>
                </Box>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
                <Box sx={clases.card}>
                    <CardContent sx={clases.CardContent}>
                        <Typography variant="subtitle1">IMPACT GENERATED</Typography>
                        <Typography variant="body1" sx={{ mt: 2 }}>
                            <b>Cost Savings:</b> Estimated cost savings of ₹23 lakhs to ₹32 lakhs from resource waste,
                            toxic waste seepage, and carbon footprint reduction.
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 2 }}>
                            <b>Enhanced Brand Reputation:</b> These actions generate influence in the public and can lead
                            to a 5% to 10% increase in brand value (approximate) and a 3% to 5% increase in customer retention (approximate).
                        </Typography>
                    </CardContent>
                </Box>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
                <Box sx={clases.card}>
                    <CardContent sx={clases.CardContent}>
                        <Typography variant="subtitle1">RESOURCE WASTE REDUCTION</Typography>
                        <Typography variant="h5" sx={{ mt: 2 }}>1956 Kg</Typography>
                        <Typography sx={{ mt: 1 }}><b>Material wise breakup (Kg)</b></Typography>
                        {Object.entries(data.wasteBreakup).map(([material, amount]) => (
                            <Box key={material} sx={clases.materialBox}>
                                <Typography sx={{ mt: 1 }}>{material}</Typography>
                                <Typography sx={{ mt: 1 }}>{amount} kg</Typography>
                            </Box>
                        ))}
                    </CardContent>
                </Box>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
                <Box sx={clases.card}>
                    <CardContent sx={clases.CardContent}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            TOXIC WASTE SEEPAGE REDUCTION
                        </Typography>
                        <Typography variant="h5" sx={{ mt: 2 }}>7009 g</Typography>
                        <Typography variant="body1" sx={{ mt: 1 }}>
                            <b>Waste wise breakup (grams)</b>
                        </Typography>
                        {Object.entries(data.toxicWasteBreakup).map(([material, amount]) => (
                            <Box key={material} sx={clases.materialBox}>
                                <Typography variant="body1" sx={{ mt: 1 }}>{material}</Typography>
                                <Typography variant="body1" sx={{ mt: 1 }}>{amount} g</Typography>
                            </Box>
                        ))}
                    </CardContent>
                </Box>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
                <Box sx={clases.card}>
                    <CardContent sx={clases.CardContent}>
                        <Typography variant="subtitle1">CARBON FOOTPRINT REDUCTION</Typography>
                        <Typography variant="h5" sx={{ mt: 2 }}>326 Tons</Typography>
                        <Typography variant="body1" sx={{ mt: 2 }}>
                            Approximate CO2 amount prevented from entering into the atmosphere.
                        </Typography>
                    </CardContent>
                </Box>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
                <CardContent sx={clases.CardContent}>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Typography variant="h5">Did you know?</Typography>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={3} lg={3}>
                                <img src={WaterContaminationLogo} alt="Water Contamination Logo" style={{ maxWidth: '100%', height: 'auto' }} />
                            </Grid>
                            <Grid item xs={12} sm={9} lg={8}>
                                <Typography variant="h5">5 to 6 Years</Typography>
                                <Typography variant="body1">
                                    Average lifecycle extension of your donated hardware with Sama.
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid container spacing={2} sx={{ mt: 2 }}>
                            <Grid item xs={12} sm={3} lg={3}>
                                <img src={lifecycleLogo} alt="Lifecycle Logo" style={{ maxWidth: '100%', height: 'auto' }} />
                            </Grid>
                            <Grid item xs={12} sm={9} lg={8}>
                                <Typography variant="h5">5 to 6 Years</Typography>
                                <Typography variant="body1">
                                    Average lifecycle extension of your donated hardware with Sama.
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                </CardContent>
            </Grid>
        </Grid>
    );
};

export default EnvironmentalImpact;
