import React, { useState } from 'react';
import { Box, Container, Grid } from '@mui/material';
import PlayBtn from './assets/PlayBtn.png';
import { BoxStyle, PlayButtonStyle, IframeStyle } from './style';

const BgVideoPage = () => {

    const [showVideo, setShowVideo] = useState(false);
    const handlePlayButtonClick = () => {
        setShowVideo(true);
    };

    return (
        
        <Container maxWidth="xl">
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Box
                        style={{ borderRadius: "16px", }}
                        sx={BoxStyle(showVideo)}
                        onClick={handlePlayButtonClick}
                    >
                        {!showVideo ? (
                            <img
                                src={PlayBtn}
                                alt="Play Icon"
                                style={PlayButtonStyle}
                            />
                        ) : (

                            <iframe
                                src="https://www.youtube.com/embed/5_G_Q4rSiUU?autoplay=1"
                                style={IframeStyle}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title="Embedded Video"
                            ></iframe>
                        )}
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
};

export default BgVideoPage;