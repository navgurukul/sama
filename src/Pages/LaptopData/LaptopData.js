// // Pending tasks, design fix, and code cleanup, table is comming without clicking on search button
// // while adding any id itis showing data more then one
// // search should be work with mac, id ,name, email no,etc
// // if the usersearch is open so the assig to user button should hide
// // if both selected data should go in the correct sheet
// // need to add snackbar for success and error message
// // need to add loader
// // need to add validation for the input field
// // if data submit evertthing should vanish
// // have a testing for the code


import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Snackbar, Alert } from '@mui/material';

const DataAssignmentForm = () => {
  const [idQuery, setIdQuery] = useState('');
  const [macQuery, setMacQuery] = useState('');
  const [userIdQuery, setUserIdQuery] = useState('');
  const [userQuery, setUserQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]); // Laptop data
  const [userData, setUserData] = useState([]); // User data
  const [showTable, setShowTable] = useState(false); // Control laptop table visibility
  const [showUserTable, setShowUserTable] = useState(false); // Control user table visibility
  const [showUserDetails, setShowUserDetails] = useState(false); // Control user details section visibility
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Snackbar visibility
  const [snackbarMessage, setSnackbarMessage] = useState(''); // Snackbar message

  // Function to send a POST request to Google Apps Script Web App
  const AssignToUser = async () => {
    const url = "https://script.google.com/macros/s/AKfycbxDcI2092h6NLFcV2yvJN-2NaHVp1jc9_T5qs0ntLDcltIdRRZw5nfHiZTT9prPLQsf2g/exec";  // Replace with the Web App URL
    const requestBody = JSON.stringify({
      laptopId: idQuery,
      userId: userIdQuery,
      issuedDate: new Date().toLocaleDateString(),
      type: 'assign',
    });

    try {
      await fetch(url, {
        method: 'POST',
        body: requestBody,
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors'
      });
      setSnackbarMessage("Data submitted successfully.");
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error submitting data:', error);
      setSnackbarMessage('Error submitting data. Please try again.');
      setSnackbarOpen(true);
    }
  };

  // Fetch the laptop data based on the search query (ID or MAC address)
  const fetchLaptopData = async () => {
    const url = "https://script.google.com/macros/s/AKfycbzoDFfHvdHiX4P6UqzTr_ZZZ7ouaSRHIjmfT5cNEgZLHruYDTUP2QlfqqimeokdLEhP/exec";
    setLoading(true);
    try {
      const response = await fetch(`${url}?idQuery=${idQuery}&macQuery=${macQuery}&type=getLaptopData`, {
        method: 'GET',
      });
      const result = await response.json();
      if (result.length === 0) {
        setSnackbarMessage('No data found for the given Laptop ID or MAC Address.');
        setSnackbarOpen(true);
        setShowTable(false);
      } else {
        setData(result); // Set the laptop data
        setShowTable(true); // Show laptop table after data is fetched
      }
    } catch (error) {
      console.error('Error:', error);
      setSnackbarMessage('Error fetching data. Please try again.');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

 // Fetch the user data based on the search query (name, email, or ID)
  const fetchUserData = async () => {
    const url = "https://script.google.com/macros/s/AKfycbzoDFfHvdHiX4P6UqzTr_ZZZ7ouaSRHIjmfT5cNEgZLHruYDTUP2QlfqqimeokdLEhP/exec";
    setLoading(true);
    try {
      const response = await fetch(`${url}?userIdQuery=${userIdQuery}&userQuery=${userQuery}&type=getUserData`, {
        method: 'GET',
      });
      const result = await response.json();

      const filteredResult = result.filter(user =>
        (user.name && user.name.toLowerCase().includes(userQuery.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(userQuery.toLowerCase())) ||
        (user.id && user.id.parseInt() === userIdQuery.parseInt())
      );
      
      setUserData(filteredResult); // Set the filtered user data
      setShowUserTable(true); // Show user table after data is fetched
    } catch (error) {
      console.error('Error:', error);
      setSnackbarMessage('Error fetching user data. Please try again.');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };
// const fetchUserData = async () => {
//     const url = "https://script.google.com/macros/s/AKfycbzoDFfHvdHiX4P6UqzTr_ZZZ7ouaSRHIjmfT5cNEgZLHruYDTUP2QlfqqimeokdLEhP/exec";
//     setLoading(true);
//     try {
//       const response = await fetch(`${url}?userIdQuery=${userIdQuery}&userQuery=${userQuery}&type=getUserData`, {
//         method: 'GET',
//       });
//       const result = await response.json();
  
//       // Ensure userIdQuery is an integer if it needs to be compared as such
//       const userIdQueryInt = parseInt(userIdQuery, 10);
  
//       // Filter the user data based on the userIdQuery and userQuery
//       const filteredResult = result.filter(user => {
//         const userId = user.id ? parseInt(user.id, 10) : null;
  
//         return (
//           (user.name && user.name.toLowerCase().includes(userQuery.toLowerCase())) ||
//           (user.email && user.email.toLowerCase().includes(userQuery.toLowerCase())) ||
//           (userId !== null && userId === userIdQueryInt)
//         );
//       });
  
//       if (filteredResult.length === 0) {
//         setSnackbarMessage('User ID does not exist.');
//         setSnackbarOpen(true);
//         setShowUserTable(false); // Hide user table if no data is found
//       } else {
//         setUserData(filteredResult); // Set the filtered user data
//         setShowUserTable(true); // Show user table after data is fetched
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       setSnackbarMessage('Error fetching user data. Please try again.');
//       setSnackbarOpen(true);
//     } finally {
//       setLoading(false);
//     }
//   };
  
  const handleLaptopSearch = () => {
    if (!idQuery.match(/^[A-Z]{4}-[A-Z]{3}-\d{2}$/)) {
      setSnackbarMessage('Please provide a valid full Laptop ID in the format: XXXX-XXX-XX.');
      setSnackbarOpen(true);
    } else {
      fetchLaptopData(); // Fetch laptop data based on the queries
    }
  };

  const handleUserSearch = () => {
    fetchUserData(); // Fetch the user data based on the query
  };

  const handleReset = () => {
    setIdQuery('');
    setMacQuery('');
    setUserIdQuery('');
    setUserQuery('');
    setData([]); // Clear laptop data
    setShowTable(false); // Hide laptop table after reset
    setUserData([]); // Clear user data
    setShowUserTable(false); // Hide user table if reset
    setShowUserDetails(false); // Hide user details section if reset
  };

  const handleAssignToUser = () => {
    setShowUserDetails(true); // Show user details section
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false); // Close Snackbar
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

      {/* Laptop Identification Section */}
      <Typography variant="h5" gutterBottom>
        Laptop Identification (Search by Laptop ID or MAC Address)
      </Typography>
      <Box display="flex" flexDirection="column" marginBottom={2}>
        <TextField
          label="Enter Laptop ID"
          variant="outlined"
          style={{ width: '50%' }}
          value={idQuery}
          onChange={(e) => setIdQuery(e.target.value)}
        />
        <TextField
          label="Enter MAC Address"
          variant="outlined"
          style={{ width: '50%', marginTop: '10px' }}
          value={macQuery}
          onChange={(e) => setMacQuery(e.target.value)}
        />
        
      </Box>

      
            <Box display="flex"  alignItems="center" marginTop={2}>
              <Box>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleLaptopSearch}
                    disabled={!idQuery && !macQuery}
                  >
                   Search
                   </Button>
                </Box>
                    <Box marginLeft={3}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={handleReset}
                      >
                        Reset
                    </Button>
                  </Box>
                </Box>

      {/* Laptop Table */}
      {showTable && data.length > 0 && (
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
                      <TableCell key={header}>{row[header] || 'N/A'}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box display="flex" justifyContent="center" marginTop={2}>
            <Button variant="contained" color="primary" onClick={handleAssignToUser}>
              Assign to User
            </Button>
          </Box>
        </>
      )}

      {/* User Details Section */}
      {showUserDetails && (
        <Container maxWidth="lg" style={{ marginTop: '50px' }}>
          <Typography variant="h5" gutterBottom>
            User Details
          </Typography>
          <Box display="flex" marginBottom={2}>
            <TextField
              label="Search by User ID, Name, or Email"
              variant="outlined"
              style={{ width: '50%' }}
              value={userIdQuery}
              onChange={(e) => setUserIdQuery(e.target.value)}
            />
            </Box>
            

            <Box display="flex"  alignItems="center" marginTop={2}>
            <Box>
              <Button
                variant="contained"
                color="primary"
                onClick={handleUserSearch}
                disabled={!userIdQuery && !userQuery}
              >
                Search
              </Button>
            </Box>
          

          <Box marginLeft={5} >
            <Button variant="outlined" color="secondary" onClick={handleReset}>
              Reset
            </Button>
          </Box>
              </Box>
          {/* User Table */}
          {showUserTable && userData.length > 0 && (
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
                        <TableCell key={header}>{row[header] || 'N/A'}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
            </TableContainer>

            
          )}
           <Box display="flex" justifyContent="center" marginTop={2}>
             <Button
               variant="contained"
               color="primary"
               onClick={AssignToUser}
            >
              Submit data
             </Button>
           </Box>
        </Container>
        
      )}

      {/* Snackbar for messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarMessage.includes('Error') ? 'error' : 'success'}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DataAssignmentForm;
