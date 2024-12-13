// import React, { useState, useEffect } from 'react';
// import { Box, TextField, Typography, Button, Paper, Container } from '@mui/material';
// import { useNavigate, useParams } from 'react-router-dom';
// import axios from 'axios';

// const MonthlyReportingForm = () => {
//   const [questions, setQuestions] = useState([]);
//   const [error, setError] = useState("");
//   const [formData, setFormData] = useState({
//     type: 'monthly',
//     ngoId: 'SAM-1',
//     month: 'january',
//     teachersTrained: '',
//     schoolVisits: '',
//     sessionsConducted: '',
//     modulesCompleted: '',
//     studentsIntentRating: '',
//   });

//   const navigate = useNavigate();

//   const NgoId = JSON.parse(localStorage.getItem("_AuthSama_"));
//   const { id } = useParams();
//   const gettingStoredData = id ? id : NgoId[0].NgoId;

//   useEffect(() => {
//     async function fetchData() {
//       const id = gettingStoredData;      
//       try {
//         const response = await axios.get(`https://script.google.com/macros/s/AKfycby4zd74Zl-sQYN5b8940ZgOVQEcb5Jam-SNayOzevsrtQmH4nhHFLu936Nwr0-uZVZh/exec?type=Monthly&id=${id}`);
//         const data = response.data;
//         setQuestions(data.questions);

//       } catch (error) {
//         console.error('Error fetching data:', error);
//       }
//     }
//     gettingStoredData && fetchData();
    
//   }, [gettingStoredData]); 

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };


//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const response = await fetch(
//         "https://script.google.com/macros/s/AKfycbyVi1UX63tdxatOS4-21DytCvYvD2v9fdYH72JD5LHHe1P_qd3SpZqO88mbMM_PXgsJGQ/exec"
//         , {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         mode: "no-cors",
//         body: JSON.stringify(formData),
//       });
      
//       const result = await response.json();
//       console.log(result);
//       navigate('/preliminary');

//     } catch (error) {
//       console.error("Error submitting form:", error);
//     }
//   };

//   return (
//     <Container
//       maxWidth="sm"
//     >
//       <Paper
//         sx={{
//           width: '100%',
//           maxWidth: '600px',
//           padding: 4,
//           borderRadius: 2,
//           backgroundColor: '#fffdf3',
//         }}
//       >
//         <Typography variant="h5" align="center" gutterBottom>
//           January 2024 Report
//         </Typography>
//         <Box component="form" sx={{ mt: 2 }} onSubmit={handleSubmit} noValidate>
//           <TextField
//             label="Number of Teachers Trained"
//             name="teachersTrained"
//             value={formData.teachersTrained}
//             onChange={handleChange}
//             fullWidth
//             margin="normal"
//             variant="outlined"
//           />
//           <TextField
//             label="Number of School Visits"
//             name="schoolVisits"
//             value={formData.schoolVisits}
//             onChange={handleChange}
//             fullWidth
//             margin="normal"
//             variant="outlined"
//           />
//           <TextField
//             label="Number of Sessions Conducted"
//             name="sessionsConducted"
//             value={formData.sessionsConducted}
//             onChange={handleChange}
//             fullWidth
//             margin="normal"
//             variant="outlined"
//           />
//           <TextField
//             label="Number of Modules Completed"
//             name="modulesCompleted"
//             value={formData.modulesCompleted}
//             onChange={handleChange}
//             fullWidth
//             margin="normal"
//             variant="outlined"
//           />
//           <TextField
//             label="Total Students' Intent to Pursue Rating per Module"
//             name="studentsIntentRating"
//             value={formData.studentsIntentRating}
//             onChange={handleChange}
//             fullWidth
//             margin="normal"
//             variant="outlined"
//           />
//           <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
//             <Button
//               type="submit"
//               variant="contained"
//               color="success"
//               sx={{ paddingX: 4, textTransform: 'none', fontSize: '16px' }}
//             >
//               Submit Report
//             </Button>
//           </Box>
//         </Box>
//       </Paper>
//     </Container>
//   );
// };

// export default MonthlyReportingForm;


import React, { useState, useEffect } from 'react';
import { Box, TextField, Typography, Button, Paper, Container } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const MonthlyReportingForm = () => {
  const [questions, setQuestions] = useState([]); // Holds fetched questions
  const [error, setError] = useState(""); // For error handling
  const [formData, setFormData] = useState({}); // For storing answers
  const [submittedData, setSubmittedData] = useState(null); // For storing submitted questions and answers

  console.log(formData);
  
  const navigate = useNavigate();
  const NgoId = JSON.parse(localStorage.getItem("_AuthSama_"));
  const { id } = useParams();
  const gettingStoredData = id ? id : NgoId[0].NgoId;

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(
          `https://script.google.com/macros/s/AKfycby4zd74Zl-sQYN5b8940ZgOVQEcb5Jam-SNayOzevsrtQmH4nhHFLu936Nwr0-uZVZh/exec?type=Monthly&id=${gettingStoredData}`
        );
        const data = response.data;
        setQuestions(data.questions || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError("Failed to load questions.");
      }
    }
    if (gettingStoredData) fetchData();
  }, [gettingStoredData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmittedData(formData); // Save submitted data
    setFormData({}); // Clear the form
  };

  fetch('https://script.google.com/macros/s/AKfycby4zd74Zl-sQYN5b8940ZgOVQEcb5Jam-SNayOzevsrtQmH4nhHFLu936Nwr0-uZVZh/exec', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: 1,
      data: { ...formData },
      type: 'SendMonthlyReport'
    }),
  })
    .then(response => response.json())
    .then(data => console.log('Success:', data))
    .catch(error => console.error('Error:', error));

  return (
    <Container maxWidth="sm">
      <Paper
        sx={{
          width: '100%',
          maxWidth: '600px',
          padding: 4,
          borderRadius: 2,
          backgroundColor: '#fffdf3',
        }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          Monthly Report
        </Typography>

        {questions.length > 0 ? (
          <Box component="form" sx={{ mt: 2 }} onSubmit={handleSubmit} noValidate>
            {questions.map((question, index) => (
              <TextField
                key={index}
                label={question}
                name={question}
                value={formData[question] || ""}
                onChange={handleChange}
                fullWidth
                margin="normal"
                variant="outlined"
              />
            ))}

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                color="success"
                sx={{ paddingX: 4, textTransform: 'none', fontSize: '16px' }}
              >
                Submit Answers
              </Button>
            </Box>
          </Box>
        ) : (
          <Typography align="center" color="error">
            {error || "Loading questions..."}
          </Typography>
        )}

        {submittedData && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6">Submitted Data:</Typography>
            <Paper
              sx={{ padding: 2, backgroundColor: '#f9f9f9', borderRadius: 2, mt: 2 }}
            >
              {Object.entries(submittedData).map(([question, answer], index) => (
                <Typography key={index}>
                  <strong>{question}:</strong> {answer}
                </Typography>
              ))}
            </Paper>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default MonthlyReportingForm;
