import React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { styled } from '@mui/system';
import ngStudentImg from "./assets/ngStudent.JPG"

const images = [
  ngStudentImg,
  ngStudentImg,
  ngStudentImg,
  ngStudentImg,
  ngStudentImg,
  ngStudentImg,
  ngStudentImg,
  ngStudentImg,
  ngStudentImg,
  ngStudentImg,
  ngStudentImg,
  ngStudentImg,
];


const Image = styled('img')({
  width: '100%',
  height: 'auto',
  borderRadius: '8px', 
});

const ImageGrid = () => {
  return (
    <Box sx={{ flexGrow: 1, padding: 2 }}>
      <Grid container spacing={2}>
        {images.map((src, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Image src={src} alt={`Image ${index + 1}`} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ImageGrid;