// import React, { useState, useEffect } from "react";
// import {
//   Grid,
//   Card,
//   CardContent,
//   Typography,
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogContentText,
//   DialogTitle,
//   Container,
//   Box,
//   Snackbar,
//   Alert,
// } from "@mui/material";
// import axios from "axios";
// import { useParams } from "react-router-dom";
// import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// import ErrorIcon from "@mui/icons-material/Error";

// const DataUpload = () => {
//   const [documents, setDocuments] = useState(null);
//   const [open, setOpen] = useState(false);
//   const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "" });
//   const [selectedAction, setSelectedAction] = useState("");
//   const [selectedDocument, setSelectedDocument] = useState("");
//   const { id } = useParams();

//   // Fetch documents
//   useEffect(() => {
//     axios
//       .get(
//         `https://script.google.com/macros/s/AKfycbxm2qA0DvzVUNtbwe4tAqd40hO7NpNU-GNXyBq3gHz_q45QIo9iveYOkV0XqyfZw9V7/exec?type=MultipleDocsGet&&userId=${id}`
//       )
//       .then((response) => setDocuments(response.data))
//       .catch((error) => console.error("Error fetching documents:", error));
//   }, [id, open]);

//   // Open dialog
//   const handleOpenDialog = (action, documentName) => {
//     setSelectedAction(action);
//     setSelectedDocument(documentName);
//     setOpen(true);
//   };

//   // Close dialog
//   const handleCloseDialog = () => {
//     setOpen(false);
//   };

//   // Confirm Approve/Decline action
//   const handleConfirmAction = () => {
//     setOpen(false);
//     const apiUrl =
//       "https://script.google.com/macros/s/AKfycbxm2qA0DvzVUNtbwe4tAqd40hO7NpNU-GNXyBq3gHz_q45QIo9iveYOkV0XqyfZw9V7/exec";

//     const payload = {
//       userId: id,
//       documentName: selectedDocument,
//       status: selectedAction === "Approve" ? "Approved" : "Declined",
//       type: "updateDocStatus",
//     };

//     fetch(apiUrl, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(payload),
//     })
//       .then((response) => response.json())
//       .then((data) => {
//         setSnackbar({
//           open: true,
//           message: data?.message || "Unexpected response",
//           severity: data?.status === "success" ? "success" : "error",
//         });
//       })
//       .catch((error) => {
//         console.error("Error:", error);
//         setSnackbar({
//           open: true,
//           message: "An error occurred while updating the document status.",
//           severity: "error",
//         });
//       });
//   };

//   // Snackbar close handler
//   const handleCloseSnackbar = () => {
//     setSnackbar({ open: false, message: "", severity: "" });
//   };

//   if (!documents) {
//     return <Typography>Loading...</Typography>;
//   }

//   if (!documents.isDataAvailable) {
//     return <Typography>No documents available for this NGO.</Typography>;
//   }

//   const documentKeys = Object.keys(documents).filter(
//     (key) => !["isDataAvailable", "User-Id", "NGO Name", "subfolderId"].includes(key)
//   );

//   return (
//     <Container maxWidth="sm" sx={{ padding: "24px" }}>
//       <Grid container spacing={2}>
//         <Typography variant="h5" gutterBottom>
//           Approve or Decline the NGO’s documents below
//         </Typography>
//         {documentKeys.map((key, index) => {
//           const doc = documents[key];
//           return (
//             <Grid item xs={12} key={index}>
//               <Card sx={{ padding: "32px" }}>
//                 <Typography variant="subtitle1">{key}</Typography>
//                 <Button
//                   variant="text"
//                   href={doc.link}
//                   target="_blank"
//                   startIcon={<RemoveRedEyeIcon />}
//                   sx={{ padding: "0px" }}
//                 >
//                   Preview
//                 </Button>

//                   {doc.status === "Approved" || doc.status === "Declined" ? (
//                     <>
//                       <Typography
//                         variant="subtitle1"
//                         color={doc.status === "Approved" ? "primary" : "error"}
//                         sx={{padding: "16px 0px 0px 0px"}}

