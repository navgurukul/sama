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
import BulkEditPanel from './BulkEditPanel';

const formatDateForSort = (dateStr) => {
  if (!dateStr) return new Date(0); // Return epoch time for null dates

  try {
    // Handle different date formats
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      // Try parsing DD-MM-YYYY HH:MM:SS format
      const [datePart, timePart] = dateStr.split(" ");
      if (datePart && timePart) {
        const [day, month, year] = datePart.split("-").map(Number);
        const [hour, minute, second] = timePart.split(":").map(Number);
        return new Date(year, month - 1, day, hour, minute, second);
      }
      return new Date(0);
    }
    return date;
  } catch (error) {
    console.error("Date parsing error:", error);
    return new Date(0);
  }
};

const normalizeValue = (value) => (value ?? '').toString().trim().toLowerCase();

const parseIssues = (value) => {
  if (Array.isArray(value)) return value.map((item) => normalizeValue(item));
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => normalizeValue(item))
      .filter(Boolean);
  }
  return [];
};

const hasIssue = (laptop, issueKey, filterValue) => {
  const issues = parseIssues(laptop[issueKey]);
  if (filterValue === 'yes') return issues.length > 0;
  if (filterValue === 'no') return issues.length === 0;
  return issues.includes(normalizeValue(filterValue));
};

const applyClientFilters = (rows, {
  idQuery,
  macQuery,
  workingFilter,
  statusFilter,
  majorIssueFilter,
  minorIssueFilter,
  allocatedToFilter,
}) => {
  const idNeedle = normalizeValue(idQuery);
  const macNeedle = normalizeValue(macQuery);
  const workingNeedle = normalizeValue(workingFilter);
  const statusNeedle = normalizeValue(statusFilter);
  const allocatedNeedle = normalizeValue(allocatedToFilter);

  return rows.filter((laptop) => {
    if (idNeedle && !normalizeValue(laptop.ID).includes(idNeedle)) return false;
    if (macNeedle && !normalizeValue(laptop['Mac address']).includes(macNeedle)) return false;
    if (workingNeedle !== 'all' && normalizeValue(laptop.Working) !== workingNeedle) return false;
    if (statusNeedle !== 'all' && normalizeValue(laptop.Status) !== statusNeedle) return false;
    if (allocatedNeedle && normalizeValue(laptop['Allocated To']) !== allocatedNeedle) return false;
    if (majorIssueFilter !== 'all' && !hasIssue(laptop, 'Major Issues', majorIssueFilter)) return false;
    if (minorIssueFilter !== 'all' && !hasIssue(laptop, 'Minor Issues', minorIssueFilter)) return false;
    return true;
  });
};


