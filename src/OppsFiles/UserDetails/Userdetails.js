import React, { useState } from "react";
import {
  Button,
  TextField,
  Container,
  FormControl,
  Snackbar,
  Select,
  MenuItem,
  Alert,
  Typography,
  FormHelperText,
  CircularProgress,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { breakpoints } from "../../theme/constant";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const FormComponent = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const role = JSON.parse(localStorage.getItem('role'));
  const { userId } = location.state || {};
  const isActive = useMediaQuery("(max-width:" + breakpoints.values.sm + "px)");

  const statesOptions = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
    "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
    "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttarakhand",
    "Uttar Pradesh", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
    "Dadra and Nagar Haveli", "Daman and Diu", "Delhi", "Lakshadweep", "Puducherry"
  ];

  const idProofOptions = [
    "Aadhar Card", "Voter ID card", "Driving License", "PAN Card", "Passport"
  ];

  const useCaseOptions = [
    "Income Increase/Job", "Entrepreneurship", "Internships", "Skilling/Vocations"
  ];

  const statusOptions = ["Data Uploaded", "Laptop Assigned"];
  
  const qualification = [
    "Elementary School", "Middle School", "High School", "Higher Secondary Education",
    "Undergraduate Degree pursuing", "Undergraduate Degree completed",
    "Diploma Courses", "Postgraduate Degree"
  ];

  const occupation = ["Students", "Trainer", "Employed"];

  const familyAnnualIncome = [
    "0 to 50K", "50 to 1Lakh", "1 to 2lakh", "2 to 3lakh", "3 to 5lakh", "5+ lakh"
  ];

  const fields = [
    { label: "Name", name: "name" },
    { label: "Email", name: "email" },
    { label: "Contact Number", name: "contactNumber" },
    { label: "Date Of Birth", name: "dateOfBirth" },
    { label: "Address (Number, Street, Locality etc.)", name: "address" },
    { label: "State", name: "addressState" },
    { label: "ID Proof Type", name: "idProofType" },
    { label: "ID Number", name: "idNumber" },
    { label: "Qualification", name: "qualification" },
    { label: "Occupation Status", name: "occupation" },
    { label: "Use Case", name: "useCase" },
    { label: "Number of Family Members", name: "familyMembers" },
    { label: "Father/Mother/Guardian's Occupation", name: "guardian" },
    { label: "Family Annual Income", name: "familyAnnualIncome" },
    { label: "Status", name: "status" },
    { label: "Laptop Assigned", name: "laptopAssigned" }
  ];

  const requiredFields = [
    "name", "email", "contactNumber", "dateOfBirth", "address", "addressState",
    "idProofType", "idNumber", "qualification", "occupation", "useCase",
    "familyMembers", "guardian", "familyAnnualIncome", "status", "laptopAssigned"
  ];

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactNumber: "",
    dateOfBirth: "",
    address: "",
    addressState: "",
    idProofType: "",
    idNumber: "",
    qualification: "",
    occupation: "",
    useCase: "",
    familyMembers: "",
    guardian: "",
    familyAnnualIncome: "",
    status: "",
    laptopAssigned: "",
    idProofFile: null,
    incomeCertificateFile: null
  });

  const [errors, setErrors] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when field is filled
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleFileChange = (event, fileType) => {
    const file = event.target.files[0];
    setFormData(prev => ({
      ...prev,
      [fileType]: file
    }));
    // Clear error when file is selected
    if (errors[fileType]) {
      setErrors(prev => ({
        ...prev,
        [fileType]: ""
      }));
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const validate = () => {
    let tempErrors = {};
    let isValid = true;

    // Check all required fields
    requiredFields.forEach(field => {
      if (!formData[field] || (Array.isArray(formData[field]) && formData[field].length === 0)) {
        tempErrors[field] = "This field is required";
        isValid = false;
      }
    });

    // Email validation
    if (!formData.email) {
      tempErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "Email is not valid";
    }

    // Contact number validation
    if (!formData.contactNumber) {
      tempErrors.contactNumber = "Contact number is required";
    } else if (!/^\d{10}$/.test(formData.contactNumber)) {
      tempErrors.contactNumber = "Contact number should be 10 digits Number only";
    }

    // Aadhar card validation
    if (formData.idProofType === "Aadhar Card") {
      if (!formData.idNumber) {
        tempErrors.idNumber = "Aadhar Card number is required";
      } else if (!/^\d{12}$/.test(formData.idNumber)) {
        tempErrors.idNumber = "Aadhar Card number should be 12 digits and only contain numbers";
      }
    }

    // File validations
    if (formData.idProofType && !formData.idProofFile) {
      tempErrors.idProofFile = "ID Proof file is required";
    }
    if (!formData.incomeCertificateFile) {
      tempErrors.incomeCertificateFile = "Income Certificate file is required";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validate()) {
      setLoading(true);
      
      const readFileAsBase64 = (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(",")[1]);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(file);
        });
      };

      try {
        const [idProofBase64, incomeCertificateBase64] = await Promise.all([
          formData.idProofFile ? readFileAsBase64(formData.idProofFile) : null,
          formData.incomeCertificateFile ? readFileAsBase64(formData.incomeCertificateFile) : null
        ]);

        const finalData = {
          ...formData,
          idProofFile: idProofBase64,
          idProofFileName: formData.idProofFile?.name,
          idProofMimeType: formData.idProofFile?.type,
          incomeCertificateFile: incomeCertificateBase64,
          incomeCertificateFileName: formData.incomeCertificateFile?.name,
          incomeCertificateMimeType: formData.incomeCertificateFile?.type,
          type: "userdetails",
          ngoId: user || id
        };

        const response = await fetch(
          process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            mode: "no-cors",
            body: JSON.stringify(finalData)
          }
        );

        setFormData({
          name: "",
          email: "",
          contactNumber: "",
          dateOfBirth: "",
          address: "",
          addressState: "",
          idProofType: "",
          idNumber: "",
          qualification: "",
          occupation: "",
          useCase: "",
          familyMembers: "",
          guardian: "",
          familyAnnualIncome: "",
          status: "",
          laptopAssigned: "",
          idProofFile: null,
          incomeCertificateFile: null
        });

        setSnackbarMessage("Data updated successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        
        // Navigate after successful submission
        navigate(role.includes("admin") ? `/ngo/${userId}` : "/beneficiarydata");
      } catch (error) {
        console.error("Error uploading files:", error);
        setSnackbarMessage("Something went wrong!");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    } else {
      setSnackbarMessage("Please fill all required fields correctly.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const renderTextField = (field) => (
    <FormControl fullWidth margin="normal" key={field.name}>
      <Typography variant="subtitle1">
        {field.label}
        {requiredFields.includes(field.name) && <span style={{ color: "red" }}> *</span>}
      </Typography>
      <TextField
        fullWidth
        name={field.name}
        value={formData[field.name] || ""}
        onChange={handleChange}
        variant="outlined"
        margin="normal"
        error={!!errors[field.name]}
        helperText={errors[field.name]}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: errors[field.name] ? 'red' : 'rgba(0, 0, 0, 0.23)',
            },
            '&:hover fieldset': {
              borderColor: errors[field.name] ? 'red' : 'rgba(0, 0, 0, 0.23)',
            },
            '&.Mui-focused fieldset': {
              borderColor: errors[field.name] ? 'red' : 'primary.main',
            },
          },
        }}
      />
    </FormControl>
  );

  const renderSelect = (field, options) => (
    <FormControl fullWidth margin="normal" key={field.name} error={!!errors[field.name]}>
      <Typography variant="subtitle1">
        {field.label}
        {requiredFields.includes(field.name) && <span style={{ color: "red" }}> *</span>}
      </Typography>
      <Select
        name={field.name}
        value={formData[field.name] || ""}
        onChange={handleChange}
        sx={{ 
          textAlign: "left",
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: errors[field.name] ? 'red' : 'rgba(0, 0, 0, 0.23)',
          },
        }}
      >
        {options.map((option, index) => (
          <MenuItem key={index} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
      {errors[field.name] && (
        <FormHelperText>{errors[field.name]}</FormHelperText>
      )}
      {field.name === 'idProofType' && formData.idProofType && (
        <FormControl fullWidth margin="normal">
          <Typography variant="subtitle1">
            Upload ID Proof Image
            <span style={{ color: "red" }}> *</span>
          </Typography>
          <Button
            variant="outlined"
            component="label"
            sx={{ 
              border: errors.idProofFile ? "1px solid red" : "1px solid #5C785A",
              borderRadius: "100px",
              color: errors.idProofFile ? "red" : "#5C785A"
            }}
          >
            Upload ID Proof Image
            <input
              type="file"
              hidden
              onChange={(e) => handleFileChange(e, "idProofFile")}
            />
          </Button>
          {formData.idProofFile ? (
            <Typography sx={{ mt: 1 }}>
              Selected file: {formData.idProofFile.name}
            </Typography>
          ) : (
            errors.idProofFile && (
              <Typography color="error" sx={{ mt: 1 }}>
                {errors.idProofFile}
              </Typography>
            )
          )}
        </FormControl>
      )}
    </FormControl>
  );

  return (
    <Container maxWidth="sm" sx={{ mb: 2, pb: 2 }}>
      <form onSubmit={handleSubmit}>
        {fields.map((field) => {
          switch (field.name) {
            case 'idProofType':
              return renderSelect(field, idProofOptions);
            case 'status':
              return renderSelect(field, statusOptions);
            case 'useCase':
              return renderSelect(field, useCaseOptions);
            case 'addressState':
              return renderSelect(field, statesOptions);
            case 'qualification':
              return renderSelect(field, qualification);
            case 'occupation':
              return renderSelect(field, occupation);
            case 'familyAnnualIncome':
              return renderSelect(field, familyAnnualIncome);
            case 'dateOfBirth':
              return (
                <FormControl fullWidth margin="normal" key={field.name}>
                  <Typography variant="subtitle1">
                    {field.label}
                    {requiredFields.includes(field.name) && <span style={{ color: "red" }}> *</span>}
                  </Typography>
                  <TextField
                    fullWidth
                    type="date"
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    variant="outlined"
                    margin="normal"
                    error={!!errors[field.name]}
                    helperText={errors[field.name]}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: errors[field.name] ? 'red' : 'rgba(0, 0, 0, 0.23)',
                        },
                      },
                    }}
                  />
                </FormControl>
              );
            default:
              return renderTextField(field);
          }
        })}

        <FormControl fullWidth margin="normal">
          <Typography variant="subtitle1">
            Income Certificate
            <span style={{ color: "red" }}> *</span>
          </Typography>
          <Button
            variant="outlined"
            component="label"
            sx={{ 
              border: errors.incomeCertificateFile ? "1px solid red" : "1px solid #5C785A",
              borderRadius: "100px",
              color: errors.incomeCertificateFile ? "red" : "#5C785A"
            }}
          >
            Upload Income Certificate
            <input
              type="file"
              hidden
              onChange={(e) => handleFileChange(e, "incomeCertificateFile")}
            />
          </Button>
          {formData.incomeCertificateFile ? (
            <Typography sx={{ mt: 1 }}>
              Selected file: {formData.incomeCertificateFile.name}
            </Typography>
          ) : (
            errors.incomeCertificateFile && (
              <Typography color="error" sx={{ mt: 1 }}>
                {errors.incomeCertificateFile}
              </Typography>
            )
          )}
        </FormControl>

        <Button
          fullWidth
          variant="contained"
          color="primary"
          sx={{
            mt: 4,
            width: "207px",
            borderRadius: "100px",
            marginLeft: "150px",
            fontSize: "17.7px",
          }}
          type="submit"
          // disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Add Beneficiary"
          )}
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