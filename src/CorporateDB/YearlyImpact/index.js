import React, { useState, } from "react";
import { Box, Typography, Grid, Card, CardContent, IconButton } from "@mui/material";
import EmptyReport from "./EmptyReport";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import { useNavigate } from "react-router-dom";
import DynamicLineChart from "./DynamicLineChart";



const YearlyImpact = () => {
  const [isEmpty, setIsEmpty] = useState(false);
  const navigate = useNavigate();

  const metrics = [
    {
      title: "TEACHERS TRAINED",
      value: "914",
      increase: "12.5%",
      subtitle: "numbers of teachers trained this month",
      details: [
        { name: "Give India Foundations", count: 250 },
        { name: "Asha Foundations", count: 250 },
        { name: "Give India Foundations", count: 250 },
        { name: "Give India Foundations", count: 250 },
        { name: "Give India Foundations", count: 250 },
        { name: "Give India Foundations", count: 250 },
      ],
    },
    {
      title: "SCHOOL VISITS",
      value: "314",
      increase: "12.5%",
      subtitle: "number of school visits this month",
      details: [
        { name: "Delhi Schools", count: 100 },
        { name: "Mumbai Schools", count: 89 },
        { name: "Bangalore Schools", count: 75 },
        { name: "Chennai Schools", count: 50 },
      ],
    },
    {
      title: "MODULES COMPLETED",
      value: "102",
      increase: "12.5%",
      subtitle: "number of modules completed this month",
      details: [
        { name: "Basic Training", count: 40 },
        { name: "Advanced Modules", count: 35 },
        { name: "Specialized Training", count: 27 },
      ],
    },
    {
      title: "LEARNING HOURS",
      value: "3940",
      increase: "12.5%",
      subtitle: "number of sessions conducted this month",
      details: [
        { name: "Classroom Hours", count: 2000 },
        { name: "Self-Study Hours", count: 1240 },
        { name: "Workshop Hours", count: 700 },
      ],
    },
  ];
  const handleCardClick = (metric) => {
    navigate("/corpretedb/NGOTrainedTable", {
      state: {
        title: metric.title,
        data: metric.details,
        total: metric.value,
      },
    });
  };

  return (
    <Box sx={{marginLeft: "5px"}}>
      <Box className="yearly-impact-header" gap={1}>
        <Typography variant="h6">Report for 2023-2024</Typography>
        {
          !isEmpty && <IconButton sx={{ color: "#828282" }}>
            <SaveAltIcon />
          </IconButton>
        }
      </Box>
      {
        isEmpty ? <EmptyReport /> :<> <Grid container spacing={3} >
          {metrics.map((metric, index) => (
            <Grid item xs={12} sm={6} lg={4} key={index}>
              <Card
                className="yearly-impact-card"
                sx={{
                  borderRadius: '0.5rem',
                }}
                onClick={() => handleCardClick(metric)}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      mb: 1,
                      color:"#4A4A4A"
                    }}
                  >
                    {metric.title}
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
                      {metric.value}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#828282",
                    }}
                  >
                    {metric.subtitle}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        <DynamicLineChart/>
        </>
      }
    </Box>
  );
};

export default YearlyImpact;
