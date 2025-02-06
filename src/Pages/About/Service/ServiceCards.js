
import React from 'react';
import { Grid, Box, Typography, Container, styled } from '@mui/material';
import { Flag as MissionIcon, Visibility as VisionIcon, Diamond as ValuesIcon } from '@mui/icons-material';

const IconContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  padding: theme.spacing(2),
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& svg': {
    width: 32,
    height: 32,
    color: '#1976d2',
  },
}));

const ServiceDescription = styled(Typography)(({ theme }) => ({
  color: '#666',
  fontSize: '0.9rem',
  lineHeight: 1.5,
  maxWidth: '280px',
  margin: '0 auto',
}));

const ServiceIcons = () => {
  const services = [
    {
      icon: MissionIcon,
      title: "Mission",
      description: "Empower billions of users start to finish through our products, and focusing on simplicity"
    },
    {
      icon: VisionIcon,
      title: "Vision",
      description: "To help you decide about your financial goals based on expertise gained over our vast experience"
    },
    {
      icon: ValuesIcon,
      title: "Values",
      description: "Ethics and trust, Empowerment, Passion at heart, Sustainability, Partnership, Service with a smile approach"
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ px: "5rem"}}>
      <Grid container spacing={3}>
        {services.map((service, index) => (
          <Grid item xs={12} md={4} key={index}>
            <IconContainer>
              <IconWrapper>
                <service.icon />
              </IconWrapper>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, fontSize: '1.1rem' }}>
                {service.title}
              </Typography>
              <ServiceDescription sx={{textAlign:"left"}}>
                {service.description}
              </ServiceDescription>
            </IconContainer>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default ServiceIcons;