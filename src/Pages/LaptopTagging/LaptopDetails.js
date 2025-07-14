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


function LaptopDetails() {
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
  const [allocatedToFilter, setAllocatedToFilter] = useState('');

  const printRef = useRef();

  // Fetch data on component mount and when refresh state changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const result = await fetchLaptopData();
        const reversedData = [...result].reverse();

        setAllData(reversedData);
        setData(reversedData);
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
  }, [workingFilter, statusFilter, majorIssueFilter, minorIssueFilter, allocatedToFilter, allData]);

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
    if (allocatedToFilter) {
      filteredData = filteredData.filter(laptop =>
        laptop["Allocated To"] === allocatedToFilter
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
      }
      else {
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
    if (allocatedToFilter) {
      filtered = filtered.filter(laptop =>
        laptop["Allocated To"] === allocatedToFilter
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
        filtered = filtered.filter(laptop => {
          const hasMinorIssue = laptop.MinorIssue === true || laptop.MinorIssue === "Yes";
          return minorIssueFilter === 'yes' ? hasMinorIssue : !hasMinorIssue;
        });
      } else {
        // Specific issue filter
        filtered = filtered.filter(laptop => {
          const issueDetails = typeof laptop["Minor Issues"] === 'string'
            ? laptop["Minor Issues"].split(',').map(issue => issue.trim())
            : Array.isArray(laptop["Minor Issues"])
              ? laptop["Minor Issues"]
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
    setAllocatedToFilter('');
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
    setAllocatedToFilter('');
    setSortConfig({ field: null, direction: 'none' }); // Change to 'none'
    setData(allData);
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
                  <Typography variant="body2"  sx={{ fontWeight: 500, fontFamily: 'Raleway, sans-serif', fontSize: "14px", color: "rgba(0, 0, 0, 0.87)",whiteSpace: 'nowrap' }}>
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
              'ROM'
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
              sort: true,
              viewColumns: false,
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


