import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
} from "@mui/material";
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const MonthlyNgoReport = ({ monthlyDates, onCardClick, monthlyReportingFormHandler, monthlyMetrixGet, currentDate, formatDate }) => {
  const getOverdueDays = (dueDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = Math.abs(today - dueDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isOverdue = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return today > date;
  };

  // Helper function to check if a report exists for a given month and year
  const checkReportExists = (monthName, year) => {
    const monthKey = `${monthName}-${year}`;
    return monthlyMetrixGet?.result?.[monthKey];
  };

  return (
    <Box sx={{ mt: 5 }}>
      <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
        Monthly Distribution Metrics
      </Typography>
      <Grid container spacing={3} mb={8}>
        {monthlyDates.map((report, index) => {
          const isEnabled = currentDate >= report;
          const monthName = report.toLocaleString("default", { month: "long" });
          const year = report.getFullYear();
          const reportData = checkReportExists(monthName, year);
          const isDueToday = !reportData && isOverdue(new Date(report)); // Only check overdue if report is not submitted
          const overdueDays = isDueToday ? getOverdueDays(new Date(report)) : 0;

          return (
            <Grid item xs={12} sm={6} md={4} key={index}>
              {reportData ? (
                <Card style={{ height: "100%" }} sx={{ backgroundColor: !isEnabled && "#E0E0E0" }}>
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
                    <Button
                      variant="subtitle1"
                      sx={{
                        marginTop: "40px",
                        marginLeft: "20%",
                        color: "#828282",
                        height: '35px',
                        width: '200px',
                        fontSize: '18px'
                      }}
                      disabled={!isEnabled}
                      onClick={() => onCardClick(reportData, monthName, year)}
                    >
                      View Report &#62;
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card
                  style={{
                    height: "205px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                  sx={{
                    backgroundColor: !isEnabled && "#E0E0E0",
                  }}
                >
                  <CardContent sx={{ padding: "16px" }}>
                    <Typography variant="subtitle1" sx={{ marginBottom: "8px", color: "#828282" }}>
                      {monthName} {year}
                    </Typography>
                    {isDueToday && isEnabled ? (
                      <Box display="flex" alignItems="center" sx={{ marginBottom: "8px" }}>
                        <ErrorIcon style={{ color: "#F44336" }} />
                        <Typography color="#F44336" variant="subtitle1" ml={1}>
                          Overdue by {overdueDays} {overdueDays === 1 ? 'day' : 'days'}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography
                        color="textSecondary"
                        variant="body1"
                        sx={{ marginBottom: "8px" }}
                      >
                        Due by {formatDate(report)}
                      </Typography>
                    )}
                    <Button
                      sx={{
                        marginTop: "35px",
                        marginLeft: "16%",
                        color: "#828282",
                        height: "35px",
                        width: "211px",
                        fontSize: "18px",
                      }}
                      disabled={!isEnabled}
                      onClick={() => monthlyReportingFormHandler(monthName, year)}
                    >
                      Submit Report &#62;
                    </Button>
                  </CardContent>
                </Card>
              )}
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default MonthlyNgoReport;