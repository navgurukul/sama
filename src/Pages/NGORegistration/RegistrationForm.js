import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  FormControl,
  FormLabel,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { useParams } from "react-router-dom";

const RadioWithOther = ({ label, name, value, onChange, options, error }) => {
  const handleRadioChange = (e) => {
    const { value } = e.target;
    onChange(e);
  };

  const handleOtherChange = (e) => {
    const { value } = e.target;
    onChange({ target: { name, value } });
  };

  return (
    <FormControl fullWidth margin="normal" required error={!!error}>
      <FormLabel>
        <Typography component="span" fontWeight="bold">
          {label}
        </Typography>
      </FormLabel>
      <RadioGroup
        name={name}
        value={options.includes(value) ? value : "Other"}
        onChange={handleRadioChange}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option}
            value={option}
            control={<Radio />}
            label={option}
          />
        ))}
        <FormControlLabel value="Other" control={<Radio />} label="Other" />
      </RadioGroup>
      {value === "Other" || !options.includes(value) ? (
        <TextField
          name={name}
          label="Please specify"
          value={value === "Other" ? "" : value}
          onChange={handleOtherChange}
          fullWidth
          margin="normal"
          required
          error={!!error}
          helperText={error}
        />
      ) : null}
      {error && <Typography color="error">{error}</Typography>}
    </FormControl>
  );
};

function RegistrationForm() {
  const navigate = useNavigate();
  const { donorId } = useParams();
  const [formFields, setFormFields] = useState([]);
  const [emailExists, setEmailExists] = useState(false);
  const [contactExists, setContactExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [checkingContact, setCheckingContact] = useState(false);

  // Define PDF size limit (in bytes)
  const MAX_PDF_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_FILE_TYPES = [
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  const [formData, setFormData] = useState({
    organizationName: "",
    registrationNumber: "",
    primaryContactName: "",
    contactNumber: "",
    email: "",
    operatingState: "",
    location: [],
    yearsOperating: "",
    focusArea: "",
    worksWithWomen: "",
    infrastructure: "",
    beneficiarySelection: [],
    beneficiarySelectionOther: "",
    numberOfBeneficiaries: "",
    ageGroup: "",
    primaryUse: [],
    primaryUseOther: "",
    expectedOutcome: "",
    laptopTracking: "",
    jobsCreated: "",
    previousProjects: "",
    sufficientStaff: "",
    impactReport: "",
    orgLaptopRequire: "",
  });

  const [errors, setErrors] = useState({});
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [companies, setCompanies] = useState([]);
  const [isFormValid, setIsFormValid] = useState(false);

  const verifyEmail = async (email) => {
    if (!email) return;

    setCheckingEmail(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_NgoInformationApi}?type=registration`
      );
      const responseData = await response.json();

      if (
        responseData.status === "success" &&
        Array.isArray(responseData.data)
      ) {
        const exists = responseData.data.some(
          (item) => item.email?.toLowerCase() === email.toLowerCase()
        );
        setEmailExists(exists);

        if (exists) {
          setErrors((prev) => ({
            ...prev,
            email: "This email is already registered",
          }));
        } else {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.email;
            return newErrors;
          });
        }
      }
    } catch (error) {
      console.error("Error checking email:", error);
    } finally {
      setCheckingEmail(false);
    }
  };

  const verifyContactNumber = async (contactNumber) => {
    if (!contactNumber) return;

    setCheckingContact(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_NgoInformationApi}?type=registration`
      );
      const responseData = await response.json();

      if (
        responseData.status === "success" &&
        Array.isArray(responseData.data)
      ) {
        const exists = responseData.data.some(
          (item) =>
            String(item.contactNumber).replace(/\D/g, "") ===
            contactNumber.replace(/\D/g, "")
        );
        setContactExists(exists);

        if (exists) {
          setErrors((prev) => ({
            ...prev,
            contactNumber: "This contact number is already registered",
          }));
        } else {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.contactNumber;
            return newErrors;
          });
        }
      }
    } catch (error) {
      console.error("Error checking contact number:", error);
    } finally {
      setCheckingContact(false);
    }
  };

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_NgoInformationApi}?type=donorID`
        );
        const data = await response.json();
        setCompanies(data);
      } catch (error) {
        console.error("Error fetching company names:", error);
      }
    }
    fetchCompanies();
  }, []);

  const donorIDs = companies.find((company) => company.Donner === donorId)?.[
    "Donor id"
  ];

  useEffect(() => {
    const fetchFormFields = async () => {
      try {
        const baseURL =
          `${process.env.REACT_APP_NgoInformationApi}?type=donorQuestion`;
        const apiUrl = donorIDs ? `${baseURL}&donorId=${donorIDs}` : baseURL;

        const response = await fetch(apiUrl);
        const data = await response.json();
        setFormFields(data);
      } catch (error) {
        console.error("Error fetching form fields:", error);
      }
    };

    fetchFormFields();
  }, [donorIDs]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "email") {
      verifyEmail(value);
    }

    if (name === "contactNumber") {
      verifyContactNumber(value);
    }
  };

  const handleCheckboxChange = (e, field) => {
    const { value, checked } = e.target;
    setFormData((prevState) => {
      const newSelection = checked
        ? [...prevState[field], value]
        : prevState[field].filter((item) => item !== value);
      return { ...prevState, [field]: newSelection };
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    
    // Validate file size and type
    if (file) {
      if (file.size > MAX_PDF_SIZE) {
        setErrors(prev => ({
          ...prev,
          impactReport: `File size must not exceed ${MAX_PDF_SIZE / 1024 / 1024}MB`
        }));
        setFileName("");
        e.target.value = null; // Clear the file input
        return;
      }

      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          impactReport: 'Only PDF, DOC, DOCX, and XLSX files are allowed'
        }));
        setFileName("");
        e.target.value = null; // Clear the file input
        return;
      }

      // Clear any previous file-related errors
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.impactReport;
        return newErrors;
      });

      setFormData({ ...formData, impactReport: file });
      setFileName(file.name);
    }
  };

  const formfields = [
    {
      name: "impactReport",
      label: "Impact Report",
      type: "fileUpload",
      required: true,
    },
    { name: "contactNumber", label: "Contact Number", required: true },
    { name: "email", label: "Email", required: true },
    { name: "organizationName", label: "Organization Name", required: true },
    {
      name: "registrationNumber",
      label: "Registration Number",
      required: true,
    },
    {
      name: "primaryContactName",
      label: "Primary Contact Name ",
      required: true,
    },
  ];

  const validate = () => {
    const newErrors = {};

    formfields.forEach((field) => {
      const value = formData[field.name];

      // File validation
      if (field.name === "impactReport") {
        if (!value) {
          newErrors[field.name] = `Allowed file types: PDF, DOC, DOCX, XLSX (Max size: 5MB)`;

        } 
      }

      // Contact number validation
      if (field.name === "contactNumber" && value) {
        const contactNumberPattern = /^\d{10}$/;
        if (!contactNumberPattern.test(value)) {
          newErrors[field.name] = "Contact number must be a valid 10-digit number";
        }
      }

      // Email validation
      if (field.name === "email" && value) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
          newErrors[field.name] = "Invalid email address";
        }
      }

      // Organization name validation
      if (field.name === "organizationName" && value) {
        const textPattern = /^[A-Za-z\s]+$/;
        if (!textPattern.test(value)) {
          newErrors[field.name] = "Organization name should contain only letters and spaces";
        }
      }

      // Registration number validation - only numbers and letters
      if (field.name === "registrationNumber" && value) {
        const alphanumericPattern = /^[a-zA-Z0-9]+$/;
        if (!alphanumericPattern.test(value)) {
          newErrors[field.name] = "Registration number must contain only letters and numbers";
        }
      }      

      // Primary contact name validation - allow letters
      if (field.name === "primaryContactName" && value) {
        const textPattern = /^[A-Za-z\s]+$/;  
        if (!textPattern.test(value)) {
          newErrors[field.name] = "Name should contain only letters";
        }
      }
    });

    // Validate orgLaptopRequire field - only numbers
    if (formData.orgLaptopRequire) {
      const numberPattern = /^\d+$/;
      if (!numberPattern.test(formData.orgLaptopRequire)) {
        newErrors.orgLaptopRequire = "Please enter only numbers";
      }
    }

    if (emailExists) {
      newErrors.email = "This email is already registered";
    }

    if (contactExists) {
      newErrors.contactNumber = "This contact number is already registered";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    setIsFormValid(validate());
  }, [formData, formfields]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setLoading(true);
      const updatedFormData = { ...formData };
      if (updatedFormData.beneficiarySelectionOther) {
        updatedFormData.beneficiarySelection =
          updatedFormData.beneficiarySelection.map((item) =>
            item === "Other" ? updatedFormData.beneficiarySelectionOther : item
          );
      }
      if (updatedFormData.primaryUseOther) {
        updatedFormData.primaryUse = updatedFormData.primaryUse.map((item) =>
          item === "Other" ? updatedFormData.primaryUseOther : item
        );
      }

      delete updatedFormData.beneficiarySelectionOther;
      delete updatedFormData.primaryUseOther;

      let base64File = "";
      if (updatedFormData.impactReport) {
        const reader = new FileReader();
        reader.readAsDataURL(updatedFormData.impactReport);
        base64File = await new Promise((resolve) => {
          reader.onload = () => {
            resolve(reader.result.split(",")[1]);
          };
        });
      }

      var formDataWithType = {
        ...updatedFormData,
        file: base64File || "",
        fileName: updatedFormData.impactReport.name || "",
        mimeType: updatedFormData.impactReport.type || "",
        type: "NGO",
        orgLaptopRequire: updatedFormData.orgLaptopRequire,
      };

      try {
        const response = await fetch(
          `${process.env.REACT_APP_NgoInformationApi}?type=NGO`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            mode: "no-cors",
            body: JSON.stringify(formDataWithType),
          }
        );

        setLoading(false);
        setSnackbarMessage("Thank you for submitting! We will contact you soon.");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);

        // Delay navigation to show the success message
        setTimeout(() => {
          navigate('/'); // Navigate to home page after 2 seconds
        }, 2000);

      } catch (error) {
        console.error("Error submitting form:", error);
        setSnackbarMessage("Error submitting form. Please try again.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ maxWidth: 600, margin: "auto", padding: 5 }}>
      <Typography variant="h5" gutterBottom>
        NGO Information Form
      </Typography>
      {formFields?.length == 0 ? (
        <CircularProgress />
      ) : (
        <form onSubmit={handleSubmit}>
          {formFields?.map((field) => {
            if (field?.type === "text") {
              return (
                <div>
                <Typography mt={10} component="span" fontWeight="bold">
                      {field.question}
                    </Typography>
                <TextField
                  key={field.name}
                  fullWidth
                  // label={
                  //   <Typography component="span" fontWeight="bold">
                  //     {field.question}
                  //   </Typography>
                  // }
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                  error={!!errors[field.name]}
                  helperText={errors[field.name]}
                  InputProps={
                    field.name === "email" && checkingEmail
                      ? {
                          endAdornment: <CircularProgress size={20} />,
                        }
                      : field.name === "contactNumber" && checkingContact
                      ? {
                          endAdornment: <CircularProgress size={20} />,
                        }
                      : undefined
                  }
                />
              </div>
              );
            } else if (field?.type === "radio") {
              return (
                <FormControl
                  key={field.name}
                  fullWidth
                  margin="normal"
                  required
                  error={!!errors[field.name]}
                >
                  <FormLabel>
                    <Typography component="span" fontWeight="bold">
                      {field.question}
                    </Typography>
                  </FormLabel>
                  <RadioGroup
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                  >
                    {field?.options?.map((option) => (
                      <FormControlLabel
                        key={option}
                        value={option}
                        control={<Radio />}
                        label={option}
                      />
                    ))}
                  </RadioGroup>
                  {errors[field.name] && (
                    <Typography color="error">{errors[field.name]}</Typography>
                  )}
                </FormControl>
              );
            } else if (field.type === "radioWithOther") {
              return (
                <RadioWithOther
                  key={field.name}
                  label={
                    <Typography component="span" fontWeight="bold">
                      {field.question}
                    </Typography>
                  }
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleInputChange}
                  options={field.options}
                  error={errors[field.name]}
                />
              );
            } else if (field.type === "fileUpload") {
              return (
                <>
                  <Typography variant="body1" gutterBottom fontWeight="bold">
                    Please share any impact reports or documentation related to
                    your previous projects.
                  </Typography>
                  {errors.impactReport && (
                    <Typography color="error" variant="body2">
                      {errors.impactReport}
                    </Typography>
                  )}
                  <Button 
                    variant="contained" 
                    component="label" 
                    color={errors.impactReport ? "error" : "primary"}
                  >
                    Upload File
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xlsx"
                      hidden
                      onChange={handleFileUpload}
                      required
                    />
                  </Button>
                  {fileName && (
                    <Typography variant="subtitle1" gutterBottom>
                      Selected file: {fileName}
                    </Typography>
                  )}
                  
                  <br />
                </>
              );
            } else if (field?.type === "checkbox") {
              return (
                <FormControl key={field.name} fullWidth margin="normal">
                  <FormLabel>
                    <Typography component="span" fontWeight="bold">
                      {field.question}
                    </Typography>
                  </FormLabel>
                  {field?.options?.map((option) => (
                    <FormControlLabel
                      key={option}
                      control={
                        <Checkbox
                          checked={formData[field.name].includes(option)}
                          onChange={(e) => handleCheckboxChange(e, field.name)}
                          value={option}
                        />
                      }
                      label={option}
                    />
                  ))}
                  {formData[field.name].includes("Other") && (
                    <TextField
                      name={`${field.name}Other`}
                      label="Please specify"
                      value={formData[`${field.name}Other`]}
                      onChange={handleInputChange}
                      fullWidth
                      margin="normal"
                      error={!!errors[`${field.name}Other`]}
                    />
                  )}
                </FormControl>
              );
            }
            return null;
          })}

          {formFields.length > 0 && (
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!isFormValid || loading || emailExists || contactExists}
              sx={{ marginTop: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : "Submit"}
            </Button>
          )}
        </form>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default RegistrationForm;
