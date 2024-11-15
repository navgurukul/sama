import React, { useState } from 'react';
import { TextField, Button, Grid, Typography, Box, Select, MenuItem, FormControl, InputLabel, Link, Paper } from '@mui/material';

import { format, parseISO } from 'date-fns';

const EditUserForm = ({ userData, onSubmit, statesOptions, idProofOptions, useCaseOptions, statusOptions, qualification, occupation, familyAnnualIncome}) => {
  const initialDate = userData["Date Of Birth"]
    ? format(parseISO(userData["Date Of Birth"]), 'yyyy-MM-dd')
    : '';

  const [formData, setFormData] = useState({
    userId: userData.ID || '',
    ngoId: userData.Ngo || '',
    name: userData.name || '',
    email: userData.email || '',
    contactNumber: userData["contact number"] || '',
    address: userData.Address || '',
    addressState: userData["Address State"] || '',
    idProofType: userData["ID Proof type"] || '',
    idNumber: userData["ID Proof number"] || '',
    qualification: userData.Qualification || '',
    occupation: userData.Occupation || '',
    dateOfBirth: initialDate,
    useCase: userData["Use case"] || '',
    familyMembers: userData["Number of Family members(who might use the laptop)"] || '',
    guardian: userData["Father/Mother/Guardians Occupation"] || '',
    familyAnnualIncome: userData["Family Annual Income"] || '',
    status: userData.status || '',
    laptopAssigned: userData["Laptop Assigned"] || '',
    idProofFileUrl: userData["ID Link"] || null,
    incomeCertificateFileUrl: userData["Income Certificate Link"] || null,
  });

  const [fileEdited, setFileEdited] = useState({
    idProofFileEdited: false,
    incomeCertificateFileEdited: false,
  });

  const handleDateChange = (e) => {
    setFormData({ ...formData, dateOfBirth: e.target.value });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
  
    // Map the input `name` to the correct `fileEdited` property
    const editedKeyMap = {
      idProofFileUrl: 'idProofFileEdited',
      incomeCertificateFileUrl: 'incomeCertificateFileEdited',
    };
  
    setFormData({ ...formData, [name]: files[0] });
    
    // Update only the correct key in `fileEdited`
    const editedKey = editedKeyMap[name];
    if (editedKey) {
      setFileEdited((prevFileEdited) => ({
        ...prevFileEdited,
        [editedKey]: true,
      }));
    }
  };
  
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Initialize formDataToSubmit with base form data
    let formDataToSubmit = { ...formData };
  
    // Conditionally add idProofFile fields if edited
    if (fileEdited.idProofFileEdited) {
      formDataToSubmit = {
        ...formDataToSubmit,
        idProofFile: await convertToBase64(formData.idProofFileUrl),
        idProofFileName: formData.idProofFileUrl.name,
        idProofMimeType: formData.idProofFileUrl.type
      };
    }
  
    // Conditionally add incomeCertificateFile fields if edited
    if (fileEdited.incomeCertificateFileEdited) {
      formDataToSubmit = {
        ...formDataToSubmit,
        incomeCertificateFile: await convertToBase64(formData.incomeCertificateFileUrl),
        incomeCertificateFileName: formData.incomeCertificateFileUrl.name,
        incomeCertificateMimeType: formData.incomeCertificateFileUrl.type
      };
    }
  
    // Call the onSubmit function with the final formDataToSubmit
    onSubmit(formDataToSubmit);
  };
  

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, mb:6 }}>
      <Typography variant="h6" align='left' gutterBottom>Edit Beneficiary Profile</Typography>
      <Grid container spacing={2}>
      <Grid item xs={12}>
          <Typography variant='subtitle1' sx={{ mb: 1, mt: 1}}>Name</Typography>
          <TextField
            name="name"
          
            fullWidth
            value={formData.name}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant='subtitle1' sx={{ mb: 1, mt: 1 }}>Email</Typography>
          <TextField
            name="email"
           
            type="email"
            fullWidth
            value={formData.email}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant='subtitle1'sx={{ mb: 1, mt: 1}} >Contact Number</Typography>
          <TextField
            name="contactNumber"
         
            fullWidth
            value={formData.contactNumber}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant='subtitle1' sx={{ mb: 1, mt: 1 }}>Address</Typography>
          <TextField
            name="address"
         
            fullWidth
            value={formData.address}
            onChange={handleChange}
          />
        </Grid>
        
        <Grid item xs={12}> 
          <Typography variant='subtitle1' sx={{ mb: 1, mt: 1 }}>Address State</Typography>
          <FormControl fullWidth>
            {/* <InputLabel>State</InputLabel> */}
            <Select
              name="addressState"
              value={formData.addressState}
              onChange={handleChange}
            >
              {statesOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Typography variant='subtitle1' sx={{ mb: 1, mt: 1 }}>ID Proof</Typography>
          <FormControl fullWidth>
            {/* <InputLabel>ID Proof Type</InputLabel> */}
            <Select
              name="idProofType"
              value={formData.idProofType}
              onChange={handleChange}
            >
             {idProofOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ mb: 1, mt: 1 }}>Upload ID Proof</Typography>
          <Button variant="outlined" component="label" fullWidth>
            Upload File
            <input
              type="file"
              name="idProofFile"
              hidden
              onChange={handleFileChange}
            />
          </Button>
          {formData.idProofFileUrl && typeof formData.idProofFileUrl === 'string' && (
          <Paper sx={{ mt: 1, p: 2 }}>
            <Typography variant="subtitle2" sx={{ mt: 1}}>
              <Link href={formData.idProofFileUrl} target="_blank" rel="noopener noreferrer" sx={{ textDecoration: "none"}}>
                View Uploaded File  
              </Link>
            </Typography>
          </Paper>
          )}
        </Grid>

        <Grid item xs={12}>
          <Typography variant='subtitle1' sx={{ mb: 1, mt: 1 }}>ID Number</Typography>
          <TextField
            name="idNumber"
            // label="ID Number"
            fullWidth
            value={formData.idNumber}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant='subtitle1' sx={{ mb: 1, mt: 1 }}>Date of Birth</Typography>
          <TextField
            name="dateOfBirth"
            // label="Date of Birth (YYYY-MM-DD)"
            type="date"
            fullWidth
            value={formData.dateOfBirth}
            onChange={handleDateChange}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant='subtitle1' sx={{ mb: 1, mt: 1 }}>Use Case</Typography>
          <FormControl fullWidth>
            {/* <InputLabel>Use Case</InputLabel> */}
            <Select
              name="useCase"
              value={formData.useCase}
              onChange={handleChange}
            >
              {useCaseOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Typography variant='subtitle1' sx={{ mb: 1, mt: 2 }}>Qualification</Typography>
         <FormControl fullWidth>
            {/* <InputLabel>Qualification</InputLabel> */}
            <Select
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
            >
              {qualification.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Typography variant='subtitle1' sx={{ mb: 1, mt: 1 }}>Occupation</Typography>
          <FormControl fullWidth>
            {/* <InputLabel>Occupation</InputLabel> */}
            <Select
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
            >
              {occupation.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
           

        <Grid item xs={12}>
          <Typography variant='subtitle1' sx={{ mb: 1, mt: 1 }}>Number of Family Members</Typography>
          <TextField
            name="familyMembers"
            // label="Number of Family Members"
            type="number"
            fullWidth
            value={formData.familyMembers}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant='subtitle1' sx={{ mb: 1, mt: 1 }}>Father/Mother/Guardians Occupation</Typography>
          <TextField
            name="guardian"
            // label="Father/Mother/Guardians Occupation"
            fullWidth
            value={formData.guardian}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant='subtitle1' sx={{ mb: 1, mt: 1 }}>Family Annual Income</Typography>
          <FormControl fullWidth>
            {/* <InputLabel>Family Annual Income</InputLabel> */}
            <Select
              name="familyAnnualIncome"
              value={formData.familyAnnualIncome}
              onChange={handleChange}
            >
              {familyAnnualIncome.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ mb: 1, mt: 1 }}>Upload Income Certificate</Typography>
          <Button variant="outlined" component="label" fullWidth>
            Upload File
            <input
              type="file"
              name="incomeCertificateFileUrl"
              hidden
              onChange={handleFileChange}
            />
            </Button>
          {formData.incomeCertificateFileUrl && typeof formData.incomeCertificateFileUrl === 'string' && (
          <Paper sx={{ mt: 2, p: 2 }}>
            <Typography variant="subtitle2" sx={{ mt: 1}}>
              <Link href={formData.incomeCertificateFileUrl} target="_blank" rel="noopener noreferrer" sx={{ textDecoration: "none"}}>
                View Uploaded File
              </Link>
            </Typography>
          </Paper>
          )}
        </Grid>
        <Grid item xs={12}>
          <Typography variant='subtitle1' sx={{ mb: 1, mt:1 }}>Laptop Assigned</Typography>
          <TextField
            name="laptopAssigned"
            // label="Laptop Assigned"
            fullWidth
            value={formData.laptopAssigned}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Submit
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EditUserForm;
