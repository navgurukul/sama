import React from "react";
import { Box, Typography } from "@mui/material";
import "./Styles.css"; 

const LaptopDonorsCarousel = () => {
  const images = [
    { src: require("./assets/Logo1.png"), alt: "Amazon" },
    { src: require("./assets/Logo2.png"), alt: "Macquarie" },
    { src: require("./assets/Logo3.png"), alt: "Tiger Analytics" },
    { src: require("./assets/Logo4.png"), alt: "fossil" },
    { src: require("./assets/LOgo5.png"), alt: "DXC" },
    { src: require("./assets/Logo6.png"), alt: "DXC" },
  ];

  return (
    <Box sx={{ py: 10, backgroundColor: "#F0F4EF" }}>
      <Typography variant="h5" align="center" marginBottom={7}>
        Our Laptop Donors
      </Typography>
      <Box className="carousel-container">
        <Box className="carousel-content">
          {[...images, ...images].map((image, index) => (
            <Box
              key={index}
              sx={{
                display: "inline-block",
                flexShrink: 0,
                width: "20%", 
                textAlign: "center",
              }}
            >
              <img
                src={image.src}
                alt={image.alt}
                style={{ maxWidth: "100%", height: "auto" }}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default LaptopDonorsCarousel;
