import { Box, Grid } from "@mui/material";
import Ama from "./assets/Amazon Logo.png";
import Mac from "./assets/image 1.png";
import DXC from "./assets/image 5.png";
import Acc from './assets/image 15.png'
import ourteam from "../OurTeam/style"; // Ensure styles are correctly imported

const CompanyLogo = () => {
    return (
        <Box sx={ourteam.Main}>
            <Grid container spacing={2} justifyContent="center">
                {/* Three Boxes in One Row */}
                <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{
                        widht:"288px",
                        height: "116px",
                        padding: "32px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        boxShadow: "0px 1px 5px 0px #4A4A4A14",
                        boxShadow: "0px 2px 1px 0px #4A4A4A0A",
                        boxShadow: "0px 1px 2px 0px #4A4A4A0F",                    }}>
                        <img src={Ama} alt="Logo 1" />
                    </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{
                        widht:"288px",
                        height: "116px",
                        padding: "32px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        boxShadow: "0px 1px 5px 0px #4A4A4A14",
                        boxShadow: "0px 2px 1px 0px #4A4A4A0A",
                        boxShadow: "0px 1px 2px 0px #4A4A4A0F",                    }}>
                        <img src={Mac} alt="Logo 2" />
                    </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{
                        widht:"288px",
                        height: "116px",
                        padding: "32px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        boxShadow: "0px 1px 5px 0px #4A4A4A14",
                        boxShadow: "0px 2px 1px 0px #4A4A4A0A",
                        boxShadow: "0px 1px 2px 0px #4A4A4A0F",                    }}>
                        <img src={DXC} alt="Logo 3" />
                    </Box>
                </Grid>
            </Grid>
            <Grid container spacing={2} justifyContent="left" mt={2}>
                <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{
                        widht:"288px",
                        height: "116px",
                        padding: "32px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        boxShadow: "0px 1px 5px 0px #4A4A4A14",
                        boxShadow: "0px 2px 1px 0px #4A4A4A0A",
                        boxShadow: "0px 1px 2px 0px #4A4A4A0F",                                               
                    }}>
                        <img src={Acc} alt="Logo 1" style={{marginLeft: "30px"}} />
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default CompanyLogo;
