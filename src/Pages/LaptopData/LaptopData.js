// Pending tasks, design fix, and code cleanup, table is comming without clicking on search button
// while adding any id itis showing data more then one
// search should be work with mac, id ,name, email no,etc
// if the usersearch is open so the assig to user button should hide
// if both selected data should go in the correct sheet
// need to add snackbar for success and error message
// need to add loader
// need to add validation for the input field
// if data submit evertthing should vanish
// have a testing for the code


import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const DataAssignmentForm = () => {
  const [idQuery, setIdQuery] = useState('');
  const [userQuery, setUserQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]); // Laptop data
  const [userData, setUserData] = useState([]); // User data
  const [showTable, setShowTable] = useState(false); // Control laptop table visibility
  const [showUserTable, setShowUserTable] = useState(false); // Control user table visibility
  const [showUserDetails, setShowUserDetails] = useState(false); // Control user details section visibility

  // Function to send a POST request to Google Apps Script Web App
  const AssignToUser = async () => {
    //   const url = "https://script.google.com/macros/s/AKfycbyFSqHccZqfs0MH5F7I_CQO20_Ar2Tfbos8pU-zSs4ARN38ecBCg7-hk2Tltp7XB_E9EA/exec";  // Replace with the Web App URL
       const url = "https://script.google.com/macros/s/AKfycbxDcI2092h6NLFcV2yvJN-2NaHVp1jc9_T5qs0ntLDcltIdRRZw5nfHiZTT9prPLQsf2g/exec";  // Replace with the Web App URL
   
       
   
       const requestBody = JSON.stringify({ 
        laptopId: idQuery, // Laptop ID to be added
        userId: userQuery,     // User ID to be added
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
           mode: 'no-cors'
         });
   
         const result = await response.text();
         console.log("aman king");
       //   setResponseMessage(result);  // Show success message
       } catch (error) {
       //   setResponseMessage('Error occurred while submitting');
       }
     };

  // Fetch the laptop data based on the search query (ID or MAC address)
  useEffect(() => {
    if (!idQuery) return;

    const url = "https://script.google.com/macros/s/AKfycbzoDFfHvdHiX4P6UqzTr_ZZZ7ouaSRHIjmfT5cNEgZLHruYDTUP2QlfqqimeokdLEhP/exec";
    setLoading(true);
    const fetchData = async () => {
      try {
        const response = await fetch(`${url}?idQuery=${idQuery}&type=getLaptopData`, {
          method: 'GET',
        });
        const result = await response.json();
        setData(result); // Set the laptop data
        setShowTable(true); // Show laptop table after data is fetched
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [idQuery]);

  console.log(idQuery,userQuery);
  
  // Fetch the user data based on the search query (e.g., User ID or email)
  useEffect(() => {
    if (!userQuery) return;

    const url = "https://script.google.com/macros/s/AKfycbzoDFfHvdHiX4P6UqzTr_ZZZ7ouaSRHIjmfT5cNEgZLHruYDTUP2QlfqqimeokdLEhP/exec";
    setLoading(true);
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${url}?idQuery=${userQuery}&type=getUserData`, {
          method: 'GET',
        });
        const result = await response.json();
        setUserData(result); // Set the user data
        setShowUserTable(true); // Show user table after data is fetched
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [userQuery]);

  const handleSearch = () => {
    setShowTable(true); // Show table only after search is clicked
  };

  const handleUserSearch = () => {
    setShowUserTable(true); // Show user table only after search is clicked
  };

  const handleReset = () => {
    setIdQuery('');
    setData([]); // Clear data
    setShowTable(false); // Hide table after reset
    setUserQuery(''); // Clear user query
    setUserData([]); // Clear user data
    setShowUserTable(false); // Hide user table if reset
    setShowUserDetails(false); // Hide user details section if reset
  };

  const handleAssignToUser = () => {
    setShowUserDetails(true); // Show user details section
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

      <Box display="flex" flexDirection="column" alignItems="center" marginBottom={2}>
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
        </Box>
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
          {!showUserDetails && 
          <Box display="flex" justifyContent="center" marginTop={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAssignToUser}
            >
              Assign to User
            </Button>
          </Box>
          }
        </>
      )}

      {/* User Details Section */}
      {showUserDetails && (
        <Container maxWidth="lg" style={{ marginTop: '50px' }}>
          <Typography variant="h5" gutterBottom>
            User Details
          </Typography>

          <Box display="flex" flexDirection="column" alignItems="center" marginBottom={2}>
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
            </Box>
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
          {showUserTable && userData.length > 0 && (<>
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
    </Container>
  );
};

export default DataAssignmentForm;

