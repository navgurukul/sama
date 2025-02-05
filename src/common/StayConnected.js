import TeamImg2 from '../Pages/About/OurTeam/Email Campaign 1.png';
import ourteam from '../Pages/About/OurTeam/style';
import { Button, Typography, Grid, TextField } from "@mui/material";

const StayConnected = ()=> {
    return(
        <Grid container sx={ourteam.mainGrid}>
                <Grid item xs={12} md={7} sx={ourteam.leftGrid}>
                    <Typography variant="h6" sx={ourteam.headingText}>
                        Stay Connected with Sama’s Journey
                    </Typography>
                    <Typography variant="body1" sx={ourteam.paragraphText}>
                        Subscribe to our monthly newsletter,<b>Ripplez</b> , bringing you 
                        from the latest inspiring impact stories to updates from our 
                        mission to empower underserved communities. Don’t miss out 
                        and join the conversation!                    
                    </Typography>
                    <TextField
                        variant="outlined"
                        placeholder="Email ID"
                        fullWidth
                        sx={ourteam.inputField}
                    />
                    <Button variant="contained" sx={ourteam.subscribeButton}>
                        Subscribe
                    </Button>
                </Grid>

                <Grid item xs={12} md={5} sx={ourteam.rightGrid}>
                    <img src={TeamImg2} alt="Newsletter" style={ourteam.image} />
                </Grid>
            </Grid>
    );
}
export default StayConnected