import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  Typography,
  CircularProgress,
  IconButton,
  Box,
} from "@mui/material";
import axios from "axios";
import CloseIcon from "@mui/icons-material/Close";

const HistoryStatusPopup = ({ open, onClose,id }) => {
  const [statusData, setStatusData] = useState([]);
  const [loading, setLoading] = useState(true);

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
            setStatusData(filteredData);
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
  }, [open,id]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>
        {" "}
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
          <List>
            {statusData.map((item, index) => (
              <ListItem
                key={index}
                sx={{ display: "flex", justifyContent: "space-between" }}
              >
                <Typography
                  variant="body1"
                  sx={{ fontWeight: "bold", marginRight: 2 }}
                >
                  {item.name}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ textAlign: "right", flexGrow: 1 }}
                >
                  {item.description}
                </Typography>
              </ListItem>
            ))}
          </List>
        ) : (
          <p>No status details available.</p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default HistoryStatusPopup;
