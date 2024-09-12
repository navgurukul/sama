import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Container,
  FormControl,
  Snackbar,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Typography,
  List,
  ListItemText,
  ListItem,
} from "@mui/material";

import useMediaQuery from "@mui/material/useMediaQuery";

import { breakpoints } from "../../theme/constant";

const FormComponent = () => {
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

  const idProofOptions = [
    "Ration card",
    "Aadhar Card",
    "Voter ID card",
    "Driving License",
    "PAN Card",
    "Passport",
    "Domicile/Secondary/Senior Secondary Marksheet",
  ];

  const useCaseOptions = [
    "Income Increase/Job",
    "Entrepreneurship",
    "Internships",
    "Skilling/Vocations",
  ];

  const statusOptions = [
    "Laptop Received",
    "Employed",
    "Intern",
    "Entrepreneur/Freelancing",
    "Trainer",
  ];

  const fields = [
    { label: "Name", name: "name" },
    { label: "Email", name: "email" },
    { label: "Contact Number", name: "contactNumber" },
    { label: "Address", name: "address" },
    { label: "Address State", name: "addressState" },
    { label: "ID Proof Type", name: "idProofType" },
    { label: "ID Number", name: "idNumber" },
    { label: "Qualification", name: "qualification" },
    { label: "Occupation", name: "occupation" },
    { label: "Date Of Birth", name: "dateOfBirth" },
    { label: "Use Case", name: "useCase" },
    { label: "Number of Family Members", name: "familyMembers" },
    { label: "Status", name: "status" },
    { label: "Laptop Assigned", name: "laptopAssigned" },
  ];

  const [formData, setFormData] = useState({
    idProofType: "",
    useCase: "",
    addressState: "",
    status: "",
  });

  const [errors, setErrors] = useState({});
  const [file, setFile] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const isActive = useMediaQuery("(max-width:" + breakpoints.values.sm + "px)");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const validate = () => {
    let tempErrors = {};
    tempErrors.email = formData.email
      ? /\S+@\S+\.\S+/.test(formData.email)
        ? ""
        : "Email is not valid"
      : "Email is required";
    tempErrors.contactNumber = formData.contactNumber
      ? /^\d{10}$/.test(formData.contactNumber)
        ? ""
        : "Contact number should be 10 digits Number only"
      : "Contact number is required";
    if (formData.idProofType === "Aadhar Card") {
      tempErrors.idNumber = formData.idNumber
        ? /^\d{12}$/.test(formData.idNumber)
          ? ""
          : "Aadhar Card number should be 12 digits and only contain numbers"
        : "Aadhar Card number is required";
    }

    tempErrors.file = file ? "" : "Please upload a id proof image";

    setErrors(tempErrors);

    return Object.values(tempErrors).every((x) => x === "");
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (e) => {
    console.log("click me");
    e.preventDefault();

    if (validate()) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64File = reader.result.split(",")[1];
        var withFile = {
          ...formData,
          file: base64File,
          fileName: file.name,
          mimeType: file.type,
          type: "userdetails",
        };
        var withoutFile = {
          ...formData,
          type: "userdetails",
        };
        const finalData = file ? withFile : withoutFile;

        try {
          const response = await fetch(
            "https://script.google.com/macros/s/AKfycbxamFLfoY7ME3D6xCQ9f9z5UrhG2Nui5gq06bR1g4aiidMj3djQ082dM56oYnuPFb2PuA/exec",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              mode: "no-cors",
              body: JSON.stringify(finalData), // Send the entire formData object
            }
          );

          setSnackbarOpen(true);
          if (!response.ok) {
            throw new Error("Network response was not ok");
          } else {
            setSnackbarOpen(true);
          }
        } catch (error) {
          console.error("Error uploading file:", error);
        }
      };
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mb: 2, pb: 2 }}>
      {/* <Typography variant="h6" gutterBottom align="center" mt={2}>
        Single data upload Form
      </Typography> */}
      <form onSubmit={handleSubmit}>
        {fields.map((field) => {
          if (field.name === "idProofType") {
            return (
              <FormControl fullWidth margin="normal" key={field.name}>
                <InputLabel>{field.label}</InputLabel>
                <Select
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  label={field.label}
                  sx={{ textAlign: "left" }}
                >
                  {idProofOptions.map((option, index) => (
                    <MenuItem key={index} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            );
          } else if (field.name === "useCase") {
            return (
              <FormControl
                fullWidth={isActive && "true"}
                sx={!isActive && { width: "55%" }}
                margin="normal"
                key={field.name}
              >
                <InputLabel>{field.label}</InputLabel>
                <Select
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  label={field.label}
                  sx={{ textAlign: "left" }}
                >
                  {useCaseOptions.map((option, index) => (
                    <MenuItem key={index} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            );
          } else if (field.name === "status") {
            return (
              <FormControl fullWidth margin="normal" key={field.name}>
                <InputLabel>{field.label}</InputLabel>
                <Select
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  label={field.label}
                  sx={{ textAlign: "left" }}
                >
                  {statusOptions.map((option, index) => (
                    <MenuItem key={index} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            );
          } else if (field.name === "dateOfBirth") {
            return (
              <TextField
                fullWidth={isActive && "true"}
                sx={!isActive && { width: "43%", marginRight: "10px" }}
                key={field.name}
                label={field.label}
                name={field.name}
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData[field.name] || ""}
                onChange={handleChange}
                variant="outlined"
                margin="normal"
              />
            );
          } else if (field.name === "addressState") {
            return (
              <FormControl fullWidth margin="normal" key={field.name}>
                <InputLabel>{field.label}</InputLabel>
                <Select
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  label={field.label}
                  sx={{ textAlign: "left" }}
                >
                  {statesOptions.map((option, index) => (
                    <MenuItem key={index} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            );
          } else {
            return (
              <TextField
                key={field.name}
                label={field.label}
                name={field.name}
                value={formData[field.name] || ""}
                onChange={handleChange}
                fullWidth
                margin="normal"
                error={!!errors[field.name]}
                // helperText={errors[field.name]}
              />
            );
          }
        })}
        <Button
          variant="contained"
          component="label"
          style={{ marginTop: "16px" }}
        >
          Upload ID Proof Image
          <input type="file" hidden onChange={handleFileChange} />
        </Button>
        {file && (
          <Typography variant="body1" mt={2}>
            {file.name}
          </Typography>
        )}
        {!file && (
          <Typography color="error" mt={2}>
            {errors.file}
          </Typography>
        )}

        <Button type="submit" variant="contained">
          Submit
        </Button>
      </form>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          Data stored successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default FormComponent;
