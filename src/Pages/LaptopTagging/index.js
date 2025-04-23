import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  Container,
  CircularProgress,
  Grid,
  Typography,
} from '@mui/material';
import MUIDataTable from "mui-datatables";
import './styles.css';
import { fetchLaptopData, updateLaptopData } from '../../components/OPS/LaptopTable/api';
import SearchBar from './SearchBar';
import FilterPanel from '../../components/OPS/LaptopTable/FilterPanel';
import ConfirmationModal from '../../components/OPS/LaptopTable/ConfirmationModal';
import ExportTools from '../../components/OPS/LaptopTable/ExportTools';
import EditButton from './EditButton';
import { getTableColumns } from '../../components/OPS/LaptopTable/LaptopTable';


function LaptopTagging() {
  // States
  const [allData, setAllData] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [idQuery, setIdQuery] = useState('');
  const [macQuery, setMacQuery] = useState('');
  const [taggedLaptops, setTaggedLaptops] = useState({});
  const [open, setOpen] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [changeStatus, setChangeStatus] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [modelStatus, setModelStatus] = useState(false);
  const [workingFilter, setWorkingFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [majorIssueFilter, setMajorIssueFilter] = useState('all');
  const [minorIssueFilter, setMinorIssueFilter] = useState('all');
  const [updateField, setUpdateField] = useState(null);
  const [updateValue, setUpdateValue] = useState(null);

  const printRef = useRef();

  // Fetch data on component mount and when refresh state changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const result = await fetchLaptopData();
        setAllData(result);
        setData(result);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [refresh]);

  

  // Apply filters when filter values change
  useEffect(() => {
    applyFilters();
  }, [workingFilter, statusFilter, majorIssueFilter, minorIssueFilter, allData]);

  // Filter application logic
  // Modified applyFilters function for LaptopTagging.js
  const applyFilters = () => {
    let filteredData = [...allData];
    
    // Apply working filter
    if (workingFilter !== 'all') {
      filteredData = filteredData.filter(laptop => 
        laptop.Working === workingFilter
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filteredData = filteredData.filter(laptop => 
        laptop.Status === statusFilter
      );
    }
    
    // Apply major issue filter
    if (majorIssueFilter !== 'all') {
      
      if (majorIssueFilter === 'yes' || majorIssueFilter === 'no') {
        // General yes/no filter
        filteredData = filteredData.filter(laptop => {
          const hasMajorIssue = laptop.MajorIssue === true || laptop.MajorIssue === "Yes";
          return majorIssueFilter === 'yes' ? hasMajorIssue : !hasMajorIssue;
        });
      } else {
        // Specific issue filter - check if the specific issue exists in the MajorIssueDetails field
        filteredData = filteredData.filter(laptop => {

          // Assuming MajorIssueDetails is either an array or a comma-separated string
          const issueDetails = typeof laptop["Major Issues"] === 'string' 
            ? laptop["Major Issues"].split(',').map(issue => issue.trim())
            : Array.isArray(laptop["Major Issues"]) 
              ? laptop["Major Issues"]
              : [];
              
          return issueDetails.includes(majorIssueFilter);
        });
      }
    }
    
    // Apply minor issue filter
    if (minorIssueFilter !== 'all') {
      if (minorIssueFilter === 'yes' || minorIssueFilter === 'no') {
        // General yes/no filter
        filteredData = filteredData.filter(laptop => {
          const hasMinorIssue = laptop.MinorIssue === true || laptop.MinorIssue === "Yes";
          return minorIssueFilter === 'yes' ? hasMinorIssue : !hasMinorIssue;
        });
      } else {
        // Specific issue filter - check if the specific issue exists in the MinorIssueDetails field
        filteredData = filteredData.filter(laptop => {

          // Assuming MinorIssueDetails is either an array or a comma-separated string
          const issueDetails = typeof laptop["Minor Issues"]=== 'string' 
            ? laptop["Minor Issues"].split(',').map(issue => issue.trim())
            : Array.isArray(laptop["Minor Issues"]) 
              ? laptop["Minor Issues"] 
              : [];
              
          return issueDetails.includes(minorIssueFilter);
        });
      }
    }
    
    // If there are specific ID or MAC queries, those take precedence
    if (idQuery || macQuery) {
      handleSearch();
    } else {
      setData(filteredData);
    }
  };

// Also update the handleSearch function to handle specific issues
  const handleSearch = () => {
    if (!idQuery && !macQuery) {
      applyFilters();
      return;
    }
    
    let filtered = allData.filter(laptop => {
      if (idQuery) {
        return String(laptop.ID).toUpperCase() === idQuery.toUpperCase();
      }
      if (macQuery) {
        return String(laptop['Mac address']).toUpperCase() === macQuery.toUpperCase();
      }
      return false;
    });

    // Apply additional filters to search results
    if (workingFilter !== 'all') {
      filtered = filtered.filter(laptop => 
        laptop.Working === workingFilter
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(laptop => 
        laptop.Status === statusFilter
      );
    }
    
    if (majorIssueFilter !== 'all') {
      if (majorIssueFilter === 'yes' || majorIssueFilter === 'no') {
        // General yes/no filter
        filtered = filtered.filter(laptop => {
          const hasMajorIssue = laptop.MajorIssue === true || laptop.MajorIssue === "Yes";
          return majorIssueFilter === 'yes' ? hasMajorIssue : !hasMajorIssue;
        });
      } else {
        // Specific issue filter
        filtered = filtered.filter(laptop => {
          const issueDetails = typeof laptop.MajorIssueDetails === 'string' 
            ? laptop.MajorIssueDetails.split(',').map(issue => issue.trim())
            : Array.isArray(laptop.MajorIssueDetails) 
              ? laptop.MajorIssueDetails 
              : [];
              
          return issueDetails.includes(majorIssueFilter);
        });
      }
    }
    
    // Apply minor issue filter
    if (minorIssueFilter !== 'all') {
      if (minorIssueFilter === 'yes' || minorIssueFilter === 'no') {
        // General yes/no filter
        filtered = filtered.filter(laptop => {
          const hasMinorIssue = laptop.MinorIssue === true || laptop.MinorIssue === "Yes";
          return minorIssueFilter === 'yes' ? hasMinorIssue : !hasMinorIssue;
        });
      } else {
        // Specific issue filter
        filtered = filtered.filter(laptop => {
          const issueDetails = typeof laptop.MinorIssueDetails === 'string' 
            ? laptop.MinorIssueDetails.split(',').map(issue => issue.trim())
            : Array.isArray(laptop.MinorIssueDetails) 
              ? laptop.MinorIssueDetails 
              : [];
              
          return issueDetails.includes(minorIssueFilter);
        });
      }
    }
    
    setData(filtered);
  };


  // Reset filters but keep search terms
  const handleResetFilters = () => {
    setWorkingFilter('all');
    setStatusFilter('all');
    setMajorIssueFilter('all');
    setMinorIssueFilter('all');
    // Reset data to all data (or search results if search is active)
    if (idQuery || macQuery) {
      handleSearch();
    } else {
      setData(allData);
    }
  };

  // Reset all filters and search terms
  const handleReset = () => {
    setIdQuery('');
    setMacQuery('');
    setTaggedLaptops({});
    setWorkingFilter('all');
    setStatusFilter('all');
    setMajorIssueFilter('all');
    setMinorIssueFilter('all');
    setData(allData);
  };


  const handleWorkingToggle = (event, rowIndex) => {
    event.stopPropagation();
    const laptopData = data[rowIndex];
    // Invert the logic - checked means Not Working
    const newStatus = event.target.checked ? "Not Working" : "Working";
    
    // Immediately update the UI for better responsiveness
    const updatedData = [...data];
    updatedData[rowIndex].Working = newStatus;
    setData(updatedData);
  
    setSelectedRowIndex(rowIndex);
    setUpdateField('Working');
    setUpdateValue(newStatus);
    setOpen(true);
  };
  
  
  // Status change handler
  const handleStatusChange = (event, rowIndex) => {
    const newValue = event.target.value;
    const updatedData = [...data];
    updatedData[rowIndex].Status = newValue;
    setData(updatedData);
    
    setSelectedRowIndex(rowIndex);
    setUpdateField('Status');
    setUpdateValue(newValue);
    setOpen(true);
  };

  // Assigned To handler
const handleAssignedToChange = (event, rowIndex) => {
  const newValue = event.target.value;
  const updatedData = [...data];
  updatedData[rowIndex]["Assigned To"] = newValue;
  setData(updatedData);
  
  setSelectedRowIndex(rowIndex);
  setUpdateField('Assigned To');
  setUpdateValue(newValue);
  setOpen(true);
};

// Donated To handler
const handleDonatedToChange = (event, rowIndex) => {
  const newValue = event.target.value;
  const updatedData = [...data];
  updatedData[rowIndex]["Allocated To"] = newValue;
  setData(updatedData);
  
  setSelectedRowIndex(rowIndex);
  setUpdateField('Allocated To');
  setUpdateValue(newValue);
  setOpen(true);
};

  const getModalProps = () => {
    let title, message;
    
    switch(updateField) {
      case 'Working':
        title = "Working Status";
        message = `Are you sure you want to mark this laptop as ${updateValue}?`;
        break;
      case 'Status':
        title = "Status Update";
        message = `Are you sure you want to change the status to "${updateValue}"?`;
        break;
      case 'Assigned To':
        title = "Assignment Update";
        message = `Are you sure you want to assign this laptop to "${updateValue}"?`;
        break;
      case 'Allocated To':
        title = "Donation Update";
        message = `Are you sure you want to mark this laptop as allocated to "${updateValue}"?`;
        break;
      default:
        title = "Confirm Update";
        message = "Are you sure you want to make this change?";
    }
    
    return { title, message };
  };


  const handleModalConfirm = async () => {
    if (selectedRowIndex === null) {
      setOpen(false);
      return;
    }
  
    const rowIndex = selectedRowIndex;
    const laptopData = data[rowIndex];
    const laptopId = laptopData?.ID;
    const currentDate = new Date().toISOString().split('T')[0];
    
    const SavedData = JSON.parse(localStorage.getItem('_AuthSama_')); 
    const userEmail = SavedData?.[0]?.email || "Email not found";

    const lastUpdatedBy = userEmail || 'Unknown';

    // Create the payload with all fields
    const payload = {
      type: "laptopLabeling",
      id: laptopId,
      working: updateField === 'Working' ? updateValue : laptopData.Working,
      // working: !changeStatus ? (!isChecked ? "Working" : "Not Working") : laptopData.Working,
      status: updateField === 'Status' ? updateValue : laptopData.Status,
      assignedTo: updateField === 'Assigned To' ? updateValue : laptopData["Assigned To"],
      donatedTo: updateField === 'Allocated To' ? updateValue : laptopData["Allocated To"],
      // Include all other fields unchanged
      donorCompanyName: laptopData["Donor Company Name"],
      ram: laptopData.RAM,
      rom: laptopData.ROM,
      manufacturerModel: laptopData["Manufacturer Model"],
      inventoryLocation: laptopData["Inventory Location"],
      macAddress: laptopData["Mac address"],
      processor: laptopData["Processor"],
      others: laptopData["Others"],
      laptopWeight: laptopData["laptop weight"],
      conditionStatus: laptopData["Condition Status"],
      manufacturingDate: laptopData["Manufacturing Date"],
      majorIssue: laptopData["MajorIssue"],
      minorIssue: laptopData["MinorIssue"],
      batteryCapacity : laptopData["Battery Capacity"],
      lastUpdatedOn: currentDate,
      lastUpdatedBy: lastUpdatedBy,
    };
  
    try {
      await updateLaptopData(payload);
      setRefresh(!refresh);
    } catch (error) {
      const originalData = [...data];
    originalData[rowIndex].Working = updateValue === "Working" ? "Not Working" : "Working";
    setData(originalData);

      console.error('Error updating the laptop:', error);
    }
  
    // Reset all state
    setOpen(false);
    setSelectedRowIndex(null);
    setUpdateField(null);
    setUpdateValue(null);
  };

  // Handle modal close
  const handleModalClose = () => {
    setOpen(false);
    setSelectedRowIndex(null);
    setIsChecked(false);
    setModelStatus(false);
    
  };

  
  // Define table columns
  const columns = getTableColumns(
    data,
    taggedLaptops,
    handleWorkingToggle,    // For Working checkbox
    handleStatusChange,     // For Status dropdown
    handleAssignedToChange, // For Assigned To dropdown
    handleDonatedToChange,  // For Donated To dropdown
    (props) => (
      <EditButton 
        {...props}
        setRefresh={setRefresh}  // Make sure this is passed
        refresh={refresh}        // And this too
      />
    )
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>

      {/* Search Bar */}
      <SearchBar 
        idQuery={idQuery}
        setIdQuery={setIdQuery}
        macQuery={macQuery}
        setMacQuery={setMacQuery}
        onSearch={handleSearch}
        handleReset={handleReset}
        loading={loading}
      />
        
      {/* Filter Panel */}
      <FilterPanel 
        workingFilter={workingFilter}
        setWorkingFilter={setWorkingFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        majorIssueFilter={majorIssueFilter}
        setMajorIssueFilter={setMajorIssueFilter}
        minorIssueFilter={minorIssueFilter}
        setMinorIssueFilter={setMinorIssueFilter}
        onResetFilters={handleResetFilters}
      />

      {/* Action Buttons */}
      

      {/* Data Table */}
      <div id="tableToPrint">
        {loading ? (
          <CircularProgress />
        ) : (
          <MUIDataTable
            elevation={0}
            title={`Laptop Data (${data.length} records)`}
            data={data}
            columns={columns}
            options={{
              responsive: 'scrollMinHeight',
              customToolbar: () => <ExportTools data={data} />,
              filterType: 'checkbox',
              selectableRows: 'none', 
              download: false,
              print: false,
              sort: false,
              viewColumns: true  
            }}
          />
        )}
      </div>
     
      {/* Confirmation Modal */}
      <ConfirmationModal 
        open={open}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
        {...getModalProps()}
      />

      {/* Hidden div for printing */}
      <div ref={printRef} style={{ display: 'none' }}></div>
    </Container>
  );
}

export default LaptopTagging;


