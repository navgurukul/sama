import React from "react";
import { Typography, Paper, Grid, Button } from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
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
  const getOrgDetails = (item) => {
    const contactParts = (item.primaryContactName || "").split(" | ");
    const name = contactParts[0];
    const number = item.contactNumber || contactParts[1] || "";
    
    return [
      { label: "NGO ID", value: item.displayId || item.Id },
      { label: "Point of Contact", value: name },
      { label: "Contact Number", value: number },
      { label: "Email", value: item.email },
      { label: "State of Operation", value: item.operatingState },
      { label: "Years of Operation", value: item.yearsOperating },
      { label: "Focus Area", value: item.focusArea },
    ];
  };

  // Laptop plan details structure
  const getLaptopPlanDetails = (item) => {
    // Collect the impact report url, either from impactReport or attached_email_link
    const impactUrl = item.impactReport || item.attached_email_link;
    
    return [
      { label: "Type of Infrastructure", value: item.infrastructure },
      // { label: "Selection Criteria", value: item.beneficiarySelection },
      { label: "Number of Required Laptops", value: item["Laptop require"] },
      { label: "Number of Beneficiaries to Serve", value: item.beneficiariesCount },
      { label: "Age Group of Beneficiaries", value: item.ageGroup },
      { label: "Expected Outcome", value: item.expectedOutcome },
      { label: "Strategy for Usage Tracking", value: item.laptopTracking },
      { 
        label: "Impact Report / Document", 
        value: impactUrl ? (
          <Button
            variant="text"
            href={impactUrl}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<VisibilityIcon />}
            sx={{
              color: "#5C785A",
              textTransform: "none",
              fontWeight: 600,
              padding: 0,
              "&:hover": {
                backgroundColor: "transparent",
                textDecoration: "underline",
                color: "#5C785A",
              }
            }}
          >
            Preview
          </Button>
        ) : "N/A"
      },
    ];
  };

  // Essential details for subsequent requests
  const getEssentialDetails = (item) => [
    { label: "Number of Required Laptops", value: item["Laptop require"] },
    { label: "Number of Beneficiaries to Serve", value: item.beneficiariesCount },
  ];

  if (!ngo || ngo.length === 0) return null;
  const primaryNgo = ngo[0];
  const additionalRequests = Array.isArray(primaryNgo.NGORequests) ? primaryNgo.NGORequests : [];

  return (
    <Container maxWidth="lg" sx={{ padding: "24px" }}>
      <Grid container spacing={4} mt={5}>
        <React.Fragment key={primaryNgo.Id}>
          {/* Main request - show all details */}
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
                  {primaryNgo.organizationName}
                </Typography>
                {getOrgDetails(primaryNgo).map((field, i) => (
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
                {getLaptopPlanDetails(primaryNgo).map((field, i) => (
                  <DetailField key={i} {...field} color="#3A3D5B" />
                ))}
              </Paper>
            </Grid>
          </>

          {/* Subsequent requests from NGORequests array */}
          {additionalRequests.map((reqItem, index) => (
            <Grid item xs={12} sm={6} md={6} key={`add-req-${index}`}>
              <Paper
                elevation={2}
                sx={{ padding: "20px", marginBottom: "20px" }}
              >
                <Typography variant="h6" sx={{ margin: "32px 0px", color: "#5C785A" }}>
                  Request #{index + 2}
                </Typography>
                {getEssentialDetails(reqItem).map((field, i) => (
                  <DetailField key={i} {...field} color="#3A3D5B" />
                ))}
              </Paper>
            </Grid>
          ))}
        </React.Fragment>
      </Grid>
    </Container>
  );
};

export default NGODetails;
