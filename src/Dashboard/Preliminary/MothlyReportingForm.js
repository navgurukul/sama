import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Paper,
  Container,
  Card,
  CardHeader,
  CardContent,
  IconButton,
  Chip,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import CircularProgress from "@mui/material/CircularProgress";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from '@mui/icons-material/Pending';
import { height } from "@mui/system";

const MonthlyReportingForm = () => {
  const [questions, setQuestions] = useState([]);
  const [states, setStates] = useState([]);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [stateExpanded, setStateExpanded] = useState({});
  const [stateStatus, setStateStatus] = useState({});
  const [stateValidation, setStateValidation] = useState({});
  const [stateEdited, setStateEdited] = useState({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { month, year } = location.state || {};
  const NgoId = JSON.parse(localStorage.getItem("_AuthSama_"));
  const { id } = useParams();
  const gettingStoredData = id ? id : NgoId[0].NgoId;

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // Validate form data for a specific state
  const validateStateForm = (stateName, stateData) => {
    if (!questions.length) return false;
    return questions.every(
      (question) =>
        stateData?.[question.question] &&
        stateData[question.question].toString().trim() !== ""
    );
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const questionsResponse = await axios.get(
          `${process.env.REACT_APP_NgoInformationApi}?type=Monthly&id=${gettingStoredData}`
        );

        if (!questionsResponse.data?.questions?.length) {
          setError("No questions available for this report.");
          setLoading(false);
          return;
        }

        setQuestions(questionsResponse.data.questions);

        const statesResponse = await axios.get(
          `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getpre`
        );

        const matchingNGO = statesResponse.data.find(
          (item) => item.NgoId === gettingStoredData
        );

        if (!matchingNGO) {
          setError("No state data found for this NGO.");
          setLoading(false);
          return;
        }

        const stateNames = matchingNGO.States;

        const initialStateExpanded = {};
        const initialStateStatus = {};
        const initialStateValidation = {};
        const initialStateEdited = {};

        stateNames.forEach((state) => {
          initialStateExpanded[state] = false;
          initialStateStatus[state] = "pending";
          initialStateValidation[state] = false;
          initialStateEdited[state] = false;
        });

        setStates(stateNames);
        setStateExpanded(initialStateExpanded);
        setStateStatus(initialStateStatus);
        setStateValidation(initialStateValidation);
        setStateEdited(initialStateEdited);
      } catch (error) {
        setError("Failed to load form data. Please try again later.");
      }
      setLoading(false);
    }

    if (gettingStoredData) fetchData();
  }, [gettingStoredData]);

  const handleStateExpand = (stateName) => {
    setStateExpanded((prev) => ({
      ...prev,
      [stateName]: !prev[stateName],
    }));
  };

  const handleChange = (stateName, field) => (event) => {
    const updatedFormData = {
      ...formData,
      [stateName]: {
        ...formData[stateName],
        [field]: event.target.value,
      },
    };
    setFormData(updatedFormData);

    const isStateValid = validateStateForm(
      stateName,
      updatedFormData[stateName]
    );
    setStateValidation((prev) => ({
      ...prev,
      [stateName]: isStateValid,
    }));

    setStateEdited((prev) => ({
      ...prev,
      [stateName]: true,
    }));
  };

  const handleSaveState = async (stateName) => {
    if (!validateStateForm(stateName, formData[stateName])) {
      setError(`Please fill all fields for ${stateName}`);
      return;
    }

    try {
      setStateStatus((prev) => ({
        ...prev,
        [stateName]: "submitted",
      }));
      setStateEdited((prev) => ({
        ...prev,
        [stateName]: false,
      }));
    } catch (error) {
      setError(`Failed to save data for ${stateName}`);
      setStateStatus((prev) => ({
        ...prev,
        [stateName]: "pending",
      }));
    }
  };

  const handleEditState = (stateName) => {
    setStateStatus((prev) => ({
      ...prev,
      [stateName]: "pending",
    }));
    setStateExpanded((prev) => ({
      ...prev,
      [stateName]: true,
    }));
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true); // Use isSubmitting instead of loading
    try {
      const submissionData = {
        month,
        year,
        id: gettingStoredData,
        state: formData,
      };


      await fetch(
        `${process.env.REACT_APP_NgoInformationApi}?type=SendMonthlyReport`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          mode: "no-cors",
          body: JSON.stringify(submissionData),
        }
      );

      setSnackbarMessage("Report submitted successfully!");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);



      // Add delay before navigation
      setTimeout(() => {
        navigate("/preliminary");
      }, 2000);
    } catch (error) {
      console.error("Submission error:", error);
      setError("Failed to submit report. Please try again.");

      setSnackbarMessage("Failed to submit report. Please try again.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      setIsSubmitting(false); // Reset submission state on error
    }
  };

  const getStatusChip = (stateName, status) => {
    if (status === 'submitted') {
      return (
        <Box display="flex" alignItems="center" ml={2}>
          <CheckCircleIcon sx={{ color: '#48A145', fontSize: 20 }} />
          <Typography
            color="#48A145"
            variant="body1"
            sx={{ ml: 1, cursor: 'pointer' }}
            onClick={() => handleEditState(stateName)}
          >
            Submitted
          </Typography>
        </Box>
      );
    }

    return (
      <Box display="flex" alignItems="center" ml={2}>
        <PendingIcon sx={{ color: '#FFAD33', fontSize: 20 }} />
        <Typography
          color="#FFAD33"
          variant="body1"
          sx={{ ml: 1 }}
        >
          Pending
        </Typography>
      </Box>
    );
  };

  const renderStateCard = (stateName) => (
    <Paper elevation={2} key={stateName}>
      <Card
        sx={{
          width: "100%",
          mb: 2,
          boxShadow: "none",
          borderRadius: "8px",
        }}
      >
        <CardHeader
          action={
            <IconButton
              onClick={() => handleStateExpand(stateName)}
              sx={{ ml: 1 }}
            >
              {stateExpanded[stateName] ? (
                <KeyboardArrowUpIcon />
              ) : (
                <KeyboardArrowDownIcon />
              )}
            </IconButton>
          }
          title={
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="h6">
                {stateName}
              </Typography>
              {getStatusChip(stateName, stateStatus[stateName])}
            </Box>
          }
        />
        <CardContent
          sx={{
            display: stateExpanded[stateName] ? "block" : "none",
            p: 3,
          }}
        >
          <Box sx={{ "& .MuiTextField-root": { mb: 3 } }}>
            {questions.map((question, index) => (
              <Box key={index}>
                <Typography
                  variant="subtitle1"
                  color="#4A4A4A"

                >
                  {question.question}
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  type={question.type === "number" ? "number" : "text"}
                  value={formData[stateName]?.[question.question] || ""}
                  onChange={handleChange(stateName, question.question)}
                  inputProps={
                    question.type === "number"
                      ? {
                        min: 0,
                        onKeyDown: (e) => {
                          if (e.key === '-' || e.key === 'e') {
                            e.preventDefault();
                          }
                        },
                      }
                      : {}
                  }
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      // Hide border when state is submitted and field is not focused
                      border: stateStatus[stateName] === 'submitted' ? 'none' : '1px solid rgba(0, 0, 0, 0.23)',
                    },
                    '& .MuiOutlinedInput-root': {
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        // Show border on hover only if not in submitted state
                        border: stateStatus[stateName] === 'submitted' ? 'none' : '1px solid rgba(0, 0, 0, 0.23)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        // Always show border when focused, regardless of state
                        border: '1px solid #5C785A',
                      },
                    },
                  }}
                />
              </Box>
            ))}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button
                variant="contained"
                onClick={() => handleSaveState(stateName)}
                // disabled={
                //   !stateEdited[stateName] || !stateValidation[stateName]
                // }
                disabled={
                  !stateValidation[stateName]
                }
                sx={{
                  bgcolor: "#453722",
                  color: "#ffffff",
                }}
              >
                {stateStatus[stateName] === "submitted"
                  ? "Update Data"
                  : "Save Data"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Paper>
  );

  if (loading)
    return (
      <Typography align="center" mt={4}>
        Loading...
      </Typography>
    );
  if (error)
    return (
      <Typography color="error" align="center" mt={4}>
        {error}
      </Typography>
    );
  if (!questions.length)
    return (
      <Typography align="center" mt={4}>
        Questions Unavailable...
      </Typography>
    );

  const allStatesSubmitted =
    states.length > 0 &&
    states.every((state) => stateStatus[state] === "submitted");

  return (
    <Container maxWidth={false}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        minHeight: '100vh'
      }} >
      <Paper
        elevation={0}
        sx={{
          width: "37rem",
          p: 4,
          borderRadius: 2,
          mx: 'auto',
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            mb: 4,
          }}
        >
          {month} {year} Report Data
        </Typography>

        {states.map((stateName) => renderStateCard(stateName))}

        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Button
            variant="contained"
            onClick={handleFinalSubmit}
            disabled={!allStatesSubmitted || isSubmitting}
            sx={{ position: "relative", minWidth: "120px", minHeight: "36px", mt: "1.5rem" }}
          >
            {isSubmitting ? (
              <>
                Submitting
                <CircularProgress
                  size={24}
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    marginTop: "-12px",
                    marginLeft: "-12px",
                    color: "white",
                  }}
                />
              </>
            ) : (
              "Submit Report"
            )}
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        sx={{ zIndex: 9999 }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          elevation={6}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MonthlyReportingForm;
