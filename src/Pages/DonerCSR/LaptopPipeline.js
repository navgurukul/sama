import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";

import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  LinearProgress,
  Alert,
  Stack,
  Button,
  Menu,
  Divider,
  ListItemIcon,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
   TablePagination,
} from "@mui/material";
import {
  Truck,
  Settings as Tools,
  RefreshCw,
  Package,
  Users,
  Filter,
  ChevronDown,
  X,
  Building,
  Download
} from "lucide-react";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import ComputerIcon from "@mui/icons-material/Computer";
import DownloadIcon from "@mui/icons-material/Download";

const theme = createTheme({
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});



const processingTimes = [
  { label: "Pickup to Assessment", value: "2.1 days", change: "-0.3 days", changeType: "down" },
  { label: "Assessment to Refurbishment", value: "1.8 days", change: "+0.5 days", changeType: "up" },
];

const processingData = [
  {
    title: 'Pickup to Assessment',
    days: '2.1 days',
    change: '-0.3 days',
    isPositive: true
  },
  // {
  //   title: 'Assessment to Refurbishment',
  //   days: '1.8 days',
  //   change: '+0.2 days',
  //   isPositive: false
  // },
  {
    title: 'Refurbishment Process',
    days: '6.2 days',
    change: '-0.5 days',
    isPositive: true
  },
  {
    title: 'Distribution to Delivery',
    days: '1.5 days',
    change: '-0.1 days',
    isPositive: true
  }
];

const stageData = [
  {
    title: 'Assessment Pass Rate',
    percentage: 96.8,
    laptops: 450,
    color: '#4caf50' // Green
  },
  {
    title: 'Refurbishment Success',
    percentage: 94.2,
    laptops: 435,
    color: '#2196f3' // Blue
  },
  {
    title: 'Distribution Completion',
    percentage: 98.5,
    laptops: 410,
    color: '#9c27b0' // Purple
  },
  {
    title: 'Active Usage Rate',
    percentage: 91.3,
    laptops: 398,
    color: '#ff9800' // Orange
  }
];

const insights = [
  {
    type: 'warning',
    title: 'Bottleneck Alert',
    description: 'Refurbishment stage showing slight delays. Consider adding technical capacity.',
    icon: <WarningIcon />,
    backgroundColor: '#fff3cd',
    borderColor: '#ffc107',
    textColor: '#856404'
  },
  {
    type: 'success',
    title: 'Performing Well',
    description: 'Distribution efficiency improved by 15% this month with new logistics partner.',
    icon: <CheckCircleIcon />,
    backgroundColor: '#d4edda',
    borderColor: '#28a745',
    textColor: '#155724'
  },
  {
    type: 'info',
    title: 'Opportunity',
    description: 'High NGO demand. Consider increasing pickup frequency from corporates.',
    icon: <TrendingUpIcon />,
    backgroundColor: '#d1ecf1',
    borderColor: '#17a2b8',
    textColor: '#0c5460'
  }
];

