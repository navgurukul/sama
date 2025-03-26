import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 4,
  boxShadow: 24,
  p: 4,
};

const ConfirmationModal = ({ 
  open, 
  onClose, 
  onConfirm, 
  title, 
  message 
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={modalStyle}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          {title}
        </Typography>
        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
          {message}
        </Typography>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="outlined" color="secondary" onClick={onClose} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={onConfirm}>
            Yes
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ConfirmationModal;
