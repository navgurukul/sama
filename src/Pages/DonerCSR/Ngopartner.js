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
  Container,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { Filter, ChevronDown, X, Building, Download } from "lucide-react";
import { Business, LocationOn } from '@mui/icons-material';
import ComputerIcon from "@mui/icons-material/Computer";
import DownloadIcon from "@mui/icons-material/Download";


const Ngopartner = () => {
  const [ngoPartner, setNgoPartner] = useState([]);
  const [filteredNgoPartner, setFilteredNgoPartner] = useState([]);
  const [visibleCount, setVisibleCount] = useState(4);
  const [expandedCard, setExpandedCard] = useState(null);
  const [activeType, setActiveType] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [uniqueOrganizations, setUniqueOrganizations] = useState([]);

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
        function parseDate(dateStr) {
          if (!dateStr) return null;

          const iso = Date.parse(dateStr);
          if (!isNaN(iso)) return new Date(iso);

          const parts = dateStr.split(/[-/ :]/);
          if (parts.length >= 3) {
            const [d, m, y, hh = 0, mm = 0, ss = 0] = parts.map((p) => parseInt(p, 10));
            return new Date(y, m - 1, d, hh, mm, ss);
          }
          return null;
        }

        const partners = approved.map((ngo) => {
          const laptopsAllocated = laptopJson.filter(
            (laptop) =>
              String(laptop["Allocated To"]).trim().toLowerCase() ===
              String(ngo.organizationName).trim().toLowerCase()
          );

          const beneficiariesList = userJson.filter(
            (user) =>
              String(user.Ngo).trim() === String(ngo.Id).trim() ||
              String(user.ngoId).trim() === String(ngo.Id).trim()
          );
          
          const deliveries = laptopsAllocated
            .filter(
              (laptop) =>
                laptop["Status"]?.trim().toLowerCase() === "distributed" &&
                laptop["Last Delivery Date"]
            )
            .map((laptop) => parseDate(laptop["Last Delivery Date"]))
            .filter((d) => d !== null);

          const lastDelivery =
            deliveries.length > 0 ? new Date(Math.max(...deliveries)) : null;

          return {
            id: ngo.Id,
            name: ngo.organizationName,
            donor: ngo.Doner || "Unknown Donor",   
            status: ngo.Status,
            location: ngo.location || "Unknown",
            laptops: laptopsAllocated,
            beneficiaries: beneficiariesList,
            lastDelivery: lastDelivery
              ? lastDelivery.toLocaleString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })
              : "N/A",
          };
        });



        setNgoPartner(partners);
        setFilteredNgoPartner(partners);

        // collect donor names for dropdown
        const orgs = [...new Set(partners.map(partner => partner.donor))].sort();
        setUniqueOrganizations(orgs);

      } catch (err) {
        console.error("Error fetching NGO partner data:", err);
      }
    };

    fetchData();
  }, []);

  //Filter NGO partners by selected organization
 useEffect(() => {
  if (selectedOrganization) {
    const filtered = ngoPartner.filter(partner => 
      String(partner.donor).trim().toLowerCase() === 
      selectedOrganization.toLowerCase()
    );
    setFilteredNgoPartner(filtered);
  } else {
    setFilteredNgoPartner(ngoPartner);
  }

  setVisibleCount(4);
  setExpandedCard(null);
}, [selectedOrganization, ngoPartner]);

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 4);
  };

  const handleToggle = (id, type) => {
    if (expandedCard === id && activeType === type) {
      setExpandedCard(null);
      setActiveType(null);
    } else {
      setExpandedCard(id);
      setActiveType(type);
    }
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleOrganizationSelect = (org) => {
    setSelectedOrganization(org);
    handleFilterClose();
  };

  const handleClearFilter = () => {
    setSelectedOrganization(null);
    handleFilterClose();
  };
  const handleExport = () => {
    // Use filtered data for export if a filter is applied
    const dataToExport = selectedOrganization ? filteredNgoPartner : ngoPartner;

    let csvContent = "data:text/csv;charset=utf-8,";

    dataToExport.forEach(partner => {
      csvContent += `\n${partner.name} - Laptop Data\n`;
      csvContent += "Laptop ID,Manufacturer Model,Status,Working\n";
      partner.laptops.forEach(item => {
        csvContent += `${item.ID},${item["Manufacturer Model"]},${item.Status},${item.Working ? "Yes" : "No"}\n`;
      });

      csvContent += `\n${partner.name} - Beneficiary Data\n`;
      csvContent += "NGO,Status,Laptop Assigned\n";
      partner.beneficiaries.forEach(item => {
        csvContent += `${item.Ngo},${item.status},${item["Laptop Assigned"]}\n`;
      });

      csvContent += "\n";
    });

    const blob = new Blob([decodeURIComponent(encodeURI(csvContent))], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "NGO_Laptop_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          {selectedOrganization && (
            <Chip
              label={selectedOrganization}
              variant="outlined"
              size="small"
              onDelete={handleClearFilter}
              deleteIcon={<X size={14} />}
              sx={{
                maxWidth: 200,
                "& .MuiChip-label": {
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                },
              }}
            />
          )}

          <Button
            variant="outlined"
            startIcon={<Filter size={16} />}
            endIcon={<ChevronDown size={16} />}
            onClick={handleFilterClick}
            sx={{
              textTransform: "none",
              fontSize: 14,
              px: 2,
              py: 1,
              borderColor: "#e0e0e0",
              color: "#666",
            }}
          >
            Filter by Organization
          </Button>

          <Typography variant="body2" color="text.secondary">
            Corporate Partner
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            sx={{ borderRadius: "10px", textTransform: "none" }}
            onClick={handleExport}
          >
            Export Report
          </Button>

          {/* Filter Dropdown Menu */}
          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={handleFilterClose}
            PaperProps={{
              sx: {
                maxHeight: 300,
                width: 280,
                mt: 1,
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                border: "1px solid #e0e0e0",
              },
            }}
          >
            <MenuItem onClick={handleClearFilter} sx={{ py: 1.5 }}>
              <ListItemIcon>
                <X size={18} />
              </ListItemIcon>
              <ListItemText
                primary="Clear Filter"
                primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
              />
            </MenuItem>
            <Divider />
            {uniqueOrganizations.map((org) => (
              <MenuItem
                key={org}
                onClick={() => handleOrganizationSelect(org)}
                selected={selectedOrganization === org}
                sx={{ py: 1.5 }}
              >
                <ListItemIcon>
                  <Building size={18} />
                </ListItemIcon>
                <ListItemText
                  primary={org}
                  primaryTypographyProps={{
                    fontSize: 14,
                    fontWeight: selectedOrganization === org ? 600 : 400,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                />
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Box>

      {/* NGO Partners */}
      <Container maxWidth="xl" sx={{ py: 3, bgcolor: '#f9f9f9' }}>
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
            {selectedOrganization && (
              <Chip
                label={`Filtered: ${selectedOrganization}`}
                size="small"
                variant="outlined"
                sx={{ ml: 2 }}
              />
            )}
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body2" sx={{ color: '#666', fontSize: '14px' }}>
              {filteredNgoPartner.length} of {ngoPartner.length} organizations
            </Typography>
            {/* <Button
              variant="contained"
              color="primary"
              startIcon={<DownloadIcon />}
              sx={{ borderRadius: "10px", textTransform: "none" }}
              onClick={handleExport}
            >
              Export Report
            </Button> */}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredNgoPartner.slice(0, visibleCount).map((partner) => (
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
                  <Chip
                    label={partner.status}
                    color={partner.status === "Approved" ? "success" : "warning"}
                    variant="outlined"
                  />
                </Box>

                <Grid container spacing={4}>
                  <Grid item xs={4} textAlign="center">
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{
                        cursor: "pointer",
                        color: expandedCard === partner.id && activeType === "laptops" ? "green" : "inherit"
                      }}
                      onClick={() => handleToggle(partner.id, "laptops")}
                    >
                      {partner.laptops.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Laptops</Typography>
                  </Grid>
                  <Grid item xs={4} textAlign="center">
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{
                        cursor: "pointer",
                        color: expandedCard === partner.id && activeType === "beneficiaries" ? "green" : "inherit"
                      }}
                      onClick={() => handleToggle(partner.id, "beneficiaries")}
                    >
                      {partner.beneficiaries.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Beneficiaries</Typography>
                  </Grid>
                  <Grid item xs={4} textAlign="center">
                    <Typography variant="body2">{partner.lastDelivery}</Typography>
                    <Typography variant="body2" color="text.secondary">Last delivery</Typography>
                  </Grid>
                </Grid>
                {expandedCard === partner.id && (
                  <Box mt={3}>
                    <Typography variant="h6" gutterBottom>
                      {activeType === "laptops"
                        ? `${partner.name} - Laptop Data`
                        : `${partner.name} - Beneficiary Data`}
                    </Typography>

                    <Table size="small">
                      <TableHead>
                        {activeType === "laptops" ? (
                          <TableRow>
                            <TableCell sx={{ fontWeight: "bold" }}>Laptop ID</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Manufacturer Model</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Working</TableCell>
                          </TableRow>
                        ) : (
                          <TableRow>
                            <TableCell sx={{ fontWeight: "bold" }}>NGO</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Laptop Assigned</TableCell>
                          </TableRow>
                        )}
                      </TableHead>

                      <TableBody>
                        {activeType === "laptops"
                          ? partner.laptops.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.ID}</TableCell>
                              <TableCell>{item["Manufacturer Model"]}</TableCell>
                              <TableCell>{item.Status}</TableCell>
                              <TableCell>{item.Working ? "Yes" : "No"}</TableCell>
                            </TableRow>
                          ))
                          : partner.beneficiaries.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.Ngo}</TableCell>
                              <TableCell>{item.status}</TableCell>
                              <TableCell>{item["Laptop Assigned"]}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Show More Button */}
        {visibleCount < filteredNgoPartner.length && (
          <Box textAlign="center" mt={3}>
            <Button variant="outlined" onClick={handleShowMore}>
              Show More
            </Button>
          </Box>
        )}

        {/* No results message */}
        {filteredNgoPartner.length === 0 && (
          <Box textAlign="center" mt={3}>
            <Typography variant="body1" color="text.secondary">
              No NGO partners found for the selected organization.
            </Typography>
          </Box>
        )}
      </Container>
    </>
  );
};

export default Ngopartner;
