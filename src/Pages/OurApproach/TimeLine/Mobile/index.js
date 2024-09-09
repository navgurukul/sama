// import * as React from 'react';
// import Box from '@mui/material/Box';
// import { Grid, Typography } from '@mui/material';
// import "./style.css";
import img4 from "./assets/img1.svg";
import img5 from "./assets/img5.svg";
import img6 from "./assets/img6.svg";
import img7 from "./assets/img7.svg";
import img8 from "./assets/img8.svg";
import img1 from "./assets/img1.svg";
import img2 from "./assets/img2.svg";
import img3 from "./assets/img3.svg";
import img9 from "./assets/img9.svg";
// import { Container } from '@mui/system';

// export default function MobailVeiwTimeLine() {
//     return (
//         <Container maxWidth="lg">
//             <Grid container spacing={2} sx={{ mt: 5 }}>
//                 <Box>
//                     <Box sx={{ mt: 10, px: { sm: 10, xs: 4, background: "#F8F3F0" } }}>
//                         <Box classNameName="Timeline">
//                             <Box classNameName="Timeline-item">
//                                 <Box className="Timeline-separator">
//                                     <Box className="Timeline-dot"></Box>
//                                     <Box className="Timeline-connector"></Box>
//                                 </Box>
//                                 <Box className="Timeline-content">

//                                     <Typography align="center"
//                                         variant="h6"
//                                         sx={{
//                                             ml: 2, color: "rgba(92, 120, 90, 1) ",
//                                             background: "rgba(206, 215, 206, 1)",
//                                             padding: "16px 32px 16px 32px",
//                                             borderRadius: "32px"
//                                         }}
//                                     >Digital Resource Recovery
//                                     </Typography>

//                                     <Box sx={{ m: 4 }}>
//                                         <img src={img1}></img>
//                                         <Typography sx={{ mt: 2, color: "#4A4A4A" }}>
//                                             We collect end-of-life laptops
//                                             from corporate partners like you
//                                         </Typography>
//                                     </Box>

//                                 </Box>
//                             </Box>

//                             <Box className="Timeline-item">
//                                 <Box className="Timeline-separator">
//                                     <Box className="Timeline-dot"></Box>
//                                     <Box className="Timeline-connector"></Box>
//                                 </Box>

//                                 <Box className="Timeline-content">
//                                     <Box >
//                                         <img src={img2} style={{ position: "relative", bottom: "36px" }}></img>
//                                         <Typography sx={{ mt: 2, color: "#4A4A4A" }}>We collect end-of-life laptops from corporate partners like you</Typography>
//                                     </Box>
//                                 </Box>
//                             </Box>
//                             <Box className="Timeline-item">
//                                 <Box className="Timeline-separator">
//                                     <Box className="Timeline-dot"></Box>
//                                     <Box className="Timeline-connector"></Box>
//                                 </Box>
//                                 <Box className="Timeline-content">
//                                     <Box sx={{ m: 4 }}>
//                                         <img src={img3} style={{ position: "relative", bottom: "36px" }}></img>
//                                         <Typography sx={{ mt: 2, color: "#4A4A4A" }}>We collect end-of-life laptops from corporate partners like you</Typography>
//                                     </Box>
//                                 </Box>
//                             </Box>

//                             <Box className="Timeline-item">
//                                 <Box className="Timeline-separator">
//                                     <Box className="Timeline-dot"></Box>
//                                     <Box className="Timeline-connector"></Box>
//                                 </Box>
//                                 <Box className="Timeline-content">
//                                     <Box sx={{ m: 4 }}>
//                                         <Typography align="center" variant="h6"
//                                             sx={{
//                                                 position: "relative",
//                                                 bottom: "34px", color: "rgba(92, 120, 90, 1)",
//                                                 background: "rgba(206, 215, 206, 1)",
//                                                 padding: "16px 32px 16px 32px",
//                                                 borderRadius: "32px"
//                                             }}>Digital Inclusion Pipeline</Typography>
//                                         <img src={img4}></img>
//                                         <Typography variant="body1" sx={{ mt: 2, color: "#4A4A4A" }}>
//                                             We collect end-of-life laptops from
//                                             corporate partners like you
//                                         </Typography>
//                                     </Box>
//                                 </Box>
//                             </Box>

//                             <Box class="Timeline-item">
//                                 <Box className="Timeline-separator">
//                                     <Box className="Timeline-dot"></Box>
//                                     <Box className="Timeline-connector"></Box>
//                                 </Box>
//                                 <Box className="Timeline-content" >
//                                     <Box sx={{ m: 4 }}>
//                                         <img src={img5} style={{ position: "relative", bottom: "34px" }}></img>
//                                         <Typography sx={{ mt: 1, color: "#4A4A4A" }}>
//                                             We collect end-of-life laptops from
//                                             corporate partners like you
//                                         </Typography>
//                                     </Box>
//                                 </Box>
//                             </Box>

//                             <Box className="Timeline-item">
//                                 <Box className="Timeline-separator">
//                                     <Box className="Timeline-dot"></Box>
//                                     <Box className="Timeline-connector"></Box>
//                                 </Box>
//                                 <Box class="Timeline-content" sx={{ p: 6 }}>
//                                     <Box sx={{ m: 4 }}>
//                                         <img src={img6} style={{ position: "relative", bottom: "34px" }}></img>
//                                         <Typography sx={{ mt: 1, color: "#4A4A4A" }}>
//                                             We collect end-of-life laptops from
//                                             corporate partners like you
//                                         </Typography>
//                                     </Box>
//                                 </Box>
//                             </Box>

