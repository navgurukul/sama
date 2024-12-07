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
} from "@mui/material";
import AddStatusModal from "./AddStatusModal";
import EditStatusModal from "./EditStatusModal";
import DeleteStatusDialog from "./DeleteStatusDialog";

const ManageStatuses = () => {
  const [modals, setModals] = useState({
    add: false,
    edit: null,
    delete: null,
  });
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = `https://script.google.com/macros/s/AKfycbwder-oDDWFNnY6JL4DuBvuPSwOXVgchkgyHxCWwe2rgfcDrF6g5xwaIt63BYGPBakylA/exec?type=manageStatus`;

  const fetchStatuses = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setStatuses(data || []);
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  const handleAddStatus = async (newStatus) => {
    await fetchStatuses(); // Refresh data after adding
  };

  const handleEditStatus = async (updatedStatus) => {
    try {
      // Wait for the EditStatusModal to complete its API call
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for API to process
      await fetchStatuses(); // Refresh data
      setModals({ ...modals, edit: null });
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    }
  };


  // const handleDeleteSuccess = (deletedStatus) => {
  //   setStatuses((prevStatuses) =>
  //     prevStatuses.filter((status) => status.id !== deletedStatus.id)
  //   );
  //   setModals((prev) => ({ ...prev, delete: null }));
  // };

  const handleDeleteSuccess = (deletedStatus) => {
    setStatuses((prevStatuses) =>
      prevStatuses.filter((status) => status.name !== deletedStatus.name)
    );
    setModals((prev) => ({ ...prev, delete: null }));
  };
  

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container maxWidth="lg">
      <Box sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          Default Statuses
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          {["Data Uploaded", "Laptop Assigned"].map((status) => (
            <Chip
              key={status}
              label={status}
              sx={{
                bgcolor: "#E8F5E9",
                color: "#4CAF50",
                fontWeight: 600,
                fontSize: 14,
                p: 1,
              }}
            />
          ))}
        </Box>

        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          Custom Statuses
        </Typography>
        <Button
          variant="contained"
          onClick={() => setModals({ ...modals, add: true })}
          sx={{ bgcolor: "#4CAF50", mb: 3 }}
        >
          Add Status
        </Button>

        <Typography sx={{ color: "#999", mb: 2, fontSize: 14 }}>
          Please note: Statuses in use cannot be deleted
        </Typography>

        <Grid container spacing={3}>
          {statuses.map((status) => (
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
                  <Typography
                    sx={{
                      color: "#4CAF50",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      mb: 1,
                    }}
                  >
                    {status.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#555",
                      fontSize: 14,
                      mb: 2,
                    }}
                  >
                    {status.description}
                  </Typography>
                </CardContent>
                <CardActions
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    px: 3,
                    py: 2,
                  }}
                >
                  <Button
                    onClick={() => setModals({ ...modals, edit: status })}
                    sx={{
                      color: "#4CAF50",
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
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Add Modal */}
        <AddStatusModal
          open={modals.add}
          onClose={() => setModals({ ...modals, add: false })}
          onAdd={handleAddStatus}
        />

        {/* Edit Modal */}
        {modals.edit && (
          <EditStatusModal
            open={!!modals.edit}
            onClose={() => setModals({ ...modals, edit: null })}
            status={modals.edit}
            onUpdate={handleEditStatus}
          />
        )}

        {/* Delete Dialog */}
        {modals.delete && (
          <DeleteStatusDialog
            open={!!modals.delete}
            onClose={() => setModals({ ...modals, delete: null })}
            status={modals.delete}
            onDeleteSuccess={handleDeleteSuccess}
          />
        )}
      </Box>
    </Container>
  );
};

export default ManageStatuses;
