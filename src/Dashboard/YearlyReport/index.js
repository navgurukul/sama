import React, { useState, useEffect } from "react";
import {
  Container,
  Button,
  CircularProgress,
  Alert,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Survey from "./assets/Survey 1.svg";

// Helper functions
const parseDate = (dateString) => {
  // Handle ISO format dates (e.g., "2025-01-31T19:51:34.000Z")
  if (dateString.includes("T")) {
    return new Date(dateString);
  }

  // Handle format "DD/MM/YYYY, HH:mm:ss"
  const [datePart, timePart] = dateString.split(", ");
  if (!datePart || !timePart) return null;

  const [day, month, year] = datePart.split("/");
  if (!day || !month || !year) return null;

  // JavaScript months are 0-based
  return new Date(year, parseInt(month) - 1, day);
};

const generateMonthlyDates = (startDate) => {
  if (!startDate) return [];

  const parsedStartDate = parseDate(startDate);
  if (!parsedStartDate || isNaN(parsedStartDate.getTime())) {
    console.error("Invalid start date:", startDate);
    return [];
  }

  const dates = [];
  for (let i = 0; i < 12; i++) {
    const newDate = new Date(parsedStartDate);
    newDate.setMonth(parsedStartDate.getMonth() + i + 1); // Start from next month
    dates.push(newDate);
  }

  return dates;
};

const generateYearlyDates = (startDate) => {
  if (!startDate) return [];

  const parsedStartDate = parseDate(startDate);
  if (!parsedStartDate || isNaN(parsedStartDate.getTime())) {
    console.error("Invalid start date:", startDate);
    return [];
  }

  const yearlyDate = new Date(parsedStartDate);
  yearlyDate.setFullYear(yearlyDate.getFullYear() + 1);
  return [yearlyDate];
};

const formatDate = (date) => {
  if (!date || isNaN(date.getTime())) return "";

  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "long" });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

const formatDateCurrent = (input) => {
  // Create a Date object directly from the ISO 8601 input
  const date = new Date(input);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }

  // Format the month and year
  const options = { month: "long", year: "numeric" };
  return date.toLocaleDateString("en-US", options);
};

