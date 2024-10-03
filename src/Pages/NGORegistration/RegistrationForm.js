import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  Typography
} from '@mui/material';

function NgoForm() {
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
    beneficiariesCount: '',
    ageGroup: '',
    primaryUse: [],
    expectedOutcome: '',
    laptopTracking: '',
    jobsCreated: '',
    previousProjects: '',
    sufficientStaff: '',
    impactReport: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleMultiSelectChange = (e, field) => {
    const { value } = e.target;
    setFormData({ ...formData, [field]: typeof value === 'string' ? value.split(',') : value });
  };

  const handleFileUpload = (e) => {
    setFormData({ ...formData, impactReport: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  console.log(formData);

  
  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', padding: 3, }}>
         <Typography variant="h4" gutterBottom>NGO Information Form</Typography>
      <form onSubmit={handleSubmit}>
        {/* Fields 1-13 */}
        {/* Organization Name */}
        <TextField
          fullWidth
          label="What is the name of the organization?"
          name="organizationName"
          value={formData.organizationName}
          onChange={handleInputChange}
          margin="normal"
          required
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
        />

        {/* Location */}
        <FormControl fullWidth margin="normal">
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
        </FormControl>

        {/* Years of Operation */}
        <FormControl fullWidth margin="normal">
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
        </FormControl>

        {/* Focus Area */}
        <FormControl fullWidth margin="normal">
          <FormLabel>What is the primary focus area of your organization?</FormLabel>
          <RadioGroup
            name="focusArea"
            value={formData.focusArea}
            onChange={handleInputChange}
          >
            <FormControlLabel value="Education" control={<Radio />} label="Education" />
            <FormControlLabel value="Employment/Job placement" control={<Radio />} label="Employment/Job placement" />
            <FormControlLabel value="Digital literacy" control={<Radio />} label="Digital literacy" />
            <FormControlLabel value="Women empowerment" control={<Radio />} label="Women empowerment" />
            <FormControlLabel value="Other" control={<Radio />} label="Other" />
          </RadioGroup>
        </FormControl>

        {/* Working with Women */}
        <FormControl fullWidth margin="normal">
          <FormLabel>Does your NGO primarily work with underprivileged women?</FormLabel>
          <RadioGroup
            name="worksWithWomen"
            value={formData.worksWithWomen}
            onChange={handleInputChange}
          >
            <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
            <FormControlLabel value="No" control={<Radio />} label="No" />
            <FormControlLabel value="Partially" control={<Radio />} label="Partially (Some projects focus on this)" />
          </RadioGroup>
        </FormControl>

        {/* Infrastructure */}
        <FormControl fullWidth margin="normal">
          <FormLabel>What infrastructure is available for laptop use?</FormLabel>
          <RadioGroup
            name="infrastructure"
            value={formData.infrastructure}
            onChange={handleInputChange}
          >
            <FormControlLabel value="Dedicated computer lab" control={<Radio />} label="Dedicated computer lab" />
            <FormControlLabel value="Beneficiaries will use laptops at home" control={<Radio />} label="Beneficiaries will use laptops at home" />
            <FormControlLabel value="Shared space with Wi-Fi" control={<Radio />} label="Shared space with Wi-Fi" />
            <FormControlLabel value="No specific infrastructure in place" control={<Radio />} label="No specific infrastructure in place" />
            <FormControlLabel value="Other" control={<Radio />} label="Other" />
          </RadioGroup>
        </FormControl>

        {/* Identifying Beneficiaries */}
        <FormControl fullWidth margin="normal">
          <FormLabel>How does your NGO identify beneficiaries for laptop distribution?</FormLabel>
          <Select
            name="beneficiarySelection"
            multiple
            value={formData.beneficiarySelection}
            onChange={(e) => handleMultiSelectChange(e, 'beneficiarySelection')}
            renderValue={(selected) => selected.join(', ')}
          >
            <MenuItem value="Economic background">Based on economic background</MenuItem>
            <MenuItem value="Educational background">Based on educational background</MenuItem>
            <MenuItem value="Employment status">Based on employment status</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
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
        />

        {/* Age Group */}
        <FormControl component="fieldset" margin="normal">
          <FormLabel component="legend">What is the age group of the beneficiaries?</FormLabel>
          <RadioGroup
            name="ageGroup"
            value={formData.ageGroup}
            onChange={handleInputChange}
          >
            <FormControlLabel value="18-22 years" control={<Radio />} label="18-22 years (fresh graduates/college students)" />
            <FormControlLabel value="22-30 years" control={<Radio />} label="22-30 years (seeking employment)" />
            <FormControlLabel value="30+ years" control={<Radio />} label="30+ years (returning to education/employment)" />
            <FormControlLabel value="Other" control={<Radio />} label="Other" />
          </RadioGroup>
        </FormControl>

        {/* Fields 14-20 */}
        {/* Primary Use */}
        <FormControl fullWidth margin="normal">
          <FormLabel>What will be the primary use of the laptops provided to your beneficiaries?</FormLabel>
          <Select
            name="primaryUse"
            multiple
            value={formData.primaryUse}
            onChange={(e) => handleMultiSelectChange(e, 'primaryUse')}
            renderValue={(selected) => selected.join(', ')}
          >
            <MenuItem value="Education">Education</MenuItem>
            <MenuItem value="Employment">Employment</MenuItem>
            <MenuItem value="Entrepreneurship">Entrepreneurship</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
        </FormControl>

        {/* Expected Outcomes */}
        <FormControl fullWidth margin="normal">
          <FormLabel>What are the expected outcomes from the use of the laptops?</FormLabel>
          <RadioGroup
            name="expectedOutcome"
            value={formData.expectedOutcome}
            onChange={handleInputChange}
          >
            <FormControlLabel value="Securing full-time employment" control={<Radio />} label="Securing full-time employment" />
            <FormControlLabel value="Securing part-time employment or freelance work" control={<Radio />} label="Securing part-time employment or freelance work" />
            <FormControlLabel value="Completing education or certifications" control={<Radio />} label="Completing education or certifications" />
            <FormControlLabel value="Starting a business" control={<Radio />} label="Starting a business" />
            <FormControlLabel value="No specific outcome" control={<Radio />} label="No specific outcome" />
            <FormControlLabel value="Other" control={<Radio />} label="Other" />
          </RadioGroup>
        </FormControl>

        {/* Laptop Tracking */}
        <FormControl fullWidth margin="normal">
          <FormLabel>How do you plan to track the usage of the laptops?</FormLabel>
          <RadioGroup
            name="laptopTracking"
            value={formData.laptopTracking}
            onChange={handleInputChange}
          >
            <FormControlLabel value="Regular beneficiary feedback" control={<Radio />} label="Regular beneficiary feedback" />
            <FormControlLabel value="Progress reports from beneficiaries" control={<Radio />} label="Progress reports from beneficiaries" />
            <FormControlLabel value="Monitoring online course completion" control={<Radio />} label="Monitoring online course completion" />
            <FormControlLabel value="Employment verification" control={<Radio />} label="Employment verification" />
            <FormControlLabel value="Other" control={<Radio />} label="Other" />
          </RadioGroup>
        </FormControl>

        {/* Jobs Created*/}
        <FormControl fullWidth margin="normal">
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
        </FormControl>

        {/* Previous Projects */}
        <FormControl fullWidth margin="normal">
          <FormLabel>Has your NGO previously undertaken similar projects?</FormLabel>
          <RadioGroup
            name="previousProjects"
            value={formData.previousProjects}
            onChange={handleInputChange}
          >
            <FormControlLabel value="Yes, multiple similar projects" control={<Radio />} label="Yes, multiple similar projects" />
            <FormControlLabel value="Yes, but on a smaller scale" control={<Radio />} label="Yes, but on a smaller scale" />
            <FormControlLabel value="No, this is our first project of this kind" control={<Radio />} label="No, this is our first project of this kind" />
            <FormControlLabel value="Other" control={<Radio />} label="Other" />
          </RadioGroup>
        </FormControl>

        {/* Sufficient Staff */}
        <FormControl fullWidth margin="normal">
          <FormLabel>Does your NGO have sufficient staff to support beneficiaries in utilizing the laptops?</FormLabel>
          <RadioGroup
            name="sufficientStaff"
            value={formData.sufficientStaff}
            onChange={handleInputChange}
          >
            <FormControlLabel value="Yes, dedicated staff for digital literacy/employment" control={<Radio />} label="Yes, dedicated staff for digital literacy/employment" />
            <FormControlLabel value="Yes, but shared staff with other projects" control={<Radio />} label="Yes, but shared staff with other projects" />
            <FormControlLabel value="No, we will need external support" control={<Radio />} label="No, we will need external support" />
            <FormControlLabel value="Other" control={<Radio />} label="Other" />
          </RadioGroup>
        </FormControl>

        {/* Impact Reports Upload */}
        <Typography variant="body1" gutterBottom>
          Please share any impact reports or documentation related to your previous projects.
        </Typography>
        <Button variant="contained" component="label">
          Upload File
          <input
            type="file"
            hidden
            onChange={handleFileUpload}
          />
        </Button>
        {/* Submit Button */}
        <Box sx={{ mt: 4 }}>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Submit
          </Button>
        </Box>
      </form>
    </Box>
  );
}

export default NgoForm;
