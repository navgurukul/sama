import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  TablePagination,
  Container,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';

function NGOLaptopTable({ ngoData }) {
  const [selectedNgoId, setSelectedNgoId] = useState('');
  const [selectedNgo, setSelectedNgo] = useState(null);
  const [laptopData, setLaptopData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  
  useEffect(() => {
    if (ngoData && ngoData.length > 0 && !selectedNgoId) {
      setSelectedNgoId(ngoData[0].Id);
    }
  }, [ngoData, selectedNgoId]);
  
  useEffect(() => {
    if (ngoData && selectedNgoId) {
      const ngo = ngoData.find(n => n.Id === selectedNgoId);
      setSelectedNgo(ngo);
    } else {
      setSelectedNgo(null);
    }
  }, [ngoData, selectedNgoId]);
  
  useEffect(() => {
    const fetchLaptopData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const data = await response.json();
        setLaptopData(data);
      } catch (err) {
        console.error('Error fetching laptop data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLaptopData();
  }, []);

  useEffect(() => {
    if (laptopData.length > 0 && selectedNgo && selectedNgo.organizationName) {
      const filtered = laptopData.filter(laptop => 
        laptop["Assigned To"] &&
        selectedNgo.organizationName &&
        laptop["Assigned To"] === selectedNgo.organizationName
      );
      setFilteredData(filtered);
    } else {
      setFilteredData([]);
    }
  }, [laptopData, selectedNgo]);
  
  const handleNgoChange = (event) => {
    setSelectedNgoId(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        NGO Laptop Distribution Management
      </Typography>
      
      {ngoData && ngoData.length > 0 && (
        <FormControl  sx={{ mb: 3 }}>
          <InputLabel id="ngo-select-label">Select NGO</InputLabel>
          <Select
            labelId="ngo-select-label"
            id="ngo-select"
            value={selectedNgoId}
            label="Select NGO"
            onChange={handleNgoChange}
          >
            {ngoData.map((ngo) => (
              <MenuItem key={ngo.Id} value={ngo.Id}>
                {ngo.organizationName} ({ngo.Id})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <TableContainer component={Paper} elevation={3}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Donor</TableCell>
              <TableCell>Model</TableCell>
              <TableCell>Specs</TableCell>
              <TableCell>Condition</TableCell>
              <TableCell>Battery</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Assignment Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((laptop, index) => (
                <TableRow key={laptop.ID || index} hover>
                  <TableCell>{laptop.ID}</TableCell>
                  <TableCell>{laptop.Date}</TableCell>
                  <TableCell>{laptop["Donor Company Name"]}</TableCell>
                  <TableCell>{laptop["Manufacturer Model"]}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      <strong>Processor:</strong> {laptop.Processor}<br />
                      <strong>RAM:</strong> {laptop.RAM}<br />
                      <strong>Storage:</strong> {laptop.ROM}
                    </Typography>
                  </TableCell>
                  <TableCell>{laptop["Condition Status"]}</TableCell>
                  <TableCell>{laptop["Battery Capacity"] ? `${(laptop["Battery Capacity"] * 100).toFixed(0)}%` : "Unknown"}</TableCell>
                  <TableCell>{laptop["Inventory Location"]}</TableCell>
                  <TableCell>{laptop.Status}</TableCell>
                  <TableCell>{laptop["Date of laptop Assignment"] || "-"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  {loading ? 'Loading data...' : 'No data available.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {filteredData.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
    </Container>
  );
}

export default NGOLaptopTable;