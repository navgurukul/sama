import React, { useState, useEffect } from 'react';
import RecentActivity from './RecentActivity';
import {
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
  const [pickups, setPickups] = useState([]);
  const [totalLaptopss, setTotalLaptopss] = useState(0);

  const theme = useTheme();
  const [laptopData, setLaptopData] = useState([]);
  const [ngoData, setNgoData] = useState([]);
  const [approvedCount, setApprovedCount] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [ngoPartner, setNgoPartner] = useState([]);
  const [userData, setUserData] = useState([]);
  const [showAllActivities, setShowAllActivities] = useState(false);

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


  // Mapping through Sheets

  ngoData.map((ngo) => {
   

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
      beneficiaryCount: beneficiariesCount, 
    };
  });

  // Total Counting
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
  const totalBeneficiaries = ngoPartner.reduce(
    (sum, partner) => sum + (partner.beneficiaries || 0),
    0
  );
  const totalProcessed = refurbishedCount + distributedCount;
  const successRate =
    totalLaptops > 0 ? ((refurbishedCount / totalLaptops) * 100).toFixed(2) : 0;
  const ngosServedCount = ngoPartner.filter(
    (partner) => partner.laptops > 0
  ).length;



  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          // ${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}
          // 'https://script.google.com/macros/s/AKfycbxWGV8prp8U6oPvej2Qm6_w3c38qzMmHFidxhDBvMa1Cek5TAn9DHrloIbrx74OfBY2_Q/exec?type=pickupget', {
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


  const getStatusChip = (status) => (
    <Chip
      label={status}
      size="small"
      color={status === "Active" ? "success" : "warning"}
      variant="outlined"
    />
  );
  const getStatusIcon = (status) => {
    if (status === "Distributed" || status === "Laptop Refurbished")
      return <CheckCircle size={16} style={{ color: "green" }} />;
    if (status === "To be dispatch" || status === "Tagged" || status === "Laptop Received")
      return <Clock size={16} style={{ color: "orange" }} />;
    return null;
  };
  // Fixed date parsing function for DD-MM-YYYY HH:MM:SS format
  function parseDate(dateString) {
    if (!dateString || typeof dateString !== "string" || dateString.trim() === "") {
      return null;
    }
    try {
      const [datePart, timePart] = dateString.trim().split(" ");
      if (!datePart || !timePart) return null;
      const [day, month, year] = datePart.split("-");
      const [hours, minutes, seconds] = timePart.split(":");
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes), parseInt(seconds));
    } catch (e) {
      console.error("Invalid date format:", dateString);
      return null;
    }
  }

  // Filter data from last 24 hours
  const last24HoursData = laptopData.filter(laptop => {
    const lastUpdatedStr = laptop["Last Updated On"];
    if (!lastUpdatedStr) return false;
    const lastUpdated = parseDate(lastUpdatedStr);
    if (!lastUpdated) return false;
    const hoursAgo = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60);
    return hoursAgo <= 24;
  });

  // for pickup
  const last24HoursPickups = pickups.filter(p => {
  const dateStr = p["Current Date & Time"];
  if (!dateStr) return false;
  const lastUpdated = parseDate(dateStr);
  if (!lastUpdated) return false;
  const hoursAgo = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60);
  return hoursAgo <= 24;
});

 

  const getRecentActivities = () => {
  const activities = [];

  // 1. Laptop-related activities
  if (last24HoursData.length > 0) {
    const activityMap = {};
    last24HoursData.forEach(laptop => {
      const status = laptop.Status || "Unknown";
      const allocatedTo = laptop["Allocated To"] || "Unassigned";
      const lastUpdated = parseDate(laptop["Last Updated On"]);

      let key;
      if (status === "Allocated" || status === "Distributed") {
        key = `${status}-${allocatedTo}`;
      } else {
        key = status;
      }

      if (!activityMap[key]) {
        activityMap[key] = {
          status,
          allocatedTo: (status === "Allocated" || status === "Distributed") ? allocatedTo : null,
          count: 0,
          lastUpdated,
          id: allocatedTo?.charAt(0).toUpperCase() || "?", // Avatar 
        };
      }
      activityMap[key].count++;
      if (activityMap[key].lastUpdated < lastUpdated) {
        activityMap[key].lastUpdated = lastUpdated;
      }
    });

    activities.push(...Object.values(activityMap));
  }

  // 2. Pickup-related activities
  if (last24HoursPickups.length > 0) {
    last24HoursPickups.forEach(p => {
      const donor = p["Donor Company"]?.trim?.() || "Unknown Donor";
      const pickupId = p["Pickup ID"];
      const lastUpdated = parseDate(p["Current Date & Time"]);

      activities.push({
        status: "Pickup Request",
        allocatedTo: donor,
        count: 1,
        lastUpdated,
        id: pickupId,
        message: `New pickup request by ${donor}`,
      });
    });
  }

  // Sort all activities by time
  return activities.sort((a, b) => b.lastUpdated - a.lastUpdated);
};

  const timeAgo = (timestamp) => {
    if (!timestamp) return "Unknown time";
    const diffMs = Date.now() - timestamp.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffHours === 0) {
      return diffMins <= 1 ? "Just now" : `${diffMins} mins ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} days ago`;
    }
  };



  const formatActivityMessage = (activity) => {
  if (activity.status === "Pickup Request") {
    return activity.message || `New pickup request by ${activity.allocatedTo}`;
  }

  const statusMessages = {
    "Laptop Received": "received",
    "Laptop Refurbished": "refurbished",
    "To be dispatch": "prepared for dispatch",
    "Distributed": "distributed to",
    "Allocated": "allocated to"
  };

  const action = statusMessages[activity.status] || activity.status.toLowerCase();
  const count = activity.count;
  const laptop = count === 1 ? "laptop" : "laptops";

  if (activity.status === "Distributed" || activity.status === "Allocated") {
    return `${count} ${laptop} ${action} ${activity.allocatedTo}`;
  } else {
    return `${count} ${laptop} ${action}`;
  }
};
  const getActivityColor = (status) => {
  switch (status) {
    case "Distributed":
      return "success.main";
    case "Laptop Refurbished":
      return "info.main";
    case "To be dispatch":
      return "warning.main";
    case "Laptop Received":
      return "primary.main";
    case "Allocated":
      return "secondary.main";
    case "Pickup Request":
      return "error.main"; 
    default:
      return "grey.500";
  }
};


  const recentActivities = getRecentActivities();
  
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
              subtitle={`${successRate}% success rate`}
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
                { icon: Package, title: "Pickup Requested", subtitle: "Corporate request submitted", count: `${totalLaptopss} laptops`, bgColor: "#e3f2fd", iconColor: "#1976d2" },
                // { icon: CheckCircle, title: "Assessment", subtitle: "Condition evaluation", count: "32 laptops", bgColor: "#fff3e0", iconColor: "#f57c00" },
                { icon: Settings, title: "Refurbishment", subtitle: "Repair & software setup", count: `${refurbishedCount} laptops`, bgColor: "#e8f5e8", iconColor: "#388e3c" },
                { icon: Truck, title: "Distribution", subtitle: "Delivered to NGOs", count: `${distributedCount} laptops`, bgColor: "#f3e5f5", iconColor: "#7b1fa2" },
                { icon: UserCheck, title: "Active Usage", subtitle: "In use by beneficiaries", count: `${distributedCount}`, bgColor: "#ffebee", iconColor: "#d32f2f" }
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
                  <SummaryMetric label="Total Processed" value={totalProcessed} />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <SummaryMetric label="Success Rate" value={`${successRate}%`} color="#4caf50" />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <SummaryMetric label="Avg. Processing Time" value="12 days" />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <SummaryMetric label="NGOs Served" value={ngosServedCount} />
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
        <Grid container spacing={3}>
          
          {/* Recent Activity Section */}
          <Grid item xs={12} md={6}>
            <RecentActivity
              recentActivities={recentActivities}
              showAllActivities={showAllActivities}
              setShowAllActivities={setShowAllActivities}
              getActivityColor={getActivityColor}
              formatActivityMessage={formatActivityMessage}
              getStatusIcon={getStatusIcon}
              timeAgo={timeAgo}
            />
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