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

  const [standaloneData, setStandaloneData] = useState([]);
  const [standaloneMetricType, setStandaloneMetricType] = useState(null);
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  const isStandalone = !metricType && !onBack;

  useEffect(() => {
    if (isStandalone) {
      const searchParams = new URLSearchParams(location.search);
      const urlMetricType = searchParams.get('metric') || 'totalLaptops';
      setStandaloneMetricType(urlMetricType);

      fetchStandaloneData(urlMetricType);
    }
  }, [isStandalone, donorName, location.search]);
  const parseDateUniversal = (dateString) => {
    if (!dateString) return null;

    // Try parsing as ISO date
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) return date;

    // Try parsing as DD/MM/YYYY
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const newDate = new Date(year, month, day);
      if (!isNaN(newDate.getTime())) return newDate;
    }

    return null;
  };

  const fetchStandaloneData = async (metric) => {
    try {
      console.log(`Fetching data for metric: ${metric}`);
      let apiUrl = '';
      let filterFunction = null;

      switch (metric) {
        case "totalLaptops":
          apiUrl = `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`;
          break;
        case "refurbished":
        case "totalProcessed":
          apiUrl = `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`;
          filterFunction = (data) => data.filter(laptop => {
            const status = (laptop.Status || "").toLowerCase();
            return status.includes("refurbished") ||
              status.includes("to be dispatch") ||
              status.includes("allocated") ||
              status.includes("distributed");
          });
          break;
        case "pickupRequests":
          apiUrl = `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=pickupget`;
          filterFunction = (responseData) => {
            let data = [];
            if (responseData && responseData.status === "success" && Array.isArray(responseData.data)) {
              data = responseData.data;
            } else {
              data = responseData || [];
            }
            const pendingPickups = data.filter(p => p.Status === "Pending");
            console.log(`Pickup requests filtered to Pending status: ${data.length} -> ${pendingPickups.length}`);
            return pendingPickups;

          };
          break;
        case "distributed":
          apiUrl = `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`;
          filterFunction = (data) => data.filter(laptop =>
            (laptop.Status || "").toLowerCase().includes("distributed")
          );
          break;
        case "activeUsage":
          apiUrl = `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`;
          filterFunction = (data) => data.filter(laptop => {
            const d = parseDateUniversal(laptop["Date"]);
            if (!d) return false;
            const diffDays = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
            return diffDays <= 15;
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
      console.log(`Raw data received for ${metric}:`, data);

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
            console.log(`NGOs with laptops filter: ${beforeFilter} -> ${data.length} items`);
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
        console.log(`Donor filter applied for ${metric}: ${beforeFilter} -> ${data.length} items`);
      }

      if (donorName && metric === "pickupRequests") {
        const beforeFilter = data.length;
        data = data.filter(item =>
          String(item["Donor Company"] || "").trim().toLowerCase() === donorName.toLowerCase()
        );
        console.log(`Donor filter applied for ${metric}: ${beforeFilter} -> ${data.length} items`);
      }
      if (filterFunction && metric !== "pickupRequests") {
        const beforeFilter = data.length;
        data = filterFunction(data);
        console.log(`Metric filter applied for ${metric}: ${beforeFilter} -> ${data.length} items`);
      }
      if (donorName && (metric === "ngoPartners" || metric === "ngosServed")) {
        const beforeFilter = data.length;
        data = data.filter(ngo =>
          String(ngo.Doner || ngo.Donor || "").trim().toLowerCase() === donorName.toLowerCase()
        );
        console.log(`Donor filter applied for ${metric}: ${beforeFilter} -> ${data.length} items`);
      }
      console.log(`Final data for ${metric}:`, data);
      setStandaloneData(data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setStandaloneData([]);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleBack = () => {
    if (isStandalone) {
      if (donorName) {
        navigate(`/donorcsr/${donorName}/overview`);
      } else {
        navigate('/donorcsr/overview');
      }
    } else {
      onBack();
    }
  };

  const displayData = isStandalone ? standaloneData : data;
  const displayMetricType = isStandalone ? standaloneMetricType : metricType;
  const displayOrganization = isStandalone ? donorName : selectedOrganization;

  const getTableHeaders = () => {
    switch (displayMetricType) {
      case "totalLaptops":
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
      case "refurbished":
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
    switch (displayMetricType) {
      case "totalLaptops":
        return "All Laptops Data";
      case "refurbished":
        return "Refurbished Laptops Data";
      case "pickupRequests":
        return "Pickup Requests Data";
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
    const currentData = displayData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    switch (displayMetricType) {
      case "totalLaptops":
      case "refurbished":
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
            <TableCell>{laptop.Working ? "Yes" : "No"}</TableCell>
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

      case "pickupRequests":
        return currentData.map((pickup, index) => (
          <TableRow key={index} hover>
            <TableCell>{pickup["Pickup ID"] || pickup.PickupID || 'N/A'}</TableCell>
            <TableCell>{pickup["Donor Company"] || 'N/A'}</TableCell>
            <TableCell>{pickup["Number of Laptops"] || 'N/A'}</TableCell>
            <TableCell>
              <Chip
                label={pickup.Status || 'Unknown'}
                size="small"
                color={getStatusColor(pickup.Status)}
                variant="outlined"
              />
            </TableCell>
            <TableCell>{pickup["Current Date & Time"] || pickup.PickupDate || 'N/A'}</TableCell>
            <TableCell>{pickup["Contact Person"] || 'N/A'}</TableCell>
          </TableRow>
        ));

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
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Total Records: {displayData.length}
            </Typography>
          </Box>

          <Table size="small" sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                {getTableHeaders()}
              </TableRow>
            </TableHead>
            <TableBody>
              {displayData.length > 0 ? (
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

          {displayData.length > rowsPerPage && (
            <TablePagination
              component="div"
              count={displayData.length}
              page={page}
              onPageChange={handlePageChange}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[10]}
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default TableView;