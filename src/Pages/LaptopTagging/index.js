import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  Container,
  CircularProgress,
  Grid,
  Typography,
  Paper,
  FormControl,
  Select,
  MenuItem
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
import BulkDataUpload from './BulkDataUpload';


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

  // Add this state to track selected rows
  const [selectedRows, setSelectedRows] = useState([]);
  // Track if the selection is being handled by a search/filter operation
  const [isProcessingSelection, setIsProcessingSelection] = useState(false);

  const handleRowSelection = (currentRowsSelected, allRowsSelected, rowsSelected) => {
    // If this is triggered by a filter/search operation, ignore it
    if (isProcessingSelection) return;

    // Get the last clicked row ID
    const lastSelectedId = data[rowsSelected[rowsSelected.length - 1]]?.ID;

    if (!lastSelectedId) return;

    setSelectedRows(prev => {
      // Toggle selection - remove if already selected, add if not
      return prev.includes(lastSelectedId)
        ? prev.filter(id => id !== lastSelectedId)
        : [...prev, lastSelectedId];
    });
  };

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
  const applyFilters = () => {
    let filteredData = applyAdditionalFilters(allData);

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
          const issueDetails = typeof laptop["Minor Issues"] === 'string'
            ? laptop["Minor Issues"].split(',').map(issue => issue.trim())
            : Array.isArray(laptop["Minor Issues"])
              ? laptop["Minor Issues"]
              : [];

          return issueDetails.includes(minorIssueFilter);
        });
      }
    }

    // Don't reset selections during filtering
    if (idQuery || macQuery) {
      handleSearch(filteredData);
    } else {
      setData(filteredData);
    }
  };

  // Modified to accept pre-filtered data and maintain selections
  const handleSearch = (preFilteredData = null) => {
    const dataToFilter = preFilteredData || allData;

    if (!idQuery && !macQuery) {
      setData(dataToFilter);
      return;
    }

    // Filter by ID/MAC query
    let filtered = dataToFilter.filter(laptop => {
      if (idQuery) return String(laptop.ID).toUpperCase().includes(idQuery.toUpperCase());
      if (macQuery) return String(laptop['Mac address']).toUpperCase().includes(macQuery.toUpperCase());
      return false;
    });

    // Important: Don't modify the selectedRows here
    // Just update the displayed data
    setData(filtered);
  };

  // Helper function to apply additional filters to already filtered data
  const applyAdditionalFilters = (dataToFilter) => {
    let filtered = [...dataToFilter];

    if (workingFilter !== 'all') {
      filtered = filtered.filter(laptop => laptop.Working === workingFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(laptop => laptop.Status === statusFilter);
    }

    if (majorIssueFilter !== 'all') {
      if (majorIssueFilter === 'yes' || majorIssueFilter === 'no') {
        filtered = filtered.filter(laptop => {
          const hasMajorIssue = laptop.MajorIssue === true || laptop.MajorIssue === "Yes";
          return majorIssueFilter === 'yes' ? hasMajorIssue : !hasMajorIssue;
        });
      } else {
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

    if (minorIssueFilter !== 'all') {
      if (minorIssueFilter === 'yes' || minorIssueFilter === 'no') {
        filtered = filtered.filter(laptop => {
          const hasMinorIssue = laptop.MinorIssue === true || laptop.MinorIssue === "Yes";
          return minorIssueFilter === 'yes' ? hasMinorIssue : !hasMinorIssue;
        });
      } else {
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

    return filtered;
  };

  // Reset filters but keep search terms
  const handleResetFilters = () => {
    setWorkingFilter('all');
    setStatusFilter('all');
    setMajorIssueFilter('all');
    setMinorIssueFilter('all');
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
    setSelectedRows([]); // Clear selections on full reset
    setData(allData);
  };

  const handleWorkingToggle = (event, rowIndex) => {
    event.stopPropagation();
    const laptopData = data[rowIndex];
    const newStatus = event.target.checked ? "Not Working" : "Working";

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

    if (selectedRows.length > 0) {
      title = `Bulk Update ${updateField}`;
      message = `Are you sure you want to update ${selectedRows.length} laptops' ${updateField} to "${updateValue}"?`;
    } else {
      switch (updateField) {
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
    }
    return { title, message };
  };

  const handleModalConfirm = async () => {
    if (selectedRows.length > 0 && updateField && updateValue) {
      // Handle bulk update
      const currentDate = new Date().toISOString().split('T')[0];
      const SavedData = JSON.parse(localStorage.getItem('_AuthSama_'));
      const userEmail = SavedData?.[0]?.email || "Email not found";
      const lastUpdatedBy = userEmail || 'Unknown';

      try {
        // Update each selected row
        for (const laptopId of selectedRows) {
          const laptopData = allData.find(laptop => laptop.ID === laptopId);
          if (!laptopData) continue;

          const payload = {
            type: "laptopLabeling",
            id: laptopId,
            working: updateField === 'Working' ? updateValue : laptopData.Working,
            status: updateField === 'Status' ? updateValue : laptopData.Status,
            assignedTo: updateField === 'Assigned To' ? updateValue : laptopData["Assigned To"],
            donatedTo: updateField === 'Allocated To' ? updateValue : laptopData["Allocated To"],
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
            batteryCapacity: laptopData["Battery Capacity"],
            lastUpdatedOn: currentDate,
            lastUpdatedBy: lastUpdatedBy,
          };

          await updateLaptopData(payload);
        }

        setRefresh(!refresh);
        setSelectedRows([]); // Clear selection after update
      } catch (error) {
        console.error('Error updating laptops:', error);
      }
    } else if (selectedRowIndex !== null) {
      // Handle single row update
      const laptopData = data[selectedRowIndex];
      const currentDate = new Date().toISOString().split('T')[0];
      const SavedData = JSON.parse(localStorage.getItem('_AuthSama_'));
      const userEmail = SavedData?.[0]?.email || "Email not found";
      const lastUpdatedBy = userEmail || 'Unknown';

      const payload = {
        type: "laptopLabeling",
        id: laptopData.ID,
        working: updateField === 'Working' ? updateValue : laptopData.Working,
        status: updateField === 'Status' ? updateValue : laptopData.Status,
        assignedTo: updateField === 'Assigned To' ? updateValue : laptopData["Assigned To"],
        donatedTo: updateField === 'Allocated To' ? updateValue : laptopData["Allocated To"],
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
        batteryCapacity: laptopData["Battery Capacity"],
        lastUpdatedOn: currentDate,
        lastUpdatedBy: lastUpdatedBy,
      };

      try {
        await updateLaptopData(payload);
        setRefresh(!refresh);
      } catch (error) {
        console.error('Error updating laptop:', error);
      }
    }

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

  const handleBulkUpdate = (field, value) => {
    if (selectedRows.length === 0) return;

    setUpdateField(field);
    setUpdateValue(value);
    setOpen(true);
  };

  const visibleSelections = data
    .filter(item => selectedRows.includes(item.ID))
    .map(item => data.findIndex(d => d.ID === item.ID))
    .filter(index => index !== -1);

  // Define table columns
  const columns = getTableColumns(
    data,
    taggedLaptops,
    handleWorkingToggle,    
    handleStatusChange,     
    handleAssignedToChange, 
    handleDonatedToChange,  
    (props) => (
      <EditButton
        {...props}
        setRefresh={setRefresh}  
        refresh={refresh}        
      />
    )
  );

  const hiddenSelectionsCount = selectedRows.length - visibleSelections.length;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
      {/* Search Bar */}
      <SearchBar
        idQuery={idQuery}
        setIdQuery={setIdQuery}
        macQuery={macQuery}
        setMacQuery={setMacQuery}
        onSearch={() => handleSearch()}
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

      {selectedRows.length > 0 && (
        <BulkDataUpload
          selectedRows={selectedRows}
          data={data}
          onBulkUpdate={handleBulkUpdate}
          workingFilter={workingFilter}
          statusFilter={statusFilter}
        />
      )}

      {selectedRows.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setSelectedRows([])}
            >
              Clear Selection ({selectedRows.length} selected)
            </Button>
          </Grid>

          {hiddenSelectionsCount > 0 && (
            <Grid item>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Note: {hiddenSelectionsCount} selected item(s) not shown in current view
              </Typography>
            </Grid>
          )}
        </Grid>
      )}

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
              selectableRows: 'multiple',
              onRowSelectionChange: handleRowSelection,
              selectToolbarPlacement: 'none',
              rowsSelected: data
                .map((item, index) => selectedRows.includes(item.ID) ? index : -1)
                .filter(index => index !== -1),
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