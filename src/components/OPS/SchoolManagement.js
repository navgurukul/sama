import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress
} from '@mui/material';

const SchoolManagement = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    school_id: '',
    name: '',
    city: '',
    partner_name: ''
  });

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/schools');
      const data = await res.json();
      if (data.status === 'success') {
        setSchools(data.data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.status === 'success') {
        setOpen(false);
        fetchSchools();
        setFormData({ school_id: '', name: '', city: '', partner_name: '' });
      } else {
        alert("Error saving school: " + data.message);
      }
    } catch(err) {
      alert("Network error.");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>School Management</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>Add School</Button>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>School ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>School Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>City</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Mapped NGO</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {schools.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell>{row.school_id}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.city}</TableCell>
                  <TableCell>{row.partner_name || "N/A"}</TableCell>
                </TableRow>
              ))}
              {schools.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">No schools found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add / Update School</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="School ID (UDISE)"
            name="school_id"
            fullWidth
            value={formData.school_id}
            onChange={handleChange}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            label="School Name"
            name="name"
            fullWidth
            value={formData.name}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="City"
            name="city"
            fullWidth
            value={formData.city}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Partner NGO Name"
            name="partner_name"
            fullWidth
            value={formData.partner_name}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SchoolManagement;
