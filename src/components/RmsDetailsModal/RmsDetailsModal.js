import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";
import { X } from "lucide-react";

export default function RmsDetailsModal({ open, onClose, laptopData, loading = false, error = null }) {
  // Only use API data for RMS details
  const rmsData = laptopData && laptopData.rmsDetails ? laptopData.rmsDetails : null;
  const [tabIndex, setTabIndex] = React.useState(0);
  const handleTabChange = (event, newValue) => setTabIndex(newValue);

  // State for each tab's data, loading, and error
  const [tabData, setTabData] = React.useState([null, null, null]);
  const [tabLoading, setTabLoading] = React.useState([false, false, false]);
  const [tabError, setTabError] = React.useState([null, null, null]);

  // Helper: get serial number
  const serial = laptopData?.ID || laptopData?.serial || laptopData?.SerialNumber;

  // API endpoints for each tab
  const apiUrls = serial ? [
    `https://rms-api.thesama.in/api/devices/serial/${serial}`,
    `https://rms-api.thesama.in/api/tracking/serial/${serial}`,
    `https://rms-api.thesama.in/api/softwares/history/${serial}`

  ] : [null, null, null];

  // Helper: format date as DD/MM/YYYY (handles ISO and other formats)
  function formatDate(dateStr) {
    if (!dateStr) return '';
    // Try to parse ISO or other date strings
    let d = null;
    if (typeof dateStr === 'string' && dateStr.match(/\d{4}-\d{2}-\d{2}T/)) {
      d = new Date(dateStr);
    } else if (typeof dateStr === 'string' && dateStr.match(/\d{4}-\d{2}-\d{2}/)) {
      d = new Date(dateStr);
    } else {
      d = new Date(dateStr);
    }
    if (isNaN(d)) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Fetch data when tab changes or modal opens
  React.useEffect(() => {
    if (!serial || tabData[tabIndex] || tabLoading[tabIndex]) return;
    setTabLoading(prev => prev.map((v, i) => i === tabIndex ? true : v));
    setTabError(prev => prev.map((v, i) => i === tabIndex ? null : v));
    fetch(apiUrls[tabIndex])
      .then(res => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then(data => {
        setTabData(prev => prev.map((v, i) => i === tabIndex ? data : v));
      })
      .catch(e => {
        setTabError(prev => prev.map((v, i) => i === tabIndex ? e.message : v));
      })
      .finally(() => {
        setTabLoading(prev => prev.map((v, i) => i === tabIndex ? false : v));
      });
  }, [tabIndex, serial, open]);

  if (!laptopData) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "1.5rem",
          fontWeight: "bold",
          borderBottom: "1px solid #e0e0e0",
          pb: 2,
          backgroundColor: "#f9f9f9",
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            RMS Details
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 300, mt: 0.5 }}>
            SerialNumber - {laptopData?.ID || "N/A"}
          </Typography>
          <Typography variant="caption" sx={{ color: "#666", mt: 0.5 }}>
            {laptopData?.["Manufacturer Model"] || "N/A"}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: "#666",
            "&:hover": { bgcolor: "#f5f5f5" },
          }}
        >
          <X size={20} />
        </IconButton>
      </DialogTitle>

      {/* Tabs */}
      <Tabs value={tabIndex} onChange={handleTabChange} centered sx={{ borderBottom: "1px solid #e0e0e0", bgcolor: "#f9f9f9" }}>
        <Tab label="Service Details" />
        <Tab label="Tracking Details" />
        <Tab label="Installation Info" />
      </Tabs>

      {/* Dialog Content */}
      <DialogContent sx={{ py: 3 }}>
        {tabLoading[tabIndex] ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
            <CircularProgress size={40} />
          </Box>
        ) : tabError[tabIndex] ? (
          <Box sx={{ color: "#d32f2f", textAlign: "center", mb: 2 }}>
            Error: {tabError[tabIndex]}
          </Box>
        ) : null}

        {/* Tab Panels */}
        {tabIndex === 0 && tabData[0] && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Device Details
            </Typography>
            {Object.keys(tabData[0]).length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                No RMS details available for this laptop.
              </Typography>
            )}
            {Object.keys(tabData[0]).length > 0 && (
              <TableContainer component={Paper} sx={{ boxShadow: "none", border: "1px solid #e0e0e0" }}>
                <Table size="small">
                  <TableBody>
                    {Object.entries(tabData[0])
                      .filter(([key]) => key.toLowerCase() !== 'location')
                      .map(([key, value]) => {
                        let displayKey = key;
                        if (key.toLowerCase() === 'isactive') displayKey = 'Status';
                        // Format date fields, including 'created at', 'created', 'date', 'expiry', 'start', 'end', or ending with 'at'
                        let displayValue = value;
                        const keyNoSpace = key.replace(/\s+/g, '').toLowerCase();
                        if ((/date|expiry|start|end|created/i.test(keyNoSpace) || keyNoSpace.endsWith('at')) && value) {
                          displayValue = formatDate(value);
                        }
                        return (
                          <TableRow key={key}>
                            <TableCell sx={{ fontWeight: 500, textTransform: 'capitalize' }}>{displayKey.replace(/_/g, ' ')}</TableCell>
                            <TableCell sx={{ textAlign: 'center' }}>{typeof displayValue === 'object' && displayValue !== null ? JSON.stringify(displayValue) : String(displayValue)}</TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
        {tabIndex === 1 && tabData[1] && Array.isArray(tabData[1]) && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Laptop Tracking History
            </Typography>
            <TableContainer component={Paper} sx={{ boxShadow: "none", border: "1px solid #e0e0e0" }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    {tabData[1][0] && Object.keys(tabData[1][0])
                      .filter(col => !col.replace(/\s+/g, '').toLowerCase().includes('last_updated'))
                      .map((col) => (
                        <TableCell key={col} sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                    {col.toLowerCase() === 'totaltime' || col.toLowerCase() === 'total_time' ? 'Total Time (min)' : col.replace(/_/g, ' ')}
                        </TableCell>
                      ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tabData[1].map((row, idx) => (
                    <TableRow key={idx}>
                      {Object.entries(row)
                        .filter(([k]) => !k.replace(/\s+/g, '').toLowerCase().includes('last_updated'))
                        .map(([k, val], i) => {
                          let displayValue = val;
                          const kNoSpace = k.replace(/\s+/g, '').toLowerCase();
                          if ((/date|expiry|start|end|created/i.test(kNoSpace) || kNoSpace.endsWith('at')) && val) {
                            displayValue = formatDate(val);
                          }
                          if ((kNoSpace === 'totaltime' || kNoSpace === 'total_time') && val) {
                            displayValue = `${val} (min)`;
                          }
                          return (
                            <TableCell key={i} sx={{ textAlign: 'center' }}>{typeof displayValue === 'object' && displayValue !== null ? JSON.stringify(displayValue) : String(displayValue)}</TableCell>
                          );
                        })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
        {tabIndex === 2 && tabData[2] && Array.isArray(tabData[2]) && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Software Installation History
            </Typography>
            <TableContainer component={Paper} sx={{ boxShadow: "none", border: "1px solid #e0e0e0" }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell sx={{ fontWeight: 600 }}>Software Name</TableCell>
                      <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Installed At</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tabData[2].map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.software_name}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                        <Chip
                          label={row.issuccessful ? "Success" : "Failed"}
                          color={row.issuccessful ? "success" : "error"}
                          size="small"
                        />
                      </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>{formatDate(row.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </DialogContent>

      {/* Dialog Actions */}
      <DialogActions
        sx={{
          borderTop: "1px solid #e0e0e0",
          pt: 2,
          pb: 2,
          pr: 3,
          backgroundColor: "#f9f9f9",
        }}
      >
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            px: 3,
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
