// import React, { useState } from "react";
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

const MOUCard = () => {
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

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(
          "https://script.google.com/macros/s/AKfycbxDcI2092h6NLFcV2yvJN-2NaHVp1jc9_T5qs0ntLDcltIdRRZw5nfHiZTT9prPLQsf2g/exec?type=getUserData"
        );
        const data = response.data;
        setNgoData(data);
        setLoadingt(false);

        const idProofOptions = [
          ...new Set(data.map((item) => item["ID Proof type"])),
        ];
        const useCaseOptions = [
          ...new Set(data.map((item) => item["Use case"])),
        ];
        const occupationOptions = [
          ...new Set(data.map((item) => item["Occupation"])),
        ];

        setFilterOptions({
          idProof: idProofOptions,
          useCase: useCaseOptions,
          occupation: occupationOptions,
          status: filterOptions.status,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleRowClick = (id) => {
    navigate(`/allngo/${id}`);
  };

  const handleStatusChange = (id, newStatus) => {
    setSelectedStatus(newStatus);
    setNgoIdToChange(id);
    setOpenDialog(true);
  };

  const handleConfirmStatusChange = async (e) => {
    e.stopPropagation();
    const updatedData = ngoData.map((ngo) =>
      ngo.Id === ngoIdToChange ? { ...ngo, status: selectedStatus } : ngo
    );
    setNgoData(updatedData);
    setOpenDialog(false);

    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbxm2qA0DvzVUNtbwe4tAqd40hO7NpNU-GNXyBq3gHz_q45QIo9iveYOkV0XqyfZw9V7/exec",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          mode: "no-cors",
          body: JSON.stringify({
            id: ngoIdToChange,
            status: selectedStatus,
            type: "NGO",
          }),
        }
      );
      if (response.ok) {
        console.log("Status updated successfully");
      } else {
        console.error("Error updating status:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleCancelStatusChange = () => {
    setSelectedStatus(null);
    setOpenDialog(false);
  };

  const filteredData = ngoData.filter((ngo) => {
    return (
      (searchTerm === "" ||
        ngo.name?.toLowerCase().includes(searchTerm) ||
        ngo.email?.toLowerCase().includes(searchTerm) ||
        ngo["contact number"]?.toString().includes(searchTerm)) &&
      (filters["ID Proof type"] === "" ||
        ngo["ID Proof type"] === filters["ID Proof type"]) &&
      (filters["Use case"] === "" || ngo["Use case"] === filters["Use case"]) &&
      (filters["Occupation Status"] === "" ||
        ngo["Occupation"] === filters["Occupation Status"]) &&
      (filters.status === "" || ngo.status === filters.status)
    );
  });

  return (
    <>
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
            Please read the MOU and upload it here by{" "}
            <strong>12 Oct 2024</strong>.
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
            {file && (
              <Typography sx={{ mt: 1 }}>Selected File: {file.name}</Typography>
            )}
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
      <Container maxWidth="xl" sx={{ mt: 6, mb: 6,}}>
        <Typography variant="h6" gutterBottom>
        All Beneficiaries ({filteredData.length})
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3} sx={{ mt: 3 }}>
            <TextField
              sx={{ width: { lg: "480px", sm: "100%", xs: "100%" } }}
              label="Search by Name, Location, Contact"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Box sx={{ display: "flex" }}>
            <FilterListIcon sx={{ mt: 3, ml: 2 }} />
            <Typography variant="subtitle1" sx={{ ml: 1 }}>
              Filters
            </Typography>
          </Box>
          <FormControl sx={{ m: 1, minWidth: 200 }}>
            <InputLabel>ID Proof Type</InputLabel>
            <Select
              value={filters["ID Proof type"]}
              onChange={handleFilterChange}
              name="ID Proof type"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {filterOptions.idProof.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ m: 1, minWidth: 200 }}>
            <InputLabel>Use Case</InputLabel>
            <Select
              value={filters["Use case"]}
              onChange={handleFilterChange}
              name="Use case"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {filterOptions.useCase.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ m: 1, minWidth: 200 }}>
            <InputLabel>Occupation Status</InputLabel>
            <Select
              value={filters["Occupation Status"]}
              onChange={handleFilterChange}
              name="Occupation Status"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {filterOptions.occupation.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ m: 1, minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters["status"]}
              onChange={handleFilterChange}
              name="status"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {filterOptions.status.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {/* Repeat similar for other filters */}
        </Grid>

        <TableContainer
          style={{ border: "none" }}
          sx={{ backgroundColor: "white", mt: 2 }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Contact Number</TableCell>
                <TableCell>ID Proof Type</TableCell>
                <TableCell>Use Case</TableCell>
                <TableCell>Occupation Status</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((ngo) => (
                  <TableRow
                    key={ngo.Id}
                    hover
                    onClick={() => handleRowClick(ngo.Id)}
                  >
                    <TableCell>{ngo.ID}</TableCell>
                    <TableCell>{ngo.name}</TableCell>
                    <TableCell>{ngo.email}</TableCell>
                    <TableCell>{ngo["contact number"]}</TableCell>
                    <TableCell>{ngo["ID Proof type"]}</TableCell>
                    <TableCell>{ngo["Use case"]}</TableCell>
                    <TableCell>{ngo["Occupation"]}</TableCell>
                    <TableCell>
                      <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={ngo.status}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleStatusChange(ngo.Id, e.target.value);
                          }}
                        >
                          {filterOptions.status.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <EditIcon />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredData.length}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) =>
            setRowsPerPage(parseInt(e.target.value, 10))
          }
        />
        <Dialog open={openDialog} onClose={handleCancelStatusChange}>
          <DialogTitle>Change Status</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to change the status to {selectedStatus}?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelStatusChange} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleConfirmStatusChange} color="primary">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default MOUCard;
