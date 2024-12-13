import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  Typography,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const DeleteStatusDialog = ({ open, onClose, onDeleteSuccess, status }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteStatus = async () => {
    if (!status?.name) {
      alert("Error: Status name is missing");
      return;
    }

    setIsDeleting(true);
    try {
      const deleteData = {
        statusName: status.name // Send only the status name
      };
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbxEG3vNWj_vjl__Rw5h3lwqgkPxh8fQXKoMPqu2_Bd4Na_JtOiU6IczBAOJVz_FwL6Jyw/exec?type=deleteManageStatus",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          mode: "no-cors",
          body: JSON.stringify(deleteData),
        }
      );

      // Add a small delay to allow backend processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onDeleteSuccess(status);
    } catch (error) {
      console.error("Delete error:", error);
      alert(`Failed to delete: ${error.message}`);
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "8px",
          padding: "16px",
          maxWidth: "400px",
        },
      }}
    >
      <DialogTitle
        sx={{
          p: 0,
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box
          component="span"
          sx={{
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          }}
        >
          Delete Status
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          disabled={isDeleting}
          sx={{
            color: "#666",
            "&:hover": {
              backgroundColor: "#f5f5f5",
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, mb: 2 }}>
        <Typography variant="body1" sx={{ color: "#666", mb: 1 }}>
          Please confirm if you want to proceed with deleting:
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Chip
            label={status?.name}
            sx={{
              backgroundColor: "#E8F5E9",
              color: "#4CAF50",
              fontWeight: "600",
              fontSize: "14px",
              height: "auto",
              padding: "4px 8px",
              borderRadius: "4px",
              "& .MuiChip-label": {
                padding: "0",
              },
            }}
          />
  
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: 0,
          gap: 1,
          justifyContent: "flex-start",
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={isDeleting}
          sx={{
            color: "#666",
            borderColor: "#E0E0E0",
            textTransform: "none",
            minWidth: "80px",
            "&:hover": {
              borderColor: "#D0D0D0",
              backgroundColor: "#f5f5f5",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleDeleteStatus}
          variant="contained"
          color="error"
          disabled={isDeleting}
          sx={{
            textTransform: "none",
            minWidth: "80px",
            bgcolor: "#F44336",
            "&:hover": {
              bgcolor: "#D32F2F",
            },
          }}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteStatusDialog;
