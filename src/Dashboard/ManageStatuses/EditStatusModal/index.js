
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from "@mui/material";

const EditStatusModal = ({ open, onClose, status, onUpdate }) => {
  const [formData, setFormData] = useState({ id: "", name: "", description: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status) {
      setFormData({
        id: status.id,
        name: status.name || "",
        description: status.description || "",
      });
    }
  }, [status]);

 
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    // Save the oldName for comparison
    const updatedData = {
      oldName: status.name,
      id: status.id,
      name: formData.name,
      description: formData.description
    };

    await fetch(
      `${process.env.REACT_APP_NgoInformationApi}?type=editManageStatus`,
      {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      }
    );

    // Pass both old and new data to parent
    onUpdate({
      ...formData,
      oldName: status.name
    });
    onClose();
  } catch (error) {
    console.error("Error updating status:", error);
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Status</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              fullWidth
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              multiline
              rows={4}
              required
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            sx={{ bgcolor: "#4CAF50" }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update Status"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};


export default EditStatusModal;