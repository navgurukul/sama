import React from "react";
import { Box, Typography, Grid, Card, CardContent } from "@mui/material";

const YearlyReport = ({ yearlyDates, onCardClick }) => {
  return (
    <Box sx={{ mt: 5, backgroundColor: "#F0F4EF", borderRadius: 2, p: 4 }}>
      <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
        Yearly Distribution Metrics
      </Typography>
      <Grid container spacing={2}>
        {yearlyDates.map((yearDate, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                cursor: "pointer",
                "&:hover": { boxShadow: "0px 0px 5px #000" },
                borderRadius: 2,
                textAlign: "center",
                p: 2,
              }}
              onClick={() => onCardClick(yearDate.getFullYear())}
            >
              <CardContent>
                <Typography variant="h6" color="textPrimary">
                  Year: {yearDate.getFullYear()}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Due Date: {yearDate.toDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default YearlyReport;
