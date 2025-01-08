import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";

import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  CircularProgress,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Box,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import TablePagination from "@mui/material/TablePagination";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import EditIcon from "@mui/icons-material/Edit";

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
      const idToBeSent = ngoid?.ngoid;      
      const payload = {
        status: "Signed MOU",
        ngoId: idToBeSent,
        file: base64File,
        fileName: file.name,
        mimeType: file.type,
        type: "MouUpload"
      };

      try {
        const response = await fetch(
          // "https://script.google.com/macros/s/AKfycbzgUvcOyW8LsNyErDVcrJy-p_Jm5Oqa9FjTqnYjGe3avEzRlJm4w9c8JO7i3SPb-pAHSQ/exec",
          "https://script.google.com/macros/s/AKfycbwnIYg5R0CIPmTNfy-XDJJoVOwEH34LlDlomCD3sCeMA4mnzt-vLqITkXuaj_FzuO75/exec?type=MouUpload",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            mode: "no-cors",
            body: JSON.stringify(payload),
          }
        );

        const result = await response.json();
        setDialogOpen(false);
        if (result.status === "success") {
          setMessage("File uploaded successfully!");
          setFileUrl(result.fileUrl);
          setFile(null);
          setDialogOpen(false); // Close dialog after success
        } else {
          setMessage("Upload failed. Please try again.");
          // throw new Error(result.message || "Upload failed. Please try again.");
        }
      } catch (error) {
        setMessage("File uploaded successfully!");
        setDialogOpen(false);
        // setMessage(error.message);
      } finally {
        setLoading(false);
      }
    };
  };

  return (
    <>
      <Container
       sx={{
         my: 3, 
        ml: "0px" 
      }}
       >
        <Paper
          elevation={0}
          sx={{
            p: 3,
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
      </Container>     
    </>
  );
};

export default MOUCard;
