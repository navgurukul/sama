import React, { useState } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  TextField,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";

const MOUCard = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false); // State for dialog visibility

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setFile(null); // Reset file input on close
    setMessage(""); // Clear any messages
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a PDF file to upload.");
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64File = reader.result.split(",")[1];
      const payload = {
        name: "Signed MOU", // Hardcoded name for simplicity
        file: base64File,
        fileName: file.name,
        mimeType: file.type,
      };

      try {
        const response = await fetch(
          "https://script.google.com/macros/s/AKfycbzgUvcOyW8LsNyErDVcrJy-p_Jm5Oqa9FjTqnYjGe3avEzRlJm4w9c8JO7i3SPb-pAHSQ/exec",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            mode: "no-cors",
            body: JSON.stringify(payload),
          }
        );

        const result = await response.json();

        if (result.status === "success") {
          setMessage("File uploaded successfully!");
          setFileUrl(result.fileUrl);
          setFile(null);
          setDialogOpen(false); // Close dialog after success
        } else {
          throw new Error(result.message || "Upload failed. Please try again.");
        }
      } catch (error) {
        setMessage(error.message);
      } finally {
        setLoading(false);
      }
    };
  };

  return (
    <Container sx={{ my: 3, ml: "32px" }}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#f8f5f2",
          borderRadius: 2,
          maxWidth: "90%",
        }}
      >
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Congrats! MOU has been generated
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Sama has reviewed all the beneficiary requests for 100 students.
          Please read the MOU and upload it here by <strong>12 Oct 2024</strong>.
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
        <Button
            variant="contained"
            color="success"
            startIcon={<DownloadIcon />}
            sx={{ borderRadius: 5, textTransform: "none", px: 3 }}
            onClick={() =>
              window.open(
                "https://drive.google.com/uc?export=download&id=1NCQ_OhhpB3wl7x_C2mTcOhoDmGut9ePl",
                "_blank"
              )
            }
          >
            Download MOU
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CloudUploadIcon />}
            onClick={handleDialogOpen}
            sx={{ borderRadius: 5, textTransform: "none", px: 3 }}
          >
            Upload Signed MOU
          </Button>
        </Box>

        {fileUrl && (
          <Typography sx={{ mt: 2 }}>
            Uploaded File URL:{" "}
            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
              {fileUrl}
            </a>
          </Typography>
        )}
      </Paper>

      {/* Upload Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Upload Signed MOU</DialogTitle>
        <DialogContent>
          <input
            type="file"
            onChange={handleFileChange}
            accept="application/pdf"
          />
          {file && <Typography sx={{ mt: 1 }}>Selected File: {file.name}</Typography>}
          {message && (
            <Typography color="error" sx={{ mt: 1 }}>
              {message}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Upload"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MOUCard;
