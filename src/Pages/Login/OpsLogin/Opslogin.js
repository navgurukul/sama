// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { TextField, Button, Typography, Box, Container, Grid,Link, FormLabel } from '@mui/material';
// import login_ngo from "./assets/login_ngo.svg";
// import DocumentReupload from '../../DocumentReupload/DocumentReupload';
// import CircularProgress from '@mui/material/CircularProgress';

// function Opslogin() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [data, setData] = useState();
//   const navigate = useNavigate(); 
//   const [ngoDocsData, setNgoDocsData] = useState([]);
//   const [documentAvailable, setDocumentAvailable] = useState(false);
//   const [loder, setLoder] = useState(false);
//   // Fetching data from the backend
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await fetch(
//           'https://script.google.com/macros/s/AKfycbzuFPeG0cosIEGBocwuJ72DWUH6zcg7MtawkOuvOifXqHnm1QlaR7ESxiLKzGua-WQp/exec'
//         );
//         const result = await response.json();
//         setData(result)
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       }
//     };

//     fetchData();
//   }, []);




//   // const checkDocuments = async (userId) => {
//   //   try {
//   //     const response = await fetch(
//   //       `https://script.google.com/macros/s/AKfycbxm2qA0DvzVUNtbwe4tAqd40hO7NpNU-GNXyBq3gHz_q45QIo9iveYOkV0XqyfZw9V7/exec?type=MultipleDocsGet&userId=${userId}`
//   //     );
//   //     const apiResponse = await response.json();
//   //     console.log(apiResponse, "apiResponse");
//   //     setDocumentAvailable(true); // Set to true if response is successful

//   //     return true;
//   //   } catch (error) {
//   //     console.error('Error fetching document data:', error);
//   //     setDocumentAvailable(false); // Set to false if there's an error
//   //   }
//   // };

//   // Handle form submission
//   // const handleSubmit = async (e) => {
//   //   e.preventDefault();
//   //   setLoder(true);
//   //   // Validate if both fields are filled
//   //   if (email === '' || password === '') {
//   //     setError('Please fill in both Email and password.');
//   //     return;
//   //   }

//   //   const user = data.find((user) => {
//   //       return user.Email === email && user.Password === password;
//   //     });

      
//   //   if (user) {
//   //     localStorage.setItem('isLoggedIn', 'true');
//   //     localStorage.setItem('role', JSON.stringify(user.Role)); // Store the role array in localStorage
//   //     localStorage.setItem('_AuthSama_', JSON.stringify([{
//   //       name: user.Name,
//   //       email: user.Email,
//   //       role: user.Role,
//   //       NgoId:user["Ngo Id"]
//   //     }])); // Store the role array in localStorage
//   //     setError(''); 
//   //     await checkDocuments(user["Ngo Id"]);

//   //     console.log(documentAvailable, "documentAvailable");
      
//   //     //  Redirect based on role
//   //     if (user?.Role?.includes('admin')) {
//   //       navigate('/ngo'); // Admin gets access to all dashboards
//   //     } 
//   //     else if (user?.Role?.includes('ngo')) {
//   //       // navigate('/documentupload');
//   //       if(documentAvailable){

//   //         navigate('/beneficiarydata');
//   //       }
//   //       else{
//   //         navigate('/documentupload');
//   //     }
//   //     }
//   //      else if (user?.Role?.includes('ops')) {
//   //       navigate('/ops'); // Redirect OPS users
//   //     } 
//   //     else {
//   //         console.log("no role found");
//   //     }

//   //     setLoder(false);
//   //   } else {
//   //     setError('Invalid Email or password.');
//   //   }
//   // };

//   return (

//     <Container maxWidth="md" sx={{ my: 10 }}>
//       <Grid container spacing={10} alignItems="center">
//         <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
//           <img 
//             src = {login_ngo}
//             alt="Small placeholder" 
//             style={{ maxWidth: '100%', borderRadius: '8px' }} 
//           />
//         </Grid>

//         <Grid item xs={12} md={8}>
//           <Box component="form" 
//            sx={{ 
//             display: 'flex',
//              flexDirection: 'column',
//               gap: 1 }}>
//             <Typography variant="h5" gutterBottom>
//               Login to Dashboard
//             </Typography>
//             {error && (
//         <Typography color="error" sx={{ marginBottom: 2 }}>
//           {error}
//         </Typography>
//       )}
//              <Typography sx = {{color : "dark.main", fontWeight : "bold"}} >User Email</Typography>
//              {/* <FormLabel >User Name</FormLabel> */}
//              <TextField 
//               // label="Username" 
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               variant="outlined" 
//               fullWidth 
//               // required 
//               InputLabelProps={{
//                 shrink: true,
//               }}
//             />

//             {/* Password Field with Label above */}
//             <FormLabel mt={1} >
//               <Typography sx = {{color : "dark.main", fontWeight : "bold"}}  >Password</Typography>

//               </FormLabel>
//             <TextField 
//               // label="Password" 
//               type="password" 
//               variant="outlined" 
//               // fullWidth 
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required 
//               InputLabelProps={{
//                 shrink: true,
//               }}
//             />
           
