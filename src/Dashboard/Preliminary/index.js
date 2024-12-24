import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Container,
} from "@mui/material";
import axios from "axios";
import PreDestibution from "./PreDestibution";
import PreliminaryForm from "./PreliminaryForm";
import { useNavigate, useParams } from "react-router-dom";
import preDistribution from '../Preliminary/PreDistribution.png'


const Preliminary = () => {
  // State for API data
  const NgoId = JSON.parse(localStorage.getItem("_AuthSama_"));
  const { id } = useParams();
  const user = id ? id : NgoId[0].NgoId;

  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://script.google.com/macros/s/AKfycbyVi1UX63tdxatOS4-21DytCvYvD2v9fdYH72JD5LHHe1P_qd3SpZqO88mbMM_PXgsJGQ/exec?type=getpre"
        ); // Replace with your API endpoint
        setMetrics(response.data); // Update according to API response structure
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(true);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const NgoData = metrics.filter((data) => data.NgoId === user);

  // Determine if the user is found
  const isUserFound = NgoData.length > 0;
  const preliminaryId = NgoData && NgoData[0] && NgoData[0].Id;

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Typography variant="h6" color="error">
          Failed to load data. Please try again later.
        </Typography>
      </Box>
    );
  }

  return (

    <Container maxWidth="lg" mt="10">
      {isUserFound ? (
        <PreDestibution userId={user} preliminaryId={preliminaryId} />
      ) : (
        <Grid
          container
          sx={{
            mt:15,
            justifyContent: "center", 
            alignItems: "center", 
          }}
        >
          <img
            src={preDistribution}
            alt="Centered Update"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </Grid>)}
    </Container>
  );
};

export default Preliminary;
