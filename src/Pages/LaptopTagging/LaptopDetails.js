import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  Container,
  CircularProgress,
  Grid,
  Typography,
  Box,
} from '@mui/material';
import MUIDataTable from "mui-datatables";
import './styles.css';
import { fetchLaptopData, updateLaptopData } from '../../components/OPS/LaptopTable/api';
import SearchBar from './SearchBar';
import FilterPanel from '../../components/OPS/LaptopTable/FilterPanel';
import ExportTools from '../../components/OPS/LaptopTable/ExportTools';

const formatDate = (dateString) => {
  if (!dateString) return "Not Updated";

  try {
    const normalized = String(dateString).trim().replace(' ', 'T');
    const isoMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
    if (isoMatch) {
      const [, year, month, day, hours, minutes, seconds] = isoMatch;
      return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // Handle cases where dateString is already in a different format
      return dateString;
    }

    // Format as DD-MM-YYYY HH:MM:SS
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error("Date formatting error:", error);
    return dateString;
  }
};


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



function LaptopDetails() {
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const printRef = useRef();

  // Server-side pagination: fetch only active page + filter combination.
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

  // Add this new state after your existing useState declarations
  // Change your existing sortConfig state to:
  const [sortConfig, setSortConfig] = useState({
    field: null,
    direction: 'none' // Start with 'none' instead of 'asc'
  });




  const handleSort = (field) => {
    const direction =
      sortConfig.field === field && sortConfig.direction === "desc"
        ? "asc"
        : "desc";

    setSortConfig({ field, direction });

    const sortedData = [...data].sort((a, b) => {
      const valA = a[field];
      const valB = b[field];

      if (!valA && !valB) return 0;
      if (!valA) return 1;
      if (!valB) return -1;

      // Special handling for date fields
      if (field === "Last Updated On" || field === "Date Committed" || field === "Manufacturing Date") {
        const dateA = formatDateForSort(valA);
        const dateB = formatDateForSort(valB);
        return direction === "asc" ? dateA - dateB : dateB - dateA;
      }

      // Default string comparison for other fields
      return direction === "asc"
        ? valA.toString().localeCompare(valB.toString())
        : valB.toString().localeCompare(valA.toString());
    });

    setData(sortedData);
  };

  const handleSearch = () => {
    setAppliedIdQuery(idQuery.trim());
    setAppliedMacQuery(macQuery.trim());
    setPage(0);
  };


  // Reset filters but keep search terms
  const handleResetFilters = () => {
    setWorkingFilter('all');
    setStatusFilter('all');
    setMajorIssueFilter('all');
    setMinorIssueFilter('all');
    setAllocatedToFilter('');
    setPage(0);
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
    setSortConfig({ field: null, direction: 'none' }); // Change to 'none'
  };


  const columns = data[0]
    ? Object.keys(data[0])
      .filter(key => key !== 'barcodeUrl') // Filter out the barcodeUrl key
      .map((key) => {
        if (key === "Last Updated On") {
          return {
            name: key,
            label: key,
            options: {
              filter: false,
              sort: true,
              sortDirection: sortConfig.field === key ? sortConfig.direction : "none",
              customBodyRender: (value) => (
                <Typography variant="body2" noWrap>
                  {formatDate(value)}
                </Typography>
              ),
              customHeadLabelRender: ({ label }) => (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',

                  }}
                  onClick={() => handleSort(key)}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: 'Raleway, sans-serif', fontSize: "14px", color: "rgba(0, 0, 0, 0.87)", whiteSpace: 'nowrap' }}>
                    {label}
                  </Typography>

                </Box>
              ),
              setCellProps: () => ({
                className: 'custom-body-cell',
              }),
              setCellHeaderProps: () => ({
                className: 'custom-header-cell',
              }),
            },
          };
        }
        if (key === "Inspection Files") {
          return {
            name: key,
            label: key,
            options: {
              filter: false,
              sort: false,
              customBodyRender: (value, tableMeta) => {
                const rowIndex = tableMeta.rowIndex;
                const laptopData = data[rowIndex];

                const rawLinks = laptopData["Inspection Files"] || laptopData.inspectionFiles;

                if (!rawLinks || typeof rawLinks !== 'string') {
                  return <Typography variant="body2" color="textSecondary">No files</Typography>;
                }

                // Clean and split the links
                const cleanedLinks = rawLinks
                  .replace(/'/g, '') // Remove single quotes
                  .split(/,\s*|\s+/) // Split by comma (with optional space) or any whitespace
                  .filter(link => link.startsWith('http'));

                if (cleanedLinks.length === 0) {
                  return <Typography variant="body2" color="textSecondary">No valid links</Typography>;
                }

                return (
                  <Box sx={{ position: 'relative' }}>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        minWidth: '100px',
                        textTransform: 'none',
                        fontSize: '0.8rem',
                        padding: '4px 12px',
                        borderColor: 'divider',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Files ({cleanedLinks.length})
                      <Box component="span" sx={{ ml: 0.5 }}>▼</Box>
                    </Button>
                    <Box
                      component="div"
                      sx={{
                        position: 'absolute',
                        right: '0%',
                        top: 50,
                        zIndex: 100,
                        backgroundColor: 'background.paper',
                        boxShadow: 3,
                        borderRadius: 1,
                        minWidth: '160px',
                        border: '1px solid',
                        borderColor: 'divider',
                        display: 'none',
                        '&:hover': {
                          display: 'block'
                        },
                        'button:hover + &, &:hover': {
                          display: 'block'
                        }
                      }}
                    >
                      {cleanedLinks.map((link, index) => (
                        <Box
                          key={index}
                          component="a"
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            display: 'block',
                            padding: '8px 16px',
                            textDecoration: 'none',
                            color: 'text.primary',
                            fontSize: '0.8rem',
                            '&:hover': {
                              backgroundColor: 'action.selected',
                              color: 'primary.main'
                            }
                          }}
                        >
                          Inspection File {index + 1}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                );
              },
            }
          };
        }
        if (key === "Date Committed" || key === "Manufacturing Date") {
          return {
            name: key,
            label: key,
            options: {
              filter: false,
              sort: false,
              customBodyRender: (value) => (
                <Typography variant="body2">
                  {formatDate(value)}
                </Typography>
              )
            }
          };
        }
        return {
          name: key,
          label: key,
          options: {
            display: "true",
            filter: ![
              'ID',
              'Manufacturing Date',
              'Manufacturer Model',
              'Major Issues',
              'Mac address',
              'Last Updated On',
              'Battery Capacity',
              'Date Committed',
              'Processor',
              'Condition Status',
              'Minor Issues',
              'Comment for the Issues',
              'Allocated To',
              'RAM',
              'ROM',
              "Batch"
            ].includes(key),
            sort: false,
          },
        };
      })
    : [];

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
        allocatedToFilter={allocatedToFilter}
        setAllocatedToFilter={setAllocatedToFilter}
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
              selectableRows: 'none',
              download: false,
              print: false,
              sort: true,
              viewColumns: false,
              onTableChange: (action, tableState) => {
                if (action === 'changePage') {
                  setPage(tableState.page);
                }
                if (action === 'changeRowsPerPage') {
                  setRowsPerPage(tableState.rowsPerPage);
                  setPage(0);
                }
                if (action === 'search') {
                  const searchText = (tableState.searchText || '').trim();
                  setIdQuery(searchText);
                  setAppliedIdQuery(searchText);
                  setPage(0);
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



      {/* Hidden div for printing */}
      <div ref={printRef} style={{ display: 'none' }}></div>
    </Container>
  );
}

export default LaptopDetails;


