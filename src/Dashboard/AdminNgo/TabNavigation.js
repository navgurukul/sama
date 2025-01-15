import React, { useEffect } from "react";
import { Tabs, Tab, Box, CircularProgress } from "@mui/material";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchNgoDetails } from "../Redux/ngoSlice";
import NGODetails from "./NgoDetails";
import BeneficiaryData from "../BeneficiaryData";
import DataUpload from "./DataUpload";
import Preliminary from "../Preliminary";
import ManageStatuses from "../ManageStatuses"; // Ensure correct import
import { Container } from "@mui/system";
import MonthlyForm from "../MontlyReport/MothlyForm";
import MonthlyReport from "../MontlyReport";
import YearlyNgo from "../YearlyReport/index";

const TabNavigation = () => {
  const [value, setValue] = React.useState(0);
  const { id } = useParams();
  const dispatch = useDispatch();

  // Access Redux state
  const { ngoDetails, status, error } = useSelector((state) => state.ngo);

  // Dispatch the action to fetch data
  useEffect(() => {
    if (id) {
      dispatch(fetchNgoDetails(id));
    }
  }, [id, dispatch]);

  // Handle tab change
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // Render tabs dynamically
  const renderTabs = () => {
    if (status === "loading") {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "50vh",
          }}
        >
          <CircularProgress />
        </Box>
      );
    }
    const tabStyle = {
      width:"17.5rem",
      padding:"0.5rem 1.5rem",
      fontSize: "18px",
      fontFamily: "Raleway",
      fontWeight: 700,
      textTransform: "none",
      borderRadius: "100px",
      padding: "0px 28px",
      height: "48px",
      minHeight: "48px",
      color: "#5C785A",
      border: "1px solid #5C785A",
      "&.Mui-selected": {
        backgroundColor: "#5C785A",
        color: "#FFFFFF",
        border: "none",
      },
      "&:hover": {
        backgroundColor: "#5C785A",
        color: "#FFFFFF",
      },
    };

    const tabs = [
      <Tab key="ngo-details" label="NGO Details" sx={tabStyle} />,
      <Tab key="uploaded-documents" label="Uploaded Documents" sx={tabStyle} />,
    ];

    if (ngoDetails && ngoDetails[0]?.["Ngo Type"] === "1 to one") {
      tabs.push(
        <Tab key="beneficiary-data" label="Beneficiary Data" sx={tabStyle} />,
        <Tab key="manage-statuses" label="Manage Statuses" sx={tabStyle} />
      );
    } else if(ngoDetails && ngoDetails[0]?.["Ngo Type"] === "1 to many") {
      tabs.push(
        <Tab
          key="pre-distribution"
          label="Pre-Distribution Metrics"
          sx={tabStyle}
        />,
        <Tab key="monthly-metrics" label="Monthly Metrics" sx={tabStyle} />,
        <Tab key="yearly-metrics" label="Yearly Metrics" sx={tabStyle} />
      );
    }

    return tabs;
  };

  // Render tab content dynamically
  const renderTabContent = () => {
    // if (status === "loading") {
    //   return <Box>Loading NGO details...</Box>;
    // }

    if (status === "failed") {
      return <Box>Error: {error}</Box>;
    }

    if (status === "succeeded" && ngoDetails) {
      switch (value) {
        case 0:
          return <NGODetails ngo={ngoDetails} />;
        case 1:
          return <DataUpload />;
        case 2:
          if (ngoDetails[0]?.["Ngo Type"] === "1 to one") {
            return <BeneficiaryData />;
          }
          return <Preliminary />;
        case 3:
          if (ngoDetails[0]?.["Ngo Type"] === "1 to one") {
            return <ManageStatuses />;
          }
          return <MonthlyReport />; // Fallback if accessed incorrectly
        case 4:
          if (ngoDetails[0]?.["Ngo Type"] === "1 to many") {
            return <YearlyNgo />;
          }

        default:
          return null;
      }
    }

    return null;
  };

  return (
    <Container maxWidth="xl">
      <Tabs
        value={value}
        onChange={handleChange}
        centered
        sx={{
          my: 4,
          "& .MuiTabs-flexContainer": {
            gap: "16px",
          },
          "& .MuiTabs-indicator": {
            display: "none",
          },
        }}
      >
        {renderTabs()}
      </Tabs>
      <Box sx={{ mt: 2}}>{renderTabContent()}</Box>
    </Container>
  );
};

export default TabNavigation;