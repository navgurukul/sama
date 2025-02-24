import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Box, Grid, useTheme, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, IconButton, Container, CircularProgress } from "@mui/material";
import { TrendingUp, Download } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import "./styles/MonthlyImpact.css";
import jsPDF from "jspdf";
// const dummydata = {
//   "SAM-37": {
//     "March-2024": {
//       Bihar: {
//         "Number of Teachers Trained": "1",
//         "Number of School Visits": "1",
//         "Number of Sessions Conducted": "1",
//         "Number of Modules Completed": "1",
//         "Intent to Pursue Rating per Module": "1"
//       },
//       Goa: {
//         "Number of Teachers Trained": "1",
//         "Number of School Visits": "1",
//         "Number of Sessions Conducted": "1",
//         "Number of Modules Completed": "1",
//         "Intent to Pursue Rating per Module": "1"
//       }
//     },
//     "April-2024": {
//       Bihar: {
//         "Number of Teachers Trained": "1",
//         "Number of School Visits": "1",
//         "Number of Sessions Conducted": "1",
//         "Number of Modules Completed": "1",
//         "Intent to Pursue Rating per Module": "1"
//       }
//     }
//   },
//   "SAM-39": {
//     "March-2024": {
//       Bihar: {
//         "Number of Teachers Trained": "1",
//         "Number of School Visits": "1",
//         "Number of Sessions Conducted": "1",
//         "Number of Modules Completed": "1",
//         "Intent to Pursue Rating per Module": "1"
//       }
//     },
//     "April-2024": {
//       Bihar: {
//         "Number of Teachers Trained": "1",
//         "Number of School Visits": "1",
//         "Number of Sessions Conducted": "1",
//         "Number of Modules Completed": "1",
//         "Intent to Pursue Rating per Module": "1"
//       }
//     }
//   },
//   "SAM-40": {
//     "May-2024": {
//       Bihar: {
//         "Number of Teachers Trained": "1",
//         "Number of School Visits": "1",
//         "Number of Sessions Conducted": "1",
//         "Number of Modules Completed": "1",
//         "Intent to Pursue Rating per Module": "1"
//       }
//     },
//     "June-2024": {
//       Bihar: {
//         "Number of Teachers Trained": "1",
//         "Number of School Visits": "1",
//         "Number of Sessions Conducted": "1",
//         "Number of Modules Completed": "1",
//         "Intent to Pursue Rating per Module": "1"
//       }
//     }
//   }
// };


const monthMapping = {
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12
};

const MonthlyImpact = () => {
  const [filteredData, setFilteredData] = useState({});
  const [detailedData, setDetailedData] = useState({});
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStateData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          'https://script.google.com/macros/s/AKfycbzjIvQJgBpdYwShV6LQOuyNtccmafG3iHFYzmEBQ6FBjiSeT3TuSEyAM46OMYMTsPBC/exec?type=corporatedbStatewise&doner=Amazon'
        );
        const Monthlydata = await response.json();
        setData(Monthlydata);
      }
      catch (err) {
        console.error('Error fetching state data:', err);
      }
      finally {
        setLoading(false);
      }
    }
    fetchStateData();
  }, []);

  useEffect(() => {
    const from = "March-2024";
    const to = "April-2024";

    const [fromMonth, fromYear] = from.split("-");
    const [toMonth, toYear] = to.split("-");

    const fromDate = new Date(`${fromYear}-${monthMapping[fromMonth]}-01`);
    const toDate = new Date(`${toYear}-${monthMapping[toMonth]}-01`);

    let totalCounts = {};
    let partnerBreakdown = {};

    Object.entries(data).forEach(([partnerId, monthsData]) => {
      Object.keys(monthsData).forEach(monthYear => {
        const [month, year] = monthYear.split("-");
        const currentDate = new Date(`${year}-${monthMapping[month]}-01`);

        if (currentDate >= fromDate && currentDate <= toDate) {

          Object.values(monthsData[monthYear]).forEach(stateData => {
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

    setFilteredData(totalCounts);
    setDetailedData(partnerBreakdown);
  }, [data]);

  const handleCardClick = (question, value) => {
    navigate("/corpretedb/DataViewDetail", {
      state: {
        title: question,
        total: value,
        detailedData: detailedData[question],
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
    pdf.text(title, (pageWidth - titleWidth) / 2, yOffset); // Centered title
    yOffset += 10;

    pdf.setFontSize(12);

    Object.entries(filteredData).forEach(([question, value]) => {
      const text = `${question}: ${value}`;
      const textWidth = pdf.getTextWidth(text);
      pdf.text(text, (pageWidth - textWidth) / 2, yOffset); // Centered text
      yOffset += 8;

      // Add new page if content exceeds page height
      if (yOffset > 280) {
        pdf.addPage();
        yOffset = 20;
      }
    });

    pdf.save("Monthly_Impact_Report.pdf");
  };


  if (loading) {
    return (<Box sx={{ display: 'flex', justifyContent: 'center', height: "100vh" }}>
      <CircularProgress />
    </Box>)
  }

  return (
    <Container maxWidth="lg" style={{ padding: "20px" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: "20px" }}>
        <Typography
          variant="h6"
          sx={{
            color: "#4A4A4A",
          }}
        >
          Download Report
        </Typography>
        <IconButton sx={{ color: "#828282" }}>
          <SaveAltIcon onClick={handleDownloadPDF} />
        </IconButton>
      </Box>
        <Grid 
          container 
          spacing={2} 
        >
          {Object.entries(filteredData).map(([question, value]) => (
            <Grid item xs={12} sm={6} lg={4} key={question}>
              <Card
                className="monthly-impact-card"
                sx={{
                  cursor: "pointer",
                  borderRadius: '0.5rem',
                  height: '100%',
                }}
                onClick={() => handleCardClick(question, value)}
              >
                <CardContent  sx={{ p: 3}}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      mb: 1,
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
                    <Typography variant="h5">
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
                      mt: 'auto', // Pushes the text to the bottom
                    }}
                  >
                    {question} this month
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
    </Container>
  );
};

export default MonthlyImpact;