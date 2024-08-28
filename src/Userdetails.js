
import React, { useState, useEffect } from 'react';
import { Button, TextField, Container, FormControl, InputLabel, Select, MenuItem, Typography,List, ListItemText , ListItem} from '@mui/material';
// import { DatePicker } from '@mui/lab';
// import { DatePicker } from '@mui/lab';  // Import the DatePicker component
// import AdapterDateFns from '@mui/lab/AdapterDateFns';  // Import the date adapter
// import LocalizationProvider from '@mui/lab/LocalizationProvider'; 
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import TextField from '@mui/material/TextField';

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
          'Ration card',
          'Aadhar Card',
          'Voter ID card',
          'Driving License',
          'PAN Card',
          'Passport',
          'Domicile/Secondary/Senior Secondary Marksheet'
        ];

        const useCaseOptions = [
            'Income Increase/Job',
            'Entrepreneurship',
            'Internships',
            'Skilling/Vocations'
          ];


  const statusOptions = [
    'Laptop Received',
    'Employed',
    'Intern',
    'Entrepreneur/Freelancing',
    'Trainer'
  ];



  const fields = [
    
    { label: 'Name', name: 'name' },
    { label: 'Email', name: 'email' },
    { label: 'Contact Number', name: 'contactNumber' },
    { label: 'Address', name: 'address' },
    { label: 'Address State', name: 'addressState' },
    { label: 'ID Proof Type', name: 'idProofType' },
    { label: 'ID Number', name: 'idNumber' },
    { label: 'Qualification', name: 'qualification' },
    { label: 'Occupation', name: 'occupation' },
    { label: 'Date Of Birth', name: 'dateOfBirth' },
    { label: 'Use Case', name: 'useCase' },
    { label: 'Number of Family Members', name: 'familyMembers' },
    { label: 'Status', name: 'status' },
    { label: 'Laptop Assigned', name: 'laptopAssigned' },
  ];

 
  
  const [data, setData] = useState([]);
  const [errors, setErrors] = useState({});

  const validate = () => {
    let tempErrors = {};
    tempErrors.email = formData.email ? (/\S+@\S+\.\S+/.test(formData.email) ? "" : "Email is not valid") : "Email is required";
    tempErrors.contactNumber = formData.contactNumber ? (/^\d{10}$/.test(formData.contactNumber) ? "" : "Contact number should be 10 digits") : "Contact number is required";
    setErrors(tempErrors);
    return Object.values(tempErrors).every(x => x === "");
  };


  const [formData, setFormData] = useState({idProofType: '',useCase: '',states : '',
    status: ''},);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
    try {

      const response = await fetch('https://script.google.com/macros/s/AKfycbwEVN-I9lxlHMKLQSRETImQOm2_WfyeQldbbOBoYt8xkodgDH5EcrkCMnnOqjXnf7xV9A/exec', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify(formData),  // Send the entire formData object
      });

      const result = await response.json();
      
      if (result.result === 'success') {
        alert('Data submitted successfully!');
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      alert('Request failed: ' + error.message);
    }
}
  };

// // 
//   const DataDisplayComponent = () => {
 

  useEffect(() => {
    fetch('https://script.google.com/macros/s/AKfycbwEVN-I9lxlHMKLQSRETImQOm2_WfyeQldbbOBoYt8xkodgDH5EcrkCMnnOqjXnf7xV9A/exec')
      .then(response => response.json())
      .then(data => setData(data)
      )
      .catch(error => console.error('Error fetching data:', error));
  }, []);
// }

console.log(data);


  return (
    <Container>
        <Typography variant="h4" gutterBottom align='center'>
            User Details Form
        </Typography>
      <form onSubmit={handleSubmit}>
        {fields.map((field) => {
          if (field.name === 'idProofType') {
            return (
              <FormControl fullWidth margin="normal" key={field.name}>
                <InputLabel>{field.label}</InputLabel>
                <Select
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                >
                  {idProofOptions.map((option, index) => (
                    <MenuItem key={index} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            );
          } else if (field.name === 'useCase') {
            return (
              <FormControl fullWidth margin="normal" key={field.name}>
                <InputLabel>{field.label}</InputLabel>
                <Select
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                >
                  {useCaseOptions.map((option, index) => (
                    <MenuItem key={index} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            );
          } else if (field.name === 'status') {
            return (
              <FormControl fullWidth margin="normal" key={field.name}>
                <InputLabel>{field.label}</InputLabel>
                <Select
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                >
                  {statusOptions.map((option, index) => (
                    <MenuItem key={index} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            );
          } else if (field.name === 'dateOfBirth') {
            return (

              <TextField
              fullWidth
              key={field.name}
                label={field.label}
                name={field.name}
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formData[field.name] || ''}
              onChange={handleChange}
              variant="outlined"
              margin="normal"
            />
            );
          }
          else if (field.name === 'addressState') {
            return (
                <FormControl fullWidth margin="normal" key={field.name}>
                <InputLabel>{field.label}</InputLabel>
                <Select
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
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
                key={field.name}
                label={field.label}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                fullWidth
                margin="normal"
                error={!!errors[field.name]}
                helperText={errors[field.name]}

              />
            );
          }
        })}
        <Button type="submit" variant="contained" color="primary">
          Submit
        </Button>
      </form>

      {/* <Container>
      <Typography variant="h4" gutterBottom>
        Data from Google Sheet
      </Typography>
      <List>
        {data.map((item, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={item['Name']} // Example: Replace 'Name' with your actual column header
              secondary={`Email: ${item['Email']}, Contact Number: ${item['Contact Number']}`}
            />
          </ListItem>
        ))}
      </List>
    </Container> */}
    </Container>

    
  );
};

export default FormComponent;

