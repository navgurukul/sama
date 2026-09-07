import React from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, Typography, Grid, Divider, Box 
} from '@mui/material';

const LaptopDetailsModal = ({ open, onClose, laptop }) => {
  if (!laptop) return null;

  const renderDetail = (label, value) => (
    <Grid item xs={12} sm={6}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1" fontWeight="medium" sx={{ wordBreak: 'break-word' }}>
        {value || '-'}
      </Typography>
    </Grid>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight="bold">
          Laptop Details
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          Serial No: {laptop.ID || laptop.LaptopID}
        </Typography>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, color: 'primary.main' }}>
            Hardware Specifications
          </Typography>
          <Grid container spacing={2}>
            {renderDetail("Manufacturer Model", laptop["Manufacturer Model"])}
            {renderDetail("RAM", laptop.RAM)}
            {renderDetail("ROM", laptop.ROM)}
            {renderDetail("Processor", laptop.Processor)}
            {renderDetail("OS Details", laptop["OS Details"])}
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, color: 'primary.main' }}>
            Status & Condition
          </Typography>
          <Grid container spacing={2}>
            {renderDetail("Current Status", laptop.Status)}
            {renderDetail("Working Condition", laptop.Working)}
            {renderDetail("Minor Issues", laptop["Minor Issues"])}
            {renderDetail("Major Issues", laptop["Major Issues"])}
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, color: 'primary.main' }}>
            Logistics & Tracking
          </Typography>
          <Grid container spacing={2}>
            {renderDetail("Donor Company", laptop["Donor Company Name"] || laptop["Donor Company"])}
            {renderDetail("Assigned To", laptop["Assigned To"])}
            {renderDetail("Donated To", laptop["Donated To"])}
            {renderDetail("Registration Date", laptop["Registration Date"])}
          </Grid>
        </Box>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LaptopDetailsModal;
