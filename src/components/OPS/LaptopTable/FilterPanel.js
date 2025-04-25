import React from 'react';
import { 
  Paper, 
  Typography, 
  Grid, 
  FormControl, 
  Select, 
  MenuItem, 
  Button, 
  Box, 
  Chip 
} from '@mui/material';

const FilterPanel = ({ 
  workingFilter, 
  setWorkingFilter, 
  statusFilter, 
  setStatusFilter,
  majorIssueFilter,
  setMajorIssueFilter,
  minorIssueFilter,
  setMinorIssueFilter,
  onResetFilters 
}) => {
  // Options for major issues in the select field
  const majorIssueOptions = [
    "Fan",
    "Speaker",
    "Microphone",
    "Damaged Screen",
    "Faulty Battery",
    "Overheating",
    "Malfunctioning Keyboard",
    "Broken Ports",
    "Hard Drive Issues",
    "Defective Motherboard",
    "Audio Problems",
    "Graphics Card Issues",
    "Water Damage",
    "USB Ports",
  ];
  
  // Options for minor issues in the select field
  const minorIssuesOptions = [
    "Cosmetic Wear",
    "Loose Hinges",
    "Dead Pixels",
    "Fading Keyboard",
    "Small Battery Capacity Loss",
    "Minor Software Issues",
    "Port Wear",
    "Touchpad Sensitivity",
    "CMOS Battery",
    "RAM Issue" ,

  ];

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Filters
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <Typography variant="subtitle2" gutterBottom>
              Working Status
            </Typography>
            <Select
              value={workingFilter}
              onChange={(e) => setWorkingFilter(e.target.value)}
              variant="outlined"
              size="small"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="Working">Working</MenuItem>
              <MenuItem value="Not Working">Not Working</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <Typography variant="subtitle2" gutterBottom>
              Processing Status
            </Typography>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              variant="outlined"
              size="small"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="Laptop Received">Laptop Received</MenuItem>
              <MenuItem value="Laptop Refurbished">Laptop Refurbished</MenuItem>
              <MenuItem value="Laptop Tagged">Allocated</MenuItem>
              <MenuItem value="Laptop Shipped">To be dispatch</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <Typography variant="subtitle2" gutterBottom>
              Major Issue
            </Typography>
            <Select
              value={majorIssueFilter}
              onChange={(e) => setMajorIssueFilter(e.target.value)}
              variant="outlined"
              size="small"
            >
              <MenuItem value="all">All</MenuItem>
              {/* <MenuItem value="yes">Yes</MenuItem>
              <MenuItem value="no">No</MenuItem> */}
              <MenuItem disabled sx={{ borderTop: '1px solid #eee', py: 1 }}>
                <Typography variant="caption">Specific Issues</Typography>
              </MenuItem>
              {majorIssueOptions.map((issue) => (
                <MenuItem key={issue} value={issue}>{issue}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <Typography variant="subtitle2" gutterBottom>
              Minor Issue
            </Typography>
            <Select
              value={minorIssueFilter}
              onChange={(e) => setMinorIssueFilter(e.target.value)}
              variant="outlined"
              size="small"
            >
              <MenuItem value="all">All</MenuItem>
              {/* <MenuItem value="yes">Yes</MenuItem>
              <MenuItem value="no">No</MenuItem> */}
              <MenuItem disabled sx={{ borderTop: '1px solid #eee', py: 1 }}>
                <Typography variant="caption">Specific Issues</Typography>
              </MenuItem>
              {minorIssuesOptions.map((issue) => (
                <MenuItem key={issue} value={issue}>{issue}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={onResetFilters}
          >
            Reset Filters
          </Button>
        </Grid>
      </Grid>

      {/* Applied filters chips */}
      {(workingFilter !== 'all' || statusFilter !== 'all' || majorIssueFilter !== 'all' || minorIssueFilter !== 'all') && (
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="subtitle2">Applied Filters:</Typography>
          {workingFilter !== 'all' && (
            <Chip 
              label={workingFilter === 'working' ? 'Working' : 'Not Working'} 
              color="primary" 
              onDelete={() => setWorkingFilter('all')}
            />
          )}
          {statusFilter !== 'all' && (
            <Chip 
              label={`Status: ${statusFilter}`} 
              color="secondary" 
              onDelete={() => setStatusFilter('all')}
            />
          )}
          {majorIssueFilter !== 'all' && (
            <Chip 
              label={majorIssueFilter === 'yes' ? 'Major Issue: Yes' : 
                     majorIssueFilter === 'no' ? 'Major Issue: No' : 
                     `Major Issue: ${majorIssueFilter}`} 
              color="error" 
              onDelete={() => setMajorIssueFilter('all')}
            />
          )}
          {minorIssueFilter !== 'all' && (
            <Chip 
              label={minorIssueFilter === 'yes' ? 'Minor Issue: Yes' : 
                    minorIssueFilter === 'no' ? 'Minor Issue: No' : 
                    `Minor Issue: ${minorIssueFilter}`} 
              color="warning" 
              onDelete={() => setMinorIssueFilter('all')}
            />
          )}
        </Box>
      )}
    </Paper>
  );
};

export default FilterPanel;