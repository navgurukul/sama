import { 
    Container, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper, 
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button
  } from '@mui/material';
  import React, { useState, useEffect } from 'react';
  
  const OpsWelcome = () => {
      const [laptopsWithComments, setLaptopsWithComments] = useState([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
      const [selectedLaptop, setSelectedLaptop] = useState(null);
      const [openDialog, setOpenDialog] = useState(false);
  
      useEffect(() => {
          const fetchData = async () => {
              try {
                  const response = await fetch(`${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`);
                  if (!response.ok) {
                      throw new Error(`HTTP error! status: ${response.status}`);
                  }
                  const result = await response.json();
                  
                  if (result && Array.isArray(result)) {
                      const filtered = result.filter(laptop => 
                          laptop['Comment for the Issues'] && laptop['Comment for the Issues'].trim() !== ''
                      );
                      setLaptopsWithComments(filtered);
                  }
              } catch (err) {
                  setError(err.message);
              } finally {
                  setLoading(false);
              }
          };
  
          fetchData();
      }, []);
  
      const handleRowClick = (laptop) => {
          setSelectedLaptop(laptop);
          setOpenDialog(true);
      };
  
      const handleCloseDialog = () => {
          setOpenDialog(false);
      };
  
      const handleIssueResponse = (isFixed) => {
        if (isFixed) {
            const SavedData = JSON.parse(localStorage.getItem('_AuthSama_'));
            const userEmail = SavedData?.[0]?.email || "Email not found";       
            const now = new Date();
            const formattedDateTime = now.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });
            console.log(`Laptop ID: ${selectedLaptop.ID}`);
            console.log(`Action: Marked as FIXED`);
            console.log(`Action By: ${userEmail}`);
            console.log(`Local Time: ${formattedDateTime}`);
        } else {
            console.log(`Issue NOT fixed for laptop ${selectedLaptop.ID}`);
        }
        handleCloseDialog();
    };
  
      if (loading) return <Container maxWidth="lg"><Typography>Loading...</Typography></Container>;
      if (error) return <Container maxWidth="lg"><Typography color="error">Error: {error}</Typography></Container>;
  
      return (
          <Container maxWidth="xl" sx={{ padding: '20px' }}>
              <Typography variant="h6" gutterBottom>Laptops with Issue Comments</Typography>
              <Typography variant="subtitle1" gutterBottom sx={{ mb: 3 }}>
                  {laptopsWithComments.length} laptop{laptopsWithComments.length !== 1 ? 's' : ''} with comments found
              </Typography>
  
              {laptopsWithComments.length > 0 ? (
                  <TableContainer component={Paper} sx={{ maxHeight: '80vh' }}>
                      <Table stickyHeader>
                          <TableHead>
                              <TableRow>
                                  <TableCell><strong>ID</strong></TableCell>
                                  <TableCell><strong>Processor</strong></TableCell>
                                  <TableCell><strong>Battery</strong></TableCell>
                                  <TableCell><strong>Assigned To</strong></TableCell>
                                  <TableCell><strong>Donated To</strong></TableCell>
                                  <TableCell><strong>Comment</strong></TableCell>
                                  <TableCell><strong>Last Updated</strong></TableCell>
                              </TableRow>
                          </TableHead>
                          <TableBody>
                              {laptopsWithComments.map((laptop, index) => (
                                  <TableRow 
                                      key={index} 
                                      hover 
                                      onClick={() => handleRowClick(laptop)}
                                      sx={{ cursor: 'pointer' }}
                                  >
                                      <TableCell>{laptop.ID}</TableCell>
                                      <TableCell>{laptop.Processor || 'N/A'}</TableCell>
                                      <TableCell>
                                          {laptop['Battery Capacity'] ? 
                                              `${Math.round(laptop['Battery Capacity'] * 100)}%` : 'N/A'}
                                      </TableCell>
                                      <TableCell>{laptop['Assigned To'] || 'N/A'}</TableCell>
                                      <TableCell>{laptop['Donated To'] || 'N/A'}</TableCell>
                                      <TableCell sx={{ maxWidth: '250px', whiteSpace: 'pre-wrap' }}>
                                          {laptop['Comment for the Issues']}
                                      </TableCell>
                                      <TableCell>
                                          {laptop['Last Updated On'] ? 
                                              new Date(laptop['Last Updated On']).toLocaleDateString() : 'N/A'}
                                      </TableCell>
                                  </TableRow>
                              ))}
                          </TableBody>
                      </Table>
                  </TableContainer>
              ) : (
                  <Typography variant="body1">No laptops with issue comments found</Typography>
              )}
  
              {/* Dialog for issue confirmation */}
              <Dialog open={openDialog} onClose={handleCloseDialog}>
                  <DialogTitle>Issue Resolution</DialogTitle>
                  <DialogContent>
                      {selectedLaptop && (
                          <>
                              {/* <Typography variant="h6" gutterBottom> */}
                                  {/* {selectedLaptop['Manufacturer Model'] || 'Unknown Model'} */}
                              {/* </Typography> */}
                              <Typography variant="body1" gutterBottom>
                                  Is the issue fixed?
                              </Typography>
                              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                  {selectedLaptop['Comment for the Issues']}
                              </Typography>
                          </>
                      )}
                  </DialogContent>
                  <DialogActions>
                      <Button 
                          onClick={() => handleIssueResponse(false)} 
                          color="error"
                          variant="outlined"
                      >
                          No
                      </Button>
                      <Button 
                          onClick={() => handleIssueResponse(true)} 
                          color="primary"
                          variant="contained"
                      >
                          Yes
                      </Button>
                  </DialogActions>
              </Dialog>
          </Container>
      );
  };
  
  export default OpsWelcome;