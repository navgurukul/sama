import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Box,
  Checkbox,
} from "@mui/material";

import FilterListIcon from "@mui/icons-material/FilterList";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import TablePagination from "@mui/material/TablePagination";
import { useNavigate, useParams } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteDialog from "../AdminNgo/DeletDialog";
import EmptyBeneficiary from "./EmptyBeneficiary";

const AdminTable = ({ ngoData, setNgoData, setEditStatus, filterOptions }) => {
  const navigate = useNavigate();
  const { id } = useParams();

  const selectedNgoId = id || JSON.parse(localStorage.getItem("_AuthSama_"))[0].NgoId;

  // Local state management
  const [filters, setFilters] = useState({
    "ID Proof type": "",
    "Use case": "",
    "Occupation Status": "",
    status: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [bulkStatus, setBulkStatus] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [ngoIdToDelete, setNgoIdToDelete] = useState(null);

  const defaultStatus = ["Data Uploaded", "Laptop Assigned"];

  // Helper functions
  const hasActiveFilters = () => {
    return (
      filters["ID Proof type"] !== "" ||
      filters["Use case"] !== "" ||
      filters["Occupation Status"] !== "" ||
      filters.status !== "" ||
      searchTerm !== ""
    );
  };

  const clearAllFilters = () => {
    setFilters({
      "ID Proof type": "",
      "Use case": "",
      "Occupation Status": "",
      status: "",
    });
    setSearchTerm("");
    setPage(0);
  };

  const getRowStatus = (ngo) => {
    try {
      const storedStatuses = JSON.parse(localStorage.getItem("userStatuses") || "{}");
      return storedStatuses[ngo.ID] || ngo.status || "Data Uploaded";
    } catch (error) {
      console.error("Error getting row status:", error);
      return ngo.status || "Data Uploaded";
    }
  };

  // Initialize and maintain statuses
  useEffect(() => {
    if (!ngoData) return;

    try {
      const storedStatuses = JSON.parse(localStorage.getItem("userStatuses") || "{}");
      let hasChanges = false;

      const updatedData = ngoData.map((ngo) => {
        if (storedStatuses[ngo.ID]) {
          if (ngo.status !== storedStatuses[ngo.ID]) {
            hasChanges = true;
          }
          return {
            ...ngo,
            status: storedStatuses[ngo.ID]
          };
        }
        
        if (!ngo.status) {
          hasChanges = true;
          storedStatuses[ngo.ID] = "Data Uploaded";
          return {
            ...ngo,
            status: "Data Uploaded"
          };
        }
        
        if (ngo.status && !storedStatuses[ngo.ID]) {
          storedStatuses[ngo.ID] = ngo.status;
        }
        
        return ngo;
      });

      localStorage.setItem("userStatuses", JSON.stringify(storedStatuses));
      
      if (hasChanges) {
        setNgoData(updatedData);
      }
    } catch (error) {
      console.error("Error managing statuses:", error);
    }
  }, [ngoData, setNgoData]);

  const handleBulkStatusChange = async () => {
    try {
      const storedStatuses = JSON.parse(localStorage.getItem("userStatuses") || "{}");
      
      selectedRows.forEach((id) => {
        storedStatuses[id] = bulkStatus;
      });
      localStorage.setItem("userStatuses", JSON.stringify(storedStatuses));

      const updatedData = ngoData.map((ngo) => {
        if (selectedRows.has(ngo.ID)) {
          return { ...ngo, status: bulkStatus };
        }
        return ngo;
      });

      setNgoData(updatedData);
      setSelectedRows(new Set());
      setEditStatus(true);
      setOpenDialog(false);

      const payload = {
        id: Array.from(selectedRows),
        status: bulkStatus,
        type: "editUser",
      };

      if (bulkStatus === "Laptop Assigned") {
        payload.assignedAt = new Date().toISOString();
      }

      await fetch(
        "https://script.google.com/macros/s/AKfycbwDr-yNesiGwAhqvv3GYNe7SUBKSGvXPRX1uPjbOdal7Z8ctV5H2x4y4T_JuQPMlMdjeQ/exec",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "no-cors",
          body: JSON.stringify(payload),
        }
      );
    } catch (error) {
      console.error("Error updating status in bulk:", error);
      const storedStatuses = JSON.parse(localStorage.getItem("userStatuses") || "{}");
      const updatedData = ngoData.map((ngo) => ({
        ...ngo,
        status: storedStatuses[ngo.ID] || "Data Uploaded",
      }));
      setNgoData(updatedData);
    }
  };

  const handleIndividualStatusChange = async (id, newStatus, event) => {
    event.stopPropagation();
    try {
      const storedStatuses = JSON.parse(localStorage.getItem("userStatuses") || "{}");
      
      storedStatuses[id] = newStatus;
      localStorage.setItem("userStatuses", JSON.stringify(storedStatuses));

      const updatedData = ngoData.map((ngo) => {
        if (ngo.ID === id) {
          return { ...ngo, status: newStatus };
        }
        return ngo;
      });

      setNgoData(updatedData);
      setEditStatus(true);

      const payload = {
        id: [id],
        status: newStatus,
        type: "editUser",
      };

      if (newStatus === "Laptop Assigned") {
        payload.assignedAt = new Date().toISOString();
      }

      await fetch(
        "https://script.google.com/macros/s/AKfycbwDr-yNesiGwAhqvv3GYNe7SUBKSGvXPRX1uPjbOdal7Z8ctV5H2x4y4T_JuQPMlMdjeQ/exec",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "no-cors",
          body: JSON.stringify(payload),
        }
      );
    } catch (error) {
      console.error("Error updating status:", error);
      const storedStatuses = JSON.parse(localStorage.getItem("userStatuses") || "{}");
      const updatedData = ngoData.map((ngo) => {
        if (ngo.ID === id) {
          return { ...ngo, status: storedStatuses[id] || "Data Uploaded" };
        }
        return ngo;
      });
      setNgoData(updatedData);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(0);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
    setPage(0);
  };

  const handleRowClick = (id) => {
    if (!hasActiveFilters()) {
      navigate(`/userdetails/${id}`);
    }
  };

  const handleCheckboxChange = (id, event) => {
    event.stopPropagation();
    const newSelectedRows = new Set(selectedRows);
    if (newSelectedRows.has(id)) {
      newSelectedRows.delete(id);
    } else {
      newSelectedRows.add(id);
    }
    setSelectedRows(newSelectedRows);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelectedRows = new Set(filteredData.map((row) => row.ID));
      setSelectedRows(newSelectedRows);
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleDeleteDialog = (id) => {
    setNgoIdToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleDelete = async () => {
    try {
      const updatedData = ngoData.filter((ngo) => ngo.ID !== ngoIdToDelete);
      setNgoData(updatedData);
      setOpenDeleteDialog(false);
      setEditStatus(true);

      const storedStatuses = JSON.parse(localStorage.getItem("userStatuses") || "{}");
      delete storedStatuses[ngoIdToDelete];
      localStorage.setItem("userStatuses", JSON.stringify(storedStatuses));

      await fetch(
        "https://script.google.com/macros/s/AKfycbxDcI2092h6NLFcV2yvJN-2NaHVp1jc9_T5qs0ntLDcltIdRRZw5nfHiZTT9prPLQsf2g/exec",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "no-cors",
          body: JSON.stringify({
            userId: ngoIdToDelete,
            type: "deleteUser",
          }),
        }
      );
    } catch (error) {
      console.error("Error deleting row:", error);
    }
  };

  // Get filtered data for current NGO
  const filteredData = ngoData
    .filter((ngo) => ngo.Ngo === selectedNgoId)
    .filter((ngo) => {
      const ngoStatus = getRowStatus(ngo);
      return (
        (searchTerm === "" ||
          ngo.name?.toLowerCase().includes(searchTerm) ||
          ngo.email?.toLowerCase().includes(searchTerm) ||
          ngo["contact number"]?.toString().includes(searchTerm)) &&
        (filters["ID Proof type"] === "" ||
          ngo["ID Proof type"] === filters["ID Proof type"]) &&
        (filters["Use case"] === "" ||
          ngo["Use case"] === filters["Use case"]) &&
        (filters["Occupation Status"] === "" ||
          ngo["Occupation"] === filters["Occupation Status"]) &&
        (filters.status === "" || ngoStatus === filters.status)
      );
    });

  // Check if there is any data for the current NGO before filtering
  const hasData = ngoData.some(ngo => ngo.Ngo === selectedNgoId);

  // If no data exists, show only the empty state
  if (!hasData) {
    return (
      <Container maxWidth="xl" sx={{ mt: 6, mb: 6 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <EmptyBeneficiary />
          <Box display="flex" justifyContent="center" alignItems="center" mt="32px">
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/user-details", { state: { userId: id } })}
              sx={{ alignSelf: "center" }}
            >
              Add Beneficiaries
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  // If data exists, render the full interface
  return (
    <Container maxWidth="xl" sx={{ mt: 6, mb: 6 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" gutterBottom>
          {filteredData.length > 0
            ? `All Beneficiaries (${filteredData.length})`
            : `All Beneficiaries`}
        </Typography>
      </Box>
          {/* Search */}
          <Grid
            container
            spacing={2}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Grid item xs={12} sm={6} md={3} sx={{ mt: 3 }}>
              <TextField
                sx={{ width: { lg: "480px", sm: "100%", xs: "100%" } }}
                label="Search by Name, Contact"
                variant="outlined"
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid>
              <Button
                variant="contained"
                color="primary"
                onClick={() =>
                  navigate("/user-details", { state: { userId: id } })
                }
                sx={{ mt: 2, mr: 2 }}
              >
                Add Beneficiaries 
              </Button>
            </Grid>
          </Grid>

          {/* Filters */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", mt: 3 }}>
              <FilterListIcon />
              <Typography variant="subtitle1" sx={{ ml: 1 }}>
                Filters
              </Typography>
            </Box>

            <FormControl sx={{ m: 1, minWidth: 200 }}>
              <InputLabel id="id-proof-type-label">ID Proof Type</InputLabel>
              <Select
                labelId="id-proof-type-label"
                label="ID Proof Type"
                value={filters["ID Proof type"]}
                onChange={handleFilterChange}
                name="ID Proof type"
              >
                <MenuItem value="">All</MenuItem>
                {filterOptions.idProof.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ m: 1, minWidth: 200 }}>
              <InputLabel id="use-case-label">Use Case</InputLabel>
              <Select
                labelId="use-case-label"
                label="Use case Type"
                value={filters["Use case"]}
                onChange={handleFilterChange}
                name="Use case"
              >
                <MenuItem value="">All</MenuItem>
                {filterOptions.useCase.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ m: 1, minWidth: 200 }}>
              <InputLabel id="occupation-status-label">Occupation Status</InputLabel>
              <Select
                labelId="occupation-status-label"
                label="Occupation Status Type"
                value={filters["Occupation Status"]}
                onChange={handleFilterChange}
                name="Occupation Status"
              >
                <MenuItem value="">All</MenuItem>
                {filterOptions.occupation.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ m: 1, minWidth: 200 }}>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                label="Status Type"
                value={filters["status"]}
                onChange={handleFilterChange}
                name="status"
              >
                <MenuItem value="">All</MenuItem>
                {defaultStatus.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {filteredData.length > 0 ? (
            <>
          {/*
          {/* Table */}
          <TableContainer style={{ border: "none" }} sx={{ backgroundColor: "white", mt: 2 }}>
            <Table>
              <TableHead>
                {selectedRows.size > 0 ? (
                  <TableRow>
                    <TableCell colSpan={11}>
                      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
                          onClick={() => setSelectedRows(new Set())}
                        >
                          <Typography
                            variant="body1"
                            component="span"
                            sx={{
                              bgcolor: "#f5f5f5",
                              p: 0.5,
                              borderRadius: "4px",
                              fontWeight: "medium",
                              cursor: "pointer",
                            }}
                          >
                            ✕
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ color: "#666" }}>
                          Change status for {selectedRows.size} selected items
                        </Typography>
                        <FormControl sx={{ width: 300 }}>
                          <Select
                            value={bulkStatus}
                            onChange={(e) => setBulkStatus(e.target.value)}
                            displayEmpty
                            sx={{
                              bgcolor: "white",
                              "& .MuiSelect-select": { py: 1.5 },
                            }}
                          >
                            <MenuItem value="" disabled>
                              Change Status for Selected
                            </MenuItem>
                            {defaultStatus.map((option) => (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <Button
                          variant="contained"
                          onClick={() => setOpenDialog(true)}
                          disabled={!bulkStatus}
                          sx={{
                            bgcolor: "#4B6455",
                            "&:hover": { bgcolor: "#3d503f" },
                            py: 1.5,
                            px: 4,
                          }}
                        >
                          Update Status
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={selectedRows.size > 0 && selectedRows.size < filteredData.length}
                        checked={filteredData.length > 0 && selectedRows.size === filteredData.length}
                        onChange={handleSelectAllClick}
                      />
                    </TableCell>
                    <TableCell><Typography variant="subtitle2">ID</Typography></TableCell>
                    <TableCell><Typography variant="subtitle2">Name</Typography></TableCell>
                    <TableCell><Typography variant="subtitle2">Email</Typography></TableCell>
                    <TableCell><Typography variant="subtitle2">Contact Number</Typography></TableCell>
                    <TableCell><Typography variant="subtitle2">ID Proof Type</Typography></TableCell>
                    <TableCell><Typography variant="subtitle2">Use Case</Typography></TableCell>
                    <TableCell><Typography variant="subtitle2">Occupation Status</Typography></TableCell>
                    <TableCell><Typography variant="subtitle2">Status</Typography></TableCell>
                    <TableCell><Typography variant="subtitle2"></Typography></TableCell>
                    <TableCell><Typography variant="subtitle2"></Typography></TableCell>
                  </TableRow>
                )}
              </TableHead>
              <TableBody>
                {filteredData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((ngo) => (
                    <TableRow
                      key={ngo.ID}
                      hover
                      onClick={() => handleRowClick(ngo.ID)}
                      selected={selectedRows.has(ngo.ID)}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedRows.has(ngo.ID)}
                          onChange={(event) => handleCheckboxChange(ngo.ID, event)}
                          onClick={(event) => event.stopPropagation()}
                        />
                      </TableCell>
                      <TableCell><Typography variant="body2">{ngo.ID}</Typography></TableCell>
                      <TableCell><Typography variant="body2">{ngo.name}</Typography></TableCell>
                      <TableCell><Typography variant="body2">{ngo.email}</Typography></TableCell>
                      <TableCell><Typography variant="body2">{ngo["contact number"]}</Typography></TableCell>
                      <TableCell><Typography variant="body2">{ngo["ID Proof type"]}</Typography></TableCell>
                      <TableCell><Typography variant="body2">{ngo["Use case"]}</Typography></TableCell>
                      <TableCell><Typography variant="body2">{ngo["Occupation"]}</Typography></TableCell>
                      <TableCell>
                        <FormControl fullWidth>
                          <Select
                            value={getRowStatus(ngo)}
                            onChange={(e) => handleIndividualStatusChange(ngo.ID, e.target.value, e)}
                            onClick={(e) => e.stopPropagation()}
                            displayEmpty
                          >
                            {defaultStatus.map((option) => (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell style={{ cursor: "pointer", color: "#828282" }}>
                        <EditIcon
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(ngo.ID);
                          }}
                        />
                      </TableCell>
                      <TableCell style={{ cursor: "pointer", color: "#828282" }}>
                        <DeleteIcon
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDialog(ngo.ID);
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
          />
        </>
      ) : hasActiveFilters() ? (
        // Show when filters are active but no results found
        <Box mt={4} mb={4} display="flex" flexDirection="column" alignItems="center">
          <Typography variant="body1" align="center" color="textSecondary" gutterBottom>
            No beneficiaries found with the selected filters.
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={clearAllFilters}
            sx={{ mt: 2 }}
          >
            Clear All Filters
          </Button>
        </Box>
      ) : (
        // Empty state when no data after filtering
        <>
          <EmptyBeneficiary />
          <Box display="flex" justifyContent="center" alignItems="center" mt="32px">
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/user-details", { state: { userId: id } })}
              sx={{ alignSelf: "center" }}
            >
              Add Beneficiaries
            </Button>
          </Box>
        </>
      )}

      {/* Dialogs */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Change Status</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to change the status for {selectedRows.size} selected items to "{bulkStatus}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleBulkStatusChange} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <DeleteDialog
        open={openDeleteDialog}
        handleClose={handleCloseDeleteDialog}
        handleDelete={handleDelete}
      />
    </Container>
  );
};

export default AdminTable;