import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  CircularProgress,
  IconButton,
  Box,
  TextField,
  MenuItem,
  Button,
} from "@mui/material";
import axios from "axios";
import CloseIcon from "@mui/icons-material/Close";

const HistoryStatusPopup = ({ open, onClose, id }) => {
  const [statusData, setStatusData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedName, setSelectedName] = useState("");

  useEffect(() => {
    if (open) {
      if (id) {
        axios
          .get(
            `https://script.google.com/macros/s/AKfycbxTda3e4lONdLRT13N2lVj7Z-P0q-ITSe1mvh-n9x9BG8wZo9nvnT7HXytpscigB0fm/exec?type=manageStatus`
          )
          .then((response) => {
            const filteredData = response.data.filter(
              (item) => item.id === id
            );
            if (filteredData.length > 0) {
              setStatusData(filteredData);
              console.log("stayus",filteredData)
              setSelectedName(filteredData[0].name); // Set default name
            }
            setLoading(false);
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
            setLoading(false);
          });
      } else {
        console.error("No ID found in local storage");
        setLoading(false);
      }
    }
  }, [open, id]);

  const handleSubmit = async () => {
    const payload = {
      id: [id],
      status: selectedName,
      type: "editUser",
    };

    try {
      await fetch(
        "https://script.google.com/macros/s/AKfycbwDr-yNesiGwAhqvv3GYNe7SUBKSGvXPRX1uPjbOdal7Z8ctV5H2x4y4T_JuQPMlMdjeQ/exec",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "no-cors",
          body: JSON.stringify(payload),
        }
      );
      console.log("Data submitted successfully:", payload);
      onClose();
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">Status Details</Typography>
          <IconButton edge="end" onClick={onClose}>
            <CloseIcon sx={{ color: "#828282" }} />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress />
          </Box>
        ) : statusData.length > 0 ? (
          <Box
            component="form"
            sx={{ display: "flex", flexDirection: "column", gap: 4, pt: 2 }}
          >
            {/* Dropdown for Name */}
            <TextField
              select
              label="Name"
              value={selectedName}
              onChange={(e) => setSelectedName(e.target.value)}
              fullWidth
            >
              {statusData.map((item, index) => (
                <MenuItem key={index} value={item.name}>
                  {item.name}
                </MenuItem>
              ))}
            </TextField>

            {/* Submit Button */}
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              fullWidth
            >
              Submit
            </Button>
          </Box>
        ) : (
          <Typography>No status details available.</Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default HistoryStatusPopup;


