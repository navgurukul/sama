import React, { useState } from "react";
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
    "Puducherry"
  ];

  const idProofOptions = [
    "Ration card", 
    "Aadhar Card", 
    "Voter ID card", 
    "Driving License", 
    "PAN Card", 
    "Passport", 
    "Domicile/Secondary/Senior Secondary Marksheet"
  ];
  const useCaseOptions = [
    "Income Increase/Job", 
    "Entrepreneurship", 
    "Internships", 
    "Skilling/Vocations"
  ];
  const statusOptions = [
    "Laptop Received", 
    "Employed", 
    "Intern", 
    "Entrepreneur/Freelancing", 
    "Trainer"
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
  const [snackbarMessage, setSnackbarMessage] = useState(""); // To store custom message
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // Success or Error

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

    tempErrors.file = file ? "" : "Please upload a valid ID proof image";

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
              body: JSON.stringify(finalData),
            }
          );

          // Reset form after successful submission
          setFormData({
            idProofType: "",
            useCase: "",
            addressState: "",
            status: "",
          });
          setFile(null); // Reset file input
          setSnackbarMessage("Data updated successfully!");
          setSnackbarSeverity("success");
          setSnackbarOpen(true);
        } catch (error) {
          console.error("Error uploading file:", error);
          setSnackbarMessage("Something went wrong!");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
        }
      };
    } else {
      // If validation fails, show error message
      setSnackbarMessage("Please correct the number and ID fields.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mb: 2, pb: 2 }}>
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
              <FormControl fullWidth margin="normal" key={field.name}>
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
                fullWidth
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
                fullWidth
                key={field.name}
                label={field.label}
                name={field.name}
                value={formData[field.name] || ""}
                onChange={handleChange}
                variant="outlined"
                margin="normal"
              />
            );
          }
        })}
          <FormControl fullWidth margin="normal">
           <Button variant="outlined" component="label">
              Upload ID Proof Image
              <input type="file" hidden onChange={handleFileChange} />
           </Button>
           {errors.file && (
             <Typography color="error">{errors.file}</Typography>           
             )}
        </FormControl>

        <Button
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          type="submit"
        >
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
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default FormComponent;
