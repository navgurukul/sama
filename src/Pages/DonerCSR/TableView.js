import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Button,
  Chip,
  Tabs,
  Tab,
  CircularProgress,
  TextField,
  Grid,
} from '@mui/material';
import { ArrowLeft, BookOpen, Clock, Award, School } from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

const TableView = ({
  metricType,
  data,
  onBack,
  selectedOrganization
}) => {
  

  const { donorName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [standaloneLaptopData, setStandaloneLaptopData] = useState([]);
  const [standaloneData, setStandaloneData] = useState([]);
  const [standaloneMetricType, setStandaloneMetricType] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState(0);
  const [preData, setPreData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [learningStartDate, setLearningStartDate] = useState('');
  const [learningEndDate, setLearningEndDate] = useState('');
  const [selectedNgoFilter, setSelectedNgoFilter] = useState('');
  const [selectedStateFilter, setSelectedStateFilter] = useState('');
  const [selectedPartnerFilter, setSelectedPartnerFilter] = useState('');
  
  // Get user role and donor organization from localStorage
  const authData = JSON.parse(localStorage.getItem("_AuthSama_")) || [];
  const userRoleRaw = authData[0]?.role || "";
  const userRole = userRoleRaw.includes("admin") ? "admin" : (userRoleRaw.includes("doner") ? "doner" : userRoleRaw);
  const donorOrgName = authData[0]?.Doner;

  const isStandalone = !metricType && !onBack;
  const displayMetricType = isStandalone ? standaloneMetricType : metricType;

  useEffect(() => {
    if (displayMetricType === "learningAnalytics") {
      setRowsPerPage(50);
    } else {
      setRowsPerPage(10);
    }
  }, [displayMetricType]);

  const filterDataByActivity = async (metricType, activity) => {
    setIsLoading(true);
    try {
      let apiUrl = '';
      let data = [];

      // Determine which API to call based on activity type
      if (activity.status === "Pickup Request") {
        apiUrl = `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=pickupget`;
      } else {
        apiUrl = `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`;
      }

      const res = await fetch(apiUrl);
      let responseData = await res.json();

      // Handle different response structures
      if (responseData && responseData.status === "success" && Array.isArray(responseData.data)) {
        data = responseData.data;
      } else if (Array.isArray(responseData)) {
        data = responseData;
      } else if (responseData && Array.isArray(responseData.data)) {
        data = responseData.data;
      } else {
        data = [];
      }
      // Filter data based on specific activity criteria
      let filteredData = [];

      switch (activity.status) {
        case "Pickup Request":
          filteredData = data.filter(pickup => {
            const matches = pickup["Donor Company"]?.trim() === activity.allocatedTo;
            return matches;
          });
          break;

        case "Distributed":
        case "Allocated":
          filteredData = data.filter(laptop => {
            const statusMatch = laptop.Status === activity.status;
            const allocatedMatch = laptop["Allocated To"]?.trim() === activity.allocatedTo;
            const matches = statusMatch && allocatedMatch;
            return matches;
          });
          break;

        case "Laptop Received":
        case "Laptop Refurbished":
        case "To Be Dispatch":
        case "Refurbishment Started":
        case "Not Working":
        case "In Transit":
          filteredData = data.filter(laptop => {
            const status = (laptop.Status || "").trim().toLowerCase().replace(/_/g, " ");
            const actStatus = (activity.status || "").trim().toLowerCase().replace(/_/g, " ");
            // Map legacy to new db status for activity
            if (actStatus === "laptop received" && (status === "laptop received")) return true;
            if (actStatus === "laptop refurbished" && (status === "laptop refurbished" || status === "qc check")) return true;
            if (actStatus === "refurbishment started" && (status === "refurbishment started" || status === "refurbishment testing")) return true;
            if (actStatus === "not working" && (status === "not working")) return true;
            if (actStatus === "in transit" && (status === "in transit")) return true;
            if (status === actStatus) return true;
            return false;
          });
          break;

        default:
          filteredData = data.filter(laptop => {
            const status = (laptop.Status || "").trim().toLowerCase().replace(/_/g, " ");
            const actStatus = (activity.status || "").trim().toLowerCase().replace(/_/g, " ");
            if (actStatus === "distributed" && (status === "distributed" || status === "distribution")) return true;
            return status === actStatus;
          });
      }

      // Apply time-based filtering to match recent activity timeframe (last 24 hours)
      if (activity.status !== "Pickup Request") {
        const now = new Date();

        filteredData = filteredData.filter(item => {
          if (!item["Last Updated On"] && !item["Date Committed"]) {
            return true;
          }

          let itemDate;
          if (activity.status === "In Transit") {
            itemDate = parseDateUniversal(item["Date Committed"]);
          } else {
            itemDate = parseDateUniversal(item["Last Updated On"]);
          }

          if (!itemDate) {
            return true;
          }

          const hoursDiff = (now - itemDate) / (1000 * 60 * 60);
          const within24Hours = hoursDiff <= 24 ;
          return within24Hours;
        });
      } else {
        // For pickup requests, filter by date
        const now = new Date();

        filteredData = filteredData.filter(item => {
          if (!item["Current Date & Time"]) {
            return true;
          }
          const itemDate = parseDateUniversal(item["Current Date & Time"]);
          if (!itemDate) {
            return true;
          }
          const hoursDiff = (now - itemDate) / (1000 * 60 * 60);
          const within24Hours = hoursDiff <= 24;
         
          return within24Hours;
        });
      }
      // Apply donor filter if applicable
      if (donorName) {
        filteredData = filteredData.filter(item => {
          const donorMatch = String(item["Donor Company Name"] || item["Donor Company"] || "").trim().toLowerCase() === donorName.toLowerCase();
          return donorMatch;
        });
      }

      // Limit to the count shown in recent activity (if available)
      if (activity.count && filteredData.length > activity.count) {
        filteredData = filteredData.slice(0, activity.count);
      }
      setStandaloneData(filteredData);
    } catch (error) {
      console.error('❌ Error filtering activity data:', error);
      setStandaloneData([]);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    if (isStandalone) {
      const searchParams = new URLSearchParams(location.search);
      const urlMetricType = searchParams.get('metric') || 'totalLaptops';
      setStandaloneMetricType(urlMetricType);

      if (urlMetricType === "activeBeneficiaries") {
        fetchBeneficiaryData();
      } else {
        fetchStandaloneData(urlMetricType);
      }
    }
  }, [isStandalone, donorName, location.search, page, rowsPerPage, learningStartDate, learningEndDate]);


  // for activity clicks
    useEffect(() => {
    if (isStandalone) {
      const searchParams = new URLSearchParams(location.search);
      const urlMetricType = searchParams.get('metric') || 'totalLaptops';
      const activityParam = searchParams.get('activity');

      setStandaloneMetricType(urlMetricType);

      if (activityParam) {
        const activity = JSON.parse(decodeURIComponent(activityParam));
        filterDataByActivity(urlMetricType, activity);
      } else {
        // console.log('📊 No activity param, fetching standalone data for metric:', urlMetricType);
        fetchStandaloneData(urlMetricType);
      }
    }
  }, [isStandalone, donorName, location.search, page, rowsPerPage, learningStartDate, learningEndDate]);

  const fetchBeneficiaryData = async () => {
    setIsLoading(true);
    try {
      // Fetch user data (one-to-one)
      const userRes = await fetch(`${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getUserData`);
      let userJson = await userRes.json();
      // Fetch pre data (one-to-many)
      const userPre = await fetch(`${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getpre`);
      let preJson = await userPre.json();

      // If user is a donor or if donorName is specified, filter the data
      if (userRole === "doner" || donorName || donorOrgName) {
        const filterDonorName = (donorName || donorOrgName || "").toLowerCase();
        
        // Filter NGO data first
        const ngoRes = await fetch(`${process.env.REACT_APP_NgoInformationApi}?type=registration`);
        const ngoData = await ngoRes.json();
        const filteredNgos = ngoData.data.filter(ngo => 
          String(ngo.Doner || ngo.Donor || "").trim().toLowerCase() === filterDonorName
        );
        
        const ngoIds = filteredNgos.map(ngo => String(ngo.Id).trim());

        // Filter user data based on NGO IDs
        userJson = userJson.filter(user => 
          ngoIds.includes(String(user.Ngo || user.ngoId || "").trim())
        );

        // Filter pre data based on donor name
        preJson = preJson.filter(pre => 
          String(pre.Doner || "").trim().toLowerCase() === filterDonorName
        );
      }

      setUserData(userJson || []);
      setPreData(preJson || []);
    } catch (error) {
      console.error('Error fetching beneficiary data:', error);
      setUserData([]);
      setPreData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const parseDateUniversal = (dateString) => {
    if (!dateString) return null;

    // Try built-in Date parse first
    const builtIn = new Date(dateString);
    if (!isNaN(builtIn)) return builtIn;

    // Handle DD-MM-YYYY HH:MM:SS format
    const parts = dateString.split(/[-/ :]/);
    if (parts.length >= 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const hours = parts[3] ? parseInt(parts[3], 10) : 0;
      const minutes = parts[4] ? parseInt(parts[4], 10) : 0;
      const seconds = parts[5] ? parseInt(parts[5], 10) : 0;

      const parsedDate = new Date(year, month, day, hours, minutes, seconds);
      if (!isNaN(parsedDate)) return parsedDate;
    }

    return null;
  };

  // const parseDateUniversal = (dateString) => {
  //   if (!dateString) return null;

  //   const date = new Date(dateString);
  //   if (!isNaN(date.getTime())) return date;

  //   const parts = dateString.split('/');
  //   if (parts.length === 3) {
  //     const day = parseInt(parts[0], 10);
  //     const month = parseInt(parts[1], 10) - 1;
  //     const year = parseInt(parts[2], 10);
  //     const newDate = new Date(year, month, day);
  //     if (!isNaN(newDate.getTime())) return newDate;
  //   }

  //   return null;
  // };

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

  const fetchStandaloneData = async (metric) => {
    setIsLoading(true);
    try {
      let apiUrl = '';
      let filterFunction = null;

      switch (metric) {
        case "learningAnalytics":
          apiUrl = `https://rms-api.thesama.in/api/afe/details?page=${page + 1}&limit=${rowsPerPage}`;
          if (learningStartDate) apiUrl += `&startDate=${learningStartDate}`;
          if (learningEndDate) apiUrl += `&endDate=${learningEndDate}`;
          break;
        case "totalLaptops":
          apiUrl = `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`;
          break;
        case "refurbished":
          apiUrl = `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`;
          filterFunction = (data) => data.filter(laptop => {
            const s = (laptop.Status || "").trim().toLowerCase().replace(/_/g, " ");
            return s === "laptop refurbished" || s === "qc check";
          });
          break;
        case "successfullyRefurbished":
        case "totalProcessed":
          apiUrl = `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`;
          filterFunction = (data) => data.filter(laptop => {
            const s = (laptop.Status || "").trim().toLowerCase().replace(/_/g, " ");
            return s === "laptop refurbished" || s === "qc check" ||
              s === "to be dispatch" || s === "ready" ||
              s === "allocated" ||
              s === "distributed" || s === "distribution" || s === "post deployment 15d" || s === "monthly monitoring";
          });
          break;
        case "pickupRequests":
          apiUrl = `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`;
          filterFunction = (data) => data.filter(laptop => {
            const s = (laptop.Status || "").trim().toLowerCase().replace(/_/g, " ");
            return s === "pickup requested";
          });
          break;
        case "inTransit":
          apiUrl = `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`;
          filterFunction = (data) => data.filter(laptop => {
            const s = (laptop.Status || "").trim().toLowerCase().replace(/_/g, " ");
            return s === "in transit";
          });
          break;
        case "received":
          apiUrl = `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`;
          filterFunction = (data) => {
            const statusesAtOrAfterReceived = new Set([
              "laptop received",
              "not working",
              "refurbishment started",
              "laptop refurbished",
              "to be dispatch",
              "allocated",
              "distributed",
              "refurbishment testing",
              "qc check",
              "distribution",
              "post deployment 15d",
              "monthly monitoring",
            ]);

            return data.filter(laptop =>
              statusesAtOrAfterReceived.has((laptop.Status || "").trim().toLowerCase().replace(/_/g, " "))
            );
          };
          break;
        case "onlyLaptopReceived":
          apiUrl = `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`;
          filterFunction = (data) => data.filter(laptop => {
            const s = (laptop.Status || "").trim().toLowerCase().replace(/_/g, " ");
            return s === "laptop received";
          });
          break;
        case "refurbishmentStarted":
          apiUrl = `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`;
          filterFunction = (data) => data.filter(laptop => {
            const s = (laptop.Status || "").trim().toLowerCase().replace(/_/g, " ");
            return s === "refurbishment started" || s === "refurbishment testing";
          });
          break;
        case "notWorking":
          apiUrl = `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`;
          filterFunction = (data) => data.filter(laptop => {
            const s = (laptop.Status || "").trim().toLowerCase().replace(/_/g, " ");
            return s === "not working";
          });
          break;
        case "toBeDispatch":
          apiUrl = `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`;
          filterFunction = (data) => data.filter(laptop => {
            const s = (laptop.Status || "").trim().toLowerCase().replace(/_/g, " ");
            return s === "to be dispatch" || s === "ready";
          });
          break;
        case "allocated":
          apiUrl = `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`;
          filterFunction = (data) => data.filter(laptop => {
            const s = (laptop.Status || "").trim().toLowerCase().replace(/_/g, " ");
            return s === "allocated";
          });
          break;
        case "distributed":
          apiUrl = `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`;
          filterFunction = (data) => data.filter(laptop => {
            const s = (laptop.Status || "").trim().toLowerCase().replace(/_/g, " ");
            return s === "distributed" || s === "distribution";
          });
          break;
        case "activeUsage":
          apiUrl = `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`;
          filterFunction = (data) => data.filter(laptop => {
            const d = parseDateUniversal(laptop["Date"]);
            if (!d) return false;
            const diffDays = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
            const s = (laptop.Status || "").trim().toLowerCase().replace(/_/g, " ");
            return diffDays <= 15 && (s === "distributed" || s === "distribution" || s === "post deployment 15d" || s === "monthly monitoring");
          });
          break;
          
      case "successRate":
          apiUrl = `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`;
          filterFunction = (data) => data.filter(laptop => {
            const s = (laptop.Status || "").trim().toLowerCase().replace(/_/g, " ");
            return s === "laptop refurbished" || s === "qc check" ||
              s === "to be dispatch" || s === "ready" ||
              s === "allocated" ||
              s === "distributed" || s === "distribution" || s === "post deployment 15d" || s === "monthly monitoring";
          });
          break;


        case "ngoPartners":
          apiUrl = `${process.env.REACT_APP_NgoInformationApi}?type=registration`;
          break;
        case "ngosServed":
          apiUrl = `${process.env.REACT_APP_NgoInformationApi}?type=registration`;
          break;
        default:
          apiUrl = `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`;
      }

      const res = await fetch(apiUrl);
      let data = await res.json();

      if (metric === "ngoPartners" || metric === "ngosServed") {
        data = data.data || data;
        data = data.filter(ngo => ngo.Status === "Approved");

        if (metric === "ngosServed") {
          try {
            const laptopRes = await fetch(`${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`);
            const laptopData = await laptopRes.json();

            const beforeFilter = data.length;
            data = data.filter(ngo => {
              const hasLaptops = laptopData.some(laptop =>
                String(laptop["Allocated To"] || "").trim().toLowerCase() ===
                String(ngo.organizationName || "").trim().toLowerCase()
              );
              return hasLaptops;
            });
          } catch (error) {
            console.error('Error fetching laptop data for NGOs:', error);
          }
        }
      }
      if (metric === "pickupRequests" && filterFunction) {
        data = filterFunction(data);
      }
      if (donorName && metric !== "ngoPartners" && metric !== "pickupRequests" && metric !== "ngosServed" && metric !== "learningAnalytics") {
        const beforeFilter = data.length;
        data = data.filter(item =>
          String(item["Donor Company Name"] || "").trim().toLowerCase() === donorName.toLowerCase()
        );
      }

      if (donorName && metric === "pickupRequests") {
        const beforeFilter = data.length;
        data = data.filter(item =>
          String(item["Donor Company"] || "").trim().toLowerCase() === donorName.toLowerCase()
        );
      }
      if (filterFunction && metric !== "pickupRequests") {
        const beforeFilter = data.length;
        data = filterFunction(data);
      }
      if (donorName && (metric === "ngoPartners" || metric === "ngosServed")) {
        const beforeFilter = data.length;
        data = data.filter(ngo =>
          String(ngo.Doner || ngo.Donor || "").trim().toLowerCase() === donorName.toLowerCase()
        );
      }
      setStandaloneData(data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setStandaloneData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };


  const handleBack = () => {
    if (isStandalone) {
      navigate(`/donorcsr/overview`);
      // if (donorName) {
      //   navigate(`/donorcsr/overview`);
      // } else {
      //   navigate('/donorcsr/overview');
      // }
    } else {
      onBack();
    }
  };

  const displayData = isStandalone ? standaloneData : data;
  const displayOrganization = isStandalone ? donorName : selectedOrganization;

  const getFilteredLearningData = () => {
    if (displayMetricType !== "learningAnalytics" || !displayData) return displayData || [];

    return displayData.filter(item => {
      const matchNgo = !selectedNgoFilter || item.ngo_name === selectedNgoFilter;
      const matchState = !selectedStateFilter || item.state === selectedStateFilter;
      const matchPartner = !selectedPartnerFilter || item.partner_name === selectedPartnerFilter;
      return matchNgo && matchState && matchPartner;
    });
  };

  const filteredLearningData = getFilteredLearningData();

  const uniquePartners = [...new Set((displayData || []).map(item => item.partner_name).filter(Boolean))].sort();
  const uniqueNgos = [...new Set((displayData || []).map(item => item.ngo_name).filter(Boolean))].sort();
  const uniqueStates = [...new Set((displayData || []).map(item => item.state).filter(Boolean))].sort();

  const getLearningAnalyticsMetrics = (analyticsData) => {
    if (!analyticsData || analyticsData.length === 0) {
      return {
        totalSessions: 0,
        avgVideoCompletion: 0,
        avgQuizAccuracy: 0,
        uniqueSchools: 0,
        gradeData: [],
        ngoPerformance: [],
        trendsData: []
      };
    }

    let totalVideo = 0;
    let videoCount = 0;
    let totalQuiz = 0;
    let quizCount = 0;
    const schools = new Set();
    const grades = {};
    const ngos = {};
    const dates = {};

    analyticsData.forEach(item => {
      // Schools
      if (item.school_name) {
        schools.add(item.school_name.trim());
      }

      // Video Completion
      if (item.video_completion_rate !== undefined && item.video_completion_rate !== null) {
        const val = parseFloat(String(item.video_completion_rate).replace('%', ''));
        if (!isNaN(val)) {
          totalVideo += val;
          videoCount++;
        }
      }

      // Quiz Accuracy
      if (item.quiz_accuracy_percentage !== undefined && item.quiz_accuracy_percentage !== null) {
        const val = parseFloat(String(item.quiz_accuracy_percentage).replace('%', ''));
        if (!isNaN(val)) {
          totalQuiz += val;
          quizCount++;
        }
      }

      // Grade
      const grade = item.grade || 'Unknown';
      grades[grade] = (grades[grade] || 0) + 1;

      // NGO
      const ngo = item.ngo_name || 'Unknown';
      if (!ngos[ngo]) {
        ngos[ngo] = { totalVideo: 0, videoCount: 0, totalQuiz: 0, quizCount: 0, sessionCount: 0 };
      }
      ngos[ngo].sessionCount++;
      if (item.video_completion_rate !== undefined && item.video_completion_rate !== null) {
        const val = parseFloat(String(item.video_completion_rate).replace('%', ''));
        if (!isNaN(val)) {
          ngos[ngo].totalVideo += val;
          ngos[ngo].videoCount++;
        }
      }
      if (item.quiz_accuracy_percentage !== undefined && item.quiz_accuracy_percentage !== null) {
        const val = parseFloat(String(item.quiz_accuracy_percentage).replace('%', ''));
        if (!isNaN(val)) {
          ngos[ngo].totalQuiz += val;
          ngos[ngo].quizCount++;
        }
      }

      // Dates
      if (item.session_date) {
        const d = String(item.session_date).trim();
        if (!dates[d]) {
          dates[d] = { count: 0, totalVideo: 0, totalQuiz: 0, quizCount: 0 };
        }
        if (item.video_completion_rate !== undefined && item.video_completion_rate !== null) {
          const val = parseFloat(String(item.video_completion_rate).replace('%', ''));
          if (!isNaN(val)) {
            dates[d].totalVideo += val;
            dates[d].count++;
          }
        }
        if (item.quiz_accuracy_percentage !== undefined && item.quiz_accuracy_percentage !== null) {
          const val = parseFloat(String(item.quiz_accuracy_percentage).replace('%', ''));
          if (!isNaN(val)) {
            dates[d].totalQuiz += val;
            dates[d].quizCount++;
          }
        }
      }
    });

    // Format NGO Pie Data
    const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#3B82F6', '#14B8A6', '#87A96B'];
    const ngoPieData = Object.keys(ngos).map((key, idx) => ({
      name: key,
      value: ngos[key].sessionCount,
      color: COLORS[idx % COLORS.length]
    })).sort((a, b) => b.value - a.value);

    // Format Grade Data
    const GRADE_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#3B82F6'];
    const gradeData = Object.keys(grades).map((key, idx) => ({
      name: `Grade ${key}`,
      value: grades[key],
      color: GRADE_COLORS[idx % GRADE_COLORS.length]
    })).sort((a, b) => a.name.localeCompare(b.name));

    // Format NGO Data
    const ngoPerformance = Object.keys(ngos).map(key => ({
      name: key,
      sessions: ngos[key].sessionCount,
      videoCompletion: ngos[key].videoCount > 0 ? Math.round((ngos[key].totalVideo / ngos[key].videoCount) * 10) / 10 : 0,
      quizAccuracy: ngos[key].quizCount > 0 ? Math.round((ngos[key].totalQuiz / ngos[key].quizCount) * 10) / 10 : 0
    })).sort((a, b) => b.sessions - a.sessions).slice(0, 8);

    // Format Trends Data
    const trendsData = Object.keys(dates).map(key => ({
      date: key,
      completion: dates[key].count > 0 ? Math.round((dates[key].totalVideo / dates[key].count) * 10) / 10 : 0,
      quizAccuracy: dates[key].quizCount > 0 ? Math.round((dates[key].totalQuiz / dates[key].quizCount) * 10) / 10 : 0
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      totalSessions: analyticsData.length,
      avgVideoCompletion: videoCount > 0 ? Math.round((totalVideo / videoCount) * 10) / 10 : 0,
      avgQuizAccuracy: quizCount > 0 ? Math.round((totalQuiz / quizCount) * 10) / 10 : 0,
      uniqueSchools: schools.size,
      ngoPieData,
      gradeData,
      ngoPerformance,
      trendsData
    };
  };

  const metrics = getLearningAnalyticsMetrics(filteredLearningData);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const getTableHeaders = () => {
    switch (displayMetricType) {
      case "learningAnalytics":
        return (
          <>
            <TableCell sx={{ fontWeight: "bold" }}>Session ID</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Avatar Name</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Partner Name</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>NGO Name</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Session Date</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>School Name</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>State & District</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Grade</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Video Completion %</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Quiz Accuracy %</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Questions Attempted</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
          </>
        );
      case "activeBeneficiaries":
        return activeTab === 0 ? (
          <>
            <TableCell sx={{ fontWeight: "bold" }}>Beneficiary Name</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>NGO</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Phone</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
          </>
        ) : (
          <>
            <TableCell sx={{ fontWeight: "bold" }}>NGO ID</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>NGO Name</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Number of Students</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
          </>
        );

      case "totalLaptops":
      case "refurbished":
      case "successfullyRefurbished":
      case "notWorking":
      case "pickupRequests":
      case "inTransit":
      case "received":
      case "refurbishmentStarted":
      case "toBeDispatch":
      case "allocated":
      case "distributed":
      case "activeUsage":
      case "onlyLaptopReceived":
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
      case "ngoPartners":
        return (
          <>
            <TableCell sx={{ fontWeight: "bold" }}>Organization Name</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Location</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Contact Person</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Phone</TableCell>
          </>
        );
      case "pickupRequests":
        return (
          <>
            <TableCell sx={{ fontWeight: "bold" }}>Pickup ID</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Donor Company</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Number of Laptops</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Date & Time</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Contact Person</TableCell>
          </>
        );
      case "distributed":
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
      case "activeUsage":
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
      case "ngosServed":
        return (
          <>
            <TableCell sx={{ fontWeight: "bold" }}>Organization Name</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Location</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Laptops Allocated</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Beneficiaries</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Last Delivery</TableCell>
          </>
        );

      default:
        return (
          <>
            <TableCell sx={{ fontWeight: "bold" }}>Laptop ID</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Manufacturer Model</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Working</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Donor Company</TableCell>
          </>
        );

    }
  };

  const getTableTitle = () => {
    const searchParams = new URLSearchParams(location.search);
    const activityParam = searchParams.get('activity');

    if (activityParam) {
      const activity = JSON.parse(decodeURIComponent(activityParam));

      switch (activity.status) {
        case "Distributed":
          return `Laptops Distributed to ${activity.allocatedTo} (${activity.count} laptops)`;
        case "Allocated":
          return `Laptops Allocated to ${activity.allocatedTo} (${activity.count} laptops)`;
        case "Laptop Received":
          return `Recently Received Laptops (${activity.count} laptops)`;
        case "Laptop Refurbished":
          return `Recently Refurbished Laptops (${activity.count} laptops)`;
        case "To Be Dispatch":
          return `Laptops Ready for Dispatch (${activity.count} laptops)`;
        case "In Transit":
          return `Laptops In Transit (${activity.count} laptops)`;
        case "Not Working":
          return `Laptops Not Working (${activity.count} laptops)`;
        case "Refurbishment Started":
          return `Laptops with Refurbishment Started (${activity.count} laptops)`;
        case "Pickup Request":
          return `Pickup Requests from ${activity.allocatedTo}`;
        default:
          return `${activity.status} - Activity Details`;
      }
    }

    switch (displayMetricType) {
      case "learningAnalytics":
        return "Amazon Learning Analytics Report";
      case "totalLaptops":
        return "All Laptops Data";
      case "activeBeneficiaries":
        return "Active Beneficiaries Data";
      case "refurbished":
        return "Refurbished Laptops Data";
      case "successfullyRefurbished":
        return "Successfully Refurbished Laptops Data";
      case "pickupRequests":
        return "Pickup Requested Laptops Data";
      case "inTransit":
        return "In Transit Laptops Data";
      case "received":
        return "Received Laptops Data";
      case "onlyLaptopReceived":
        return "Ready To Be Processed";
      case "notWorking":
        return "Not Working Laptops Data";
      case "refurbishmentStarted":
        return "Laptops Under Refurbishment Data";
      case "toBeDispatch":
        return "Laptops Ready for Dispatch Data";  
      case "allocated":
        return "Allocated Laptops Data";
      case "distributed":
        return "Distributed Laptops Data";
      case "activeUsage":
        return "Active Usage Laptops Data";
      case "ngoPartners":
        return "NGO Partners Data";
      case "totalProcessed":
        return "Total Processed Laptops Data";
      case "ngosServed":
        return "NGOs That Received Laptops Data";
      case "successRate":
        const total = new URLSearchParams(location.search).get('total');
        const processed = new URLSearchParams(location.search).get('processed');
        return `Success Rate Details (${processed} out of ${total} laptops processed)`;
      default:
        return "Data";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'distributed':
      case 'approved':
      case 'active':
        return 'success';
      case 'laptop refurbished':
      case 'completed':
        return 'primary';
      case 'to be dispatch':
      case 'pending':
        return 'warning';
      case 'laptop received':
      case 'in progress':
        return 'info';
      default:
        return 'default';
    }
  };

  const renderTableRows = () => {
    let dataToDisplay = displayMetricType === "learningAnalytics" ? filteredLearningData : displayData;
    
    if (displayMetricType === "activeBeneficiaries") {
      dataToDisplay = activeTab === 0 ? userData : preData;
    }

    const currentData = (displayMetricType === "learningAnalytics")
      ? (dataToDisplay || [])
      : (dataToDisplay ? dataToDisplay.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : []);

    if (displayMetricType === "learningAnalytics") {
      return currentData.map((item, index) => (
        <TableRow key={item.id || index} hover>
          <TableCell>{item.session_id || "-"}</TableCell>
          <TableCell>{item.avatar_name || "-"}</TableCell>
          <TableCell>{item.partner_name || "-"}</TableCell>
          <TableCell>{item.ngo_name || "-"}</TableCell>
          <TableCell>{item.session_date || "-"}</TableCell>
          <TableCell>{item.school_name || "-"}</TableCell>
          <TableCell>{`${item.state || "-"}, ${item.district || "-"}`}</TableCell>
          <TableCell>{item.grade || "-"}</TableCell>
          <TableCell>{item.video_completion_rate ? `${item.video_completion_rate}%` : "-"}</TableCell>
          <TableCell>{item.quiz_accuracy_percentage ? `${item.quiz_accuracy_percentage}%` : "-"}</TableCell>
          <TableCell>{(item.correct_answers_count !== null && item.correct_answers_count !== undefined) ? `${item.correct_answers_count}/${item.total_questions_answered}` : "-"}</TableCell>
          <TableCell>{item.session_completed_flag ? 'Completed' : 'In Progress'}</TableCell>
        </TableRow>
      ));
    }

    const laptopMetrics = [
      "totalLaptops", "refurbished", "distributed", "activeUsage",
      "laptopreceived", "laptoprefurbished", "tobedispatch",
      "refurbishmentstarted", "notWorking", "intransit", "allocated",
      "onlyLaptopReceived"
    ];

    if (laptopMetrics.includes(displayMetricType)) {
      return currentData.map((laptop, index) => {
       return (
          <TableRow key={index} hover>
            <TableCell>{laptop.ID || laptop.LaptopID || 'N/A'}</TableCell>
            <TableCell>{laptop["Manufacturer Model"] || 'N/A'}</TableCell>
            <TableCell>
              <Chip
                label={laptop.Status || 'Unknown'}
                size="small"
                color={getStatusColor(laptop.Status)}
                variant="outlined"
              />
            </TableCell>
            <TableCell>{formatWorkingStatus(laptop.Working)}</TableCell>
            <TableCell>{laptop["Donor Company Name"] || laptop["Donor Company"] || 'N/A'}</TableCell>
            <TableCell>{laptop["Allocated To"] || 'N/A'}</TableCell>
          </TableRow>
        );
      });
    }

    switch (displayMetricType) {
      case "activeBeneficiaries":
        if (activeTab === 0) {
          return currentData.map((user, index) => (
            <TableRow key={index} hover>
              <TableCell>{user?.Name || user?.name || 'N/A'}</TableCell>
              <TableCell>{user?.Ngo || user?.ngo || user?.NGO || 'N/A'}</TableCell>
              <TableCell>{user?.Email || user?.email || 'N/A'}</TableCell>
              <TableCell>{user?.Phone || user?.phone || 'N/A'}</TableCell>
              <TableCell>
                <Chip
                  label={user?.Status || user?.status || 'Active'}
                  size="small"
                  color="success"
                  variant="outlined"
                />
              </TableCell>
            </TableRow>
          ));
        } else {
          return currentData.map((pre, index) => (
            <TableRow key={index} hover>
              <TableCell>{pre?.NgoId || pre?.ngoId || pre?.['NGO Id'] || 'N/A'}</TableCell>
              <TableCell>{pre?.NgoName || pre?.ngoName || pre?.['NGO Name'] || 'N/A'}</TableCell>
              <TableCell>{pre?.["Number of student"] || pre?.['Number of Student'] || pre?.numberOfStudents || '0'}</TableCell>
              <TableCell>
                <Chip
                  label={pre?.Status || pre?.status || 'Active'}
                  size="small"
                  color="success"
                  variant="outlined"
                />
              </TableCell>
              <TableCell>{pre?.Date || pre?.date || 'N/A'}</TableCell>
            </TableRow>
          ));
        }

      case "totalLaptops":
      case "refurbished":
      case "successfullyRefurbished":
      case "notWorking":
      case "pickupRequests":
      case "inTransit":
      case "received":
      case "refurbishmentStarted":
      case "toBeDispatch":
      case "allocated":
      case "distributed":
      case "activeUsage":
        return currentData.map((laptop, index) => (
          <TableRow key={index} hover>
            <TableCell>{laptop.ID || laptop.LaptopID || 'N/A'}</TableCell>
            <TableCell>{laptop["Manufacturer Model"] || 'N/A'}</TableCell>
            <TableCell>
              <Chip
                label={laptop.Status || 'Unknown'}
                size="small"
                color={getStatusColor(laptop.Status)}
                variant="outlined"
              />
            </TableCell>
            <TableCell>{formatWorkingStatus(laptop.Working)}</TableCell>
            <TableCell>{laptop["Donor Company Name"] || 'N/A'}</TableCell>
            <TableCell>{laptop["Allocated To"] || 'N/A'}</TableCell>
          </TableRow>
        ));

      case "ngoPartners":
        return currentData.map((partner, index) => (
          <TableRow key={index} hover>
            <TableCell>{partner.organizationName || partner.name || 'N/A'}</TableCell>
            <TableCell>{partner.location || partner.Location || 'N/A'}</TableCell>
            <TableCell>
              <Chip
                label={partner.Status || partner.status || 'Unknown'}
                size="small"
                color={getStatusColor(partner.Status || partner.status)}
                variant="outlined"
              />
            </TableCell>
            <TableCell>{partner.contactPerson || partner.ContactPerson || 'N/A'}</TableCell>
            <TableCell>{partner.email || partner.Email || 'N/A'}</TableCell>
            <TableCell>{partner.phone || partner.Phone || 'N/A'}</TableCell>
          </TableRow>
        ));

      // case "pickupRequests":
      //   return currentData.map((pickup, index) => (
      //     <TableRow key={index} hover>
      //       <TableCell>{pickup["Pickup ID"] || pickup.PickupID || 'N/A'}</TableCell>
      //       <TableCell>{pickup["Donor Company"] || 'N/A'}</TableCell>
      //       <TableCell>{pickup["Number of Laptops"] || 'N/A'}</TableCell>
      //       <TableCell>
      //         <Chip
      //           label={pickup.Status || 'Unknown'}
      //           size="small"
      //           color={getStatusColor(pickup.Status)}
      //           variant="outlined"
      //         />
      //       </TableCell>
      //       <TableCell>{pickup["Current Date & Time"] || pickup.PickupDate || 'N/A'}</TableCell>
      //       <TableCell>{pickup["Contact Person"] || 'N/A'}</TableCell>
      //     </TableRow>
      //   ));
      case "ngosServed":
        return currentData.map((partner, index) => {
          // Calculate laptop count for this NGO
          const laptopCount = standaloneLaptopData ?
            standaloneLaptopData.filter(laptop =>
              String(laptop["Allocated To"] || "").trim().toLowerCase() ===
              String(partner.organizationName || "").trim().toLowerCase()
            ).length : 0;

          return (
            <TableRow key={index} hover>
              <TableCell>{partner.organizationName || partner.name || 'N/A'}</TableCell>
              <TableCell>{partner.location || partner.Location || 'N/A'}</TableCell>
              <TableCell>
                <Chip
                  label={partner.Status || partner.status || 'Unknown'}
                  size="small"
                  color={getStatusColor(partner.Status || partner.status)}
                  variant="outlined"
                />
              </TableCell>
              <TableCell>{laptopCount}</TableCell>
              <TableCell>{partner.beneficiaries || 'N/A'}</TableCell>
              <TableCell>{partner.lastDelivery || 'N/A'}</TableCell>
            </TableRow>
          );
        });
      default:
        return currentData.map((item, index) => (
          <TableRow key={index} hover>
            <TableCell colSpan={6} align="center">
              <Typography variant="body2" color="text.secondary">
                No data available for this metric
              </Typography>
            </TableCell>
          </TableRow>
        ));
    }
  };
  return (
    <Box sx={{ p: 3, pb: 10 }}>
      {/* Header with Back Button and Date Filters */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowLeft size={20} />}
            onClick={handleBack}
            variant="outlined"
            sx={{ textTransform: 'none' }}
          >
            Back to Dashboard
          </Button>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: "bold", color: "#333" }}>
              {getTableTitle()}
            </Typography>
            {displayOrganization && (
              <Chip
                label={`Filtered: ${displayOrganization}`}
                size="small"
                variant="outlined"
                sx={{ mt: 1 }}
              />
            )}
          </Box>
        </Box>

        {displayMetricType === "learningAnalytics" && (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              label="Start Date"
              type="date"
              value={learningStartDate}
              onChange={(e) => setLearningStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              sx={{ width: 140 }}
            />
            <TextField
              label="End Date"
              type="date"
              value={learningEndDate}
              onChange={(e) => setLearningEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              sx={{ width: 140 }}
            />

            <TextField
              select
              label="Partner"
              value={selectedPartnerFilter}
              onChange={(e) => setSelectedPartnerFilter(e.target.value)}
              size="small"
              sx={{ minWidth: 120 }}
              SelectProps={{ native: true }}
              InputLabelProps={{ shrink: true }}
            >
              <option value="">All Partners</option>
              {uniquePartners.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </TextField>

            <TextField
              select
              label="NGO"
              value={selectedNgoFilter}
              onChange={(e) => setSelectedNgoFilter(e.target.value)}
              size="small"
              sx={{ minWidth: 120 }}
              SelectProps={{ native: true }}
              InputLabelProps={{ shrink: true }}
            >
              <option value="">All NGOs</option>
              {uniqueNgos.map(ngo => (
                <option key={ngo} value={ngo}>{ngo}</option>
              ))}
            </TextField>

            <TextField
              select
              label="State"
              value={selectedStateFilter}
              onChange={(e) => setSelectedStateFilter(e.target.value)}
              size="small"
              sx={{ minWidth: 120 }}
              SelectProps={{ native: true }}
              InputLabelProps={{ shrink: true }}
            >
              <option value="">All States</option>
              {uniqueStates.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </TextField>

            <Button
              variant="contained"
              onClick={() => {
                let url = 'https://rms-api.thesama.in/api/afe/export-csv';
                const params = [];
                if (learningStartDate) params.push(`startDate=${learningStartDate}`);
                if (learningEndDate) params.push(`endDate=${learningEndDate}`);
                if (params.length > 0) url += `?${params.join('&')}`;
                window.open(url, '_blank');
              }}
              size="medium"
              sx={{ textTransform: 'none' }}
            >
              Download CSV
            </Button>
          </Box>
        )}
      </Box>

      {/* Data Table */}
      <Card sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0', mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          {displayMetricType === "activeBeneficiaries" && (
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs 
                value={activeTab} 
                onChange={(e, newValue) => setActiveTab(newValue)}
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    minWidth: 120,
                  }
                }}
              >
                <Tab label="One to One" />
                <Tab label="One to Many" />
              </Tabs>
            </Box>
          )}

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Total Records: {
                displayMetricType === "activeBeneficiaries" 
                  ? (activeTab === 0 ? userData.length : preData.length)
                  : displayData.length
              }
            </Typography>
          </Box>

          <Table size="small" sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                {getTableHeaders()}
              </TableRow>
            </TableHead>
            <TableBody>
              {(displayMetricType === "activeBeneficiaries" ? 
                (activeTab === 0 ? userData.length : preData.length) : displayData.length) > 0 ? (
                renderTableRows()
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={getTableHeaders()?.props?.children?.length || 6}
                    align="center"
                    sx={{ py: 4 }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      No data available
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={(() => {
              if (displayMetricType === "activeBeneficiaries") {
                return activeTab === 0 ? userData.length : preData.length;
              }
              if (displayMetricType === "learningAnalytics") {
                return displayData.length === rowsPerPage ? (page + 2) * rowsPerPage : (page * rowsPerPage) + displayData.length;
              }
              return displayData?.length || 0;
            })()}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </CardContent>
      </Card>

      {displayMetricType === "learningAnalytics" && (
        <Box sx={{ mt: 4 }}>
          {/* Charts section */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Video Completion Trend Over Time */}
            <Grid item xs={12} md={3}>
              <Card sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0', borderRadius: '8px', height: '100%' }}>
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: '#333' }}>Video Completion Trend</Typography>
                  <Box sx={{ flexGrow: 1, width: '100%', height: 260 }}>
                    <ResponsiveContainer>
                      <AreaChart data={metrics.trendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorCompletion" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="date" stroke="#9CA3AF" fontSize={10} />
                        <YAxis stroke="#9CA3AF" fontSize={10} domain={['auto', 'auto']} unit="%" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1F2937', color: '#fff', borderRadius: '6px', border: 'none' }} 
                          itemStyle={{ color: '#fff' }} 
                          labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                          formatter={(value) => [`${value}%`, 'Avg Completion']} 
                        />
                        <Area type="monotone" dataKey="completion" stroke="#10B981" fillOpacity={1} fill="url(#colorCompletion)" strokeWidth={2} name="Avg Video Completion" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Quiz Accuracy Trend Over Time */}
            <Grid item xs={12} md={3}>
              <Card sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0', borderRadius: '8px', height: '100%' }}>
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: '#333' }}>Quiz Accuracy Trend</Typography>
                  <Box sx={{ flexGrow: 1, width: '100%', height: 260 }}>
                    <ResponsiveContainer>
                      <AreaChart data={metrics.trendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorQuizAccuracy" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="date" stroke="#9CA3AF" fontSize={10} />
                        <YAxis stroke="#9CA3AF" fontSize={10} domain={['auto', 'auto']} unit="%" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1F2937', color: '#fff', borderRadius: '6px', border: 'none' }} 
                          itemStyle={{ color: '#fff' }} 
                          labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                          formatter={(value) => [`${value}%`, 'Avg Accuracy']} 
                        />
                        <Area type="monotone" dataKey="quizAccuracy" stroke="#F59E0B" fillOpacity={1} fill="url(#colorQuizAccuracy)" strokeWidth={2} name="Avg Quiz Accuracy" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Engagement by NGO (Pie Chart) */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0', borderRadius: '8px', height: '100%' }}>
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: '#333' }}>Engagement by NGO</Typography>
                  <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 260 }}>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie
                          data={metrics.ngoPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {metrics.ngoPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1F2937', color: '#fff', borderRadius: '6px', border: 'none' }} 
                          itemStyle={{ color: '#fff' }} 
                          labelStyle={{ color: '#fff', fontWeight: 'bold' }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Legend */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1, mt: 2, maxHeight: 80, overflowY: 'auto' }}>
                      {metrics.ngoPieData.map((entry, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: entry.color }} />
                          <Typography variant="caption" sx={{ color: '#4B5563', fontSize: '10px' }}>
                            {entry.name} ({entry.value})
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Engagement by Grade (Pie Chart) */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0', borderRadius: '8px', height: '100%' }}>
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: '#333' }}>Engagement by Grade</Typography>
                  <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 260 }}>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie
                          data={metrics.gradeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {metrics.gradeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1F2937', color: '#fff', borderRadius: '6px', border: 'none' }} 
                          itemStyle={{ color: '#fff' }} 
                          labelStyle={{ color: '#fff', fontWeight: 'bold' }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Legend */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1, mt: 2, maxHeight: 80, overflowY: 'auto' }}>
                      {metrics.gradeData.map((entry, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: entry.color }} />
                          <Typography variant="caption" sx={{ color: '#4B5563', fontSize: '10px' }}>
                            {entry.name} ({entry.value})
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default TableView;