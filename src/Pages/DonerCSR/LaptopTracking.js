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
  Paper,
  Chip
} from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import ComputerIcon from "@mui/icons-material/Computer";
import DownloadIcon from "@mui/icons-material/Download";

export default function LaptopTracking() {
  const [laptopData, setLaptopData] = useState([]);
  const [search, setSearch] = useState("");
  const [searchId, setSearchId] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`
        );
        const data = await response.json();

        setLaptopData(data || []);
      } catch (error) {
        console.error("Error fetching laptop data:", error);
      }
    };

    fetchData();
  }, []);

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
    if (!laptopData || laptopData.length === 0) {
      alert("No data available to export");
      return;
    }

    const headers = Object.keys(laptopData[0]).join(","); // Get table headers
    const rows = laptopData.map(row => Object.values(row).join(",")); // Get table rows

    const csvContent = [headers, ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        </Box>
      </Box>

      {/* ======= MAIN CONTENT ======= */}
      <Box p={3}>
        <Paper elevation={2} sx={{ bgcolor: "#f9f9f9", minHeight: "100vh" }}>
          <Box p={2}>
            {/* Heading + Search */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5" sx={{ fontWeight: "bold", color: "#333" }}>
                Laptop Tracking
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
                <Button variant="outlined" startIcon={<FilterAltIcon />}>
                  Filter
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
                  {laptopData
                    .filter((row) => row.ID?.toLowerCase().includes(searchId.toLowerCase()))
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
                    ))}
                </TableBody>

              </Table>
            </TableContainer>
          </Box>
        </Paper>
      </Box>
    </>
  );
}
