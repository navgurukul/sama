import { Box, Container, Typography, Grid, } from "@mui/material";
import ourteam from '../OurTeam/style';
import Quote from './assests/Vector1.png';
import Quote1 from "./assests/Vector.png";

const GreenBox = () => {
    return (
        <>
            <Box sx={ourteam.GreenBox}>
                <Container maxWidth="lg" >
                    <Typography variant="h5" gutterBottom style={{ color: "white", textAlign: "center", marginBottom: "32px" }}>
                        Partner Testimonials
                    </Typography>
                    <Grid container spacing={4}>
                        {/* Left Side - Box 1 (Top Left) */}
                        <Grid item xs={12} md={6} >
                            <Box sx={ourteam.Box1} style={{ display: "flex", flexDirection: "column", position: "relative" }}>
                                <Box style={{ width: "36px", height: "50px" }}>
                                    <img src={Quote} alt="Icon" style={{ height: "80%", filter: "invert(300%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(50%) contrast(90%)" }} />
                                </Box>
                                <Box sx={{ textAlign: "left" }}>
                                    <Typography variant="body1" paragraph color="#2E2E2E">
                                        Thank you, Sama, for strengthening our 15 Kishori<br />
                                        Resource Centres in Koppal with laptops for computer <br />
                                        classes. Your laptops enable us to train more adolescent<br /> girls in computers.
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: "left" }}>
                                    <Typography variant="subtitle1" color="#4A4A4A">
                                        Vishthar
                                    </Typography>
                                </Box>
                                <Box style={{ width: "36px", height: "50px", position: "absolute", right: "50px", bottom: "8px" }}>
                                    <img src={Quote1} alt="Icon" style={{ height: "60%", filter: "invert(60%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(210%) contrast(90%)" }} />
                                </Box>

                            </Box>
                            <Box sx={ourteam.Box1} style={{ marginTop: "32px", display: "flex", flexDirection: "column", position: "relative" }}>
                                <Box style={{ width: "36px", height: "50px" }}>
                                    <img src={Quote} alt="Icon" style={{ height: "80%", filter: "invert(300%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(50%) contrast(90%)" }} />
                                </Box>
                                <Box sx={{ textAlign: "left" }}>
                                    <Typography variant="body1" paragraph color="#2E2E2E">
                                        The Innovation Story sincerely thanks Sama for the<br /> generous
                                        laptop donation. These laptops are <br />empowering students from
                                        underserved communities to<br /> access quality Computer Science
                                        education through the <br />Amazon Future Engineer program. The
                                        students have <br />already started using the laptops and are thrilled <br />
                                        because there are now enough laptops for each student.<br /> They no
                                        longer have to share, making the learning<br /> process smoother and
                                        more effective.
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: "left" }}>
                                    <Typography variant="subtitle1" color="#4A4A4A">
                                        The Innovation Story
                                    </Typography>
                                </Box>
                                {/* Align second quote to the right */}
                                <Box style={{ width: "36px", height: "50px", position: "absolute", right: "50px", bottom: "8px" }}>
                                    <img src={Quote1} alt="Icon" style={{ height: "60%", filter: "invert(60%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(210%) contrast(90%)" }} />
                                </Box>
                            </Box>

                        </Grid>

                        {/* Right Side - Box 3 (Top Right) */}
                        {/* <Grid item xs={12} md={6} style={{  }}>
                           
                        </Grid> */}

                        {/* Left Side - Box 2 (Bottom Left) */}
                        <Grid item xs={12} md={6}>
                            <Box sx={ourteam.Box1} style={{ display: "flex", flexDirection: "column", position: "relative" }}>
                                <Box style={{ width: "36px", height: "50px" }}>
                                    <img src={Quote} alt="Icon" style={{ height: "80%", filter: "invert(300%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(50%) contrast(90%)" }} />
                                </Box>
                                <Box sx={{ textAlign: "left" }}>
                                    <Typography variant="body1" paragraph color="#2E2E2E">
                                        We received 5 refurbished laptops from SAMA for<br /> educational
                                        purposes and teaching computer skills to the <br />children we work
                                        with. We work at the Dongri<br /> Observation Home in Mumbai with
                                        Children in Conflict<br /> with Law (CCL). These laptops will be
                                        very helpful for use<br /> to impart the necessary skills and knowledge
                                        to these <br />children to give them better exposure, bring about a <br />
                                        behaviour change and equip them for today's world. The <br />laptops
                                        we have received are very good. The build of the <br />laptop is solid,
                                        it has a very good battery life, and it is fast <br />especially for general
                                        tasks that we use. It's a perfect fit<br /> for our purposes and we are very
                                        grateful to receive <br />them!
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: "left" }}>
                                    <Typography variant="subtitle1" color="#4A4A4A">
                                        Seedling Foundation
                                    </Typography>
                                </Box>
                                <Box style={{ width: "36px", height: "50px", position: "absolute", right: "50px", bottom: "8px" }}>
                                    <img src={Quote1} alt="Icon" style={{ height: "60%", filter: "invert(60%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(210%) contrast(90%)" }} />
                                </Box>
                            </Box>


                            <Box sx={ourteam.Box1} style={{ marginTop: "32px", display: "flex", flexDirection: "column", position: "relative" }}>
                                <Box style={{ width: "36px", height: "50px" }}>
                                    <img src={Quote} alt="Icon" style={{ height: "80%", filter: "invert(300%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(50%) contrast(90%)" }} />
                                </Box>
                                <Box sx={{ textAlign: "left" }}>
                                    <Typography variant="body1" paragraph color="#2E2E2E">
                                        Refurbished laptops typically cost us ₹15,000 to ₹20,000<br /> each,
                                        making it challenging to equip our students <br />affordably.
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: "left" }}>
                                    <Typography variant="subtitle1" color="#4A4A4A">
                                        Eklayva India Foundation
                                    </Typography>
                                </Box>
                                <Box style={{ width: "36px", height: "50px", position: "absolute", right: "50px", bottom: "8px" }}>
                                    <img src={Quote1} alt="Icon" style={{ height: "60%", filter: "invert(60%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(210%) contrast(90%)" }} />
                                </Box>

                            </Box>
                        </Grid>


                    </Grid>
                </Container>

            </Box>

        </>
    )
}
export default GreenBox;