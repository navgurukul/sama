import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, TextField, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, IconButton, Chip, Modal, MenuItem, Select, FormControl, InputLabel, Autocomplete
} from '@mui/material';
import { Edit2, Upload, Plus } from 'lucide-react';

const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh",
  "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry",
  "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export default function SchoolManagement() {
  const [schools, setSchools] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [filterNgos, setFilterNgos] = useState([]);
  const [loadingNgos, setLoadingNgos] = useState(false);
  const [analytics, setAnalytics] = useState({ total_schools: 0, ngos_with_schools: 0, laptops_verified: 0 });
  const [openModal, setOpenModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState("All");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    school_id: '',
    udise: '',
    name: '',
    city: '',
    partner_name: '',
    distribution_host_id: '',
    zipcode: '',
    state: '',
    district: '',
    district_code: '',
    status: ''
  });

  const apiBase = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

  useEffect(() => {
    fetchSchools();
    fetchNgos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPartner]);

  const fetchSchools = async () => {
    try {
      let url = `${apiBase}/api/schools`;
      if (selectedPartner !== "All") {
        url += `?ngo_id=${encodeURIComponent(selectedPartner)}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === 'success') {
        setSchools(data.data || []);
        if (data.analytics) setAnalytics(data.analytics);
        if (selectedPartner === "All") {
          const uniquePartners = [...new Set((data.data || []).map(s => s.partner_name).filter(Boolean))];
          setFilterNgos(uniquePartners);
        }
      }
    } catch (err) {
      console.error("Error fetching schools", err);
    }
  };

  const fetchNgos = async () => {
    setLoadingNgos(true);
    try {
      const ngoApiBase = process.env.REACT_APP_NgoInformationApi || `${apiBase}/ngo-exec`;
      const res = await fetch(`${ngoApiBase}?type=registration`);
      const data = await res.json();
      console.log("Fetched NGOs from ngo-exec:", data);
      if (data.status === 'success' && Array.isArray(data.data)) {
        const uniqueNgos = data.data.map(n => n.organizationName).filter(Boolean);
        setNgos([...new Set(uniqueNgos)]);
        console.log("Populated ngos state:", uniqueNgos);
      }
    } catch (err) {
      console.error("Error fetching NGOs", err);
    } finally {
      setLoadingNgos(false);
    }
  };

  const handleOpenModal = (school = null) => {
    if (school) {
      setFormData(school);
      setIsEditing(true);
    } else {
      setFormData({ 
        id: null, school_id: '', udise: '', name: '', city: '', partner_name: '', 
        distribution_host_id: '', zipcode: '', state: '', district: '', district_code: '', status: ''
      });
      setIsEditing(false);
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`${apiBase}/api/schools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.status === 'success') {
        fetchSchools();
        handleCloseModal();
      } else {
        alert("Error saving school: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save.");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const rows = text.split('\n');
      const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
      
      const parsedData = [];
      for (let i = 1; i < rows.length; i++) {
        const rowText = rows[i].trim();
        if (!rowText) continue;
        
        // Handle basic CSV splitting
        const row = rowText.split(',');
        const obj = {};
        
        headers.forEach((h, idx) => {
          if (h.includes('udise') || h === 'school udise') obj.udise = row[idx]?.trim();
          if (h.includes('school name') || h === 'name') obj.name = row[idx]?.trim();
          if (h.includes('city') || h.includes('location')) obj.city = row[idx]?.trim();
          if (h.includes('ngo') || h.includes('partner')) obj.partner_name = row[idx]?.trim();
          if (h.includes('host id') || h === 'distribution host id') obj.distribution_host_id = row[idx]?.trim();
          if (h.includes('zip') || h.includes('pin')) obj.zipcode = row[idx]?.trim();
          if (h === 'state') obj.state = row[idx]?.trim();
          if (h === 'district') obj.district = row[idx]?.trim();
          if (h.includes('district code')) obj.district_code = row[idx]?.trim();
          if (h === 'status') obj.status = row[idx]?.trim();
        });
        
        if (obj.name) {
          parsedData.push(obj);
        }
      }

      try {
        const res = await fetch(`${apiBase}/api/schools/bulk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsedData)
        });
        const data = await res.json();
        if (data.status === 'success') {
          alert(`Successfully uploaded ${parsedData.length} schools.`);
          fetchSchools();
        } else {
          alert("Error uploading: " + data.message);
        }
      } catch (err) {
        console.error(err);
        alert("Failed to upload CSV.");
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = null;
  };

  return (
    <Box p={4} sx={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Box p={1} bgcolor="#4caf50" borderRadius={1}>
              <Typography color="white" fontWeight="bold">🏫</Typography>
            </Box>
            <Typography variant="h5" fontWeight={600}>School Registry</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Manage schools and accurately map them to NGOs for laptop verification
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button 
            variant="contained" 
            color="success" 
            startIcon={<Upload size={18} />}
            component="label"
          >
            Upload School Details CSV
            <input type="file" hidden accept=".csv" onChange={handleFileUpload} />
          </Button>
          <Button 
            variant="outlined" 
            color="success" 
            startIcon={<Plus size={18} />}
            onClick={() => handleOpenModal()}
          >
            Add School
          </Button>
        </Box>
      </Box>

      {/* Analytics Cards */}
      <Box display="flex" gap={3} mb={4}>
        <Paper elevation={0} sx={{ flex: 1, p: 3, borderRadius: 2, border: "1px solid #e0e0e0" }}>
          <Typography variant="body2" color="text.secondary" mb={1}>Total Schools Registered</Typography>
          <Typography variant="h4" fontWeight={600}>{analytics.total_schools}</Typography>
        </Paper>
        <Paper elevation={0} sx={{ flex: 1, p: 3, borderRadius: 2, border: "1px solid #e0e0e0" }}>
          <Typography variant="body2" color="text.secondary" mb={1}>NGOs with Assigned Schools</Typography>
          <Typography variant="h4" fontWeight={600} color="primary">{analytics.ngos_with_schools}</Typography>
        </Paper>
        <Paper elevation={0} sx={{ flex: 1, p: 3, borderRadius: 2, border: "1px solid #e0e0e0" }}>
          <Typography variant="body2" color="text.secondary" mb={1}>Laptops Verified (AFE/RMS)</Typography>
          <Typography variant="h4" fontWeight={600} color="success.main">{analytics.laptops_verified}</Typography>
        </Paper>
      </Box>

      {/* Filter and Table */}
      <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid #e0e0e0", overflow: 'hidden' }}>
        <Box p={2} borderBottom="1px solid #e0e0e0" display="flex" alignItems="center">
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Partner Name</InputLabel>
            <Select
              value={selectedPartner}
              label="Filter by Partner Name"
              onChange={(e) => setSelectedPartner(e.target.value)}
            >
              <MenuItem value="All">All</MenuItem>
              {filterNgos.map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
              <TableRow>
                <TableCell><Typography variant="subtitle2" fontWeight={600}>School ID</Typography></TableCell>
                <TableCell><Typography variant="subtitle2" fontWeight={600}>School Name</Typography></TableCell>
                <TableCell><Typography variant="subtitle2" fontWeight={600}>Partner Name</Typography></TableCell>
                <TableCell><Typography variant="subtitle2" fontWeight={600}>UDISE Code</Typography></TableCell>
                <TableCell><Typography variant="subtitle2" fontWeight={600}>City</Typography></TableCell>
                <TableCell><Typography variant="subtitle2" fontWeight={600}>State</Typography></TableCell>
                <TableCell><Typography variant="subtitle2" fontWeight={600}>District</Typography></TableCell>
                <TableCell><Typography variant="subtitle2" fontWeight={600}>Dist. Code</Typography></TableCell>
                <TableCell><Typography variant="subtitle2" fontWeight={600}>Zipcode</Typography></TableCell>
                <TableCell><Typography variant="subtitle2" fontWeight={600}>Host ID</Typography></TableCell>
                <TableCell align="center"><Typography variant="subtitle2" fontWeight={600}>Actions</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {schools.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary">No schools found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                schools.map((school) => {
                  return (
                    <TableRow key={school.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>{school.school_id}</Typography>
                      </TableCell>
                      <TableCell color="text.secondary">{school.name}</TableCell>
                      <TableCell>{school.partner_name}</TableCell>
                      <TableCell>
                        <Chip label={school.udise || '-'} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell color="text.secondary">{school.city}</TableCell>
                      <TableCell color="text.secondary">{school.state}</TableCell>
                      <TableCell color="text.secondary">{school.district}</TableCell>
                      <TableCell color="text.secondary">{school.district_code}</TableCell>
                      <TableCell color="text.secondary">{school.zipcode}</TableCell>
                      <TableCell color="text.secondary">{school.distribution_host_id}</TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => handleOpenModal(school)}>
                          <Edit2 size={16} color="#4caf50" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Modal */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 800, minHeight: 400, maxHeight: '90vh', overflowY: 'auto', bgcolor: 'background.paper', borderRadius: 2, boxShadow: 24, p: 4
        }}>
          <Typography variant="h6" mb={3}>{isEditing ? "Edit School" : "Add New School"}</Typography>
          
          <Box display="flex" flexDirection="column" gap={3}>
            <Box display="flex" gap={2}>
              <TextField label="School Name" name="name" value={formData.name} onChange={handleChange} fullWidth size="small" />
              <TextField label="UDISE Code" name="udise" value={formData.udise} onChange={handleChange} fullWidth size="small" />
            </Box>
            <Box display="flex" gap={2}>
              <Autocomplete
                freeSolo
                options={ngos}
                loading={loadingNgos}
                value={formData.partner_name || ''}
                onChange={(event, newValue) => {
                  setFormData(prev => ({ ...prev, partner_name: newValue || '' }));
                }}
                onInputChange={(event, newInputValue) => {
                  setFormData(prev => ({ ...prev, partner_name: newInputValue || '' }));
                }}
                slotProps={{ popper: { sx: { zIndex: 1500 } } }}
                renderInput={(params) => <TextField {...params} label="NGO / Partner Name" name="partner_name" size="small" />}
                fullWidth
              />
              <TextField label="Distribution Host ID" name="distribution_host_id" value={formData.distribution_host_id} onChange={handleChange} fullWidth size="small" />
            </Box>
            <Box display="flex" gap={2}>
              <Autocomplete
                freeSolo
                options={INDIAN_STATES}
                value={formData.state || ''}
                onChange={(event, newValue) => {
                  setFormData(prev => ({ ...prev, state: newValue || '' }));
                }}
                onInputChange={(event, newInputValue) => {
                  setFormData(prev => ({ ...prev, state: newInputValue || '' }));
                }}
                slotProps={{ popper: { sx: { zIndex: 1500 } } }}
                renderInput={(params) => <TextField {...params} label="State" name="state" size="small" />}
                fullWidth
              />
              <TextField label="District" name="district" value={formData.district} onChange={handleChange} fullWidth size="small" />
              <TextField label="District Code" name="district_code" value={formData.district_code} onChange={handleChange} fullWidth size="small" />
            </Box>
            <Box display="flex" gap={2}>
              <TextField label="City" name="city" value={formData.city} onChange={handleChange} fullWidth size="small" />
              <TextField label="Zipcode" name="zipcode" value={formData.zipcode} onChange={handleChange} fullWidth size="small" />
            </Box>
            
            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
              <Button onClick={handleCloseModal} color="inherit">Cancel</Button>
              <Button onClick={handleSave} variant="contained" color="success">Save</Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}