//             {/* Forgot Password Link */}
//             <Box sx={{ display: 'flex', flexDirection:"column", gap: 2
//               //  justifyContent: 'space-between', alignItems: 'center'
//                 }}>
//             {/* <Link href="#" 
//               // onClick={handleForgotPassword}
//                underline="hover">
//                 Forgot Password?
//               </Link> */}
//               <Button 
//               onClick={handleSubmit}
//               type="submit" variant="contained" sx={{ 
//               width: 'auto', 
//               // borderRadius: '20%', 
//               alignSelf: 'start', 
//               mt: 2 
//               }} >
//                 {loder ? <CircularProgress align="center" color = "white"  sx={{ mt: 10,mb: 10, }}/>  : "Login"} 
//               </Button>
//             </Box>
//           </Box>
//         </Grid>

//       </Grid>
//     </Container>
//   );
// }

// export default Opslogin;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, Box, Container, Grid, FormLabel, CircularProgress } from '@mui/material';
import login_ngo from "./assets/login_ngo.svg";

function Opslogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [data, setData] = useState([]);
  const [documentAvailable, setDocumentAvailable] = useState(false);
  const [loder, setLoder] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          'https://script.google.com/macros/s/AKfycbzuFPeG0cosIEGBocwuJ72DWUH6zcg7MtawkOuvOifXqHnm1QlaR7ESxiLKzGua-WQp/exec'
        );
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (email === '' || password === '') {
      setError('Please fill in both Email and password.');
      return;
    }

    setLoder(true);

    const user = data.find((user) => user.Email === email && user.Password === password);

    if (user) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('role', JSON.stringify(user.Role));
      localStorage.setItem('_AuthSama_', JSON.stringify([{ name: user.Name, email: user.Email, role: user.Role, NgoId: user["Ngo Id"] }]));
      setError('');

      // Redirect based on role
      if (user?.Role?.includes('admin')) {
        navigate('/ngo');
      } 
      else if (user?.Role?.includes('ngo')) {
        try {
          const response = await fetch(
            'https://script.google.com/macros/s/AKfycbxm2qA0DvzVUNtbwe4tAqd40hO7NpNU-GNXyBq3gHz_q45QIo9iveYOkV0XqyfZw9V7/exec?type=registration'
          );
          const result = await response.json();
          const finduser = result.data.find(item => item.Id === user["Ngo Id"]);

          console.log(finduser, "result");
          if (finduser) {
            // Check the Ngo Type and log accordingly
            if (finduser["Ngo Type"] === "beneficiary") {
              try {
                const response = await fetch(
                  `https://script.google.com/macros/s/AKfycbxm2qA0DvzVUNtbwe4tAqd40hO7NpNU-GNXyBq3gHz_q45QIo9iveYOkV0XqyfZw9V7/exec?type=MultipleDocsGet&userId=${user["Ngo Id"]}`
                );
                const result = await response.json();
                console.log(result, "result");
        
                if (result.isDataAvailable) {
                  navigate('/beneficiarydata');
                } else {
                  navigate('/documentupload');
                }
              } catch (error) {
                console.error('Error fetching document data:', error);
              }
            } else {
              navigate('/preliminary');
            }
          } else {
            console.log("User not found");
          }
  
          // if (result.type === "benificiary") {
          //   console.log("a");
            
          // } else {
          //   console.log("b");
          // }
        } catch (error) {
          console.error('Error fetching document data:', error);
        }
        // 'https://script.google.com/macros/s/AKfycbxm2qA0DvzVUNtbwe4tAqd40hO7NpNU-GNXyBq3gHz_q45QIo9iveYOkV0XqyfZw9V7/exec?type=registration'
        // navigate('/preliminary');
      } else if (user?.Role?.includes('ops')) {
        navigate('/ops');
      } else {
        console.log("/");
      }
    } else {
      setError('Invalid Email or password.');
    }

    setLoder(false);
  };

  return (
    <Container maxWidth="md" sx={{ my: 10 }}>
      <Grid container spacing={10} alignItems="center">
        <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
          <img src={login_ngo} alt="Small placeholder" style={{ maxWidth: '100%', borderRadius: '8px' }} />
        </Grid>
        <Grid item xs={12} md={8}>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="h5" gutterBottom>Login to Dashboard</Typography>
            {error && (
              <Typography color="error" sx={{ marginBottom: 2 }}>{error}</Typography>
            )}
            <Typography sx={{ color: "dark.main", fontWeight: "bold" }}>User Email</Typography>
            <TextField 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <FormLabel>
              <Typography sx={{ color: "dark.main", fontWeight: "bold" }}>Password</Typography>
            </FormLabel>
            <TextField
              type="password"
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputLabelProps={{ shrink: true }}
            />
            <Box sx={{ display: 'flex', flexDirection: "column", gap: 2 }}>
              <Button 
                onClick={handleSubmit}
                type="submit" 
                variant="contained" 
                sx={{ width: 'auto', alignSelf: 'start', mt: 2 }} 
              >
                {loder ? <CircularProgress color='white'/> : "Login"}
               </Button>
              
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Opslogin;
