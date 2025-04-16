import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";
import { 
  Box, 
  Tabs, 
  Tab, 
  Typography, 
  Paper, 
  CircularProgress, 
  Container 
} from '@mui/material';
import NGODetails from './NgoDetails';
import NGOLaptopTable from './NGOLaptopTable';
import Document from './Document';
import { fetchNgoDetails } from '../Redux/ngoSlice';

// Tab Panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function NgoProfile() {
  const location = useLocation();
  const { partnerId } = location.state || {};
  const [tabValue, setTabValue] = useState(0);

  const NgoId = JSON.parse(localStorage.getItem('_AuthSama_'));
  const id = partnerId || NgoId[0]?.NgoId;
  const dispatch = useDispatch();
  
  // Fetching state from Redux
  const { ngoDetails, status, error } = useSelector((state) => state.ngo);

  useEffect(() => {
    if (id) {
      dispatch(fetchNgoDetails(id));
    }
  }, [id, dispatch]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle loading state
  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Handle error state
  if (status === 'failed') {
    return (
      <Box sx={{ textAlign: 'center', p: 3, color: 'error.main' }}>
        <Typography variant="h6">Error: {error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      
        {ngoDetails ? (
          <Box sx={{ width: '100%', mt: "64px" }}>
            <Box >
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                centered
                textColor="primary"
                indicatorColor="primary"
                aria-label="NGO information tabs"
              >
                <Tab label="NGO Details" />
                <Tab label="Documents" />
                <Tab label="Laptop Information" />
                

              </Tabs>
            </Box>
            
            <TabPanel value={tabValue} index={0}>
              <NGODetails ngo={ngoDetails} />
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <Document ngoData={ngoDetails} id={id} />
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <NGOLaptopTable ngoData={ngoDetails} />
            </TabPanel>

          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No NGO details available
            </Typography>
          </Box>
        )}
     
    </Container>
  );
}

export default NgoProfile;