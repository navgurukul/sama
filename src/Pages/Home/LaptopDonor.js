import React from "react";
import { Box, Typography } from "@mui/material";
import "./Styles.css"; 

const LaptopDonorsCarousel = () => {
  const images = [
    { src: require("./assets/amazon.svg").default, alt: "Amazon" },
    { src: require("./assets/Frame 31289.svg").default, alt: "Macquarie" },
    { src: require("./assets/tiger.svg").default, alt: "Tiger Analytics" },
    { src: require("./assets/Fossil.svg").default, alt: "Fossil" },
    { src: require("./assets/Frame 31293.svg").default, alt: "DXC" },
    { src: require("./assets/Frame 31292.svg").default, alt: "DXC" },
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