//                             <Box className="Timeline-item">
//                                 <Box className="Timeline-separator">
//                                     <Box className="Timeline-dot"></Box>
//                                     <Box className="Timeline-connector"></Box>
//                                 </Box>
//                                 <Box class="Timeline-content" >
//                                     <Box sx={{ p: 4 }}>
//                                         <Typography align="center" variant="h6" sx={{ position: "relative", bottom: "60px", color: "rgba(92, 120, 90, 1)", background: "rgba(206, 215, 206, 1)", padding: "16px 32px 16px 32px", borderRadius: "32px" }}>Digital Tracking and Reporting</Typography>
//                                         <img src={img7} style={{ position: "relative", bottom: "36px" }}></img>
//                                         <Typography sx={{ mt: 1, color: "#4A4A4A" }}>
//                                             We collect end-of-life laptops from
//                                             corporate partners like you
//                                         </Typography>
//                                     </Box>
//                                 </Box>
//                             </Box>
//                             <Box className="Timeline-item">
//                                 <Box className="Timeline-separator">
//                                     <Box className="Timeline-dot"></Box>
//                                     <Box className="Timeline-connector"></Box>
//                                 </Box>
//                                 <Box className="Timeline-content">
//                                     <Box sx={{ m: 4 }}>
//                                         <img src={img9} style={{ position: "relative", bottom: "36px" }}></img>
//                                         <Typography sx={{ mt: 1, color: "#4A4A4A" }}>
//                                             We collect end-of-life laptops from
//                                             corporate partners like you
//                                         </Typography>
//                                     </Box>
//                                 </Box>
//                             </Box>
//                             <Box className="Timeline-item">
//                                 <Box className="Timeline-separator">
//                                     <Box className="Timeline-dot"></Box>
//                                     <Box className="Timeline-connector"></Box>
//                                 </Box>
//                                 <Box className="Timeline-content">
//                                     <Box sx={{ m: 4 }}>
//                                         <img src={img9} style={{ position: "relative", bottom: "36px" }}></img>
//                                         <Typography sx={{ mt: 1, color: "#4A4A4A" }}>
//                                             We collect end-of-life laptops from
//                                             corporate partners like you
//                                         </Typography>
//                                     </Box>
//                                 </Box>
//                             </Box>

//                             <Box className="Timeline-item">
//                                 <Box className="Timeline-separator">
//                                     <Box className="Timeline-dot"></Box>
//                                 </Box>
//                             </Box>
//                         </Box>
//                     </Box>
//                 </Box>
//             </Grid>
//         </Container>
//     );
// }




import "./style.css";
import * as React from 'react';
import { Typography, Box } from "@mui/material";
function MobailVeiwTimeLine() {
    return (
        <>
            <Box className="Timeline">
                <Box className="Outer">
                    <Box className="Card">
                        <Box className="Info">
                            <Box className="Title">
                                <Typography variant="h6"
                                    style={{ color: "rgba(92, 120, 90, 1)" }}>
                                    Digital Resource Recovery
                                </Typography>
                                <img src={img1}></img>
                                <Typography variant="body1">
                                    We collect end-of-life laptops
                                    from corporate partners like you
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                    <Box className="Card">
                        <Box className="Info">
                            <Box className="Title">
                                <img src={img2}></img>
                                <Typography variant="body1">
                                    We ensure complete data
                                    erasure and privacy protection
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                    <Box className="Card">
                        <Box className="Info">
                            <Box className="Title">
                                <img src={img3}></img>
                                <Typography variant="body1">
                                    We restore and upgrade
                                    these laptops for educational use
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                    <Box className="Card">
                        <Box className="Info">
                            <Box className="Title">
                                <Typography variant="h6" style={{ color: "rgba(92, 120, 90, 1)" }} >Digital Inclusion Pipeline</Typography>
                                <img src={img4}></img>
                                <Typography variant="body1">
                                    We create livelihood opportunities
                                    through our interventions
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                    <Box className="Card">
                        <Box className="Info">
                            <Box className="Title">
                                <img src={img5}></img>
                                <Typography variant="body1">
                                    We provide an ecosystem of pre-installed
                                    online and offline learning resources
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                    <Box className="Card">
                        <Box className="Info">
                            <Box className="Title">
                                <Typography variant="h6" style={{ color: "rgba(92, 120, 90, 1)" }}>Digital Tracking and Reporting</Typography>
                                <img src={img6}></img>
                                <Typography variant="body1">
                                    We connect with underserved communities through 200+
                                    verified NGOs/Government Institutions
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                    <Box className="Card">
                        <Box className="Info">
                            <Box className="Title">
                                <img src={img7}></img>
                                <Typography variant="body1">
                                    We capture data on laptop’s
                                    lifecycle and community impact
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                    <Box className="Card">
                        <Box className="Info">
                            <Box className="Title">
                                <img src={img8}></img>
                                <Typography variant="body1">
                                    We generate transparent,
                                    real-time analytics on ESG outcomes
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                    <Box className="Card">
                        <Box className="Info">
                            <Box className="Title">
                                <Typography variant="h6">Digital Tracking and Reporting</Typography>
                                <img src={img9}></img>
                                <Typography variant="body1">
                                    We utilize insights to improve
                                    processes and maximize impact
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </>
    );
}

export default MobailVeiwTimeLine;
