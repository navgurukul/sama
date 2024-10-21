import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Grid, TextField, 
  MenuItem, Select, FormControl, InputLabel, Paper,
  Button, IconButton
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete'; // Import delete icon
import axios from 'axios';

const AdminNgo = () => {
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
        const statusOptions = [...new Set(data.map(item => item.status))];

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

  const filteredData = ngoData.filter((ngo) =>
    (ngo.organizationName?.toLowerCase().includes(searchTerm) ||
     ngo.location?.toLowerCase().includes(searchTerm) ||
     ngo.contactNumber?.toString().includes(searchTerm))
    && (filters.laptopsRequired ? ngo.primaryContactName === filters.laptopsRequired : true)
    && (filters.purpose ? ngo.expectedOutcome === filters.purpose : true)
    && (filters.location ? ngo.location === filters.location : true)
    && (filters.status ? ngo.status === filters.status : true)
  );

  const columns = [
    { field: "Id", headerName: 'ID', width: 100 },
    { field: 'organizationName', headerName: 'Name', width: 250 },
    { field: 'laptopTracking', headerName: 'Laptops Required', width: 150 },
    { field: 'contactNumber', headerName: 'Contact Number', width: 150 },
    { field: 'location', headerName: 'Location of Operation', width: 200 },
    { field: 'expectedOutcome', headerName: 'Purpose', width: 300 },
    { field: 'status', headerName: 'Status', width: 150, renderCell: (params) => (
      <Button variant="contained" size="small" color={params.value === 'Request Submitted' ? 'primary' : 'secondary'}>
        {params.value}
      </Button>
    )},
    {
      field: 'delete',
      headerName: 'Delete',
      width: 100,
      renderCell: (params) => (
        <IconButton
          color="secondary"
          onClick={() => handleDelete(params.row.Id)}
        >
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom>All NGOs (100)</Typography>

      {/* Filters Section */}
      <Paper elevation={3} style={{ padding: '16px', marginBottom: '20px' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Search by Name, Location, Contact"
              variant="outlined"
              fullWidth
              value={searchTerm}
              onChange={handleSearchChange}
            />
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
      </Paper>

      {/* DataGrid */}
      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredData}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          loading={loading}
          getRowId={(row) => row.Id}
        />
      </div>
    </Container>
  );
};

export default AdminNgo;
