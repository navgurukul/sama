import React from "react";
import { Typography, Paper, Grid } from "@mui/material";
import "./style.css";
import { Container } from "@mui/system";

// Reusable field component
const DetailField = ({ label, value, color = "#4A4A4A" }) => (
  <>
    <Typography variant="subtitle1" className="detailHeader">
      {label}:
    </Typography>
    <Typography variant="body1" sx={{ marginBottom: "16px", color: color }}>
      {value}
    </Typography>
  </>
);

const NGODetails = ({ ngo }) => {
  
  // Organization details structure
  const getOrgDetails = (item) => [
    { label: "NGO ID", value: item.Id },
    { label: "Point of Contact", value: item.primaryContactName },
    { label: "Contact Number", value: item.contactNumber },
    { label: "Email", value: item.email },
    { label: "State of Operation", value: item.operatingState },
    // { label: "Operation Type", value: item.operatingState },
    { label: "Years of Operation", value: item.yearsOperating },
    { label: "Focus Area", value: item.focusArea },
  ];

  // Laptop plan details structure
  const getLaptopPlanDetails = (item) => [
    { label: "Type of Infrastructure", value: item.infrastructure },
    // { label: "Selection Criteria", value: item.beneficiarySelection },
    { label: "Number of Required Laptops", value: item["Laptop require"] },
    { label: "Number of Beneficiaries to Serve", value: item.beneficiariesCount },
    { label: "Age Group of Beneficiaries", value: item.ageGroup },
    { label: "Expected Outcome", value: item.expectedOutcome },
    { label: "Strategy for Usage Tracking", value: item.laptopTracking },
  ];

  // Essential details for subsequent requests
  const getEssentialDetails = (item) => [
    { label: "Number of Required Laptops", value: item["Laptop require"] },
    { label: "Number of Beneficiaries to Serve", value: item.beneficiariesCount },
  ];

  return (
    <Container maxWidth="lg" sx={{ padding: "24px" }}>
      <Grid container spacing={4} mt={5}>
        {ngo.map((item, index) => (
          <React.Fragment key={item.Id}>
            {index === 0 ? (
              // First request - show all details
              <>
                <Grid item xs={12} sm={6} md={6}>
                  <Paper
                    elevation={2}
                    sx={{
                      padding: "20px",
                      marginBottom: "20px",
                      backgroundColor: "primary.light",
                    }}
                  >
                    <Typography variant="h6" sx={{ margin: "32px 0px", color: "#5C785A" }}>
                      {item.organizationName}
                    </Typography>
                    {getOrgDetails(item).map((field, i) => (
                      <DetailField key={i} {...field} />
                    ))}
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  <Paper
                    elevation={2}
                    sx={{ padding: "20px", marginBottom: "20px" }}
                  >
                    <Typography variant="h6" sx={{ margin: "32px 0px", color: "#5C785A" }}>
                      Laptop Acquisition Plan
                    </Typography>
                    {getLaptopPlanDetails(item).map((field, i) => (
                      <DetailField key={i} {...field} color="#3A3D5B" />
                    ))}
                  </Paper>
                </Grid>
              </>
            ) : (
              // Subsequent requests - show only essential details
              <Grid item xs={12} sm={6} md={6}>
                <Paper
                  elevation={2}
                  sx={{ padding: "20px", marginBottom: "20px" }}
                >
                  <Typography variant="h6" sx={{ margin: "32px 0px", color: "#5C785A" }}>
                    Request #{index + 1}
                  </Typography>
                  {getEssentialDetails(item).map((field, i) => (
                    <DetailField key={i} {...field} color="#3A3D5B" />
                  ))}
                </Paper>
              </Grid>
            )}
          </React.Fragment>
        ))}
      </Grid>
    </Container>
  );
};

export default NGODetails;