const YearlyReport = () => {
  const NgoId = JSON.parse(localStorage.getItem("_AuthSama_"));
  const { id } = useParams();
  const user = id || NgoId[0]?.NgoId;
  const navigate = useNavigate();

  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormCreated, setIsFormCreated] = useState(false);
  const [YearlyReportingDate, setYearlyReportingDate] = useState("");
  const [metrics, setMetrics] = useState([]);
  const [yearlyMetrixGet, setYearlyMetrixGet] = useState([]);
  const [currentDate] = useState(new Date());
  const [isDataAvailable, setIsDataAvailable] = useState(false);
  const [extraLoader, setExtraLoader] = useState(true);

  const yearlyDates =
    YearlyReportingDate && generateYearlyDates(YearlyReportingDate);
  const formattedstartDate = formatDateCurrent(YearlyReportingDate);

  // Fetch preliminary data
  useEffect(() => {
    const fetchPreliminaryData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getpre`
          // "https://script.google.com/macros/s/AKfycbyVi1UX63tdxatOS4-21DytCvYvD2v9fdYH72JD5LHHe1P_qd3SpZqO88mbMM_PXgsJGQ/exec?type=getpre"
        );
        setMetrics(response.data);
      } catch (err) {
        console.error("Error fetching preliminary data:", err);
        setError("Failed to fetch preliminary data.");
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
          `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getpre&id=${preliminaryId}`
          // `https://script.google.com/macros/s/AKfycbyVi1UX63tdxatOS4-21DytCvYvD2v9fdYH72JD5LHHe1P_qd3SpZqO88mbMM_PXgsJGQ/exec?type=getpre&id=${preliminaryId}`
        );
        const updatedMetrics = response.data.map((metric) => {
          const unitDate = new Date(metric.Unit);
          const diffInMinutes = (currentDate - unitDate) / 60000;
          return { ...metric, disabled: diffInMinutes <= 10 };
        });
        setMetrics(updatedMetrics);

        if (!YearlyReportingDate && updatedMetrics.length > 0) {
          setYearlyReportingDate(updatedMetrics[0]?.Unit);
        }
      } catch (err) {
        console.error("Error fetching preliminary details:", err);
        setError("Failed to fetch detailed preliminary data.");
      } finally {
        setLoading(false);
      }
    };
    fetchPreliminaryDetails();
  }, [preliminaryId, YearlyReportingDate]);

  // Fetch existing yearly reports
  useEffect(() => {
    if (user) {
      axios
        .get(
          `${process.env.REACT_APP_NgoInformationApi}?type=GetYearlyReport&ngoId=${user}`
        )
        .then((response) => {
          setYearlyMetrixGet(response.data.data || []);
          setIsDataAvailable(response.data.success);
          setExtraLoader(false);
        })
        .catch((err) => {
          console.error("Error fetching yearly reports:", err);
          setError("Failed to fetch yearly reports.");
          setExtraLoader(false);
        });
    }
  }, [user]);

  // Handle navigation
  const handleCardClick = (data, monthCurrent, year, formattedstartDate) => {
    navigate("/yearly-report", {
      state: {
        yearlyReportData: data,
        monthCurrent,
        year,
        formattedstartDate,
      },
    });
  };

  // API for checking form creation
  useEffect(() => {
    const checkFormCreation = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_NgoInformationApi}?type=Yearly&id=${id}`
        );
        setIsFormCreated(response.data?.status === "success");
      } catch (err) {
        console.error("Error checking form creation:", err);
        setError("Failed to check form creation.");
      } finally {
        setLoading(false);
      }
    };
    checkFormCreation();
  }, [id]);

  if (loading || extraLoader) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return isDataAvailable ? (
    <>
      <Container Container maxWidth="md">
        <Typography variant="h6" gutterBottom sx={{ color: "#4A4A4A" }}>
          Yearly Report
        </Typography>
        {!yearlyDates.length > 0 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "200px",
            }}
          >
            <CircularProgress />
          </Box>
        )}
        <Grid container spacing={3}>
          {yearlyDates &&
            yearlyDates?.map((report, index) => {
              const isEnabled = currentDate >= report;
              const monthName = report.toLocaleString("default", {
                month: "long",
              });
              const year = report.getFullYear();

              return (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card
                    sx={{
                      boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)",
                      borderRadius: "8px",
                      cursor: "pointer",
                      "&:hover": {
                        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                      },
                    }}
                    onClick={() =>
                      isEnabled &&
                      handleCardClick(
                        yearlyMetrixGet,
                        monthName,
                        year,
                        formattedstartDate
                      )
                    }
                  >
                    <CardContent>
                      <Typography variant="subtitle1">
                        {monthName} {year}
                      </Typography>
                      {isEnabled && (
                        <Box display="flex" alignItems="center" mt={1} ml={2}>
                          <CheckCircleIcon color="success" />
                          <Typography
                            color="#48A145"
                            variant="subtitle1"
                            ml={1}
                          >
                            Submitted
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
        </Grid>
      </Container>
    </>
  ) : (
    <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
      {/* <h1>Yearly Report</h1> */}
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "50vh",
          }}
        >
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          {isFormCreated ? (
            <p>Click the button below to edit your Yearly report form</p>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                justifyContent: "center",
                alignItems: "center",
                pb: 2,
              }}
            >
              <img src={Survey} height="160" width="160" />
              <Typography variant="body1">
                Please create a yearly form specific to this NGO.
              </Typography>
            </Box>
          )}
          <Button
            variant="contained"
            sx={!isFormCreated && { display: "block", margin: "0 auto" }}
            onClick={() =>
              navigate(
                isFormCreated
                  ? `/edit-yearly-form/${id}`
                  : `/yearly-reporting/${id}`
              )
            }
          >
            {isFormCreated ? "Edit Form" : "Create Form"}
          </Button>
        </>
      )}
    </Container>
  );
};

export default YearlyReport;
