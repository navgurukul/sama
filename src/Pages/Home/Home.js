import React from 'react';
import './Home.css';
import { Container, Grid, Typography, Button, Card, CardContent ,Box} from '@mui/material';
import BackgroundImg from '../../common/BackgroundImg';
import homepgeimg from './assets/Homepagebackground.JPG'
import { useNavigate } from 'react-router-dom';
import ImageGrid from './ImageGrid';
import DonorLogos from '../Home/DonorLogos';

function Home() {
  const navigate = useNavigate();
   const handleButtonClick = () => {
    navigate('/give-today');
  };

  const handleClick = () => {
    navigate('/about');
  };
  
  const handleClickEquality = () => {
    navigate('/our-approach');
  };

  return (
    <>
      <BackgroundImg
      text="Where yesterday's devices power tomorrow's innovators"
      textColor="white"
      bgImage={homepgeimg}
      buttonText="Give Today"
      buttonOnClick={handleButtonClick}
    />
    <Box className="gradient-background">
      <Container  maxWidth="md" >
        <Typography variant="h4" align="center" >
          About Us
        </Typography>
        <Typography variant="body1" align="center" sx={{mt:3, mb:1}} >
          Sama, a non-profit organisation, and a subsidiary of NavGurukul, helps modern businesses responsibly repurpose their e-waste for educational usage by underserved women. Our aim is to embed Net Zero Through Giving into the culture of a client organisation so that every member understands the role they can play in supporting the transition towards a greener and inclusive future.’
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 2 }}>
          <Button variant="contained" color="primary" onClick={handleClick}>
            Know More
          </Button>
        </Box>
        
      </Container>
       <Container  maxWidth="md"  sx={{mt:4}}>
        <Typography variant="h4" align="center" >
          Here’s how we do it: From E-Waste to E-quality 
        </Typography>
        <Typography variant="body1" align="center" sx={{mt:3, mb:1}} >
          Sama is not just a laptop donation project; it's a comprehensive education initiative aimed at empowering 1 million girls and women by 2030 with cutting-edge devices and skills, leveraging the existing infrastructure of our corporate partners.        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 2 }}>
          <Button variant="contained" color="primary" onClick={handleClickEquality}>
            Know More
          </Button>
        </Box>
        
      </Container>
    </Box>
     <Box >
     <Container  maxWidth="md" sx={{mt:10}}>
       <Typography variant="h4" align="center"  color="primary" >
        SDGs WE WORK WITH
       </Typography>
       <Typography variant="body1" align="center" sx={{mt:3, mb:3}} >
       Sama's mission of repurposing e-waste for educational use by underserved women aligns with several UN Sustainable Development Goals. Our "Net Zero Through Giving" approach contributes to the following SDGs:
      
      </Typography>
      <ImageGrid />
        
     </Container>
    </Box>
     <Box >
     <Container  maxWidth="md" sx={{mt:10}}>
        <DonorLogos />
     </Container>
    </Box>
    </>
  );
}

export default Home;
