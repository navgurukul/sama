import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton
} from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import ComputerIcon from "@mui/icons-material/Computer";
import DownloadIcon from "@mui/icons-material/Download";
import { Filter, Building, X, ChevronDown } from "lucide-react";

export default function LaptopTracking() {
  const [laptopData, setLaptopData] = useState([]);
  const [search, setSearch] = useState("");
  const [searchId, setSearchId] = useState("");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [uniqueOrganizations, setUniqueOrganizations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`
        );
        const data = await response.json();
        setLaptopData(data || []);

        // Extract unique organizations from laptop data
        const orgSet = new Set();
        data.forEach(laptop => {
          const donorCompany = laptop["Donor Company Name"];
          if (donorCompany && donorCompany.trim()) {
            orgSet.add(donorCompany.trim());
          }
        });

        setUniqueOrganizations(Array.from(orgSet).sort());
      } catch (error) {
        console.error("Error fetching laptop data:", error);
      }
    };

    fetchData();
  }, []);

  // Filter functions
  const getFilteredLaptopData = () => {
    let filteredData = laptopData;

    // Filter by organization if selected
    if (selectedOrganization) {
      if (!selectedOrganization) return laptopData;
      return laptopData.filter(laptop =>
        String(laptop["Donor Company Name"]).trim().toLowerCase() ===
        selectedOrganization.toLowerCase()
      );
    }

    // Filter by ID search
    if (searchId) {
      filteredData = filteredData.filter(laptop =>
        laptop.ID && laptop.ID.toLowerCase().includes(searchId.toLowerCase())
      );
    }

    return filteredData;
  };

  const filteredLaptopData = getFilteredLaptopData();

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

  // Function to get color based on status
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "in transit":
        return "warning";
      case "to be dispatch":
        return "secondary";
      case "laptop received":
        return "info";
      case "laptop refurbished":
        return "success";
      case "allocated":
        return "primary";
      case "distributed":
        return "success";
      default:
        return "default";
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const [datePart, timePart] = dateStr.split(" ");
    if (!datePart || !timePart) return "N/A";

    const [day, month, year] = datePart.split("-").map(Number);
    const [hour, minute, second] = timePart.split(":").map(Number);

    // Return string in the same format
    return `${String(day).padStart(2, "0")}-${String(month).padStart(2, "0")}-${year} ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}`;
  };

  const handleExport = () => {
    if (!filteredLaptopData || filteredLaptopData.length === 0) {
      alert("No data available to export");
      return;
    }

    const headers = Object.keys(filteredLaptopData[0]).join(",");
    const rows = filteredLaptopData.map(row => Object.values(row).join(","));
    const csvContent = [headers, ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "laptop_tracking_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };


  return (
    <>
      {/* ======= HEADER ======= */}
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

      {/* Filter Status Bar */}
      {selectedOrganization && (
        <Box
          sx={{
            p: 2,
            backgroundColor: "#f5f5f5",
            borderRadius: 1,
            border: "1px solid #e0e0e0",
          }}
        >
          <Typography variant="body2" sx={{ fontSize: 14, color: "#666" }}>
            Showing data filtered for: <strong>{selectedOrganization}</strong>
            {filteredLaptopData.length > 0 &&
              ` (${filteredLaptopData.length} laptop${filteredLaptopData.length !== 1 ? 's' : ''})`
            }
          </Typography>
        </Box>
      )}

      {/* ======= MAIN CONTENT ======= */}
      <Box p={3}>
        <Paper elevation={2} sx={{ bgcolor: "#f9f9f9", minHeight: "100vh" }}>
          <Box p={2}>
            {/* Heading + Search */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5" sx={{ fontWeight: "bold", color: "#333" }}>
                Laptop Tracking
                {selectedOrganization && (
                  <Chip
                    label={selectedOrganization}
                    size="small"
                    variant="outlined"
                    sx={{ ml: 2 }}
                  />
                )}
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <TextField
                  label="Search by ID"
                  variant="outlined"
                  size="small"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  sx={{ width: "250px" }}
                />
                <Button
                  variant="outlined"
                  startIcon={<FilterAltIcon />}
                  onClick={handleFilterClick}
                >
                  Organization Filter
                </Button>
              </Box>
            </Box>

            {/* ====== TABLE ====== */}
            <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><b>LAPTOP ID</b></TableCell>
                    <TableCell><b>MODEL</b></TableCell>
                    <TableCell><b>STATUS</b></TableCell>
                    <TableCell><b>CURRENT LOCATION</b></TableCell>
                    <TableCell><b>BENEFICIARY</b></TableCell>
                    <TableCell><b>USAGE HOURS</b></TableCell>
                    <TableCell><b>LAST ACTIVITY</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLaptopData.length > 0 ? (
                    filteredLaptopData
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row, index) => (
                        <TableRow key={index} hover>
                          <TableCell sx={{ color: "primary.main", cursor: "pointer" }}>
                            {row.ID}
                          </TableCell>
                          <TableCell>{row["Manufacturer Model"]}</TableCell>
                          <TableCell>
                            <Chip
                              label={row.Status || "In Transit"}
                              color={getStatusColor(row.Status)}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>{row["Inventory Location"] || "N/A"}</TableCell>
                          <TableCell>{row["Allocated To"] || row["Assigned To"] || "Pending"}</TableCell>
                          <TableCell>
                            {row["Usage Hours"] && row["Usage Hours"] !== ""
                              ? row["Usage Hours"]
                              : "Not Available"}
                          </TableCell>
                          <TableCell>{formatDate(row["Last Updated On"])}</TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          No laptops found matching your criteria
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={filteredLaptopData.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[10]}
              />
            </TableContainer>
          </Box>
        </Paper>
      </Box>
    </>
  );
}
