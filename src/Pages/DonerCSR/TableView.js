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
} from '@mui/material';
import { ArrowLeft } from 'lucide-react';

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
  
  // Get user role and donor organization from localStorage
  const authData = JSON.parse(localStorage.getItem("_AuthSama_")) || [];
  const userRole = authData[0]?.role?.[0];
  const donorOrgName = authData[0]?.Doner;

  const isStandalone = !metricType && !onBack;

  const filterDataByActivity = async (metricType, activity) => {
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
            const matches = laptop.Status === activity.status;
            return matches;
          });
          break;

        default:
          filteredData = data.filter(laptop => {
            const matches = laptop.Status === activity.status;
            return matches;
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
  }, [isStandalone, donorName, location.search]);


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
  }, [isStandalone, donorName, location.search]);

  const fetchBeneficiaryData = async () => {
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
    try {
      let apiUrl = '';
      let filterFunction = null;

      switch (metric) {
        case "totalLaptops":
          apiUrl = `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`;
          break;
        case "refurbished":
          apiUrl = `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`;
          filterFunction = (data) => data.filter(laptop =>
            laptop.Status === "Laptop Refurbished"
          );
          break;
        case "successfullyRefurbished":
          apiUrl = `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`;
          filterFunction = (data) => data.filter(laptop => {
            return laptop.Status === "Laptop Refurbished" ||
              laptop.Status === "To Be Dispatch" ||
              laptop.Status === "Allocated" ||
              laptop.Status === "Distributed";
          });
          break;
        case "totalProcessed":
          apiUrl = `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`;
          filterFunction = (data) => data.filter(laptop => {
            return laptop.Status === "Laptop Refurbished" ||
              laptop.Status === "To Be Dispatch" ||
              laptop.Status === "Allocated" ||
              laptop.Status === "Distributed";
          });
          break;
        case "pickupRequests":
          apiUrl = `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`;
          filterFunction = (data) => data.filter(laptop => 
            laptop.Status === "Pickup Requested" || laptop.Status === "Pickup requested"
          );
          break;
        case "inTransit":
          apiUrl = `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`;
          filterFunction = (data) => data.filter(laptop =>
            laptop.Status === "In Transit"
          );
          break;
        case "received":
          apiUrl = `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`;
          filterFunction = (data) => {
            const statusesAtOrAfterReceived = new Set([
              "laptop received",
              "refurbishment started",
              "laptop refurbished",
              "to be dispatch",
              "allocated",
              "distributed",
            ]);

            return data.filter(laptop =>
              statusesAtOrAfterReceived.has((laptop.Status || "").trim().toLowerCase())
            );
          };
          break;
        case "refurbishmentStarted":
          apiUrl = `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`;
          filterFunction = (data) => data.filter(laptop =>
            laptop.Status === "Refurbishment Started"
          );
          break;
        case "toBeDispatch":
          apiUrl = `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`;
          filterFunction = (data) => data.filter(laptop =>
            laptop.Status === "To Be Dispatch"
          );
          break;
        case "allocated":
          apiUrl = `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`;
          filterFunction = (data) => data.filter(laptop =>
            laptop.Status === "Allocated"
          );
          break;
        case "distributed":
          apiUrl = `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`;
          filterFunction = (data) => data.filter(laptop =>
            laptop.Status === "Distributed"
          );
          break;
        case "activeUsage":
          apiUrl = `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`;
          filterFunction = (data) => data.filter(laptop => {
            const d = parseDateUniversal(laptop["Date"]);
            if (!d) return false;
            const diffDays = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
            return diffDays <= 15;
            //  && (laptop.Status || "").toLowerCase() === "distributed"; // 
          });
          break;
          
      case "successRate":
          apiUrl = `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`;
          filterFunction = (data) => data.filter(laptop => {
            const status = (laptop.Status || "").toLowerCase();
            return (
              status.includes("laptop refurbished") ||
              status.includes("to be dispatch") ||
              status.includes("allocated") ||
              status.includes("distributed")
            );
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
      if (donorName && metric !== "ngoPartners" && metric !== "pickupRequests" && metric !== "ngosServed") {
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
  const displayMetricType = isStandalone ? standaloneMetricType : metricType;
  const displayOrganization = isStandalone ? donorName : selectedOrganization;

  const getTableHeaders = () => {
    switch (displayMetricType) {
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
      case "pickupRequests":
      case "inTransit":
      case "received":
      case "refurbishmentStarted":
      case "toBeDispatch":
      case "allocated":
      case "distributed":
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

    let dataToDisplay = displayData;
    
    if (displayMetricType === "activeBeneficiaries") {
      dataToDisplay = activeTab === 0 ? userData : preData;
    }

    const currentData = dataToDisplay ? dataToDisplay.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : [];

    const laptopMetrics = [
      "totalLaptops", "refurbished", "distributed", "activeUsage",
      "laptopreceived", "laptoprefurbished", "tobedispatch",
      "refurbishmentstarted", "notworking", "intransit", "allocated"
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
      {/* Header with Back Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
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

      {/* Data Table */}
      <Card sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
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
            count={displayMetricType === "activeBeneficiaries" 
              ? (activeTab === 0 ? userData.length : preData.length)
              : (displayData?.length || 0)}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default TableView;