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
  const [registrationLaptop, setRegistrationLaptop] = useState([]);
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
  const [selectedMajorIssue, setSelectedMajorIssue] = useState([]);
  const [selectedMinorIssue, setSelectedMinorIssue] = useState([]);
  const [savingComment, setSavingComment] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const majorIssueOptions = [
    "Fan", "Speaker", "Microphone", "Damaged Screen", "Faulty Battery", "Overheating", "Malfunctioning Keyboard",
    "Broken Ports", "Hard Drive Issues", "Defective Motherboard", "Audio Problems", "Graphics Card Issues",
    "Water Damage", "USB Ports", "Camera issue", "Charging point issue", "Fan Error", "Wifi issue"
  ];

  const minorIssuesOptions = [
    "Cosmetic Wear", "Loose Hinges", "Dead Pixels", "Fading Keyboard", "Small Battery Capacity Loss",
    "Minor Software Issues", "Port Wear", "Touchpad Sensitivity", "CMOS Battery", "RAM Issue"
  ];

  // Set initial NGO ID
  useEffect(() => {
    if (ngoData && ngoData.length > 0 && !selectedNgoId) {
      setSelectedNgoId(ngoData[0].Id);
    }
  }, [ngoData, selectedNgoId]);

  // Update selected NGO object
  useEffect(() => {
    if (ngoData && selectedNgoId) {
      const ngo = ngoData.find(n => n.Id === selectedNgoId);
      setSelectedNgo(ngo);
    } else {
      setSelectedNgo(null);
    }
  }, [ngoData, selectedNgoId]);

  // Fetch laptops for selected NGO
  useEffect(() => {
    const fetchRegistrationLaptops = async () => {
      if (!selectedNgoId) return;
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${process.env.REACT_APP_NgoInformationApi}?type=laptopinfo&id=${selectedNgoId}`
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();

        if (Array.isArray(result.laptops)) {
          const dataWithComments = result.laptops.map(laptop => ({
            ...laptop,
            "Comment for the Issues": laptop["Comment for the Issues"] || "",
            "MajorIssue": laptop["MajorIssue"] ? (Array.isArray(laptop["MajorIssue"]) ? laptop["MajorIssue"] : [laptop["MajorIssue"]]) : [],
            "MinorIssue": laptop["MinorIssue"] ? (Array.isArray(laptop["MinorIssue"]) ? laptop["MinorIssue"] : [laptop["MinorIssue"]]) : []
          }));
          setRegistrationLaptop(dataWithComments);
        } else {
          setRegistrationLaptop([]);
        }
      } catch (err) {
        console.error("Error fetching registration laptops:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrationLaptops();
  }, [selectedNgoId]);

  // Filter laptops based on search query
  useEffect(() => {
    let filtered = registrationLaptop.filter(laptop => laptop["Allocated To"] && laptop["Allocated To"].trim() !== "");
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(laptop =>
        (laptop.ID && laptop.ID.toString().toLowerCase().includes(query)) ||
        (laptop["Donor Company Name"] && laptop["Donor Company Name"].toLowerCase().includes(query)) ||
        (laptop["Manufacturer Model"] && laptop["Manufacturer Model"].toLowerCase().includes(query)) ||
        (laptop["Mac address"] && laptop["Mac address"].toString().toLowerCase().includes(query)) ||
        (laptop.Status && laptop.Status.toLowerCase().includes(query))
      );
    }
    setFilteredData(filtered);
  }, [registrationLaptop, searchQuery]);

  const handleNgoChange = (event) => setSelectedNgoId(event.target.value);
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Comment dialog handlers
  const handleOpenCommentDialog = (laptop) => {
    setCurrentLaptop(laptop);
    setCommentText(laptop["Comment for the Issues"] || '');
    setSelectedMajorIssue(Array.isArray(laptop["MajorIssue"]) ? laptop["MajorIssue"] : []);
    setSelectedMinorIssue(Array.isArray(laptop["MinorIssue"]) ? laptop["MinorIssue"] : []);
    setCommentDialogOpen(true);
  };
  const handleCloseCommentDialog = () => {
    setCommentDialogOpen(false);
    setCurrentLaptop(null);
    setCommentText('');
    setSelectedMajorIssue([]);
    setSelectedMinorIssue([]);
  };
  const handleCommentChange = (event) => {
    setCommentText(event.target.value);
  };

  const handleMajorIssueChange = (event) => {
    setSelectedMajorIssue(event.target.value);
  };

  const handleMinorIssueChange = (event) => {
    setSelectedMinorIssue(event.target.value);
  };


  // Save comment and issues
  const handleSaveComment = async () => {
    if (!currentLaptop) return;

    setSavingComment(true);

    // Format the combined comment with selected issues
    let combinedComment = commentText.trim() || "";

    if (selectedMajorIssue.length > 0) {
      combinedComment += `\nMajor Issues: ${selectedMajorIssue.join(", ")}`;
    }

    if (selectedMinorIssue.length > 0) {
      combinedComment += `\nMinor Issues: ${selectedMinorIssue.join(", ")}`;
    }

    try {
      // Create a complete payload with all laptop fields, but update the comment and issues
      const payload = {
        type: "laptopLabeling",
        id: currentLaptop.ID,
        working: currentLaptop.Working || "",
        status: currentLaptop.Status || "",
        assignedTo: currentLaptop["Assigned To"] || "",
        donatedTo: currentLaptop["Allocated To"] || "",
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
        majorIssue: selectedMajorIssue,
        minorIssue: selectedMinorIssue,
        batteryCapacity: currentLaptop["Battery Capacity"] || "",
        lastUpdatedOn: currentLaptop["Last Updated On"] || new Date().toISOString().split('T')[0],
        lastUpdatedBy: currentLaptop["Last Updated By"] || "System",
        comment: combinedComment  // Updated combined comment value
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

      // Update the local state with the new comment and issues
      const updatedLaptopData = registrationLaptop.map(laptop => {
        if (laptop.ID === currentLaptop.ID) {
          return {
            ...laptop,
            "Comment for the Issues": combinedComment,
            "MajorIssue": selectedMajorIssue,
            "MinorIssue": selectedMinorIssue
          };
        }
        return laptop;
      });

      setRegistrationLaptop(updatedLaptopData);
      handleCloseCommentDialog();

      setSnackbarMessage('Data saved successfully');
      setSnackbarSeverity('success');
    } catch (err) {
      console.error('Error saving data:', err);
      setSnackbarMessage(`Error: ${err.message}`);
      setSnackbarSeverity('error');
    } finally {
      setSavingComment(false);
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => setSnackbarOpen(false);

  const displayIssueTags = (laptop) => {
    const tags = [];
    if (laptop.MajorIssue && laptop.MajorIssue.length > 0) {
      tags.push(<Chip key="major" label={`Major: ${laptop.MajorIssue.join(", ")}`} size="small" color="error" sx={{ mr: 0.5, mb: 0.5 }} />);
    }
    if (laptop.MinorIssue && laptop.MinorIssue.length > 0) {
      tags.push(<Chip key="minor" label={`Minor: ${laptop.MinorIssue.join(", ")}`} size="small" color="warning" sx={{ mr: 0.5, mb: 0.5 }} />);
    }
    return tags.length > 0 ? <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 1 }}>{tags}</Box> : null;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h5" gutterBottom align="center" mb={6}>Assigned Laptops</Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField label="Search laptops..." variant="outlined" size="small" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />

        {ngoData && ngoData.length > 0 && (
          <FormControl size="small">
            <InputLabel>Select NGO</InputLabel>
            <Select value={selectedNgoId} onChange={handleNgoChange}>
              {ngoData.map((ngo) => (
                <MenuItem key={ngo.Id} value={ngo.Id}>{ngo.organizationName} ({ngo.Id})</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

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
              <TableCell>Issues & Comments</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.length > 0 ? filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((laptop, index) => (
              <TableRow key={laptop.ID || index} hover>
                <TableCell>{laptop.ID}</TableCell>
                <TableCell>{laptop.Date || "-"}</TableCell>
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
                <TableCell>
                  {laptop['Battery Capacity'] !== undefined && laptop['Battery Capacity'] !== null
                    ? `${Math.round(
                      laptop['Battery Capacity'] > 1
                        ? laptop['Battery Capacity']
                        : laptop['Battery Capacity'] * 100
                    )}%`
                    : 'N/A'}
                </TableCell>
                <TableCell>{laptop["Inventory Location"]}</TableCell>
                <TableCell>{laptop.Status}</TableCell>
                <TableCell>{laptop["Date of laptop Assignment"] || "-"}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    {displayIssueTags(laptop)}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ mr: 1, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {laptop["Comment for the Issues"] || "-"}
                      </Typography>
                      <IconButton color="primary" onClick={() => handleOpenCommentDialog(laptop)} size="small"><EditIcon /></IconButton>
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={11} align="center">{loading ? 'Loading data...' : 'No data available.'}</TableCell>
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

      {/* Comment & Issue Dialog */}
      <Dialog open={commentDialogOpen} onClose={handleCloseCommentDialog} fullWidth>
        <DialogTitle>Comment & Issue Selection</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Major Issues</InputLabel>
            <Select multiple value={selectedMajorIssue} onChange={handleMajorIssueChange} renderValue={(selected) => selected.join(", ")}>
              {majorIssueOptions.map(issue => <MenuItem key={issue} value={issue}>{issue}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Minor Issues</InputLabel>
            <Select multiple value={selectedMinorIssue} onChange={handleMinorIssueChange} renderValue={(selected) => selected.join(", ")}>
              {minorIssuesOptions.map(issue => <MenuItem key={issue} value={issue}>{issue}</MenuItem>)}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Comment"
            multiline
            rows={3}
            value={commentText}
            onChange={handleCommentChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCommentDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveComment} disabled={savingComment}>
            {savingComment ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>{snackbarMessage}</Alert>
      </Snackbar>
    </Container>
  );
}

export default NGOLaptopTable;
