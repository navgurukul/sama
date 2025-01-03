import React from "react";
import { 
  Box, 
  Typography,
  Grid, 
  Card,
  CardContent,
  Button,
} from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const formatDateCurrent = (input) => {
  // Parse the input date string
  const [datePart] = input.split(','); // "24/11/2023"
  const [day, month, year] = datePart.split('/');

  // Create a Date object (Note: months in Date are 0-indexed)
  const date = new Date(`${year}-${month}-${day}`);

  // Format the month and year
  const options = { month: 'long', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};



const YearlyNgoReport = ({ 
  yearlyDates, 
  onCardClick, 
  yearlyReportingFormHandler, 
  yearlyMetrixGet, 
  currentDate,
  formatDate ,
  isDataAvailable,
  monthlyReportingDate
}) => {
  // Check if a full year has passed since the start date

  // Format the output
  const formattedstartDate = formatDateCurrent(monthlyReportingDate);


  return (
    <Box sx={{ mt: 5 }}>
      <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
        Yearly Distribution Metrics
      </Typography>
      <Grid container spacing={3} mb={8}>
        {yearlyDates?.map((report, index) => {
          const yearComplete = currentDate >= report;
         
          const yearCurrent = report.getFullYear();
          const monthCurrent = report.toLocaleString("default", { month: "long" });
          
          return (
            <Grid item xs={12} sm={6} md={4} key={index}>
              {isDataAvailable ? (
                <Card style={{ height: "100%" }} 
                  sx={{ backgroundColor: !yearComplete && "#E0E0E0" }}
                >
                  <CardContent>
                    <Typography variant="subtitle1" mt={1} ml={2} sx={{ color: "#828282" }}>
                    {formattedstartDate}- {monthCurrent} {yearCurrent} 
                    </Typography>
                    <Box display="flex" alignItems="center" mt={1} ml={2}>
                      <CheckCircleIcon color="success" />
                      <Typography color="#48A145" variant="subtitle1" ml={1}>
                        Submitted
                      </Typography>
                    </Box>
                    <Button 
                      variant="subtitle1"
                      sx={{ marginTop: "40px",
                        marginLeft:"20%",
                        color : "#828282",
                        height: '35px',
                        width: '200px',
                        fontSize: '18px'
                        }}
                      color="primary"
                      disabled={!yearComplete}
                      onClick={() => onCardClick(yearlyMetrixGet, monthCurrent, yearCurrent, formattedstartDate)}
                    >
                      View Report &#62;
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card style={{ height: "100%" }}
                  sx={{ backgroundColor: !yearComplete && "#E0E0E0" }}
                >
                  <CardContent>
                    <Typography variant="subtitle1" mt={1} ml={2} sx={{ color: "#828282" }}>
                      Annual Report {monthCurrent} {yearCurrent}
                    </Typography>
                    <Typography color="textSecondary" variant="body1" mt={1} ml={2}>
                      {"Due by " + formatDate(report)}
                    </Typography>
                    <Button 
                      variant="subtitle1"
                      sx={{
                        marginTop: "35px",
                        marginLeft:"16%",
                        color: "#828282",
                        height: "35px",
                        width: "211px",
                        fontSize: "18px",
                      }}                      color="primary"
                      disabled={!yearComplete}
                      onClick={() => yearlyReportingFormHandler(monthCurrent, yearCurrent)}
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

export default YearlyNgoReport;