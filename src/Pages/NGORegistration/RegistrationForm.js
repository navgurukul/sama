import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { useParams } from 'react-router-dom';

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
      <Typography component="span" fontWeight="bold">{label}</Typography>
        {/* {label} */}
        </FormLabel>
      <RadioGroup
        name={name}
        value={options.includes(value) ? value : 'Other'}
        onChange={handleRadioChange}
      >
        {options.map((option) => (
          <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
        ))}
        <FormControlLabel value="Other" control={<Radio />} label="Other" />
      </RadioGroup>
      {value === 'Other' || !options.includes(value) ? (
        <TextField
          name={name}
          label="Please specify"
          value={value === 'Other' ? '' : value}
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

  const [formFields, setFormFields] = useState([]);  // Store fetched form fields here
  const [formData, setFormData] = useState({
    
    organizationName: '',
    registrationNumber: '',
    primaryContactName: '',
    contactNumber: '',
    email: '',
    operatingState: '',
    location: [],
    yearsOperating: '',
    focusArea: '',
    worksWithWomen: '',
    infrastructure: '',
    beneficiarySelection: [],
    beneficiarySelectionOther: '',
    numberOfBeneficiaries: '',
    ageGroup: '',
    primaryUse: [],
    primaryUseOther: '',
    expectedOutcome: '',
    laptopTracking: '',
    jobsCreated: '',
    previousProjects: '',
    sufficientStaff: '',
    impactReport: "",
    
  });

  const [errors, setErrors] = useState({});
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [companies, setCompanies] = useState([]);
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbxm2qA0DvzVUNtbwe4tAqd40hO7NpNU-GNXyBq3gHz_q45QIo9iveYOkV0XqyfZw9V7/exec?type=donorID'); // Replace with your API URL
        const data = await response.json();
        setCompanies(data); // Assuming data is an array of company names
      } catch (error) {
        console.error('Error fetching company names:', error);
      }
    }
    fetchCompanies();
  }, []);
  const donorIDs = companies.find((company) => company.Donner === donorId)?.["Donor id"];
  
  // Fetch form fields from API
  useEffect(() => {
    const fetchFormFields = async () => {
      try {
        // Construct the API URL based on the presence of donorId
        const baseURL = 'https://script.google.com/macros/s/AKfycbxm2qA0DvzVUNtbwe4tAqd40hO7NpNU-GNXyBq3gHz_q45QIo9iveYOkV0XqyfZw9V7/exec?type=donorQuestion';
        const apiUrl = donorIDs ? `${baseURL}&donorId=${donorIDs}` : baseURL;
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        setFormFields(data);  // Assuming the API response has a 'formFields' key
      } catch (error) {
        console.error('Error fetching form fields:', error);
      }
    };
  
    fetchFormFields();
  }, [donorIDs]);
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
    setFileName(file ? file.name : '');
  };

  const validate = () => {
    const newErrors = {};

    // General required field validation
    // Object.keys(formData).forEach((key) => {
    //   if (!formData[key] && key !== 'impactReport' && key !== 'beneficiarySelectionOther' && key !== 'primaryUseOther') {
    //     newErrors[key] = 'This field is required';
    //   }
    // });

    // Specific validation for impact report file upload
    const fileUploadField = formFields.find(field => field.type === 'fileUpload');
    if (fileUploadField && !formData.impactReport) {
      newErrors.impactReport = 'Impact report file is required';
    }

    // Specific validation for contact number
    if (formData.contactNumber && !/^\d{10}$/.test(formData.contactNumber)) {
      newErrors.contactNumber = 'Contact number must be 10 digits (number)';
    }

    // Specific validation for email
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  
  useEffect(() => {
    setIsFormValid(validate());
  }, [formData, formFields]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setLoading(true);
      const updatedFormData = { ...formData };
      if (updatedFormData.beneficiarySelectionOther) {
        updatedFormData.beneficiarySelection = updatedFormData.beneficiarySelection.map(item =>
          item === 'Other' ? updatedFormData.beneficiarySelectionOther : item
        );
      }
      if (updatedFormData.primaryUseOther) {
        updatedFormData.primaryUse = updatedFormData.primaryUse.map(item =>
          item === 'Other' ? updatedFormData.primaryUseOther : item
        );
      }

      // Remove beneficiarySelectionOther and primaryUseOther from the updated form data
      delete updatedFormData.beneficiarySelectionOther;
      delete updatedFormData.primaryUseOther;

      let base64File = '';
      if (updatedFormData.impactReport) {
        // If a file is provided, convert it to base64
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
        const response = await fetch('https://script.google.com/macros/s/AKfycby4zd74Zl-sQYN5b8940ZgOVQEcb5Jam-SNayOzevsrtQmH4nhHFLu936Nwr0-uZVZh/exec', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          mode: "no-cors",
          body: JSON.stringify(formDataWithType),
        });
        // Log the response for debugging
        
        setLoading(false);
        setSnackbarMessage('Form submitted successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
          setFormData({
            organizationName: '',
            registrationNumber: '',
            primaryContactName: '',
            contactNumber: '',
            email: '',
            operatingState: '',
            location: [],
            yearsOperating: '',
            focusArea: '',
            worksWithWomen: '',
            infrastructure: '',
            beneficiarySelection: [],
            beneficiarySelectionOther: '',
            numberOfBeneficiaries: '',
            ageGroup: '',
            primaryUse: [],
            primaryUseOther: '',
            expectedOutcome: '',
            laptopTracking: '',
            jobsCreated: '',
            previousProjects: '',
            sufficientStaff: '',
            impactReport: '',
          });
          setFileName('');
          setErrors({});
        } catch (error) {
          console.error('Error submitting form:', error);
        }
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', padding: 3 }}>
      <Typography variant="h4" gutterBottom>NGO Information Form</Typography>
      {formFields?.length == 0 ? (
        <CircularProgress />
      ) : (
        
        <form onSubmit={handleSubmit}>
          {formFields?.map((field) => {
           
            if (field?.type === 'text') {
              return (
                <TextField
                  key={field.name}
                  fullWidth
                  label={<Typography component="span" fontWeight="bold">{field.question}</Typography>}
                  // label={field.question}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                  error={!!errors[field.name]}
                  helperText={errors[field.name]}
                />
              );
            } 
            else if (field?.type === 'radio') {
              return (
                <FormControl key={field.name}
                 fullWidth margin="normal" required error={!!errors[field.name]}>
                  <FormLabel>
                    <Typography component="span" fontWeight="bold">{field.question}</Typography>
          
                    {/* {field?.question} */}
                    </FormLabel>
                  <RadioGroup
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                  >
                    {field?.options?.map((option) => (
                      <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
                    ))}
                  </RadioGroup>
                  {errors[field.name] && <Typography color="error">{errors[field.name]}</Typography>}
                </FormControl>
              );
            } 
            else if (field.type === 'radioWithOther') {
              return (
                <RadioWithOther
                  key={field.name}
                  label={<Typography component="span" fontWeight="bold">{field.question}</Typography>}
                  // label={field.question}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleInputChange}
                  options={field.options}
                  error={errors[field.name]}
                />
              );
            }
            else if (field.type === 'fileUpload') {
              return (
                <>
                {/* Impact Reports Upload here */}
                <Typography variant="body1" gutterBottom fontWeight="bold" >
                  {/* <strong> */}
                    Please share any impact reports or documentation related to your previous projects.
                    {/* </strong> */}
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
                {fileName && 
                (
                  <Typography variant="subtitle1" gutterBottom>
                    Selected file: {fileName}
                  </Typography>
                ) 
               }
                  <br></br>
                </>
              );
            }
            else if (field?.type === 'checkbox') {
              return (
                <FormControl key={field.name} fullWidth margin="normal">
                  <FormLabel>
                  <Typography component="span" fontWeight="bold">{field.question}</Typography>
                    {/* {field.question} */}
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
                  {formData[field.name].includes('Other') && (
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

        { (formFields.length > 0) && 
        <Button type="submit" variant="contained" color="primary" disabled={!isFormValid || loading} sx={{ marginTop: 2 }}>
        {loading ? <CircularProgress size={24} /> : 'Submit'}
        </Button> 
         }
        </form>
      )}

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default RegistrationForm;

                   
