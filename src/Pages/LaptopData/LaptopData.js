

import React, { useState, useEffect } from 'react';
import {Container, Snackbar, Typography,IconButton, TextField, Button, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress } from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';

const DataAssignmentForm = () => {

  const [idQuery, setIdQuery] = useState('');
  const [userQuery, setUserQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]); // Laptop data
  const [userData, setUserData] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [showUserTable, setShowUserTable] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [open, setOpen] = React.useState(false); // Success Snackbar
  const [errorOpen, setErrorOpen] = useState(false); // Error Snackbar
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [loadingLaplopData, setLoadingLaplopData] = useState(false)
  const [noDataAvailable, setNoDataAvailable] = useState(false);
  const [noUserDataAvailable, setNoUserDataAvailable] = useState(false); // Define the state

  const AssignToUser = async () => {
    const url = "https://script.google.com/macros/s/AKfycbyFSqHccZqfs0MH5F7I_CQO20_Ar2Tfbos8pU-zSs4ARN38ecBCg7-hk2Tltp7XB_E9EA/exec";  // Replace with the Web App URL
    const requestBody = JSON.stringify({
      laptopId: idQuery,
      userId: userQuery,
      issuedDate: new Date().toLocaleDateString(),
      type: 'assign',
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: requestBody,
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
      });

      if (!response.ok) throw new Error('Network response was not ok');
      setErrorOpen(true)
    } catch (error) {
      setOpen(true);
    } finally {
      handleReset();
    }
  };

  const handleSearch = () => {
    if (idQuery) {
      setLoading(true);
      setSearchTriggered(true);
    }
  };

  useEffect(() => {
    if (!searchTriggered || !idQuery) return;

    const url = "https://script.google.com/macros/s/AKfycbzoDFfHvdHiX4P6UqzTr_ZZZ7ouaSRHIjmfT5cNEgZLHruYDTUP2QlfqqimeokdLEhP/exec";
    setLoading(true);
    const fetchData = async () => {
      try {
        const response = await fetch(`${url}?idQuery=${idQuery}&type=getLaptopData`, {
          method: 'GET',
        });
        const result = await response.json();

        const taggedData = result.filter(item => item.Status === 'Tagged');

        if (taggedData.length === 0) {
          setNoDataAvailable(true);
        } else {
          setNoDataAvailable(false);
        }

        setData(taggedData);
        setShowTable(true);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
        setSearchTriggered(false);
      }
    };
    fetchData();
  }, [searchTriggered, idQuery]);

  const handleUserSearch = async () => {
    if (!userQuery) return;

    const url = "https://script.google.com/macros/s/AKfycbzoDFfHvdHiX4P6UqzTr_ZZZ7ouaSRHIjmfT5cNEgZLHruYDTUP2QlfqqimeokdLEhP/exec";
    setLoadingLaplopData(true);
    try {
      const response = await fetch(`${url}?idQuery=${userQuery}&type=getUserData`, {
        method: 'GET',
      });
      const result = await response.json();

      const assignedData = result.filter(item => item.status === 'Laptop Assigned');

      if (assignedData.length === 0) {
        setNoUserDataAvailable(true);
      } else {
        setNoUserDataAvailable(false);
      }

      setUserData(assignedData);
      setShowUserTable(true);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingLaplopData(false);
    }
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
    setErrorOpen(false);
  };

  const action = (
    <>
      <Button color="secondary" size="small" onClick={handleClose}>
        UNDO
      </Button>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </>
  );

  const handleReset = () => {
    setIdQuery('');
    setData([]);
    setShowTable(false);
    setUserQuery('');
    setUserData([]);
    setShowUserTable(false);
    setShowUserDetails(false);
  };

  const handleAssignToUser = () => {
    setShowUserDetails(true);
  };

  const laptopHeaders = data.length > 0 ? Object.keys(data[0]) : [];
  const userHeaders = userData.length > 0 ? Object.keys(userData[0]) : [];

  return (
    <Container maxWidth="lg" style={{ marginTop: '50px' }}>
      <Typography variant="h4" gutterBottom>
        Data Assignment Form
      </Typography>

      <Typography variant="h5" gutterBottom>
        Laptop Identification
      </Typography>

      <TextField
        label="Enter Laptop ID or MAC Address"
        variant="outlined"
        style={{ width: '50%' }}
        value={idQuery}
        onChange={(e) => setIdQuery(e.target.value)}
      />
      <Box marginTop={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSearch}
          disabled={!idQuery}
        >
          Search
        </Button>
        {loading && <CircularProgress />}

      </Box>

      <Box display="flex" justifyContent="center" marginTop={2}>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleReset}
        >
          Reset
        </Button>
      </Box>

      {noDataAvailable && <Typography variant='h6'>No data available</Typography>}
      {!noDataAvailable && showTable && data.length > 0 && (
        <>
          <TableContainer component={Paper} style={{ marginTop: '20px' }}>
            <Table>
              <TableHead>
                <TableRow>
                  {laptopHeaders.map((header) => (
                    <TableCell key={header}><strong>{header}</strong></TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {laptopHeaders.map((header) => (
                      <TableCell key={header}>
                        {row[header] || 'N/A'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box display="flex" justifyContent="center" marginTop={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAssignToUser}
            >
              Assign to User
            </Button>
          </Box>
        </>
      )}

      {showUserDetails && (
        <Container maxWidth="lg" style={{ marginTop: '50px' }}>
          <Typography variant="h5" gutterBottom>
            User Details
          </Typography>

          <TextField
            label="Enter User ID or Email"
            variant="outlined"
            style={{ width: '50%' }}
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
          />
          <Box marginTop={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleUserSearch}
              disabled={!userQuery}
            >
              Search
            </Button>
            {loadingLaplopData && <CircularProgress style={{ marginLeft: 16 }} />}
          </Box>
          <Box display="flex" justifyContent="center" marginTop={2}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleReset}
            >
              Reset
            </Button>
          </Box>

          {/* User Table */}
          {noUserDataAvailable && <Typography variant='h6'>No data available</Typography>}

          {!noUserDataAvailable && showUserTable && userData.length > 0 && (
            <>
              <TableContainer component={Paper} style={{ marginTop: '20px' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      {userHeaders.map((header) => (
                        <TableCell key={header}><strong>{header}</strong></TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {userData.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {userHeaders.map((header) => (
                          <TableCell key={header}>
                            {row[header] || 'N/A'}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box display="flex" justifyContent="center" marginTop={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={AssignToUser}
                >
                  Submit data
                </Button>
              </Box>
            </>
          )}
        </Container>
      )}
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        message=" 🎉 Data assigned successfully!"
        action={action}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }} 
        sx={{
          '& .MuiSnackbarContent-root': {
            backgroundColor: '#4CAF50', 
            color: '#fff', 
            fontSize: '16px', 
            fontWeight: 'bold', 
            borderRadius: '8px', 
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', 
          },
        }}
      />
      <Snackbar
        open={errorOpen}
        autoHideDuration={6000}
        onClose={handleClose}
        message=" Error!"
        action={action}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            backgroundColor: 'red',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 'bold',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          },
        }}
      />
    </Container>
  );
};

export default DataAssignmentForm;