function LaptopTagging() {
  // States
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [idQuery, setIdQuery] = useState('');
  const [macQuery, setMacQuery] = useState('');
  const [appliedIdQuery, setAppliedIdQuery] = useState('');
  const [appliedMacQuery, setAppliedMacQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
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
  const [allocatedToFilter, setAllocatedToFilter] = useState('');
  const [pendingChange, setPendingChange] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);


  const printRef = useRef();

  const [selectedRows, setSelectedRows] = useState([]);
  const [isProcessingSelection, setIsProcessingSelection] = useState(false);

  // Sort configuration state
  const [sortConfig, setSortConfig] = useState({
    field: null,
    direction: 'asc'
  });

  // Enhanced handleSort function for date sorting
  const handleSort = (field) => {
    let direction;

    if (sortConfig.field !== field) {
      direction = "asc";
    }
    else {
      switch (sortConfig.direction) {
        case "none":
          direction = "asc";  // First click → oldest first
          break;
        case "asc":
          direction = "desc"; // Second click → newest first
          break;
        case "desc":
          direction = "none"; // Third click → back to default
          break;
        default:
          direction = "asc";
      }
    }

    setSortConfig({ field, direction });

    if (direction === "none") return;

    // Apply sorting
    const sortedData = [...data].sort((a, b) => {
      const valA = a[field];
      const valB = b[field];

      if (!valA && !valB) return 0;
      if (!valA) return 1;
      if (!valB) return -1;

      // Date sorting
      if (field === "Last Updated On" || field === "updatedOn") {
        const dateA = formatDateForSort(valA);
        const dateB = formatDateForSort(valB);
        return direction === "asc" ? dateA - dateB : dateB - dateA;
      }

      // Default string sorting
      return direction === "asc"
        ? valA.toString().localeCompare(valB.toString())
        : valB.toString().localeCompare(valA.toString());
    });

    setData(sortedData);
  };


  const handleRowSelection = (currentRowsSelected, allRowsSelected, rowsSelected) => {
    if (isProcessingSelection) return;

    const selectedIds = rowsSelected.map(index => data[index]?.ID).filter(Boolean);
    setSelectedRows([...new Set(selectedIds)]);
  };

  // Server-side pagination: fetch only the visible page with active filters.
  useEffect(() => {
    const loadPageData = async () => {
      setLoading(true);
      try {
        const result = await fetchLaptopData({
          includeBarcode: false,
          includeMeta: true,
          page: page + 1,
          limit: rowsPerPage,
          idQuery: appliedIdQuery || undefined,
          macQuery: appliedMacQuery || undefined,
          workingFilter: workingFilter !== 'all' ? workingFilter : undefined,
          statusFilter: statusFilter !== 'all' ? statusFilter : undefined,
          majorIssueFilter: majorIssueFilter !== 'all' ? majorIssueFilter : undefined,
          minorIssueFilter: minorIssueFilter !== 'all' ? minorIssueFilter : undefined,
          allocatedToFilter: allocatedToFilter || undefined,
          noCache: true,
        });
        const rows = Array.isArray(result?.data)
          ? result.data
          : (Array.isArray(result) ? result : []);

        setData(rows);
        setTotalCount(result?.meta?.total ?? rows.length);
      } catch (error) {
        console.error('Error fetching paginated laptop data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, [
    refresh,
    page,
    rowsPerPage,
    appliedIdQuery,
    appliedMacQuery,
    workingFilter,
    statusFilter,
    majorIssueFilter,
    minorIssueFilter,
    allocatedToFilter,
  ]);


  useEffect(() => {
    if (!isProcessingSelection && selectedRows.length === 0) {
      setIsProcessingSelection(true);
      // Any cleanup or reset logic if needed
      setIsProcessingSelection(false);
    }
  }, [selectedRows, isProcessingSelection]);

  const handleSearch = () => {
    setAppliedIdQuery(idQuery.trim());
    setAppliedMacQuery(macQuery.trim());
    setPage(0);
    setSelectedRows([]);
  };

  // Reset filters but keep search terms
  const handleResetFilters = () => {
    setWorkingFilter('all');
    setStatusFilter('all');
    setMajorIssueFilter('all');
    setMinorIssueFilter('all');
    setAllocatedToFilter('');
    setPage(0);
    setSelectedRows([]);
  };

  // Reset all filters and search terms
  const handleReset = () => {
    setIdQuery('');
    setMacQuery('');
    setAppliedIdQuery('');
    setAppliedMacQuery('');
    setTaggedLaptops({});
    setWorkingFilter('all');
    setStatusFilter('all');
    setMajorIssueFilter('all');
    setMinorIssueFilter('all');
    setAllocatedToFilter('');
    setPage(0);
    setSelectedRows([]); // Clear selections on full reset
    setSortConfig({ field: null, direction: 'asc' }); // Reset sort config
  };

  const handleWorkingToggle = (event, rowIndex) => {
    event.stopPropagation();
    const laptopData = data[rowIndex];
    const newStatus = event.target.checked ? "Not Working" : "Working";

    // const updatedData = [...data];
    // updatedData[rowIndex].Working = newStatus;
    // setData(updatedData);

    setSelectedRowIndex(rowIndex);
    setUpdateField('Working');
    setUpdateValue(newStatus);
    setPendingChange({ rowIndex, field: 'Working', value: newStatus }); // Add this
    setOpen(true);
  };

  // Status change handler
  const handleStatusChange = (event, rowIndex) => {
    const newValue = event.target.value;

    // const updatedData = [...data];
    // updatedData[rowIndex].Status = newValue;
    // setData(updatedData);

    setSelectedRowIndex(rowIndex);
    setUpdateField('Status');
    setUpdateValue(newValue);
    setPendingChange({ rowIndex, field: 'Status', value: newValue }); // Add this
    setOpen(true);
  };

  // Assigned To handler
  const handleAssignedToChange = (event, rowIndex) => {
    const newValue = event.target.value;

    // const updatedData = [...data];
    // updatedData[rowIndex]["Assigned To"] = newValue;
    // setData(updatedData);

    setSelectedRowIndex(rowIndex);
    setUpdateField('Assigned To');
    setUpdateValue(newValue);
    setPendingChange({ rowIndex, field: 'Assigned To', value: newValue }); // Add this
    setOpen(true);
  };

  // Donated To handler
  const handleDonatedToChange = (event, rowIndex) => {
    const newValue = event.target.value;

    // const updatedData = [...data];
    // updatedData[rowIndex]["Allocated To"] = newValue;
    // setData(updatedData);

    setSelectedRowIndex(rowIndex);
    setUpdateField('Allocated To');
    setUpdateValue(newValue);
    setPendingChange({ rowIndex, field: 'Allocated To', value: newValue }); // Add this
    setOpen(true);
  };

  const getModalProps = () => {
    let title, message;

    if (selectedRows.length > 0) {
      if (Array.isArray(updateValue)) {
        // Handle multiple updates
        title = "Bulk Update Multiple Fields";
        const updatesText = updateValue.map(update =>
          `${update.field} to "${update.value}"`
        ).join(' and ');
        message = `Are you sure you want to update ${selectedRows.length} laptops' ${updatesText}?`;
      } else {
        // Single field update
        title = `Bulk Update ${updateField}`;
        message = `Are you sure you want to update ${selectedRows.length} laptops' ${updateField} to "${updateValue}"?`;
      }
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
    if (pendingChange && selectedRowIndex !== null) {
      const updatedData = [...data];
      updatedData[pendingChange.rowIndex][pendingChange.field] = pendingChange.value;
      setData(updatedData);
    }
    if (selectedRows.length > 0) {
      const currentDate = new Date().toISOString().split('T')[0];
      const SavedData = JSON.parse(localStorage.getItem('_AuthSama_'));
      const userEmail = SavedData?.[0]?.email || "Email not found";
      const lastUpdatedBy = userEmail || 'Unknown';

      try {
        // Handle both single and multiple updates
        const updates = Array.isArray(updateValue) ? updateValue : [{ field: updateField, value: updateValue }];

        for (const laptopId of selectedRows) {
          const laptopData = data.find(laptop => laptop.ID === laptopId);
          if (!laptopData) continue;

          const payload = {
            type: "laptopLabeling",
            id: laptopId,
            donorCompanyName: laptopData["Donor Company Name"],
            ram: laptopData.RAM,
            rom: laptopData.ROM,
            manufacturerModel: laptopData["Manufacturer Model"],
            processor: laptopData.Processor,
            manufacturingDate: laptopData["Manufacturing Date"],
            conditionStatus: laptopData["Condition Status"],
            majorIssues: laptopData["Major Issues"] ? laptopData["Major Issues"].split(",") : [],
            minorIssues: laptopData["Minor Issues"] ? laptopData["Minor Issues"].split(",") : [],
            otherIssues: laptopData["Other Issues"],
            inventoryLocation: laptopData["Inventory Location"],
            laptopWeight: laptopData["laptop weight"],
            macAddress: laptopData["Mac address"],
            batteryCapacity: laptopData["Battery Capacity"],
            comment: laptopData["Comment for the Issues"],
            working: laptopData.Working,
            status: laptopData.Status,
            assignedTo: laptopData["Assigned To"],
            donatedTo: laptopData["Allocated To"],
            lastUpdatedOn: currentDate,
            lastUpdatedBy: lastUpdatedBy,
            batch: laptopData.Batch,
          };

          // Apply all updates to the payload
          updates.forEach(update => {
            switch (update.field) {
              case 'working':
                payload.working = update.value;
                break;
              case 'status':
                payload.status = update.value;
                break;
              case 'assignedTo':
                payload.assignedTo = update.value;
                break;
              case 'donatedTo':
                payload.donatedTo = update.value;
                break;
            }
          });

          await updateLaptopData(payload);
        }

        setRefresh(!refresh);
        setSelectedRows([]);
      } catch (error) {
        console.error('Error updating laptops:', error);
      }
    } else if (selectedRowIndex !== null) {
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
        majorIssues: laptopData["Major Issues"] ? laptopData["Major Issues"].split(",") : [],
        minorIssues: laptopData["Minor Issues"] ? laptopData["Minor Issues"].split(",") : [],
        batteryCapacity: laptopData["Battery Capacity"],
        lastUpdatedOn: currentDate,
        lastUpdatedBy: lastUpdatedBy,
        batch: laptopData.Batch,
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
    setPendingChange(null);
  };

  const handleBulkUpdate = (updates) => {
    if (selectedRows.length === 0 || !updates || updates.length === 0) return;


    // Transform updates to match backend field names
    const backendUpdates = updates.map(update => {
      switch (update.field) {
        case 'Allocated To':
          return { field: 'donatedTo', value: update.value };
        case 'Assigned To':
          return { field: 'assignedTo', value: update.value };
        case 'Working':
          return { field: 'working', value: update.value };
        case 'Status':
          return { field: 'status', value: update.value };
        default:
          return update;
      }
    });

    setUpdateField('Multiple');
    setUpdateValue(backendUpdates); // Store the transformed updates
    setOpen(true);
  };

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
    ),
    refresh,
    setRefresh,
    sortConfig,  // Pass sortConfig
    handleSort   // Pass handleSort
  );

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
        allocatedToFilter={allocatedToFilter}
        setAllocatedToFilter={setAllocatedToFilter}
        onResetFilters={handleResetFilters}
      />

      {selectedRows.length > 0 && (
        <BulkEditPanel
          selectedRows={selectedRows}
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
        </Grid>
      )}

      <div id="tableToPrint">
        {loading ? (
          <CircularProgress />
        ) : (
          <MUIDataTable
            elevation={0}
            title={`Laptop Data (${totalCount} records)`}
            data={data}
            columns={columns}
            options={{
              serverSide: true,
              count: totalCount,
              page,
              rowsPerPage,
              rowsPerPageOptions: [10, 25, 50, 100],
              responsive: 'scrollMinHeight',
              customToolbar: () => <ExportTools data={data} />,
              filterType: 'checkbox',
              selectableRows: 'multiple',
              onRowSelectionChange: handleRowSelection,
              selectToolbarPlacement: 'none',
              rowsSelected: data
                .map((item, index) => selectedRows.includes(item.ID) ? index : -1)
                .filter(index => index !== -1),
              onRowsDelete: () => false,
              download: false,
              print: false,
              sort: true,
              viewColumns: true,
              onTableChange: (action, tableState) => {
                if (action === 'changePage') {
                  setPage(tableState.page);
                  setSelectedRows([]);
                }
                if (action === 'changeRowsPerPage') {
                  setRowsPerPage(tableState.rowsPerPage);
                  setPage(0);
                  setSelectedRows([]);
                }
                if (action === 'search') {
                  const searchText = (tableState.searchText || '').trim();
                  setIdQuery(searchText);
                  setAppliedIdQuery(searchText);
                  setPage(0);
                  setSelectedRows([]);
                }
              },
              sortOrder: {
                name: sortConfig.field || '',
                direction: sortConfig.direction
              },
              customSort: (data, colIndex, order) => {
                const columnName = columns[colIndex]?.name;
                return data.sort((a, b) => {
                  const valA = a.data[colIndex];
                  const valB = b.data[colIndex];

                  if (columnName === "updatedOn" || columnName === "Last Updated On") {
                    const dateA = new Date(valA);
                    const dateB = new Date(valB);
                    return order === "asc" ? dateA - dateB : dateB - dateA;
                  }
                  return order === "asc"
                    ? valA?.toString().localeCompare(valB?.toString())
                    : valB?.toString().localeCompare(valA?.toString());
                });
              },
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