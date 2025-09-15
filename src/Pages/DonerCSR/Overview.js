import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  IconButton,
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
  Filter,
  X,
  ChevronDown,
} from 'lucide-react';
import OverviewHeader from "./OverviewHeader";

const Overview = () => {
  const { donorName } = useParams();
  const [pickups, setPickups] = useState([]);
  const [totalLaptopss, setTotalLaptopss] = useState(0);
  const [selectedOrganization, setSelectedOrganization] = useState(donorName || null);

  const theme = useTheme();
  const [laptopData, setLaptopData] = useState([]);
  const [ngoData, setNgoData] = useState([]);
  const [approvedCount, setApprovedCount] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [ngoPartner, setNgoPartner] = useState([]);
  const [userData, setUserData] = useState([]);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [preData, setPreData] = useState([]);

  useEffect(() => {
    if (donorName) {
      setSelectedOrganization(donorName);
    }
  }, [donorName]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const laptopRes = await fetch(`${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`);
        const laptopJson = await laptopRes.json();

        const ngoRes = await fetch(`${process.env.REACT_APP_NgoInformationApi}?type=registration`);
        const ngoJson = await ngoRes.json();

        const userRes = await fetch(`${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getUserData`);
        const userJson = await userRes.json();

        const userPre = await fetch(`${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getpre`);
        const preJson = await userPre.json();
        setPreData(preJson || []);

        const approved = ngoJson.data.filter((ngo) => ngo.Status === "Approved");
        function parseDate(dateStr) {
          if (!dateStr) return null;
          const iso = Date.parse(dateStr);
          if (!isNaN(iso)) return new Date(iso);
          const parts = dateStr.split(/[-/ :]/);
          if (parts.length >= 3) {
            const [d, m, y, hh = 0, mm = 0, ss = 0] = parts.map((p) => parseInt(p, 10));
            return new Date(y, m - 1, d, hh, mm, ss);
          }
        }

        const partners = approved.map((ngo) => {
          const filteredLaptops = laptopJson.filter(
            (laptop) =>
              String(laptop["Allocated To"]).trim().toLowerCase() ===
              String(ngo.organizationName).trim().toLowerCase()
          );

          const laptopsAllocated = filteredLaptops.length;


          const beneficiariesCount = userJson.filter(
            (user) => String(user.Ngo).trim() === String(ngo.Id).trim()
          ).length;

          const deliveries = filteredLaptops
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
            name: ngo.organizationName,
            status: ngo.Status,
            location: ngo.location || "Unknown",
            laptops: laptopsAllocated,
            beneficiaries: beneficiariesCount,
            lastDelivery: lastDelivery
              ? lastDelivery.toLocaleString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })
              : "N/A", Doner: ngo.Doner || ngo.Donor || null,
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(

          `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=pickupget`, {
        });
        const data = await res.json();

        if (data.status === "success") {
          setPickups(data.data);
          setTotalLaptopss(data.totalLaptops);
        }
      } catch (error) {
        console.error("Error fetching pickup data:", error);
      }
    };

    fetchData();
  }, []);

  const getUniqueOrganizations = () => {
    const orgSet = new Set();

    // From laptops → Donor Company Name
    laptopData.forEach(laptop => {
      const donorCompany = laptop["Donor Company Name"];
      if (donorCompany && donorCompany.trim()) {
        orgSet.add(donorCompany.trim());
      }
    });

    // From NGOs → Donor
    ngoPartner.forEach(partner => {
      if (partner.Doner && partner.Doner.trim()) {
        orgSet.add(partner.Doner.trim());
      }
    });

    // From pickups → Donor Company
    pickups.forEach(pickup => {
      const donor = pickup["Donor Company"];
      if (donor && donor.trim()) {
        orgSet.add(donor.trim());
      }
    });

    return Array.from(orgSet).sort();
  };


  // Filter functions
  const getFilteredLaptopData = () => {
    if (!selectedOrganization) return laptopData;
    return laptopData.filter(laptop =>
      String(laptop["Donor Company Name"]).trim().toLowerCase() ===
      selectedOrganization.toLowerCase()
    );
  };


  const getFilteredNgoPartners = () => {
    if (!selectedOrganization) return ngoPartner;
    return ngoPartner.filter(partner =>
      String(partner.Doner).trim().toLowerCase() ===
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

  const getFilteredPreData = () => {
    if (!selectedOrganization) return preData;

    return preData.filter(
      item =>
        String(item.Doner || "").trim().toLowerCase() ===
        selectedOrganization.trim().toLowerCase()
    );
  };

  // Apply filters to get filtered data
  const filteredLaptopData = getFilteredLaptopData();
  const filteredNgoPartners = getFilteredNgoPartners();
  const filteredPickups = getFilteredPickups();

  // Mapping through Sheets

  ngoData.map((ngo) => {


    const laptops = laptopData.filter((row) => {
      const allocatedTo = String(row["Allocated To"]).trim().toLowerCase();
      const ngoName = String(ngo.organizationName).trim().toLowerCase();
      const match = allocatedTo === ngoName;
      if (match) {
      }
      return match;
    }).length;
    const beneficiariesCount = userData.filter(
      (user) => String(user.Ngo || user.ngoId) === String(ngo.ID)
    ).length;

    return {
      ...ngo,
      laptopCount: laptops,
      beneficiaryCount: beneficiariesCount,
    };
  });


  // Total Counting
  const totalLaptops = filteredLaptopData.length;

  const refurbishedCount = filteredLaptopData.reduce((acc, item) => {
    const status = (item.Status || "").toLowerCase();

    if (status.includes("refurbished")) {
      return acc + 1;
    }

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

  const distributedCount = filteredLaptopData.filter(
    (laptop) => laptop.Status === "Distributed"
  ).length;

  const totalProcessed = refurbishedCount + distributedCount;
  const successRate =
    totalLaptops > 0 ? ((refurbishedCount / totalLaptops) * 100).toFixed(2) : 0;
  const ngosServedCount = filteredNgoPartners.filter(
    (partner) => partner.laptops > 0
  ).length;


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
      // console.error("Invalid date format:", dateString);
      return null;
    }
  }

  const last24HoursData = filteredLaptopData.filter(laptop => {
    const lastUpdatedStr = laptop["Last Updated On"];
    if (!lastUpdatedStr) return false;
    const lastUpdated = parseDate(lastUpdatedStr);
    if (!lastUpdated) return false;
    const hoursAgo = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60);
    return hoursAgo <= 24;
  });
  // console.log("Last 24 hours data:", last24HoursData);
  const last24HoursPickups = filteredPickups.filter(p => {
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

        // ✅ Special case: if status is "In Transit", use "Date Committed"
        let lastUpdated;
        if (status === "In Transit") {
          lastUpdated = parseDate(laptop["Date Committed"]);
        } else {
          lastUpdated = parseDate(laptop["Last Updated On"]);
        }
        if (!lastUpdated) return;

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

    if (activity.status === "In Transit") {
      return `${activity.count} new laptop${activity.count > 1 ? "s" : ""} added with status In Transit`;
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
  const uniqueOrganizations = getUniqueOrganizations();

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

  const allProcessingTimes = filteredLaptopData
    .map(l => {
      const c = parseDateUniversal(l["Date Committed"]);
      const d = parseDateUniversal(l["Last Delivery Date"]);
      return (c && d && d >= c) ? (d - c) / 86400000 : null;
    })
    .filter(Boolean);

  const avgProcessingTime = allProcessingTimes.length
    ? allProcessingTimes.reduce((a, b) => a + b, 0) / allProcessingTimes.length
    : 0;

  const avgProcessingTimeRounded = Math.round(avgProcessingTime); // 104 days

const getActiveUsageCount = () => {
  const now = new Date();
  const fifteenDaysAgo = new Date();
  fifteenDaysAgo.setDate(now.getDate() - 15);

  return filteredLaptopData.filter(laptop => {
    if (!laptop.Date) return false;

    const laptopDate = new Date(laptop.Date);
    if (isNaN(laptopDate)) return false;

    return laptopDate >= fifteenDaysAgo && laptopDate <= now;
  }).length;
};

  return (

    <>
      <OverviewHeader
        uniqueOrganizations={uniqueOrganizations}
        onOrganizationChange={setSelectedOrganization}
      />

      <Divider sx={{ mb: 3, width: "100%" }} />

      <Box sx={{ p: 3, pb: 10 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold", color: "#333" }}>
            CSR Impact Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: "#666", fontSize: 16 }}>
            {selectedOrganization
              ? `Impact tracking for ${selectedOrganization}`
              : "Comprehensive tracking of laptop refurbishment and distribution impact"}
          </Typography>
        </Box>

        {/* Top Metrics Row */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Total Laptops Collected"
              value={totalLaptops}
              // subtitle="Lifetime donations from corporates"
              subtitle={selectedOrganization ? `From ${selectedOrganization}` : "Lifetime donations from corporates"}
              // growth="+15.2% from last month"
              icon={Package}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Successfully Refurbished"
              value={refurbishedCount}
              subtitle={`${successRate}% success rate`}
              // growth="+8.1% from last month"
              icon={CheckCircle}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>

            <MetricCard
              title="Active Beneficiaries"
              value={getFilteredPreData().reduce(
                (sum, item) => sum + (parseInt(item["Number of student"], 10) || 0),
                0
              )}
              subtitle="Currently using laptops"
              // growth="+23.6% from last month"
              icon={Users}
            />

          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="NGO Partners"
              value={selectedOrganization ? filteredNgoPartners.length : approvedCount}
              subtitle={selectedOrganization ? "Matching organizations" : "Organizations served"}
              // growth="+12% from last month"
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
                {selectedOrganization && (
                  <Chip
                    label={selectedOrganization}
                    size="small"
                    variant="outlined"
                    sx={{ ml: 2 }}
                  />
                )}
              </Typography>
              <Typography variant="body1" sx={{ fontSize: 14, color: '#666' }}>
                Real-time tracking of laptops through the refurbishment process
              </Typography>
            </Box>

            {/* Pipeline Steps */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {[

                {
                  icon: Package, title: "Pickup Requested", subtitle: "Corporate request submitted", count: selectedOrganization ? `${filteredPickups.filter(p => p.Status === "Pending")
                    .reduce((total, pickup) => total + (parseInt(pickup["Number of Laptops"]) || 0), 0)} laptops`
                    : `${pickups
                      .filter(p => p.Status === "Pending")
                      .reduce((total, pickup) => total + (parseInt(pickup["Number of Laptops"]) || 0), 0)}  laptops`, bgColor: "#e3f2fd", iconColor: "#1976d2"
                },
                // { icon: CheckCircle, title: "Assessment", subtitle: "Condition evaluation", count: "32 laptops", bgColor: "#fff3e0", iconColor: "#f57c00" },
                { icon: Settings, title: "Refurbishment", subtitle: "Repair & software setup", count: `${refurbishedCount} laptops`, bgColor: "#e8f5e8", iconColor: "#388e3c" },
                { icon: Truck, title: "Distribution", subtitle: "Delivered to NGOs", count: `${distributedCount} laptops`, bgColor: "#f3e5f5", iconColor: "#7b1fa2" },
                { icon: UserCheck, title: "Active Usage", subtitle: "In use by beneficiaries", count: `${getActiveUsageCount()} laptops`, bgColor: "#ffebee", iconColor: "#d32f2f" }
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
                  <SummaryMetric label="Avg. Processing Time" value={"0 days"} />
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
                    {selectedOrganization && (
                      <Chip
                        label={`Filtered: ${filteredNgoPartners.length}`}
                        size="small"
                        variant="outlined"
                        sx={{ ml: 2 }}
                      />
                    )}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  {selectedOrganization
                    ? `Organizations matching ${selectedOrganization}`
                    : "Organizations receiving laptop distributions"
                  }
                </Typography>
                {filteredNgoPartners.length === 0 ? (
                  <Box sx={{
                    textAlign: 'center',
                    py: 4,
                    color: '#666'
                  }}>
                    <Building size={48} color="#ccc" style={{ marginBottom: 16 }} />
                    <Typography variant="body2">
                      No NGO partners found for the selected organization
                    </Typography>
                  </Box>
                ) : (
                  <>
                    {(showAll ? filteredNgoPartners : filteredNgoPartners.slice(0, 3)).map(
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

                          {index < filteredNgoPartners.length - 1 && <Divider sx={{ mt: 2 }} />}
                        </Box>
                      )
                    )}

                    {filteredNgoPartners.length > 3 && (
                      <Button
                        size="small"
                        sx={{ mt: 2 }}
                        color="primary"
                        onClick={() => setShowAll(!showAll)}
                      >
                        {showAll ? "Hide NGO partners ↑" : "View all NGO partners →"}
                      </Button>
                    )}
                  </>
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