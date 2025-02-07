import React from 'react';
import { 
  Box,
  Container,
  Typography,
 } from '@mui/material';
import ourteam from '../OurTeam/style';

const HeaderText = () => {
    return (
        <Container maxWidth="lg" sx={ourteam.container}>
        <Box>
            <Typography variant="h5" gutterBottom>
                What We Do
            </Typography>
            <Typography variant="body1" paragraph sx={{textAlign: "left", justifySelf:"center"}} >
                Sama bridges the digital divide by collecting end-of-life 
                laptops from corporates,<br/> refurbishing them and preloading 
                with educational content, and finally distributing<br/> laptops 
                to underserved communities. We empower women and youth with 
                access to<br/> technology, enabling education, career opportunities, 
                and sustainable growth, while <br/>addressing e-waste challenges
            </Typography>
        </Box>
    </Container>
    );
};

export default HeaderText;