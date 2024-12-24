import React, { useState, useEffect } from 'react';
import { Container, Button, CircularProgress, Alert, Typography, Grid, Card, CardContent, Box } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Helper functions
const generateMonthlyDates = (startDate) => {
  const validDate = convertToValidDate(startDate);
  if (isNaN(validDate)) {
    console.error("Invalid date format");
    return [];
  }
  const dates = [];
  for (let i = 0; i < 12; i++) {
    const newDate = new Date(validDate);
    newDate.setMonth(newDate.getMonth() + i);
    dates.push(newDate);
  }
  return dates;
};

const convertToValidDate = (input) => {
  const [date, time] = input.split(", ");
  const [day, month, year] = date.split("/");
  return new Date(`${year}-${month}-${day}T${time}`);
};

const YearlyReport = () => {
  const NgoId = JSON.parse(localStorage.getItem('_AuthSama_'));
  const { id } = useParams();
  const user = id || NgoId[0]?.NgoId;
  const navigate = useNavigate();

  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormCreated, setIsFormCreated] = useState(null);
  const [isDataAvailable, setIsDataAvailable] = useState(false);
  const [metrics, setMetrics] = useState([]);
  const [monthlyMetrics, setMonthlyMetrics] = useState([]);
  const [monthlyReportingDate, setMonthlyReportingDate] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthlyDates = generateMonthlyDates(monthlyReportingDate);

  // Fetch preliminary data
  useEffect(() => {
    const fetchPreliminaryData = async () => {
      try {
        const response = await axios.get(
          "https://script.google.com/macros/s/AKfycbyVi1UX63tdxatOS4-21DytCvYvD2v9fdYH72JD5LHHe1P_qd3SpZqO88mbMM_PXgsJGQ/exec?type=getpre"
        );
        setMetrics(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPreliminaryData();
  }, []);

  const NgoData = metrics.filter((data) => data.NgoId === user);
  const preliminaryId = NgoData[0]?.Id;

  // Fetch specific preliminary data
  useEffect(() => {
    if (!preliminaryId) return;

    const fetchPreliminaryDetails = async () => {
      try {
        const response = await axios.get(
          `https://script.google.com/macros/s/AKfycbyVi1UX63tdxatOS4-21DytCvYvD2v9fdYH72JD5LHHe1P_qd3SpZqO88mbMM_PXgsJGQ/exec?type=getpre&id=${preliminaryId}`
        );
        const dataWithDisabledFlag = response.data.map((metric) => {
          const unitDate = new Date(metric.Unit);
          const diffInMinutes = (currentDate - unitDate) / 60000;
          return { ...metric, disabled: diffInMinutes <= 10 };
        });
        setMetrics(dataWithDisabledFlag);

        if (!monthlyReportingDate && dataWithDisabledFlag.length > 0) {
          setMonthlyReportingDate(dataWithDisabledFlag[0]?.Unit);
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchPreliminaryDetails();
  }, [preliminaryId, monthlyReportingDate]);

  // Fetch existing monthly reports
  useEffect(() => {
    const fetchMonthlyReports = async () => {
      try {
        const response = await fetch(
          `https://script.google.com/macros/s/AKfycbzv3DzoZThej1kzBT6x3IqEJkQT1r9xUClPUbb3LA62QJ-43DUxhUlZzrC7JABuABlb/exec?type=GetYearlyReport&id=${user}`
        );
        const result = await response.json();

        if (result.status === 'success') {
          const rawData = result.data;
          const transformedData = Array.isArray(rawData)
            ? rawData
            : JSON.parse(rawData).filter((item) => item.trim() !== '');
          setMonthlyMetrics(transformedData);
          setIsDataAvailable(true);
        }
      } catch (error) {
        console.error('API error:', error);
      }
    };
    fetchMonthlyReports();
  }, [user]);

  // Handle navigation
  const handleCardClick = (monthData, monthName, yearName) => {
    navigate('/monthly-report', { state: { monthlyReportData: monthData, monthName, yearName } });
  };

  // API for checking form creation
  const API_URL = `https://script.google.com/macros/s/AKfycbzv3DzoZThej1kzBT6x3IqEJkQT1r9xUClPUbb3LA62QJ-43DUxhUlZzrC7JABuABlb/exec?type=Yearly&id=${id}`;
  useEffect(() => {
    const checkFormCreation = async () => {
      try {
        const response = await axios.get(API_URL);
        console.log(response.data, "response.data");
        setIsFormCreated(response.data?.status === 'success');
      } catch (err) {
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    checkFormCreation();
  }, [id]);
  console.log(isFormCreated,"isFormCreated");

  // Render
  return (
    isDataAvailable ? (
      <>
        {NgoId[0]?.role[0] === "admin" && (
          <>
            <Typography variant="h6" gutterBottom sx={{ color: "#4A4A4A" }}>
              Yearly Report
            </Typography>
            <Grid container spacing={3} mb={8}>
              {monthlyDates.map((report, index) => {
                const isEnabled = currentDate >= report;
                const monthName = report.toLocaleString("default", { month: "long" });
                const year = report.getFullYear();

                return (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    {monthlyMetrics[index] && (
                      <Card
                        style={{ height: "100%" }}
                        sx={{ backgroundColor: !isEnabled && "#E0E0E0", cursor: "pointer" }}
                        onClick={() => handleCardClick(monthlyMetrics[index], monthName, year)}
                      >
                        <CardContent>
                          <Typography variant="subtitle1" mt={1} ml={2} sx={{ color: "#828282" }}>
                            {monthName} {year}
                          </Typography>
                          <Box display="flex" alignItems="center" mt={1} ml={2}>
                            <CheckCircleIcon color="success" />
                            <Typography color="#48A145" variant="subtitle1" ml={1}>
                              Submitted
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    )}
                  </Grid>
                );
              })}
            </Grid>
          </>
        )}
      </>
    ) : (
      <Container maxWidth="md" sx={{ mt: 5 }}>
        <h1>Yearly Report</h1>
        <p>Click the button below to {isFormCreated ? "edit" : "create"} your Yearly report form</p>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Button
            variant="contained"
            onClick={() =>
              navigate(isFormCreated ? `/edit-yearly-form/${id}` : `/yearly-reporting/${id}`)
            }
          >
            {isFormCreated ? "Edit Form" : "Create Form"}
          </Button>

        )}
      </Container>
    )
  );
};

export default YearlyReport;
