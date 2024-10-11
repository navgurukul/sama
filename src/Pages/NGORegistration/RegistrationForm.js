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

const RadioWithOther = ({ label, name, value, onChange, options, error }) => {
  const handleRadioChange = (e) => {
    const { value } = e.target;
    onChange(e);
  };

  console.log(label);
  
  const handleOtherChange = (e) => {
    const { value } = e.target;
    onChange({ target: { name, value } });
  };

  return (
    <FormControl fullWidth margin="normal" required error={!!error}>
      <FormLabel>{label}</FormLabel>
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

// const formFields = [
  // { label: "What is the name of the organization?", name: "organizationName", type: "text" },
  // { label: "What is the NGO's official registration number?", name: "registrationNumber", type: "text" },
  // { label: "Please provide the full name of the primary contact person for your organization.", name: "primaryContactName", type: "text" },
  // { label: "Please provide the mobile number of the concerned person", name: "contactNumber", type: "text" },
  // { label: "Please provide an email address of your organization.", name: "email", type: "text" },
  // { label: "In which state is your organization currently operating?", name: "operatingState", type: "text" },
  // { label: "What is your organization's location of operation?", name: "location", type: "radio", options: ["Urban", "Rural", "Semi-Urban"] },
  // { label: "How many years has your organization been working?", name: "yearsOperating", type: "radio", options: ["Less than 2 years", "2 - 5 years", "5 - 10 years", "10+ years"] },
  // { label: "What is the primary focus area of your organization?", name: "focusArea", type: "radioWithOther", options: ["Education", "Employment/Job placement", "Digital literacy", "Women empowerment"] },
  // { label: "Does your NGO primarily work with underprivileged women?", name: "worksWithWomen", type: "radioWithOther", options: ["Yes", "No", "Partially (Some projects focus on this)"] },
  // { label: "What infrastructure is available for laptop use?", name: "infrastructure", type: "radioWithOther", options: ["Dedicated computer lab", "Beneficiaries will use laptops at home", "Shared space with Wi-Fi", "No specific infrastructure in place"] },
  // { label: "How does your NGO identify beneficiaries for laptop distribution?", name: "beneficiarySelection", type: "checkbox", options: ["Economic background", "Educational background", "Employment status", "Other"] },
  // { label: "How many beneficiaries does your NGO plan to serve with the laptops?", name: "numberOfBeneficiaries", type: "text" },
  // { label: "What is the age group of the beneficiaries?", name: "ageGroup", type: "radioWithOther", options: ["18-22 years (fresh graduates/college students)", "22-30 years (seeking employment)", "30+ years (returning to education/employment)"] },
  // { label: "What will be the primary use of the laptops provided to your beneficiaries?", name: "primaryUse", type: "checkbox", options: ["Education", "Employment", "Entrepreneurship", "Other"] },
  // { label: "What are the expected outcomes from the use of the laptops?", name: "expectedOutcome", type: "radioWithOther", options: ["Securing full-time employment", "Securing part-time employment or freelance work", "Completing education or certifications", "Starting a business", "No specific outcome"] },
  // { label: "How do you plan to track the usage of the laptops?", name: "laptopTracking", type: "radioWithOther", options: ["Regular beneficiary feedback", "Progress reports from beneficiaries", "Monitoring online course completion", "Employment verification"] },
  // { label: "How many jobs do you anticipate creating in the next year through the use of the laptops?", name: "jobsCreated", type: "radio", options: ["1 - 10", "10 - 20", "20 - 30", "30 - 50", "50+"] },
  // { label: "Has your NGO previously undertaken similar projects?", name: "previousProjects", type: "radioWithOther", options: ["Yes, multiple similar projects", "Yes, but on a smaller scale", "No, this is our first project of this kind"] },
  // { label: "Does your NGO have sufficient staff to support beneficiaries in utilizing the laptops?", name: "sufficientStaff", type: "radioWithOther", options: ["Yes, dedicated staff for digital literacy/employment", "Yes, but shared staff with other projects", "No, we will need external support"] },
  // { label: "file share", name: "impactReport", type: "fileUpload" },
// ];

function RegistrationForm() {
  const [formData, setFormData] = useState({
    organizationName: '',
    registrationNumber: '',
    primaryContactName: '',
    contactNumber: '',
    email: '',
    operatingState: '',
    location: '',
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
    impactReport: ''
  });

  const [errors, setErrors] = useState({});
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [formFields, setFormFields] = useState([]);

  useEffect(() => {
    setLoading(true);
    const fetchFormFields = async () => {
      try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbxm2qA0DvzVUNtbwe4tAqd40hO7NpNU-GNXyBq3gHz_q45QIo9iveYOkV0XqyfZw9V7/exec?donorId=4');  // Replace with your API endpoint
        const data = await response.json();
        
        setFormFields(data);  // Assuming the API response has a 'formFields' key
        setLoading(false);
      } catch (error) {
        console.error('Error fetching form fields:', error);
      }
    };
    fetchFormFields();
  }, []);
  
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

      console.log(updatedFormData.impactReport);
      // Remove beneficiarySelectionOther and primaryUseOther from the updated form data
      delete updatedFormData.beneficiarySelectionOther;
      delete updatedFormData.primaryUseOther;

      let base64File = '';
      if (updatedFormData.impactReport) {
        // If a file is provided, convert it to base64
        console.log("a");
        
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
          const response = await fetch('https://script.google.com/macros/s/AKfycbxm2qA0DvzVUNtbwe4tAqd40hO7NpNU-GNXyBq3gHz_q45QIo9iveYOkV0XqyfZw9V7/exec', {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            mode: "no-cors",
            body: JSON.stringify(formDataWithType),
          });
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
            location: '',
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
          console.log("c");
          
          setErrors({});
        } catch (error) {
          console.error('Error submitting form:', error);
        }
      }
    // }
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
      {loading ? <CircularProgress size={24} align="center" /> :
      <form 
      onSubmit={handleSubmit}
      >
        {formFields.map((field) => {
          if (field.type === 'text') {
            return (
              <TextField
                key={field.name}
                fullWidth
                label={field.question}
                name={field.name}
                value={formData[field.name]}
                onChange={handleInputChange}
                margin="normal"
                required
                error={!!errors[field.name]}
                helperText={errors[field.name]}
              />
            );
          } else if (field.type === 'radio') {
            return (
              <FormControl key={field.name} fullWidth margin="normal" required error={!!errors[field.name]}>
                <FormLabel>{field.question}</FormLabel>
                <RadioGroup
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleInputChange}
                >
                  {field.options.map((option) => (
                    <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
                  ))}
                </RadioGroup>
                {errors[field.name] && <Typography color="error">{errors[field.name]}</Typography>}
              </FormControl>
            );
          } else if (field.type === 'radioWithOther') {
            return (
              <RadioWithOther
                key={field.name}
                label={field.question}
                name={field.name}
                value={formData[field.name]}
                onChange={handleInputChange}
                options={field.options}
                error={errors[field.name]}
              />
            );
          } else if (field.type === 'fileUpload') {
            return (
              <>
              {/* Impact Reports Upload */}
              <Typography variant="body1" gutterBottom>
                Please share any impact reports or documentation related to your previous projects.
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
              {fileName ? (
                <Typography variant="subtitle1" gutterBottom>
                  Selected file: {fileName}
                </Typography>
              ) :
              <Typography variant="subtitle1" gutterBottom color="red">
                  No File Selected
                </Typography>}
              </>
            );
          }
          else if (field.type === 'checkbox') {
            return (
              <FormControl key={field.name} fullWidth margin="normal" required error={!!errors[field.name]}>
                <FormLabel>{field.question}</FormLabel>
                {field.options.map((option) => (
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
                    // helperText={errors[`${field.name}Other`]}
                  />
                )}
              </FormControl>
            );
          }
          return null;
        }
        )}
        { (formFields.length > 0) && 
        <Button type="submit" variant="contained" color="primary" disabled={loading} sx={{ marginTop: 2 }}>
        {loading ? <CircularProgress size={24} /> : 'Submit'}
        </Button> 
         }

        
      </form>
      }
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default RegistrationForm;
  