const LaptopPipeline = () => {
  const navigate = useNavigate();
   const NgoDetails = JSON.parse(localStorage.getItem("_AuthSama_")) || [];
  const userRole = NgoDetails?.[0]?.role?.[0];
  const donorOrgName = NgoDetails?.[0]?.Doner || null;
  const isAdmin = userRole === "admin";
  const isDoner = userRole === "doner";

  const [laptopData, setLaptopData] = useState([]);
  const [totalLaptops, setTotalLaptops] = useState(0);
  const [refurbishedCount, setRefurbishedCount] = useState(0);
  const [distributedCount, setDistributedCount] = useState(0);
  const [totalLaptopss, setTotalLaptopss] = useState(0);
  const [uniqueOrganizations, setUniqueOrganizations] = useState([]);
  const [pickups, setPickups] = useState([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [expandedStage, setExpandedStage] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [tableTitle, setTableTitle] = useState('');
   const [page, setPage] = useState(0); 
  const rowsPerPage = 5; 
  


  const handleStageClick = (stage) => {
    if (expandedStage === stage.title) {
      setExpandedStage(null);
      setTableData([]);
      setTableTitle('');
      setPage(0);
      return;
    }

    setExpandedStage(stage.title);
  setPage(0); 
    let data = [];
    let title = '';

    switch (stage.title) {
      case "Pickup Requested":
        // data = selectedOrganization ? filteredPickups.filter(p => p.Status === "Pending") :
        //   pickups.filter(p => p.Status === "Pending");
        data = filteredLaptopData.filter(item => item.Status === "Pickup Requested");
        title = "Pending Pickup Requests";
        break;

      case "Refurbishment":
        data = filteredLaptopData.filter(laptop => {
          const status = (laptop.Status || "").toLowerCase();
          return status.includes("refurbished") ||
            status.includes("to be dispatch") ||
            status.includes("allocated") ||
            status.includes("distributed");
        });
        title = "Laptops in Refurbishment Process";
        break;

      case "Distribution":
        data = filteredLaptopData.filter(item => item.Status === "Distributed");
        title = "Distributed Laptops";
        break;

      case "Active Usage":
        data = filteredLaptopData.filter(l => {
          const d = parseDateUniversal(l["Date"]);
          if (!d) return false;
          const diffDays = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
          return diffDays <= 15;
        });
        title = "Active Usage Laptops (Last 15 days)";
        break;

      default:
        data = [];
        title = "Stage Data";
    }

    setTableData(data);
    setTableTitle(title);
  };
  const renderTable = () => {
    if (!expandedStage || tableData.length === 0) return null;
  
    const handleChangePage = (event, newPage) => {
      setPage(newPage);
    };
    const getTableHeaders = () => {
      switch (expandedStage) {
        case "Pickup Requested":
          // return (
          //   <>
          //     <TableCell sx={{ fontWeight: "bold" }}>Pickup ID</TableCell>
          //     <TableCell sx={{ fontWeight: "bold" }}>Donor Company</TableCell>
          //     <TableCell sx={{ fontWeight: "bold" }}>Number of Laptops</TableCell>
          //     <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
          //     <TableCell sx={{ fontWeight: "bold" }}>Date & Time</TableCell>
          //     <TableCell sx={{ fontWeight: "bold" }}>Contact Person</TableCell>
          //   </>
          // );
        case "Refurbishment":
        case "Distribution":
        case "Active Usage":
          return (
            <>
              <TableCell sx={{ fontWeight: "bold" }}>Laptop ID</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Manufacturer Model</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Working</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Donor Company</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Allocated To</TableCell>
            </>
          );
        default:
          return null;
      }
    };

    const renderTableRows = () => {
      const currentData = tableData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
      switch (expandedStage) {
        case "Pickup Requested":
          // return currentData.map((pickup, index)  => (
          //   <TableRow key={index} hover>
          //     <TableCell>{pickup["Pickup ID"] || 'N/A'}</TableCell>
          //     <TableCell>{pickup["Donor Company"] || 'N/A'}</TableCell>
          //     <TableCell>{pickup["Number of Laptops"] || 'N/A'}</TableCell>
          //     <TableCell>
          //       <Chip
          //         label={pickup.Status || 'Unknown'}
          //         size="small"
          //         color="warning"
          //         variant="outlined"
          //       />
          //     </TableCell>
          //     <TableCell>{pickup["Current Date & Time"] || 'N/A'}</TableCell>
          //     <TableCell>{pickup["Contact Person"] || 'N/A'}</TableCell>
          //   </TableRow>
          // ));

        case "Refurbishment":
        case "Distribution":
        case "Active Usage":
          return currentData.map((laptop, index) =>  (
            <TableRow key={index} hover>
              <TableCell>{laptop.ID || laptop.LaptopID || 'N/A'}</TableCell>
              <TableCell>{laptop["Manufacturer Model"] || 'N/A'}</TableCell>
              <TableCell>
                <Chip
                  label={laptop.Status || 'Unknown'}
                  size="small"
                  color={laptop.Status === "Distributed" ? "success" : "primary"}
                  variant="outlined"
                />
              </TableCell>
              <TableCell>{laptop.Working ? "Yes" : "No"}</TableCell>
              <TableCell>{laptop["Donor Company Name"] || 'N/A'}</TableCell>
              <TableCell>{laptop["Allocated To"] || 'N/A'}</TableCell>
            </TableRow>
          ));

        default:
          return null;
      }
    };

    return (
      <Card sx={{ mb: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: "bold", color: "#333" }}>
              {tableTitle}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                setExpandedStage(null);
                setTableData([]);
                setTableTitle('');
              }}
              sx={{ textTransform: 'none' }}
            >
              Close Table
            </Button>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Total Records: {tableData.length}
          </Typography>

          <Table size="small" sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                {getTableHeaders()}
              </TableRow>
            </TableHead>
            <TableBody>
              {renderTableRows()}
            </TableBody>
          </Table>
          {tableData.length > rowsPerPage && (
            <TablePagination
              component="div"
              count={tableData.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[5]}
              sx={{ border: 'none', mt: 2 }}
            />
          )}
        </CardContent>
      </Card>
    );
  };

  useEffect(() => {
      if (isDoner) {
        navigate("/donorcsr/laptop-pipeline", { replace: true });
      }
    }, [isDoner, navigate]);
  
    // Set selected org
    useEffect(() => {
      if (isDoner && donorOrgName) {
        setSelectedOrganization(donorOrgName);
      }
    }, [donorOrgName, isDoner]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          // ${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}
          `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=pickupget`, {
          // method: "GET",
          // headers: {
          //   "Content-Type": "application/json",
          // },
        });
        const data = await res.json();

        if (data.status === "success") {
          console.log("Fetched pickup data:", data.data);

          setPickups(data.data);
          setTotalLaptopss(data.totalLaptops);
        }
      } catch (error) {
        console.error("Error fetching pickup data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`
        );
        const data = await response.json();
        setLaptopData(data || []);

        // Calculate counts
        setTotalLaptops(data.length);
        setRefurbishedCount(
          data.filter(item => item.Status === "Laptop Refurbished").length
        );
        setDistributedCount(
          data.filter(item => item.Status === "Distributed").length
        );
      } catch (error) {
        console.error("Error fetching laptop data:", error);
      }
    };

    fetchData();
  }, []);

  // Get unique organizations from laptop data and pickups
  useEffect(() => {
    const orgSet = new Set();

    // Add organizations from laptop data
    laptopData.forEach(laptop => {
      const donorCompany = laptop["Donor Company Name"];
      if (donorCompany && donorCompany.trim()) {
        orgSet.add(donorCompany.trim());
      }
    });

    // Add organizations from pickup data
    pickups.forEach(pickup => {
      const donor = pickup["Donor Company"];
      if (donor && donor.trim()) {
        orgSet.add(donor.trim());
      }
    });


    setUniqueOrganizations(Array.from(orgSet).sort());
  }, [laptopData, pickups]);

  // Filter functions
  const getFilteredLaptopData = () => {
    if (!selectedOrganization) return laptopData;
    return laptopData.filter(laptop =>
      String(laptop["Donor Company Name"]).trim().toLowerCase() ===
      selectedOrganization.toLowerCase()
    );
  };


  const getFilteredPickups = () => {
    if (!selectedOrganization) return pickups;
    return pickups.filter(pickup =>
      String(pickup["Donor Company"]).trim().toLowerCase() ===
      selectedOrganization.toLowerCase()
    );
  };

  // Apply filters to get filtered data
  const filteredLaptopData = getFilteredLaptopData();
  const filteredPickups = getFilteredPickups();
  // Calculate counts based on filtered data
  const refurbishedCountt = filteredLaptopData.reduce((acc, item) => {
    const status = (item.Status || "").toLowerCase();

    if (status.includes("to be dispatch")) {
      return acc + 1;
    }

    if (status.includes("allocated")) {
      return acc + 1;
    }

    if (status.includes("distributed")) {
      return acc + 1;
    }
    return acc;
  }, 0);

  const distributedCountt = filteredLaptopData.filter(
    item => item.Status === "Distributed"
  ).length;

  const PickupCountt = filteredLaptopData.filter(
    item => item.Status === "Pickup Requested"
  ).length;

  const filteredTotalLaptops = selectedOrganization ?
    filteredPickups.length :
    totalLaptopss;

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleOrganizationSelect = (org) => {
    setSelectedOrganization(org);
    handleFilterClose();

    navigate(`/donorcsr/laptop-pipeline`, { replace: true });
  };

  const handleClearFilter = () => {
    setSelectedOrganization(null);
    handleFilterClose();

    navigate(`/donorcsr/laptop-pipeline`, { replace: true });
  };

  function parseDateUniversal(dateStr) {
    if (!dateStr) return null;
    dateStr = String(dateStr).trim();

    // 1. Built-in parse
    const builtIn = new Date(dateStr);
    if (!isNaN(builtIn)) return builtIn;

    // 2. DD-MM-YYYY (with optional time)
    let m = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
    if (m) {
      return new Date(+m[3], +m[2] - 1, +m[1], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
    }

    // 3. YYYY-MM-DD or YYYY/MM/DD (with optional time)
    m = dateStr.match(/^(\d{4})[-/](\d{2})[-/](\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
    if (m) {
      return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
    }

    return null;
  }

  const calculateAvgCommittedTime = (data) => {
    const diffs = data
      .map((row, idx) => {
        const raw = row["Date Committed"];

        const date = parseDateUniversal(raw);
        if (!date) {
          return null;
        }
        const diffDays = (Date.now() - date.getTime()) / 86400000;
        return diffDays >= 0 ? diffDays : null;
      })
      .filter(Boolean);

    if (!diffs.length) {
      return 0;
    }

    return diffs.length
      ? `${Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length)} days`
      : "0 days";

  };

  const calculateAvgRefurbishedTime = (data) => {
    const diffs = data
      .map(l => {
        const c = parseDateUniversal(l["Date Committed"]);
        const d = parseDateUniversal(l["Refurbishment Date"]);
        return (c && d && d >= c) ? (d - c) / 86400000 : null;
      })
      .filter(Boolean);

    return diffs.length
      ? `${Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length)} days`
      : "0 days";

  };

  const calculateAvgDistributionTime = (data) => {
    const diffs = data
      .map(l => {
        const c = parseDateUniversal(l["Refurbishment Date"]);
        const d = parseDateUniversal(l["Last Delivery Date"]);
        return (c && d && d >= c) ? (d - c) / 86400000 : null;
      })
      .filter(Boolean);

    return diffs.length
      ? `${Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length)} days`
      : "0 days";

  };

  const avgActiveUsageDays = Math.round(
    filteredLaptopData
      .map(l => {
        const d = parseDateUniversal(l["Date"]);
        return d ? (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24) : null;
      })
      .filter(Boolean)
      .reduce((a, b) => a + b, 0) / filteredLaptopData.length
  );



  const stages = [
    {
      title: "Pickup Requested",
      subtitle: "Corporate requests submitted",
      avg: calculateAvgCommittedTime(
        selectedOrganization ? filteredLaptopData : laptopData
      ),
      count: PickupCountt,
      // count: selectedOrganization
      //   ? filteredPickups.filter(p => p.Status === "Pending")
      //     .reduce((total, pickup) => total + (parseInt(pickup["Number of Laptops"]) || 0), 0)
      //   : pickups.filter(p => p.Status === "Pending")
      //     .reduce((total, pickup) => total + (parseInt(pickup["Number of Laptops"]) || 0), 0),
      icon: <Package size={30} color="#1976d2" />,
    },
    // {
    //   title: "Assessment",
    //   subtitle: "Quality evaluation in progress",
    //   avg: "2-3 days",
    //   count: 8,
    // icon: <Tools size={30} color="#1976d2" />,
    // },
    {
      title: "Refurbishment",
      subtitle: "Hardware restoration & software setup",
      avg: calculateAvgRefurbishedTime(
        selectedOrganization ? filteredLaptopData : laptopData
      ),
      count: refurbishedCountt,
      icon: <Tools size={30} color="#1976d2" />,
    },
    {
      title: "Distribution",
      subtitle: "Ready for NGO delivery",
      avg: calculateAvgDistributionTime(
        selectedOrganization ? filteredLaptopData : laptopData
      ),
      count: distributedCountt,
      icon: <Truck size={30} color="#1976d2" />,
    },
    {
      title: "Active Usage",
      subtitle: "In use by beneficiaries",
      avg: `${avgActiveUsageDays} days`,
      count: `${filteredLaptopData.filter(l => {
        const d = parseDateUniversal(l["Date"]);
        if (!d) return false;
        const diffDays = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays <= 15;
      }).length} `,
      icon: <Users size={30} color="#1976d2" />,
    },
  ];

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          px: 2,
          py: 2,
          borderBottom: "1px solid #eee",
          gap: 2,
        }}
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
        <Box sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 1.5,
          mt: { xs: 2, sm: 0 },
        }}>
          {isAdmin && selectedOrganization && (
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
          {isAdmin &&(
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
              Filter by Donor
            </Button>
          )}
          <Typography variant="body2" color="text.secondary">
            Corporate Partner
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            sx={{ borderRadius: "10px", textTransform: "none" }}
          // onClick={handleExport}
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

      <Box sx={{ p: 4, bgcolor: "#f9fafb", minHeight: "100vh", mt: 4 }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
          <Typography
            variant="h5"
            sx={{ fontWeight: 'bold', color: '#333' }}
          >
            Laptop Journey Pipeline
          </Typography>
          {/* <FormControl size="small">
            <InputLabel>Filter</InputLabel>
            <Select value={selectedDays} label="Filter" onChange={handleDaysChange}>
              <MenuItem value={30}>Last 30 days</MenuItem>
              <MenuItem value={60}>Last 15 days</MenuItem>
              <MenuItem value={90}>Last 1 week</MenuItem>
            </Select>
          </FormControl> */}
        </Box>

        {/* Pipeline Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Current Pipeline Status
            {isAdmin && selectedOrganization && (
              <Chip
                label={`Filtered: ${selectedOrganization}`}
                size="small"
                variant="outlined"
                sx={{ ml: 2 }}
              />
            )}
          </Typography>

          <Grid container spacing={2}>
            {stages.map((stage) => (
              <React.Fragment key={stage.title}>

                <Grid item xs={12} >
                  <Card
                    sx={{
                      bgcolor: "#e3f2fd",
                      borderRadius: 2,
                      boxShadow: "none",
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                        transform: 'translateY(-2px)',
                        transition: 'all 0.2s ease-in-out'
                      }
                    }} onClick={() => handleStageClick(stage)}
                  >
                    <CardContent
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box>
                          <Box
                            sx={{
                              // bgcolor: "#1976d2",
                              borderRadius: "8px",
                              width: 40,
                              height: 40,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {stage.icon}
                          </Box>
                          <Typography variant="subtitle1" fontWeight={600} sx={{ color: "black" }}>
                            {stage.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {stage.subtitle}
                          </Typography>
                          {/* <Typography variant="caption" color="text.secondary">
                            Avg. time in stage
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {stage.avg}
                          </Typography> */}
                        </Box>
                      </Box>
                      <Typography variant="h6" fontWeight={700}>
                        {stage.count}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                {expandedStage === stage.title && (
                  <Grid item xs={12}>
                    {renderTable()}
                  </Grid>
                )}
              </React.Fragment>
            ))}
          </Grid>
        </Box>

        {/* Processing Times */}

        {/* Processing Times */}
        {/* <ThemeProvider theme={theme}>
          <Box sx={{ mt: 4 }}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "none",
                border: "1px solid #e0e0e0",
                backgroundColor: "#fff", // Outer card stays white
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: "#2c3e50",
                    mb: 3,
                    fontSize: "18px",
                  }}
                >
                  Average Processing Times
                </Typography>

                {processingData.map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      mb: index === processingData.length - 1 ? 0 : 2,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "#f9fafb", // light blue only for inner rows
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#374151",
                          fontSize: "14px",
                          fontWeight: 500,
                          mb: 0.5,
                        }}
                      >
                        {item.title}
                      </Typography>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          color: "#1f2937",
                          fontSize: "22px",
                        }}
                      >
                        {item.days}
                      </Typography>
                    </Box>

                    <Typography
                      variant="body2"
                      sx={{
                        color: item.isPositive ? "#10b981" : "#ef4444",
                        fontSize: "14px",
                        fontWeight: 600,
                      }}
                    >
                      {item.change}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Box>
        </ThemeProvider> */}

        {/* <Card sx={{
          mb: 3,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0',
          mt: 4
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ mb: 4, }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#333' }}>
                Stage Success Rates
              </Typography>

              <Stack spacing={3}>
                {stageData.map((stage, index) => (
                  <Box key={index}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500, color: '#333' }}>
                        {stage.title}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#333' }}>
                        {stage.percentage}%
                      </Typography>
                    </Box>

                    <LinearProgress
                      variant="determinate"
                      value={stage.percentage}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: stage.color,
                          borderRadius: 4,
                        },
                        mb: 1
                      }}
                    />

                    <Typography variant="body2" sx={{ color: '#666', fontSize: '0.875rem' }}>
                      {stage.laptops} laptops
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{
          mb: 3,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0',
          mt: 4
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ mb: 4, }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#333' }}>
                Pipeline Insights & Recommendations
              </Typography>

              <Stack spacing={2}>
                {insights.map((insight, index) => (
                  <Card
                    key={index}
                    sx={{
                      backgroundColor: insight.backgroundColor,
                      border: `1px solid ${insight.borderColor}`,
                      boxShadow: 'none',
                      borderRadius: 1
                    }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <Box sx={{
                          color: insight.borderColor,
                          mt: 0.25,
                          '& .MuiSvgIcon-root': { fontSize: '1.2rem' }
                        }}>
                          {insight.icon}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 600,
                              color: insight.textColor,
                              mb: 0.5,
                              fontSize: '0.95rem'
                            }}
                          >
                            {insight.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: insight.textColor,
                              fontSize: '0.875rem',
                              lineHeight: 1.4
                            }}
                          >
                            {insight.description}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Box>
          </CardContent>
        </Card> */}
      </Box>
    </>
  );
};

export default LaptopPipeline;

