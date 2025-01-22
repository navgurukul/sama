import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";

import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  CircularProgress,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";

import { useNavigate } from "react-router-dom";

const MOUCard = (ngoid) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false); // State for dialog visibility

  const navigate = useNavigate();
  const [ngoData, setNgoData] = useState([]);
  const [loadingt, setLoadingt] = useState(true);
  const [filters, setFilters] = useState({
    "ID Proof type": "",
    "Use case": "",
    "Occupation Status": "",
    status: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterOptions, setFilterOptions] = useState({
    idProof: [],
    useCase: [],
    occupation: [],
    status: ["Laptop Assigned", "Data Uploaded", "Approved", "Rejected"],
  });
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [ngoIdToChange, setNgoIdToChange] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "",
  });

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: "", severity: "" });
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

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
      showSnackbar("Please select a PDF file to upload.", "error");
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64File = reader.result.split(",")[1];
      const idToBeSent = ngoid?.ngoid;
      const payload = {
        status: "Signed MOU",
        ngoId: idToBeSent,
        file: base64File,
        fileName: file.name,
        mimeType: file.type,
        type: "MouUpload",
      };

      try {
        const response = await fetch(
          // "https://script.google.com/macros/s/AKfycbzgUvcOyW8LsNyErDVcrJy-p_Jm5Oqa9FjTqnYjGe3avEzRlJm4w9c8JO7i3SPb-pAHSQ/exec",
          `${process.env.REACT_APP_NgoInformationApi}?type=MouUpload`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            mode: "no-cors",
            body: JSON.stringify(payload),
          }
        );
        setDialogOpen(false);
        showSnackbar("File uploaded successfully!", "success");

        // Wait for snackbar to be visible before refreshing
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } catch (error) {
        showSnackbar("An error occurred during upload.", "error");
        // setDialogOpen(false);
        // window.location.reload();
        // setMessage(error.message);
      } finally {
        setLoading(false);
      }
    };
  };

  return (
    <>
      <Box sx={{ mt: 5, background: "#F8F3F0", borderRadius: 2, p: "2rem" }}>
        <Paper
          elevation={0}
          sx={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#f8f5f2",
            borderRadius: 2,
            maxWidth: "100%",
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Congrats! MOU has been generated
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Sama has reviewed all the beneficiary requests for 100 students.
            Please read the MOU and upload it here by{" "}
            <strong>12 Oct 2024</strong>.
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<DownloadIcon />}
              sx={{ textTransform: "none", px: 3 }}
              onClick={() =>
                window.open(
                  "https://docs.google.com/document/d/1E7UzWAD1-OB-oi7Vcxb6iqCIy7CRmE6Z0dqu0IkkB9A/edit?tab=t.0",
                  "_blank"
                )
              }
            >
              Download MOU
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<CloudUploadIcon />}
              onClick={handleDialogOpen}
              sx={{ textTransform: "none", px: 3 }}
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
            {/* {file && (
              <Typography sx={{ mt: 1 }}>Selected File: {file.name}</Typography>
            )} */}
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
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default MOUCard;
