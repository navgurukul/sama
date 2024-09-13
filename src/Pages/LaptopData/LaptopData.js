

import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
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
      setOpen(true); // Show error Snackbar
    } finally {
      handleReset(); // Reset form after assignment
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
        setData(result);
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
      setUserData(result);
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

  // Extract headers from the first object in the data array (for laptop data)
  const laptopHeaders = data.length > 0 ? Object.keys(data[0]) : [];
  // Extract headers from the first object in the user data array (for user data)
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

      {/* Laptop Table */}
      {showTable && data.length > 0 && (
        <>
          <TableContainer component={Paper} style={{ marginTop: '20px' }}>
            <Table>
              <TableHead>
                <TableRow>
                  {/* Display laptop headers */}
                  {laptopHeaders.map((header) => (
                    <TableCell key={header}><strong>{header}</strong></TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Map over the laptop data array to display each object as a row */}
                {data.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {/* Display each value corresponding to the header */}
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

          {/* Button to assign to user */}
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
          {showUserTable && userData.length > 0 && (
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

              {/* Button to assign to user */}
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
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // Positioning at the top center
        sx={{
          '& .MuiSnackbarContent-root': {
            backgroundColor: '#4CAF50', // Green background
            color: '#fff', // White text
            fontSize: '16px', // Bigger font size
            fontWeight: 'bold', // Bold text
            borderRadius: '8px', // Rounded corners
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Shadow for better look
          },
        }}
      />
      <Snackbar
        open={errorOpen}
        autoHideDuration={6000}
        onClose={handleClose}
        message=" Error!"
        action={action}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // Positioning at the top center
        sx={{
          '& .MuiSnackbarContent-root': {
            backgroundColor: 'red', // Green background
            color: '#fff', // White text
            fontSize: '16px', // Bigger font size
            fontWeight: 'bold', // Bold text
            borderRadius: '8px', // Rounded corners
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Shadow for better look
          },
        }}
      />
    </Container>
  );
};

export default DataAssignmentForm;



