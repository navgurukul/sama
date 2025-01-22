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
import EmptyBeneficiary from "./EmptyBeneficiary";

// StatusCell Component
const StatusCell = ({
  status,
  id,
  handleIndividualStatusChange,
  statusDisabled,
  defaultStatus,
  dateTime,
  additionalStatuses = [],
}) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isDateEnabled, setIsDateEnabled] = useState(false);

  useEffect(() => {
    const checkDateEnabled = () => {
      const currentDate = new Date();
      const dayOfMonth = currentDate.getDate();
      setIsDateEnabled(dayOfMonth >= 1 && dayOfMonth <= 10);
    };

    const checkTimeElapsed = () => {
      if (status === "Laptop Assigned" && dateTime) {
        const assignedTime = new Date(dateTime).getTime();
        const currentTime = new Date().getTime();
        const minutesDiff = (currentTime - assignedTime) / (1000 * 60);
        // setIsEnabled(minutesDiff >= 48 * 60); // 48 hours = 48 * 60 minutes
        setIsEnabled(minutesDiff >= 1);
      }
    };

    checkDateEnabled();
    checkTimeElapsed();

    const dateInterval = setInterval(checkDateEnabled, 1000 * 60 * 60);
    const timeInterval = setInterval(checkTimeElapsed, 10000);

    return () => {
      clearInterval(dateInterval);
      clearInterval(timeInterval);
    };
  }, [status, dateTime]);

  const additionalStatusNames = additionalStatuses.map((status) => status.name);

  const getAvailableStatuses = () => {
    if (status === "Data Uploaded") {
      return defaultStatus;
    }
    if (status === "Laptop Assigned" && !isEnabled) {
      return ["Laptop Assigned"];
    }
    if (
      (status === "Laptop Assigned" && isEnabled) ||
      additionalStatusNames.includes(status)
    ) {
      return additionalStatusNames;
    }
    if (!status) {
      return defaultStatus;
    }
    return additionalStatusNames;
  };

  const availableStatuses = getAvailableStatuses();

  const shouldDisableDropdown = () => {
    if (status === "Data Uploaded") {
      return true;
    }
    if (status === "Laptop Assigned" && !isEnabled) {
      return true;
    }
    if (additionalStatusNames.includes(status) && !isDateEnabled) {
      return true;
    }
    return false;
  };

  const isDropdownDisabled = shouldDisableDropdown();

  if (isDropdownDisabled) {
    return (
      <TextField
        value={status || ""}
        disabled
        fullWidth
        variant="outlined"
        size="small"
        sx={{
          backgroundColor: "rgb(243, 243, 243)",
          "& .MuiInputBase-input.Mui-disabled": {
            WebkitTextFillColor: "rgb(115, 115, 115)",
            backgroundColor: "rgb(243, 243, 243)",
            borderRadius: "8px",
          },
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
            "&.Mui-disabled": {
              backgroundColor: "rgb(243, 243, 243)",
            },
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
        sx={{
          backgroundColor: "rgb(243, 243, 243)",
          borderRadius: "8px",
          "& .MuiSelect-select": {
            backgroundColor: "rgb(243, 243, 243)",
            padding: "4px 8px",
          },
        }}
      >
        {availableStatuses.map((option) => (
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
  const [additionalStatuses, setAdditionalStatuses] = useState([]);

  const defaultStatus = ["Laptop Assigned", "Data Uploaded"];

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

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const response = await fetch(
          "https://script.google.com/macros/s/AKfycbxTda3e4lONdLRT13N2lVj7Z-P0q-ITSe1mvh-n9x9BG8wZo9nvnT7HXytpscigB0fm/exec?type=manageStatus"
        );
        const data = await response.json();
        const currentNgoId = id ? id : NgoId[0].NgoId;

        if (Array.isArray(data)) {
          const filteredStatuses = data.filter(
            (status) => status.id === currentNgoId
          );
          setAdditionalStatuses(filteredStatuses);
        } else if (data.data && Array.isArray(data.data)) {
          const filteredStatuses = data.data.filter(
            (status) => status.id === currentNgoId
          );
          setAdditionalStatuses(filteredStatuses);
        }
      } catch (error) {
        console.error("Error fetching additional statuses:", error);
        setAdditionalStatuses([]);
      }
    };

    fetchStatuses();
  }, [id, NgoId]);

  const handleBulkStatusChange = async () => {
    const updatedData = ngoData.map((ngo) => {
      if (selectedRows.has(ngo.ID)) {
        const newNgo = { ...ngo, status: bulkStatus };
        if (
          ngo.status === "Data Uploaded" &&
          bulkStatus === "Laptop Assigned"
        ) {
          newNgo["Date-time"] = new Date().toISOString();
        }
        return newNgo;
      }
      return ngo;
    });

    setOpenDialog(false);
    setNgoData(updatedData);
    setSelectedRows(new Set());
    setEditStatus(true);

    const AuthUser = JSON.parse(localStorage.getItem("_AuthSama_"));
    try {
      const selectedNgos = Array.from(selectedRows).map((id) =>
        ngoData.find((ngo) => ngo.ID === id)
      );
      const selectedNgoDetails = selectedNgos.map((ngo) => ({
        email: ngo.email,
        ngoId: AuthUser[0].NgoId,
        newStatus: bulkStatus,
      }));

      await fetch(
        "https://script.google.com/macros/s/AKfycbzAR35oDa2j26ifFya9cRcM4AlTV2vu124VsBNB04laz8AeOCReG95nej1J9gfWWAf6/exec?type=updateStatusHistory",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "no-cors",
          body: JSON.stringify(selectedNgoDetails),
        }
      );

      const isAssigningLaptop = selectedNgos.some(
        (ngo) =>
          ngo.status === "Data Uploaded" && bulkStatus === "Laptop Assigned"
      );

      const payload = {
        id: Array.from(selectedRows),
        status: bulkStatus,
        type: "editUser",
      };

      if (isAssigningLaptop) {
        payload.assignedAt = new Date().toISOString();
      }

      await fetch(
        "https://script.google.com/macros/s/AKfycbxDcI2092h6NLFcV2yvJN-2NaHVp1jc9_T5qs0ntLDcltIdRRZw5nfHiZTT9prPLQsf2g/exec",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "no-cors",
          body: JSON.stringify(payload),
        }
      );
    } catch (error) {
      console.error("Error updating status in bulk:", error);
    }
  };

  const handleIndividualStatusChange = async (id, newStatus, event) => {
    event.stopPropagation();

    const currentNgo = ngoData.find((ngo) => ngo.ID === id);
    const currentRow = ngoData.find((ngo) => ngo.ID === id);
    const rowEmail = currentRow ? currentRow.email : "";
    const updatedData = ngoData.map((ngo) => {
      if (ngo.ID === id) {
        const updatedNgo = { ...ngo, status: newStatus };
        if (ngo.status === "Data Uploaded" && newStatus === "Laptop Assigned") {
          updatedNgo["Date-time"] = new Date().toISOString();
        }
        return updatedNgo;
      }
      return ngo;
    });

    setNgoData(updatedData);
    setEditStatus(true);

    try {
      const payload = {
        id: [id],
        status: newStatus,
        type: "editUser",
      };

      if (
        currentNgo.status === "Data Uploaded" &&
        newStatus === "Laptop Assigned"
      ) {
        payload.assignedAt = new Date().toISOString();
      }

      await fetch(
        "https://script.google.com/macros/s/AKfycbxDcI2092h6NLFcV2yvJN-2NaHVp1jc9_T5qs0ntLDcltIdRRZw5nfHiZTT9prPLQsf2g/exec",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "no-cors",
          body: JSON.stringify(payload),
        }
      );

      await fetch(
        "https://script.google.com/macros/s/AKfycbxs0SUYi40w506ODB351wZ28AYCGatKjhJtIjywP9sueeqXPGu_PmKnsN2qZhiPC8el/exec?type=updateStatusHistory",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "no-cors",
          body: JSON.stringify({
            ngoid: currentNgo.Ngo,
            email: rowEmail,
            statusName: newStatus,
          }),
        }
      );
    } catch (error) {
      console.error("Error updating individual status:", error);
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

  // Enhanced filtering logic

  const filteredData = ngoData
    .filter((ngo) => ngo.Ngo === user)
    .filter((ngo) => {
      const matchesSearch =
        searchTerm === "" ||
        ngo.name?.toLowerCase().includes(searchTerm) ||
        ngo.email?.toLowerCase().includes(searchTerm) ||
        ngo["contact number"]?.toString().includes(searchTerm);

      const matchesIdProof =
        filters["ID Proof type"] === "" ||
        ngo["ID Proof type"] === filters["ID Proof type"];

      const matchesUseCase =
        filters["Use case"] === "" || ngo["Use case"] === filters["Use case"];

      const matchesOccupation =
        filters["Occupation Status"] === "" ||
        ngo["Occupation"] === filters["Occupation Status"];

      const matchesStatus =
        filters.status === "" || ngo.status === filters.status;

      return (
        matchesSearch &&
        matchesIdProof &&
        matchesUseCase &&
        matchesOccupation &&
        matchesStatus
      );
    });

  return (
    <Container maxWidth="xl" sx={{ mt: 6, mb: 6 }}>
      {filteredData.length > 0 &&
        (mouFound?.data ? <MouReviewd /> : <MOUCard ngoid={user} />)}

      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" mt={2} gutterBottom>
          {filteredData.length > 0
            ? `All Beneficiaries (${filteredData.length})`
            : `All Beneficiaries`}
        </Typography>
      </Box>

      {/* Search and Add Beneficiaries */}
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
        <Grid>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/user-details", { state: { userId: id } })}
            sx={{ mt: 2, mr: 2 }}
          >
            Add Beneficiaries
          </Button>
        </Grid>
      </Grid>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Box
          sx={{ display: "flex", alignItems: "center", mt: 3, width: "100%" }}
        >
          <FilterListIcon />
          <Typography variant="subtitle1" sx={{ ml: 1 }}>
            Filters
          </Typography>
          {hasActiveFilters() && (
            <Button size="small" sx={{ ml: 2 }} onClick={clearAllFilters}>
              Clear All Filters
            </Button>
          )}
        </Box>

        <Grid container spacing={2} sx={{ mt: 1, ml: 1 }}>
          {/* ID Proof Type Filter */}
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

          {/* Use Case Filter */}
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

          {/* Occupation Status Filter */}
          <FormControl sx={{ m: 1, minWidth: 200 }}>
            <InputLabel id="occupation-status-label">
              Occupation Status
            </InputLabel>
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

          {/* Status Filter */}
          <FormControl sx={{ m: 1, minWidth: 200 }}>
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              label="Status Type"
              value={filters.status}
              onChange={handleFilterChange}
              name="status"
            >
              <MenuItem value="">All</MenuItem>
              {defaultStatus.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
              {additionalStatuses.map((status) => (
                <MenuItem key={status.name} value={status.name}>
                  {status.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Conditional rendering of content */}
      {filteredData.length > 0 ? (
        <>
          <TableContainer
            style={{ border: "none" }}
            sx={{ backgroundColor: "white", mt: 2 }}
          >
            <Table>
              <TableHead>
                {selectedRows.size > 0 ? (
                  <TableRow>
                    <TableCell colSpan={9}>
                      {/* Bulk update controls */}
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
                            -
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
                            {additionalStatuses.map((status) => (
                              <MenuItem key={status.name} value={status.name}>
                                {status.name}
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
                      <Typography variant="subtitle2">
                        Contact Number
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">ID Proof Type</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">Use Case</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">
                        Occupation Status
                      </Typography>
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
                          onChange={(event) =>
                            handleCheckboxChange(ngo.ID, event)
                          }
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
                        <Typography variant="body2">
                          {ngo["Use case"]}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {ngo["Occupation"]}
                        </Typography>
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
                          dateTime={ngo["Date-time"]}
                          additionalStatuses={additionalStatuses}
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
        // Show when any filter is active but no results found
        <Box
          mt={4}
          mb={4}
          display="flex"
          flexDirection="column"
          alignItems="center"
        >
          <Typography
            variant="body1"
            align="center"
            color="textSecondary"
            gutterBottom
          >
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
        // Empty state when no data and no filters
        <Box mt={5}>
          <EmptyBeneficiary />
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            mt={2}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={() =>
                navigate("/user-details", { state: { userId: id } })
              }
              sx={{ alignSelf: "center" }}
            >
              Add Beneficiaries
            </Button>
          </Box>
        </Box>
      )}

      {/* Bulk Update Dialog */}
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
