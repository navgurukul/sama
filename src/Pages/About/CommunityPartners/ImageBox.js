import { Container, Box, Grid } from "@mui/material";
import ourteam from '../OurTeam/style';
import img1 from "./assests/1.png";
import img2 from "./assests/2.png";
import img3 from "./assests/3.png";
import img4 from "./assests/4.png";
import img5 from "./assests/5.png";
import img6 from "./assests/6.png";
import img7 from "./assests/7.png";
import img8 from "./assests/8.png";
import img9 from "./assests/9.png";
import img10 from "./assests/10.png";
import img11 from "./assests/11.png";
import img12 from "./assests/12.png";
import img13 from "./assests/13.png";
import img14 from "./assests/14.png";

const ImageBox = () => {
    return (
        <Container maxWidth="lg" sx={ourteam.Communitycontainer}>
                <Grid container spacing={2} justifyContent="center" sx={{ gap: "32px" }}>
                    <Box sx={ourteam.Image}>
                        <img src={img1} alt="img1" />
                    </Box>
                    <Box sx={ourteam.Image}>
                        <img src={img2} alt="img2" />
                    </Box>
                    <Box sx={ourteam.Image}>
                        <img src={img3} alt="img3" />
                    </Box>
                    <Box sx={ourteam.Image}>
                        <img src={img4} alt="img4" />
                    </Box>
                    <Box sx={ourteam.Image}>
                        <img src={img5} alt="img5" />
                    </Box>
                    <Box sx={ourteam.Image}>
                        <img src={img6} alt="img6" />
                    </Box>
                </Grid>
                <Grid container spacing={2} justifyContent="center" sx={{ marginTop: "16px", }}>
                    <Box sx={ourteam.Image}>
                        <img src={img7} alt="img7" />
                    </Box>
                    <Box sx={ourteam.Image}>
                        <img src={img8} alt="img8" />
                    </Box>
                    <Box sx={ourteam.Image}>
                        <img height="100%" src={img9} alt="img8" />
                    </Box>
                    <Box sx={ourteam.Image}>
                        <img height="100%" src={img10} alt="img8" />
                    </Box>
                    <Box sx={ourteam.Image}>
                        <img height="100%" src={img11} alt="img8" />
                    </Box>
                     <Box sx={ourteam.Image}>
                        <img height="100%" src={img14} alt="img14" />
                    </Box>
                </Grid>
                  <Grid container spacing={2} justifyContent="center" sx={{ marginTop: "16px", }}>
                    <Box sx={ourteam.Image}>
                        <img height="100%" src={img12} alt="img12" />
                    </Box>
                    <Box sx={ourteam.Image}>
                        <img height="100%" src={img13} alt="img13" />
                    </Box>
                   
                </Grid>
        </Container>
    );
};

export default ImageBox;