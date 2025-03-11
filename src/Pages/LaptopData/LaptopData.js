// // while adding any id itis showing data more then one
// // search should be work with id ,name, email no,etc

import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,CircularProgress, Paper, Snackbar, Alert } from '@mui/material';

const DataAssignmentForm = () => {
  const [idQuery, setIdQuery] = useState('');
  const [macQuery, setMacQuery] = useState('');
  const [userIdQuery, setUserIdQuery] = useState('');
    // const [emailQuery, setEmailQuery] = useState('');
    // const [contactQuery, setContactQuery] = useState('');
const [selectedLaptopId, setSelectedLaptopId] = useState(null); // Store selected laptopId
const [selectedUserId, setSelectedUserId] = useState(null); // Store selected userId
  const [userQuery, setUserQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(false);
  const [submitLoading, setSumbitLoading] = useState(false);
  const [data, setData] = useState([]); // Laptop data
  const [userData, setUserData] = useState([]); // User data
  const [showTable, setShowTable] = useState(false); // Control laptop table visibility
  const [showUserTable, setShowUserTable] = useState(false); // Control user table visibility
  const [showUserDetails, setShowUserDetails] = useState(false); // Control user details section visibility
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Snackbar visibility
  const [snackbarMessage, setSnackbarMessage] = useState(''); // Snackbar message
  const [snackbarType, setSnackbarType] = useState("success"); 
  
  // Function to send a POST request to Google Apps Script Web App
  const AssignToUser = async () => {
    const url =  `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}`;
    // const url = "https://script.google.com/macros/s/AKfycbxDcI2092h6NLFcV2yvJN-2NaHVp1jc9_T5qs0ntLDcltIdRRZw5nfHiZTT9prPLQsf2g/exec";  // Replace with the Web App URL
    setSumbitLoading(true);
    const requestBody = JSON.stringify({
      laptopId: selectedLaptopId,
      userId: selectedUserId,
    //   laptopId: idQuery,
    //   userId: userIdQuery,
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
      setSnackbarMessage("Data submitted successfully.");
      setSnackbarOpen(true);
      setSumbitLoading(false);
      setIdQuery('');
        setMacQuery('');
        setUserIdQuery('');
        setUserQuery('');
        setData([]); 
        setShowTable(false); 
        setUserData([]); 
        setShowUserTable(false); 
        setShowUserDetails(false); 
        setSelectedLaptopId("");
        setSnackbarType('success');
    } catch (error) {
      console.error('Error submitting data:', error);
      setSnackbarMessage('Error submitting data. Please try again.');
      setSnackbarOpen(true);
    }
  };

//   // Fetch the laptop data based on the search query (ID or MAC address)
  const fetchLaptopData = async () => {
    const url =  `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}`;
    // const url = "https://script.google.com/macros/s/AKfycbzoDFfHvdHiX4P6UqzTr_ZZZ7ouaSRHIjmfT5cNEgZLHruYDTUP2QlfqqimeokdLEhP/exec";
    setLoading(true);
    try {
      const response = await fetch(`${url}?idQuery=${idQuery}&macQuery=${macQuery}&type=getLaptopData`, {
        method: 'GET',
      });
      const result = await response.json(); 
          // console.log(result);
          
      if (result.length === 0 ||result.length > 1) {
        setSnackbarMessage('No Tagged data available for the given Laptop ID or MAC Address');
        setSnackbarOpen(true);
        setShowTable(false);
        setSnackbarType('error');
      } else {
        if (result[0].Status === "Laptop Assigned"){
            setSnackbarMessage('This data is already assigned.');
            setSnackbarType('error');
            setSnackbarOpen(true);
        }
        else if (result[0].Status === "Tagged"){
            setData(result); 
            setSelectedLaptopId(result[0].ID);
            setShowTable(true);
            setSnackbarType('success');
        }
        else{
            setSnackbarMessage('The Laptop is not tagged yet.');
            setSnackbarOpen(true);
            setSnackbarType('error');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setSnackbarMessage('Error fetching data. Please try again.');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

 // Fetch the user data based on the search query (Contact, email, or ID)
  const fetchUserData = async () => {
        setUserLoading(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getUserData&userIdQuery=${userIdQuery}`)
        // `https://script.google.com/macros/s/AKfycbxDcI2092h6NLFcV2yvJN-2NaHVp1jc9_T5qs0ntLDcltIdRRZw5nfHiZTT9prPLQsf2g/exec?type=getUserData&userIdQuery=${userIdQuery}`)
      const result = await response.json();

    //   setUserData(result);
    //   setSelectedUserId(result[0].ID);
    //   setShowUserTable(true); // Show user table after data is fetched

    if (result.length === 0) {
        setSnackbarMessage('No user found for the given ID, email, or contact.');
        setSnackbarOpen(true);
        setSnackbarType('error');
        setShowUserTable(false);
      } else if (result.length > 1) {
        setSnackbarMessage('Multiple users found, please narrow your search.');
        setSnackbarOpen(true);
        setSnackbarType('error');
      } else {
        setUserData(result);
        setSelectedUserId(result[0].ID);
        setShowUserTable(true);
        setSnackbarType('success');
      }
    } catch (error) {
      console.error('Error:', error);
      setSnackbarMessage('Error fetching user data. Please try again.');
      setSnackbarOpen(true);
    } finally {
      setUserLoading(false);
    }
  };
  
  const handleLaptopSearch = () => {
    fetchLaptopData();
  };

  const handleUserSearch = () => {
    fetchUserData(); 
  };

  const handleReset = () => {
    setIdQuery('');
    setMacQuery('');
    setUserQuery('');
    setData([]); 
    setShowTable(false); 
    setUserData([]); 
    setShowUserTable(false); 
    setShowUserDetails(false); 
  };

  const resetUser = () => {
    setUserIdQuery('');
    setUserData([]);
  };
  const handleAssignToUser = () => {
    setShowUserDetails(true); 
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false); 
  };

  // Extract headers from the first object in the data array (for laptop data)
  const laptopHeaders = data.length > 0 ? Object.keys(data[0]) : [];
  // Extract headers from the first object in the user data array (for user data)
  const userHeaders = userData.length > 0 ? Object.keys(userData[0]) : [];

  return (
    <Container maxWidth="lg" sx={{ mt: 5,mb: '1000px', marginBottom: '100px !important' }}
    >
      <Typography variant="h4" gutterBottom align='center'>
        Data Assignment Form
      </Typography>

      {/* Laptop Identification Section */}
      <Typography variant="h5" gutterBottom align='center'>
        Laptop Identification 
      </Typography>
      <Box display="flex" flexDirection="raw" marginBottom={2} mt = {8}>
        <TextField
          label="Search By Laptop ID"
          variant="outlined"
          style={{ width: '50%', marginRight: '10px' }}
          value={idQuery}
          onChange={(e) => setIdQuery(e.target.value)}
        />
        <TextField
          label="Search By MAC Address"
          variant="outlined"
          style={{ width: '50%' }}
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
                    {loading ? <CircularProgress size={24} color='white' /> : "Search"}
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
          <TableContainer component={Paper} style={{ marginTop: '40px' }}>
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
          {!showUserDetails && 
          <Box display="flex" justifyContent="center" marginTop={2}>
            <Button variant="contained" color="primary" onClick={handleAssignToUser}>
              Assign to User
            </Button>
          </Box>
                    }
        </>
      )}
      {/* User Details Section */}
      {showUserDetails && (
        <Container maxWidth="lg" style={{ marginTop: '60px', mb: '80px', marginBottom: '100px !important' }} 
        sx = {{mb :10 , marginBottom: '100px !important'}}
        >
          <Typography variant="h5" gutterBottom align = "center">
            User Details
          </Typography>
          <Box display="flex" marginBottom={2} mt = {5}>
            <TextField
              label="Search by User ID, Email, or Contact"
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
                 {userLoading ? <CircularProgress size={24} color='white' /> : "Search"}
              </Button>
            </Box>
          <Box marginLeft={3} >
            <Button variant="outlined" color="secondary" onClick={resetUser}>
              Reset
            </Button>
          </Box>
              </Box>

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
                        <TableCell key={header}>{row[header] || 'N/A'}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
            </TableContainer>
            <Box display="flex" 
            justifyContent="center" 
            marginTop={4} 
            mb = {10 } >
             <Button
               variant="contained"
               color="primary"
               onClick={AssignToUser}
            >
              {submitLoading ? <CircularProgress size={24} color='white' /> : "Submit data"}
             </Button>
             <br /><br />
           </Box>
           </>
            
          )}
           
        </Container>
        
      )}

      {/* Snackbar for messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} 
        severity={snackbarMessage.includes('Error') ? 'error' : 'success'}
        sx={{ backgroundColor: snackbarType === 'error' ? '#FF7F7F' : "#90EE90", color: 'black' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DataAssignmentForm;