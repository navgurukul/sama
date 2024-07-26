// import React from 'react';
// import { Box, Typography } from '@mui/material';
// import { styled } from '@mui/system';

// const BackgroundContainer = styled(Box)(({ bgImage }) => ({
//   width: '100%',
//   height: '80vh',
//   display: 'flex',
//   alignItems: 'center',
//   justifyContent: 'center',
//   backgroundImage: `url(${bgImage})`,
//   backgroundSize: 'cover', 
//   backgroundPosition: 'center',
//   backgroundRepeat: 'no-repeat',
// }));


// const BackgroundImg = ({ text, textColor, bgImage }) => {
//   return (
//     <BackgroundContainer bgImage={bgImage}>
//       <Typography variant="h3" style={{ color: textColor }}>
//         {text}
//       </Typography>
//     </BackgroundContainer>
//   );
// };

// export default BackgroundImg;


import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { styled } from '@mui/system';

const BackgroundContainer = styled(Box)(({ bgImage }) => ({
  width: '100%',
  height: '80vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundImage: `url(${bgImage})`,
  backgroundSize: 'cover', 
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
}));

const BackgroundImg = ({ text, textColor, bgImage, buttonText, buttonOnClick }) => {
  return (
    <BackgroundContainer bgImage={bgImage}>
      <Typography variant="h3" style={{ color: textColor, marginBottom: '20px' }}>
        {text}
      </Typography>
      <Button variant="contained" color="primary" onClick={buttonOnClick}>
        {buttonText}
      </Button>
    </BackgroundContainer>
  );
};

export default BackgroundImg;
