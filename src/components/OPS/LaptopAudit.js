import React, { useEffect, useState } from "react";
import axios from "axios";
import MUIDataTable from "mui-datatables";
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Paper,
  Grid,
  Divider,
  Chip,
  Autocomplete,
  IconButton,
  Tooltip,
  Container
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CommentIcon from '@mui/icons-material/Comment';
import InfoIcon from '@mui/icons-material/Info';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const Audit = () => {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [fieldFilter, setFieldFilter] = useState("all");
  const [fieldOptions, setFieldOptions] = useState(["all"]);
  const [uniqueIds, setUniqueIds] = useState([]);
  const [showCommentsOnly, setShowCommentsOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [fromValue, setFromValue] = useState("");
  const [toValue, setToValue] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchAuditData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=audit`
      );

      const formattedData = response.data.map((row) => {
        const newRow = { ...row };
        if (newRow["Date"]) {
          newRow["Date"] = formatDate(newRow["Date"]);
        }
        if (newRow["Last Updated On"]) {
          newRow["Last Updated On"] = formatDate(newRow["Last Updated On"]);
        }
        return newRow;
      });

      setData(formattedData);
      setFiltered(formattedData);

      // Extract all unique field values
      const uniqueFields = new Set(
        formattedData
          .map((item) => item.Field || "")
          .filter((field) => field !== "")
      );
      
      setFieldOptions(["all", ...Array.from(uniqueFields).sort()]);
      
      // Extract all unique IDs
      const ids = new Set(
        formattedData
          .map((item) => item.ID || "")
          .filter((id) => id !== "")
      );
      
      setUniqueIds([...Array.from(ids).sort()]);
      
    } catch (err) {
      console.error("Error fetching audit data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, []);

  // Function to toggle display of comments for issues only
  const toggleCommentsOnly = () => {
    setShowCommentsOnly(!showCommentsOnly);
    
    if (!showCommentsOnly) {
      // Apply the filter for "Comment for the Issues" records
      const commentsData = data.filter((row) => 
        row["Field"] === "Comment for the Issues"
      );
      setFiltered(commentsData);
    } else {
      // Reset to current search parameters
      handleSearch();
    }
  };

  const handleSearch = () => {
    let filteredData = [...data];
    
    // Filter by ID if search term is provided
    if (searchId.trim() !== "") {
      filteredData = filteredData.filter((row) =>
        row["ID"]?.toLowerCase().includes(searchId.toLowerCase())
      );
    }
    
    // Filter by field value if not "all"
    if (fieldFilter !== "all") {
      filteredData = filteredData.filter((row) => 
        row["Field"] === fieldFilter
      );
    }
    
    // Filter by From value if provided
    if (fromValue.trim() !== "") {
      filteredData = filteredData.filter((row) =>
        row["From "]?.toLowerCase().includes(fromValue.toLowerCase())
      );
    }
    
    // Filter by To value if provided
    if (toValue.trim() !== "") {
      filteredData = filteredData.filter((row) =>
        row["To"]?.toLowerCase().includes(toValue.toLowerCase())
      );
    }
    
    // Apply comment filter if enabled
    if (showCommentsOnly) {
      filteredData = filteredData.filter((row) => 
        row["Field"] === "Comment for the Issues"
      );
    }
    
    setFiltered(filteredData);
  };

  // Reset filters
  const handleReset = () => {
    setSearchId("");
    setFieldFilter("all");
    setFromValue("");
    setToValue("");
    setShowCommentsOnly(false);
    setFiltered(data);
  };

  // Toggle advanced filters visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Dynamically create columns from keys
  const columns = data[0]
    ? Object.keys(data[0]).map((key) => ({
        name: key,
        label: key,
        options: {
          display: true,
          filter: true,
          sort: true,
          setCellProps: () => ({
            style: { 
              whiteSpace: 'normal',
              wordBreak: 'break-word'
            }
          })
        },
      }))
    : [];

  const options = {
    selectableRows: "none",
    filter: true,
    download: true,
    print: false,
    viewColumns: true,
    search: false, // we are using our own search box
    rowsPerPage: 10,
    rowsPerPageOptions: [10, 20, 50, 100],
    responsive: "standard",
    textLabels: {
      body: {
        noMatch: loading ? "Loading data..." : "No matching records found",
      }
    }
  };

  return (
    <Container maxWidth="xl" sx={{ padding: '20px' }}>
      <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 600, mb: 3 }}>
        Laptop Audit History
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Autocomplete
              freeSolo
              options={uniqueIds}
              value={searchId}
              onChange={(event, newValue) => {
                setSearchId(newValue || "");
              }}
              inputValue={searchId}
              onInputChange={(event, newInputValue) => {
                setSearchId(newInputValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search by Laptop ID"
                  variant="outlined"
                  size="small"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <SearchIcon color="action" sx={{ mr: 1 }} />
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={8}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'flex-start', sm: 'flex-end' }, flexWrap: 'wrap' }}>
              <Button 
                variant={showCommentsOnly ? "contained" : "outlined"} 
                color={showCommentsOnly ? "info" : "primary"}
                size="medium"
                startIcon={<CommentIcon />}
                onClick={toggleCommentsOnly}
              >
                Comment for the Issues
              </Button>
              
              <Button 
                variant="outlined" 
                color="primary" 
                size="medium"
                startIcon={<FilterListIcon />}
                onClick={toggleFilters}
              >
                {showFilters ? "Hide Filters" : "Advanced Filters"}
              </Button>
              
              <Button 
                variant="contained" 
                color="primary" 
                size="medium"
                startIcon={<SearchIcon />}
                onClick={handleSearch}
              >
                Search
              </Button>
              
              <Button 
                variant="outlined" 
                color="secondary" 
                size="medium"
                startIcon={<RestartAltIcon />}
                onClick={handleReset}
              >
                Reset
              </Button>
            </Box>
          </Grid>
          
          {showFilters && (
            <>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }}>
                  <Chip label="Advanced Filters" />
                </Divider>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel id="field-filter-label">Field Type</InputLabel>
                  <Select
                    labelId="field-filter-label"
                    id="field-filter"
                    value={fieldFilter}
                    label="Field Type"
                    onChange={(e) => setFieldFilter(e.target.value)}
                  >
                    {fieldOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option === "all" ? "All Fields" : option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="From Value Contains"
                  variant="outlined"
                  value={fromValue}
                  onChange={(e) => setFromValue(e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="To Value Contains"
                  variant="outlined"
                  value={toValue}
                  onChange={(e) => setToValue(e.target.value)}
                />
              </Grid>
            </>
          )}
        </Grid>
        
        {showCommentsOnly && (
          <Box sx={{ mt: 2, p: 1, bgcolor: 'info.light', borderRadius: 1, display: 'flex', alignItems: 'center' }}>
            <CommentIcon sx={{ mr: 1, color: 'info.dark' }} />
            <Typography variant="body2" color="info.dark">
              Filtered to show only "Comment for the Issues" records
            </Typography>
          </Box>
        )}
        
        {filtered.length > 0 && searchId && (
          <Box sx={{ mt: 2, p: 1, bgcolor: 'info.light', borderRadius: 1, display: 'flex', alignItems: 'center' }}>
            <SearchIcon sx={{ mr: 1, color: 'info.dark' }} />
            <Typography variant="body2" color="info.dark">
              Showing {filtered.length} audit records for laptop ID: <strong>{searchId}</strong>
            </Typography>
          </Box>
        )}
      </Paper>

      <MUIDataTable
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Typography variant="h6">
              {filtered.length} Audit Records Found
            </Typography>
            <Tooltip title="The audit history shows all changes made to laptop records, including status updates, assignment changes, and issue reports">
              <IconButton size="small">
                <CompareArrowsIcon />
              </IconButton>
            </Tooltip>
          </Box>
        }
        data={filtered}
        columns={columns}
        options={options}
      />
    </Container>
  );
};

export default Audit;