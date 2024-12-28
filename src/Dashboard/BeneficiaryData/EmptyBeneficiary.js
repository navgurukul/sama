import { Container, Typography } from "@mui/material";
import React from "react";
import peopleImage from "./assets/People 1.svg";

const EmptyBeneficiary = () => {
  return (
    <Container
      maxWidth="lg"
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems:"center",
        gap: 2,
      }}
    >
      <img src={peopleImage} alt="Beneficiary" width="160px" height="160px" />
      <Typography variant="body1" color="#4A4A4A" gutterBottom>
        No Beneficiaries has been added yet
      </Typography>
    </Container>
  );
};

export default EmptyBeneficiary;
