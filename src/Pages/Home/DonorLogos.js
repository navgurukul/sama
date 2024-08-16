import React, { useState, useEffect } from 'react';
import { Box, Button, Card, CardMedia, Container, Typography } from '@mui/material';
import { styled } from '@mui/system';
import amazonlogo from "./assets/amzon.jpg"; 


const CarouselContainer = styled(Box)({
  display: 'flex',
  overflow: 'hidden',
  position: 'relative',
});

const CarouselWrapper = styled(Box)({
  display: 'flex',
  transition: 'transform 0.5s ease',
});

const CarouselItem = styled(Box)({
  flex: '0 0 auto',
  width: 'calc(50% - 20px)', 
  margin: '0 10px', 
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const logos = [
  { src: amazonlogo, alt: 'Amazon' },
  { src: amazonlogo, alt: 'Macquarie' },
  { src: amazonlogo, alt: 'Fossil' },
  { src: amazonlogo, alt: 'MSDF' },
  { src: amazonlogo, alt: 'DXC' },
  { src: amazonlogo, alt: 'Tiger Analytics' },
];

const DonorLogos = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : Math.ceil(logos.length / 2) - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex < Math.ceil(logos.length / 2) - 1 ? prevIndex + 1 : 0));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 3000); 

    return () => clearInterval(interval); 
  }, []);

  return (
    <Container>
      <Typography variant="h4" gutterBottom align="center" >
        Our Laptop Donors
      </Typography>
      <CarouselContainer sx={{ mt:5, mb:5}} >
        <CarouselWrapper
          style={{ transform: `translateX(-${currentIndex * (100 / 2)}%)` }} 
        >
          {logos.map((logo, index) => (
            <CarouselItem key={index}>
              <Card>
                <CardMedia
                  component="img"
                  image={logo.src}
                  alt={logo.alt}
                  style={{ width: '100%', height: 'auto' }}
                />
              </Card>
            </CarouselItem>
          ))}
        </CarouselWrapper>
        <Button
          onClick={handlePrev}
          style={{
            position: 'absolute',
            top: '50%',
            left: '10px',
            transform: 'translateY(-50%)',
            zIndex: 1,
          }}
        >
          Prev
        </Button>
        <Button
          onClick={handleNext}
          style={{
            position: 'absolute',
            top: '50%',
            right: '10px',
            transform: 'translateY(-50%)',
            zIndex: 1,
          }}
        >
          Next
        </Button>
      </CarouselContainer>
    </Container>
  );
};

export default DonorLogos;

