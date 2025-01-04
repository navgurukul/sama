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
const generateYearlyDates = (startDate) => {
  if (!startDate) return [];
  const validDate = convertToValidDate(startDate);
  if (isNaN(validDate)) {
    console.error("Invalid date format");
    return [];
  }
  const yearlyDate = new Date(validDate);
  yearlyDate.setFullYear(yearlyDate.getFullYear() + 1);
  return [yearlyDate];
};

const convertToValidDate = (input) => {
  try {
    const [date, time] = input.split(", ");
    const [day, month, year] = date.split("/");
    return new Date(`${year}-${month}-${day}T${time}`);
  } catch (err) {
    console.error("Error converting date:", err);
    return NaN;
  }
};

const formatDateCurrent = (input) => {
  // Parse the input date string
  const [datePart] = input.split(","); // "24/11/2023"
  const [day, month, year] = datePart.split("/");

  // Create a Date object (Note: months in Date are 0-indexed)
  const date = new Date(`${year}-${month}-${day}`);

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

  const yearlyDates =
    YearlyReportingDate && generateYearlyDates(YearlyReportingDate);
  const formattedstartDate = formatDateCurrent(YearlyReportingDate);

  // Fetch preliminary data
  useEffect(() => {
    const fetchPreliminaryData = async () => {
      try {
        const response = await axios.get(
          "https://script.google.com/macros/s/AKfycbyVi1UX63tdxatOS4-21DytCvYvD2v9fdYH72JD5LHHe1P_qd3SpZqO88mbMM_PXgsJGQ/exec?type=getpre"
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
          `https://script.google.com/macros/s/AKfycbyVi1UX63tdxatOS4-21DytCvYvD2v9fdYH72JD5LHHe1P_qd3SpZqO88mbMM_PXgsJGQ/exec?type=getpre&id=${preliminaryId}`
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
          `https://script.google.com/macros/s/AKfycbwnIYg5R0CIPmTNfy-XDJJoVOwEH34LlDlomCD3sCeMA4mnzt-vLqITkXuaj_FzuO75/exec?type=GetYearlyReport&ngoId=${user}`
        )
        .then((response) => {
          setYearlyMetrixGet(response.data.data || []);
          setIsDataAvailable(response.data.success);
        })
        .catch((err) => {
          console.error("Error fetching yearly reports:", err);
          setError("Failed to fetch yearly reports.");
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
          `https://script.google.com/macros/s/AKfycbzv3DzoZThej1kzBT6x3IqEJkQT1r9xUClPUbb3LA62QJ-43DUxhUlZzrC7JABuABlb/exec?type=Yearly&id=${id}`
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

  return isDataAvailable ? (
    <>
      <Typography variant="h6" gutterBottom>
        Yearly Report
      </Typography>
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
                    backgroundColor: !isEnabled && "#E0E0E0",
                    cursor: isEnabled ? "pointer" : "default",
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
                      <Box display="flex" alignItems="center">
                        <CheckCircleIcon color="success" />
                        <Typography color="green">Submitted</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
      </Grid>
    </>
  ) : (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <h1>Yearly Report</h1>
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
