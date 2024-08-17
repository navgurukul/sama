import React,{useState} from "react";
import { Container, Grid, Button, Typography, Box, Paper, Avatar, TextField } from "@mui/material"; 
import HomeImg from "./assets/HeroSection.svg";
import "./Styles.css";
import TestimonialSlider from "./TestimonialSlider";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LaptopDonor from "./LaptopDonor";
import ContactForm from "./ContactForm";
function Home() {
  const [impact, setImpact] = useState("environmental");
  

  return (
    <>
      {/* Header Section */}
      <Box
      sx={{
        height: "75vh", // Adjusted height
        backgroundImage: `
          linear-gradient(
            to bottom right, 
            rgba(46, 46, 46, 0.7) 25%, 
            rgba(107, 126, 105, 0.7) 50%
          ),
          url(${HomeImg})
        `,
        backgroundSize: "cover, cover", // This ensures both images cover the area
        backgroundPosition: "center, center", // Positions both images
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      
        <Typography 
        style={{fontWeight:700,
           fontSize: "64px", 
           lineHeight: "130%", 
           fontFamily: "Montserrat, sans-serif", 
           color:"#FFF",
           width:"50%"
          }}
        >
          Where yesterday's devices power tomorrow's innovators
        </Typography>
        <Typography variant="body1" margin="0 8px">
        Bridging Generations Through Repurposed Devices
        </Typography>
        <Button variant="contained" color="primary" href="/donate"
         sx={{ mt: 5,borderRadius:"100px", padding:"16px",}}>
          Donate Now
        </Button>
        
      </Box>

      {/* Laptop Donors Section */}
      <LaptopDonor/>
      <Box sx={{ my: 10 }}>
        <Container maxWidth="lg">
        <Typography variant="h5" align="left" mb={4}>
        Stepping Up Progress in this Defining Decade
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom  style={{color:"#5C785A"}}>
            About Us
            </Typography>
            <Typography variant="body1" gutterBottom>
            Sama, a non-profit organisation, and a subsidiary of NavGurukul, 
            helps modern businesses responsibly repurpose their e-waste for 
            educational usage by underserved women. Our aim is to embed Net 
            Zero Through Giving into the culture of a client organisation so 
            that every member understands the role they can play in supporting
            the transition towards a greener and inclusive future.

            </Typography>
            <Button variant="text" href="" color="primary">
              <Typography variant="subtitle1">
              Know more 
              </Typography>
              <ChevronRightIcon />
               </Button>
           </Grid>
          <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom style={{color:"#5C785A"}}>
          Our Approach
            </Typography>
            <Typography variant="body1" gutterBottom>
            Sama is not just a laptop donation project; it's a comprehensive education initiative 
            aimed at empowering 1 million girls and women by 2030 with cutting-edge devices and skills, 
            leveraging the existing infrastructure of our corporate partners.
            </Typography>
            <Button variant="text" href="/our-approach" color="primary">
              <Typography variant="subtitle1">Know more

              </Typography>
              <ChevronRightIcon/>
               </Button>

            </Grid> 
        </Grid>
        </Container>
      </Box>
      {/* Sustainability Development Goals Section */}
      <Box sx={{ my: 10 }}>
        <Container maxWidth="lg">
        <Typography variant="h5" >
          Sustainability Development Goals
        </Typography>
        <Typography variant="body1" style={{width:"65%", margin:"32px 0px"}} >
        Sama's mission of repurposing e-waste for educational use by underserved women aligns with several UN 
        Sustainable Development Goals. Our "Net Zero Through Giving" approach contributes to the following SDGs:
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
          <Box
            sx={{
              position: 'relative',
              width: '100%',  // Set the container width as needed
              maxWidth: '600px', // Example max width, adjust as needed
              margin: '0 auto', // Center the container horizontally
              
            }}
          >
           <img
                src={require("./assets/pretty-smiling.png")}
                alt="Gender Equality"
                style={{ width: "100%", height: "auto",
                 }}
              />
              <img
                src={require("./assets/E_PRINT_04 1.svg").default}
                style={{
                  position: 'absolute',
                  width: '167px', // Adjust the width of the small image
                  height: 'auto',
                  bottom: '10px', // Position 10px from the bottom
                  right: '10px', // Position 10px from the right
                  borderRadius: '8px', // Optional: adds rounded corners
                  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)', // Optional: adds a shadow to the small image
                }}
              />
              </Box>
          </Grid>
          <Grid item xs={12} md={4}>
          <Box
            sx={{
              position: 'relative',
              width: '100%',  // Set the container width as needed
              maxWidth: '600px', // Example max width, adjust as needed
              margin: '0 auto', // Center the container horizontally
              
            }}
          >
           <img
                src={require("./assets/boyportrait.png")}
                alt="Gender Equality"
                style={{ width: "100%", height: "auto",
                 }}
              />
              <img
                src={require("./assets/E_GIF_05 1.svg").default}
                style={{
                  position: 'absolute',
                  width: '167px', // Adjust the width of the small image
                  height: 'auto',
                  bottom: '10px', // Position 10px from the bottom
                  right: '10px', // Position 10px from the right
                  borderRadius: '8px', // Optional: adds rounded corners
                  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)', // Optional: adds a shadow to the small image
                }}
              />
              </Box>
          </Grid>
          <Grid item xs={12} md={4}>
          <Box
            sx={{
              position: 'relative',
              width: '100%',  // Set the container width as needed
              maxWidth: '600px', // Example max width, adjust as needed
              margin: '0 auto', // Center the container horizontally
              
            }}
          >
           <img
                src={require("./assets/pretty-smiling.png")}
                alt="Gender Equality"
                style={{ width: "100%", height: "auto",
                 }}
              />
              <img
                src={require("./assets/E_WEB_08 2.svg").default}
                style={{
                  position: 'absolute',
                  width: '167px', // Adjust the width of the small image
                  height: 'auto',
                  bottom: '10px', // Position 10px from the bottom
                  right: '10px', // Position 10px from the right
                  borderRadius: '8px', // Optional: adds rounded corners
                  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)', // Optional: adds a shadow to the small image
                }}
              />
              </Box>
          </Grid>
          <Grid item xs={12} md={4}>
          <Box
            sx={{
              position: 'relative',
              width: '100%',  // Set the container width as needed
              maxWidth: '600px', // Example max width, adjust as needed
              margin: '0 auto', // Center the container horizontally
              
            }}
          >
           <img
                src={require("./assets/boyportrait.png")}
                alt="Gender Equality"
                style={{ width: "100%", height: "auto",
                 }}
              />
              <img
                src={require("./assets/E_GIF_12 1.svg").default}
                style={{
                  position: 'absolute',
                  width: '167px', // Adjust the width of the small image
                  height: 'auto',
                  bottom: '10px', // Position 10px from the bottom
                  right: '10px', // Position 10px from the right
                  borderRadius: '8px', // Optional: adds rounded corners
                  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)', // Optional: adds a shadow to the small image
                }}
              />
              </Box>
          </Grid>
          <Grid item xs={12} md={4}>
          <Box
            sx={{
              position: 'relative',
              width: '100%',  // Set the container width as needed
              maxWidth: '600px', // Example max width, adjust as needed
              margin: '0 auto', // Center the container horizontally
              
            }}
          >
           <img
                src={require("./assets/pretty-smiling.png")}
                alt="Gender Equality"
                style={{ width: "100%", height: "auto",
                  
                 }}
              />
              <img
                src={require("./assets/E_GIF_13 1.svg").default}
                style={{
                  position: 'absolute',
                  width: '167px', // Adjust the width of the small image
                  height: 'auto',
                  bottom: '10px', // Position 10px from the bottom
                  right: '10px', // Position 10px from the right
                  borderRadius: '8px', // Optional: adds rounded corners
                  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)', // Optional: adds a shadow to the small image
                }}
              />
              </Box>
          </Grid>
        </Grid>
        </Container>
      </Box>

      {/* Our Goals for 2030 Section */}

      <Box sx={{ backgroundColor:"#F0F4EF" ,py:6}} >
        <Container maxWidth="lg" >
          <Typography variant="h5" margin="32px 0px" >
          Our Goals for 2030
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4} paddingBottom={2}>
              <Box >
                <img
                  src={require("./assets/image 9.svg").default}
                  alt
                />
                <Typography variant="h5"  color="primary" marginTop="8px" >
                2.4 M 
                </Typography>
                <Typography variant="body1" color="primary">
                kgs of Resource Waste Redcution
                </Typography>
              </Box>
              </Grid>
              <Grid item xs={12} md={4}>
              <Box>
                <img
                  src={require("./assets/image 11.svg").default}
                  alt
                />
                <Typography variant="h5"  color="primary" marginTop="8px">
                8.6 M
                </Typography>
                <Typography variant="body1" color="primary">
                grams of Toxic Waste Reduction
                </Typography>
              </Box>
              </Grid>
              <Grid item xs={12} md={4}>
              <Box>
                <img
                  src={require("./assets/image 10.svg").default}
                  alt
                />
                <Typography variant="h5" color="primary" marginTop="8px">
                400 M
                </Typography>
                <Typography variant="body1" color="primary" >
                kgs of Carbon Footprint Reduction
                </Typography>
              </Box>
              </Grid>
              <Grid item xs={12} md={4}>
              <Box style={{color:"#5C785A"}}>
                <img
                  src={require("./assets/image 9 (1).svg").default}
                  alt
                  style={{color:"#5C785A"}}
                />
                <Typography variant="h5" color="primary" marginTop="8px" >
                1 M 
                </Typography>
                <Typography variant="body1" color="primary"  >
                Beneficiaries of Digital Inclusion
                </Typography>
              </Box>
              </Grid>
              <Grid item xs={12} md={4}>
              <Box >
                <img
                  src={require("./assets/image 12.svg").default}
                  alt
                  color="primary"
                />
                <Typography variant="h5"  color="primary" marginTop="8px">
                4 M 
                </Typography>
                <Typography variant="body1"  color="primary" >
                Hours average per day of Learning Hours
                </Typography>
              </Box>
              </Grid>
          </Grid>
          <Typography variant="body2" color="primary" sx={{my:4}} gutterBottom>
          *All calculations based on relevant people benefiting from 1 M laptops by 2030
          </Typography>
        </Container>

      </Box>
      {/* Metrics Section */}
      <Container sx={{ my: 10 }}>
        <Typography variant="h5"  >
          Metrics that Matter
        </Typography>
        <Typography variant="body1"  > Here’s how the impact is measured through data driven insights</Typography>
        <Box sx={{ display: 'flex', my: 4 }} spacing={3}>
          <Button variant={impact==="environmental"?"contained":"outlined" } style={{borderRadius:"100px"}}
          onClick={() => setImpact("environmental")}
          >Environmental Impact</Button>
          <Button variant={impact==="social"?"contained":"outlined"} style={{borderRadius:"100px", marginLeft:"32px"}}
          onClick={() => setImpact("social")}>
          Social Impact</Button>
        </Box>
        {impact === "environmental" ? 
        <img src={require("./assets/Sama - Environmental Impact.png")} height="auto" width="100%"/>:
        <img src={require("./assets/Sama - Social Impact.png")} height="auto" width="100%"/>
        
      }
      </Container>

      <TestimonialSlider/>

      {/* Contact Us Section */}
      <ContactForm/>
    </>
  );
}

export default Home;

