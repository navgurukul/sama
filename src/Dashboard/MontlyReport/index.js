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
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PreDestibution from "../Preliminary/PreDestibution";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WorkingProductively from "./assets/Working Productively 1 1.svg";

//  Generate 12 monthly dates starting from a given date

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

const MonthlyReport = () => {
  const NgoId = JSON.parse(localStorage.getItem("_AuthSama_"));
  const gettingStoredData = NgoId[0].NgoId;
  const { id } = useParams();
  const user = id ? id : NgoId[0].NgoId;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormCreated, setIsFormCreated] = useState(null);
  const [isDataAvailabel, setIsDataAvailabel] = useState(false);
  const [monthlyMetrixGet, setMonthlyMetrixGet] = useState([]);
  const [monthlyReportingDate, setMonthlyReportingDate] = useState(""); // Set your start date here
  const [currentDate, setCurrentDate] = useState(new Date());
  const monthlyDates = generateMonthlyDates(monthlyReportingDate);
  const [extraLoader, setExtraLoader] = useState(true);

  // this is to get the preliminary data from the sheet
  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://script.google.com/macros/s/AKfycbyVi1UX63tdxatOS4-21DytCvYvD2v9fdYH72JD5LHHe1P_qd3SpZqO88mbMM_PXgsJGQ/exec?type=getpre"
        ); // Replace with your API endpoint
        setMetrics(response.data); // Update according to API response structure
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const NgoData = metrics.filter((data) => data.NgoId === user);

  // Determine if the user is found
  const isUserFound = NgoData.length > 0;
  const preliminaryId = NgoData && NgoData[0] && NgoData[0].Id;

  //   this is to get the data for the spacific preliminary

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://script.google.com/macros/s/AKfycbyVi1UX63tdxatOS4-21DytCvYvD2v9fdYH72JD5LHHe1P_qd3SpZqO88mbMM_PXgsJGQ/exec?type=getpre&id=${preliminaryId}`
        ); // Replace with your API endpoint
        const dateComparedData = response.data.map((metric) => {
          const unitDate = new Date(metric.Unit); // Parse unit as date
          const currentDate = new Date(); // Current date and time
          const diffInMinutes = (currentDate - unitDate) / 60000; // Difference in minutes
          return { ...metric, disabled: diffInMinutes <= 10 }; // Add disabled flag
        });
        setMetrics(dateComparedData);
        // setMetrics(response.data); // Update according to API response structure
        setLoading(false);

        if (!monthlyReportingDate && dateComparedData.length > 0) {
          setMonthlyReportingDate(dateComparedData[0]?.Unit);
        }
      } catch (err) {
        console.error(err);
        setError(true);
        setLoading(false);
      }
    };
    fetchData();
  }, [preliminaryId]);

  useEffect(() => {
    // Set the date once
    setCurrentDate(new Date());
  }, []);

  // get request for the existing monthly reports.
  useEffect(() => {
    // Fetch data when the component mounts
    fetch(
      `https://script.google.com/macros/s/AKfycby4zd74Zl-sQYN5b8940ZgOVQEcb5Jam-SNayOzevsrtQmH4nhHFLu936Nwr0-uZVZh/exec?type=GetMonthlyReport&id=${user}`
    )
      .then((response) => response.json())
      .then((result) => {
        if (result.status === "success") {
          const rawData = result.data;
          const parsedData = Array.isArray(rawData)
            ? rawData
            : JSON.parse(rawData);

          // Filter out empty values and transform strings into objects
          const transformedData = parsedData
            .filter((item) => item.trim() !== "")
            .map((item) => {
              return item.split(",").reduce((acc, pair) => {
                const [key, value] = pair.split(":").map((str) => str.trim());
                acc[key] = value; // Create key-value pairs
                return acc;
              }, {});
            });
          setMonthlyMetrixGet(transformedData);
          setIsDataAvailabel(true);
          setExtraLoader(false)
        } else {
          console.error("Error fetching data:", result.message);
          setExtraLoader(false)
        }
      })
      .catch((error) => console.error("API error:", error));
  }, [user]);

  const handleCardClick = (monthData, monthName, yearName) => {
    navigate("/monthly-report", {
      state: { monthlyReportData: monthData, monthName, yearName },
    });
  };

  const API_URL = `https://script.google.com/macros/s/AKfycbxTda3e4lONdLRT13N2lVj7Z-P0q-ITSe1mvh-n9x9BG8wZo9nvnT7HXytpscigB0fm/exec?type=Monthly&&id=${id}`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(API_URL);

        // Assuming the API returns { success: true, exists: true/false }
        if (response.data) {
          setIsFormCreated(response.data.success);
        } else {
          throw new Error("Invalid response from server");
        }
      } catch (err) {
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleButtonClick = () => {
    if (isFormCreated) {
      navigate(`/edit-form/${id}`);
    } else {
      navigate(`/monthly-reporting/${id}`);
    }
  };

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

  return isDataAvailabel ? (
    <>
      {NgoId[0]?.role[0] === "admin" && (
        <>
          <Typography variant="h6" gutterBottom sx={{ color: "#4A4A4A" }}>
            Monthly Report
          </Typography>
          <Grid container spacing={3} mb={8}>
            {monthlyDates.map((report, index) => {
              const isEnabled = currentDate >= report; // Check if current date has passed the card's date
              const monthName = report.toLocaleString("default", {
                month: "long",
              }); // Get full month name
              const year = report.getFullYear(); // Get the year

              return (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  {monthlyMetrixGet[index] ? (
                    <Card
                      style={{ height: "100%" }}
                      sx={{
                        backgroundColor: !isEnabled && "#E0E0E0",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        handleCardClick(
                          monthlyMetrixGet[index],
                          monthName,
                          year
                        )
                      }
                    >
                      <CardContent>
                        <Typography
                          variant="subtitle1"
                          mt={1}
                          ml={2}
                          sx={{ color: "#828282" }}
                        >
                          {monthName} {year}
                        </Typography>
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
                      </CardContent>
                    </Card>
                  ) : (
                    ""
                  )}
                </Grid>
              );
            })}
          </Grid>
        </>
      )}
    </>
  ) : (
    <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
      {/* <h1>Monthly Report</h1> */}
      {loading ? (
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
      ) : error ? (
        <Alert severity="error">{error}</Alert> // Display error if any
      ) : (
        <>
          {isFormCreated ? (
            <p>Click the button below to edit your monthly report form</p>
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
              <img src={WorkingProductively} height="160" width="160" />
              <Typography variant="body1">
                Please create a monthly form specific to this NGO.
              </Typography>
            </Box>
          )}

          <Button
            variant="contained"
            sx={!isFormCreated && { display: "block", margin: "0 auto" }}
            onClick={handleButtonClick}
          >
            {isFormCreated ? "Edit Form" : "Create Form"}
          </Button>
        </>
      )}
    </Container>
  );
};

export default MonthlyReport;
