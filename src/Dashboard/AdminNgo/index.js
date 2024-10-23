import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Grid, TextField, MenuItem, 
  Select, FormControl, InputLabel, Paper, Table, 
  TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Button, IconButton, Dialog, DialogActions, 
  DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete'; 
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom>All NGOs (100)</Typography>

      {/* Filters Section */}
      <TextField
        label="Search by Name, Location, Contact"
        variant="outlined"
        maxWidth="lg"
        value={searchTerm}
        onChange={handleSearchChange}
      />
      <Grid container spacing={2}>
        <Grid item xs={6} sm={1} md={1}>
          <Typography variant="subtitle1">Filters</Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Laptops Required</InputLabel>
            <Select
              value={filters.laptopsRequired}
              onChange={handleFilterChange}
              name="laptopsRequired"
              label="Laptops Required"
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {filterOptions.laptopsRequired.map(option => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Purpose</InputLabel>
            <Select
              value={filters.purpose}
              onChange={handleFilterChange}
              name="purpose"
              label="Purpose"
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {filterOptions.purpose.map(option => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Location</InputLabel>
            <Select
              value={filters.location}
              onChange={handleFilterChange}
              name="location"
              label="Location"
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {filterOptions.location.map(option => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              onChange={handleFilterChange}
              name="status"
              label="Status"
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {filterOptions.status.map(option => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Custom Table */}
      <TableContainer component={Paper} sx={{ backgroundColor: 'white' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Laptops Required</TableCell>
              <TableCell>Contact Number</TableCell>
              <TableCell>Location of Operation</TableCell>
              <TableCell>Purpose</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Edit Status</TableCell>
              <TableCell>Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((ngo) => (
              <TableRow key={ngo.Id} hover >
                <TableCell>{ngo.Id}</TableCell>
                <TableCell>{ngo.organizationName}</TableCell>
                <TableCell>{ngo.primaryContactName}</TableCell>
                <TableCell>{ngo.contactNumber}</TableCell>
                <TableCell>{ngo.location}</TableCell>
                <TableCell>{ngo.expectedOutcome}</TableCell>

                <TableCell>
                  <FormControl fullWidth>
                    <Select
                      value={ngo.Status}
                      onChange={(e) => handleStatusChange(ngo.Id, e.target.value)}
                    >
                      {filterOptions.status.map(option => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>

               

                <TableCell>
                  <IconButton onClick={() => handleDelete(ngo.Id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Confirmation Dialog */}
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
    </Container>
  );
};

export default AdminNgo;
