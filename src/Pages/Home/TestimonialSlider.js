import React, { useEffect, useRef } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { Container } from '@mui/system';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';

const TestimonialSlider = () => {
  const testimonials = [
    {
      src: require('./assets/Ellipse 7.svg').default,
      alt: 'Student 1',
      name: "Shahnaaz",
      place: "Bangalore",
      text: "From a rural student without resources to a skilled coder at Natwest, the laptop I received from Navgurukul was the key that unlocked my potential and transformed my future."
    },
    {
      src: require('./assets/Ellipse 7.svg').default,
      alt: 'Student 2',
      name: "Komal",
      place: "Pune",
      text: "From a rural student without resources to a skilled coder at Natwest, the laptop I received from Navgurukul was the key that unlocked my potential and transformed my future."
    },
    {
      src: require('./assets/Ellipse 7.svg').default,
      alt: 'Student 3',
      name: "Pooja",
      place: "Maharashtra",
      text: "From a rural student without resources to a skilled coder at Natwest, the laptop I received from Navgurukul was the key that unlocked my potential and transformed my future."
    },
    {
      src: require('./assets/Ellipse 7.svg').default,
      alt: 'Student 4',
      name: "Rupa",
      place: "Delhi",
      text: "From a rural student without resources to a skilled coder at Natwest, the laptop I received from Navgurukul was the key that unlocked my potential and transformed my future."
    },
    {
      src: require('./assets/Ellipse 7.svg').default,
      alt: 'Student 5',
      name: "Rani",
      place: "Bangalore",
      text: "From a rural student without resources to a skilled coder at Natwest, the laptop I received from Navgurukul was the key that unlocked my potential and transformed my future."
    },
  ];

  const slides = [
    testimonials.slice(0, 2),
    testimonials.slice(2, 4),
    testimonials.slice(4, 5),
  ];

  const [sliderRef, slider] = useKeenSlider({
    loop: true,
    slides: {
      perView: 1,
      spacing: 10,
    },
  });

  const intervalRef = useRef(null);

  useEffect(() => {
    // Clear existing interval
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Set up new interval for autoplay
    intervalRef.current = setInterval(() => {
      if (slider) slider.current?.next();
    }, 10000); // 10 seconds between slides

    return () => clearInterval(intervalRef.current); // Cleanup on unmount
  }, [slider]);

  const handlePrevClick = () => {
    if (slider) slider.current?.prev();
  };

  const handleNextClick = () => {
    if (slider) slider.current?.next();
  };

  return (
    <Box style={{ backgroundColor: "#5C785A" }}>
      <Container sx={{ py: 7 }}>
        <Typography variant="h5" style={{ color: "#FFF" }}>
          Student Speaks
        </Typography>
        <Box display="flex" alignItems="center" position="relative">
          <IconButton onClick={handlePrevClick} style={{ position: "absolute", left: "-100px" }}>
            <ChevronLeftIcon style={{ color: "#FFFFFF" }} />
          </IconButton>
          <Box ref={sliderRef} className="keen-slider" 
          sx={{ overflow: 'hidden',
           width: '100%', 
           color:"#FFF",
           marginTop: "16px",
            }}>
            {slides.map((slide, index) => (
              <Box key={index} className="keen-slider__slide" display="flex" sx={{ width: '100%' }} color="white">
                {slide.map((testimonial, idx) => (
                  <Box key={idx} sx={{ width: '50%', paddingRight: index === slides.length - 1 && idx === slide.length - 1 ? 0 : '16px' }}>
                    <Typography variant="body1">{testimonial.text}</Typography>
                    <img src={testimonial.src} alt={testimonial.alt} style={{ padding: "0px", width: "64px", height: "64px" }} />
                    <Typography variant="subtitle1">{testimonial.name}</Typography>
                    <Typography variant="body2">({testimonial.place})</Typography>
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
          <IconButton onClick={handleNextClick} style={{ position: "absolute", right: "-20px", color: "#FFFFFF" }}>
            <ChevronRightIcon style={{ color: "#FFFFFF" }} />
          </IconButton>
        </Box>
      </Container>
    </Box>
  );
};

export default TestimonialSlider;

