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
import BGIMG from "./assets/Group365.png";
function Home() {

  const [impact, setImpact] = useState("environmental");
  const isActive = useMediaQuery("(max-width:600px)");
  const isActiveIpad = useMediaQuery("(max-width:1300px)");
  const isXs = useMediaQuery('(max-width:600px)');

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
          width:"100%"
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
          <Button variant="contained" color="primary" href="/donate" sx={{ mt: 6, borderRadius: "100px" }}>
            Donate Now
          </Button>
        </Container>
      </Box>
      <LaptopDonor />

      <Box sx={{ my: 10 }} >
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
              <a href="/our-approach" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", marginTop: "16px" }}>
                <Typography variant="subtitle1" color="primary" sx={{ fontWeight: "bold", fontSize: "18px" }}>Know more</Typography>
                <ChevronRightIcon color="primary" />
              </a>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Box sx={{ backgroundColor: "#F0F4EF", py: 6, }}>
        <Container maxWidth="lg" >
          <Typography variant="h5" margin="32px 0px" sx={{ textAlign: "center" }}>Our Goals for 2030</Typography>
          <Grid container spacing={4} sx={{ justifyContent: "center" }}>
            {/* First Row - Three Items */}
            {[
              { src: require("./assets/image 9.svg").default, value: "2.4 M", description: "kgs of Resource Waste Reduction" },
              { src: require("./assets/image 11.svg").default, value: "8.6 M", description: "grams of Toxic Waste Reduction" },
              { src: require("./assets/image 10.svg").default, value: "400 M", description: "kgs of Carbon Footprint Reduction" },
            ].map((item, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box sx={{ textAlign: "center" }}>
                  <img src={item.src} alt={item.description} />
                  <Typography variant="h5" color="primary" mt={1}>{item.value}</Typography>
                  <Typography variant="body1" sx={{ color: '#4A4A4A' }}>{item.description}</Typography>
                </Box>
              </Grid>
            ))}

            <Grid
              item
              xs={12}
              md={8}
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' }, 
                justifyContent: 'center',
                alignItems: 'center',
                gap: 4,
               
              }}
            >
              {[
                { src: require("./assets/image 9 (1).svg").default, value: "1 M", description: "Beneficiaries of Digital Inclusion" },
                { src: require("./assets/image 12.svg").default, value: "4 M", description: "Hours average per day of Learning Hours" },
              ].map((item, index) => (
                <Box key={index} sx={{ textAlign: "center", width: "100%", maxWidth: "400px" }}>
                  <img src={item.src} alt={item.description} />
                  <Typography variant="h5" color="primary" mt={1}>{item.value}</Typography>
                  <Typography variant="body1" sx={{ color: '#4A4A4A' }}>{item.description}</Typography>
                </Box>
              ))}
            </Grid>
          </Grid>
          <Typography variant="body2"
            color="#4A4A4A"
            sx={{
              fontFamily: 'Raleway',
              fontSize: '14px',
              fontStyle: 'normal',
              fontWeight: 400,
              my: 4,
              lineHeight: '170%',
              textAlign: "center"
            }} gutterBottom>
            *All calculations based on relevant people benefiting from 1 M laptops by 2030
          </Typography>
        </Container>
      </Box>

      {/* <Container
        maxWidth="xxl"
        style={containerStyles}
      >
        {!isXs && (
          <img
            src={BGIMG}
            style={imageStyles}
            alt="Sama Group"
          />
        )}

        <Box
          className="circle"
          sx={circleBox}
        >
          <Typography
            variant="h6"
            sx={text}
          >
            Imagine 1 million underprivileged women holding laptops.
            This is the future we’re building at Sama by <br />
            2030
          </Typography>
        </Box>
      </Container> */}
      <Container maxWidth="xxl" style={{ padding: 0, background: "#F0F4EF" }}>
        <img
          src={BGIMG}
          alt="Sama Group"
          style={{ display: "block", width: "100%", margin: 0, padding: 0 }}
        />
      </Container>


      <Container maxWidth="lg" sx={{ py: "80px"}}>
        <Typography variant="h5" textAlign="center">Metrics that Matter</Typography>
        <Typography variant="body1" textAlign="center" mt={2}>Here’s how the impact is measured through data driven insights</Typography>
        <Box sx={!isActive && { display: 'flex', my: 4 , justifyContent:"center", alignItems:"center"}} spacing={3}>
          <Button color="primary" variant={impact === "environmental" ? "contained" : "outlined"}
            style={isActive ? { marginTop: "16px" } : { borderRadius: "100px" }}
            onClick={() => setImpact("environmental")}
            sx={{ width:{xs:"100%",sm:"280px"}}}>
            Environmental Impact
          </Button>
          <Button color="primary" variant={impact === "social" ? "contained" : "outlined"}
            style={isActive ? { margin: "16px 0px" } : { borderRadius: "100px", marginLeft: "24px" }}
            onClick={() => setImpact("social")}
            sx={{ width:{xs:"100%",sm:"280px"}}}>
            Social Impact
          </Button>
        </Box>
        <Box>
          {impact === "environmental" ? (
            <img src={require("./assets/Sama - Environmental Impact.jpg")} height="auto" width="100%" alt="sama" style={{ boxShadow: "0px 1px 2px 0px rgba(74, 74, 74, 0.06), 0px 2px 1px 0px rgba(74, 74, 74, 0.04), 0px 1px 5px 0px rgba(74, 74, 74, 0.08)", borderRadius: "16px" }}
            />
          ) : (
            <img src={require("./assets/Sama - Social Impact.jpg")} height="auto" width="100%" alt="sama social" style={{ boxShadow: "0px 1px 2px 0px rgba(74, 74, 74, 0.06), 0px 2px 1px 0px rgba(74, 74, 74, 0.04), 0px 1px 5px 0px rgba(74, 74, 74, 0.08)", borderRadius: "16px" }} />
          )}
        </Box>
      </Container>

      <Box>
        <Container maxWidth="lg" sx={{ py: "80px",  justifyItems: "center" }}>
          <Typography variant="h5" sx={{ textAlign: "center" }}>Sustainability Development Goals</Typography>
          <Typography variant="body1" style={{ width: "65%", margin: "16px 0px", textAlign: "center" }}>
            Sama's mission of repurposing e-waste for educational use by underserved women aligns with several UN Sustainable Development Goals. Our "Net Zero Through Giving" approach contributes to the following SDGs:
          </Typography>
          <Grid container spacing={4} sx={{ mt: { xs: 0, md: 2 } }}>
            {[
              { src: "./assets/sub_1.jpg", overlaySrc: require("./assets/h1.png"), alt: "Gender Equality" },
              { src: "./assets/sub_2.jpg", overlaySrc: require("./assets/h2.png"), alt: "Gender Equality" },
              { src: "./assets/sub_4.jpg", overlaySrc: require("./assets/h3.png"), alt: "Quality Education" },
            ].map((item, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box sx={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
                  <img src={require(`${item.src}`)} alt={item.alt} style={commonImageStyle} />
                  <img src={item.overlaySrc} alt={item.alt} style={commonOverlayImageStyle} />
                </Box>
              </Grid>
            ))}

            <Grid
              item
              xs={12}
              md={8}
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'center',
                alignItems: 'center',
                gap: 4,
                marginLeft: { xs: "0px", md: "200px" }
              }}
            >
              {[
                { src: "./assets/laptop_1.jpg", overlaySrc: require("./assets/h4.png"), alt: "Growth" },
                { src: "./assets/ngStudent.jpg", overlaySrc: require("./assets/h5.png"), alt: "Climate Action" },
              ].map((item, index) => (
                <Box key={index} sx={{ position: 'relative', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                  <img src={require(`${item.src}`)} alt={item.alt} style={commonImageStyle} />
                  <img src={item.overlaySrc} alt={item.alt} style={commonOverlayImageStyle} />
                </Box>
              ))}
            </Grid>
          </Grid>
        </Container>
      </Box>
      <TestimonialSlider />
      <ContactForm />
    </>
  );
}

export default Home;