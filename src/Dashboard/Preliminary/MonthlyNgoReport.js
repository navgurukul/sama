import React from "react";
import { Box, 
    Typography,
    Grid, 
    Card,
    CardContent,
    Button,


     } from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';


const MonthlyNgoReport = ({ monthlyDates, onCardClick, monthlyReportingFormHandler, monthlyMetrixGet, currentDate,formatDate }) => {

 
  return (
    <Box sx={{ mt: 5}}>
      <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
        Monthly Distribution Metrics
      </Typography>
      <Grid container spacing={3} mb = {8}>
        {monthlyDates.map((report, index) => {
          const isEnabled = currentDate >= report; // Check if current date has passed the card's date
          const monthName = report.toLocaleString("default", { month: "long" }); // Get full month name
          const year = report.getFullYear(); // Get the year
          
          return (
          <Grid item xs={12} sm={6} md={4} key={index}>
            {monthlyMetrixGet[index] ? 
            <Card  style={{ height: "100%" }} 
            sx={{backgroundColor: !isEnabled && "#E0E0E0"}}
            >
              <CardContent>
                <Typography variant="subtitle1" mt={1} ml={2} sx={{color:"#828282"}}>
                {monthName} {year}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={1} ml={2}>
                    <CheckCircleIcon color="success" />
                    <Typography color="#48A145" variant="subtitle1" ml={1}>
                      Submitted
                    </Typography>
                  </Box>                  
                <Button variant="subtitle1" 
                 sx={{ marginTop: "40px", 
                  marginLeft:"20%",
                  color : "#828282",
                  height: '35px', 
                  width: '200px',
                  fontSize: '18px'
                  }}
                  
                disabled={!isEnabled}
                onClick={() => onCardClick(monthlyMetrixGet[index], monthName, year)}
                >
                  View Report &#62;
                </Button>
              </CardContent>
            </Card>
          : 
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
            <Typography color="textSecondary" variant="body1" sx={{ marginBottom: "16px" }}>
              {"Due by " + formatDate(report)}
            </Typography>
            <Button
              sx={{
                marginTop: "35px",
                marginLeft:"16%",
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
        
        }
          </Grid>
          )
          })}
      </Grid>
    </Box>
  );
};

export default MonthlyNgoReport;
