import React, { useEffect, useState } from 'react';
import EditUserForm from './EditUserForm';
import { Container, Typography, CircularProgress, Alert } from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EditUserPage = () => {
  const navigate = useNavigate(); 
  const user = JSON.parse(localStorage.getItem('_AuthSama_'));
  const { id } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    // "Ration card", 
    "Aadhar Card",
    "Voter ID card",
    "Driving License",
    "PAN Card",
    "Passport",
    // "Domicile/Secondary/Senior Secondary Marksheet"
  ];
  const useCaseOptions = [
    "Income Increase/Job",
    "Entrepreneurship",
    "Internships",
    "Skilling/Vocations"
  ];
  const statusOptions = [
    "Laptop Received",
    "Employed",
    "Intern",
    "Entrepreneur/Freelancing",
    "Trainer"
  ];
  const qualification = [
    "Elementary School",
    "Middle School",
    "High School",
    "Higher Secondary Education",
    "Undergraduate Degree pursuing",
    "Undergraduate Degree completed",
    "Diploma Courses",
    "Postgraduate Degree",
  ];
  const occupation=[
    "Students", 
    "Trainer", 
    "Employed",
  ]
  const familyAnnualIncome=[
    "0 to 50K",  
    "50 to 1Lakh" ,  
    "1 to 2lakh" , 
    "2 to 3lakh",
    "3 to 5lakh", 
    "5+ lakh",
  ]


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getUserData&userIdQuery=${id}`);
          // `https://script.google.com/macros/s/AKfycbxDcI2092h6NLFcV2yvJN-2NaHVp1jc9_T5qs0ntLDcltIdRRZw5nfHiZTT9prPLQsf2g/exec?type=getUserData&userIdQuery=${id}`);
        setUserData(response.data[0]); // Assumes response.data is an array with at least one object
       
        
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}`, {
        // 'https://script.google.com/macros/s/AKfycbxDcI2092h6NLFcV2yvJN-2NaHVp1jc9_T5qs0ntLDcltIdRRZw5nfHiZTT9prPLQsf2g/exec', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        mode: 'no-cors',
        body: JSON.stringify({ ...formData, type: "userdetails"}),
      });

      navigate(`/userdetails/${formData.userId}`);
    
    } catch (error) {
      console.error('Error updating user:', error);
      alert('An error occurred while updating the user.');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm">
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{mt:5,mb:5}}>
     
      {userData ? (
        <EditUserForm userData={userData} onSubmit={handleSubmit}
         statesOptions={statesOptions} idProofOptions={idProofOptions} 
         useCaseOptions={useCaseOptions} statusOptions={statusOptions} 
         qualification={qualification} occupation={occupation} 
         familyAnnualIncome={familyAnnualIncome} />
      ) : (
        <Typography variant="body1" align="center">
          User data not found.
        </Typography>
      )}
    </Container>
  );
};

export default EditUserPage;
