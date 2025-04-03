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
    Chip,
    Avatar
  } from '@mui/material';
  import React, { useState, useEffect } from 'react';
  
  const OpsWelcome = () => {
      const [laptopsWithComments, setLaptopsWithComments] = useState([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
  
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
                                  <TableCell><strong>Model</strong></TableCell>
                                  <TableCell><strong>RAM/ROM</strong></TableCell>
                                  <TableCell><strong>Processor</strong></TableCell>
                                  <TableCell><strong>Battery</strong></TableCell>
                                  <TableCell><strong>Donor</strong></TableCell>
                                  <TableCell><strong>Comment</strong></TableCell>
                                  <TableCell><strong>Status</strong></TableCell>
                                  <TableCell><strong>Condition</strong></TableCell>
                                  <TableCell><strong>Location</strong></TableCell>
                                  <TableCell><strong>Last Updated</strong></TableCell>
                              </TableRow>
                          </TableHead>
                          <TableBody>
                              {laptopsWithComments.map((laptop, index) => (
                                  <TableRow key={index} hover>
                                      <TableCell>
                                          <div>{laptop.ID}</div>
                                          {/* {laptop.barcodeUrl && (
                                              <Avatar 
                                                  src={laptop.barcodeUrl} 
                                                  variant="square"
                                                  sx={{ width: 100, height: 30, mt: 1 }}
                                              />
                                          )} */}
                                      </TableCell>
                                      <TableCell>{laptop['Manufacturer Model']}</TableCell>
                                      <TableCell>{laptop.RAM}/{laptop.ROM}</TableCell>
                                      <TableCell>{laptop.Processor || 'N/A'}</TableCell>
                                      <TableCell>
                                          {laptop['Battery Capacity'] ? 
                                              `${Math.round(laptop['Battery Capacity'] * 100)}%` : 'N/A'}
                                      </TableCell>
                                      <TableCell>{laptop['Donor Company Name']}</TableCell>
                                      <TableCell sx={{ maxWidth: '250px', whiteSpace: 'pre-wrap' }}>
                                          {laptop['Comment for the Issues']}
                                      </TableCell>
                                      <TableCell>
                                          <Chip 
                                              label={laptop.Status || 'No status'} 
                                              color={
                                                  laptop.Status === 'Laptop Received' ? 'primary' : 
                                                  laptop.Status === 'Ready for Donation' ? 'success' : 'default'
                                              }
                                              size="small"
                                          />
                                      </TableCell>
                                      <TableCell sx={{ maxWidth: '200px' }}>
                                          {laptop['Condition Status'] || 'N/A'}
                                      </TableCell>
                                      <TableCell>{laptop['Inventory Location'] || 'N/A'}</TableCell>
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
          </Container>
      );
  };
  
  export default OpsWelcome;