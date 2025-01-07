import React, { useState, useEffect } from "react";
import {
  TextField,
  Select,
  MenuItem,
  Button,
  Box,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Grid,
  Snackbar,
  Alert,
  Chip,
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { useNavigate } from "react-router-dom";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
const PreliminaryForm = ({ userId }) => {
  const navigate = useNavigate();

  const initialFormData = {
    numberOfSchools: "",
    numberOfTeachers: "",
    numberOfStudents: "",
    numberOfFemaleStudents: "",
    states: [],
    numberOfCourses: "",
    courses: [],
    type: "preliminary",
    ngoId: userId,
  };

  const statesOptions = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jammu and Kashmir",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttarakhand",
    "Uttar Pradesh",
    "West Bengal",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli",
    "Daman and Diu",
    "Delhi",
    "Lakshadweep",
    "Puducherry",
  ];

  const [formData, setFormData] = useState(initialFormData);
  const [messageShown, setMessageShown] = useState(false); // State to track if the message has been shown
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "",
  });
  // Validate form fields
  const validateForm = () => {
    const {
      numberOfSchools,
      numberOfTeachers,
      numberOfStudents,
      numberOfFemaleStudents,
      states,
      numberOfCourses,
      courses,
    } = formData;
    // Check if any required field is empty

    if (
      !numberOfSchools || numberOfSchools < 0 ||
      !numberOfTeachers || numberOfTeachers < 0 ||
      !numberOfStudents || numberOfStudents < 0 ||
      !numberOfFemaleStudents || numberOfFemaleStudents < 0 ||
      !numberOfCourses || numberOfCourses < 0 ||
      states.length === 0 ||
      courses.some((course) => !course.duration || !course.unit)
    ) {
      return false;
    }

    return true;
  };
  // Update form validation whenever formData changes
  useEffect(() => {
    setIsSubmitDisabled(!validateForm());
  }, [formData]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  // Handle states selection
  const handleStatesChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      states: event.target.value,
    }));
  };
  // Handle the number of courses and dynamically adjust the courses array
  const handleCourseNumberChange = (event) => {
    const numCourses = parseInt(event.target.value, 10) || 0; // Default to 0 if invalid
    setFormData((prev) => {
      const updatedCourses = Array.from({ length: numCourses }, (_, i) =>
        prev.courses[i] || { duration: "", unit: "Hours" }
      );
      return { ...prev, numberOfCourses: numCourses, courses: updatedCourses };
    });
    setMessageShown(numCourses > 0);
  };
  // Handle changes to individual course fields
  const handleCourseChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedCourses = [...prev.courses];
      updatedCourses[index][field] = value;
      return { ...prev, courses: updatedCourses };
    });
  };
  const handleSubmit = async () => {
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: " Please fill all required fields before submitting!",
        severity: "error",
      });
      return;
    }
    const transformedCourses = formData.courses.map(
      (course, index) => ` ${course.duration} ${course.unit.toLowerCase()}`
    );
    // Prepare the final payload
    const payload = {
      ...formData,
      courses: transformedCourses, // Replace the courses array with the transformed format
    };
    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbw9O-rLkIeTtQGQvQhtoK4XPS9F710xckxRJxe_V02FrOssJnYs89HuiMjQgU3QDhxtnQ/exec",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          mode: "no-cors",
          body: JSON.stringify(payload),
        }
      );

      // alert("Form submited successfully!");
      setSnackbar({
        open: true,
        message: "Form submitted successfully!",
        severity: "success",
      });
      setFormData(initialFormData);
      setTimeout(() => {
        window.location.reload(); // Reloads the current route
      }, 2000);

      setMessageShown(false);
      // }
    } catch (error) {
      console.error("Error:", error);
      // alert("Failed to submit the form.");
      setSnackbar({
        open: true,
        message: "Failed to submit the form.",
        severity: "error",
      });
    }
  };


  const handleDeleteState = (stateToDelete, event) => {
    event.stopPropagation();
    setFormData((prev) => ({
      ...prev,
      states: prev.states.filter((state) => state !== stateToDelete),
    }));
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: "", severity: "" });
  };

  return (
    <Box sx={{ maxWidth: 592, margin: "auto", padding: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ color: "#4A4A4A" }}>
        Preliminary Distribution Data
      </Typography>
      <Typography variant="body1" mb={3} gutterBottom sx={{ color: "#4A4A4A" }}>
        Please fill in the below required details for us to proceed with the
        distribution process.
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="subtitle1" mb={1}>
            Number of Schools
          </Typography>
          <TextField
            name="numberOfSchools"
            type="number"
            value={formData.numberOfSchools}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "" || Number(value) >= 0) {
                handleChange(e); // Call the existing handleChange function only for valid input
              }
            }}
            fullWidth
          />
        </Grid>

        <Grid item xs={6}>
          <Typography variant="subtitle1" mb={1}>
            Number of Teachers
          </Typography>
          <TextField
            name="numberOfTeachers"
            type="number"
            value={formData.numberOfTeachers}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "" || Number(value) >= 0) {
                handleChange(e); // Call the existing handleChange function only for valid input
              }
            }} fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle1" mb={1}>
            Number of Students
          </Typography>
          <TextField
            name="numberOfStudents"
            type="number"
            value={formData.numberOfStudents}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "" || Number(value) >= 0) {
                handleChange(e); // Call the existing handleChange function only for valid input
              }
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle1" mb={1}>
            Number of Female Students
          </Typography>
          <TextField
            name="numberOfFemaleStudents"
            type="number"
            value={formData.numberOfFemaleStudents}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "" || Number(value) >= 0) {
                handleChange(e); // Call the existing handleChange function only for valid input
              }
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <Typography variant="subtitle1" mb={1}>
              States Operating In
            </Typography>
            <Select
              labelId="states-label"
              name="states"
              multiple
              value={formData.states}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  states: event.target.value,
                }))
              }
              renderValue={(selected) => (
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={value}
                      onDelete={(event) => handleDeleteState(value, event)}
                      onMouseDown={(event) => {
                        // Prevent Select from opening when clicking the delete icon
                        event.stopPropagation();
                      }}
                      sx={{
                        backgroundColor: "#e0e0e0",
                        borderRadius: "4px",
                        color: "#4A4A4A",
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                        ".MuiChip-deleteIcon": {
                          fontSize: "16px",
                          marginLeft: "8px",
                          marginRight: "8px",
                        },
                      }}
                      deleteIcon={
                        <span
                          style={{
                            fontWeight: "bold",
                            fontSize: "16px",
                            color: "#4A4A4A",
                          }}
                        >
                          X
                        </span>
                      }
                    />
                  ))}
                </Box>
              )}
              sx={{
                ".MuiSelect-select": {
                  padding: "8px",
                },
              }}
            >
              {statesOptions.map((state) => (
                <MenuItem key={state} value={state}>
                  {state}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle1" mb={1}>
            Total Number of Courses
          </Typography>
          <TextField
            type="number"
            name="numberOfCourses"
            value={formData.numberOfCourses}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "" || Number(value) >= 0) {
                handleCourseNumberChange(e); // Call the existing handleChange function only for valid input
              }
            }}
            fullWidth
          />
        </Grid>
        {messageShown && (
          <Typography variant="subtitle1" sx={{ mt: 3, pl: 2, fontWeight: "bold" }}>
            Duration of Each Course
          </Typography>
        )}
        {formData.courses.map((course, index) => (
          <Grid
            container
            spacing={2}
            key={index}
            sx={{ marginBottom: "8px", p: 2 }}
          >
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
                Course {index + 1}
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <TextField
                type="number"
                value={course.duration}
                onChange={(e) =>
                  handleCourseChange(index, "duration", e.target.value)
                }
                fullWidth
              />
            </Grid>
            <Grid item xs={3}>
              <FormControl>
                <Select
                  value={course.unit}
                  onChange={(e) =>
                    handleCourseChange(index, "unit", e.target.value)
                  }
                >
                  <MenuItem value="Hours">Hours</MenuItem>
                  <MenuItem value="Months">Months</MenuItem>
                  <MenuItem value="Week">Week</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        ))}
      </Grid>
      <Box textAlign="center" sx={{ margin: "auto", mt: 5 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          fullWidth
          sx={{ width: "126px" }}
          disabled={isSubmitDisabled}
        >
          Submit
        </Button>
      </Box>
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
  );
};
export default PreliminaryForm;
