import React from 'react';
import Img1 from "./assets/Frame (1).png";
import Img2 from "./assets/Frame (2).png";
import Img3 from "./assets/Frame (3).png";
import Img4 from "./assets/Frame (4).png";
import Img5 from "./assets/Frame (5).png";
import Img6 from "./assets/Frame (6).png";
import Group from "./assets/Group (2).png";
import Frame from "./assets/Frame.png";
import designers from "./assets/group-designers-working-with-various-tools 1.png"
import { Grid, Box, Container, Typography } from '@mui/material';
import "../OurApproach.css";
import "./style.css";
import classes from "./style.js"
const TimeLine = () => {
    return (
        <>
            <Box paddingBottom="80px" sx={{ background: "rgba(248, 243, 240, 1)" }}>
                <Container maxWidth="xl">
                    <Grid container spacing={2}>
                        <Grid item xs={12} lg={5} md={7} sx={{ mt: "80px" }}>
                            <Typography variant='h5' color="primary.main">Our 3D model:</Typography>
                            <Typography variant='body1' sx={{ mt: 3 }}>Our 3D Model forms the backbone of our approach.
                                Through this comprehensive approach, we transform e-waste
                                into educational tools , thereby providing impact reports
                                to our donors.
                            </Typography>
                        </Grid>
                    </Grid>
                    <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2 }}
                        sx={{ mt: 5, display: { xs: 'flex', lg: 'none', md: "none" } }}>
                        <main className="container-main">
                            <Box className="container-timeline">
                                <Box className="content-timeline active-content-timeline">
                                    <Box className="header-timeline">
                                        <Box sx={classes.boxStyle}>
                                            <Typography
                                                color="primary.main"
                                                variant="h6"
                                                sx={classes.typographyStyle}
                                            >
                                                Digital Resource Recovery
                                            </Typography>
                                        </Box>
                                        <span className="marker-timeline"></span>
                                        <img style={{ width: "170px" }} src={Group}></img>
                                    </Box>
                                    <Box className="body-timeline">
                                        <Typography
                                            sx={{
                                                fontSize: {
                                                    lg: "1.25rem",
                                                    md: "1rem",
                                                    sm: "0.875rem",
                                                    xs: "0.75rem",
                                                },
                                                textAlign: {
                                                    xs: "center",
                                                    sm: "left",
                                                },
                                            }}
                                        >
                                            We collect end-of-life laptops from corporate partners like you
                                        </Typography>
                                    </Box>

                                </Box>
                                <Box className="content-timeline">
                                    <Box className="header-timeline">
                                        <span className="marker-timeline"></span>
                                        <img style={{ width: "170px" }} src={Frame}></img>
                                    </Box>
                                    <Box className="body-timeline">
                                        <Typography
                                            sx={{
                                                fontSize: {
                                                    lg: "1.25rem",
                                                    md: "1rem",
                                                    sm: "0.875rem",
                                                    xs: "0.75rem",
                                                },
                                                textAlign: {
                                                    xs: "center",
                                                    sm: "left",
                                                },
                                            }}
                                        >
                                            We collect end-of-life laptops from corporate partners like you
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box className="content-timeline">
                                    <Box className="header-timeline">
                                        <span className="marker-timeline"></span>
                                        <img style={{ width: "170px" }} src={Img1}></img>
                                    </Box>
                                    <Box className="body-timeline">
                                        <Typography
                                            sx={{
                                                fontSize: {
                                                    lg: "1.25rem",
                                                    md: "1rem",
                                                    sm: "0.875rem",
                                                    xs: "0.75rem",
                                                },
                                                textAlign: {
                                                    xs: "center",
                                                    sm: "left",
                                                },
                                            }}
                                        >
                                            We collect end-of-life laptops from corporate partners like you
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box className="content-timeline">
                                    <Box className="header-timeline">

                                        <Box sx={classes.boxStyle}>
                                            <Typography
                                                color="primary.main"
                                                variant="h6"
                                                sx={classes.typographyStyle}
                                            >
                                                Digital Resource Recovery
                                            </Typography>
                                        </Box>
                                        <span className="marker-timeline"></span>
                                        <img style={{ width: "170px" }} src={Img2}></img>
                                    </Box>
                                    <Box className="body-timeline">
                                        <Typography
                                            sx={{
                                                fontSize: {
                                                    lg: "1.25rem",
                                                    md: "1rem",
                                                    sm: "0.875rem",
                                                    xs: "0.75rem",
                                                },
                                                textAlign: {
                                                    xs: "center",
                                                    sm: "left",
                                                },
                                            }}
                                        >
                                            We collect end-of-life laptops from corporate partners like you
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box className="content-timeline">
                                    <Box className="header-timeline">
                                        <span className="marker-timeline"></span>
                                        <img style={{ width: "170px" }} src={designers}></img>
                                    </Box>
                                    <Box className="body-timeline">
                                        <Typography
                                            sx={{
                                                fontSize: {
                                                    lg: "1.25rem",
                                                    md: "1rem",
                                                    sm: "0.875rem",
                                                    xs: "0.75rem",
                                                },
                                                textAlign: {
                                                    xs: "center",
                                                    sm: "left",
                                                },
                                            }}
                                        >
                                            We collect end-of-life laptops from corporate partners like you
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box className="content-timeline">
                                    <Box className="header-timeline">
                                        <span className="marker-timeline"></span>
                                        <img style={{ width: "170px" }} src={Img3}></img>
                                    </Box>
                                    <Box className="body-timeline">
                                        <Typography
                                            sx={{
                                                fontSize: {
                                                    lg: "1.25rem",
                                                    md: "1rem",
                                                    sm: "0.875rem",
                                                    xs: "0.75rem",
                                                },
                                                textAlign: {
                                                    xs: "center",
                                                    sm: "left",
                                                },
                                            }}
                                        >
                                            We collect end-of-life laptops from corporate partners like you
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box className="content-timeline">
                                    <Box className="header-timeline">
                                        <span className="marker-timeline"></span>
                                        <Box sx={classes.boxStyle}>
                                            <Typography
                                                color="primary.main"
                                                variant="h6"
                                                sx={classes.typographyStyle}
                                            >
                                                Digital Resource Recovery
                                            </Typography>
                                        </Box>
                                        <img src={Img4} style={{ width: "170px" }}></img>
                                    </Box>
                                    <Box className="body-timeline">
                                        <Typography
                                            sx={{
                                                fontSize: {
                                                    lg: "1.25rem",
                                                    md: "1rem",
                                                    sm: "0.875rem",
                                                    xs: "0.75rem",
                                                },
                                                textAlign: {
                                                    xs: "center",
                                                    sm: "left",
                                                },
                                            }}
                                        >
                                            We collect end-of-life laptops from corporate partners like you
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box className="content-timeline">
                                    <Box className="header-timeline">
                                        <span className="marker-timeline"></span>
                                        <img style={{ width: "170px" }} src={Img5}></img>
                                    </Box>
                                    <Box className="body-timeline">
                                        <Typography
                                            sx={{
                                                fontSize: {
                                                    lg: "1.25rem",
                                                    md: "1rem",
                                                    sm: "0.875rem",
                                                    xs: "0.75rem",
                                                },
                                                textAlign: {
                                                    xs: "center",
                                                    sm: "left",
                                                },
                                            }}
                                        >
                                            We collect end-of-life laptops from corporate partners like you
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box className="content-timeline">
                                    <Box className="header-timeline">
                                        <span className="marker-timeline"></span>
                                        <img src={Img6}></img>
                                    </Box>
                                    <Box className="body-timeline">
                                        <Typography
                                            sx={{
                                                fontSize: {
                                                    lg: "1.25rem",
                                                    md: "1rem",
                                                    sm: "0.875rem",
                                                    xs: "0.75rem",
                                                },
                                                textAlign: {
                                                    xs: "center",
                                                    sm: "left",
                                                },
                                            }}
                                        >
                                            We collect end-of-life laptops from corporate partners like you
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </main>
                    </Grid>
                    <Grid container spacing={2} sx={{ display: { xs: 'none', lg: 'flex', md: 'flex' }, height: "auto" }}>
                        <div className="timeline" sx={{ border: "1px solid red" }}>
                            <ul>
                                <li>
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            left: { lg: '240px', md: "200px" },
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            height: '60px',
                                            textAlign: 'center',
                                            background: "rgba(206, 215, 206, 1)",
                                            bottom: "20px",
                                            padding: "16px, 32px, 16px, 32px",
                                            borderRadius: "32px",
                                            width: "431px",
                                        }}
                                    >
                                        <Typography variant='h6' color="primary.main">
                                            Digital Tracking and Reporting
                                        </Typography>
                                    </Box>

                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            padding: '16px',
                                            position: "relative",
                                            bottom: "30px"

                                        }}
                                    >
                                        <img
                                            style={{ width: '200px', marginBottom: '8px' }}
                                            src={Group}
                                            alt="Digital Tracking and Reporting"
                                        />
                                        <Typography>
                                            We connect with underserved communities through 200+ verified NGOs/Government Institutions
                                        </Typography>
                                    </Box>
                                </li>
                                <li>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            padding: '16px',
                                            position: "relative",
                                            height: "50px",
                                            position: "relative",
                                            bottom: "170px"

                                        }}
                                    >
                                        <img
                                            style={{ width: '200px', marginBottom: '8px' }}
                                            src={Frame}
                                            alt="Digital Tracking and Reporting"
                                        />
                                        <Typography>
                                            We connect with underserved communities through 200+ verified NGOs/Government Institutions
                                        </Typography>
                                    </Box>
                                </li>
                                <li>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            padding: '16px',
                                            position: "relative",
                                            height: "150px",
                                        }}
                                    >
                                        <img
                                            style={{ width: '200px', marginBottom: '8px' }}
                                            src={Img1}
                                            alt="Digital Tracking and Reporting"
                                        />
                                        <Typography>
                                            We connect with underserved communities through 200+ verified NGOs/Government Institutions
                                        </Typography>
                                    </Box>
                                </li>
                                <li>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            padding: '16px',
                                            height: "160px",
                                            position: "relative",
                                            top: "150px",
                                            right: { lg: "250px", md: "215px" },

                                        }}
                                    >
                                        <Box sx={{ background: "rgba(206, 215, 206, 1)", width: "431px", height: "60px", borderRadius: "32px" }}>
                                            <Typography color="primary.main" variant='h6' sx={{ position: "relative", bottom: "35px" }}>Digital Inclusion Pipeline</Typography>
                                        </Box>
                                    </Box>
                                </li>
                                <li>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            padding: '16px',
                                            position: "relative",
                                            height: "150px",
                                            top: "90px",
                                        }}
                                    >
                                        <img
                                            style={{ width: '200px', marginBottom: '8px' }}
                                            src={Img4}
                                            alt="Digital Tracking and Reporting"
                                        />
                                        <Typography>
                                            We connect with underserved communities through 200+ verified NGOs/Government Institutions
                                        </Typography>
                                    </Box>
                                </li>
                                <li>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            padding: '16px',
                                            position: "relative",
                                            height: "15px",

                                        }}
                                    >

                                    </Box>
                                </li>
                                <li>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            padding: '16px',
                                            position: "relative",
                                            height: "135px",
                                        }}
                                    >

                                    </Box>
                                </li>
                                <li>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            padding: '16px',
                                            position: "relative",
                                            height: "90px",
                                            bottom: "160px",
                                        }}
                                    >
                                        <img
                                            style={{ width: '200px', marginBottom: '8px' }}
                                            src={designers}
                                            alt="Digital Tracking and Reporting"
                                        />
                                        <Typography>
                                            We connect with underserved communities through 200+ verified NGOs/Government Institutions
                                        </Typography>
                                    </Box>
                                </li>
                                <li>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            padding: '16px',
                                            position: "relative",
                                            height: "150px",
                                        }}
                                    >
                                        <img
                                            style={{ width: '200px', marginBottom: '8px' }}
                                            src={Group}
                                            alt="Digital Tracking and Reporting"
                                        />
                                        <Typography>
                                            We connect with underserved communities through 200+ verified NGOs/Government Institutions
                                        </Typography>
                                    </Box>
                                </li>
                                <li>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            padding: '16px',
                                            position: "relative",
                                            height: "150px",
                                            top: "150px",
                                            right: { lg: "250px", md: "215px" }
                                        }}
                                    >
                                        <Box sx={{ width: "431px", height: "60px", background: "rgba(206, 215, 206, 1)", borderRadius: "32px" }}>
                                            <Typography color="primary.main" variant='h6' sx={{ position: "relative", bottom: "35px" }}>Digital Tracking and Reporting</Typography>
                                        </Box>

                                    </Box>
                                </li>
                                <li>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            padding: '16px',
                                            position: "relative",
                                            height: "150px",
                                            top: "50px"

                                        }}
                                    >
                                        <img
                                            style={{ width: '200px', marginBottom: '8px' }}
                                            src={Img5}
                                            alt="Digital Tracking and Reporting"
                                        />
                                        <Typography>
                                            We connect with underserved communities through 200+ verified NGOs/Government Institutions
                                        </Typography>
                                    </Box>
                                </li>
                                <li>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            padding: '16px',
                                            position: "relative",
                                            height: "10px",
                                        }}
                                    >

                                    </Box>
                                </li>
                                <li>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            padding: '16px',
                                            position: "relative",
                                            height: "150px",
                                            top: "30px"
                                        }}
                                    >

                                    </Box>
                                </li>
                                <li>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            padding: '16px',
                                            position: "relative",
                                            height: "150px",
                                            position: "relative",
                                            bottom: "180px"
                                        }}
                                    >
                                        <img
                                            style={{ width: '200px', marginBottom: '8px' }}
                                            src={Img6}
                                            alt="Digital Tracking and Reporting"
                                        />
                                        <Typography>
                                            We connect with underserved communities through 200+ verified NGOs/Government Institutions
                                        </Typography>
                                    </Box>
                                </li>
                                <li>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            padding: '16px',
                                            position: "relative",
                                            height: "160px",
                                            bottom: "50px"
                                        }}
                                    >
                                        <img
                                            style={{ width: '200px', marginBottom: '8px' }}
                                            src={Img6}
                                            alt="Digital Tracking and Reporting"
                                        />
                                        <Typography>
                                            We connect with underserved communities through 200+ verified NGOs/Government Institutions
                                        </Typography>
                                    </Box>
                                </li>

                            </ul>
                            <Box style={{ clear: "both" }}></Box>
                        </div>
                    </Grid>
                </Container>
            </Box >
        </>
    );
};

export default TimeLine;
