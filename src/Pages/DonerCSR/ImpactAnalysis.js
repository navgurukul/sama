import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Select,
  MenuItem,
  Button,
  FormControl,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import NatureIcon from "@mui/icons-material/Nature";
import ComputerIcon from "@mui/icons-material/Computer";
import DownloadIcon from "@mui/icons-material/Download";


// inside your JSX
<NatureIcon sx={{ color: "green", fontSize: 40 }} />


const ProgressBar = ({ value, color }) => (
  <LinearProgress
    variant="determinate"
    value={value}
    sx={{
      height: 8,
      borderRadius: 4,
      backgroundColor: "#f0f0f0",
      "& .MuiLinearProgress-bar": {
        backgroundColor: color,
      },
    }}
  />
);

const ImpactAnalysis = () => {
  const [timeframe, setTimeframe] = React.useState('Last 30 days');

  const handleTimeframeChange = (event) => {
    setTimeframe(event.target.value);
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
      <Box sx={{ p: 3, bgcolor: '#f9f9f9', mt: 4 }}>
        {/* Header */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3
        }}>
          <Typography
            variant="h5"
            sx={{ fontWeight: 'bold', color: '#333' }}
          >
            Impact Analytics
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select
                value={timeframe}
                onChange={handleTimeframeChange}
                sx={{
                  backgroundColor: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#ddd'
                  }
                }}
              >
                <MenuItem value="Last 30 days">Last 30 days</MenuItem>
                <MenuItem value="Last 7 days">Last 7 days</MenuItem>
                <MenuItem value="Last 90 days">Last 90 days</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              sx={{
                variant: "outlined",
                textTransform: 'none',
                px: 3,
                '&:hover': {
                  backgroundColor: '#3367d6'
                }
              }}
            >
              Generate Report
            </Button>
          </Box>
        </Box>

        {/* Metrics Grid */}
        <Grid container spacing={3}>
          {/* Environmental Impact */}
          <Grid item xs={12}>
            <Card sx={{
              backgroundColor: '#e8f5e8',
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#4a7c59', fontWeight: 500, mb: 1 }}>
                      Environmental Impact
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#2e5233', mb: 0.5 }}>
                      3.2 tons
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#4a7c59', mb: 2 }}>
                      CO₂ emissions avoided
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#4a7c59' }}>
                      Equivalent to planting 145 trees
                    </Typography>
                  </Box>
                  <NatureIcon sx={{ fontSize: 38, color: "#4a7c59" }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Digital Inclusion */}
          <Grid item xs={12}>
            <Card sx={{
              backgroundColor: '#e3f2fd',
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 500, mb: 1 }}>
                      Digital Inclusion
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#0d47a1', mb: 0.5 }}>
                      1,247
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#1976d2', mb: 2 }}>
                      People gained access
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#1976d2' }}>
                      68% first-time computer users
                    </Typography>
                  </Box>
                  <PeopleIcon sx={{ fontSize: 38, color: '#1976d2' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Skills Development */}
          <Grid item xs={12}>
            <Card sx={{
              backgroundColor: '#f3e5f5',
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#7b1fa2', fontWeight: 500, mb: 1 }}>
                      Skills Development
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#4a148c', mb: 0.5 }}>
                      2,840
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#7b1fa2', mb: 2 }}>
                      Training hours completed
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#7b1fa2' }}>
                      Average 7.2 hours per beneficiary
                    </Typography>
                  </Box>
                  <CheckCircleIcon sx={{ fontSize: 38, color: '#7b1fa2' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Economic Value */}
          <Grid item xs={12}>
            <Card sx={{
              backgroundColor: '#fff3e0',
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#f57c00', fontWeight: 500, mb: 1 }}>
                      Economic Value
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#e65100', mb: 0.5 }}>
                      ₹45.6L
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#f57c00', mb: 2 }}>
                      Estimated value created
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#f57c00' }}>
                      ROI: 340% on refurbishment cost
                    </Typography>
                  </Box>
                  <TrendingUpIcon sx={{ fontSize: 38, color: '#f57c00' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        {/* Geographic Impact Distribution */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 2, mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Geographic Impact Distribution
            </Typography>
            {[
              { state: "Maharashtra", laptops: 156, users: 468, value: 75 },
              { state: "Karnataka", laptops: 134, users: 402, value: 65 },
              { state: "Delhi NCR", laptops: 89, users: 267, value: 40 },
              { state: "Tamil Nadu", laptops: 67, users: 201, value: 20 },
            ].map((item, index) => (
              <Box key={index} mb={2}>
                <Grid container justifyContent="space-between">
                  <Typography>{item.state}</Typography>
                  <Typography>
                    {item.laptops} laptops ({item.users} users)
                  </Typography>
                </Grid>
                <ProgressBar value={item.value} color="#4A90E2" />
              </Box>
            ))}
          </CardContent>
        </Card>

        {/* Usage Analytics */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Usage Analytics
            </Typography>

            <Box mb={3}>
              <Grid container justifyContent="space-between">
                <Typography>Daily Active Users</Typography>
                <Typography>78%</Typography>
              </Grid>
              <ProgressBar value={78} color="#34C759" />
              <Typography variant="body2" color="textSecondary">
                972 out of 1,247 beneficiaries
              </Typography>
            </Box>

            <Box mb={3}>
              <Grid container justifyContent="space-between">
                <Typography>Average Session Duration</Typography>
                <Typography>3.4 hrs</Typography>
              </Grid>
              <ProgressBar value={55} color="#007AFF" />
            </Box>

            <Box>
              <Grid container justifyContent="space-between">
                <Typography>Skill Completion Rate</Typography>
                <Typography>85%</Typography>
              </Grid>
              <ProgressBar value={85} color="#AF52DE" />
            </Box>
          </CardContent>
        </Card>

        {/* Impact Stories */}
        <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Impact Stories
            </Typography>

            <Box mb={3} p={2} sx={{ backgroundColor: "#f9f9f9", borderRadius: 2 }}>
              <Typography fontWeight="bold">Rural Student Success</Typography>
              <Typography variant="body2" color="textSecondary">
                Priya from Maharashtra secured her first job in data entry after completing
                digital literacy training on a refurbished laptop.
              </Typography>
              <Typography variant="body2" sx={{ color: "green", fontWeight: "bold" }}>
                Monthly income: ₹15,000
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Digital Learning Hub
              </Typography>
            </Box>

            <Box p={2} sx={{ backgroundColor: "#f9f9f9", borderRadius: 2 }}>
              <Typography fontWeight="bold">Small Business Growth</Typography>
              <Typography variant="body2" color="textSecondary">
                Rajesh expanded his tailoring business by learning digital marketing and
                online ordering through NGO training programs.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </>
  );
};

export default ImpactAnalysis;