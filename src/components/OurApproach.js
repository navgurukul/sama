import React from 'react';
import { Container, Box, Typography, Grid } from '@mui/material';

const OurApproach = () => {
  return (
    <Container maxWidth="md">
      <Box >
        <Typography variant="h4"  align="center" gutterBottom mt={4} mb={4}>
          Our Rationale
        </Typography>
        <Typography variant="body1" paragraph mb={4}>
          We strongly believe that investing in women's digital education can reap multifold benefits for society as a whole. As we rapidly advance in technology, it's crucial to ensure that underserved women aren't left behind. Sama addresses two pressing issues simultaneously:
        </Typography>
        <ol >
          <li >The E-Waste Crisis:
            <ul >
              <li  style={{ marginBottom: '16px', marginTop: '16px' }}>India is the world's third-largest e-waste producer, generating over 2 million tonnes annually.</li>
              <li  style={{ marginBottom: '16px' }}>Discarded laptops account for nearly 70% of India's e-waste.</li>
              <li  style={{ marginBottom: '32px' }}>Up to 80% of e-waste is processed through the informal sector, often using hazardous methods that release pollutants.</li>
            </ul>
          </li>
            <li >The Digital Gender Divide:
            <ul>
              <li style={{ marginBottom: '16px', marginTop: '16px' }} >Only one in three women in India (33%) have ever used the internet, compared to 57% of men.</li>
              <li  style={{ marginBottom: '16px' }}>The COVID-19 lockdown affected 158 million girl students, jeopardising their education and future prospects.</li>
              <li  style={{ marginBottom: '32px' }}>While 44% of urban students have internet access, only 17% in rural areas do. Among the poorest income groups, a mere 2% have access to a computer with internet.</li>
            </ul>
          </li>
        </ol>

        <Typography variant="h4"  align="center" gutterBottom mb={4} mt={4}>
          Our 3D Model
        </Typography>
        <Typography variant="body1" paragraph mb={4}>
          Our 3D Model forms the backbone of our approach. Through this comprehensive approach, we transform e-waste into educational tools, thereby providing impact reports to our donors.
        </Typography>

         <ol>
            <li>Digital Resource Recovery
              <ul>
                <li><strong>Recover:</strong> We collect end-of-life laptops from corporate partners like you. </li>
                <li><strong>Redact:</strong> Our team ensures complete data erasure and privacy protection.</li>
                <li><strong>Refurbish:</strong> We restore and upgrade devices to meet modern educational needs.</li>
              </ul>
            </li>
             <li>Digital Inclusion Pipeline
              <ul>
               <li><strong>Engage:</strong> We connect with underserved communities, prioritising women and girls through our network of 200+ verified NGOs/Government Institutions</li>
                <li><strong>Empower:</strong>  Through our curated courses and ecosystem partners, we provide access to the internet, offline learning content, digital literacy, and resources relevant to today's job market.</li>
                <li><strong>Employ:</strong> We create local jobs in device refurbishment and digital skills training.</li>
              </ul>
            </li>
             <li>Digital Tracking and Reporting
              <ul>
                 <li><strong>Record:</strong> We capture comprehensive data on device lifecycles and community impact.</li>
                <li><strong>Report:</strong>  Our system generates transparent, real-time analytics on environmental and social outcomes.</li>
                <li><strong>Refine:</strong> We utilise these insights to continuously improve our processes and maximise impact with you.</li>
              </ul>
            </li>
          </ol>
        
        
      </Box>
    </Container>
  );
};

export default OurApproach;