//                       >
//                         {doc.status === "Approved" ? (
//                           <CheckCircleIcon sx={{ marginRight: "8px", marginTop: "4px" }} />
//                         ) : (
//                           <ErrorIcon sx={{ marginRight: "8px" }} />
//                         )}
//                         {doc.status}
//                       </Typography>
//                       {doc.status === "Declined" && (
//                         <Typography variant="body1" color="error">
//                           The document is not in a valid format.
//                         </Typography>
//                       )}
//                     </>
//                   ) : (
//                     <Box
//                       sx={{
//                         display: "flex",
//                         justifyContent: "flex-end",
//                         alignItems: "center",
//                       }}
//                     >
//                       <Button
//                         variant="outlined"
//                         sx={{ marginRight: "8px" }}
//                         onClick={() => handleOpenDialog("Decline", key)}
//                       >
//                         Decline
//                       </Button>
//                       <Button
//                         variant="contained"
//                         onClick={() => handleOpenDialog("Approve", key)}
//                       >
//                         Approve
//                       </Button>
//                     </Box>
//                   )}

//               </Card>
//             </Grid>
//           );
//         })}
//       </Grid>

//       <Dialog open={open} onClose={handleCloseDialog}>
//         <DialogTitle>{selectedAction} Document</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             Are you sure you want to <strong>{selectedAction}</strong> the document{" "}
//             <strong>{selectedDocument}</strong>?
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseDialog} color="secondary">
//             Cancel
//           </Button>
//           <Button onClick={handleConfirmAction} color="primary" variant="contained">
//             Confirm
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={6000}
//         onClose={handleCloseSnackbar}
//       >
//         <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Container>
//   );
// };

// export default DataUpload;

import React, { useState, useEffect } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Container,
  Box,
  Snackbar,
  Alert,
  TextField,
} from "@mui/material";
import axios from "axios";
import { useParams } from "react-router-dom";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import Update from "../AdminNgo/assets/upload.png";

