import React from 'react';
import "./style.css";

import img4 from "./assets/img4.svg";
import img5 from "./assets/img5.svg";
import img6 from "./assets/img6.svg";
import img7 from "./assets/img7.svg";
import img8 from "./assets/img8.svg";
import img1 from "./assets/img1.svg";
import img2 from "./assets/img2.svg";
import img3 from "./assets/img3.svg";
import img9 from "./assets/img9.svg";
import { Typography, Container, Box } from '@mui/material';

function TimelineDesktop(){

    return (
        <>
            <Container maxWidth="lg" style={{paddingTop:"20px" }}>
                <Box class="container">
                    <Box class="timeline">
                        <Box class="timeline-event">
                        </Box>
                        <Box class="timeline-event">
                            <Box className="card timeline-content">
                                <Box class="card-content" style={{ height: "50px", position: "relative", right: "260px", bottom: "21px" }}>
                                    <Box sx={{ width: "395px", height: "63px", borderRadius: "32px", background: "var(--Primary-Medium, #CED7CE)" }}>
                                        <Typography color="#5C785A" variant="h6" align="center" sx={{ padding: "16px 32px 16px 32px" }} >
                                            Digital Resource Recovery
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                            <Box class="timeline"></Box>
                        </Box>

                        <Box class="timeline-event" >
                            <Box class="card timeline-content">
                                <Box
                                    className="card-content teal white-text"
                                    style={{
                                        height: "204px",
                                        width: "360px",
                                        position: "relative",
                                        left: "130px",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    <img align="center" src={img1} alt="Image" style={{ position: "relative", bottom: "20px" }} />
                                    <Typography variant="body1" align="center" sx={{ mt: 2 ,color:"#4A4A4A"}}>
                                        We collect end-of-life laptops from corporate partners like you
                                    </Typography>
                                </Box>

                            </Box>
                            <Box class="timeline-badge red lighten-4 white-text"></Box>
                        </Box>

                        <Box class="timeline-event">
                            <Box class="card timeline-content">
                                <Box class="card-content teal white-text" style={{ height: "204px" }}>
                                    <Box
                                        className="card-content teal white-text"
                                        style={{
                                            height: "204px",
                                            width: "360px",
                                            position: "relative",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                    >
                                        <img align="center" src={img2} alt="Image" style={{ position: "relative", bottom: "16px" }} />
                                        <Typography variant="body1" align="center" sx={{color:"#4A4A4A"}}>
                                            We collect end-of-life laptops from corporate partners like you
                                        </Typography>
                                    </Box>

                                </Box>
                            </Box>
                            <Box class="timeline-badge red lighten-3 white-text"></Box>
                        </Box>

                        <Box class="timeline-event">
                            <Box class="card timeline-content">
                                <Box class="card-content teal white-text" style={{ height: "204px" }}>
                                    <Box
                                        className="card-content teal white-text"
                                        style={{
                                            height: "204px",
                                            width: "360px",
                                            position: "relative",
                                            left: "120px",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                    >
                                        <img align="center" src={img3} alt="Image" style={{ position: "relative", bottom: "16px" }} />
                                        <Typography variant="body1" align="center" sx={{ mt: 2 ,color:"#4A4A4A"}}>
                                            We collect end-of-life laptops from corporate partners like you
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                            <Box class="timeline-badge red lighten-3 white-text"></Box>
                        </Box>


                        <div class="timeline-event">
                            <div class="card timeline-content">
                                <div class="card-content teal white-text" style={{ height: "100px", position: "relative", right: "250px", top: "5px" }}>
                                    <Box sx={{ width: "395px", height: "63px", borderRadius: "32px", background: "var(--Primary-Medium, #CED7CE)" }}>
                                        <Typography color="#5C785A" variant="h6" align="center" sx={{ padding: "16px 32px 16px 32px" }}>
                                            Digital Inclusion Pipeline
                                        </Typography>
                                    </Box>
                                </div>
                            </div>
                        </div>
                        <div class="timeline-event">
                            <div class="card timeline-content">
                                <div class="card-content teal white-text" style={{ height: "204px" }}>
                                    <Box
                                        className="card-content teal white-text"
                                        style={{
                                            height: "204px",
                                            width: "360px",
                                            position: "relative",
                                            left: "120px",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                    >
                                        <img align="center" src={img4} alt="Image" style={{ position: "relative", bottom: "16px" }} />
                                        <Typography variant="body1" align="center" sx={{ mt: 2,color:"#4A4A4A"}}>
                                            We collect end-of-life laptops from corporate partners like you
                                        </Typography>
                                    </Box>

                                </div>
                            </div>
                            <div class="timeline-badge red lighten-3 white-text"></div>
                        </div>
                        <div class="timeline-event">
                            <div class="card timeline-content">
                                <div class="card-content teal white-text" style={{ height: "204px" }}>
                                    <Box
                                        className="card-content teal white-text"
                                        style={{
                                            height: "204px",
                                            width: "360px",
                                            position: "relative",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                    >
                                        <img align="center" src={img5} alt="Image" style={{ position: "relative", bottom: "16px" }} />
                                        <Typography variant="body1" align="center" sx={{ mt: 2 ,color:"#4A4A4A"}}>
                                            We collect end-of-life laptops from corporate partners like you
                                        </Typography>
                                    </Box>

                                </div>
                            </div>
                            <div class="timeline-badge red lighten-3 white-text"></div>
                        </div>
                        <div class="timeline-event">
                            <div class="card timeline-content">
                                <div class="card-content teal white-text" style={{ height: "204px" }}>
                                    <Box
                                        className="card-content teal white-text"
                                        style={{
                                            height: "204px",
                                            width: "360px",
                                            position: "relative",
                                            left: "120px",
                                            display: "flex",
                                            flexDirection: "column", 
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                    >
                                        <img align="center" src={img6} alt="Image" style={{ position: "relative", bottom: "16px" }} />
                                        <Typography variant="body1" align="center" sx={{ mt: 2 ,color:"#4A4A4A"}}>
                                            We collect end-of-life laptops from corporate partners like you
                                        </Typography>
                                    </Box>

                                </div>
                            </div>
                            <div class="timeline-badge red lighten-3 white-text"></div>
                        </div>

                        <div class="timeline-event">
                            <div class="card timeline-content">
                                <div class="card-content teal white-text" style={{ height: "100px", right: "250px", position: "relative", top: "5px" }}>
                                    <Box sx={{ width: "395px", height: "63px", borderRadius: "32px", background: "var(--Primary-Medium, #CED7CE)" }}>
                                        <Typography color="#5C785A" variant="h6" align="center" sx={{ padding: "16px 32px 16px 32px" }}>
                                            Digital Tracking and Reporting
                                        </Typography>
                                    </Box>
                                </div>
                            </div>
                        </div>

                        <Box class="timeline-event">
                            <Box class="card timeline-content">
                                <Box class="card-content teal white-text" style={{ height: "204px" }}>
                                    <Box
                                        className="card-content teal white-text"
                                        style={{
                                            height: "204px",
                                            width: "360px",
                                            position: "relative",
                                            left: "120px",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            alignItems: "center"
                                        }}
                                    >
                                        <img align="center" src={img7} alt="Image" style={{ position: "relative", bottom: "16px" }} />
                                        <Typography variant="body1" align="center" sx={{ mt: 2,color:"#4A4A4A" }}>
                                            We collect end-of-life laptops from corporate partners like you
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                            <Box class="timeline-badge red lighten-3 white-text"></Box>
                        </Box>

                        <Box class="timeline-event">
                            <Box class="card timeline-content">
                                <Box class="card-content teal white-text" style={{ height: "204px" }}>
                                    <Box
                                        className="card-content teal white-text"
                                        style={{
                                            height: "204px",
                                            width: "360px",
                                            position: "relative",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            alignItems: "center"
                                        }}
                                    >
                                        <img align="center" src={img8} alt="Image" style={{ position: "relative", bottom: "45px" }} />
                                        <Typography variant="body1" align="center" sx={{color:"#4A4A4A"}} >
                                            We collect end-of-life laptops from corporate partners like you
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                            <Box class="timeline-badge red lighten-3 white-text"></Box>
                        </Box>
                        <Box class="timeline-event">
                            <Box class="card timeline-content">
                                <Box class="card-content teal white-text" style={{ height: "204px" }}>
                                    <Box
                                        className="card-content teal white-text"
                                        style={{
                                            height: "204px",
                                            width: "360px",
                                            position: "relative",
                                            left: "120px",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            alignItems: "center"
                                        }}
                                    >
                                        <img align="center" src={img9} alt="Image" style={{ position: "relative", bottom: "20px" }} />
                                        <Typography variant="body1" align="center" sx={{ mt: 2 ,color:"#4A4A4A"}}>
                                            We collect end-of-life laptops from corporate partners like you
                                        </Typography>
                                    </Box>

                                </Box>
                            </Box>
                            <Box class="timeline-badge red lighten-3 white-text"></Box>
                        </Box>
                    </Box>
                </Box>
            </Container >
        </>
    );
}

export default TimelineDesktop;
