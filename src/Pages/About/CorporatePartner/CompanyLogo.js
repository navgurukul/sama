import { Box, Grid, Container} from "@mui/material";
import Ama from "./assets/Amazon Logo.png";
import Mac from "./assets/image 1.png";
import DXC from "./assets/image 5.png";
import Acc from './assets/image 15.png'
import ourteam from "../OurTeam/style";

const CompanyLogo = () => {
    return (
        <Container maxWidth="lg" sx={ourteam.container} style={{marginTop:"0px"}}>
            <Grid container spacing={4} justifyContent="center">
                <Grid item xs={12} sm={6} md={4} >
                    <Box sx={ourteam.Logo1} boxShadow={3}>
                        <img src={Ama} alt="Logo 1" />
                    </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <Box sx={ourteam.Logo1}>
                        <img src={Mac} alt="Logo 2" />
                    </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <Box sx={ourteam.Logo1}>
                        <img src={DXC} alt="Logo 3" />
                    </Box>
                </Grid>
            </Grid>
            <Grid container spacing={2} justifyContent="left" mt={2}>
                <Grid item xs={12} sm={6} md={4}>
                    <Box sx={ourteam.Logo1}>
                        <img src={Acc} alt="Logo 1" style={{marginLeft: "30px"}} />
                    </Box>
                </Grid>
            </Grid>
    </Container>
    );
};

export default CompanyLogo;