const DataUpload = () => {
  const [documents, setDocuments] = useState(null);
  const [open, setOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "",
  });
  const [selectedAction, setSelectedAction] = useState("");
  const [selectedDocument, setSelectedDocument] = useState("");
  const [description, setDescription] = useState(""); // Added description state
  const { id } = useParams();

  // Fetch documents
  useEffect(() => {
    axios
      .get(
        `https://script.google.com/macros/s/AKfycbxmnB0YHUm_mPxf1i-Cv465D1kSOrB0w1-dJS1slov_UQPZ0QxMERy_kZ8uZ5KASjBi/exec/exec?type=MultipleDocsGet&&userId=${id}`
      )
      .then((response) => setDocuments(response.data))
      .catch((error) => console.error("Error fetching documents:", error));
  }, [id, open]);

  // Open dialog
  const handleOpenDialog = (action, documentName) => {
    setSelectedAction(action);
    setSelectedDocument(documentName);
    setOpen(true);
    setDescription(""); // Clear description when opening dialog
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpen(false);
  };

  // Handle description change
  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  // Confirm Approve/Decline action
  const handleConfirmAction = () => {
    setOpen(false);
    const apiUrl =
      "https://script.google.com/macros/s/AKfycbxmnB0YHUm_mPxf1i-Cv465D1kSOrB0w1-dJS1slov_UQPZ0QxMERy_kZ8uZ5KASjBi/exec?type=updateDocStatus";

    const payload = {
      userId: id,
      documentName: selectedDocument,
      status: selectedAction === "Approve" ? "Success" : "Failed",
      description: selectedAction === "Decline" ? description : "", // Add description for Decline
      type: "updateDocStatus",
    };

    fetch(apiUrl, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(() => {
        // Update local state to reflect the change
        if (documents) {
          const updatedDocuments = { ...documents };
          updatedDocuments[selectedDocument] = {
            ...updatedDocuments[selectedDocument],
            status: selectedAction === "Approve" ? "Success" : "Failed",
            description: selectedAction === "Decline" ? description : "", // Update description
          };
          setDocuments(updatedDocuments);
        }

        // Show success message
        setSnackbar({
          open: true,
          message:
            selectedAction === "Approve"
              ? "Document successfully approved"
              : "Document has been declined",
          severity: selectedAction === "Approve" ? "success" : "error",
        });
      })
      .catch((error) => {
        console.error("Error:", error);
        setSnackbar({
          open: true,
          message: "An error occurred while updating the document status.",
          severity: "error",
        });
      });
  };

  // Snackbar close handler
  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: "", severity: "" });
  };

  if (!documents) {
    return <Typography>Loading...</Typography>;
  }

  if (!documents.isDataAvailable) {
    return (
      <Grid
        container
        sx={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <img
          src={Update}
          alt="Centered Update"
          style={{ maxWidth: "100%", height: "auto" }}
        />
      </Grid>
    );
  }

  const documentKeys = Object.keys(documents).filter(
    (key) =>
      !["isDataAvailable", "User-Id", "NGO Name", "subfolderId"].includes(key)
  );

  return (
    <Container maxWidth="sm" sx={{ padding: "24px" }}>
      <Grid container spacing={2}>
        <Typography
          variant="h6"
          color="#4A4A4A"
          paddingLeft="18px"
          gutterBottom
        >
          Approve or Decline the NGO's documents below
        </Typography>
        {documentKeys.map((key, index) => {
          const doc = documents[key];
          const isApproved =
            doc.status === "Success" || doc.status === "Approved";
          const isDeclined =
            doc.status === "Failed" || doc.status === "Declined";

          return (
            <Grid item xs={12} key={index}>
              <Card sx={{ padding: "32px" }}>
                <Typography variant="subtitle1">{key}</Typography>
                <Button
                  variant="text"
                  href={doc.link}
                  target="_blank"
                  startIcon={<RemoveRedEyeIcon />}
                  sx={{
                    paddingLeft: "5px",
                    "&:hover": {
                      backgroundColor: "#FFFFFF",
                      color: "#5C785A",
                    },
                  }}
                >
                  Preview
                </Button>

                {isApproved || isDeclined ? (
                  <>
                    <Typography
                      variant="subtitle1"
                      color={isApproved ? "#48A145" : "error"}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        pt: 2,
                      }}
                    >
                      {isApproved ? (
                        <CheckCircleIcon sx={{ marginRight: "8px" }} />
                      ) : (
                        <ErrorIcon sx={{ marginRight: "8px" }} />
                      )}
                      {isApproved ? "Approved" : "Declined"}
                    </Typography>
                    {isDeclined && (
                      <Typography variant="body1" color="error">
                      {doc.description? doc.description : "The document is not in a valid format."}
                      </Typography>
                    )}
                  </>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                    }}
                  >
                    <Button
                      variant="outlined"
                      sx={{
                        marginRight: "8px",
                        borderRadius: "100px",
                        border: "2px solid",
                      }}
                      onClick={() => handleOpenDialog("Decline", key)}
                    >
                      Decline
                    </Button>
                    <Button
                      variant="contained"
                      sx={{
                        marginRight: "8px",
                        borderRadius: "100px",
                        bgcolor: "5C785A",
                        color: "#FFFFFF",
                      }}
                      onClick={() => handleOpenDialog("Approve", key)}
                    >
                      Approve
                    </Button>
                  </Box>
                )}
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Dialog open={open} onClose={handleCloseDialog}>
        <DialogTitle>{selectedAction} Document</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to <strong>{selectedAction}</strong> the
            document <strong>{selectedDocument}</strong>?
          </DialogContentText>
          {selectedAction === "Decline" && (
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              value={description}
              onChange={handleDescriptionChange}
              sx={{ marginTop: "16px" }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            color="primary"
            variant="contained"
          >
            Confirm
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
    </Container>
  );
};

export default DataUpload;
