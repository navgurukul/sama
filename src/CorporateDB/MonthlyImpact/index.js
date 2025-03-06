import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Box, Grid, useTheme, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, IconButton, Container, CircularProgress } from "@mui/material";
import { TrendingUp, Download } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import "./styles/MonthlyImpact.css";
import jsPDF from "jspdf";

const monthMapping = {
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12
};

const MonthlyImpact = ({ dateRange, apiData }) => {
  const [filteredData, setFilteredData] = useState({});
  const [detailedData, setDetailedData] = useState({});
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [data, setData] = useState({});
  const theme = useTheme();
  const navigate = useNavigate();

  const getCurrentMonthYear = () => {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const today = new Date();
    today.setMonth(today.getMonth() - 1); // Move to last month

    const month = monthNames[today.getMonth()];
    const year = today.getFullYear();

    return `${month}-${year}`;
  };

  useEffect(() => {
    const monthAbbreviationMapping = {
      "Jan": "January",
      "Feb": "February",
      "Mar": "March",
      "Apr": "April",
      "May": "May",
      "Jun": "June",
      "Jul": "July",
      "Aug": "August",
      "Sep": "September",
      "Oct": "October",
      "Nov": "November",
      "Dec": "December",
    };

    const formatMonthYear = (dateStr) => {
      if (!dateStr) return "";
      const [monthAbbr, year] = dateStr.split("'");
      return `${monthAbbreviationMapping[monthAbbr]}-${year}`;
    };

    let totalCounts = {};
    let partnerBreakdown = {};

    // If dateRange is available, process accordingly
    if (dateRange?.startDate && dateRange?.endDate) {
      const formattedStartDate = formatMonthYear(dateRange.startDate);
      const formattedEndDate = formatMonthYear(dateRange.endDate);

      const from = formattedStartDate || getCurrentMonthYear();
      const to = formattedEndDate || getCurrentMonthYear();

      const [fromMonth, fromYear] = from.split("-");
      const [toMonth, toYear] = to.split("-");

      const fromDate = new Date(`${fromYear}-${monthMapping[fromMonth]}-01`);
      const toDate = new Date(`${toYear}-${monthMapping[toMonth]}-01`);

      Object.entries(apiData).forEach(([partnerId, monthsData]) => {
        Object.keys(monthsData).forEach((monthYear) => {
          const [month, year] = monthYear.split("-");
          const currentDate = new Date(`${year}-${monthMapping[month]}-01`);

          if (currentDate >= fromDate && currentDate <= toDate) {
            Object.values(monthsData[monthYear]).forEach((stateData) => {
              Object.entries(stateData).forEach(([question, value]) => {
                totalCounts[question] = (totalCounts[question] || 0) + parseInt(value);

                if (!partnerBreakdown[question]) partnerBreakdown[question] = {};
                partnerBreakdown[question][partnerId] =
                  (partnerBreakdown[question][partnerId] || 0) + parseInt(value);
              });
            });
          }
        });
      });
    } else {
      // No date range provided: Process all available data
      Object.entries(apiData).forEach(([partnerId, monthsData]) => {
        Object.keys(monthsData).forEach((monthYear) => {
          Object.values(monthsData[monthYear]).forEach((stateData) => {
            Object.entries(stateData).forEach(([question, value]) => {
              totalCounts[question] = (totalCounts[question] || 0) + parseInt(value);

              if (!partnerBreakdown[question]) partnerBreakdown[question] = {};
              partnerBreakdown[question][partnerId] =
                (partnerBreakdown[question][partnerId] || 0) + parseInt(value);
            });
          });
        });
      });
    }

    setFilteredData(totalCounts);
    setDetailedData(partnerBreakdown);
  }, [apiData, dateRange]);

  const handleCardClick = (question, value) => {
    navigate("/corpretedb/DataViewDetail", {
      state: {
        title: question,
        total: value,
        detailedData: detailedData[question],
        dateRange:dateRange,
        fullDataRange:getFullDataRange(apiData)
      },
    });
  };

  const handleDownloadPDF = () => {
    if (!filteredData || Object.keys(filteredData).length === 0) {
      alert("No data available to download!");
      return;
    }
  
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    let yOffset = 20;
  
    pdf.setFontSize(18);
    const title = "Monthly Impact Report";
    const titleWidth = pdf.getTextWidth(title);
    pdf.text(title, (pageWidth - titleWidth) / 2, yOffset);
    yOffset += 10;
  
    pdf.setFontSize(14);
    const dateRangeText = dateRange?.startDate && dateRange?.endDate
      ? `from: ${dateRange.startDate} - ${dateRange.endDate}`
      : `from: ${getFullDataRange(apiData)}`;
  
    pdf.text(dateRangeText, (pageWidth - pdf.getTextWidth(dateRangeText)) / 2, yOffset);
    yOffset += 10;
  
    pdf.setFontSize(12);
  
    Object.entries(filteredData).forEach(([question, value]) => {
      const text = `${question}: ${value}`;
      pdf.text(text, (pageWidth - pdf.getTextWidth(text)) / 2, yOffset);
      yOffset += 8;
  
      if (yOffset > 280) {
        pdf.addPage();
        yOffset = 20;
      }
    });
  
    pdf.save("Monthly_Impact_Report.pdf");
  };
  
  //default data
  const getFullDataRange = (apiData) => {
    const allDates = [];

    Object.values(apiData).forEach((monthsData) => {
      allDates.push(...Object.keys(monthsData)); // Extract month-year keys
    });

    if (allDates.length === 0) return ""; // No data available

    const sortedDates = allDates.sort((a, b) => {
      const [monthA, yearA] = a.split("-");
      const [monthB, yearB] = b.split("-");
      return new Date(`${yearA}-${monthMapping[monthA]}-01`) - new Date(`${yearB}-${monthMapping[monthB]}-01`);
    });

    return `${sortedDates[0]} to ${sortedDates[sortedDates.length - 1]}`;
  };

  return (
    <div style={{ padding: "20px" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: "20px" }}>
        <Typography variant="h6" sx={{ color: "#4A4A4A" }}>
          Download Report for{" "}
          {dateRange?.startDate && dateRange?.endDate
            ? `(${dateRange.startDate} - ${dateRange.endDate})`
            : `(${getFullDataRange(apiData)})`}
        </Typography>

        <IconButton sx={{ color: "#828282" }}>
          <SaveAltIcon onClick={handleDownloadPDF} />
        </IconButton>
      </Box>
      {Object.keys(filteredData).length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '400px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px'
          }}
        >
          <Typography variant="h6" color="text.secondary">
            Data is not available.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {Object.entries(filteredData).map(([question, value]) => (
            <Grid item xs={12} sm={6} lg={4} key={question} >
              <Box
                className="monthly-impact-card"
                sx={{
                  cursor: "pointer",
                  borderRadius: '8px',
                  height: '100%',
                  display: "flex",
                  flexDirection: "column",
                }}
                onClick={() => handleCardClick(question, value)}
              >
                <CardContent sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      mb: 1,
                      color: "#4A4A4A"
                    }}
                  >
                    {question}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="h5"
                    >
                      {value}
                    </Typography>
                    {/* <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                 <TrendingUp sx={{ color: "#27AE60", fontSize: 16 }} />
                                 <Typography
                                   sx={{
                                     color: "#27AE60",
                                     fontSize: "12px",
                                     fontWeight: 500,
                                   }}
                                 >
                                  
                                 </Typography>
                               </Box> */}
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#828282",
                      mt: "auto"
                    }}
                  >
                    {question} this month
                  </Typography>
                </CardContent>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </div>
  );
};

export default MonthlyImpact;