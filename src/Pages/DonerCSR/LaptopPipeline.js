import React, { useEffect, useState } from 'react'; 
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
  Button
} from "@mui/material";
import {
  Truck,
  Settings as Tools,
  RefreshCw,
  Package,
  Users,
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
const [laptopData, setLaptopData] = useState([]);
  const [totalLaptops, setTotalLaptops] = useState(0);
  const [refurbishedCount, setRefurbishedCount] = useState(0);
  const [distributedCount, setDistributedCount] = useState(0);
  const [totalLaptopss, setTotalLaptopss] = useState(0);
  

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
            
            // setPickups(data.data);
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
  
  const stages = [
  {
    title: "Pickup Requested",
    subtitle: "Corporate requests submitted",
    avg: "1-2 days",
    count: totalLaptopss,
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
    avg: "5-7 days",
    count: refurbishedCount,
    icon: <Tools size={30} color="#1976d2" />,
  },
  {
    title: "Distribution",
    subtitle: "Ready for NGO delivery",
    avg: "1-2 days",
    count: distributedCount,
    icon: <Truck size={30} color="#1976d2" />,
  },
  {
    title: "Active Usage",
    subtitle: "In use by beneficiaries",
    avg: "Ongoing",
    count: distributedCount,
    icon: <Users size={30} color="#1976d2" />,
  },
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
      <Box sx={{ p: 4, bgcolor: "#f9fafb", minHeight: "100vh", mt: 4 }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
          <Typography
            variant="h5"
            sx={{ fontWeight: 'bold', color: '#333' }}
          >
            Laptop Journey Pipeline
          </Typography>
          <FormControl size="small">
            <InputLabel>Filter</InputLabel>
            <Select defaultValue={30} label="Filter">
              <MenuItem value={30}>Last 30 days</MenuItem>
              <MenuItem value={60}>Last 60 days</MenuItem>
              <MenuItem value={90}>Last 90 days</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Pipeline Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Current Pipeline Status
          </Typography>
          <Grid container spacing={2}>
            {stages.map((stage) => (
              <Grid item xs={12} key={stage.title} >
                <Card
                  sx={{
                    bgcolor: "#e3f2fd",
                    borderRadius: 2,
                    boxShadow: "none",

                  }}
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
                        <Typography variant="caption" color="text.secondary">
                          Avg. time in stage
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {stage.avg}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="h6" fontWeight={700}>
                      {stage.count}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
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

