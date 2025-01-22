import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  Paper,
  CircularProgress,
  Divider,
  IconButton,
} from "@mui/material";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Container } from "@mui/system";
import { classes } from "./style";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import UploadIcon from "@mui/icons-material/UploadFile";
import HistoryStatusPopup from "./HistoryStatusPopup";


const BeneficiaryProfile = () => {
  const NgoId = JSON.parse(localStorage.getItem("_AuthSama_"));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusHistory, setStatusHistory] = useState([]);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const [openPopup, setOpenPopup] = useState(false);
  const [statusId, setStatusId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [selectedMonthYear, setSelectedMonthYear] = useState("");

  const user = Array.isArray(NgoId) && NgoId.length > 0 ? NgoId[0] : null;

  // const API_URL = `https://script.google.com/macros/s/AKfycbxDcI2092h6NLFcV2yvJN-2NaHVp1jc9_T5qs0ntLDcltIdRRZw5nfHiZTT9prPLQsf2g/exec?type=getUserData&userIdQuery=${id}`;
  const API_URL =  `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getUserData&userIdQuery=${id}`;
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const response = await axios.get(API_URL);
        setStatusId(response.data[0].Ngo);
        if (!response.data || !response.data[0]) {
          throw new Error("No user data found");
        }

        setData(response.data[0]);
        setUserEmail(response.data[0].email);
        const email = response.data[0].email;

        // Fetch status history
        const userStatusHistory = await fetch(
          `${process.env.REACT_APP_NgoInformationApi}?email=${email}&type=getMonthlyStatusUpdate`
        );

        if (!userStatusHistory.ok) {
          throw new Error("Failed to fetch status history");
        }

        const statusHistoryData = await userStatusHistory.json();

        // Validate and set status history data
        if (!statusHistoryData || !statusHistoryData.monthly_data) {
          setStatusHistory([]);
          console.warn("No status history data available");
        } else {
          // Sort status history by date (newest first)
          const sortedHistory = statusHistoryData.monthly_data.sort((a, b) => {
            // Extract year and month from month_year string
            const [aMonth, aYear] = a.month_year.split(" ");
            const [bMonth, bYear] = b.month_year.split(" ");

            // Compare years first
            if (aYear !== bYear) {
              return parseInt(bYear) - parseInt(aYear);
            }

            console.log(statusHistoryData, " statusHistoryData ");

            // If years are same, compare months
            const months = [
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
            ];
            return months.indexOf(bMonth) - months.indexOf(aMonth);
          });

          setStatusHistory(sortedHistory);
        }
      } catch (err) {
        console.error("Error in data fetching:", err);
        if (err.response) {
          // Handle specific API errors
          setError(
            `Failed to load data: ${
              err.response.data.message || "Unknown error"
            }`
          );
        } else if (err.request) {
          // Handle network errors
          setError("Network error: Please check your connection");
        } else {
          // Handle other errors
          setError(`Error: ${err.message || "Something went wrong"}`);
        }
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have an ID
    if (id) {
      fetchData();
    } else {
      setError("No user ID provided");
      setLoading(false);
    }

    // Cleanup function
    return () => {
      setData(null);
      setStatusHistory([]);
      setError(null);
    };
  }, [id, API_URL]);



  // In BeneficiaryProfile.jsx, replace the current handlePopupOpen with:
  const handlePopupOpen = (monthYear) => {
    setOpenPopup(true);
    setSelectedMonthYear(monthYear); // Add this state variable
  };

  const handlePopupClose = () => {
    setOpenPopup(false);
  };

  if (loading)
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
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container
      maxWidth="md"
      sx={{ padding: "24px", marginTop: "64px", marginBottom: "64px" }}
    >
      {/* Header */}
      <Typography variant="h5" align="center" sx={{ marginBottom: 4 }}>
        Beneficiary Profile
      </Typography>

      {/* Beneficiary Profile Data */}
      <Paper
        elevation={1}
        sx={{ padding: "32px", backgroundColor: "primary.light" }}
      >
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" mb={3} color="primary.main">
              {data.name}
            </Typography>

            {/* Beneficiary ID */}
            <Typography variant="subtitle1" sx={classes.BeneficiaryData}>
              Beneficiary ID
            </Typography>
            <Typography variant="body1" marginBottom="16px">
              {data.ID}
            </Typography>
            {/* Additional Fields */}
            <Typography variant="subtitle1" sx={classes.BeneficiaryData}>
              Email
            </Typography>
            <Typography variant="body1" marginBottom="16px">
              {data.email}
            </Typography>

            <Typography variant="subtitle1" sx={classes.BeneficiaryData}>
              Contact Number
            </Typography>
            <Typography variant="body1" marginBottom="16px">
              {data["contact number"]}
            </Typography>

            <Typography variant="subtitle1" sx={classes.BeneficiaryData}>
              Date of Birth
            </Typography>
            <Typography variant="body1" marginBottom="16px">
              {new Date(data["Date Of Birth"]).toLocaleDateString()}
            </Typography>

            <Typography variant="subtitle1" sx={classes.BeneficiaryData}>
              ID Proof Type
            </Typography>
            <Typography variant="body1" marginBottom="16px">
              {data["ID Proof type"]}
            </Typography>

            <Typography variant="subtitle1" sx={classes.BeneficiaryData}>
              ID Proof Number
            </Typography>
            <Typography variant="body1" marginBottom="16px">
              {data["ID Proof number"]}
            </Typography>

            <Typography variant="subtitle1" sx={classes.BeneficiaryData}>
              Qualification
            </Typography>
            <Typography variant="body1" marginBottom="16px">
              {data.Qualification}
            </Typography>

            <Typography variant="subtitle1" sx={classes.BeneficiaryData}>
              Occupation
            </Typography>
            <Typography variant="body1" marginBottom="16px">
              {data.Occupation}
            </Typography>
            {NgoId[0].role.includes("admin") && (
              <Button
                variant="outlined"
                color="primary"
                href={`/edit-user/${id}`}
                sx={{ marginTop: 2 }}
              >
                Edit Beneficiary Profile
              </Button>
            )}
          </Grid>

          <Grid item xs={12} sm={6} mt={7}>
            <Typography variant="subtitle1" sx={classes.BeneficiaryData}>
              Use Case
            </Typography>
            <Typography variant="body1" marginBottom="16px">
              {data["Use case"]}
            </Typography>

            <Typography variant="subtitle1" sx={classes.BeneficiaryData}>
              Number of Family Members
            </Typography>
            <Typography variant="body1" marginBottom="16px">
              {data["Number of Family members(who might use the laptop)"]}
            </Typography>

            <Typography variant="subtitle1" sx={classes.BeneficiaryData}>
              Status
            </Typography>
            <Typography variant="body1" marginBottom="16px">
              {data.status}
            </Typography>

            <Typography variant="subtitle1" sx={classes.BeneficiaryData}>
              Laptop Assigned
            </Typography>
            <Typography variant="body1" marginBottom="16px">
              {data["Laptop Assigned"] ? "Yes" : "No"}
            </Typography>

            <Typography variant="subtitle1" sx={classes.BeneficiaryData}>
              Family Address
            </Typography>
            <Typography variant="body1" marginBottom="16px">
              {data.Address}
            </Typography>

            <Typography variant="subtitle1" sx={classes.BeneficiaryData}>
              Address State
            </Typography>
            <Typography variant="body1" marginBottom="16px">
              {data["Address State"]}
            </Typography>

            <Typography variant="subtitle1" sx={classes.BeneficiaryData}>
              Family Annual Income
            </Typography>
            <Typography variant="body1" marginBottom="16px">
              {data["Family Annual Income"]}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={4} sx={{ marginTop: 4 }}>
        <Grid item xs={12} sm={6}>
          <Typography variant="h6" gutterBottom>
            ID Proof
          </Typography>
          <Paper
            elevation={1}
            sx={{
              height: "100px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 2,
              cursor: "pointer",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
            }}
            onClick={() =>
              data["ID Link"] && window.open(data["ID Link"], "_blank")
            }
          >
            {data["ID Link"] ? (
              <Typography
                variant="body1"
                color="primary"
                sx={{
                  textDecoration: "underline",
                  textAlign: "center",
                }}
              >
                Click to view ID Proof Document
              </Typography>
            ) : (
              <Typography variant="subtitle1" color="textSecondary">
                ID Proof not available
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="h6" gutterBottom>
            Income Certificate
          </Typography>
          <Paper
            elevation={1}
            sx={{
              height: "100px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 2,
              cursor: "pointer",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
            }}
            onClick={() =>
              data["Income Certificate Link"] &&
              window.open(data["Income Certificate Link"], "_blank")
            }
          >
            {data["Income Certificate Link"] ? (
              <Typography
                variant="body1"
                color="primary"
                sx={{
                  textDecoration: "underline",
                  textAlign: "center",
                }}
              >
                Click to view Income Certificate Document
              </Typography>
            ) : (
              <Typography variant="subtitle1" color="textSecondary">
                Income Certificate not available
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Status History Section */}
      {statusHistory && statusHistory.length > 0 ? (
        <>
          <Typography variant="h6" gutterBottom sx={{ mt: 6, mb: 3 }}>
            Status History
          </Typography>
          {/* <Divider sx={{ mb: 4 }} /> */}

          <Grid
            container
            spacing={3}
            sx={{
              justifyContent: "flex-start", // Align items to start
              width: "100%",
            }}
          >
            {statusHistory.map((status, index) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={3}
                key={index}
                sx={{
                  display: "flex",
                  justifyContent: "flex-start", // Align grid items to start
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    width: "100%", // Make paper take full width of grid item
                    backgroundColor: "#f8f9fa", // Default background color
                    minHeight: "100px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    textAlign: "left", // Align text to left
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{
                      fontWeight: 500,
                      // color: "primary.main",
                      textAlign: "left", // Ensure month-year is left-aligned
                    }}
                  >
                    {status.month_year}
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      display: "flex",
                      alignItems: "center", // Align icon and text
                      color: "text.primary",
                      textAlign: "left", // Ensure status is left-aligned
                    }}
                  >
                    {status.status_name === "No Change" ? (
                      user && user.role && user.role.includes("admin") ? (
                        <>
                          <IconButton
                            onClick={() => handlePopupOpen(status.date)}
                          >
                            <UploadIcon
                              sx={{
                                fontSize: 16,
                                color: "primary.main",
                              }}
                            />
                          </IconButton>
                          {status.status_name}
                        </>
                      ) : (
                        <>
                          <ErrorOutlineIcon
                            sx={{
                              fontSize: 16,
                              color: "error.main",
                            }}
                          />
                          {status.status_name}
                        </>
                      )
                    ) : (
                      status.status_name
                    )}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
          {/* Render the popup */}
          {openPopup && (
            <HistoryStatusPopup
              open={openPopup}
              onClose={handlePopupClose}
              id={statusId}
              email={userEmail}
              monthYear={selectedMonthYear}
            />
          )}
        </>
      ) : (
        <Box
          sx={{
            mt: 6,
            p: 3,
            textAlign: "left", // Align error message to left
            backgroundColor: "#f8f9fa",
            borderRadius: 1,
          }}
        >
          <Typography variant="subtitle1" color="text.secondary">
            No status history available for this beneficiary
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default BeneficiaryProfile;
