import React, { useState, useEffect } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { Container } from '@mui/system';

const TestimonialSlider = () => {
  const [visibleIndex, setVisibleIndex] = useState(0);
  const testimonials = [
    { src: require('./assets/Ellipse 7.svg').default, alt: 'Student 1', 
      name:"Shahnaaz",
      place:"banglore",
      text:"From a rural student without resources to a skilled coder at Natwest, the laptop I received from Navgurukul was the key that unlocked my potential and transformed my future."},
    { src: require('./assets/Ellipse 7.svg').default, alt: 'Student 2',
      name:"Komal",
      place:"Pune",
      text:"From a rural student without resources to a skilled coder at Natwest, the laptop I received from Navgurukul was the key that unlocked my potential and transformed my future."
     },
    { src: require('./assets/Ellipse 7.svg').default, alt: 'Student 3',
      name:"Pooja",
      place:"Maharashtra",
      text:"From a rural student without resources to a skilled coder at Natwest, the laptop I received from Navgurukul was the key that unlocked my potential and transformed my future."
     },
    { src: require('./assets/Ellipse 7.svg').default, alt: 'Student 4',
      name:"Rupa",
      place:"delhi",
      text:"From a rural student without resources to a skilled coder at Natwest, the laptop I received from Navgurukul was the key that unlocked my potential and transformed my future."
     },
    { src: require('./assets/Ellipse 7.svg').default, alt: 'Student 5',
      name:"Rani",
      place:"banglore",
      text:"From a rural student without resources to a skilled coder at Natwest, the laptop I received from Navgurukul was the key that unlocked my potential and transformed my future."
     },
  ];

  const handleNextClick = () => {
    if (visibleIndex + 2 < testimonials.length) {
      setVisibleIndex(visibleIndex + 2);
    } else {
      setVisibleIndex(0); // Reset to the beginning
    }
  };

  const handlePrevClick = () => {
    if (visibleIndex > 0) {
      setVisibleIndex(visibleIndex - 2);
    } else {
      setVisibleIndex(testimonials.length - 2); // Go to the last pair
    }
  };

  useEffect(() => {
    const interval = setInterval(handleNextClick, 10000); // Scroll every 5 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, [visibleIndex]);

  return (
    <Box style={{ backgroundColor: "#5C785A" }}>
      <Container sx={{ py: 10 }}>
        <Typography variant="h5" style={{ color: "white", padding: "32px 0px" }}>Student Speaks</Typography>
        <Box display="flex" alignItems="center" position="relative">
          <IconButton onClick={handlePrevClick} disabled={visibleIndex === 0} 
          style={{ position: "absolute", left:"-100px" }}>
            <ChevronLeftIcon style={{ color: "#FFFFFF" }} />
          </IconButton>
          <Box
            sx={{
              display: 'flex',
              overflow: 'hidden',
              width: '100%', // Adjust the width to fit two testimonials
            }}
          >
            <Box
              sx={{
                display: 'flex',
                transform: `translateX(-${visibleIndex * 50}%)`,
                transition: 'transform 0.5s ease-in-out', // Smooth scrolling
                width: `${testimonials.length * 50}%`, // Adjust the width to the total number of testimonials
              }}
            >
              {testimonials.map((testimonial, index) => (
                <Box key={index} flexShrink={0} sx={{ width: '50%' }} color="white">
                  <Typography variant="body1">{testimonial.text}</Typography>
                  <img src={testimonial.src} alt={testimonial.alt} style={{ padding: "0px", width: "64px", height: "64px" }} />
                  <Typography variant="subtitle1">{testimonial.name}</Typography>
                  <Typography variant="body2">({testimonial.place})</Typography>
                </Box>
              ))}
            </Box>
          </Box>
          <IconButton
            onClick={handleNextClick}
            disabled={visibleIndex + 2 >= testimonials.length}
            style={{ position: "absolute", right: "-20px", color: "#FFFFFF" }}
          >
            <ChevronRightIcon style={{ color: "#FFFFFF" }} />
          </IconButton>
        </Box>
      </Container>
    </Box>
  );
};

export default TestimonialSlider;
