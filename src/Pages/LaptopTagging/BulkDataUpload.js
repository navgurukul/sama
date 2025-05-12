import React, { useState } from 'react';
import {
  Button,
  Grid,
  Typography,
  Paper,
  FormControl,
  Select,
  MenuItem
} from '@mui/material';

const BulkEditPanel = ({
  selectedRows,
  onBulkUpdate,
  workingFilter,
  statusFilter
}) => {
  const [bulkWorking, setBulkWorking] = useState(workingFilter);
  const [bulkStatus, setBulkStatus] = useState(statusFilter);
  const [bulkAssignedTo, setBulkAssignedTo] = useState('');
  const [bulkDonatedTo, setBulkDonatedTo] = useState('');

  const handleBulkUpdate = (field) => {
    let value;
    switch (field) {
      case 'Working':
        value = bulkWorking;
        break;
      case 'Status':
        value = bulkStatus;
        break;
      case 'Assigned To':
        value = bulkAssignedTo;
        break;
      case 'Allocated To':
        value = bulkDonatedTo;
        break;
      default:
        return;
    }

    if (value && value !== 'all') {
      onBulkUpdate(field, value);
    }
  };

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Bulk Edit ({selectedRows.length} selected)
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <Typography variant="subtitle2" gutterBottom>
              Working Status
            </Typography>
            <Select
              value={bulkWorking}
              onChange={(e) => setBulkWorking(e.target.value)}
              variant="outlined"
              size="small"
            >
              <MenuItem value="all">No Change</MenuItem>
              <MenuItem value="Working">Working</MenuItem>
              <MenuItem value="Not Working">Not Working</MenuItem>
            </Select>
            <Button
              variant="contained"
              sx={{ mt: 1 }}
              onClick={() => handleBulkUpdate('Working')}
              disabled={bulkWorking === 'all'}
            >
              Apply
            </Button>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <Typography variant="subtitle2" gutterBottom>
              Processing Status
            </Typography>
            <Select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              variant="outlined"
              size="small"
            >
              <MenuItem value="all">No Change</MenuItem>
              <MenuItem value="Laptop Received">Laptop Received</MenuItem>
              <MenuItem value="Laptop Refurbished">Laptop Refurbished</MenuItem>
              <MenuItem value="Allocated">Allocated</MenuItem>
              <MenuItem value="To be dispatch">To be dispatch</MenuItem>
            </Select>
            <Button
              variant="contained"
              sx={{ mt: 1 }}
              onClick={() => handleBulkUpdate('Status')}
              disabled={bulkStatus === 'all'}
            >
              Apply
            </Button>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default BulkEditPanel;