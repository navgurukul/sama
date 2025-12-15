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
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

const RMSDetails = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Try to gracefully read serial/mac regardless of key casing used by the API
  const getSerial = (row) =>
    row?.serialNumber ||
    row?.SerialNumber ||
    row?.serial ||
    row?.serial_no ||
    row?.serialnumber ||
    row?.serial_number ||
    row?.sn ||
    row?.["Serial Number"] ||
    row?.["serial number"] ||
    row?.["serial_number"] ||
    "";

  const getMac = (row) =>
    row?.macAddress ||
    row?.mac ||
    row?.MacAddress ||
    row?.mac_address ||
    row?.macaddress ||
    row?.["MAC Address"] ||
    row?.["mac address"] ||
    row?.["mac_address"] ||
    "";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("https://rms-api.thesama.in/api/devices");
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }
        const json = await res.json();
        // API could return { data: [...] } or an array directly
        const rows = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : [];
        setData(rows);
      } catch (err) {
        setError(err.message || "Unable to load RMS details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const term = search.trim().toLowerCase();
    return data.filter((row) => {
      const serial = String(getSerial(row)).toLowerCase();
      const mac = String(getMac(row)).toLowerCase();
      const fallback = JSON.stringify(row || {}).toLowerCase();
      return serial.includes(term) || mac.includes(term) || fallback.includes(term);
    });
  }, [data, search]);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(0);
  }, [search, rowsPerPage, data.length]);

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  // Generate columns from the first record for flexibility
  const columns = useMemo(() => {
    if (!filtered.length) return [];
    return Object.keys(filtered[0]);
  }, [filtered]);

  const formatValue = (val) => {
    if (val === null || val === undefined) return "";
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
  };

  const handleDownload = () => {
    const rowsToDownload = filtered.length ? filtered : data;
    if (!rowsToDownload.length || !columns.length) return;

    const csvRows = [];
    csvRows.push(columns.map((c) => `"${c.replace(/"/g, '""')}"`).join(","));

    rowsToDownload.forEach((row) => {
      const rowVals = columns.map((col) => {
        const value = formatValue(row[col]);
        const escaped = String(value).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(rowVals.join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "rms-details.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ width: "100%", overflowX: "hidden" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="#2e7d32">
            RMS Details
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View devices from RMS. Filter by Serial Number or MAC Address.
          </Typography>

          <Chip
          label={`Total Laptops: ${data.length || 0}`}
          color="success"
          sx={{ fontWeight: 600, mt: 1 }}
        />
        </Box>
       
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          sx={{ whiteSpace: "nowrap" }}
          disabled={!columns.length}
        >
          Download CSV
        </Button>
      </Stack>

      <Card
        sx={{
          mb: 2,
          mt: 2,
          boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
          border: "1px solid #e0e0e0",
        }}
      >
        <CardContent
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <TextField
            label="Search by Serial Number or MAC Address"
            placeholder="e.g. 12345ABC or AA:BB:CC:DD:EE:FF"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            size="small"
            sx={{
              minWidth: { xs: "100%", sm: 320 },
              maxWidth: { sm: 520 },
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
          {/* <Chip
            label={`${filtered.length} / ${data.length || 0} shown`}
            sx={{ bgcolor: "rgba(46,125,50,0.1)", color: "#2e7d32", fontWeight: 600 }}
          /> */}
        </CardContent>
      </Card>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Card
          sx={{
            boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
            border: "1px solid #e0e0e0",
            overflowX: "auto",
          }}
        >
          <CardContent sx={{ p: 0, overflowX: "auto" }}>
            {filtered.length === 0 ? (
              <Box p={3}>
                <Typography variant="body2" color="text.secondary">
                  No records found for the current search.
                </Typography>
              </Box>
            ) : (
              <>
                <Box
                  sx={{
                    width: "100%",
                    overflowX: "auto",
                    maxWidth: "100vw",
                  }}
                >
                  <TableContainer
                    component={Paper}
                    sx={{
                      minWidth: "100%",
                      overflowX: "auto",
                      maxWidth: "100%",
                    }}
                  >
                    <Table
                      size="small"
                      stickyHeader
                      sx={{
                        minWidth: 700,
                        tableLayout: "fixed",
                      }}
                    >
                    <TableHead>
                      <TableRow>
                        {columns.map((col) => (
                          <TableCell
                            key={col}
                            sx={{
                              fontWeight: 700,
                              textTransform: "capitalize",
                              bgcolor: "rgba(46,125,50,0.08)",
                            }}
                          >
                            {col}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pagedRows.map((row, idx) => (
                        <TableRow key={idx} hover>
                          {columns.map((col) => (
                            <TableCell key={col} sx={{ maxWidth: 260, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {typeof row[col] === "object" ? JSON.stringify(row[col]) : String(row[col] ?? "")}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
                <TablePagination
                  component="div"
                  count={filtered.length}
                  page={page}
                  onPageChange={(_e, newPage) => setPage(newPage)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  labelRowsPerPage="Rows"
                  sx={{ px: 2, py: 1 }}
                />
              </>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default RMSDetails;

