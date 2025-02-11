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
} from "@mui/material";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

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

  const location = useLocation();
  const navigate = useNavigate();
  const { month, year } = location.state || {};
  const NgoId = JSON.parse(localStorage.getItem("_AuthSama_"));
  const { id } = useParams();
  const gettingStoredData = id ? id : NgoId[0].NgoId;

  // Validate form data for a specific state
  const validateStateForm = (stateName, stateData) => {
    if (!questions.length) return false;
    return questions.every(
      question =>
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

        const matchingNGO = statesResponse.data.find(item => item.NgoId === gettingStoredData);

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

        stateNames.forEach(state => {
          initialStateExpanded[state] = false;
          initialStateStatus[state] = 'pending';
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
    setStateExpanded(prev => ({
      ...prev,
      [stateName]: !prev[stateName]
    }));
  };

  const handleChange = (stateName, field) => (event) => {
    const updatedFormData = {
      ...formData,
      [stateName]: {
        ...formData[stateName],
        [field]: event.target.value
      }
    };
    setFormData(updatedFormData);

    const isStateValid = validateStateForm(stateName, updatedFormData[stateName]);
    setStateValidation(prev => ({
      ...prev,
      [stateName]: isStateValid
    }));

    setStateEdited(prev => ({
      ...prev,
      [stateName]: true
    }));
  };

  const handleSaveState = async (stateName) => {
    if (!validateStateForm(stateName, formData[stateName])) {
      setError(`Please fill all fields for ${stateName}`);
      return;
    }

    try {
      setStateStatus(prev => ({
        ...prev,
        [stateName]: 'submitted'
      }));
      setStateEdited(prev => ({
        ...prev,
        [stateName]: false
      }));
    } catch (error) {
      setError(`Failed to save data for ${stateName}`);
      setStateStatus(prev => ({
        ...prev,
        [stateName]: 'pending'
      }));
    }
  };

  const handleEditState = (stateName) => {
    setStateStatus(prev => ({
      ...prev,
      [stateName]: 'pending'
    }));
    setStateExpanded(prev => ({
      ...prev,
      [stateName]: true
    }));
  };

  const handleFinalSubmit = async () => {
    try {
      const submissionData = {
        month,
        year,
        id: gettingStoredData,
        state: formData,
        type: "SendMonthlyReport"
      };

      const response = await fetch(
        `${process.env.REACT_APP_NgoInformationApi}?type=SendMonthlyReport`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "no-cors",
          body: JSON.stringify(submissionData),
        }
      );

      if (response.ok) {
        navigate("/preliminary");
      } else {
        throw new Error("Submission failed");
      }
    } catch (error) {
      setError("Failed to submit report. Please try again.");
    }
  };

  const getStatusChip = (stateName, status) => {
    const styles = {
      pending: { bgcolor: '#FFF3E0', color: '#FF9800' },
      submitted: { bgcolor: '#E8F5E9', color: '#4CAF50' }
    };

    return (
      <Chip
        label={status}
        size="small"
        sx={{
          ...styles[status],
          height: '24px',
          fontSize: '0.75rem',
          fontWeight: 500,
          cursor: status === 'submitted' ? 'pointer' : 'default',
          ml: 2
        }}
        onClick={status === 'submitted' ? () => handleEditState(stateName) : undefined}
      />
    );
  };

  const renderStateCard = (stateName) => (
    <Paper elevation={2} key={stateName}>
      <Card
        sx={{
          width: '100%',
          mb: 2,
          boxShadow: 'none',
          borderRadius: '8px'
        }}
      >
        <CardHeader
          action={
            <IconButton
              onClick={() => handleStateExpand(stateName)}
              sx={{ ml: 1 }}
            >
              {stateExpanded[stateName] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          }
          title={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography sx={{ fontWeight: 600, fontFamily: "Raleway" }}>
                {stateName}
              </Typography>
              {getStatusChip(stateName, stateStatus[stateName])}
            </Box>
          }
          sx={{ borderBottom: stateExpanded[stateName] ? '1px solid #E0E0E0' : 'none' }}
        />
        <CardContent
          sx={{
            display: stateExpanded[stateName] ? 'block' : 'none',
            p: 3
          }}
        >
          <Box sx={{ '& .MuiTextField-root': { mb: 3 } }}>
            {questions.map((question, index) => (
              <Box key={index}>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 1,
                    color: "#4A4A4A",
                    fontSize: "1.125rem",
                    fontFamily: "Raleway",
                    fontWeight: "700",
                    lineHeight: "170%"
                  }}
                >
                  {question.question}
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  type={question.type === "number" ? "number" : "text"}
                  value={formData[stateName]?.[question.question] || ""}
                  onChange={handleChange(stateName, question.question)}
                  // disabled={stateStatus[stateName] === 'submitted' && !stateEdited[stateName]}
                />
              </Box>
            ))}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button
                variant="contained"
                onClick={() => handleSaveState(stateName)}
                disabled={!stateEdited[stateName] || !stateValidation[stateName]}
              >
                {stateStatus[stateName] === 'submitted' ? 'Update Data' : 'Save Data'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Paper>
  );

  if (loading) return <Typography align="center" mt={4}>Loading...</Typography>;
  if (error) return <Typography color="error" align="center" mt={4}>{error}</Typography>;
  if (!questions.length) return <Typography align="center" mt={4}>Questions Unavailable...</Typography>;

  const allStatesSubmitted = states.length > 0 &&
    states.every(state => stateStatus[state] === 'submitted');

  return (
    <Container maxWidth="md">
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            mb: 4,
            fontFamily: "Raleway",
            fontWeight: "700"
          }}
        >
          {month} {year} Report Data
        </Typography>

        {states.map(stateName => renderStateCard(stateName))}

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={handleFinalSubmit}
            disabled={!allStatesSubmitted}
          >
            Submit Report
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default MonthlyReportingForm;
