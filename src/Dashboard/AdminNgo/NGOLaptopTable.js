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
  InputLabel,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

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
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [currentLaptop, setCurrentLaptop] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [savingComment, setSavingComment] = useState(false);
  
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
        // Initialize Comment for the Issues field if it doesn't exist
        const dataWithComments = data.map(laptop => ({
          ...laptop,
          "Comment for the Issues": laptop["Comment for the Issues"] || ""
        }));
        setLaptopData(dataWithComments);
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
        laptop["Donated To"] &&
        selectedNgo.organizationName &&
        laptop["Donated To"] === selectedNgo.organizationName
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

  const handleOpenCommentDialog = (laptop) => {
    setCurrentLaptop(laptop);
    setCommentText(laptop["Comment for the Issues"] || '');
    setCommentDialogOpen(true);
  };

  const handleCloseCommentDialog = () => {
    setCommentDialogOpen(false);
    setCurrentLaptop(null);
    setCommentText('');
  };

  const handleCommentChange = (event) => {
    setCommentText(event.target.value);
  };
  
  const handleSaveComment = async () => {
    if (!currentLaptop) return;
    
    setSavingComment(true);
    
    try {
      // Create a complete payload with all laptop fields, but update only the comment
      const payload = {
        type: "laptopLabeling",
        id: currentLaptop.ID,
        working: currentLaptop.Working || "",
        status: currentLaptop.Status || "",
        assignedTo: currentLaptop["Assigned To"] || "",
        donatedTo: currentLaptop["Donated To"] || "",
        donorCompanyName: currentLaptop["Donor Company Name"] || "",
        ram: currentLaptop.RAM || "",
        rom: currentLaptop.ROM || "",
        manufacturerModel: currentLaptop["Manufacturer Model"] || "",
        inventoryLocation: currentLaptop["Inventory Location"] || "",
        macAddress: currentLaptop["Mac address"] || "",
        processor: currentLaptop.Processor || "",
        others: currentLaptop.Others || "",
        laptopWeight: currentLaptop["laptop weight"] || "",
        conditionStatus: currentLaptop["Condition Status"] || "",
        manufacturingDate: currentLaptop["Manufacturing Date"] || "",
        majorIssue: currentLaptop.MajorIssue || "",
        minorIssue: currentLaptop.MinorIssue || "",
        batteryCapacity: currentLaptop["Battery Capacity"] || "",
        lastUpdatedOn: currentLaptop["Last Updated On"] || new Date().toISOString().split('T')[0],
        lastUpdatedBy: currentLaptop["Last Updated By"] || "System",
        comment: commentText  // Updated comment value
      };
      
      const response = await fetch(`${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: "no-cors",
        body: JSON.stringify(payload)
      });
      
      // For no-cors mode, we won't be able to check response.ok
      // So we'll assume it succeeded and update the UI accordingly
      
      // Update the local state with the new comment
      const updatedLaptopData = laptopData.map(laptop => {
        if (laptop.ID === currentLaptop.ID) {
          return {
            ...laptop,
            "Comment for the Issues": commentText
          };
        }
        return laptop;
      });
      
      setLaptopData(updatedLaptopData);
      handleCloseCommentDialog();
      
      setSnackbarMessage('Comment saved successfully');
      setSnackbarSeverity('success');
    } catch (err) {
      console.error('Error saving comment:', err);
      setSnackbarMessage(`Error: ${err.message}`);
      setSnackbarSeverity('error');
    } finally {
      setSavingComment(false);
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        NGO Laptop Distribution Management
      </Typography>
      
      {ngoData && ngoData.length > 0 && (
        <FormControl sx={{ mb: 3 }}>
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
              <TableCell>Comment for the Issues</TableCell>
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
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          mr: 1,
                          maxWidth: 150,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {laptop["Comment for the Issues"] || "-"}
                      </Typography>
                      <IconButton 
                        color="primary" 
                        onClick={() => handleOpenCommentDialog(laptop)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={11} align="center">
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

      {/* Comment Edit Dialog */}
      <Dialog 
        open={commentDialogOpen} 
        onClose={handleCloseCommentDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Edit Comment for Laptop {currentLaptop?.ID}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Comment for the Issues"
            fullWidth
            multiline
            rows={4}
            value={commentText}
            onChange={handleCommentChange}
            disabled={savingComment}
            placeholder="Enter any issues or comments about this laptop..."
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCommentDialog} disabled={savingComment}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveComment} 
            color="primary" 
            disabled={savingComment}
            variant="contained"
          >
            {savingComment ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default NGOLaptopTable;