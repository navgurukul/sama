import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Paper,
  Typography,
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const MonthlyEditForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fields, setFields] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "",
  });

  const API_GET_URL = `https://script.google.com/macros/s/AKfycbxTda3e4lONdLRT13N2lVj7Z-P0q-ITSe1mvh-n9x9BG8wZo9nvnT7HXytpscigB0fm/exec?type=Monthly&&id=${id}`;
  const API_POST_URL = `https://script.google.com/macros/s/AKfycbxTda3e4lONdLRT13N2lVj7Z-P0q-ITSe1mvh-n9x9BG8wZo9nvnT7HXytpscigB0fm/exec`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(API_GET_URL);
        if (response.data.success) {
          setFields(response.data.data);
        } else {
          throw new Error("No data found");
        }
      } catch (err) {
        setError("Failed to fetch data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleFieldChange = (index, key, value) => {
    const updatedFields = [...fields];
    updatedFields[index][key] = value;
    setFields(updatedFields);
  };

  const addField = () => {
    setFields([
      ...fields,
      {
        Id: id,
        Question: "",
        Type: "text",
      },
    ]);
  };

  const removeField = (index) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const payload = {
      Id: id,
      Questions: fields.map((field) => field.Question),
      Types: fields.map((field) => field.Type),
      type: "UpdateMonthly",
    };

    try {
      await fetch(API_POST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        mode: "no-cors",
      });

      // Show success message
      setSnackbar({
        open: true,
        message: "Form updated successfully!",
        severity: "success",
      });
      setTimeout(() => {
        navigate(`/ngo/${id}`);
      }, 2000);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to update form. Please try again.",
        severity: "error",
      });
    }
  };
  // Snackbar close handler
  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: "", severity: "" });
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      {loading ? (
        <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>
            Edit Monthly Form
          </Typography>
          {fields.map((field, index) => (
            <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
              <Box
                key={index}
                sx={{ mb: 3, display: "flex", justifyContent: "space-between" }}
              >
                <RadioGroup
                  row
                  value={field.Type}
                  onChange={(e) =>
                    handleFieldChange(index, "Type", e.target.value)
                  }
                >
                  <FormControlLabel
                    value="text"
                    control={<Radio />}
                    label="Text Field"
                  />
                  <FormControlLabel
                    value="number"
                    control={<Radio />}
                    label="Number Field"
                  />
                </RadioGroup>
                <IconButton
                  color="error"
                  onClick={() => removeField(index)}
                  sx={{ mt: 1 }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>

              <TextField
                label="Question"
                value={field.Question}
                onChange={(e) =>
                  handleFieldChange(index, "Question", e.target.value)
                }
                sx={{ mb: 2 }}
              />
            </Paper>
          ))}
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addField}
            sx={{ mb: 2 }}
          >
            Add Question
          </Button>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSubmit}
            sx={{mb:"20px"}}
          >
            Update Form
          </Button>
        </>
      )}
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

export default MonthlyEditForm;
