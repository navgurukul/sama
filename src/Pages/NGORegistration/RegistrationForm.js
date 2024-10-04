import React, { useState } from 'react';
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
    impactReport: null
  });

  const [errors, setErrors] = useState({});
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

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
    Object.keys(formData).forEach((key) => {
      if (!formData[key] && key !== 'impactReport' && key !== 'beneficiarySelectionOther' && key !== 'primaryUseOther') {
        newErrors[key] = 'This field is required';
      }
    });

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

    // Remove beneficiarySelectionOther and primaryUseOther from the updated form data
    delete updatedFormData.beneficiarySelectionOther;
    delete updatedFormData.primaryUseOther;

    const reader = new FileReader();
    reader.readAsDataURL(updatedFormData.impactReport);
    reader.onload = async () => {
    const base64File = reader.result.split(",")[1];        
      
    var formDataWithType = {
      ...updatedFormData,
      file: base64File,
      fileName: updatedFormData.impactReport.name,
      mimeType: updatedFormData.impactReport.type,
      type: "NGO",
    };
    

    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbxm2qA0DvzVUNtbwe4tAqd40hO7NpNU-GNXyBq3gHz_q45QIo9iveYOkV0XqyfZw9V7/exec', 
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
          ageGroup: '',
          primaryUse: [],
          primaryUseOther: '',
          expectedOutcome: '',
          laptopTracking: '',
          jobsCreated: '',
          previousProjects: '',
          sufficientStaff: '',
          impactReport: null
        });
        setFileName('');
        setErrors({});
    } catch (error) {
      console.error('Error submitting form:', error);
    }
    
    }
  };
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
      <form onSubmit={handleSubmit}>
        {/* Organization Name */}
        <TextField
          fullWidth
          label="What is the name of the organization?"
          name="organizationName"
          value={formData.organizationName}
          onChange={handleInputChange}
          margin="normal"
          required
          error={!!errors.organizationName}
          helperText={errors.organizationName}
        />

        {/* Registration Number */}
        <TextField
          fullWidth
          label="What is the NGO's official registration number?"
          name="registrationNumber"
          value={formData.registrationNumber}
          onChange={handleInputChange}
          margin="normal"
          required
          error={!!errors.registrationNumber}
          helperText={errors.registrationNumber}
        />

        {/* Primary Contact Person */}
        <TextField
          fullWidth
          label="Please provide the full name of the primary contact person for your organization."
          name="primaryContactName"
          value={formData.primaryContactName}
          onChange={handleInputChange}
          margin="normal"
          required
          error={!!errors.primaryContactName}
          helperText={errors.primaryContactName}
        />

        {/* Contact Number */}
        <TextField
          fullWidth
          label="Please provide the mobile number of the concerned person"
          name="contactNumber"
          value={formData.contactNumber}
          onChange={handleInputChange}
          margin="normal"
          required
          error={!!errors.contactNumber}
          helperText={errors.contactNumber}
        />

        {/* Email */}
        <TextField
          fullWidth
          label="Please provide an email address of your organization."
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          margin="normal"
          required
          error={!!errors.email}
          helperText={errors.email}
        />

        {/* Operating State */}
        <TextField
          fullWidth
          label="In which state is your organization currently operating?"
          name="operatingState"
          value={formData.operatingState}
          onChange={handleInputChange}
          margin="normal"
          required
          error={!!errors.operatingState}
          helperText={errors.operatingState}
        />

        {/* Location */}
        <FormControl fullWidth margin="normal" required error={!!errors.location}>
          <FormLabel>What is your organization's location of operation?</FormLabel>
          <RadioGroup
            name="location"
            value={formData.location}
            onChange={handleInputChange}
          >
            <FormControlLabel value="Urban" control={<Radio />} label="Urban" />
            <FormControlLabel value="Rural" control={<Radio />} label="Rural" />
            <FormControlLabel value="Semi-Urban" control={<Radio />} label="Semi-Urban" />
          </RadioGroup>
          {errors.location && <Typography color="error">{errors.location}</Typography>}
        </FormControl>

        {/* Years of Operation */}
        <FormControl fullWidth margin="normal" required error={!!errors.yearsOperating}>
          <FormLabel>How many years has your organization been working?</FormLabel>
          <RadioGroup
            name="yearsOperating"
            value={formData.yearsOperating}
            onChange={handleInputChange}
          >
            <FormControlLabel value="Less than 2 years" control={<Radio />} label="Less than 2 years" />
            <FormControlLabel value="2 - 5 years" control={<Radio />} label="2 - 5 years" />
            <FormControlLabel value="5 - 10 years" control={<Radio />} label="5 - 10 years" />
            <FormControlLabel value="10+ years" control={<Radio />} label="10+ years" />
          </RadioGroup>
          {errors.yearsOperating && <Typography color="error">{errors.yearsOperating}</Typography>}
        </FormControl>

        {/* Focus Area */}
        <RadioWithOther
          label="What is the primary focus area of your organization?"
          name="focusArea"
          value={formData.focusArea}
          onChange={handleInputChange}
          options={["Education", "Employment/Job placement", "Digital literacy", "Women empowerment"]}
          error={errors.focusArea}
        />

        {/* Working with Women */}
        <RadioWithOther
          label="Does your NGO primarily work with underprivileged women?"
          name="worksWithWomen"
          value={formData.worksWithWomen}
          onChange={handleInputChange}
          options={["Yes", "No", "Partially (Some projects focus on this)"]}
          error={errors.worksWithWomen}
        />

        {/* Infrastructure */}
        <RadioWithOther
          label="What infrastructure is available for laptop use?"
          name="infrastructure"
          value={formData.infrastructure}
          onChange={handleInputChange}
          options={["Dedicated computer lab", "Beneficiaries will use laptops at home", "Shared space with Wi-Fi", "No specific infrastructure in place"]}
          error={errors.infrastructure}
        />

        {/* Identifying Beneficiaries */}
        <FormControl fullWidth margin="normal" required error={!!errors.beneficiarySelection}>
          <FormLabel>How does your NGO identify beneficiaries for laptop distribution?</FormLabel>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.beneficiarySelection.includes('Economic background')}
                onChange={(e) => handleCheckboxChange(e, 'beneficiarySelection')}
                value="Economic background"
              />
            }
            label="Based on economic background"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.beneficiarySelection.includes('Educational background')}
                onChange={(e) => handleCheckboxChange(e, 'beneficiarySelection')}
                value="Educational background"
              />
            }
            label="Based on educational background"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.beneficiarySelection.includes('Employment status')}
                onChange={(e) => handleCheckboxChange(e, 'beneficiarySelection')}
                value="Employment status"
              />
            }
            label="Based on employment status"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.beneficiarySelection.includes('Other')}
                onChange={(e) => handleCheckboxChange(e, 'beneficiarySelection')}
                value="Other"
              />
            }
            label="Other"
          />
          {formData.beneficiarySelection.includes('Other') && (
            <TextField
              name="beneficiarySelectionOther"
              label="Please specify"
              value={formData.beneficiarySelectionOther}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
              error={!!errors.beneficiarySelectionOther}
              helperText={errors.beneficiarySelectionOther}
            />
          )}
          {errors.beneficiarySelection && <Typography color="error">{errors.beneficiarySelection}</Typography>}
        </FormControl>

        {/* Number of Beneficiaries */}
        <TextField
          fullWidth
          label="How many beneficiaries does your NGO plan to serve with the laptops?"
          name="numberOfBeneficiaries"
          value={formData.numberOfBeneficiaries}
          onChange={handleInputChange}
          margin="normal"
          required
          error={!!errors.numberOfBeneficiaries}
          helperText={errors.numberOfBeneficiaries}
        />

        {/* Age Group */}
        <RadioWithOther
          label="What is the age group of the beneficiaries?"
          name="ageGroup"
          value={formData.ageGroup}
          onChange={handleInputChange}
          options={["18-22 years (fresh graduates/college students)", "22-30 years (seeking employment)", "30+ years (returning to education/employment)"]}
          error={errors.ageGroup}
        />

        {/* Primary Use */}
        <FormControl fullWidth margin="normal" required error={!!errors.primaryUse}>
          <FormLabel>What will be the primary use of the laptops provided to your beneficiaries?</FormLabel>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.primaryUse.includes('Education')}
                onChange={(e) => handleCheckboxChange(e, 'primaryUse')}
                value="Education"
              />
            }
            label="Education"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.primaryUse.includes('Employment')}
                onChange={(e) => handleCheckboxChange(e, 'primaryUse')}
                value="Employment"
              />
            }
            label="Employment"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.primaryUse.includes('Entrepreneurship')}
                onChange={(e) => handleCheckboxChange(e, 'primaryUse')}
                value="Entrepreneurship"
              />
            }
            label="Entrepreneurship"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.primaryUse.includes('Other')}
                onChange={(e) => handleCheckboxChange(e, 'primaryUse')}
                value="Other"
              />
            }
            label="Other"
          />
          {formData.primaryUse.includes('Other') && (
            <TextField
              name="primaryUseOther"
              label="Please specify"
              value={formData.primaryUseOther}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
              error={!!errors.primaryUseOther}
              helperText={errors.primaryUseOther}
            />
          )}
          {errors.primaryUse && <Typography color="error">{errors.primaryUse}</Typography>}
        </FormControl>

        {/* Expected Outcomes */}
        <RadioWithOther
          label="What are the expected outcomes from the use of the laptops?"
          name="expectedOutcome"
          value={formData.expectedOutcome}
          onChange={handleInputChange}
          options={["Securing full-time employment", "Securing part-time employment or freelance work", "Completing education or certifications", "Starting a business", "No specific outcome"]}
          error={errors.expectedOutcome}
        />

        {/* Laptop Tracking */}
        <RadioWithOther
          label="How do you plan to track the usage of the laptops?"
          name="laptopTracking"
          value={formData.laptopTracking}
          onChange={handleInputChange}
          options={["Regular beneficiary feedback", "Progress reports from beneficiaries", "Monitoring online course completion", "Employment verification"]}
          error={errors.laptopTracking}
        />

        {/* Jobs Created */}
        <FormControl fullWidth margin="normal" required error={!!errors.jobsCreated}>
          <FormLabel>How many jobs do you anticipate creating in the next year through the use of the laptops?</FormLabel>
          <RadioGroup
            name="jobsCreated"
            value={formData.jobsCreated}
            onChange={handleInputChange}
          >
            <FormControlLabel value="1 - 10" control={<Radio />} label="1 - 10" />
            <FormControlLabel value="10 - 20" control={<Radio />} label="10 - 20" />
            <FormControlLabel value="20 - 30" control={<Radio />} label="20 - 30" />
            <FormControlLabel value="30 - 50" control={<Radio />} label="30 - 50" />
            <FormControlLabel value="50+" control={<Radio />} label="50+" />
          </RadioGroup>
          {errors.jobsCreated && <Typography color="error">{errors.jobsCreated}</Typography>}
        </FormControl>

        {/* Previous Projects */}
        <RadioWithOther
          label="Has your NGO previously undertaken similar projects?"
          name="previousProjects"
          value={formData.previousProjects}
          onChange={handleInputChange}
          options={["Yes, multiple similar projects", "Yes, but on a smaller scale", "No, this is our first project of this kind"]}
          error={errors.previousProjects}
        />

        {/* Sufficient Staff */}
        <RadioWithOther
          label="Does your NGO have sufficient staff to support beneficiaries in utilizing the laptops?"
          name="sufficientStaff"
          value={formData.sufficientStaff}
          onChange={handleInputChange}
          options={["Yes, dedicated staff for digital literacy/employment", "Yes, but shared staff with other projects", "No, we will need external support"]}
          error={errors.sufficientStaff}
        />

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

        {/* Submit Button */}
        <Box sx={{ mt: 4 }}>
          <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
          {loading ? <CircularProgress /> : "Submit"}
          </Button>
        </Box>
        </form>

        {/* Snackbar Component */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000} // Hide after 5 seconds
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
        </Box> 
  );
}

export default RegistrationForm;