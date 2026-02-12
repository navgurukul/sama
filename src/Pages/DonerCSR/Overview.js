import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import RecentActivity from './RecentActivity';
import TableView from './TableView';
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
  Table,
  TextField,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  CircularProgress,
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
  ArrowLeft
} from 'lucide-react';
import OverviewHeader from "./OverviewHeader";

const Overview = () => {
  const { donorName } = useParams();
  const navigate = useNavigate();
  const [pickups, setPickups] = useState([]);
  const [totalLaptopss, setTotalLaptopss] = useState(0);
  const [selectedOrganization, setSelectedOrganization] = useState(donorName || null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [appliedStartDate, setAppliedStartDate] = useState('');
  const [appliedEndDate, setAppliedEndDate] = useState('');
  const [averageDays, setAverageDays] = useState("null");
  const theme = useTheme();
  const [laptopData, setLaptopData] = useState([]);
  const [ngoData, setNgoData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Date handling functions
  const parseDateUniversal = (dateString) => {
    if (!dateString) return null;
    dateString = String(dateString).trim();

    // Try built-in parse
    const builtIn = new Date(dateString);
    if (!isNaN(builtIn)) return builtIn;

    // Try DD-MM-YYYY format
    const [day, month, year] = dateString.split(/[-/]/).map(num => parseInt(num, 10));
    if (day && month && year) {
      const date = new Date(year, month - 1, day);
      if (!isNaN(date.getTime())) return date;
    }

    return null;
  };

  const isWithinDateRange = (dateStr) => {
    if (!appliedStartDate || !appliedEndDate || !dateStr) return true;
    const date = formatDateForDisplay(dateStr);
    if (!date) return true;
    
    const start = new Date(appliedStartDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(appliedEndDate);
    end.setHours(23, 59, 59, 999);
    
    return date >= start && date <= end;
  };
  
  const handleDateFilter = () => {
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
  };

  const clearDateFilter = () => {
    setStartDate('');
    setEndDate('');
    setAppliedStartDate('');
    setAppliedEndDate('');
  };
  const [approvedCount, setApprovedCount] = useState(0);
  const [ngoPartner, setNgoPartner] = useState([]);
  const [userData, setUserData] = useState([]);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [preData, setPreData] = useState([]);
  const [expandedCard, setExpandedCard] = useState(null);
  const [activeType, setActiveType] = useState(null);
  const [page, setPage] = useState(0);
  const [showNgoDetails, setShowNgoDetails] = useState(false);
  const rowsPerPage = 5;
  const handleToggle = (id, type) => {
    if (expandedCard === id && activeType === type) {
      setExpandedCard(null);
      setActiveType(null);
    } else {
      setExpandedCard(id);
      setActiveType(type);
      setPage(0);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleMetricClick = (metricType) => {
    if (selectedOrganization) {
      navigate(`/donorcsr/${selectedOrganization}/table-view?metric=${metricType}`);
    } else {
      navigate(`/donorcsr/table-view?metric=${metricType}`);
    }
  };
  const handlePipelineStepClick = (stepType) => {
    if (selectedOrganization) {
      navigate(`/donorcsr/${selectedOrganization}/table-view?metric=${stepType}`);
    } else {
      navigate(`/donorcsr/table-view?metric=${stepType}`);
    }
  };

  const NgoDetails = JSON.parse(localStorage.getItem("_AuthSama_")) || [];
  const userRole = NgoDetails?.[0]?.role?.[0];
  const donorOrgName = NgoDetails?.[0]?.Doner || null;
  const isAdmin = userRole === "admin";
  const isDoner = userRole === "doner";


  useEffect(() => {
    if (isDoner) {
      navigate("/donorcsr/overview", { replace: true });
    }
  }, [isDoner, navigate]);


  // Set selected organization for donor from localStorage
  useEffect(() => {
    if (isDoner && donorOrgName) {
      setSelectedOrganization(donorOrgName);
    } else if (donorName) {
      setSelectedOrganization(donorName);
    }
  }, [donorName, donorOrgName, isDoner]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
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
          const laptopDetails = filteredLaptops;


          const beneficiariesFromUserData = userJson.filter(
            (user) => String(user.Ngo).trim() === String(ngo.Id).trim()
          ).length;

          const beneficiariesFromPreData = preJson
            .filter((preItem) => String(preItem.NgoId).trim() === String(ngo.Id).trim())
            .reduce((total, preItem) => total + (parseInt(preItem["Number of student"], 10) || 0), 0);

          const totalBeneficiaries = beneficiariesFromUserData + beneficiariesFromPreData;

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
            id: ngo.Id,
            name: ngo.organizationName,
            status: ngo.Status,
            location: ngo.location || "Unknown",
            laptops: laptopsAllocated,
            laptopDetails: laptopDetails,
            beneficiaries: totalBeneficiaries,
            beneficiariesFromUserData,
            beneficiariesFromPreData,
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
            Doner: ngo.Doner || ngo.Donor || null,
            Id: ngo.Id,
          };
        });

        setNgoPartner(partners);
        setLaptopData(laptopJson || []);
        setUserData(userJson || []);
        setApprovedCount(approved.length);

      } catch (err) {
        console.error("Error fetching overview data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);


  // average days count
  useEffect(() => {
    fetch(`${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getAverageDays`)
      .then((res) => res.json())
      .then((data) => {
        setAverageDays(data.averageDays);
        // setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        // setLoading(false);
      });
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
    if (!laptopData) return [];
    
    return laptopData.filter(laptop => {
      // Organization filter
      const orgMatch = !selectedOrganization || 
        (laptop["Donor Company Name"] || "").trim().toLowerCase() === selectedOrganization.trim().toLowerCase();
      
      // Date filter based on Date Committed
      const dateMatch = isWithinDateRange(laptop["Date Committed"]);
      
      return orgMatch && dateMatch;
    });
  };

  const getFilteredPickups = () => {
    if (!pickups) return [];
    
    return pickups.filter(pickup => {
      // Organization filter
      const orgMatch = !selectedOrganization || 
        (pickup["Donor Company"] || "").trim().toLowerCase() === selectedOrganization.trim().toLowerCase();
      
      // Date filter based on Current Date & Time
      const dateMatch = isWithinDateRange(pickup["Current Date & Time"]);
      
      return orgMatch && dateMatch;
    });
  };


  const getFilteredNgoPartners = () => {
    if (!selectedOrganization) return ngoPartner;

    const selOrg = selectedOrganization.trim().toLowerCase();

    return ngoPartner.filter(partner => {
      // Check if NGO's donor field matches
      const donorName = (partner.Doner || partner.Donor || "").trim().toLowerCase();
      if (donorName === selOrg) return true;

      // Also check if any laptops allocated to this NGO have matching donor company name
      if (partner.laptopDetails && partner.laptopDetails.length > 0) {
        const hasMatchingLaptop = partner.laptopDetails.some(laptop => {
          const laptopDonor = String(laptop["Donor Company Name"] || "").trim().toLowerCase();
          return laptopDonor === selOrg;
        });
        return hasMatchingLaptop;
      }

      return false;
    });
  };


  const getFilteredPreData = () => {
    if (!selectedOrganization) return preData;

    return preData.filter(
      item =>
        String(item.Doner || "").trim().toLowerCase() ===
        selectedOrganization.trim().toLowerCase()
    );
  };

  const getFilteredUserData = () => {
    if (!selectedOrganization) return userData;

    const matchingNgos = ngoPartner.filter(partner =>
      String(partner.Doner).trim().toLowerCase() ===
      selectedOrganization.toLowerCase()
    );

    if (matchingNgos.length === 0) return [];

    return userData.filter(user =>
      matchingNgos.some(ngo => String(user.Ngo).trim() === String(ngo.Id).trim())
    );
  };

  // Apply filters to get filtered data
  const filteredLaptopData = getFilteredLaptopData();
  const filteredNgoPartners = getFilteredNgoPartners();
  const filteredPickups = getFilteredPickups();
  const filteredUserData = getFilteredUserData();



  // Mapping through Sheets

  // filteredLaptopData.map((laptop, i) => {
  //   console.log(`Status [${i}]:`, laptop?.Status);
  //   return laptop;
  // });

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
  
  const statusesAtOrAfterReceived = new Set([
    "laptop received",
    "not working",
    "refurbishment started",
    "laptop refurbished",
    "to be dispatch",
    "allocated",
    "distributed",
  ]);

  const receivedCount = filteredLaptopData.reduce((acc, item) => {
    const status = (item.Status || "").trim().toLowerCase();
    if (statusesAtOrAfterReceived.has(status)) {
      return acc + 1;
    }
    return acc;
  }, 0);

  const refurbishedCount = filteredLaptopData.reduce((acc, item) => {
    const status = (item.Status || "").toLowerCase();
    // console.log("Laptop Status:", status);

    if (status.includes("laptop refurbished")) {
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

  // NEW: count for ONLY "Laptop Received" (exact match, case-insensitive)
  const onlyLaptopReceivedCount = filteredLaptopData.reduce((acc, item) => {
    const status = (item.Status || "").trim().toLowerCase();
    return status === "laptop received" ? acc + 1 : acc;
  }, 0);

  const successRate =
    totalLaptops > 0 ? ((refurbishedCount / totalLaptops) * 100).toFixed(2) : 0;
  const ngosServedCount = filteredNgoPartners.filter((partner) => {
    // If no organization is selected, count NGOs with any laptops
    if (!selectedOrganization) {
      return partner.laptops > 0;
    }
    // If organization is selected, count only NGOs with laptops from that donor
    if (partner.laptopDetails && partner.laptopDetails.length > 0) {
      const selOrg = selectedOrganization.trim().toLowerCase();
      const matchingLaptops = partner.laptopDetails.filter(l =>
        String(l["Donor Company Name"] || "").trim().toLowerCase() === selOrg
      );
      return matchingLaptops.length > 0;
    }
    return false;
  }).length;


  
  
  const MetricCard = ({ title, value, subtitle, growth, icon: Icon, onClick }) => (
    <Card sx={{
      height: '100%',
      minHeight: 140,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0',
      cursor: 'pointer',
      '&:hover': {
        boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
      }
    }} onClick={onClick}>
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

  const PipelineStep = ({ icon: Icon, title, subtitle, count, backgroundColor, iconColor, onClick }) => (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      cursor: 'pointer',
      '&:hover': {
        transform: 'translateY(-2px)',
        transition: 'transform 0.2s ease-in-out'
      }
    }} onClick={onClick}>
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

  // Helper function to format Working status
  // "Working" → "Yes", "Not Working" → "No", blank/empty/null → "Yes" (default to Working)
  const formatWorkingStatus = (workingValue) => {
    // Check if value is blank, null, undefined, or empty string - default to "Yes" (Working)
    if (!workingValue || (typeof workingValue === 'string' && workingValue.trim() === '')) {
      return "Yes";
    }
    
    const status = String(workingValue).trim().toLowerCase();
    
    // If status is "working" → return "Yes"
    if (status === "working") {
      return "Yes";
    }
    
    // If status is "not working" → return "No"
    if (status === "not working") {
      return "No";
    }
    
    // For any other value, default to "Yes" (Working)
    return "Yes";
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
    return hoursAgo <= 24 ;
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

  function formatDateForDisplay(dateStr) {
    if (!dateStr) return null;
    dateStr = String(dateStr).trim();
    
    // 1. Built-in parse
    const builtIn = new Date(dateStr);
    if (!isNaN(builtIn)) {
      return builtIn;
    }

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

  // const allProcessingTimes = filteredLaptopData
  //   .map(l => {
  //     const c = formatDateForDisplay(l["Date Committed"]);
  //     const d = formatDateForDisplay(l["Last Delivery Date"]);
  //     return (c && d && d >= c) ? (d - c) / 86400000 : null;
  //   })
  //   .filter(Boolean);

  // const avgProcessingTime = allProcessingTimes.length
  //   ? allProcessingTimes.reduce((a, b) => a + b, 0) / allProcessingTimes.length
  //   : 0;

  // const avgProcessingTimeRounded = Math.round(avgProcessingTime);
  
  // const [loading, setLoading] = useState(true);


  const handleActivityClick = (activity) => {
    const metricType = activity.status.toLowerCase().replace(/\s+/g, '');

    if (selectedOrganization) {
      navigate(`/donorcsr/${selectedOrganization}/table-view?metric=${metricType}&activity=${encodeURIComponent(JSON.stringify(activity))}`);
    } else {
      navigate(`/donorcsr/table-view?metric=${metricType}&activity=${encodeURIComponent(JSON.stringify(activity))}`);
    }
  };

  return (

    <>
      {isLoading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      ) : (
      <>
      <OverviewHeader
        uniqueOrganizations={uniqueOrganizations}
        onOrganizationChange={setSelectedOrganization}
        selectedOrganization={selectedOrganization} // Add this
        isAdmin={isAdmin} // Add this
        isDoner={isDoner} // Add this
      />

      <Divider sx={{ mb: 3, width: "100%" }} />

      <Box sx={{ p: 3, pb: 10 }}>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: "bold", color: "#333" }}>
                CSR Impact Dashboard
              </Typography>
              <Typography variant="body1" sx={{ color: "#666", fontSize: 16 }}>
                {selectedOrganization
                  ? `Impact tracking for ${selectedOrganization}`
                  : "Comprehensive tracking of laptop refurbishment and distribution impact"}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
              <TextField
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
              <Button
                variant="contained"
                onClick={handleDateFilter}
                disabled={!startDate || !endDate}
                size="small"
              >
                Apply Filter
              </Button>
              {(appliedStartDate || appliedEndDate) && (
                <Button
                  variant="outlined"
                  onClick={clearDateFilter}
                  size="small"
                >
                  Clear Filter
                </Button>
              )}
            </Box>
          </Box>
        </Box>

        {/* Top Metrics Row */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Total Laptops Commited"
              value={totalLaptops.toLocaleString('en-IN')}
              // subtitle="Lifetime donations from corporates"
              subtitle={selectedOrganization ? `From ${selectedOrganization}` : "Lifetime donations from corporates"}
              // growth="+15.2% from last month"
              icon={Package}
              onClick={() => handleMetricClick("totalLaptops")}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Successfully Refurbished"
              value={refurbishedCount.toLocaleString('en-IN')} // need to change this.
              subtitle={`${successRate}% success rate`}
              // growth="+8.1% from last month"
              icon={CheckCircle}
              onClick={() => handleMetricClick("successfullyRefurbished")}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>

            <MetricCard
              title="Active Beneficiaries"
              value={(() => {
                // 1) Count from preData (filtered)
                const preCount = getFilteredPreData().reduce(
                  (sum, item) => sum + (parseInt(item["Number of student"], 10) || 0),
                  0
                );

                // 2) Count from userData (filtered using ngoPartner data like the old code)
                const userCount = filteredUserData.length;

                const total = preCount + userCount;
                return total.toLocaleString('en-IN');
              })()}
              subtitle="Currently using laptops"
              icon={Users}
              onClick={() => handleMetricClick("activeBeneficiaries")}
            />

          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {/* NGO Partners card commented out */}
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
                  icon: Package,
                  title: "Pickup Requested",
                  subtitle: "Initial request submitted",
                  count: `${filteredLaptopData.filter(l => l.Status === "Pickup Requested").length} laptops`,
                  // count: selectedOrganization 
                  //   ? `${filteredPickups.filter(p => p.Status === "Pending")
                  //       .reduce((total, pickup) => total + (parseInt(pickup["Number of Laptops"]) || 0), 0)} laptops`
                  //   : `${pickups.filter(p => p.Status === "Pending")
                  //       .reduce((total, pickup) => total + (parseInt(pickup["Number of Laptops"]) || 0), 0)} laptops`,
                  bgColor: "#e3f2fd",
                  iconColor: "#1976d2",
                  stepType: "pickupRequests"
                },
                {
                  icon: Truck,
                  title: "In Transit",
                  subtitle: "Pickup in progress",
                  count: `${filteredLaptopData.filter(l => l.Status === "In Transit").length} laptops`,
                  bgColor: "#fff3e0",
                  iconColor: "#f57c00",
                  stepType: "inTransit"
                },
                {
                  icon: Laptop,
                  title: "Laptop Received", 
                  subtitle: "Initial check-in",
                  count: `${receivedCount} laptops`,
                  // count: `${receivedCount} laptops`,
                  bgColor: "#e8f5e8",
                  iconColor: "#388e3c",
                  stepType: "received"
                },
                // NEW: Only Laptop Received - shows only items where Status === "Laptop Received"
                {
                  icon: Laptop,
                  title: "Ready To Be Processed",
                  subtitle: "Refurbishment will begin shortly.",
                  count: `${onlyLaptopReceivedCount} laptops`,
                  bgColor: "#e8f5e8",
                  iconColor: "#388e3c",
                  stepType: "onlyLaptopReceived"
                },
                {
                  icon: X,
                  title: "Not Working",
                  subtitle: "Failed initial health check",
                  count: `${filteredLaptopData.filter(l => l.Status === "Not Working").length} laptops`,
                  bgColor: "#ffebee",
                  iconColor: "#d32f2f",
                  stepType: "notWorking"
                },
                {
                  icon: Settings,
                  title: "Refurbishment Started",
                  subtitle: "Under processing",
                  count: `${filteredLaptopData.filter(l => l.Status === "Refurbishment Started").length} laptops`,
                  bgColor: "#e0f7fa",
                  iconColor: "#0097a7",
                  stepType: "refurbishmentStarted"
                },
                {
                  icon: CheckCircle,
                  title: "Laptop Refurbished",
                  subtitle: "Repair completed",
                  count: `${filteredLaptopData.filter(l => l.Status === "Laptop Refurbished").length} laptops`,
                  bgColor: "#f3e5f5",
                  iconColor: "#7b1fa2",
                  stepType: "refurbished"
                },
                {
                  icon: Truck,
                  title: "To Be Dispatch",
                  subtitle: "Ready for delivery",
                  count: `${filteredLaptopData.filter(l => l.Status === "To Be Dispatch").length} laptops`,
                  bgColor: "#fce4ec",
                  iconColor: "#c2185b",
                  stepType: "toBeDispatch"
                },
                {
                  icon: Building,
                  title: "Allocated",
                  subtitle: "Assigned to NGO",
                  count: `${filteredLaptopData.filter(l => l.Status === "Allocated").length} laptops`,
                  bgColor: "#f1f8e9",
                  iconColor: "#558b2f",
                  stepType: "allocated"
                },
                {
                  icon: UserCheck,
                  title: "Distributed",
                  subtitle: "Delivered to NGO",
                  count: `${filteredLaptopData.filter(l => l.Status === "Distributed").length} laptops`,
                  bgColor: "#e8f5e9",
                  iconColor: "#2e7d32",
                  stepType: "distributed"
                },
                {
                  icon: UserCheck,
                  title: "Active Usage",
                  subtitle: "In use by beneficiaries",
                  count: `${filteredLaptopData.filter(l => {
                    const d = formatDateForDisplay(l["Date"]);
                    if (!d) return false;
                    const diffDays = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
                    return diffDays <= 15 && l.Status === "Distributed";
                  }).length} laptops`,
                  bgColor: "#ffebee",
                  iconColor: "#d32f2f",
                  stepType: "activeUsage"
                }
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
                    onClick={() => handlePipelineStepClick(step.stepType)}
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
                  <Box
                    sx={{
                      textAlign: 'center',
                      cursor: 'pointer',
                    
                    }}
                    onClick={() => handlePipelineStepClick("refurbished")}
                  >
                    <SummaryMetric label="Total Processed" value={refurbishedCount} />
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box
                    sx={{
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': {
                        '& .metric-value': {
                          color: 'primary.main',
                        }
                      }
                    }}
                    onClick={() => {
                      if (selectedOrganization) {
                        navigate(`/donorcsr/${selectedOrganization}/table-view?metric=successfullyRefurbished&total=${totalLaptops}&processed=${refurbishedCount}`);
                      } else {
                        navigate(`/donorcsr/table-view?metric=successfullyRefurbished&total=${totalLaptops}&processed=${refurbishedCount}`);
                      }
                    }}
                  >
                    <Typography variant="body2" sx={{ fontSize: 12, color: '#666', mb: 0.5 }}>
                      Success Rate
                    </Typography>
                    <Typography 
                      variant="h6" 
                      className="metric-value"
                      sx={{ 
                        fontSize: 20, 
                        fontWeight: 600, 
                        color: '#4caf50',
                        transition: 'color 0.2s ease'
                      }}
                    >
                      {`${successRate}%`}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <SummaryMetric label="Avg. Processing Time" value={`${averageDays} days`} />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box
                    sx={{
                      textAlign: 'center',
                      cursor: 'pointer',
      
                    }}
                    onClick={() => handleMetricClick("ngosServed")}
                  >
                    <SummaryMetric label="NGOs Served" value={ngosServedCount} />
                    </Box>
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
              onActivityClick={handleActivityClick}
            />
          </Grid>

          {/* NGO Partners Section */}
          <Grid item xs={12} md={6}>
            <Card 
              variant="outlined" 
              sx={{ 
                borderRadius: 2,
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                }
              }}
              onClick={() => setShowNgoDetails(!showNgoDetails)}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <Building size={20} style={{ marginRight: 8, color: "#555" }} />
                  <Typography variant="h6" fontWeight={600}>
                    NGO Partners
                    <Chip
                      label={`${ngosServedCount} NGOs`}
                      size="small"
                      variant="outlined"
                      sx={{ ml: 2 }}
                    />
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  {selectedOrganization
                    ? `Organizations matching ${selectedOrganization}`
                    : "Organizations receiving laptop distributions"
                  }
                </Typography>
                                  {showNgoDetails ? (
                    filteredNgoPartners.filter(partner => partner.laptops > 0).map(
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
                                <Box display="flex" alignItems="center" gap={0.5}
                                  sx={{
                                    cursor: "pointer",
                                    color: expandedCard === partner.id && activeType === "laptops" ? "primary.main" : "inherit"
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggle(partner.id, "laptops");
                                  }}
                                >
                                  <Laptop size={16} color="#555" />
                                  <Typography
                                    variant="subtitle1"
                                    fontWeight={600}
                                    color={expandedCard === partner.id && activeType === "laptops" ? "primary.main" : "primary"}
                                  >
                                   {
                                        // show only laptops whose Donor Company Name matches selectedOrganization (case-insensitive)
                                        selectedOrganization
                                          ? (partner.laptopDetails || []).filter(l =>
                                              String(l["Donor Company Name"] || "").trim().toLowerCase() ===
                                              selectedOrganization.trim().toLowerCase()
                                            ).length
                                          : partner.laptops
                                      }
                                    {/* {partner.laptops} */}
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
                          {/* Expanded Laptop Data Table */}
                          {expandedCard === partner.id && activeType === "laptops" && (
                            <Box mt={3} onClick={(e) => e.stopPropagation()}>
                              <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem', fontWeight: 600 }}>
                                {partner.name} - Laptop Data
                              </Typography>

                              {(() => {
                                // apply selectedOrganization filter to the partner's laptopDetails when a donor is selected
                                const displayedLaptopDetails = selectedOrganization
                                  ? (partner.laptopDetails || []).filter(l =>
                                      String(l["Donor Company Name"] || "").trim().toLowerCase() ===
                                      selectedOrganization.trim().toLowerCase()
                                    )
                                  : (partner.laptopDetails || []);

                                return (
                                  <>
                                    <Table size="small" sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                      <TableHead>
                                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                          <TableCell sx={{ fontWeight: "bold" }}>Laptop ID</TableCell>
                                          <TableCell sx={{ fontWeight: "bold" }}>Manufacturer Model</TableCell>
                                          <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                                          <TableCell sx={{ fontWeight: "bold" }}>Working</TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {displayedLaptopDetails && displayedLaptopDetails.length > 0 ? (
                                          displayedLaptopDetails
                                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                            .map((laptop, laptopIndex) => (
                                              <TableRow key={laptopIndex} hover>
                                                <TableCell>{laptop.ID || 'N/A'}</TableCell>
                                                <TableCell>{laptop["Manufacturer Model"] || 'N/A'}</TableCell>
                                                <TableCell>{laptop.Status || 'Unknown'}</TableCell>
                                                <TableCell>{formatWorkingStatus(laptop.Working)}</TableCell>
                                              </TableRow>
                                            ))
                                        ) : (
                                          <TableRow>
                                            <TableCell colSpan={4} align="center" sx={{ py: 2 }}>
                                              <Typography variant="body2" color="text.secondary">
                                                No laptop data available
                                              </Typography>
                                            </TableCell>
                                          </TableRow>
                                        )}
                                      </TableBody>
                                    </Table>

                                    {displayedLaptopDetails && displayedLaptopDetails.length > rowsPerPage && (
                                      <TablePagination
                                        component="div"
                                        count={displayedLaptopDetails.length}
                                        page={page}
                                        onPageChange={handleChangePage}
                                        rowsPerPage={rowsPerPage}
                                        rowsPerPageOptions={[10]}
                                        sx={{ border: 'none' }}
                                      />
                                    )}
                                  </>
                                );
                              })()}
                            </Box>
                          )}
                          
                          {/* {expandedCard === partner.id && activeType === "laptops" && (
                            <Box mt={3} onClick={(e) => e.stopPropagation()}>
                              <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem', fontWeight: 600 }}>
                                {partner.name} - Laptop Data
                              </Typography>

                              <Table size="small" sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                <TableHead>
                                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                    <TableCell sx={{ fontWeight: "bold" }}>Laptop ID</TableCell>
                                    <TableCell sx={{ fontWeight: "bold" }}>Manufacturer Model</TableCell>
                                    <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: "bold" }}>Working</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {partner.laptopDetails && partner.laptopDetails.length > 0 ? (
                                    partner.laptopDetails
                                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                      .map((laptop, laptopIndex) => (
                                        <TableRow key={laptopIndex} hover>
                                          <TableCell>{laptop.ID || 'N/A'}</TableCell>
                                          <TableCell>{laptop["Manufacturer Model"] || 'N/A'}</TableCell>
                                          <TableCell>{laptop.Status || 'Unknown'}</TableCell>
                                          <TableCell>{formatWorkingStatus(laptop.Working)}</TableCell>
                                        </TableRow>
                                      ))
                                  ) : (
                                    <TableRow>
                                      <TableCell colSpan={4} align="center" sx={{ py: 2 }}>
                                        <Typography variant="body2" color="text.secondary">
                                          No laptop data available
                                        </Typography>
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </TableBody>
                              </Table>

                              {partner.laptopDetails && partner.laptopDetails.length > rowsPerPage && (
                                <TablePagination
                                  component="div"
                                  count={partner.laptopDetails.length}
                                  page={page}
                                  onPageChange={handleChangePage}
                                  rowsPerPage={rowsPerPage}
                                  rowsPerPageOptions={[10]}
                                  sx={{ border: 'none' }}
                                />
                              )}
                            </Box>
                          )} */}

                          {index < filteredNgoPartners.length - 1 && <Divider sx={{ mt: 2 }} />}
                        </Box>
                      )
                    )
                  ) : (
                  <Box 
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      py: 2
                    }}
                  >
                    <Typography variant="body2" color="primary" sx={{ display: 'flex', alignItems: 'center' }}>
                      Click to view NGO details
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      </>
      )}
    </>
  );
};

export default Overview;