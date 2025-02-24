import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography,Box, Grid,useTheme, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText } from "@mui/material";
// import { TrendingUp, Download } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import "./styles/MonthlyImpact.css";

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
      if (!dateStr) return ""; // Handle empty cases
      const [monthAbbr, year] = dateStr.split("'");
      return `${monthAbbreviationMapping[monthAbbr]}-${year}`;
    };
    
    const formattedStartDate = formatMonthYear(dateRange.startDate);
    const formattedEndDate = formatMonthYear(dateRange.endDate);
     
    const from = formattedStartDate || getCurrentMonthYear();
    const to = formattedEndDate || getCurrentMonthYear();

    const [fromMonth, fromYear] = from.split("-");
    const [toMonth, toYear] = to.split("-");

    const fromDate = new Date(`${fromYear}-${monthMapping[fromMonth]}-01`);
    const toDate = new Date(`${toYear}-${monthMapping[toMonth]}-01`);

    let totalCounts = {};
    let partnerBreakdown = {};
    
    Object.entries(apiData).forEach(([partnerId, monthsData]) => {
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
  }, [apiData, dateRange]);

  const handleCardClick = (question, value) => {    
        navigate("/corpretedb/DataViewDetail", {
          state: {
            title: question,
            total: value,
            detailedData: detailedData[question],
          },
        });
      };  

  return (
    <div style={{ padding: "20px" }}>
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
                Please Select the date range to view the data
             </Typography>
           </Box>
    ) : (
      <Grid container spacing={2}>
        {Object.entries(filteredData).map(([question, value]) => (
           <Grid item xs={12} sm={6} lg={4} key={question}>
                          <Card
                         className="monthly-impact-card"
                         sx={{
                          cursor: "pointer",
                           borderRadius: '0.5rem',
                         }}
                         onClick={() => handleCardClick(question, value)}
                         >
                           <CardContent sx={{ p: 3 }}>
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
                               }}
                             >
                              {question} this month
                             </Typography>
                           </CardContent>
                         </Card>
                       </Grid>
        ))}
      </Grid>
      )}
    </div>
  );
};



export default MonthlyImpact;
