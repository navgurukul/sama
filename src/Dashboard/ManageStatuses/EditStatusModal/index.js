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
      await fetch(
        "https://script.google.com/macros/s/AKfycbwk05eP16t1cIr5tmu3OXRGnqP0ZJ_0JqdLGW-XNsQSzNa5--5eIkKIKEp7UJwFZR63_Q/exec?type=editManageStatus",
        {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            oldName: status.name,
            id: status.id,
            ...formData,
          }),
        }
      );

      // Pass complete updated data back to parent
      onUpdate(formData);
      onClose();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
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