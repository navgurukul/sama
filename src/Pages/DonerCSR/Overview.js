import React, { useEffect, useState } from 'react'; import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Container,
  Paper,
  useTheme,
  useMediaQuery,
  Divider,
  Chip,
  Button,
} from '@mui/material';
import {
  Package,
  CheckCircle,
  Users,
  Building,
  Leaf,
  BookOpen,
  TrendingUp,
  Settings,
  Truck,
  UserCheck,
  Clock,
  Laptop,
  Calendar,
} from 'lucide-react';

const Overview = () => {
  const theme = useTheme();
  const [laptopData, setLaptopData] = useState([]);
  const [ngoData, setNgoData] = useState([]);
  const [approvedCount, setApprovedCount] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [ngoPartner, setNgoPartner] = useState([]);
  const [userData, setUserData] = useState([]);

 useEffect(() => {
    const fetchData = async () => {
      try {
        const laptopRes = await fetch(`${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`);
        const laptopJson = await laptopRes.json();

        const ngoRes = await fetch(`${process.env.REACT_APP_NgoInformationApi}?type=registration`);
        const ngoJson = await ngoRes.json();

        const userRes = await fetch(`${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getUserData`);
        const userJson = await userRes.json();

        const approved = ngoJson.data.filter((ngo) => ngo.Status === "Approved");

        const partners = approved.map((ngo) => {
          const laptopsAllocated = laptopJson.filter(
            (laptop) =>
              String(laptop["Allocated To"]).trim().toLowerCase() ===
              String(ngo.organizationName).trim().toLowerCase()
          ).length;

          const beneficiariesCount = userJson.filter(
            (user) => String(user.Ngo).trim() === String(ngo.Id).trim()
          ).length;

          return {
            name: ngo.organizationName,
            status: ngo.Status,
            location: ngo.location || "Unknown",
            laptops: laptopsAllocated,
            beneficiaries: beneficiariesCount, 
            lastDelivery: ngo.lastDelivery || "N/A",
          };
        });

        setNgoPartner(partners);
        setLaptopData(laptopJson || []);
        setUserData(userJson || []);
        setApprovedCount(approved.length);
      } catch (err) {
        console.error("Error fetching overview data:", err);
      }
    };

    fetchData();
  }, []);

ngoData.map((ngo) => {
    console.log("Checking NGO:", ngo.organizationName);

    const laptops = laptopData.filter((row) => {
      const allocatedTo = String(row["Allocated To"]).trim().toLowerCase();
      const ngoName = String(ngo.organizationName).trim().toLowerCase();

      const match = allocatedTo === ngoName;

      if (match) {
        console.log("✅ Match found:", allocatedTo, "<->", ngoName);
      }

      return match;
    }).length;

    console.log(`Laptops for ${ngo.organizationName}:`, laptops);

    const beneficiariesCount = userData.filter(
      (user) => String(user.Ngo || user.ngoId) === String(ngo.ID)
    ).length;


    console.log(`Beneficiaries for ${ngo.organizationName}:`, beneficiariesCount);

    return {
      ...ngo,
      laptopCount: laptops,
      beneficiaryCount: beneficiariesCount, // ✅ use the correct variable here
    };
  });


  const totalLaptops = laptopData.length;
  const refurbishedCount = laptopData.filter(
    (laptop) => laptop.Status === "Laptop Refurbished"
  ).length;
  const distributedCount = laptopData.filter(
    (laptop) => laptop.Status === "Distributed"
  ).length;
  const ngolaptopCount = laptopData.filter(
    (laptop) => laptop.ID === "Distributed"
  ).length;



  // Components
  const MetricCard = ({ title, value, subtitle, growth, icon: Icon }) => (
    <Card sx={{
      height: '100%',
      minHeight: 140,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0'
    }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="body2" sx={{ fontSize: 14, fontWeight: 500, color: '#666' }}>
            {title}
          </Typography>
          {Icon && <Icon size={16} color="#666" />}
        </Box>
        <Typography variant="h4" sx={{ fontSize: 32, fontWeight: 600, color: '#1a1a1a', mb: 1 }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ fontSize: 12, color: '#666', mb: 0.5 }}>
          {subtitle}
        </Typography>
        {growth && (
          <Typography variant="body2" sx={{ fontSize: 12, color: '#4caf50' }}>
            {growth}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const SecondaryCard = ({ title, value, subtitle, icon: Icon, iconColor }) => (
    <Card sx={{
      height: '100%',
      minHeight: 140,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0'
    }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="body2" sx={{ fontSize: 14, fontWeight: 500, color: '#666' }}>
            {title}
          </Typography>
          <Icon size={16} color={iconColor} />
        </Box>
        <Typography variant="h4" sx={{ fontSize: 32, fontWeight: 600, color: '#1a1a1a', mb: 1 }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ fontSize: 12, color: '#666' }}>
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );

  const PipelineStep = ({ icon: Icon, title, subtitle, count, backgroundColor, iconColor }) => (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center'
    }}>
      <Box sx={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 1.5,
        backgroundColor
      }}>
        <Icon size={24} color={iconColor} />
      </Box>
      <Typography variant="h6" sx={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ fontSize: 12, color: '#666', mb: 1 }}>
        {subtitle}
      </Typography>
      <Typography variant="body1" sx={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a' }}>
        {count}
      </Typography>
    </Box>
  );

  const SummaryMetric = ({ label, value, color = '#1a1a1a' }) => (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="body2" sx={{ fontSize: 12, color: '#666', mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="h6" sx={{ fontSize: 20, fontWeight: 600, color }}>
        {value}
      </Typography>
    </Box>
  );

  const recentActivities = [
    {
      id: "AF",
      title: "15 laptops distributed to Akshara Foundation",
      status: "completed",
      time: "2 hours ago",
      avatar: "AF",
      color: "success.main",
    },
    {
      id: "T",
      title: "New pickup request from TCS Bangalore",
      status: "pending",
      time: "4 hours ago",
      avatar: "T",
      color: "warning.main",
    },
    {
      id: "SW",
      title: "25 laptops completed refurbishment",
      status: "completed",
      time: "6 hours ago",
      avatar: "SW",
      color: "success.main",
    },
    {
      id: "I",
      title: "Quality check completed for Infosys donation",
      status: "completed",
      time: "1 day ago",
      avatar: "I",
      color: "info.main",
    },
    {
      id: "TFI",
      title: "8 laptops delivered to Teach for India",
      status: "completed",
      time: "1 day ago",
      avatar: "TFI",
      color: "success.main",
    },
  ];

  // 
  const getStatusIcon = (status) => {
    if (status === "completed")
      return <CheckCircle size={16} style={{ color: "green" }} />;
    if (status === "pending")
      return <Clock size={16} style={{ color: "orange" }} />;
    return null;
  };

  const getStatusChip = (status) => (
    <Chip
      label={status}
      size="small"
      color={status === "Active" ? "success" : "warning"}
      variant="outlined"
    />
  );

const totalBeneficiaries = ngoPartner.reduce(
  (sum, partner) => sum + (partner.beneficiaries || 0),
  0
);


  return (
    <>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{
            width: 32,
            height: 32,
            backgroundColor: '#4caf50',
            mr: 1.5,
            fontSize: 14,
            fontWeight: 600
          }}>

          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" color="black">
              Sama CSR Dashboard
            </Typography>
            <Typography variant="body2" sx={{ fontSize: 12, color: '#666' }}>
              Laptop Refurbishment & Distribution Tracking
            </Typography>
          </Box>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" sx={{ fontSize: 12, color: '#666', fontWeight: 'bold' }}>
            Corporate Partner
          </Typography>
          <Typography variant="body2" sx={{ fontSize: 12, color: '#666' }}>
            Dashboard Access
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ mb: 3, width: '100%' }} />
      <Box sx={{
        p: 3,
        pb: 10,

      }}>

        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            sx={{ fontWeight: 'bold', color: '#333' }}
          > CSR Impact Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', fontSize: 16 }}>
            Comprehensive tracking of laptop refurbishment and distribution impact
          </Typography>
        </Box>

        {/* Top Metrics Row */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Total Laptops Collected"
              value={totalLaptops}
              subtitle="Lifetime donations from corporates"
              growth="+15.2% from last month"
              icon={Package}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Successfully Refurbished"
              value={refurbishedCount}
              subtitle="94.2% success rate"
              growth="+8.1% from last month"
              icon={CheckCircle}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>

            <MetricCard
              title="Active Beneficiaries"
              value={totalBeneficiaries}
              subtitle="Currently using laptops"
              growth="+23.6% from last month"
              icon={Users}
            />

          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="NGO Partners"
              value={approvedCount}
              subtitle="Organizations served"
              growth="+12% from last month"
              icon={Building}
            />
          </Grid>
        </Grid>

        {/* Secondary Metrics Row */}
        {/* <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <SecondaryCard
              title="Environmental Impact"
              value="8.2 tons"
              subtitle="E-waste diverted from landfills"
              icon={Leaf}
              iconColor="#4caf50"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <SecondaryCard
              title="Digital Skills Trained"
              value="1,450"
              subtitle="Individuals trained on refurbished laptops"
              icon={BookOpen}
              iconColor="#9c27b0"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <SecondaryCard
              title="Monthly Active Users"
              value="756"
              subtitle="Average monthly laptop usage"
              icon={TrendingUp}
              iconColor="#ff9800"
            />
          </Grid>
        </Grid> */}

        {/* Laptop Journey Pipeline */}
        <Card sx={{
          mb: 3,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ fontSize: 20, fontWeight: 600, color: '#1a1a1a', mb: 1 }}>
                Laptop Journey Pipeline
              </Typography>
              <Typography variant="body1" sx={{ fontSize: 14, color: '#666' }}>
                Real-time tracking of laptops through the refurbishment process
              </Typography>
            </Box>

            {/* Pipeline Steps */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {[
                { icon: Package, title: "Pickup Requested", subtitle: "Corporate request submitted", count: "45 laptops", bgColor: "#e3f2fd", iconColor: "#1976d2" },
                // { icon: CheckCircle, title: "Assessment", subtitle: "Condition evaluation", count: "32 laptops", bgColor: "#fff3e0", iconColor: "#f57c00" },
                { icon: Settings, title: "Refurbishment", subtitle: "Repair & software setup", count: `${refurbishedCount} laptops`, bgColor: "#e8f5e8", iconColor: "#388e3c" },
                { icon: Truck, title: "Distribution", subtitle: "Delivered to NGOs", count: `${distributedCount} laptops`, bgColor: "#f3e5f5", iconColor: "#7b1fa2" },
                { icon: UserCheck, title: "Active Usage", subtitle: "In use by beneficiaries", count: `${distributedCount}` , bgColor: "#ffebee", iconColor: "#d32f2f" }
              ].map((step, index) => (
                // <Grid item xs={6} sm={4} md={2.4} key={index}>
                <Grid item xs={6} sm={4} md={3} key={index}>
                  <PipelineStep
                    icon={step.icon}
                    title={step.title}
                    subtitle={step.subtitle}
                    count={step.count}
                    backgroundColor={step.bgColor}
                    iconColor={step.iconColor}
                  />
                </Grid>
              ))}
            </Grid>

            {/* Summary Metrics */}
            <Box sx={{
              borderTop: '1px solid #e0e0e0',
              pt: 3
            }}>
              <Grid container spacing={3}>
                <Grid item xs={6} sm={3}>
                  <SummaryMetric label="Total Processed" value="403" />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <SummaryMetric label="Success Rate" value="94.2%" color="#4caf50" />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <SummaryMetric label="Avg. Processing Time" value="12 days" />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <SummaryMetric label="NGOs Served" value="28" />
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
        <Grid container spacing={3}>
          {/* Recent Activity Section */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <Calendar size={20} style={{ marginRight: 8, color: "#555" }} />
                  <Typography variant="h6" fontWeight={600}>
                    Recent Activity
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Latest updates across the platform
                </Typography>

                {recentActivities.map((activity, index) => (
                  <Box key={activity.id} mb={2.5}>
                    <Box display="flex" alignItems="flex-start">
                      <Avatar
                        sx={{
                          bgcolor: activity.color,
                          width: 32,
                          height: 32,
                          fontSize: 12,
                          mr: 2,
                        }}
                      >
                        {activity.avatar}
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="body2" fontWeight={500} gutterBottom>
                          {activity.title}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          {getStatusIcon(activity.status)}
                          <Typography
                            variant="caption"
                            fontWeight={600}
                            color={
                              activity.status === "completed"
                                ? "success.main"
                                : "warning.main"
                            }
                          >
                            {activity.status}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {activity.time}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    {index < recentActivities.length - 1 && (
                      <Divider sx={{ mt: 2 }} />
                    )}
                  </Box>
                ))}

                <Button size="small" sx={{ mt: 2 }} color="primary">
                  View all activities →
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* NGO Partners Section */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <Building size={20} style={{ marginRight: 8, color: "#555" }} />
                  <Typography variant="h6" fontWeight={600}>
                    NGO Partners
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Organizations receiving laptop distributions
                </Typography>

                {(showAll ? ngoPartner : ngoPartner.slice(0, 3)).map(
                  (partner, index) => (
                    <Box key={partner.name} mb={3}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" fontWeight={600}>
                          {partner.name}
                        </Typography>
                        {getStatusChip(partner.status)}
                      </Box>

                      <Typography variant="caption" color="text.secondary">
                        📍 {partner.location}
                      </Typography>

                      <Box display="flex" justifyContent="space-between" mt={2}>
                        <Box display="flex" gap={4}>
                          <Box textAlign="center">
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <Laptop size={16} color="#555" />
                              <Typography
                                variant="subtitle1"
                                fontWeight={600}
                                color="primary"
                              >
                                {partner.laptops}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              Laptops
                            </Typography>
                          </Box>

                          <Box textAlign="center">
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <Users size={16} color="#555" />
                              <Typography
                                variant="subtitle1"
                                fontWeight={600}
                                color="success.main"
                              >
                                {partner.beneficiaries}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              Beneficiaries
                            </Typography>
                          </Box>
                        </Box>

                        <Box textAlign="right">
                          <Typography variant="body2" fontWeight={500}>
                            {partner.lastDelivery}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Last delivery
                          </Typography>
                        </Box>
                      </Box>

                      {index < ngoPartner.length - 1 && <Divider sx={{ mt: 2 }} />}
                    </Box>
                  )
                )}

                {ngoPartner.length > 3 && (
                  <Button
                    size="small"
                    sx={{ mt: 2 }}
                    color="primary"
                    onClick={() => setShowAll(!showAll)}
                  >
                    {showAll ? "Hide NGO partners ↑" : "View all NGO partners →"}
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default Overview;