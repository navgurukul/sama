import React, { useState } from "react";
import { Container, Grid, Button, Typography, Box } from "@mui/material";
import HomeImg from "./assets/HeroSection.svg";
import "./Styles.css";
import TestimonialSlider from "./TestimonialSlider";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LaptopDonor from "./LaptopDonor";
import ContactForm from "./ContactForm";
import useMediaQuery from "@mui/material/useMediaQuery";
import diamond from "./assets/dimanod.png";
import SamaGroupImage from './assets/Group365.png';
import BGIMG from "./assets/BGIMG.svg"
function Home() {
  const [impact, setImpact] = useState("environmental");
  const isActive = useMediaQuery("(max-width:600px)");
  const isActiveIpad = useMediaQuery("(max-width:1300px)");

  const commonImageStyle = {
    width: "100%",
    height: "324px",
    objectFit: "cover",
    boxShadow: "0px 1px 2px 0px rgba(74, 74, 74, 0.06), 0px 2px 1px 0px rgba(74, 74, 74, 0.04), 0px 1px 5px 0px rgba(74, 74, 74, 0.08)"

  };

  const commonOverlayImageStyle = {
    position: 'absolute',
    width: '167px',
    height: 'auto',
    bottom: '15px',
    right: '15px',
    height: "167px",
    boxShadow: "0px 1px 2px 0px rgba(74, 74, 74, 0.06), 0px 2px 1px 0px rgba(74, 74, 74, 0.04), 0px 1px 5px 0px rgba(74, 74, 74, 0.08)"
  };

  return (
    <>
      <Box
        sx={{
          backgroundImage: `url(${diamond}), url(${HomeImg})`,
          backgroundSize: "cover, cover",
          backgroundPosition: "center, center",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
        paddingY={isActive ? 5 : 28}
      >
        <Container maxWidth="lg">
          <Typography align="center" variant="h3" className={!isActive ? "hero-text" : "hero-text-large"}>
            Where yesterday's devices power tomorrow's innovators
          </Typography>
          <Typography variant="body1" margin="0 8px" style={{ color: "#FFF" }}>
            Bridging Digital Divide Through Repurposed Devices
          </Typography>
          <Button variant="contained" color="primary" href="/donate" sx={{ mt: 6, borderRadius: "100px", padding: "0px 32px 0px 32px" }}>
            Donate Now
          </Button>
        </Container>
      </Box>
      <LaptopDonor />
      <Box sx={{ my: 10 }}>
        <Container maxWidth="lg">
          <Typography variant="h5" align="left" mb={4}></Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom style={{ color: "#5C785A" }}>
                About Us
              </Typography>
              <Typography variant="body1" gutterBottom>
                Sama, a non-profit organisation, and a subsidiary of NavGurukul, helps modern businesses responsibly repurpose their e-waste for educational usage by underserved women. Our aim is to embed Net Zero Through Giving into the culture of a client organisation so that every member understands the role they can play in supporting the transition towards a greener and inclusive future.
              </Typography>
              <a href="/about" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", marginTop: "16px" }}>
                <Typography variant="subtitle1" color="primary" sx={{ fontWeight: "bold", fontSize: "18px" }}>Know more</Typography>
                <ChevronRightIcon color="primary" />
              </a>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom style={{ color: "#5C785A" }}>
                Our Approach
              </Typography>
              <Typography variant="body1" gutterBottom>
                Sama is not just a laptop donation project; it's a comprehensive education initiative aimed at empowering 1 million girls and women by 2030 with cutting-edge devices and skills, leveraging the existing infrastructure of our corporate partners.
              </Typography>
              <a href="/about" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", marginTop: "16px" }}>
                <Typography variant="subtitle1" color="primary" sx={{ fontWeight: "bold", fontSize: "18px" }}>Know more</Typography>
                <ChevronRightIcon color="primary" />
              </a>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Box sx={{ backgroundColor: "#F0F4EF", py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h5" margin="32px 0px">Our Goals for 2030</Typography>
          <Grid container spacing={4}>
            {[
              { src: require("./assets/image 9.svg").default, value: "2.4 M", description: "kgs of Resource Waste Reduction" },
              { src: require("./assets/image 11.svg").default, value: "8.6 M", description: "grams of Toxic Waste Reduction" },
              { src: require("./assets/image 10.svg").default, value: "400 M", description: "kgs of Carbon Footprint Reduction" },
              { src: require("./assets/image 9 (1).svg").default, value: "1 M", description: "Beneficiaries of Digital Inclusion" },
              { src: require("./assets/image 12.svg").default, value: "4 M", description: "Hours average per day of Learning Hours" },
            ].map((item, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box>
                  <img src={item.src} alt={item.description} />
                  <Typography variant="h5" color="primary" marginTop="8px">{item.value}</Typography>
                  <Typography variant="body1" color="primary">{item.description}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
          <Typography variant="body2" color="#4A4A4A" sx={{
            fontFamily: 'Raleway',
            fontSize: '14px',
            fontStyle: 'normal',
            fontWeight: 400,
            my: 4,
            lineHeight: '170%'
          }} gutterBottom>
            *All calculations based on relevant people benefiting from 1 M laptops by 2030
          </Typography>
        </Container>
      </Box>
      {/* <Container maxWidth="xxl" style={{ padding: 0, backgroundColor: "#F0F4EF" }}>
        <img
          src={BGIMG}
          alt="Sama Group"
          style={{ display: "block", width: "100%", margin: 0, padding: 0 }}
        />
      </Container>  */}
      <Container maxWidth="xxl" style={{ padding: 0, backgroundColor: "#F0F4EF", position: "relative" }}>
        <img
          src={BGIMG}
          alt="Sama Group"
          style={{ display: "block", width: "100%", margin: 0, padding: 0 }}
        />
        <div className="main-circle">
          <div className="circle">
            <span className="circle-text">
              magine 1 million underprivileged women holding laptops.
              This is the future we’re building at Sama by<br></br>
              2030
            </span>
          </div>
        </div>
      </Container>

      <Container maxWidth="lg" sx={{ my: 10 }}>
        <Typography variant="h5">Metrics that Matter</Typography>
        <Typography variant="body1">Here’s how the impact is measured through data driven insights</Typography>
        <Box sx={!isActive && { display: 'flex', my: 4 }} spacing={3}>
          <Button color="primary" variant={impact === "environmental" ? "contained" : "outlined"}
            style={isActive ? { marginTop: "16px" } : { borderRadius: "100px" }}
            onClick={() => setImpact("environmental")}>
            Environmental Impact
          </Button>
          <Button color="primary" variant={impact === "social" ? "contained" : "outlined"}
            style={isActive ? { margin: "16px 0px" } : { borderRadius: "100px", marginLeft: "32px" }}
            onClick={() => setImpact("social")}>
            Social Impact
          </Button>
        </Box>
        <Box className="dashboardBox">
          {impact === "environmental" ? (
            <img src={require("./assets/Sama - Environmental Impact.jpg")} height="auto" width="100%" alt="sama" sx={{ shadows: "" }} />
          ) : (
            <img src={require("./assets/Sama - Social Impact.jpg")} height="auto" width="100%" alt="sama social" />
          )}
        </Box>
      </Container>

      <Box sx={{ my: 10 }}>
        <Container maxWidth="lg">
          <Typography variant="h5">Sustainability Development Goals</Typography>
          <Typography variant="body1" style={{ width: "65%", margin: "32px 0px" }}>
            Sama's mission of repurposing e-waste for educational use by underserved women aligns with several UN Sustainable Development Goals. Our "Net Zero Through Giving" approach contributes to the following SDGs:
          </Typography>
          <Grid container spacing={3}>
            {[
              { src: "./assets/sub_1.jpg", overlaySrc: require("./assets/E_GIF_04.gif"), alt: "Gender Equality" },
              { src: "./assets/sub_2.jpg", overlaySrc: require("./assets/E_GIF_05.gif"), alt: "Gender Equality" },
              { src: "./assets/sub_4.jpg", overlaySrc: require("./assets/E_GIF_08.gif"), alt: "quality education" },
              { src: "./assets/laptop_1.jpg", overlaySrc: require("./assets/E_GIF_12.gif"), alt: "growth" },
              { src: "./assets/ngStudent.jpg", overlaySrc: require("./assets/E_GIF_13.gif"), alt: "climate action" },
            ].map((item, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box sx={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
                  <img src={require(`${item.src}`)} alt={item.alt} style={commonImageStyle} />
                  <img src={item.overlaySrc} alt={item.alt} style={commonOverlayImageStyle} />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      <TestimonialSlider />
      <ContactForm />
    </>
  );
}

export default Home;