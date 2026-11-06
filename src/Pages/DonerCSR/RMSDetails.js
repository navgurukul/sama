import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Paper,
  Chip,
  Stack,
  TablePagination,
  Tabs,
  Tab,
  LinearProgress,
  Button,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Building,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  Download,
  Search,
  ArrowRight,
  Filter,
  X,
  ExternalLink,
  ShieldCheck,
  Activity,
  Layers,
} from "lucide-react";
import RmsDetailsModal from "../../components/RmsDetailsModal/RmsDetailsModal";
import defaultNgosList from "./defaultRmsNgos.json";

const RMSDetails = () => {
  const [data, setData] = useState([]);
  const [ngoSummary, setNgoSummary] = useState(defaultNgosList || []);
  const [totals, setTotals] = useState({
    total_ngos: 89,
    total_laptops_allocated: 16868,
    total_rms_working: 6407,
    total_rms_not_working: 10461,
    overall_working_percentage: 38.0,
  });
  const [notWorkingDevices, setNotWorkingDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState(0); // 0: NGO Summary, 1: Inactive Laptops, 2: All Telemetry
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("ALL"); // ALL | HIGH | MODERATE | ZERO
  const [selectedNgoFilter, setSelectedNgoFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [rmsDetailsOpen, setRmsDetailsOpen] = useState(false);
  const [selectedRmsLaptop, setSelectedRmsLaptop] = useState(null);

  // Determine API base with resilient fallback
  const apiBase =
    window.location.hostname === "localhost"
      ? "http://localhost:8000"
      : "https://sama-api.thesama.in";

  // Helpers to read device keys safely
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
    row?.donor_company ||
    row?.donor_name ||
    row?.donorName ||
    row?.donor ||
    "";

  useEffect(() => {
    let isMounted = true;

    const fetchTelemetryData = async () => {
      setLoading(true);
      try {
        // 1. Fetch live NGO summary and not-working devices from backend
        let summaryData = null;
        try {
          const res = await fetch(`${apiBase}/api/rms/by-ngo?status_filter=not_working`);
          if (res.ok) {
            summaryData = await res.json();
          } else {
            throw new Error(`HTTP ${res.status}`);
          }
        } catch (localErr) {
          if (apiBase !== "https://sama-api.thesama.in") {
            try {
              const fallbackRes = await fetch(
                "https://sama-api.thesama.in/api/rms/by-ngo?status_filter=not_working"
              );
              if (fallbackRes.ok) {
                summaryData = await fallbackRes.json();
              }
            } catch (fbErr) {
              console.warn("Fallback RMS fetch error:", fbErr);
            }
          }
        }

        if (isMounted && summaryData) {
          if (summaryData.summary && summaryData.summary.length > 0) {
            setNgoSummary(summaryData.summary);
          }
          if (summaryData.totals) {
            setTotals(summaryData.totals);
          }
          if (summaryData.devices && summaryData.devices.length > 0) {
            setNotWorkingDevices(summaryData.devices);
          }
        }

        // 2. Fetch raw RMS devices from telemetry server
        try {
          const rmsRes = await fetch("https://rms-api.thesama.in/api/devices");
          if (rmsRes.ok) {
            const json = await rmsRes.json();
            const list = Array.isArray(json) ? json : json?.data || [];
            if (isMounted) setData(list);
          }
        } catch (e) {
          console.warn("Raw RMS telemetry fetch warning:", e);
        }
      } catch (err) {
        console.warn("Telemetry loading notice:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTelemetryData();

    return () => {
      isMounted = false;
    };
  }, [apiBase]);

  // Tab 0: Filtered NGO Summary
  const filteredNgos = useMemo(() => {
    let result = ngoSummary;

    // Category filter
    if (selectedCategoryFilter === "HIGH") {
      result = result.filter((n) => n.active_percentage >= 70);
    } else if (selectedCategoryFilter === "MODERATE") {
      result = result.filter((n) => n.active_percentage >= 20 && n.active_percentage < 70);
    } else if (selectedCategoryFilter === "ZERO") {
      result = result.filter((n) => n.active_percentage === 0);
    }

    // Search query
    if (search.trim()) {
      const term = search.trim().toLowerCase();
      result = result.filter(
        (n) =>
          n.ngo_name.toLowerCase().includes(term) ||
          (n.associated_donors &&
            n.associated_donors.join(" ").toLowerCase().includes(term))
      );
    }

    return result;
  }, [ngoSummary, selectedCategoryFilter, search]);

  // Category counts for quick-filter pills
  const categoryCounts = useMemo(() => {
    let high = 0;
    let moderate = 0;
    let zero = 0;
    ngoSummary.forEach((n) => {
      if (n.active_percentage >= 70) high++;
      else if (n.active_percentage >= 20) moderate++;
      else if (n.active_percentage === 0) zero++;
    });
    return {
      all: ngoSummary.length,
      high,
      moderate,
      zero,
    };
  }, [ngoSummary]);

  // Tab 1: Filtered Inactive Devices
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

  // Tab 2: Filtered All Devices
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

  // Active dataset length for pagination
  const activeDatasetLength =
    activeTab === 0
      ? filteredNgos.length
      : activeTab === 1
      ? filteredNotWorking.length
      : filteredAllDevices.length;

  // Reset pagination on filter or tab change
  useEffect(() => {
    setPage(0);
  }, [search, activeTab, selectedCategoryFilter, selectedNgoFilter, rowsPerPage]);

  // Paged subsets
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
    window.open("/Laptops_RMS_Not_Working_Clean.csv", "_blank");
  };

  const handleDownloadNgoSummaryCsv = () => {
    window.open("/NGO_RMS_Status_Report.csv", "_blank");
  };

  const handleViewNgoDevices = (ngoName) => {
    setSelectedNgoFilter(ngoName);
    setActiveTab(1);
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
    <Box sx={{ width: "100%", pb: 8 }}>
      {/* 1. Header & Quick Actions */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          flexWrap: "wrap",
          gap: 2,
          mb: 3.5,
        }}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: "#1A1A1A",
                letterSpacing: "-0.01em",
                fontSize: { xs: 22, md: 26 },
              }}
            >
              RMS Telemetry &amp; NGO Monitoring
            </Typography>
            <Chip
              icon={<Activity size={13} color="#2E7D32" />}
              label="Live Telemetry"
              size="small"
              sx={{
                bgcolor: "rgba(46, 125, 50, 0.08)",
                color: "#2E7D32",
                fontWeight: 700,
                fontSize: "11px",
                height: 24,
                border: "1px solid rgba(46, 125, 50, 0.18)",
              }}
            />
          </Stack>
          <Typography variant="body2" sx={{ color: "#666", fontSize: 14 }}>
            Audit live laptop adoption, monitor health metrics across 89 verified partners, and identify inactive hardware.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          <Button
            variant="contained"
            startIcon={<Download size={16} />}
            onClick={handleDownloadNgoSummaryCsv}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              fontSize: "13.5px",
              bgcolor: "#5C785A",
              color: "#FFF",
              borderRadius: "8px",
              px: 2,
              py: 0.9,
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              "&:hover": { bgcolor: "#465F44" },
            }}
          >
            Download NGO Summary (CSV)
          </Button>

          <Button
            variant="outlined"
            startIcon={<Download size={16} />}
            onClick={handleDownloadNotWorkingCsv}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              fontSize: "13.5px",
              borderColor: "#D1D5DB",
              color: "#374151",
              bgcolor: "#FFF",
              borderRadius: "8px",
              px: 2,
              py: 0.9,
              "&:hover": { bgcolor: "#F9FAFB", borderColor: "#9CA3AF" },
            }}
          >
            Export Inactive Laptops (CSV)
          </Button>
        </Stack>
      </Box>

      {/* 2. Cohesive, Dynamic Metric Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            lg: "repeat(4, 1fr)",
          },
          gap: 2.5,
          mb: 3.5,
        }}
      >
        {/* Card 1: Partner NGOs */}
        <Card
          sx={{
            borderRadius: "12px",
            border: "1px solid #E5E7EB",
            bgcolor: "#FFF",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            transition: "transform 0.2s, box-shadow 0.2s",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 6px 14px rgba(0,0,0,0.07)",
            },
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#6B7280", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Partner NGOs Analyzed
              </Typography>
              <Box sx={{ width: 34, height: 34, borderRadius: "8px", bgcolor: "rgba(59, 130, 246, 0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Building size={18} color="#2563EB" />
              </Box>
            </Box>
            <Typography sx={{ fontSize: 32, fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>
              {totals?.total_ngos || 89}
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#6B7280", mt: 0.75 }}>
              Verified deployment partners nationwide
            </Typography>
          </CardContent>
        </Card>

        {/* Card 2: Laptops Allocated */}
        <Card
          sx={{
            borderRadius: "12px",
            border: "1px solid #E5E7EB",
            bgcolor: "#FFF",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            transition: "transform 0.2s, box-shadow 0.2s",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 6px 14px rgba(0,0,0,0.07)",
            },
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#6B7280", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Total Laptops Allocated
              </Typography>
              <Box sx={{ width: 34, height: 34, borderRadius: "8px", bgcolor: "rgba(99, 102, 241, 0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Laptop size={18} color="#4F46E5" />
              </Box>
            </Box>
            <Typography sx={{ fontSize: 32, fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>
              {(totals?.total_laptops_allocated || 16868).toLocaleString("en-IN")}
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#6B7280", mt: 0.75 }}>
              100% mapped to receiving organisations
            </Typography>
          </CardContent>
        </Card>

        {/* Card 3: RMS Working */}
        <Card
          sx={{
            borderRadius: "12px",
            border: "1px solid #E5E7EB",
            bgcolor: "#FFF",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            transition: "transform 0.2s, box-shadow 0.2s",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 6px 14px rgba(0,0,0,0.07)",
            },
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#059669", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                RMS Working (Active)
              </Typography>
              <Box sx={{ width: 34, height: 34, borderRadius: "8px", bgcolor: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle2 size={18} color="#059669" />
              </Box>
            </Box>
            <Typography sx={{ fontSize: 32, fontWeight: 700, color: "#059669", lineHeight: 1.2 }}>
              {(totals?.total_rms_working || 6407).toLocaleString("en-IN")}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
              <Box sx={{ flexGrow: 1, height: 6, bgcolor: "#E5E7EB", borderRadius: 3, overflow: "hidden" }}>
                <Box
                  sx={{
                    width: `${totals?.overall_working_percentage || 38.0}%`,
                    height: "100%",
                    bgcolor: "#10B981",
                    borderRadius: 3,
                  }}
                />
              </Box>
              <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "#059669" }}>
                {totals?.overall_working_percentage || 38.0}%
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        {/* Card 4: RMS Not Working / Missing */}
        <Card
          sx={{
            borderRadius: "12px",
            border: "1px solid #E5E7EB",
            bgcolor: "#FFF",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            transition: "transform 0.2s, box-shadow 0.2s",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 6px 14px rgba(0,0,0,0.07)",
            },
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#DC2626", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                RMS Not Working / Missing
              </Typography>
              <Box sx={{ width: 34, height: 34, borderRadius: "8px", bgcolor: "rgba(239, 68, 68, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AlertTriangle size={18} color="#DC2626" />
              </Box>
            </Box>
            <Typography sx={{ fontSize: 32, fontWeight: 700, color: "#DC2626", lineHeight: 1.2 }}>
              {(totals?.total_rms_not_working || 10461).toLocaleString("en-IN")}
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#6B7280", mt: 0.75 }}>
              Requires installation or ground follow-up
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* 3. Navigation Tabs, Search & Quick Filters Toolbar */}
      <Card
        sx={{
          mb: 3,
          borderRadius: "12px",
          border: "1px solid #E5E7EB",
          bgcolor: "#FFF",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          overflow: "visible",
        }}
      >
        {/* Main Tabs */}
        <Box sx={{ borderBottom: "1px solid #E5E7EB", px: 2.5, pt: 1.5 }}>
          <Tabs
            value={activeTab}
            onChange={(_e, val) => {
              setActiveTab(val);
              if (val === 0) setSelectedNgoFilter("");
            }}
            textColor="inherit"
            TabIndicatorProps={{
              style: {
                backgroundColor: "#5C785A",
                height: 3,
                borderRadius: "3px 3px 0 0",
              },
            }}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Building size={16} />
                  <span>NGO Summary Overview</span>
                  <Chip
                    label={ngoSummary.length || 89}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: 11,
                      fontWeight: 700,
                      bgcolor: activeTab === 0 ? "#5C785A" : "#F3F4F6",
                      color: activeTab === 0 ? "#FFF" : "#4B5563",
                    }}
                  />
                </Stack>
              }
              sx={{
                fontWeight: activeTab === 0 ? 700 : 500,
                color: activeTab === 0 ? "#111827" : "#6B7280",
                textTransform: "none",
                fontSize: "14px",
                py: 1.8,
              }}
            />

            <Tab
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <AlertTriangle size={16} color={activeTab === 1 ? "#DC2626" : "#6B7280"} />
                  <span>Missing / Inactive Laptops</span>
                  <Chip
                    label={(totals?.total_rms_not_working || 10461).toLocaleString("en-IN")}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: 11,
                      fontWeight: 700,
                      bgcolor: activeTab === 1 ? "rgba(220, 38, 38, 0.12)" : "#F3F4F6",
                      color: activeTab === 1 ? "#DC2626" : "#4B5563",
                    }}
                  />
                </Stack>
              }
              sx={{
                fontWeight: activeTab === 1 ? 700 : 500,
                color: activeTab === 1 ? "#DC2626" : "#6B7280",
                textTransform: "none",
                fontSize: "14px",
                py: 1.8,
              }}
            />

            <Tab
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Layers size={16} />
                  <span>All Telemetry Stream</span>
                  <Chip
                    label={data.length > 0 ? data.length.toLocaleString("en-IN") : "9,092"}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: 11,
                      fontWeight: 700,
                      bgcolor: activeTab === 2 ? "#5C785A" : "#F3F4F6",
                      color: activeTab === 2 ? "#FFF" : "#4B5563",
                    }}
                  />
                </Stack>
              }
              sx={{
                fontWeight: activeTab === 2 ? 700 : 500,
                color: activeTab === 2 ? "#111827" : "#6B7280",
                textTransform: "none",
                fontSize: "14px",
                py: 1.8,
              }}
            />
          </Tabs>
        </Box>

        {/* Toolbar: Search & Quick Filters */}
        <Box sx={{ p: 2.5 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
            spacing={2}
          >
            {/* Search Input */}
            <TextField
              placeholder={
                activeTab === 0
                  ? "Search by NGO Name or Donor..."
                  : "Search by Serial Number, NGO, Model or Donor..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={16} color="#9CA3AF" />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearch("")}>
                      <X size={14} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
              sx={{
                width: { xs: "100%", md: 400 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  bgcolor: "#FAFAFA",
                },
              }}
            />

            {/* Quick Filter Pills (for Tab 0) */}
            {activeTab === 0 && (
              <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                <Typography sx={{ fontSize: 13, color: "#6B7280", fontWeight: 500, mr: 0.5 }}>
                  Filter Status:
                </Typography>
                {[
                  { id: "ALL", label: `All (${categoryCounts.all})` },
                  { id: "HIGH", label: `🟢 High >70% (${categoryCounts.high})`, color: "#059669" },
                  { id: "MODERATE", label: `🟡 Moderate 20–60% (${categoryCounts.moderate})`, color: "#D97706" },
                  { id: "ZERO", label: `🔴 Zero 0% (${categoryCounts.zero})`, color: "#DC2626" },
                ].map((pill) => {
                  const isSelected = selectedCategoryFilter === pill.id;
                  return (
                    <Chip
                      key={pill.id}
                      label={pill.label}
                      onClick={() => setSelectedCategoryFilter(pill.id)}
                      clickable
                      sx={{
                        fontWeight: isSelected ? 700 : 500,
                        fontSize: "12.5px",
                        bgcolor: isSelected ? (pill.color ? `${pill.color}15` : "#E5E7EB") : "#F3F4F6",
                        color: isSelected ? pill.color || "#111827" : "#4B5563",
                        border: isSelected ? `1px solid ${pill.color || "#9CA3AF"}` : "1px solid transparent",
                        height: 28,
                        "&:hover": { bgcolor: "#E5E7EB" },
                      }}
                    />
                  );
                })}
              </Stack>
            )}

            {/* If filtered by NGO in Tab 1 */}
            {activeTab === 1 && selectedNgoFilter && (
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={`Filtering NGO: ${selectedNgoFilter}`}
                  onDelete={() => setSelectedNgoFilter("")}
                  color="primary"
                  sx={{ fontWeight: 600, fontSize: "12.5px" }}
                />
              </Stack>
            )}

            {/* Active Count Badge */}
            <Chip
              label={`${activeDatasetLength} records`}
              size="small"
              sx={{
                bgcolor: "#F3F4F6",
                color: "#374151",
                fontWeight: 600,
                fontSize: "12px",
                alignSelf: { xs: "flex-start", md: "center" },
              }}
            />
          </Stack>
        </Box>
      </Card>

      {/* 4. Main Tables Area */}
      <Card
        sx={{
          borderRadius: "12px",
          border: "1px solid #E5E7EB",
          bgcolor: "#FFF",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          overflow: "hidden",
        }}
      >
        {/* TAB 0: NGO Summary Table */}
        {activeTab === 0 && (
          <TableContainer component={Paper} elevation={0}>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, py: 1.8, color: "#374151", fontSize: "13px" }}>
                    NGO Partner Name
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: "#374151", fontSize: "13px" }}>
                    Allocated
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: "#059669", fontSize: "13px" }}>
                    RMS Working
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: "#DC2626", fontSize: "13px" }}>
                    Not Reporting
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: "#374151", fontSize: "13px", minWidth: 150 }}>
                    Telemetry Health
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: "#374151", fontSize: "13px" }}>
                    Usage Hours
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: "#374151", fontSize: "13px" }}>
                    Status
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: "#374151", fontSize: "13px" }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pagedNgos.map((ngo, idx) => {
                  const pct = ngo.active_percentage;
                  const isHigh = pct >= 70;
                  const isModerate = pct >= 20 && pct < 70;
                  const isZero = pct === 0;

                  return (
                    <TableRow
                      key={idx}
                      hover
                      sx={{
                        "&:hover": { bgcolor: "#F9FAFB" },
                        borderBottom: "1px solid #F3F4F6",
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600, color: "#111827", py: 1.5 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: "13.5px", color: "#111827" }}>
                          {ngo.ngo_name}
                        </Typography>
                        {ngo.associated_donors && ngo.associated_donors.length > 0 && (
                          <Typography sx={{ fontSize: "11.5px", color: "#6B7280", mt: 0.25 }}>
                            Donor: {ngo.associated_donors.slice(0, 2).join(", ")}
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell align="center" sx={{ fontWeight: 600, color: "#111827", fontSize: "13.5px" }}>
                        {ngo.total_allocated.toLocaleString("en-IN")}
                      </TableCell>

                      <TableCell align="center" sx={{ fontWeight: 700, color: "#059669", fontSize: "13.5px" }}>
                        {ngo.rms_working.toLocaleString("en-IN")}
                      </TableCell>

                      <TableCell align="center" sx={{ fontWeight: 700, color: "#DC2626", fontSize: "13.5px" }}>
                        {ngo.rms_not_working.toLocaleString("en-IN")}
                      </TableCell>

                      {/* Visual Health Progress */}
                      <TableCell align="center">
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ width: 140, mx: "auto" }}>
                          <Box sx={{ flexGrow: 1, height: 6, bgcolor: "#E5E7EB", borderRadius: 3, overflow: "hidden" }}>
                            <Box
                              sx={{
                                width: `${pct}%`,
                                height: "100%",
                                bgcolor: isHigh ? "#10B981" : isModerate ? "#F59E0B" : "#EF4444",
                                borderRadius: 3,
                              }}
                            />
                          </Box>
                          <Typography sx={{ fontSize: "12px", fontWeight: 700, color: isHigh ? "#059669" : isModerate ? "#D97706" : "#DC2626", minWidth: 38, textAlign: "right" }}>
                            {pct}%
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell align="center" sx={{ fontSize: "12.5px", color: "#4B5563" }}>
                        {typeof ngo.total_usage_hours === "number"
                          ? `${ngo.total_usage_hours.toLocaleString("en-IN")} hrs`
                          : ngo.total_usage_hours || "0 hrs"}
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell align="center">
                        <Chip
                          label={isHigh ? "High Adoption" : isModerate ? "Moderate" : isZero ? "Zero Signal" : "Low"}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: "11px",
                            height: 22,
                            bgcolor: isHigh
                              ? "rgba(16, 185, 129, 0.1)"
                              : isModerate
                              ? "rgba(245, 158, 11, 0.1)"
                              : "rgba(239, 68, 68, 0.1)",
                            color: isHigh ? "#059669" : isModerate ? "#B45309" : "#B91C1C",
                          }}
                        />
                      </TableCell>

                      {/* Action */}
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => handleViewNgoDevices(ngo.ngo_name)}
                          endIcon={<ArrowRight size={14} />}
                          sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            fontSize: "12px",
                            color: isZero ? "#DC2626" : "#5C785A",
                            py: 0.3,
                            px: 1,
                            "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
                          }}
                        >
                          View Inactive ({ngo.rms_not_working})
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* TAB 1: Missing / Inactive Laptops Table */}
        {activeTab === 1 && (
          <TableContainer component={Paper} elevation={0}>
            {selectedNgoFilter && (
              <Box sx={{ p: 2, bgcolor: "#F9FAFB", borderBottom: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ fontSize: "13.5px", color: "#374151" }}>
                  Showing inactive laptops allocated to <b>{selectedNgoFilter}</b>
                </Typography>
                <Button size="small" variant="outlined" onClick={() => setSelectedNgoFilter("")} sx={{ textTransform: "none", fontSize: "12px" }}>
                  Show All NGOs
                </Button>
              </Box>
            )}
            <Table size="small">
              <TableHead sx={{ bgcolor: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, py: 1.8, color: "#374151", fontSize: "13px" }}>
                    Serial Number
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151", fontSize: "13px" }}>
                    Assigned NGO
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151", fontSize: "13px" }}>
                    Status / Diagnosis
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151", fontSize: "13px" }}>
                    Laptop Model
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151", fontSize: "13px" }}>
                    Donor
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151", fontSize: "13px" }}>
                    Action Needed
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151", fontSize: "13px" }}>
                    Last Ping
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pagedNotWorking.map((row, idx) => (
                  <TableRow
                    key={idx}
                    hover
                    sx={{
                      "&:hover": { bgcolor: "#F9FAFB" },
                      borderBottom: "1px solid #F3F4F6",
                    }}
                  >
                    <TableCell sx={{ fontWeight: 700, fontFamily: "ui-monospace, monospace", fontSize: "13px", color: "#111827", py: 1.4 }}>
                      {row.serial_number}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: "13px", color: "#374151" }}>
                      {row.ngo_name}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.rms_status === "INACTIVE" ? "Inactive Telemetry" : "Never Reported / Missing"}
                        size="small"
                        sx={{
                          fontSize: "11px",
                          fontWeight: 700,
                          bgcolor: row.rms_status === "INACTIVE" ? "rgba(245, 158, 11, 0.1)" : "rgba(239, 68, 68, 0.1)",
                          color: row.rms_status === "INACTIVE" ? "#B45309" : "#B91C1C",
                          height: 22,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: "12.5px", color: "#4B5563" }}>
                      {row.manufacturer_model || "Standard Laptop"}
                    </TableCell>
                    <TableCell sx={{ fontSize: "12.5px", color: "#4B5563" }}>
                      {row.donor_company || "Corporate Partner"}
                    </TableCell>
                    <TableCell sx={{ fontSize: "12px", color: "#6B7280" }}>
                      {row.rms_status === "INACTIVE"
                        ? "Check device power & WiFi connection"
                        : "Verify deployment / install client"}
                    </TableCell>
                    <TableCell sx={{ color: "#6B7280", fontSize: "12px" }}>
                      {row.last_rms_ping || "Never"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* TAB 2: All Telemetry Stream Table */}
        {activeTab === 2 && (
          <TableContainer component={Paper} elevation={0}>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, py: 1.8, color: "#374151", fontSize: "13px" }}>
                    Serial Number
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151", fontSize: "13px" }}>
                    MAC Address
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151", fontSize: "13px" }}>
                    Assigned NGO
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151", fontSize: "13px" }}>
                    Donor
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: "#374151", fontSize: "13px" }}>
                    Telemetry State
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: "#374151", fontSize: "13px" }}>
                    Usage
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: "#374151", fontSize: "13px" }}>
                    Inspect
                  </TableCell>
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
                    <TableRow
                      key={idx}
                      hover
                      sx={{
                        "&:hover": { bgcolor: "#F9FAFB" },
                        borderBottom: "1px solid #F3F4F6",
                      }}
                    >
                      <TableCell sx={{ fontWeight: 700, fontFamily: "ui-monospace, monospace", fontSize: "13px", color: "#111827", py: 1.4 }}>
                        {sn}
                      </TableCell>
                      <TableCell sx={{ fontFamily: "ui-monospace, monospace", fontSize: "12px", color: "#6B7280" }}>
                        {mac || "—"}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: "13px", color: "#374151" }}>
                        {ngo || "Unassigned / General"}
                      </TableCell>
                      <TableCell sx={{ fontSize: "12.5px", color: "#6B7280" }}>
                        {donor || "—"}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={isActive ? "ACTIVE PING" : "OFFLINE"}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: "11px",
                            height: 22,
                            bgcolor: isActive ? "rgba(16, 185, 129, 0.1)" : "#F3F4F6",
                            color: isActive ? "#059669" : "#6B7280",
                          }}
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "12.5px", color: "#4B5563" }}>
                        {row.total_usage_minutes ? `${Math.round(row.total_usage_minutes / 60)} hrs` : "0 hrs"}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleRmsDetailsClick(row)}
                          sx={{
                            textTransform: "none",
                            fontSize: "12px",
                            borderColor: "#D1D5DB",
                            color: "#374151",
                            py: 0.3,
                            px: 1,
                            "&:hover": { bgcolor: "#F9FAFB", borderColor: "#9CA3AF" },
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
          sx={{
            px: 2,
            py: 1,
            borderTop: "1px solid #E5E7EB",
            bgcolor: "#FFF",
          }}
        />
      </Card>

      {/* RMS Details Modal */}
      <RmsDetailsModal
        open={rmsDetailsOpen}
        onClose={handleRmsDetailsClose}
        laptopData={selectedRmsLaptop}
      />
    </Box>
  );
};

export default RMSDetails;
