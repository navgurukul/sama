import React, { useState } from "react";
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
  Box,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import TablePagination from "@mui/material/TablePagination";
import { useNavigate, useParams } from "react-router-dom";
import MOUCard from "../../Pages/MouUpload/MouUpload";
import MouReviewd from "../../Pages/MouUpload/MouReviewd";

// Status Cell Component
const StatusCell = ({
  status,
  id,
  handleIndividualStatusChange,
  statusDisabled,
  defaultStatus,
}) => {
  if (statusDisabled) {
    return (
      <TextField
        value={status || ""}
        disabled
        fullWidth
        variant="outlined"
        size="small"
        sx={{
          backgroundColor: "rgba(0, 0, 0, 0.05)",
          "& .MuiInputBase-input.Mui-disabled": {
            WebkitTextFillColor: "rgba(0, 0, 0, 0.7)",
          },
        }}
      />
    );
  }

  return (
    <FormControl fullWidth size="small">
      <Select
        value={status || ""}
        onChange={(e) => handleIndividualStatusChange(id, e.target.value, e)}
        onClick={(e) => e.stopPropagation()}
      >
        {defaultStatus.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

const NGOTable = ({
  ngoData,
  setNgoData,
  setEditStatus,
  filterOptions,
  NgoId,
  mouFound,
}) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const user = id ? id : NgoId[0].NgoId;

  // Local state
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
  const [statusDisabled, setStatusDisabled] = useState(true);

  const defaultStatus = ["Laptop Assigned", "Data Uploaded"];

  // Handlers
  const handleBulkStatusChange = async () => {
    const updatedData = ngoData.map((ngo) => {
      if (selectedRows.has(ngo.ID)) {
        return { ...ngo, status: bulkStatus };
      }
      return ngo;
    });

    setOpenDialog(false);
    setNgoData(updatedData);
    setSelectedRows(new Set());
    setEditStatus(true);

    try {
      await fetch(
        "https://script.google.com/macros/s/AKfycbxDcI2092h6NLFcV2yvJN-2NaHVp1jc9_T5qs0ntLDcltIdRRZw5nfHiZTT9prPLQsf2g/exec",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "no-cors",
          body: JSON.stringify({
            id: Array.from(selectedRows),
            status: bulkStatus,
            type: "editUser",
          }),
        }
      );
    } catch (error) {
      console.error("Error updating status in bulk:", error);
    }
  };

  const handleIndividualStatusChange = async (id, newStatus, event) => {
    event.stopPropagation();

    const updatedData = ngoData.map((ngo) => {
      if (ngo.ID === id) {
        return { ...ngo, status: newStatus };
      }
      return ngo;
    });

    setNgoData(updatedData);
    setEditStatus(true);

    try {
      await fetch(
        "https://script.google.com/macros/s/AKfycbxDcI2092h6NLFcV2yvJN-2NaHVp1jc9_T5qs0ntLDcltIdRRZw5nfHiZTT9prPLQsf2g/exec",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "no-cors",
          body: JSON.stringify({
            id: [id],
            status: newStatus,
            type: "editUser",
          }),
        }
      );
    } catch (error) {
      console.error("Error updating individual status:", error);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleRowClick = (id) => {
    navigate(`/userdetails/${id}`);
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

  // Filter data for NGO view
  const filteredData = ngoData
    .filter((ngo) => ngo.Ngo === user)
    .filter((ngo) => {
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
        (filters.status === "" || ngo.status === filters.status)
      );
    });

  return (
    <Container maxWidth="xl" sx={{ mt: 6, mb: 6 }}>
      {/* MOU Section */}
      {mouFound?.data ? <MouReviewd /> : <MOUCard ngoid={user} />}

      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" gutterBottom>
          All Beneficiaries({filteredData.length})
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/user-details", { state: { userId: id } })}
          sx={{ mt: 2, mr: 2 }}
        >
          Add Beneficiaries
        </Button>
      </Box>

      {/* Search */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3} sx={{ mt: 3 }}>
          <TextField
            sx={{ width: { lg: "480px", sm: "100%", xs: "100%" } }}
            label="Search by Name, Location, Contact"
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
          <InputLabel>ID Proof Type</InputLabel>
          <Select
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
          <InputLabel>Use Case</InputLabel>
          <Select
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
          <InputLabel>Occupation Status</InputLabel>
          <Select
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
          <InputLabel>Status</InputLabel>
          <Select
            value={filters["status"]}
            onChange={handleFilterChange}
            name="status"
          >
            <MenuItem value="">All</MenuItem>
            {defaultStatus?.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Table */}
      <TableContainer
        style={{ border: "none" }}
        sx={{ backgroundColor: "white", mt: 2 }}
      >
        <Table>
          <TableHead>
            {selectedRows.size > 0 ? (
              <TableRow>
                <TableCell colSpan={9}>
                  <Box
                    sx={{
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                      }}
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
                          "& .MuiSelect-select": {
                            py: 1.5,
                          },
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
                        "&:hover": {
                          bgcolor: "#3d503f",
                        },
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
                    indeterminate={
                      selectedRows.size > 0 &&
                      selectedRows.size < filteredData.length
                    }
                    checked={
                      filteredData.length > 0 &&
                      selectedRows.size === filteredData.length
                    }
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2">ID</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2">Name</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2">Email</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2">Contact Number</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2">ID Proof Type</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2">Use Case</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2">Occupation Status</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2">Status</Typography>
                </TableCell>
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
                  <TableCell>
                    <Typography variant="body2">{ngo.ID}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{ngo.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{ngo.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {ngo["contact number"]}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {ngo["ID Proof type"]}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{ngo["Use case"]}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{ngo["Occupation"]}</Typography>
                  </TableCell>
                  <TableCell>
                    <StatusCell
                      status={ngo.status}
                      id={ngo.ID}
                      handleIndividualStatusChange={
                        handleIndividualStatusChange
                      }
                      statusDisabled={statusDisabled}
                      defaultStatus={defaultStatus}
                    />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
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

      {/* Bulk Update Confirmation Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Change Status</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to change the status for {selectedRows.size}{" "}
            selected items to "{bulkStatus}"?
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
    </Container>
  );
};

export default NGOTable;
