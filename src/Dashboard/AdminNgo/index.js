import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Grid, TextField, MenuItem,
  Select, FormControl, InputLabel, Paper, Table,
  TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, IconButton, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, Box
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import axios from 'axios';
import TablePagination from '@mui/material/TablePagination';
import Divider from '@mui/material/Divider';
import { useNavigate } from 'react-router-dom';

import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import { classes } from './style';

const AdminNgo = () => {
  const navigate = useNavigate();
  const [ngoData, setNgoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    laptopsRequired: '',
    purpose: '',
    location: '',
    status: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const [filterOptions, setFilterOptions] = useState({
    laptopsRequired: [],
    purpose: [],
    location: [],
    status: [],
  });

  const [editStatus, setEditStatus] = useState({});
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [ngoIdToChange, setNgoIdToChange] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get('https://script.google.com/macros/s/AKfycbxm2qA0DvzVUNtbwe4tAqd40hO7NpNU-GNXyBq3gHz_q45QIo9iveYOkV0XqyfZw9V7/exec?type=registration');
        const data = response.data.data;

        setNgoData(data);
        setLoading(false);

        const laptopsRequiredOptions = [...new Set(data.map(item => item.primaryContactName))];
        const purposeOptions = [...new Set(data.map(item => item.expectedOutcome))];
        const locationOptions = [...new Set(data.map(item => item.location))];
        const statusOptions = ['Submitted Request', 'In Progress', 'Completed', 'Rejected']; // Set status options manually

        setFilterOptions({
          laptopsRequired: laptopsRequiredOptions,
          purpose: purposeOptions,
          location: locationOptions,
          status: statusOptions,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fetchData();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleRowClick = (id) => {
    navigate(`/ngo/${id}`);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      const updatedData = ngoData.filter((ngo) => ngo.Id !== id);
      setNgoData(updatedData);

      axios.delete(`https://your-api-endpoint/delete/${id}`)
        .then(response => {
          console.log('Row deleted successfully:', response);
        })
        .catch(error => {
          console.error('Error deleting row:', error);
        });
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setSelectedStatus(newStatus);
    setNgoIdToChange(id);
    setOpenDialog(true);  // Open confirmation dialog
  };

  const handleConfirmStatusChange = async (e) => {
    const updatedData = ngoData.map((ngo) =>
      ngo.Id === ngoIdToChange ? { ...ngo, status: selectedStatus } : ngo
    );
    setNgoData(updatedData);
    setOpenDialog(false); // Close dialog

    // Call API to save status

    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbxm2qA0DvzVUNtbwe4tAqd40hO7NpNU-GNXyBq3gHz_q45QIo9iveYOkV0XqyfZw9V7/exec', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          id: ngoIdToChange,
          status: selectedStatus,
          type: "NGO",
        }),
      })
      console.log(response);
      if (response.ok) {
        console.log("Status updated successfully");
      } else {
        console.error("Error updating status:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleCancelStatusChange = () => {
    setSelectedStatus(null);
    setOpenDialog(false); // Close dialog without changing status
  };

  const filteredData = ngoData.filter((ngo) =>
    (ngo.organizationName?.toLowerCase().includes(searchTerm) ||
      ngo.location?.toLowerCase().includes(searchTerm) ||
      ngo.contactNumber?.toString().includes(searchTerm))
    && (filters.laptopsRequired ? ngo.primaryContactName === filters.laptopsRequired : true)
    && (filters.purpose ? ngo.expectedOutcome === filters.purpose : true)
    && (filters.location ? ngo.location === filters.location : true)
    && (filters.status ? ngo.status === filters.status : true)
  );

  return (
    <Container maxWidth="xxl">
      <Typography variant="h6" gutterBottom>All NGOs (100)</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3} sx={{ mt: 3 }}>
          <TextField
            sx={{
              width: {
                lg: "480px",
                sm: "100%",
                xs:"100%"
              }
            }}
            label="Search by Name, Location, Contact"
            variant="outlined"
            maxWidth="lg"
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
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Box sx={{ display: "flex" }}>
          < FilterListIcon sx={{ mt: 3, ml: 2 }} />
          <Typography variant="subtitle1" sx={classes.filter}>Filters</Typography>
        </Box>
        <div>
          <FormControl required sx={classes.FormControl}>
            <InputLabel id="demo-simple-select-required-label">Laptops Required</InputLabel>
            <Select
              labelId="demo-simple-select-required-label"
              id="demo-simple-select-required"
              label="Laptops Required"
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {filterOptions.laptopsRequired.map(option => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl required sx={classes.FormControl}>
            <InputLabel id="demo-simple-select-required-label">Purpose</InputLabel>
            <Select
              labelId="demo-simple-select-required-label"
              id="demo-simple-select-required"
              label="Purpose"
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {filterOptions.purpose.map(option => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{...classes.FormControl,width:"230px"}}>
            <InputLabel id="demo-simple-select-readonly-label">Location of Operation</InputLabel>
            <Select
              label="Location of Operation"
              labelId="demo-simple-select-readonly-label"
              id="demo-simple-select-readonly"
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {filterOptions.location.map(option => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl required sx={classes.FormControl}>
            <InputLabel id="demo-simple-select-required-label">Status</InputLabel>
            <Select
              labelId="demo-simple-select-required-label"
              id="demo-simple-select-required"
              label="Status"
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {filterOptions.status.map(option => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </Grid>

      <TableContainer style={{ border: "none" }} sx={{ backgroundColor: 'white', mt: 2 }}>
        <Table sx={{ border: "none" }}>
          <TableHead sx={{ border: "none" }}>
            <TableRow style={{ border: "none" }}>
              <TableCell sx={classes.tableHeader}>ID</TableCell>
              <TableCell sx={classes.tableHeader}>Name</TableCell>
              <TableCell sx={classes.tableHeader}>Point of Contact</TableCell>
              <TableCell sx={classes.tableHeader}>Contact Number</TableCell>
              <TableCell sx={classes.tableHeader}>Laptop Required</TableCell>
              <TableCell sx={classes.tableHeader}>Location of Operation</TableCell>
              <TableCell sx={{ ...classes.tableHeader, width: "220px" }}>Purpose</TableCell>
              <TableCell sx={classes.tableHeader}>Status</TableCell>
              <TableCell sx={classes.tableHeader}>Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody sx={classes.tablecell}>
            {filteredData.map((ngo) => (
              <TableRow key={ngo.Id} hover sx={classes.tablecell}>
                <TableCell sx={classes.tablecell}>{ngo.Id}</TableCell>
                <TableCell sx={classes.tablecell}>{ngo.organizationName}</TableCell>
                <TableCell sx={classes.tablecell}>{ngo.primaryContactName}</TableCell>
                <TableCell sx={classes.tablecell}>{ngo.contactNumber}</TableCell>
                <TableCell sx={classes.tablecell}>{ngo.location}</TableCell>
                <TableCell sx={classes.tablecell}>{ngo.expectedOutcome}</TableCell>
                <TableCell sx={classes.tablecell}>
                  <FormControl fullWidth >
                    <InputLabel id="demo-simple-select-label">
                      <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <circle cx="4" cy="4" r="4" fill="#FFAD33" />
                      </svg>
                      Request Submitted</InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      label="Request Submitted"
                      value={ngo.Status}
                      onChange={(e) => handleStatusChange(ngo.Id, e.target.value)}
                    >
                      {filterOptions.status.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                </TableCell >
                <TableCell sx={{ border: "none" }}>
                  <IconButton onClick={() => handleDelete(ngo.Id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Divider />
      <TablePagination
        sx={{ mt: 3, mb: 8 }}
        rowsPerPageOptions={[10, 25, 100]}
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
      <Dialog
        open={openDialog}
        onClose={handleCancelStatusChange}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">Confirm Status Change</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            Are you sure you want to change the status to "{selectedStatus}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelStatusChange} color="primary">Cancel</Button>
          <Button onClick={handleConfirmStatusChange} color="primary" autoFocus>Confirm</Button>
        </DialogActions>
      </Dialog>
    </Container >
  );
};

export default AdminNgo;