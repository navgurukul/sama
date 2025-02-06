
import React from 'react';
import { Typography, Container, Box} from '@mui/material';

const HeaderText = () => {
    return (
        <Container maxWidth="lg" sx={{ px: "5rem",py:2 }}>
            <Box
                sx={{
                    // width: '500px', 
                    paddingInline: "200px",
                    margin: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <Typography variant="h5" align="center" gutterBottom>
                    What We Do
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Start to begin the digital storm by solving one of 100 specific tech milestones,
                    and sorting data that is providing and surrounding with solution. And Team built startup
                    belongs to communicate certificate, skill certificate and PMP certification.
                    We focused on community building concepts, social media marketing, and sustainable growth - when
                    delivering a more challenge!
                </Typography>
            </Box>
        </Container>
    );
};

export default HeaderText;