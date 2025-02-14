import { Box, Grid, Container } from "@mui/material";
import ourteam from '../OurTeam/style';
import img1 from "./assests/1.png";  
import img2 from "./assests/2.png";
import img3 from "./assests/3.png";
import img4 from "./assests/4.png";
import img5 from "./assests/5.png";
import img6 from "./assests/6.png";
import img7 from "./assests/7.png";
import img8 from "./assests/8.png";


const ImageBox = () => {
    return (
        <Container maxWidth="lg" sx={ourteam.container}>
        <Box sx={ourteam.Main}>
            <Grid container spacing={7} justifyContent="center" sx={{gap: "32px"}}>
                    <Box sx={ourteam.Image1}>
                        <img src={img1} alt="img1"  />
                    </Box>
                    <Box sx={ourteam.Image2}>
                        <img src={img2} alt="img2"/>
                    </Box>
                    <Box sx={ourteam.Image3}>
                        <img src={img3} alt="img3"/>
                    </Box>
                    <Box sx={ourteam.Image4}>
                        <img src={img4} alt="img4"/>
                    </Box>
                    <Box sx={ourteam.Image5}>
                        <img src={img5} alt="img5"/>
                    </Box>
                    <Box sx={ourteam.Image6}>
                        <img src={img6} alt="img6"/>
                    </Box>
            </Grid>
            <Grid container spacing={2} justifyContent="center" sx={{ marginTop: "16px" }}>
                    <Box sx={ourteam.Image7}>
                        <img src={img7} alt="img7"/>
                    </Box>
                    <Box sx={ourteam.Image8}>
                        <img src={img8} alt="img8"/>
                    </Box>
            </Grid>
        </Box>
    </Container>
    );
};

export default ImageBox;