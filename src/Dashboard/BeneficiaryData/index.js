import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Grid, TextField, MenuItem,
  Select, FormControl, InputLabel, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, Box, Checkbox
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import TablePagination from '@mui/material/TablePagination';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import CircularProgress from '@mui/material/CircularProgress';
import MOUCard from '../../Pages/MouUpload/MouUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteDialog from '../AdminNgo/DeletDialog';
import MouReviewd from '../../Pages/MouUpload/MouReviewd';



const BeneficiaryData = () => {
  // const AuthUser = JSON.parse(localStorage.getItem("_AuthSama_"));
  const NgoId = JSON.parse(localStorage.getItem('_AuthSama_'));
  const gettingStoredData = NgoId[0].NgoId ;
  const { id } = useParams();
  const user = id? id : NgoId[0].NgoId;
  const navigate = useNavigate();
  const [ngoData, setNgoData] = useState([]);
  const [editStatus, setEditStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    "ID Proof type": '',
    "Use case": '',
    "Occupation Status": '',
    status: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterOptions, setFilterOptions] = useState({
    idProof: [],
    useCase: [],
    occupation: [],
    status: ['Laptop Assigned', 'Data Uploaded', 'Approved', 'Rejected'],
  });
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [ngoIdToChange, setNgoIdToChange] = useState(null);
  const [selectedRows, setSelectedRows] = useState(new Set()); // Track selected rows
  const [bulkStatus, setBulkStatus] = useState('')
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [ngoIdToDelete, setNgoIdToDelete] = useState(null);
  const [mouFound, setMouFound] = useState(true);


  // this is to get the data from the mou tab of ngo data sheet
  useEffect(() => {
    async function fetchData() {
      const id = gettingStoredData;      
      try {
        const response = await axios.get(`https://script.google.com/macros/s/AKfycbxm2qA0DvzVUNtbwe4tAqd40hO7NpNU-GNXyBq3gHz_q45QIo9iveYOkV0XqyfZw9V7/exec?type=GetMou&id=${id}`);
        const data = response.data;
        setMouFound(data);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    gettingStoredData && fetchData();
    
  }, [gettingStoredData]); 


  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get('https://script.google.com/macros/s/AKfycbxDcI2092h6NLFcV2yvJN-2NaHVp1jc9_T5qs0ntLDcltIdRRZw5nfHiZTT9prPLQsf2g/exec?type=getUserData');
        const data = response.data;
        setNgoData(data);
        setLoading(false);
        setEditStatus(false);

        const idProofOptions = [...new Set(data.map(item => item["ID Proof type"]))];
        const useCaseOptions = [...new Set(data.map(item => item["Use case"]))];
        const occupationOptions = [...new Set(data.map(item => item["Occupation"]))];

        setFilterOptions({
          idProof: idProofOptions,
          useCase: useCaseOptions,
          occupation: occupationOptions,
          status: filterOptions.status,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
  
    }
    fetchData();
    
  }, [editStatus]); 
  const FilterNgoData=ngoData?.filter((ngo) => ngo.Ngo == user);
  
  
  const handleBulkStatusChange = async () => {
    // Map through `ngoData` and update status based on conditions
    const updatedData = ngoData.map((ngo) => {
      if (bulkStatus && selectedRows.has(ngo.Id)) {
        // If bulkStatus is defined and the NGO is selected, update status
        return { ...ngo, status: bulkStatus };
      } else if (ngo.Id === ngoIdToChange) {
        // If changing individual status, match by `ngoIdToChange`
        return { ...ngo, status: selectedStatus };
      }
      return ngo;
    });
    setOpenDialog(false);
    // Update state with modified data and reset selectedRows
    setNgoData(updatedData);
    setSelectedRows(new Set());
    setEditStatus(true);

    // Convert Set to array for sending in request
    const selectedIdsArray = selectedRows.size > 0 ? Array.from(selectedRows) : Array.from([ngoIdToChange]);

    // Send the request to update statuses
    try {
      await fetch('https://script.google.com/macros/s/AKfycbxDcI2092h6NLFcV2yvJN-2NaHVp1jc9_T5qs0ntLDcltIdRRZw5nfHiZTT9prPLQsf2g/exec', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          id: selectedIdsArray,
          status: bulkStatus,
          type: "editUser",
        }),
      });

    } catch (error) {
      console.error("Error updating status in bulk:", error);
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

  const handleStatusChange = (id, newStatus) => {
    setBulkStatus(newStatus);
    setSelectedStatus(newStatus);
    setNgoIdToChange(id);
    setOpenDialog(true);
  };

  

  const handleCancelStatusChange = () => {
    setSelectedStatus(null);
    setOpenDialog(false);
  };

  const handleCheckboxChange = (id) => {
    const updatedSelectedRows = new Set(selectedRows);
    if (updatedSelectedRows.has(id)) {
      updatedSelectedRows.delete(id);
    } else {
      updatedSelectedRows.add(id);
    }
    setSelectedRows(updatedSelectedRows);
  };

  const handleDeleteDialog = (id) => {
    setNgoIdToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleDelete = async () => {
    const updatedData = ngoData.filter((ngo) => ngo.Id !== ngoIdToDelete);
    setNgoData(updatedData);
    setOpenDeleteDialog(false);
    setEditStatus(true);

    try {
      await fetch('https://script.google.com/macros/s/AKfycbxDcI2092h6NLFcV2yvJN-2NaHVp1jc9_T5qs0ntLDcltIdRRZw5nfHiZTT9prPLQsf2g/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      mode: 'no-cors',
      body: JSON.stringify({
        userId: ngoIdToDelete,
        type: "deleteUser",
      })
    })
    
    
    } catch (error) {
      console.error('Error deleting row:', error);
    }
  };

  const filteredData = FilterNgoData.filter((ngo) => {
    return (
      (searchTerm === '' || 
        ngo.name?.toLowerCase().includes(searchTerm) ||
        ngo.email?.toLowerCase().includes(searchTerm) ||
        ngo["contact number"]?.toString().includes(searchTerm)) &&
      (filters["ID Proof type"] === '' || ngo["ID Proof type"] === filters["ID Proof type"]) &&
      (filters["Use case"] === '' || ngo["Use case"] === filters["Use case"]) &&
      (filters["Occupation Status"] === '' || ngo["Occupation"] === filters["Occupation Status"]) &&
      (filters.status === '' || ngo.status === filters.status)
    );
  });

  console.log(mouFound.data);
  
  return (
    <Container maxWidth="xl" sx={{ mt: 6, mb: 6 }}>
      {NgoId[0]?.role[0] === "ngo" && (mouFound?.data ?  <MouReviewd /> : <MOUCard ngoid = {user}/> )}
      {
        (!loading && (ngoData.some(item => item.Ngo === user))) ? (
    // ((!loading && ngoData.length) > 0) ? (
        <>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" gutterBottom> All Beneficiaries({filteredData.length})</Typography>
          <Button 
            variant="contained"
            color="primary"
            onClick={() => {
              
              navigate('/user-details', { state: {userId:id} });
            }}
            sx={{ mt: 2 ,mr: 2}}
          >
            Add Beneficiaries()
          </Button>
        </Box>
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
          
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", mt: 3 }}>
              <FilterListIcon />
              <Typography variant="subtitle1" sx={{ ml: 1 }}>Filters</Typography>
            </Box>
            
            <FormControl sx={{ m: 1, minWidth: 200 }}>
              <InputLabel>ID Proof Type</InputLabel>
              <Select
                value={filters["ID Proof type"]}
                onChange={handleFilterChange}
                name="ID Proof type"
              >
                <MenuItem value="">All</MenuItem>
                {filterOptions.idProof.map(option => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
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
                {filterOptions.useCase.map(option => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
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
                {filterOptions.occupation.map(option => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
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
                {filterOptions.status.map(option => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </>
      ) : (
        <>
        <Typography variant="h6" gutterBottom> All Beneficiaries </Typography>
        </>
      )
      }

      <TableContainer style={{ border: "none" }} sx={{ backgroundColor: 'white', mt: 2 }}>
        <Table>
          <TableHead>
            {selectedRows.size > 0 ? (
            <TableRow>
              <TableCell colSpan={9}>
            
          
              <Box sx={{ mb: 2, display: "flex" }}>
              <Typography variant="body1" gutterBottom mr={2} mt={2}>change status</Typography>
              <FormControl fullWidth sx={{ maxWidth: 300 }}>
                <InputLabel>Change Status for Selected</InputLabel>
                <Select
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value)}
                >
                  {filterOptions.status.map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                color="primary"
                sx={{ ml: 2 }}
                onClick={handleBulkStatusChange}
                disabled={!bulkStatus} // disable if no status selected
              >
                Update Status
              </Button>
            </Box>

              </TableCell>
            </TableRow>):
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedRows.size > 0 && selectedRows.size < filteredData.length}
                  checked={filteredData.length > 0 && selectedRows.size === filteredData.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      const allIds = new Set(filteredData.map(ngo => ngo.Id));
                      setSelectedRows(allIds);
                    } else {
                      setSelectedRows(new Set());
                    }
                  }}
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
            </TableRow>
            }
          </TableHead>
          <TableBody>
            { loading? <CircularProgress align="center" sx={{ mt: 10,mb: 10 }}/> 
            :
            (ngoData.some(item => item.Ngo === user))
  
            ? (
              filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((ngo) => (
                <TableRow key={ngo.Id} hover onClick={() => handleRowClick(ngo.ID)}>
                  <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedRows.has(ngo.ID)}
                      onChange={(e) => {
                        handleCheckboxChange(ngo.ID);}}
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
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={ngo.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleStatusChange(ngo.ID, e.target.value);
                        }}
                      >
                        {filterOptions.status.map((option) => (
                          <MenuItem key={option} value={option} onClick={(e) => e.stopPropagation()}>{option}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    
                  </TableCell>
                {NgoId[0].role[0] === "ngo" ? "" : 
                <>
                <TableCell style={{ cursor: 'pointer' }}>
                <EditIcon />
              </TableCell>
              <TableCell style={{ cursor: 'pointer' }}>
                  <DeleteIcon 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDialog(ngo.ID);
                    }}

                  />
                </TableCell>
                </>
                }
                  
                </TableRow>
              ))
            ) : 
            (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                  <img src={require("./assets/People.svg").default} alt="No Data" />
                  <Typography variant="body1" sx={{ ml: 2 }}>Start by adding beneficiaries who you would like to<br/> receive laptops through Sama</Typography>
                  <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={() => navigate('/user-details')}>Add Beneficiary</Button>
                </TableCell>
              </TableRow>
            )}
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

      <Dialog open={openDialog} onClose={handleCancelStatusChange}>
        <DialogTitle>Change Status</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to change the status?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelStatusChange} color="primary">Cancel</Button>
          <Button onClick={handleBulkStatusChange} color="primary">Confirm</Button>
        </DialogActions>
      </Dialog>
      <DeleteDialog open={openDeleteDialog} handleClose={handleCloseDeleteDialog} handleDelete={handleDelete} />
    </Container>
  );
};

export default BeneficiaryData;
