import React, { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

function MouReviewd() {
  const [isVisible, setIsVisible] = useState(true); // Manage card visibility

  return (
    <Container
      sx={{
        my: 3,
        ml: "0px",
      }}
    >
      {isVisible && ( // Only show the card when isVisible is true
        <Paper
          elevation={3}
          sx={{
            p: 3,
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#f8f5f2",
            borderRadius: 2,
            maxWidth: "90%",
            position: "relative", // To position the icon inside the card
          }}
        >
          <IconButton
            onClick={() => setIsVisible(false)} // Hide the card on click
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "black", // Optional: Adjust color
            }}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            MOU Reviewed
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Sama has reviewed the signed copy of the MOU. Sama will connect with
            you regarding disbursement of laptops in a short while. Signed MOU
            can be accessed anytime from the profile.
          </Typography>
        </Paper>
      )}
    </Container>
  );
}

export default MouReviewd;
