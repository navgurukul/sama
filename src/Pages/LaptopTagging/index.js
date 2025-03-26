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
      filteredData = filteredData.filter(laptop => {
        const isNotWorking = laptop.Working === "Not Working";
        return workingFilter === 'notWorking' ? isNotWorking : !isNotWorking;
      });
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
      filtered = filtered.filter(laptop => {
        const isNotWorking = laptop.Working === "Not Working";
        return workingFilter === 'notWorking' ? isNotWorking : !isNotWorking;
      });
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(laptop => 
        laptop.Status === statusFilter
      );
    }
    
    // Apply major issue filter
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

  // Handle checkbox click to tag laptop as working/not working
  const handleTagClick = (event, rowIndex) => {
    event.stopPropagation();
    event.preventDefault();

    const isCurrentlyChecked = taggedLaptops[rowIndex] !== undefined ? taggedLaptops[rowIndex] : data[rowIndex].Working === "Not Working";
    setSelectedRowIndex(rowIndex);
    setIsChecked(!isCurrentlyChecked);
    setChangeStatus(false);

    setOpen(true);
  };

  // Handle status change dropdown
  const handleStatusChange = (event, rowIndex) => {
    setSelectedRowIndex(rowIndex);
    const modelStatustatus = event.target.value;
    const updatedData = [...data];
    updatedData[rowIndex].Status = modelStatustatus;
    setData(updatedData);
    setModelStatus(true);
    setChangeStatus(true);
    setOpen(true);
  };

  // Handle modal confirmation
  const handleModalConfirm = async () => {
    const rowIndex = selectedRowIndex;
    const laptopData = data[rowIndex];
    const laptopId = laptopData?.ID;

    if (!changeStatus) {
      setTaggedLaptops(prevState => ({
        ...prevState,
        [rowIndex]: isChecked
      }));
    }

    const payload = {
      type: "laptopLabeling",
      id: laptopId,
      working: !changeStatus ? (!isChecked ? "Working" : "Not Working") : laptopData.Working,
      donorCompanyName: laptopData["Donor Company Name"],
      ram: laptopData.RAM,
      rom: laptopData.ROM,
      manufacturerModel: laptopData["Manufacturer Model"], 
      inventoryLocation: laptopData["Inventory Location"],
      macAddress: laptopData["Mac address"],
      processor: laptopData["Processor"],
      others: laptopData["Others"], 
      status: laptopData["Status"],
      laptopWeight: laptopData["laptop weight"],
      conditionStatus: laptopData["Condition Status"],
      manufacturingDate: laptopData["Manufacturing Date"],
      majorIssue: laptopData["MajorIssue"],
      minorIssue: laptopData["MinorIssue"]
    };
    
    try {
      await updateLaptopData(payload);
      setRefresh(!refresh);
    } catch (error) {
      console.error('Error updating the laptop:', error);
    }
   
    setOpen(false);
    setSelectedRowIndex(null);
    setIsChecked(false);
    setModelStatus(false);
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
    handleTagClick, 
    handleStatusChange,
    (props) => (
      <EditButton 
        {...props}
        setData={setData}
        setOpen={setOpen}
        setSelectedRowIndex={setSelectedRowIndex}
        setRefresh={setRefresh}
        refresh={refresh}
      />
    )
  );

  // Get modal props based on current state
  const getModalProps = () => {
    let title, message;
    
    if (modelStatus) {
      title = "Status";
      message = "Are you sure you want to change the status for this laptop?";
    } else {
      title = !isChecked ? 'Working' : 'Not Working';
      message = `Are you sure you want to mark this laptop as ${!isChecked ? 'Working' : 'Not Working'}?`;
    }
    
    return { title, message };
  };
  
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
              viewColumns: false  
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