import React, { useState, useEffect } from "react";
import { Container, CircularProgress } from "@mui/material";
import axios from "axios";
import AdminTable from "./AdminTable";
import NGOTable from "./NGOTable";

const BeneficiaryData = () => {
  // Authentication and role management
  const NgoId = JSON.parse(localStorage.getItem("_AuthSama_"));
  const gettingStoredData = NgoId[0].NgoId;
  const isAdmin = NgoId[0]?.role[0] !== "ngo";

  // State management for API data
  const [ngoData, setNgoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editStatus, setEditStatus] = useState(false);
  const [mouFound, setMouFound] = useState(true);
  const [filterOptions, setFilterOptions] = useState({
    idProof: [],
    useCase: [],
    occupation: [],
    status: [],
  });

  // Fetch status data
  useEffect(() => {
    async function fetchStatusData() {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_NgoInformationApi}?type=manageStatus`
        );
        setFilterOptions((prevOptions) => ({
          ...prevOptions,
          status: response.data.map((status) => status.name),
        }));
      } catch (error) {
        console.error("Error fetching status data:", error);
      }
    }
    fetchStatusData();
  }, []);

  // Check MOU status for NGO
  useEffect(() => {
    async function fetchMouData() {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_NgoInformationApi}?type=GetMou&id=${gettingStoredData}`
        );
        setMouFound(response.data);
      } catch (error) {
        console.error("Error fetching MOU data:", error);
      }
    }
    !isAdmin && gettingStoredData && fetchMouData();
  }, [gettingStoredData, isAdmin]);

  // Fetch beneficiary data
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getUserData` // to fetch the userdata
          // "https://script.google.com/macros/s/AKfycbwDr-yNesiGwAhqvv3GYNe7SUBKSGvXPRX1uPjbOdal7Z8ctV5H2x4y4T_JuQPMlMdjeQ/exec?type=getUserData"
        );
        const data = response.data;

        setNgoData(data);
        setLoading(false);
        setEditStatus(false);

        // Set filter options from fetched data
        const idProofOptions = [
          ...new Set(data.map((item) => item["ID Proof type"])),
        ];
        const useCaseOptions = [
          ...new Set(data.map((item) => item["Use case"])),
        ];
        const occupationOptions = [
          ...new Set(data.map((item) => item["Occupation"])),
        ];
        const statusOfBenificiary = [
          ...new Set(data.map((item) => item["status"])),
        ];

        setFilterOptions({
          idProof: idProofOptions,
          useCase: useCaseOptions,
          occupation: occupationOptions,
          status: statusOfBenificiary,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, [editStatus]);

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Container>
    );
  }

  // Common props for both tables
  const commonProps = {
    ngoData,
    setNgoData,
    setEditStatus,
    filterOptions,
    NgoId,
  };

  // Render appropriate component based on role
  return (
    <>
      {isAdmin ? (
        <AdminTable {...commonProps} />
      ) : (
        <NGOTable {...commonProps} mouFound={mouFound} />
      )}
    </>
  );
};

export default BeneficiaryData;