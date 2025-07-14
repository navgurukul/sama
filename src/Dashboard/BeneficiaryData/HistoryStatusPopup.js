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
import { IdCard } from "lucide-react";

const HistoryStatusPopup = ({ open, onClose, id, email, monthYear  }) => {
  const [statusData, setStatusData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedName, setSelectedName] = useState("");

  const formatDate = (inputDate) => {
    // Define regex to match "DD Month YYYY"
    const regex = /^(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})$/;
    const match = inputDate.match(regex);

    if (!match) {
      throw new Error("Invalid date format");
    }

    const day = match[1].padStart(2, "0");
    const monthName = match[2];
    const year = match[3];

    // Map month names to numbers
    const months = {
      January: "01", February: "02", March: "03", April: "04",
      May: "05", June: "06", July: "07", August: "08",
      September: "09", October: "10", November: "11", December: "12"
    };

    const month = months[monthName];
    if (!month) {
      throw new Error("Invalid month name");
    }

    return `${day}/${month}/${year}`;
  };

  const date = formatDate(monthYear);


  useEffect(() => {
    if (open) {
      if (id) {
        axios
          .get(
            `${process.env.REACT_APP_NgoInformationApi}?type=manageStatus`
          )
          .then((response) => {
            const filteredData = response.data.filter(
              (item) => item.id === id
            );
            if (filteredData.length > 0) {
              setStatusData(filteredData);
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

 // In HistoryStatusPopup.jsx
  const handleIndividualStatusChange = async (e) => {
    e.stopPropagation();

    try {
      const payload = {
        id: id,
        status: selectedName,
        type: "editUser",
        assignedAt: monthYear
      };

      await fetch(
        `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}`,
        // "https://script.google.com/macros/s/AKfycbxDcI2092h6NLFcV2yvJN-2NaHVp1jc9_T5qs0ntLDcltIdRRZw5nfHiZTT9prPLQsf2g/exec",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "no-cors",
          body: JSON.stringify(payload),
        }
      );

      await fetch(
        `${process.env.REACT_APP_NgoInformationApi}?type=updateStatusHistory`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "no-cors",
          body: JSON.stringify({
            ngoId: id,          // Changed from ngoid to ngoId
            email: email,
            newStatus: selectedName,
            monthYear: date // Using the passed monthYear prop
          }),
        }
      );

      onClose(); // Close the popup after successful submission
    } catch (error) {
      console.error("Error updating individual status:", error);
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
              height:"50vh"
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
              onClick={handleIndividualStatusChange}
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


