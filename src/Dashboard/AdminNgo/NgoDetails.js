import React from "react";
import { Typography, Paper, Grid } from "@mui/material";
import "./style.css";
import { Container } from "@mui/system";

const NGODetails = ({ ngo }) => {
  return (
    <Container maxWidth="lg" sx={{ padding: "24px" }}>
      <Grid container spacing={4}>
        {ngo.map((item) => (
          <React.Fragment key={item.Id}>
            <Grid item xs={12} sm={6} md={6}>
              <Paper
                elevation={2}
                sx={{
                  padding: "20px",
                  marginBottom: "20px",
                  backgroundColor: "primary.light",
                }}
              >
                <Typography variant="h6" sx={{ margin: "32px 0px",color:"#5C785A" }}>
                  {item.organizationName}
                </Typography>
                <Typography variant="subtitle1" className="detailHeader">
                  NGO ID:
                </Typography>
                <Typography variant="body1" sx={{ marginBottom: "16px",color:"#4A4A4A" }}>
                  {item.Id}
                </Typography>
                <Typography variant="subtitle1" className="detailHeader">
                  Point of Contact:
                </Typography>
                <Typography variant="body1" sx={{ marginBottom: "16px",color:"#4A4A4A" }}>
                  {item.primaryContactName}
                </Typography>
                <Typography variant="subtitle1" className="detailHeader">
                  Contact Number:
                </Typography>
                <Typography variant="body1" sx={{ marginBottom: "16px",color:"#4A4A4A" }}>
                  {item.contactNumber}
                </Typography>
                <Typography variant="subtitle1" className="detailHeader">
                  Email:
                </Typography>
                <Typography variant="body1" sx={{ marginBottom: "16px",color:"#4A4A4A" }}>
                  {item.email}
                </Typography>
                <Typography variant="subtitle1" className="detailHeader">
                  State of Operation:
                </Typography>
                <Typography variant="body1" sx={{ marginBottom: "16px" ,color:"#4A4A4A"}}>
                  {item.operatingState}
                </Typography>
                <Typography variant="subtitle1" className="detailHeader">
                  Operation Type:
                </Typography>
                <Typography variant="body1" sx={{ marginBottom: "16px",color:"#4A4A4A" }}>
                  {item.operatingState}
                </Typography>
                <Typography variant="subtitle1" className="detailHeader">
                  Years of Operation:
                </Typography>
                <Typography variant="body1" sx={{ marginBottom: "16px",color:"#4A4A4A" }}>
                  {item.yearsOperating}
                </Typography>
                <Typography variant="subtitle1" className="detailHeader">
                  Focus Area:
                </Typography>
                <Typography variant="body1" sx={{ marginBottom: "16px",color:"#4A4A4A" }}>
                  {item.focusArea}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <Paper
                elevation={2}
                style={{ padding: "20px", marginBottom: "20px" }}
              >
                <Typography variant="h6" sx={{ margin: "32px 0px",color:"#5C785A" }}>
                  Laptop Acquisition Plan
                </Typography>
                <Typography variant="subtitle1" className="detailHeader">
                  Type of Infrastructure:
                </Typography>
                <Typography variant="body1" sx={{ marginBottom: "16px",color:"#3A3D5B" }}>
                  {item.infrastructure}
                </Typography>
                <Typography variant="subtitle1" className="detailHeader">
                  Selection Criteria:
                </Typography>
                <Typography variant="body1" sx={{ marginBottom: "16px",color:"#3A3D5B"  }}>
                  {item.criteria}
                </Typography>
                <Typography variant="subtitle1" className="detailHeader">
                  Number of Required Laptops:
                </Typography>
                <Typography variant="body1" sx={{ marginBottom: "16px",color:"#3A3D5B"  }}>
                  {item.laptops}
                </Typography>
                <Typography variant="subtitle1" className="detailHeader">
                  Age Group of Beneficiaries:
                </Typography>
                <Typography variant="body1" sx={{ marginBottom: "16px",color:"#3A3D5B"  }}>
                  {item.ageGroup}
                </Typography>
                <Typography variant="subtitle1" className="detailHeader">
                  Expected Outcome:
                </Typography>
                <Typography variant="body1" sx={{ marginBottom: "16px",color:"#3A3D5B"  }}>
                  {item.expectedOutcome}
                </Typography>
                <Typography variant="subtitle1" className="detailHeader">
                  Strategy for Usage Tracking:
                </Typography>
                <Typography variant="body1" sx={{ marginBottom: "16px",color:"#3A3D5B" }}>
                  {item.laptopTracking}
                </Typography>
              </Paper>
            </Grid>
          </React.Fragment>
        ))}
      </Grid>
    </Container>
  );
};

export default NGODetails;
