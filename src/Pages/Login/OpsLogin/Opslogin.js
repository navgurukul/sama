import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Typography,
  Box,
  Container,
  Grid,
  FormLabel,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment
} from '@mui/material';
import login_ngo from "./assets/login_ngo.svg";
import EmailIcon from '@mui/icons-material/Email';
import CloseIcon from '@mui/icons-material/Close'
import AttentionNeeded from "../../../components/AttentionNeeded/AttentionNeeded"

function Opslogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [data, setData] = useState([]);
  const [documentAvailable, setDocumentAvailable] = useState(false);
  const [loder, setLoder] = useState(false);
  const [failedStatuses, setFailedStatuses] = useState([]);
  const [pendingStatuses, setPendingStatuses] = useState([]);
  const navigate = useNavigate();
  const [openSignup, setOpenSignup] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [openForgotModal, setOpenForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');



  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_UserDetailsApis}`,
          // 'https://script.google.com/macros/s/AKfycbzuFPeG0cosIEGBocwuJ72DWUH6zcg7MtawkOuvOifXqHnm1QlaR7ESxiLKzGua-WQp/exec'
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
      localStorage.setItem('_AuthSama_', JSON.stringify([{ name: user.Name, email: user.Email, role: user.Role, NgoId: user["Ngo Id"], Type: user.Type }]));
      setError('');

      // Redirect based on role
      if (user?.Role?.includes('admin')) {
        navigate('/ngo');
      }
      else
        if (user?.Role?.includes('ngo')) {
          // navigate('/beneficiarydata');
          try {
            // First API call to fetch registration data
            const response = await fetch(
              `${process.env.REACT_APP_NgoInformationApi}?type=registration`
              // 'https://script.google.com/macros/s/AKfycbxm2qA0DvzVUNtbwe4tAqd40hO7NpNU-GNXyBq3gHz_q45QIo9iveYOkV0XqyfZw9V7/exec?type=registration'
            );
            const result = await response.json();
            const finduser = result.data.find(item => item.Id === user["Ngo Id"]);

            if (finduser) {
              try {
                // Second API call to check document status
                const documentResponse = await fetch(
                  `${process.env.REACT_APP_NgoInformationApi}?type=MultipleDocsGet&userId=${user["Ngo Id"]}`
                  // `https://script.google.com/macros/s/AKfycbxmnB0YHUm_mPxf1i-Cv465D1kSOrB0w1-dJS1slov_UQPZ0QxMERy_kZ8uZ5KASjBi/exec?type=MultipleDocsGet&userId=${user["Ngo Id"]}`
                );
                const documentResult = await documentResponse.json();

                if (!documentResult.isDataAvailable) {
                  // Navigate to document upload if data is not Available
                  navigate('/documentupload');
                  return;
                }
                // Check for unsuccessful statuses in submitted documents
                const failed = [];
                const pending = [];
                const emptyStatuses = [];
                for (const [key, value] of Object.entries(documentResult)) {
                  if (value && typeof value === "object" && "status" in value) {
                    if (value.status !== "Success" && value.status !== "Pending Verification") {
                      if (value.status === "") {
                        emptyStatuses.push(key);
                      }
                      failed.push(key); // Collect keys with failed statuses

                    } else if (value.status === "Pending Verification") {
                      pending.push(key); // Collect keys with pending verification statuses
                    }
                  }
                }
                if (failed.length > 0) {
                  if (failed.includes("FCRA Approval") && failed.length === 1 && emptyStatuses.length === 1) {
                    if (finduser["Ngo Type"] === "1 to one") {
                      navigate('/beneficiarydata'); // Navigate to beneficiary data
                      return
                    } else {
                      navigate('/preliminary'); // Navigate to preliminary for other types
                      return
                    }
                  }
                  // If there are failed statuses, navigate to /attentionneeded
                  setFailedStatuses(failed); // Update state to show AttentionNeeded
                  navigate('/attentionneeded', { state: { failedStatuses: failed } });
                  return;
                }

                if (pending.length > 0) {
                  // If there are pending statuses, navigate to /documentupload
                  setPendingStatuses(pending); // Update state to handle pending statuses
                  // navigate('/documentupload', { state: { pendingStatuses: pending } });
                  navigate('/submission-success');
                  return;
                }
                // If no failed or pending statuses, check if all statuses are 'Success'

                const allSuccess = Object.values(documentResult)
                  .filter((value) => typeof value === "object" && "status" in value) // Filter only objects with a `status`
                  .every((value) => value.status === "Success"); // Check if all `status` are "Success"

                if (allSuccess) {
                  // Check the Ngo Type and navigate accordingly
                  if (finduser["Ngo Type"] === "1 to one") {
                    navigate('/beneficiarydata'); // Navigate to beneficiary data
                  } else {
                    navigate('/preliminary'); // Navigate to preliminary for other types
                  }
                } else {
                  console.log("Unexpected condition: Some statuses are neither 'Success', 'Failed', nor 'Pending Verification'.");
                }

              } catch (error) {
                console.error('Error fetching document data:', error);
              }
            } else {
              console.log("User not found");
            }
          } catch (error) {
            console.error('Error fetching registration data:', error);
          }
        }
        else if (user?.Role?.includes('ops')) {
          navigate('/ops');
        } else {
          navigate("/");
        }
    } else {
      setError('Invalid Email or password.');
    }
    setLoder(false);
  };

  const handleForgotPasswordSubmit = async () => {
    if (!forgotEmail) {
      setForgotMessage('Please enter your email.');
      return;
    }

    try {
      await fetch(`${process.env.REACT_APP_UserDetailsApis}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors', // opaque response
        body: JSON.stringify({ email: forgotEmail, type: 'forgotPassword' }),
      });

      // We assume it worked (since no way to read the response)
      setForgotMessage('If your email is registered, you will receive reset instructions.');
    } catch (error) {
      console.error('Error sending reset email:', error);
      setForgotMessage('An error occurred. Please try again later.');
    }
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
            <Box sx={{ display: 'flex', flexDirection: "row", gap: 2 }}>
              <Button
                onClick={handleSubmit}
                type="submit"
                variant="contained"
                sx={{ width: 'auto', alignSelf: 'start', mt: 2, borderRadius: "100px" }}
              >
                {loder ? <CircularProgress color='white' /> : "Login"}
              </Button>
              <Button
                onClick={() => navigate('/signup')}
                variant="outlined"
                sx={{ width: 'auto', alignSelf: 'start', mt: 2, borderRadius: "100px" }}
              >
                Sign Up
              </Button>
            </Box>
            <Typography
              sx={{
                mt: 2,
                color: 'primary.main',
                cursor: 'pointer',
                textDecoration: 'underline',
                width: 'fit-content'
              }}
              onClick={() => setOpenForgotModal(true)}
            >
              Forgot Password?
            </Typography>
            <Dialog
              open={openForgotModal}
              onClose={() => setOpenForgotModal(false)}
              PaperProps={{
                sx: {
                  borderRadius: 2,
                  p: 2,
                  width: '100%',
                  maxWidth: 500,
                },
              }}
            >
              <DialogTitle
                sx={{
                  fontWeight: 'bold',
                  fontSize: '1.3rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid #e0e0e0',
                  pb: 1,
                }}
              >
                Forgot Password
                <IconButton
                  onClick={() => setOpenForgotModal(false)}
                  size="small"
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>

              <DialogContent sx={{ mt: 1 }}>
                <Typography sx={{ mb: 2 }}>
                  Enter your registered email address below. We’ll send you the user name & password.
                </Typography>

                <TextField
                  autoFocus
                  margin="dense"
                  label="Email Address" // <-- This is correct
                  type="email"
                  fullWidth
                  variant="outlined"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    ),
                  }}
                />


                {forgotMessage && (
                  <Typography sx={{ mt: 1, color: 'success.main' }}>
                    {forgotMessage}
                  </Typography>
                )}
              </DialogContent>

              <DialogActions sx={{ justifyContent: 'flex-end', px: 3, pb: 2 }}>
                <Button onClick={() => setOpenForgotModal(false)} variant="outlined">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ backgroundColor: '#4C6B49' }}
                  onClick={handleForgotPasswordSubmit}
                >
                  Confirm
                </Button>
              </DialogActions>
            </Dialog>


          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Opslogin;
