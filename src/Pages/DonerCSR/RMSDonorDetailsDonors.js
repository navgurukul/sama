import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Search,
} from "lucide-react";

// Base URL for Donors API – using RMS API host, the curl examples are for paths and payload shape
const API_BASE_URL = "https://rms-api.thesama.in/api";

const RMSDonorDetailsDonors = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ donorName: "", isActive: true });
  const [formErrors, setFormErrors] = useState({});

  // Fetch all Donors
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/donors/`);
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error("API did not return JSON. Please check the donors API endpoint.");
      }
      const json = await res.json();
      const rows = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : [];
      setData(rows);
    } catch (err) {
      setError(err.message || "Unable to load Donors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter data based on search
  const filtered = React.useMemo(() => {
    if (!search.trim()) return data;
    const term = search.trim().toLowerCase();
    return data.filter((row) => {
      return JSON.stringify(row || {}).toLowerCase().includes(term);
    });
  }, [data, search]);

  // Pagination
  const pagedRows = React.useMemo(() => {
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  // Generate columns from the first record
  const columns = React.useMemo(() => {
    if (!filtered.length) return [];
    return Object.keys(filtered[0]);
  }, [filtered]);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(0);
  }, [search, rowsPerPage, data.length]);

  // Handle create/edit dialog
  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        donorName: item.donorName || "",
        isActive: item.isActive ?? true,
      });
    } else {
      setEditingItem(null);
      setFormData({ donorName: "", isActive: true });
    }
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setFormData({});
    setFormErrors({});
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.donorName || !formData.donorName.trim()) {
      errors.donorName = "Donor name is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle create
  const handleCreate = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const payload = {
        donorName: formData.donorName?.trim(),
        isActive: Boolean(formData.isActive),
      };

      const res = await fetch(`${API_BASE_URL}/donors/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${res.status}`);
      }
      
      await fetchData();
      handleCloseDialog();
    } catch (err) {
      setError(err.message || "Failed to create Donor");
    } finally {
      setLoading(false);
    }
  };

  // Handle update
  const handleUpdate = async () => {
    if (!validateForm() || !editingItem) return;
    
    setLoading(true);
    try {
      const id = editingItem.id || editingItem._id || editingItem.ID;
      const payload = {
        donorName: formData.donorName?.trim(),
        isActive: Boolean(formData.isActive),
      };
      const res = await fetch(`${API_BASE_URL}/donors/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${res.status}`);
      }
      
      await fetchData();
      handleCloseDialog();
    } catch (err) {
      setError(err.message || "Failed to update Donor");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (item) => {
    if (!window.confirm("Are you sure you want to delete this Donor?")) return;
    
    setLoading(true);
    try {
      const id = item.id || item._id || item.ID;
      const res = await fetch(`${API_BASE_URL}/donors/${id}`, {
        method: "DELETE",
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${res.status}`);
      }
      
      await fetchData();
    } catch (err) {
      setError(err.message || "Failed to delete Donor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} mb={2}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="#2e7d32">
            Donors Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage Donor records. Create, edit, or delete Donors.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="success"
          startIcon={<Plus size={18} />}
          onClick={() => handleOpenDialog()}
          sx={{ fontWeight: 600 }}
        >
          Add Donor
        </Button>
      </Stack>

      <Card
        sx={{
          mb: 2,
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
            label="Search Donors"
            placeholder="Search by any field..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            size="small"
            InputProps={{
              startAdornment: <Search size={18} style={{ marginRight: 8, color: "#666" }} />,
            }}
            sx={{
              minWidth: { xs: "100%", sm: 320 },
              maxWidth: { sm: 520 },
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
          <Chip
            label={`Total: ${data.length || 0} | Filtered: ${filtered.length || 0}`}
            color="success"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {loading && !data.length ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Card
          sx={{
            boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
            border: "1px solid #e0e0e0",
          }}
        >
          <CardContent sx={{ p: 0 }}>
            {filtered.length === 0 ? (
              <Box p={3}>
                <Typography variant="body2" color="text.secondary">
                  No Donors found.
                </Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ width: "100%", overflowX: "auto", maxWidth: "100vw" }}>
                  <TableContainer component={Paper} sx={{ maxWidth: "100%" }}>
                    <Table size="small" sx={{ minWidth: 700 }}>
                      <TableHead>
                        <TableRow>
                          {columns.map((col) => (
                            <TableCell
                              key={col}
                              sx={{
                                fontWeight: 700,
                                textTransform: "capitalize",
                                bgcolor: "rgba(46,125,50,0.08)",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {col === "id"
                                ? "ID"
                                : col === "donorName"
                                ? "Donor Name"
                                : col === "isActive"
                                ? "Active"
                                : col}
                            </TableCell>
                          ))}
                          <TableCell
                            sx={{
                              fontWeight: 700,
                              bgcolor: "rgba(46,125,50,0.08)",
                              position: "sticky",
                              right: 0,
                              bgcolor: "rgba(46,125,50,0.08)",
                            }}
                          >
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {pagedRows.map((row, idx) => (
                          <TableRow key={idx} hover>
                            {columns.map((col) => (
                              <TableCell
                                key={col}
                                sx={{
                                  maxWidth: 200,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {col === "isActive"
                                  ? row.isActive
                                    ? "Active"
                                    : "Inactive"
                                  : String(row[col] ?? "")}
                              </TableCell>
                            ))}
                            <TableCell
                              sx={{
                                position: "sticky",
                                right: 0,
                                bgcolor: "background.paper",
                                whiteSpace: "nowrap",
                              }}
                            >
                              <Stack direction="row" spacing={1}>
                                <Tooltip title="Edit">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleOpenDialog(row)}
                                  >
                                    <Edit size={16} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDelete(row)}
                                  >
                                    <Trash2 size={16} />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
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

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" fontWeight={600}>
            {editingItem ? "Edit Donor" : "Create New Donor"}
          </Typography>
          <IconButton onClick={handleCloseDialog} size="small">
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
            <TextField
              label="Donor Name"
              value={formData.donorName}
              onChange={(e) => handleInputChange("donorName", e.target.value)}
              fullWidth
              size="small"
              error={!!formErrors.donorName}
              helperText={formErrors.donorName}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(formData.isActive)}
                  onChange={(e) => handleInputChange("isActive", e.target.checked)}
                  color="success"
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={editingItem ? handleUpdate : handleCreate}
            variant="contained"
            color="success"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : editingItem ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RMSDonorDetailsDonors;

