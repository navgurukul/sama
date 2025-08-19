import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Avatar,
  Grid,
  Container
} from '@mui/material';
import { Business, LocationOn } from '@mui/icons-material';
import ComputerIcon from "@mui/icons-material/Computer";
import DownloadIcon from "@mui/icons-material/Download";


const Ngopartner = () => {
  const partners = [
    {
      id: 1,
      name: 'Digital Learning Hub',
      location: 'Mumbai, Maharashtra',
      laptops: 89,
      beneficiaries: 267,
      lastDelivery: '2 days ago',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Skill Development Center',
      location: 'Bangalore, Karnataka',
      laptops: 76,
      beneficiaries: 228,
      lastDelivery: '1 week ago',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Rural Education Foundation',
      location: 'Pune, Maharashtra',
      laptops: 54,
      beneficiaries: 162,
      lastDelivery: '3 days ago',
      status: 'Active'
    },
    {
      id: 4,
      name: 'Tech for All NGO',
      location: '',
      laptops: 0,
      beneficiaries: 0,
      lastDelivery: '',
      status: 'Active'
    }
  ];

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        px={2}
        py={2}
        borderBottom="1px solid #eee"
      >
        {/* Left Section */}
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              backgroundColor: "#4CAF50",
              color: "white",
              p: 1,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ComputerIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" color="black">
              Corporate CSR Dashboard
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Laptop Donation Impact Tracking
            </Typography>
          </Box>
        </Box>

        {/* Right Section */}
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="body2" color="text.secondary">
            Corporate Partner
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            sx={{ borderRadius: "10px", textTransform: "none" }}
          >
            Export Report
          </Button>
        </Box>
      </Box>
      <Container maxWidth="xl" sx={{ py: 3, bgcolor: '#f9f9f9' , mt: 4}}>
        <Box
          sx={{
            mb: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: 'bold', color: '#333' }}
          >
            NGO Partners
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: '#666', fontSize: '14px' }}
          >
            4 organizations receiving laptops
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {partners.map((partner) => (
            <Card
              key={partner.id}
              sx={{
                width: "100%",
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e0e0e0',
                borderRadius: 2
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: '#e3f2fd',
                        width: 48,
                        height: 48,
                        mt: 0.5
                      }}
                    >
                      <Business sx={{ color: '#1976d2', fontSize: 24 }} />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          fontSize: '18px',
                          color: '#333',
                          mb: 0.5
                        }}
                      >
                        {partner.name}
                      </Typography>
                      {partner.location && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocationOn sx={{ fontSize: 16, color: '#666' }} />
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#666',
                              fontSize: '14px'
                            }}
                          >
                            {partner.location}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                  <Chip
                    label={partner.status}
                    sx={{
                      bgcolor: '#e8f5e8',
                      color: '#2e7d32',
                      fontSize: '12px',
                      fontWeight: 500,
                      height: 24,
                      '& .MuiChip-label': {
                        px: 1.5
                      }
                    }}
                  />
                </Box>

                {partner.laptops > 0 ? (
                  <>
                    <Grid container spacing={4} sx={{ mb: 3 }}>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography
                            variant="h5"
                            sx={{
                              fontWeight: 'bold',
                              color: '#333',
                              lineHeight: 1,
                              mb: 0.5
                            }}
                          >
                            {partner.laptops}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#666',
                              fontSize: '14px'
                            }}
                          >
                            Laptops
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography
                            variant="h5"
                            sx={{
                              fontWeight: 'bold',
                              color: '#333',
                              lineHeight: 1,
                              mb: 0.5
                            }}
                          >
                            {partner.beneficiaries}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#666',
                              fontSize: '14px'
                            }}
                          >
                            Beneficiaries
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#666',
                              fontSize: '14px',
                              mb: 0.5
                            }}
                          >
                            {partner.lastDelivery}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#666',
                              fontSize: '14px'
                            }}
                          >
                            Last delivery
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    <Box sx={{ width: '100%' }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        sx={{
                          textTransform: 'none',
                          color: '#666',
                          borderColor: '#ddd',
                          fontSize: '14px',
                          px: 3,
                          py: 1,
                          '&:hover': {
                            borderColor: '#bbb',
                            bgcolor: '#f5f5f5',
                            color: '#666',
                          }
                        }}
                      >
                        View Details
                      </Button>
                    </Box>

                  </>
                ) : (
                  <Box sx={{ py: 2 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#666',
                        textAlign: 'center',
                        fontStyle: 'italic'
                      }}
                    >
                      No laptops distributed yet
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>
    </>
  );
};

export default Ngopartner;