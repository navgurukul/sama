import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const About = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Where it all began?
        </Typography>
        <Typography variant="body1" paragraph sx={{mt:3}}>
          We started 8 years ago with a vision to bring quality higher education and jobs to underprivileged women in India. This vision of NavGurukul has since grown into 7 residential centres with a capacity for 1200+ students, resulting in 800+ job placements and a strong network of 100+ ecosystem supporters until now.
        </Typography>
        <Typography variant="body1" paragraph>
          One of the most crucial tools enabling this journey is a laptop. Our ecosystem partners, including industry leaders like Amazon, Macquarie, DXC, MSDF, Tiger Analytics, and Fossil Fuels, have contributed about 1000 End-of-Life laptops already, thus multiplying the impact significantly. These donations have resulted in XXXX jobs created and 1200XXXX females from the remotest corners of 11 states becoming digitally adept, thereby breaking social and cultural barriers. Not only that, we also played a small part in enabling the donors to move towards Net Zero in their Scope 3 GHG emissions.
        </Typography>
        <Typography variant="body1" paragraph>
          If a number as small as 1000 laptops can create such a profound impact on a few lives, imagine what we could achieve if we solved this not only for NavGurukul students but for all students.
        </Typography>
      </Box>
    </Container>
  );
};

export default About;
