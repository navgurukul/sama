import React, { useEffect, useRef } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { borderRadius, Container, padding } from '@mui/system';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import useMediaQuery from '@mui/material/useMediaQuery';

const TestimonialSlider = () => {
  const testimonials = [
    {
      src: require('./assets/alfiya.jpg'),
      alt: 'Student 9',
      name: "Alfiya D",
      place: "Bangalore",
      text: "Coming from an economically challenged background, I couldn't afford computer classes, while my peers in private schools had access. Thanks to Sama and Vimukthi Vidya Samsthe, I now have the opportunity to learn computers in school."
    },
    {
      src: require('./assets/shahnaaz.jpg'),
      alt: 'Student 1',
      name: "Shahnaaz",
      place: "Bangalore",
      text: "From a rural student without resources to a skilled coder at Natwest, the laptop I received from Navgurukul was the key that unlocked my potential and transformed my future."
    },
    {
      src: require('./assets/anjali.jpg'),
      alt: 'Student 2',
      name: "Anjali Singh",
      place: "Pune",
      text: "With a laptop as my tool, I've transitioned from a NavGurukul " +
        "student to an academic intern, connecting with diverse learners across India and fostering personal growth."
    },
    {
      src: require('./assets/riya.png'),
      alt: 'Student 3',
      name: "Riya Kumari",
      place: "Maharashtra",
      text: "From not knowing how to use a laptop to S&P Global employee: NavGurukul's tech-enabled training launched my career in just one year."

    },
    {
      src: require('./assets/ziya.png'),
      alt: 'Student 4',
      name: "Ziya Afreen",
      place: "Delhi",
      text: "This laptop isn't just a tool; it's my bridge from a novice to a future software developer."
    },
    {
      src: require('./assets/komal.png'),
      alt: 'Student 5',
      name: "Komal Chaudhary",
      place: "Bangalore",
      text: "Before, I couldn't even turn a laptop on. Now, I can't imagine a day of learning without it."
    },
    {
      src: require('./assets/sonam.png'),
      alt: 'Student 6',
      name: "Sonam",
      place: "Indore",
      text: "Sama and NavGurukul enabled my education by providing a laptop and placement support, helping me secure a job at Amazon. Their guidance and resources have been invaluable in shaping my career."
    },
    {
      src: require('./assets/ruchi.jpg'),
      alt: 'Student 7',
      name: "Ruchi",
      place: "Sarjapur",
      text: "NavGurukul support and Sama's laptop donation was crucial in my career. Today, I work as a Frontend Developer at Accenture, grateful for the empowerment and opportunities they provided."
    },
    
  ];

  const isMobile = useMediaQuery('(max-width:600px)');

  
  const groupedTestimonials = isMobile
    ? testimonials.map((testimonial, inde) => [testimonial])
    : [
      [testimonials[0], testimonials[1]],
      [testimonials[2], testimonials[3]],
      [testimonials[4],testimonials[5]],
      [testimonials[6], testimonials[7]],
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
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (slider) slider.current?.next();
    }, 10000);

    return () => clearInterval(intervalRef.current);
  }, [slider]);

  const handlePrevClick = () => {
    if (slider) slider.current?.prev();
  };

  const handleNextClick = () => {
    if (slider) slider.current?.next();
  };

  return (
    <Box style={{ backgroundColor: "#5C785A"}}>
      <Container maxWidth="lg" sx={isMobile ? { py: 4 } : { py: 10 }}>
        <Typography variant="h5" style={{ color: "#FFF" }}>
          Testimonials from our Beneficiaries
        </Typography>

         <Box display="flex" alignItems="center" position="relative" mt={3}>
          <IconButton onClick={handlePrevClick} style={{ position: "absolute", left: "-100px" }}>
            <ChevronLeftIcon style={{ color: "#FFFFFF",width:"40.74px",height:"40.74px"}} />
          </IconButton>
           <Box ref={sliderRef} className="keen-slider"
            sx={{
              overflow: 'hidden',
              width: '100%',
              color: "#FFF",
              marginTop: "16px",
            }}>
            {groupedTestimonials.map((group, index) => (
              <Box key={index} className="keen-slider__slide" display="flex" sx={{ width: '100%' }} color="white">
                {group.map((testimonial, idx) => (
                  <Box key={idx} sx={isMobile ? { width: '100%' } : { width: '50%', paddingRight: '16px' }}>

                    <Typography  variant="body1" sx={{ height:{sx:"100px", md: "100px"},color: {xs:"#FFF", md:"#FFF"}, }}>{testimonial.text}</Typography>
                    <Box style={{width:"64px",height:"64px",border: "4px solid rgba(178, 95, 101, 1)",marginTop:"48px",borderRadius:"50px"}}>
                    <img src={testimonial.src} alt={testimonial.alt} 
                      style={{
                        
                        width:"64px",
                        height: "64px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        // marginTop: {xs:"20px",md:"0px"},
                      }} />
                      </Box>
                    <Typography variant="subtitle1" sx={{mt:2,fontWeight:"bold",color: {xs:"#FFF", md:"#FFF"},}}>{testimonial.name}</Typography>
                  </Box>
                ))}
              </Box>
            ))}
          </Box> 
           <IconButton onClick={handleNextClick} style={{ position: "absolute", right: "-10px", color: "#FFFFFF" }}>
            <ChevronRightIcon style={{ color: "#FFFFFF",width:"40.74px",height:"40.74px"}}  />
          </IconButton>  
         </Box> 
      </Container>
    </Box>
  );
};

export default TestimonialSlider;