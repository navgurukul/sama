
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

const AddStatusModal = ({ open, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    id: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const urlParts = window.location.pathname.split("/");
    const id = urlParts[urlParts.length - 1];
    setFormData((prevData) => ({ ...prevData, id }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch(
        "https://script.google.com/macros/s/AKfycbxTda3e4lONdLRT13N2lVj7Z-P0q-ITSe1mvh-n9x9BG8wZo9nvnT7HXytpscigB0fm/exec?type=addManageStatus",
        {
          method: "POST",
          body: JSON.stringify(formData),
          mode: "no-cors",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      onAdd(formData);
      setFormData({ name: "", description: "", id: formData.id });
      onClose();
    } catch (error) {
      console.error("Error adding status:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>New Status</DialogTitle>
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
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" sx={{ bgcolor: "#4CAF50" }}>
            {loading ? "Adding..." : "Add Status"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddStatusModal;