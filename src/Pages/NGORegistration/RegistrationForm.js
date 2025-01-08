import React, { useState, useEffect } from "react";
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
  const { donorId } = useParams();
  const [formFields, setFormFields] = useState([]);
  const [emailExists, setEmailExists] = useState(false);
  // const [contactExists, setContactExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

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
  });

  const [errors, setErrors] = useState({});
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [companies, setCompanies] = useState([]);
  const [isFormValid, setIsFormValid] = useState(false);

  // Updated email verification function for new API response structure
  const verifyEmail = async (email) => {
    if (!email) return;

    setCheckingEmail(true);
    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbxm2qA0DvzVUNtbwe4tAqd40hO7NpNU-GNXyBq3gHz_q45QIo9iveYOkV0XqyfZw9V7/exec?type=registration"
      );
      const responseData = await response.json();

      // Check if response has the expected structure
      if (
        responseData.status === "success" &&
        Array.isArray(responseData.data)
      ) {
        // Check if email exists in the data array
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
        
      } else {
        console.error("Unexpected API response structure:", responseData);
      }
    } catch (error) {
      console.error("Error checking email:", error);
    } finally {
      setCheckingEmail(false);
    }
  };

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const response = await fetch(
          "https://script.google.com/macros/s/AKfycbxm2qA0DvzVUNtbwe4tAqd40hO7NpNU-GNXyBq3gHz_q45QIo9iveYOkV0XqyfZw9V7/exec?type=donorID"
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
          "https://script.google.com/macros/s/AKfycbxm2qA0DvzVUNtbwe4tAqd40hO7NpNU-GNXyBq3gHz_q45QIo9iveYOkV0XqyfZw9V7/exec?type=donorQuestion";
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

    // Check email when email field changes
    if (name === "email") {
      verifyEmail(value);
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
    setFormData({ ...formData, impactReport: file });
    setFileName(file ? file.name : "");
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
    console.log("Form Data:", formData);
    console.log("Validation Errors:", newErrors);

    formfields.forEach((field) => {
      const value = formData[field.name];

      // File size validation
      if (field.name === "impactReport" && value?.size > 2 * 1024 * 1024) {
        newErrors[field.name] = "Impact report file size must not exceed 2MB";
      }

      // Contact number validation
      if (field.name === "contactNumber" && value) {
        const contactNumberPattern = /^\d{10}$/;
        if (!contactNumberPattern.test(value)) {
          newErrors[field.name] =
            "Contact number must be a valid 10-digit number";
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
          newErrors[field.name] = `${
            field.label || field.name
          } should contain only letters and spaces`;
        }
      }

      // Primary contact name validation
      if (field.name === "primaryContactName" && value) {
        const textPattern = /^[A-Za-z\s]+$/;
        if (!textPattern.test(value)) {
          newErrors[field.name] = `${
            field.label || field.name
          } should contain only letters and spaces`;
        }
      }

      // Registration number validation
      // if (field.name === "registrationNumber" && value) {
      //   const numberPattern = /^\d+$/;
      //   if (!numberPattern.test(value)) {
      //     newErrors[field.name] = `${
      //       field.label || field.name
      //     } should contain only digits`;
      //   }
      // }
    });

    // Add email existence validation
    if (emailExists) {
      newErrors.email = "This email is already registered";
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
      };

      try {
        const response = await fetch(
          "https://script.google.com/macros/s/AKfycbwnIYg5R0CIPmTNfy-XDJJoVOwEH34LlDlomCD3sCeMA4mnzt-vLqITkXuaj_FzuO75/exec?type=NGO",
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
        setSnackbarMessage("Form submitted successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        setFormData({
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
        });
        setFileName("");
        setErrors({});
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
    <Box sx={{ maxWidth: 600, margin: "auto", padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        NGO Information Form
      </Typography>
      {formFields?.length == 0 ? (
        <CircularProgress />
      ) : (
        <form onSubmit={handleSubmit}>
          {formFields?.map((field) => {
            if (field?.type === "text") {
              return (
                <TextField
                  key={field.name}
                  fullWidth
                  label={
                    <Typography component="span" fontWeight="bold">
                      {field.question}
                    </Typography>
                  }
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
                      : undefined
                  }
                />
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
                  <Button variant="contained" component="label">
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
              disabled={!isFormValid || loading || emailExists}
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
