import React from 'react';
import { 
  Box,
  Container,
  Typography,
 } from '@mui/material';
import ourteam from '../OurTeam/style';

const HeaderText = () => {
    return (
        <Container maxWidth="lg" >
        <Box sx={{width:{xs:"auto",md:"756px"}, justifySelf:"center"}} >
            <Typography variant="h5" gutterBottom marginTop="80px">
                What We Do
            </Typography>
            <Typography variant="body1" paragraph textAlign="justify">
                Sama bridges the digital divide by collecting end-of-life 
                laptops from corporates, refurbishing them and preloading 
                with educational content, and finally distributing laptops 
                to underserved communities. We empower women and youth with 
                access to technology, enabling education, career opportunities, 
                and sustainable growth, while addressing e-waste challenges
            </Typography>
        </Box>
    </Container>
    );
};

export default HeaderText;