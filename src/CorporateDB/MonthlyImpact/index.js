import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  Grid,
  IconButton,
  useTheme,
} from "@mui/material";
import { TrendingUp, Download } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import "./styles/MonthlyImpact.css";

const MonthlyImpact = () => {
  const theme = useTheme();
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
    navigate("/corpretedb/DataViewDetail", {
      state: {
        title: metric.title,
        data: metric.details,
        total: metric.value,
      },
    });
  };

  return (
    <div>
      <Box p={3}>
        <Box
          className="monthly-impact-header"
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="h6"
              sx={{
                color: "#4A4A4A",
              }}
            >
              Report for the Month of
            </Typography>
            <Typography
              component="h6"
              sx={{
                color: "primary.main",
                textDecoration: "underline",
              }}
            >
              January
            </Typography>
          </Box>
          {/* <IconButton sx={{ color: "#828282" }}> */}
            <KeyboardArrowDownIcon sx={{ color: "#828282" }}/>
          {/* </IconButton> */}
          <IconButton sx={{ color: "#828282" }}>
            <SaveAltIcon />
          </IconButton>
        </Box>

        <Grid container spacing={3}>
          {metrics.map((metric, index) => (
            <Grid item xs={12} sm={6} lg={4} key={index}>
              <Card
              className="monthly-impact-card"
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
                    {/* <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <TrendingUp sx={{ color: "#27AE60", fontSize: 16 }} />
                      <Typography
                        sx={{
                          color: "#27AE60",
                          fontSize: "12px",
                          fontWeight: 500,
                        }}
                      >
                        {metric.increase}
                      </Typography>
                    </Box> */}
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
      </Box>
    </div>
  );
};

export default MonthlyImpact;




