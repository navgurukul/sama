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
  MenuItem,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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

  // New states for request type functionality
  const [showRequestTypeModal, setShowRequestTypeModal] = useState(true);
  const [requestType, setRequestType] = useState("");
  const [existingNgos, setExistingNgos] = useState([]);
  const [selectedExistingNgo, setSelectedExistingNgo] = useState("");
  const [loadingNgos, setLoadingNgos] = useState(false);

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

  // Fetch existing NGOs for dropdown
  const fetchExistingNgos = async () => {
    setLoadingNgos(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_NgoInformationApi}?type=registration`
      );
      const data = await response.json();
      if (data.status === "success" && Array.isArray(data.data)) {
        // Get unique organization names
        setExistingNgos(data.data);
      }
    } catch (error) {
      console.error("Error fetching NGOs:", error);
    } finally {
      setLoadingNgos(false);
    }
  };


  useEffect(() => {
    fetchExistingNgos();
  }, []);

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

    if (!showRequestTypeModal) {
      fetchFormFields();
    }
  }, [donorIDs, showRequestTypeModal]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });


    if (name === "email") {
      verifyEmail(value);
    }

    if (name === "contactNumber") {
      verifyContactNumber(value);
    }

    // Validate organization name for new registration
    if (name === "organizationName" && requestType === "first-time") {
      validateOrganizationName(value);
    }
  };

  const validateOrganizationName = (orgName) => {
    if (
      orgName &&
      requestType === "first-time" &&
      existingNgos.some(
        (org) => org.organizationName.trim().toLowerCase() === orgName.trim().toLowerCase()
      )
    ) {
      setErrors(prev => ({
        ...prev,
        organizationName: "This organization already exists. Please select 'Additional Request' if this is your organization."
      }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.organizationName;
        return newErrors;
      });
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
        const newErrors = { ...prev };
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


    const activeFields =
      requestType === "subsequent"
        ? ["numberOfBeneficiaries", "orgLaptopRequire"]
        : formfields.map((f) => f.name);

    activeFields.forEach((field) => {
      const value = formData[field];


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

      // Organization name validation - only for new registrations
      if (field.name === "organizationName" && value && requestType === "first-time") {
        // const textPattern = /^[A-Za-z\s]+$/;
        // if (!textPattern.test(value)) {
        //   newErrors[field.name] = "Organization name should contain only letters and spaces";
        // }

        // Check if organization already exists
        if (
          existingNgos.some(
            (org) => org.organizationName.trim().toLowerCase() === value.trim().toLowerCase()
          )
        ) {
          newErrors.organizationName =
            "This organization already exists. Please select 'Additional Request' if this is your organization.";
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
    if (!showRequestTypeModal) {
      setIsFormValid(validate());
    }
  }, [formData, formfields, showRequestTypeModal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const updatedFormData = { ...formData };

    if (updatedFormData.beneficiarySelectionOther) {
      updatedFormData.beneficiarySelection = updatedFormData.beneficiarySelection.map(
        item => item === "Other" ? updatedFormData.beneficiarySelectionOther : item
      );
    }
    if (updatedFormData.primaryUseOther) {
      updatedFormData.primaryUse = updatedFormData.primaryUse.map(
        item => item === "Other" ? updatedFormData.primaryUseOther : item
      );
    }
    delete updatedFormData.beneficiarySelectionOther;
    delete updatedFormData.primaryUseOther;

    // Convert file to base64
    let base64File = "";
    if (updatedFormData.impactReport) {
      const reader = new FileReader();
      reader.readAsDataURL(updatedFormData.impactReport);
      base64File = await new Promise(resolve => {
        reader.onload = () => resolve(reader.result.split(",")[1]);
      });
    }

    // Prepare payload for backend
    let payload = {
      ...updatedFormData,
      file: base64File || "",
      fileName: updatedFormData.impactReport?.name || "",
      mimeType: updatedFormData.impactReport?.type || "",
      type: "NGO",
      orgLaptopRequire: updatedFormData.orgLaptopRequire,
      requestType: requestType,
      organizationName: updatedFormData.organizationName.trim(),
    };

    if (requestType === "subsequent" && selectedExistingNgo) {
      payload.organizationName = selectedExistingNgo.trim();

      const existingOrg = existingNgos.find(
        org => org.organizationName.trim() === selectedExistingNgo.trim()
      );
      if (existingOrg) {
        payload.organizationId = existingOrg.id;
      }
    }



    try {
      const response = await fetch(
        `${process.env.REACT_APP_NgoInformationApi}?type=NGO`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "no-cors",
          body: JSON.stringify(payload),
        }
      );


      setSnackbarMessage("Form submitted successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      setTimeout(async () => {
        try {
          const NgoId = JSON.parse(localStorage.getItem("_AuthSama_"));
          const storedUserId = NgoId[0].NgoId;

          const res = await fetch(
            `${process.env.REACT_APP_NgoInformationApi}?type=registration`
          );
          const result = await res.json();

          const finduser = result.data.find(
            (item) => item.Id === storedUserId
          );

          if (finduser["Ngo Type"] === "1 to one") {
            navigate("/beneficiarydata");
          } else {
            navigate("/preliminary");
          }
        } catch (err) {
          console.error("Error fetching NGO type:", err);
          navigate("/"); // fallback
        }
      }, 2000);
    } catch (err) {
      console.error(err);
      setSnackbarMessage("Error submitting form");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);


    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const filteredFormFields = requestType === "subsequent"
    ? formFields.filter(
      (field) =>
        field.name === "numberOfBeneficiaries" ||
        field.name === "orgLaptopRequire"
    )
    : formFields;

  const RequestTypeModal = () => (
    <Dialog open={showRequestTypeModal} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="h2">
          Select Registration Type
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" paragraph>
          Please select whether this is your first time registering or an additional request:
        </Typography>


        <FormControl component="fieldset" sx={{ width: '100%' }}>
          <RadioGroup
            value={requestType}
            onChange={(e) => setRequestType(e.target.value)}
          >
            <FormControlLabel
              value="first-time"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1" fontWeight="bold">
                    First Time Registration
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Select this if your organization has never registered before
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="subsequent"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1" fontWeight="bold">
                    Additional Request
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Select this if your organization is already registered
                  </Typography>
                </Box>
              }
            />
          </RadioGroup>
        </FormControl>

        {requestType === "subsequent" && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom fontWeight="bold">
              Select your existing organization:
            </Typography>
            {loadingNgos ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <FormControl fullWidth sx={{ mt: 1 }}>
                <Select
                  value={selectedExistingNgo}
                  onChange={(e) => setSelectedExistingNgo(e.target.value)}
                  displayEmpty
                  required
                >
                  <MenuItem value="" disabled>Select your organization</MenuItem>
                  {existingNgos.map((org) => (
                    <MenuItem key={org.id} value={org.organizationName}>
                      {org.organizationName}
                    </MenuItem>
                  ))}
                </Select>
                {existingNgos.length === 0 && (
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    No existing organizations found. Please choose "First Time Registration".
                  </Typography>
                )}
              </FormControl>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => navigate('/')}>Cancel</Button>
        <Button
          onClick={() => {
            if (requestType === "first-time") {
              setShowRequestTypeModal(false);
            } else if (requestType === "subsequent" && selectedExistingNgo) {
              setFormData(prev => ({
                ...prev,
                organizationName: selectedExistingNgo
              }));
              setShowRequestTypeModal(false);
            }
          }}

          disabled={!requestType || (requestType === "subsequent" && !selectedExistingNgo)}
          variant="contained"
        >
          Continue
        </Button>

      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ maxWidth: 600, margin: "auto", padding: 5 }}>
      <RequestTypeModal />


      {!showRequestTypeModal && (
        <>
          <Typography variant="h5" gutterBottom>
            NGO Information Form
          </Typography>

          {/* Show request type info */}
          <Box sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2">
              Request Type: <strong>{requestType === "first-time" ? "New Registration" : "Additional Request"}</strong>
              {requestType === "subsequent" && (
                <> - Organization: <strong>{formData.organizationName}</strong></>
              )}
            </Typography>
          </Box>

          {formFields?.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              {filteredFormFields?.map((field) => {
                if (field?.type === "text") {
                  // Make organization name read-only for existing NGOs
                  if (field.name === "organizationName" && requestType === "subsequent") {
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
                        margin="normal"
                        required
                        InputProps={{
                          readOnly: true,
                        }}
                        helperText="Organization name is pre-filled for additional requests"
                      />
                    );
                  }

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
                          : field.name === "contactNumber" && checkingContact
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
        </>
      )}
    </Box>
  );
}

export default RegistrationForm;