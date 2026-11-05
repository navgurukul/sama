import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  Paper,
  Chip,
  Stack,
  TablePagination,
  Tabs,
  Tab,
  LinearProgress,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RmsDetailsModal from "../../components/RmsDetailsModal/RmsDetailsModal";
import { Container } from "@mui/material";

const RMSDetails = () => {
  const [data, setData] = useState([]);
  const [ngoSummary, setNgoSummary] = useState([]);
  const [totals, setTotals] = useState(null);
  const [notWorkingDevices, setNotWorkingDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState(0); // 0: NGO Summary, 1: Missing/Inactive Devices, 2: All Telemetry Devices
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [rmsDetailsOpen, setRmsDetailsOpen] = useState(false);
  const [selectedRmsLaptop, setSelectedRmsLaptop] = useState(null);
  const [selectedNgoFilter, setSelectedNgoFilter] = useState("");

  const apiBase =
    window.location.hostname === "localhost"
      ? "http://localhost:8000"
      : "https://sama-api.thesama.in";

  // Helpers to read keys
  const getSerial = (row) =>
    row?.serialNumber ||
    row?.SerialNumber ||
    row?.serial ||
    row?.serial_number ||
    row?.serial_no ||
    row?.sn ||
    "";

  const getMac = (row) =>
    row?.macAddress ||
    row?.mac ||
    row?.MacAddress ||
    row?.mac_address ||
    row?.macaddress ||
    "";

  const getNgoName = (row) =>
    row?.ngo_name ||
    row?.ngoName ||
    row?.ngo ||
    row?.organisation ||
    row?.allocated_to ||
    "";

  const getDonorName = (row) =>
    row?.donor_name ||
    row?.donorName ||
    row?.donor ||
    row?.donor_company ||
    "";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        // 1. Fetch live NGO summary and not-working devices from backend
        try {
          const summaryRes = await fetch(`${apiBase}/api/rms/by-ngo?status_filter=not_working`);
          if (summaryRes.ok) {
            const summaryJson = await summaryRes.json();
            if (summaryJson) {
              setNgoSummary(summaryJson.summary || []);
              setTotals(summaryJson.totals || null);
              setNotWorkingDevices(summaryJson.devices || []);
            }
          }
        } catch (e) {
          console.warn("Backend NGO summary fetch error:", e);
        }

        // 2. Fetch raw RMS devices from RMS API
        let rmsDevices = [];
        try {
          const res = await fetch("https://rms-api.thesama.in/api/devices");
          if (res.ok) {
            const json = await res.json();
            rmsDevices = Array.isArray(json) ? json : json?.data || [];
          }
        } catch (e) {
          console.warn("RMS devices fetch error:", e);
        }

        setData(rmsDevices);
      } catch (err) {
        setError(err.message || "Unable to load RMS details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiBase]);

  // Tab 0: Filtered NGO Summary
  const filteredNgos = useMemo(() => {
    if (!search.trim()) return ngoSummary;
    const term = search.trim().toLowerCase();
    return ngoSummary.filter(
      (n) =>
        n.ngo_name.toLowerCase().includes(term) ||
        (n.associated_donors &&
          n.associated_donors.join(" ").toLowerCase().includes(term))
    );
  }, [ngoSummary, search]);

  // Tab 1: Filtered Missing / Inactive devices
  const filteredNotWorking = useMemo(() => {
    let rows = notWorkingDevices;
    if (selectedNgoFilter) {
      rows = rows.filter(
        (r) =>
          r.ngo_name.toLowerCase().trim() ===
          selectedNgoFilter.toLowerCase().trim()
      );
    }
    if (!search.trim()) return rows;
    const term = search.trim().toLowerCase();
    return rows.filter((r) => {
      return (
        String(r.serial_number || "").toLowerCase().includes(term) ||
        String(r.ngo_name || "").toLowerCase().includes(term) ||
        String(r.donor_company || "").toLowerCase().includes(term) ||
        String(r.manufacturer_model || "").toLowerCase().includes(term) ||
        String(r.rms_status || "").toLowerCase().includes(term)
      );
    });
  }, [notWorkingDevices, search, selectedNgoFilter]);

  // Tab 2: Filtered All RMS telemetry devices
  const filteredAllDevices = useMemo(() => {
    if (!search.trim()) return data;
    const term = search.trim().toLowerCase();
    return data.filter((row) => {
      const serial = String(getSerial(row)).toLowerCase();
      const mac = String(getMac(row)).toLowerCase();
      const ngo = String(getNgoName(row)).toLowerCase();
      const donor = String(getDonorName(row)).toLowerCase();
      return (
        serial.includes(term) ||
        mac.includes(term) ||
        ngo.includes(term) ||
        donor.includes(term)
      );
    });
  }, [data, search]);

  // Current dataset based on tab
  const activeDatasetLength =
    activeTab === 0
      ? filteredNgos.length
      : activeTab === 1
      ? filteredNotWorking.length
      : filteredAllDevices.length;

  // Reset page when tab or search changes
  useEffect(() => {
    setPage(0);
  }, [search, activeTab, selectedNgoFilter, rowsPerPage]);

  // Pagination slice
  const pagedNgos = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredNgos.slice(start, start + rowsPerPage);
  }, [filteredNgos, page, rowsPerPage]);

  const pagedNotWorking = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredNotWorking.slice(start, start + rowsPerPage);
  }, [filteredNotWorking, page, rowsPerPage]);

  const pagedAllDevices = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredAllDevices.slice(start, start + rowsPerPage);
  }, [filteredAllDevices, page, rowsPerPage]);

  // Download Handlers
  const handleDownloadNotWorkingCsv = () => {
    window.open(
      "/Laptops_RMS_Not_Working_Or_Missing_Detailed_Report.csv",
      "_blank"
    );
  };

  const handleDownloadNgoSummaryCsv = () => {
    window.open("/NGO_RMS_Summary_Report.csv", "_blank");
  };

  const handleViewNgoDevices = (ngoName) => {
    setSelectedNgoFilter(ngoName);
    setActiveTab(1); // Switch to not working devices view
  };

  const handleRmsDetailsClick = (row) => {
    setSelectedRmsLaptop(row);
    setRmsDetailsOpen(true);
  };

  const handleRmsDetailsClose = () => {
    setRmsDetailsOpen(false);
    setSelectedRmsLaptop(null);
  };

  return (
    <Container disableGutters maxWidth="xl" sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
      {/* Header & Title */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} color="#2e7d32">
            RMS Telemetry &amp; NGO Monitoring
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            Audit RMS performance across partner NGOs: track where RMS is active,
            inactive, or missing.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          <Button
            variant="contained"
            color="error"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadNotWorkingCsv}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              backgroundColor: "#c62828",
              "&:hover": { backgroundColor: "#b71c1c" },
            }}
          >
            Download Not Working CSV
          </Button>

          <Button
            variant="outlined"
            color="success"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadNgoSummaryCsv}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Download NGO Summary CSV
          </Button>
        </Stack>
      </Stack>

      {/* Top Stat Summary Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "repeat(4, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >
        <Card sx={{ border: "1px solid #e0e0e0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
              Partner NGOs Analyzed
            </Typography>
            <Typography variant="h4" fontWeight={700} color="#1b5e20" sx={{ mt: 0.5 }}>
              {totals?.total_ngos || ngoSummary.length || 89}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Verified deployment partners
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ border: "1px solid #e0e0e0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
              Total Laptops Allocated
            </Typography>
            <Typography variant="h4" fontWeight={700} color="#2e7d32" sx={{ mt: 0.5 }}>
              {(totals?.total_laptops_allocated || 16868).toLocaleString("en-IN")}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Mapped to registered NGOs
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ border: "1px solid #c8e6c9", bgcolor: "#f1f8e9", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <CardContent sx={{ p: 2.5 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <CheckCircleOutlineIcon color="success" fontSize="small" />
              <Typography variant="caption" color="success.dark" fontWeight={700} textTransform="uppercase">
                RMS Working (Active)
              </Typography>
            </Stack>
            <Typography variant="h4" fontWeight={700} color="#2e7d32" sx={{ mt: 0.5 }}>
              {(totals?.total_rms_working || 6407).toLocaleString("en-IN")}
            </Typography>
            <Typography variant="body2" color="success.dark" fontWeight={600} sx={{ mt: 0.5 }}>
              {totals?.overall_working_percentage || 38.0}% active telemetry rate
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ border: "1px solid #ffcdd2", bgcolor: "#ffebee", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <CardContent sx={{ p: 2.5 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <WarningAmberIcon color="error" fontSize="small" />
              <Typography variant="caption" color="error.dark" fontWeight={700} textTransform="uppercase">
                RMS Not Working / Missing
              </Typography>
            </Stack>
            <Typography variant="h4" fontWeight={700} color="#c62828" sx={{ mt: 0.5 }}>
              {(totals?.total_rms_not_working || 10461).toLocaleString("en-IN")}
            </Typography>
            <Typography variant="body2" color="error.dark" fontWeight={600} sx={{ mt: 0.5 }}>
              Requires installation / network check
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs & Search Navigation */}
      <Card sx={{ mb: 3, border: "1px solid #e0e0e0", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2, pt: 1 }}>
          <Tabs
            value={activeTab}
            onChange={(_e, val) => {
              setActiveTab(val);
              if (val === 0) setSelectedNgoFilter("");
            }}
            textColor="success"
            indicatorColor="success"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              label={`NGO Summary View (${ngoSummary.length || 89} NGOs)`}
              sx={{ fontWeight: 700, textTransform: "none", fontSize: "14.5px" }}
            />
            <Tab
              label={`Missing / Inactive Laptops (${totals?.total_rms_not_working || 10461})`}
              sx={{ fontWeight: 700, textTransform: "none", fontSize: "14.5px", color: "#c62828" }}
            />
            <Tab
              label={`All RMS Telemetry Devices (${data.length || 0})`}
              sx={{ fontWeight: 700, textTransform: "none", fontSize: "14.5px" }}
            />
          </Tabs>
        </Box>

        <CardContent sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap", py: 2 }}>
          <TextField
            label={
              activeTab === 0
                ? "Search by NGO Name or Donor"
                : "Search by Serial Number, NGO Name, Model or Donor"
            }
            placeholder="Type to filter rows..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ minWidth: { xs: "100%", sm: 360 }, maxWidth: 540 }}
          />

          {selectedNgoFilter && activeTab === 1 && (
            <Chip
              label={`Filtered by NGO: ${selectedNgoFilter}`}
              onDelete={() => setSelectedNgoFilter("")}
              color="primary"
              sx={{ fontWeight: 600 }}
            />
          )}

          <Chip
            label={`${activeDatasetLength} records`}
            sx={{ bgcolor: "rgba(46,125,50,0.08)", color: "#2e7d32", fontWeight: 700, ml: "auto" }}
          />
        </CardContent>
      </Card>

      {/* Main Content Area */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress color="success" />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Card sx={{ border: "1px solid #e0e0e0", boxShadow: "0 4px 16px rgba(0,0,0,0.05)", overflow: "hidden" }}>
          {/* TAB 0: NGO Summary Table */}
          {activeTab === 0 && (
            <TableContainer component={Paper} elevation={0}>
              <Table size="small">
                <TableHead sx={{ bgcolor: "rgba(46,125,50,0.08)" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, py: 1.5 }}>NGO Name</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Allocated</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: "#2e7d32" }}>RMS Working</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: "#c62828" }}>Not Working / Missing</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Working Rate</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Usage (Hours)</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Donors</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagedNgos.map((ngo, idx) => {
                    const isHigh = ngo.active_percentage >= 70;
                    const isLow = ngo.active_percentage === 0;
                    return (
                      <TableRow key={idx} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{ngo.ngo_name}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>{ngo.total_allocated}</TableCell>
                        <TableCell align="center" sx={{ color: "#2e7d32", fontWeight: 700 }}>
                          {ngo.rms_working}
                        </TableCell>
                        <TableCell align="center" sx={{ color: "#c62828", fontWeight: 700 }}>
                          {ngo.rms_not_working}
                        </TableCell>
                        <TableCell align="center" sx={{ minWidth: 140 }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Box sx={{ width: "100%", mr: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={ngo.active_percentage}
                                color={isHigh ? "success" : isLow ? "error" : "warning"}
                                sx={{ height: 6, borderRadius: 3 }}
                              />
                            </Box>
                            <Typography variant="caption" fontWeight={700}>
                              {ngo.active_percentage}%
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="center">{ngo.total_usage_hours}</TableCell>
                        <TableCell align="center" sx={{ fontSize: "12px", color: "text.secondary" }}>
                          {ngo.associated_donors?.slice(0, 2).join(", ") || "N/A"}
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            onClick={() => handleViewNgoDevices(ngo.ngo_name)}
                            sx={{ textTransform: "none", fontSize: "12px", py: 0.3, px: 1 }}
                          >
                            View Not Working ({ngo.rms_not_working})
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* TAB 1: Missing / Not Working Laptops Table */}
          {activeTab === 1 && (
            <TableContainer component={Paper} elevation={0}>
              <Table size="small">
                <TableHead sx={{ bgcolor: "rgba(198,40,40,0.08)" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Serial Number</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>NGO Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>RMS Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Model</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Donor</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Inventory Location</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Last RMS Ping</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagedNotWorking.map((row, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell sx={{ fontWeight: 700, fontFamily: "monospace" }}>
                        {row.serial_number}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{row.ngo_name}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.rms_status}
                          size="small"
                          color={row.rms_status.includes("INACTIVE") ? "warning" : "error"}
                          sx={{ fontSize: "11px", fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell>{row.manufacturer_model || "N/A"}</TableCell>
                      <TableCell>{row.donor_company || "N/A"}</TableCell>
                      <TableCell>{row.inventory_location || "N/A"}</TableCell>
                      <TableCell sx={{ color: "text.secondary", fontSize: "12px" }}>
                        {row.last_rms_ping}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* TAB 2: All Telemetry Devices Table */}
          {activeTab === 2 && (
            <TableContainer component={Paper} elevation={0}>
              <Table size="small">
                <TableHead sx={{ bgcolor: "rgba(46,125,50,0.08)" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Serial Number</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>MAC Address</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>NGO Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Donor</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Usage (Mins)</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagedAllDevices.map((row, idx) => {
                    const sn = getSerial(row);
                    const mac = getMac(row);
                    const ngo = getNgoName(row);
                    const donor = getDonorName(row);
                    const isActive = row.isactive !== false;

                    return (
                      <TableRow key={idx} hover>
                        <TableCell sx={{ fontWeight: 700, fontFamily: "monospace" }}>{sn}</TableCell>
                        <TableCell sx={{ fontFamily: "monospace", fontSize: "12px" }}>{mac}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{ngo || "—"}</TableCell>
                        <TableCell>{donor || "—"}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={isActive ? "ACTIVE" : "INACTIVE"}
                            size="small"
                            color={isActive ? "success" : "default"}
                            sx={{ fontWeight: 700, fontSize: "11px" }}
                          />
                        </TableCell>
                        <TableCell align="center">{row.total_usage_minutes || "0"}</TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleRmsDetailsClick(row)}
                            sx={{
                              backgroundColor: "#5C785A",
                              color: "white",
                              textTransform: "none",
                              fontSize: "12px",
                              py: 0.3,
                              px: 1,
                              "&:hover": { backgroundColor: "#2e7d32" },
                            }}
                          >
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Table Pagination */}
          <TablePagination
            component="div"
            count={activeDatasetLength}
            page={page}
            onPageChange={(_e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 15, 25, 50, 100]}
            labelRowsPerPage="Rows per page:"
            sx={{ px: 2, py: 1 }}
          />
        </Card>
      )}

      {/* RMS Details Modal */}
      <RmsDetailsModal
        open={rmsDetailsOpen}
        onClose={handleRmsDetailsClose}
        laptopData={selectedRmsLaptop}
      />
    </Container>
  );
};

export default RMSDetails;
