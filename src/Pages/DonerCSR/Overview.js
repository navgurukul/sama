/* eslint-disable no-unused-vars */
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
  ArrowLeft,
  Download
} from 'lucide-react';
import OverviewHeader from "./OverviewHeader";
import AfeTracker from "./AfeTracker";

const Overview = () => {
  const { donorName } = useParams();
  const navigate = useNavigate();
  const [pickups, setPickups] = useState([]);
  const [totalLaptopss, setTotalLaptopss] = useState(0);

  const NgoDetails = JSON.parse(localStorage.getItem("_AuthSama_")) || [];
  const roles = JSON.parse(localStorage.getItem("role") || "[]");
  const fallbackRole = NgoDetails?.[0]?.role || "";
  const donorOrgName = NgoDetails?.[0]?.Doner || null;
  const isAdmin = roles.includes("admin") || fallbackRole.includes("admin");
  const isDoner = roles.includes("doner") || fallbackRole.includes("doner");
  const isAmazonOnly = (name) => Boolean(name && name.toLowerCase().includes("amazon") && !name.toLowerCase().includes("- ng") && !name.toLowerCase().includes("-ng"));
  
  // Note: Since donorName comes from URL and donorOrgName from auth, we check both.
  const tempOrg = donorName || donorOrgName;
  const isAfeApprover = roles.includes("afe_approver") || fallbackRole.includes("afe_approver") || (isAdmin && isAmazonOnly(tempOrg)) || (isDoner && isAmazonOnly(donorOrgName));

  const initialOrg = donorName || ((isDoner || isAfeApprover) ? donorOrgName : null);
  const [selectedOrganization, setSelectedOrganization] = useState(initialOrg);
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
  const [uniqueOrgs, setUniqueOrgs] = useState([]);
  const [ngoPartner, setNgoPartner] = useState([]);
  const [userData, setUserData] = useState([]);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [preData, setPreData] = useState([]);
  const [expandedCard, setExpandedCard] = useState(null);
  const [activeType, setActiveType] = useState(null);
  const [page, setPage] = useState(0);
  const [showNgoDetails, setShowNgoDetails] = useState(false);
  const [ngoSearchTerm, setNgoSearchTerm] = useState("");
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

  const handleDownloadCSV = () => {
    if (selectedOrganization) {
      navigate(`/donorcsr/${selectedOrganization}/table-view?metric=learningAnalytics`);
    } else {
      navigate('/donorcsr/table-view?metric=learningAnalytics');
    }
  };

  // Auth variables (NgoDetails, roles, etc.) have been moved to the top of the component
  // to properly initialize selectedOrganization and avoid race conditions.

  useEffect(() => {
    if (isDoner) {
      navigate("/donorcsr/overview", { replace: true });
    }
  }, [isDoner, navigate]);


  // Set selected organization for donor from localStorage
  useEffect(() => {
    if ((isDoner || roles.includes("afe_approver") || fallbackRole.includes("afe_approver")) && donorOrgName) {
      setSelectedOrganization(donorOrgName);
    } else if (donorName) {
      setSelectedOrganization(donorName);
    }
  }, [donorName, donorOrgName, isDoner, roles, fallbackRole]);

  const [stats, setStats] = useState({
    totalLaptops: 0,
    refurbishedCount: 0,
    activeBeneficiaries: 0,
    pipeline: {
      pickupRequested: 0,
      inTransit: 0,
      received: 0,
      onlyLaptopReceived: 0,
      notWorking: 0,
      refurbishmentStarted: 0,
      refurbished: 0,
      distributed: 0,
      activeUsage: 0
    },
    recentActivities: []
  });

  useEffect(() => {
    let isActive = true; // Added to prevent race conditions from multiple rapid requests

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const apiBase = window.location.origin.includes("localhost") || window.location.origin.includes("127.0.0.1")
          ? "http://localhost:8000"
          : "https://sama-api.thesama.in";

        const params = new URLSearchParams();
        if (selectedOrganization) {
          params.append("orgName", selectedOrganization);
        }
        if (appliedStartDate) {
          params.append("startDate", appliedStartDate);
        }
        if (appliedEndDate) {
          params.append("endDate", appliedEndDate);
        }

        const res = await fetch(`${apiBase}/api/public/donor-stats?${params.toString()}`);
        const data = await res.json();

        if (isActive) {
          setStats({
            totalLaptops: data.totalLaptops || 0,
            refurbishedCount: data.refurbishedCount || 0,
            activeBeneficiaries: data.activeBeneficiaries || 0,
            pipeline: data.pipeline || {
              pickupRequested: 0,
              inTransit: 0,
              received: 0,
              onlyLaptopReceived: 0,
              notWorking: 0,
              refurbishmentStarted: 0,
              refurbished: 0,
              distributed: 0,
              activeUsage: 0
            },
            recentActivities: data.recentActivities || []
          });

          setNgoPartner(data.ngoPartners || []);
          setApprovedCount((data.ngoPartners || []).length);
          setUniqueOrgs(data.uniqueOrganizations || []);
        }

      } catch (err) {
        console.error("Error fetching overview data:", err);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isActive = false; // Cleanup function invalidates the request if dependencies change
    };
  }, [selectedOrganization, appliedStartDate, appliedEndDate]);


  // average days count
  // useEffect(() => {
  //   fetch(`${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getAverageDays`)
  //     .then((res) => res.json())
  //     .then((data) => {
  //       setAverageDays(data.averageDays);
  //       // setLoading(false);
  //     })
  //     .catch((err) => {
  //       console.error("Error fetching data:", err);
  //       // setLoading(false);
  //     });
  // }, []);

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
    let result = ngoPartner;

    if (selectedOrganization) {
      const selOrg = selectedOrganization.trim().toLowerCase();
      result = result.filter(partner => {
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
    }

    if (ngoSearchTerm) {
      const searchLower = ngoSearchTerm.toLowerCase();
      result = result.filter(partner => {
        if (partner.name && partner.name.toLowerCase().includes(searchLower)) return true;
        if (partner.laptopDetails && partner.laptopDetails.some(l => String(l.ID).toLowerCase().includes(searchLower))) return true;
        return false;
      });
    }

    return result;
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
  const totalLaptops = stats.totalLaptops;
  const receivedCount = stats.pipeline.received;
  const refurbishedCount = stats.refurbishedCount;
  const distributedCount = stats.pipeline.refurbished; // distributed counts map to refurbished stage in UI
  const onlyLaptopReceivedCount = stats.pipeline.onlyLaptopReceived;
  const successRate = totalLaptops > 0 ? ((refurbishedCount / totalLaptops) * 100).toFixed(2) : 0;
  const ngosServedCount = filteredNgoPartners.filter((partner) => partner.laptops > 0).length;




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
  // Fixed date parsing function to handle both ISO dates and DD-MM-YYYY HH:MM:SS format
  function parseDate(dateString) {
    if (!dateString || typeof dateString !== "string" || dateString.trim() === "") {
      return null;
    }
    const isoDate = Date.parse(dateString);
    if (!isNaN(isoDate)) return new Date(isoDate);
    
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
        let status = laptop.Status || "Unknown";
        
        // Map postgres snake_case to UI Title Case so frontend mapping works perfectly
        const statusMap = {
          "laptop_received": "Laptop Received",
          "not_working": "Not Working",
          "refurbishment_testing": "Refurbishment Started",
          "refurbishment_started": "Refurbishment Started",
          "laptop_refurbished": "Laptop Refurbished",
          "qc_check": "Laptop Refurbished",
          "to_be_dispatch": "To be dispatch",
          "ready": "To be dispatch",
          "in_transit": "In Transit",
          "allocated": "Allocated",
          "distributed": "Distributed",
          "distribution": "Distributed",
          "pickup_requested": "Pickup Request"
        };
        
        if (statusMap[status.toLowerCase()]) {
            status = statusMap[status.toLowerCase()];
        }
        
        const allocatedTo = laptop["Allocated To"] || "Unassigned";
        const updatedBy = laptop["Last Updated By"] || null;

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
        
        // Add updatedBy to the key so activities by different people don't merge, or just merge them?
        // Let's keep it simple and just use the most recent updater if they merge

        if (!activityMap[key]) {
          activityMap[key] = {
            status,
            allocatedTo: (status === "Allocated" || status === "Distributed") ? allocatedTo : null,
            count: 0,
            lastUpdated,
            id: allocatedTo?.charAt(0).toUpperCase() || "?", // Avatar 
            updatedBy: updatedBy
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
    const dateObj = (typeof timestamp === "string" || typeof timestamp === "number") ? new Date(timestamp) : timestamp;
    const diffMs = Date.now() - dateObj.getTime();
    
    // Handle timezone offset mismatch (future times)
    if (diffMs < 0) {
      const absDiffMins = Math.floor(Math.abs(diffMs) / (1000 * 60));
      if (absDiffMins < 60) {
        return absDiffMins <= 1 ? "Just now" : `${absDiffMins} mins ago`;
      }
      const absDiffHours = Math.floor(absDiffMins / 60);
      if (absDiffHours < 12) {
        return `${absDiffHours} hours ago`;
      }
      return "Just now";
    }

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
    let message = "";
    
    if (activity.status === "Pickup Request") {
      message = activity.message || `New pickup request by ${activity.allocatedTo}`;
    } else if (activity.status === "In Transit") {
      message = `${activity.count} new laptop${activity.count > 1 ? "s" : ""} added with status In Transit`;
    } else {
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
        message = `${count} ${laptop} ${action} ${activity.allocatedTo}`;
      } else {
        message = `${count} ${laptop} ${action}`;
      }
    }
    
    // Append the user who made the change, if available
    if (activity.updatedBy && activity.updatedBy !== "Unknown") {
      message += ` by ${activity.updatedBy}`;
    }
    
    return message;
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


  const recentActivities = stats.recentActivities;
  const uniqueOrganizations = uniqueOrgs;

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
                  {(startDate || endDate || appliedStartDate || appliedEndDate) && (
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
                  value={stats.activeBeneficiaries.toLocaleString('en-IN')}
                  subtitle="Currently using laptops"
                  icon={Users}
                  onClick={() => handleMetricClick("activeBeneficiaries")}
                />

              </Grid>
              {isAfeApprover && (
                <Grid item xs={12} sm={6} md={3}>
                  <MetricCard
                    title="Amazon AFE Report"
                    value="Learning Analytics"
                    subtitle="Click to view details and reports"
                    icon={Download}
                    onClick={handleDownloadCSV}
                  />
                </Grid>
              )}
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
                      count: `${stats.pipeline.pickupRequested} laptops`,
                      bgColor: "#e3f2fd",
                      iconColor: "#1976d2",
                      stepType: "pickupRequests"
                    },
                    {
                      icon: Truck,
                      title: "In Transit",
                      subtitle: "Pickup in progress",
                      count: `${stats.pipeline.inTransit} laptops`,
                      bgColor: "#fff3e0",
                      iconColor: "#f57c00",
                      stepType: "inTransit"
                    },
                    {
                      icon: Laptop,
                      title: "Laptop Received",
                      subtitle: "Initial check-in",
                      count: `${stats.pipeline.received} laptops`,
                      bgColor: "#e8f5e8",
                      iconColor: "#388e3c",
                      stepType: "received"
                    },
                    {
                      icon: Laptop,
                      title: "Ready To Be Processed",
                      subtitle: "Refurbishment will begin shortly.",
                      count: `${stats.pipeline.onlyLaptopReceived} laptops`,
                      bgColor: "#e8f5e8",
                      iconColor: "#388e3c",
                      stepType: "onlyLaptopReceived"
                    },

                    {
                      icon: X,
                      title: "Not Working",
                      subtitle: "Failed initial health check",
                      count: `${stats.pipeline.notWorking} laptops`,
                      bgColor: "#ffebee",
                      iconColor: "#d32f2f",
                      stepType: "notWorking"
                    },
                    {
                      icon: Settings,
                      title: "Refurbishment Started",
                      subtitle: "Under processing",
                      count: `${stats.pipeline.refurbishmentStarted} laptops`,
                      bgColor: "#e0f7fa",
                      iconColor: "#0097a7",
                      stepType: "refurbishmentStarted"
                    },
                    {
                      icon: CheckCircle,
                      title: "Laptop Refurbished",
                      subtitle: "Repair completed",
                      count: `${stats.pipeline.refurbished} laptops`,
                      bgColor: "#f3e5f5",
                      iconColor: "#7b1fa2",
                      stepType: "refurbished"
                    },
                    {
                      icon: UserCheck,
                      title: "Distributed",
                      subtitle: "Delivered to NGO",
                      count: `${stats.pipeline.distributed} laptops`,
                      bgColor: "#e8f5e9",
                      iconColor: "#2e7d32",
                      stepType: "distributed"
                    },
                    {
                      icon: UserCheck,
                      title: "Active Usage",
                      subtitle: "In use by beneficiaries",
                      count: `${stats.pipeline.activeUsage} laptops`,
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
                    {/* <Grid item xs={6} sm={3}>
                  <SummaryMetric label="Avg. Processing Time" value={`${averageDays} days`} />
                </Grid> */}
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

            {isAfeApprover && <AfeTracker />}

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
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Box display="flex" alignItems="center">
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
                      {showNgoDetails && (
                        <TextField
                          size="small"
                          placeholder="Search NGO or Laptop ID..."
                          value={ngoSearchTerm}
                          onChange={(e) => setNgoSearchTerm(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          sx={{ width: 300 }}
                        />
                      )}
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