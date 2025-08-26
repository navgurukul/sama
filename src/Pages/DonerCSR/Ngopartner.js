import React, { useEffect, useState } from 'react';
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
  const [ngoPartner, setNgoPartner] = useState([]);
  const [visibleCount, setVisibleCount] = useState(4); // Show only 4 initially

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [laptopRes, ngoRes, userRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`),
          fetch(`${process.env.REACT_APP_NgoInformationApi}?type=registration`),
          fetch(`${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getUserData`)
        ]);

        const [laptopJson, ngoJson, userJson] = await Promise.all([
          laptopRes.json(),
          ngoRes.json(),
          userRes.json()
        ]);

        const approved = ngoJson.data?.filter((ngo) => ngo.Status === "Approved") || [];

        const partners = approved.map((ngo) => {
          const laptopsAllocated = laptopJson.filter(
            (laptop) =>
              String(laptop["Allocated To"]).trim().toLowerCase() ===
              String(ngo.organizationName).trim().toLowerCase()
          ).length;

          const beneficiariesCount = userJson.filter(
            (user) =>
              String(user.Ngo).trim() === String(ngo.Id).trim() ||
              String(user.ngoId).trim() === String(ngo.Id).trim()
          ).length;

          return {
            id: ngo.Id,
            name: ngo.organizationName,
            status: ngo.Status,
            location: ngo.location || "Unknown",
            laptops: laptopsAllocated,
            beneficiaries: beneficiariesCount,
            lastDelivery: ngo.lastDelivery || "N/A",
          };
        });

        setNgoPartner(partners);
      } catch (err) {
        console.error("Error fetching NGO partner data:", err);
      }
    };

    fetchData();
  }, []);

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 4);
  };

  return (
    <>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        px={2}
        py={2}
        borderBottom="1px solid #eee"
      >
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

      {/* NGO Partners */}
      <Container maxWidth="xl" sx={{ py: 3, bgcolor: '#f9f9f9', mt: 4 }}>
        <Box
          sx={{
            mb: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
            NGO Partners
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', fontSize: '14px' }}>
            {ngoPartner.length} organizations receiving laptops
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {ngoPartner.slice(0, visibleCount).map((partner) => (
            <Card key={partner.id} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#e3f2fd', width: 48, height: 48 }}>
                      <Business sx={{ color: '#1976d2', fontSize: 24 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {partner.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOn sx={{ fontSize: 16, color: '#666' }} />
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          {partner.location}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Chip label={partner.status} color={partner.status === "Active" ? "success" : "warning"} />
                </Box>

                <Grid container spacing={4}>
                  <Grid item xs={4} textAlign="center">
                    <Typography variant="h6" fontWeight="bold">{partner.laptops}</Typography>
                    <Typography variant="body2" color="text.secondary">Laptops</Typography>
                  </Grid>
                  <Grid item xs={4} textAlign="center">
                    <Typography variant="h6" fontWeight="bold">{partner.beneficiaries}</Typography>
                    <Typography variant="body2" color="text.secondary">Beneficiaries</Typography>
                  </Grid>
                  <Grid item xs={4} textAlign="center">
                    <Typography variant="body2">{partner.lastDelivery}</Typography>
                    <Typography variant="body2" color="text.secondary">Last delivery</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Show More Button */}
        {visibleCount < ngoPartner.length && (
          <Box textAlign="center" mt={3}>
            <Button variant="outlined" onClick={handleShowMore}>
              Show More
            </Button>
          </Box>
        )}
      </Container>
    </>
  );
};

export default Ngopartner;
