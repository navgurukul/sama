import React from "react";
import { Box, Paper, Typography, Button } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

function YearlyReportData() {
  const NgoId = JSON.parse(localStorage.getItem("_AuthSama_"));
  const gettingStored = NgoId[0]?.role[0];
  const { id } = useParams();
  const user = id || NgoId[0]?.NgoId;
  const location = useLocation();
  const navigate = useNavigate();
  const { yearlyReportData, monthCurrent, year, formattedstartDate } =
    location.state || {};

  if (!yearlyReportData || yearlyReportData.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Typography variant="h6">No Report Data Found!</Typography>
      </Box>
    );
  }

  return (
    <>
      <Box display="flex" justifyContent="center">
        <Paper
          sx={{
            width: "700px",
            padding: "2rem",
            backgroundColor: "#f2f8f2",
            textAlign: "left",
            mt:"2rem"
          }}
          elevation={0}
        >
          <Typography variant="h6" fontWeight="bold" color="primary.main" mb={2}>
            {formattedstartDate && formattedstartDate} -{" "}
            {monthCurrent && monthCurrent} {year && year} Yearly Report
          </Typography>
          {yearlyReportData.map((report, index) => (
            <Box key={index} mb={4}>
              {report.questions.map((questionObj, qIndex) => (
                <Box key={qIndex} mb={1}>
                  {Object.entries(questionObj).map(([key, value]) => (
                    <>
                      <Typography variant="subtitle1" key={key}>
                        {key}
                      </Typography>
                      <Typography variant="body1" key={value}>
                        {value}
                      </Typography>
                    </>
                  ))}
                </Box>
              ))}
            </Box>
          ))}
        </Paper>
      </Box>
      <Box display="flex" justifyContent="center" mt={2}>
        <Button
          variant="contained"
          onClick={() =>
            gettingStored === "admin"
              ? navigate(`/ngo`)
              : navigate("/preliminary")
          }
        >
          Go to Dashboard
        </Button>
      </Box>
    </>
  );
}

export default YearlyReportData;
