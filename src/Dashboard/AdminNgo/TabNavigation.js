


import React, { useEffect } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchNgoDetails } from '../Redux/ngoSlice';
import NGODetails from './NgoDetails';
import BeneficiaryData from '../BeneficiaryData';
import DataUpload from './DataUpload';
import Preliminary from '../Preliminary';
import ManageStatuses from '../ManageStatuses'; // Ensure correct import
import { Container } from '@mui/system';
import MonthlyForm from '../MontlyReport/MothlyForm';
import MonthlyReport from '../MontlyReport';

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
    const tabs = [
      <Tab key="ngo-details" label="NGO Details" />,
      <Tab key="uploaded-documents" label="Uploaded Documents" />,
    ];

    // Add Beneficiary Data and ManageStatuses tabs for "1 to one"
    if (ngoDetails && ngoDetails[0]?.['Ngo Type'] === '1 to one') {
      tabs.push(<Tab key="beneficiary-data" label="Beneficiary Data" />);
      tabs.push(<Tab key="manage-statuses" label="Manage Statuses" />);
    } else {
      tabs.push(
        <Tab key="pre-distribution" label="Pre-Distribution Metrics" />,
        <Tab key="monthly-metrics" label="Monthly Metrics" />
      );
    }

    return tabs;
  };

  // Render tab content dynamically
  const renderTabContent = () => {
    if (status === 'loading') {
      return <Box>Loading NGO details...</Box>;
    }

    if (status === 'failed') {
      return <Box>Error: {error}</Box>;
    }

    if (status === 'succeeded' && ngoDetails) {
      switch (value) {
        case 0:
          return <NGODetails ngo={ngoDetails} />;
        case 1:
          return <DataUpload />;
        case 2:
          if (ngoDetails[0]?.['Ngo Type'] === '1 to one') {
            return <BeneficiaryData />;
          }
          return <Preliminary />;
        case 3:
          if (ngoDetails[0]?.['Ngo Type'] === '1 to one') {
            return <ManageStatuses />;
          }
          return <MonthlyReport/>; // Fallback if accessed incorrectly
        default:
          return null;
      }
    }

    return null;
  };

  return (
    <Container maxWidth="lg">
      <Tabs value={value} onChange={handleChange} centered sx={{ my: 4 }}>
        {renderTabs()}
      </Tabs>
      <Box sx={{ mt: 2 }}>{renderTabContent()}</Box>
    </Container>
  );
};

export default TabNavigation;

