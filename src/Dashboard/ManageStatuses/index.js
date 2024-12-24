import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Container,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { useParams } from "react-router-dom";
import AddStatusModal from "./AddStatusModal";
import EditStatusModal from "./EditStatusModal";
import DeleteStatusDialog from "./DeleteStatusDialog";

const ManageStatuses = () => {
  const { id } = useParams();
  const [modals, setModals] = useState({
    add: false,
    edit: null,
    delete: null,
  });
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const API_URL = `https://script.google.com/macros/s/AKfycbxTda3e4lONdLRT13N2lVj7Z-P0q-ITSe1mvh-n9x9BG8wZo9nvnT7HXytpscigB0fm/exec?type=manageStatus`;

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };

  const fetchStatuses = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      const data = await response.json();
      setStatuses(data || []);
    } catch (err) {
      setError("Failed to load data");
      setSnackbar({
        open: true,
        message: "Failed to load statuses",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  const handleAddStatus = (newStatus) => {
    setStatuses((prevStatuses) => [...prevStatuses, newStatus]);
    setSnackbar({
      open: true,
      message: "Status added successfully!",
      severity: "success",
    });
  };

  const handleEditStatus = (updatedStatus) => {
    setStatuses((prevStatuses) =>
      prevStatuses.map((status) =>
        status.name === updatedStatus.oldName
          ? {
              ...status,
              name: updatedStatus.name,
              description: updatedStatus.description,
            }
          : status
      )
    );
    setModals({ ...modals, edit: null });
    setSnackbar({
      open: true,
      message: "Status updated successfully!",
      severity: "success",
    });
  };

  const handleDeleteSuccess = (deletedStatus) => {
    setStatuses((prevStatuses) =>
      prevStatuses.filter((status) => status.name !== deletedStatus.name)
    );
    setModals((prev) => ({ ...prev, delete: null }));
    setSnackbar({
      open: true,
      message: "Status deleted successfully!",
      severity: "success",
    });
  };

  const filteredStatuses = id
    ? statuses.filter((status) => status.id === id)
    : statuses;

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress size={40} thickness={4} />
      </Box>
    );
  }

  if (error && !statuses.length) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mb: 3 }}>
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          Default Statuses
        </Typography>
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3, mt: 3 }}
        >
          <Chip
            label="Data Uploaded"
            sx={{
              bgcolor: "#CED7CE",
              fontWeight: 600,
              fontSize: 14,
              p: 1,
            }}
          />
          <Typography variant="body1" sx={{ fontSize: 14 }}>
            and
          </Typography>
          <Chip
            label="Laptop Assigned"
            sx={{
              bgcolor: "#CED7CE",
              fontWeight: 600,
              fontSize: 14,
              p: 1,
            }}
          />
          <Typography variant="body1" sx={{ fontSize: 14 }}>
            are default statuses that cannot be changed by the NGO
          </Typography>
        </Box>
      </Box>

      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2, mt: 3 }}>
        Custom Statuses
      </Typography>
      <Button
        variant="contained"
        onClick={() => setModals({ ...modals, add: true })}
        sx={{ bgcolor: "#5C785A", mb: 3, borderRadius: "100px" }}
      >
        Add Status
      </Button>

      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Please note: Statuses in use cannot be deleted
      </Typography>

      {filteredStatuses.length === 0 ? (
        <Typography
          sx={{ color: "#999", fontSize: 14, textAlign: "center", mt: 3 }}
        >
          No custom statuses added yet.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredStatuses.map((status) => (
            <Grid item xs={12} sm={6} md={4} key={status.id}>
              <Card
                sx={{
                  border: "1px solid #E0E0E0",
                  borderRadius: 2,
                  boxShadow: "none",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent sx={{ p: 3, pb: 0, flexGrow: 1 }}>
                  {/* <Typography
                    sx={{
                      color: "#4CAF50",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      mb: 1,
                    }}
                  >
                    {status.name}
                  </Typography> */}
                  <Typography
                    variant="subtitle2"
                    sx={{
                      // color: "#4CAF50",
                      // Smaller font size to match the example
                      mb: 1,
                      backgroundColor: "#CED7CE",
                      padding: "4px 8px",
                      borderRadius: "8px",
                      display: "inline-block", // Makes the background wrap the text tightly
                    }}
                  >
                    {status.name}
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      color: "#555",

                      mb: 2,
                      mt: 1,
                    }}
                  >
                    {status.description}
                  </Typography>
                </CardContent>
                <CardActions
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    px: 3,
                    py: 2,
                  }}
                >
              
                  <Button
                    onClick={() => setModals({ ...modals, delete: status })}
                    sx={{
                      color: "#F44336",
                      textTransform: "capitalize",
                      fontWeight: "bold",
                      p: 0,
                      "&:hover": {
                        background: "none",
                      },
                    }}
                  >
                    Delete
                  </Button>
                  <Button
                    onClick={() => setModals({ ...modals, edit: status })}
                    sx={{
                      color: "primary.main",
                      textTransform: "capitalize",
                      fontWeight: "bold",
                      p: 0,
                      "&:hover": {
                        background: "none",
                      },
                    }}
                  >
                    Edit
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <AddStatusModal
        open={modals.add}
        onClose={() => setModals({ ...modals, add: false })}
        onAdd={handleAddStatus}
      />

      {modals.edit && (
        <EditStatusModal
          open={!!modals.edit}
          onClose={() => setModals({ ...modals, edit: null })}
          status={modals.edit}
          onUpdate={handleEditStatus}
        />
      )}

      {modals.delete && (
        <DeleteStatusDialog
          open={!!modals.delete}
          onClose={() => setModals({ ...modals, delete: null })}
          status={modals.delete}
          onDeleteSuccess={handleDeleteSuccess}
        />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          elevation={6}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ManageStatuses;
