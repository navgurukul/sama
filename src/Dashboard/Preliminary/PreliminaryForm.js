import React, { useState } from "react";
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
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";

const PreliminaryForm = () => {
  const [formData, setFormData] = useState({
    numberOfSchools: "",
    numberOfTeachers: "",
    numberOfStudents: "",
    numberOfFemaleStudents: "",
    states: [],
    numberOfCourses: "",
    courses: [], // Default: one course
    type: "preliminary",
    ngoId: "SAM-1"
  })
  const [messageShown, setMessageShown] = useState(false); // State to track if the message has been shown

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
    if (!messageShown && numCourses > 0) {
      setMessageShown(true);
    }
  };

  // Handle changes to individual course fields
  const handleCourseChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedCourses = [...prev.courses];
      updatedCourses[index][field] = value;
      return { ...prev, courses: updatedCourses };
    });
  };

  // Add a new course manually
  // const addCourse = () => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     courses: [...prev.courses, { duration: "", unit: "Hours" }],
  //   }));
  // };

  // // Remove a course manually
  // const removeCourse = (index) => {
  //   setFormData((prev) => {
  //     const updatedCourses = prev.courses.filter((_, i) => i !== index);
  //     return { ...prev, courses: updatedCourses };
  //   });
  // };

  // Submit form
  const handleSubmit = async () => {
    const transformedCourses = formData.courses.map(
      (course, index) => `course${index + 1}: ${course.duration} ${course.unit.toLowerCase()}`
    );

    // Prepare the final payload
    const payload = {
      ...formData,
      courses: transformedCourses, // Replace the courses array with the transformed format
    };

    console.log(formData);
    try {
      const response = await fetch("https://script.google.com/macros/s/AKfycbxDcI2092h6NLFcV2yvJN-2NaHVp1jc9_T5qs0ntLDcltIdRRZw5nfHiZTT9prPLQsf2g/exec", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Form submitted successfully!");
      } else {
        alert("Failed to submit the form.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred.");
    }
  };
  return (
    <Box sx={{ maxWidth: 592, margin: "auto", padding: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ color: "#4A4A4A" }}>
        Preliminary Distribution Data
      </Typography>
      <Typography variant="body1" mb={3} gutterBottom sx={{ color: "#4A4A4A" }}>
        Short Description for Preliminary Distribution data
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography mb={1}>Number of Schools</Typography>
          <TextField
            name="numberOfSchools"
            type="number"
            value={formData.numberOfSchools}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <Typography mb={1}>Number of Teachers</Typography>
          <TextField
            // label="Number of Teachers"
            name="numberOfTeachers"
            type="number"
            value={formData.numberOfTeachers}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <Typography mb={1}>Number of Students</Typography>
          <TextField
            // label="Number of Students"
            name="numberOfStudents"
            type="number"
            value={formData.numberOfStudents}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <Typography mb={1}>Number of Female Students</Typography>
          <TextField
            // label="Number of Female Students"
            name="numberOfFemaleStudents"
            type="number"
            value={formData.numberOfFemaleStudents}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <Typography mb={1}>Name of States</Typography>
            <Select
              labelId="states-label"
              name="states"
              multiple
              value={formData.states}
              onChange={handleStatesChange}
            >
              {["Karnataka", "Uttar Pradesh", "Gujarat", "Maharashtra"].map(
                (state) => (
                  <MenuItem key={state} value={state}>
                    {state}
                  </MenuItem>
                )
              )}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Typography mb={1}>Total Number of Courses</Typography>
          <TextField
            // label="Number of Courses"
            type="number"
            name="numberOfCourses"
            value={formData.numberOfCourses}
            onChange={handleCourseNumberChange}
            fullWidth
          />
        </Grid>
        {messageShown && (
        <Typography
          sx={{ mt:3,pl:2, fontWeight: "bold" }}
        >
          Duration of Course
        </Typography>
      )}
        {formData.courses.map((course, index) => (
          <Grid container spacing={2} key={index} sx={{ marginBottom: 2, p: 2 }}>
            <Grid item xs={12}>
              <Typography variant="body1" sx={{ marginBottom: 1}}>
                Course {index + 1}
              </Typography>
            </Grid>
            <Grid item xs={2}  >
              <TextField
                placeholder={index + 1}
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
        >
          Submit
        </Button>
      </Box>
    </Box>
  );
};

export default PreliminaryForm;