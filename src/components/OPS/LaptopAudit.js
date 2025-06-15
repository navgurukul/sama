import React, { useEffect, useState } from "react";
import axios from "axios";
import MUIDataTable from "mui-datatables";
import { TextField, Button, Box, Typography } from "@mui/material";

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString); // No need to add T10:30 if sheet already has full datetime
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const Audit = () => {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [sortConfig, setSortConfig] = useState({
    field: null,
    direction: 'asc'
  });

  const fetchAuditData = async () => {
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
    } catch (err) {
      console.error("Error fetching audit data:", err);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, []);

  const handleSearch = () => {
    if (searchId.trim() === "") {
      setFiltered(data);
    } else {
      const filteredData = data.filter((row) => {
        const id = row["ID"];
        return typeof id === "string"
          ? id.toLowerCase().includes(searchId.toLowerCase())
          : id?.toString().toLowerCase().includes(searchId.toLowerCase());
      });
      setFiltered(filteredData);
    }
  };
  

  // Function to sort data
  const handleSort = (field) => {
    const direction = sortConfig.field === field && sortConfig.direction === 'desc' ? 'asc': 'desc';
    
    setSortConfig({ field, direction });
    
    const sortedData = [...filtered].sort((a, b) => {
      if (a[field] === null || a[field] === undefined) return 1;
      if (b[field] === null || b[field] === undefined) return -1;
      
      // Check if the field might contain dates
      if (field === "Date" || field === "Updated On" || field.toLowerCase().includes('date')) {
        const dateA = new Date(a[field]);
        const dateB = new Date(b[field]);
        
        if (isNaN(dateA) || isNaN(dateB)) {
          // Fall back to string comparison if dates are invalid
          return direction === 'desc' 
            ? a[field].toString().localeCompare(b[field].toString())
            : b[field].toString().localeCompare(a[field].toString());
        }
        
        return direction === 'desc' ? dateA - dateB : dateB - dateA;
      }
      
      // Check if the field contains numbers
      if (!isNaN(a[field]) && !isNaN(b[field])) {
        return direction === 'asc' 
          ? Number(a[field]) - Number(b[field])
          : Number(b[field]) - Number(a[field]);
      }
      
      // Default string comparison
      return direction === 'asc' 
        ? a[field].toString().localeCompare(b[field].toString())
        : b[field].toString().localeCompare(a[field].toString());
    });
    
    setFiltered(sortedData);
  };

  // Custom cell rendering function for "Updated On" column
  const customCellRender = (value, tableMeta, updateValue, displayData) => {
    const columnName = columns[tableMeta.columnIndex].name;
    if (columnName === "Updated On") {
      return <Typography sx={{ fontSize: '1.1rem', fontWeight: 'medium' }}>{value}</Typography>;
    }
    return value;
  };

  // Dynamically create columns from keys
  const columns = data[0]
    ? Object.keys(data[0]).map((key) => ({
        name: key,
        label: key,
        options: {
          display: "true",
          filter: true,
          sort: key==="Updated On" ? true : false,
          sortThirdClickReset: true,
          onSort: () => handleSort(key),
          sortDirection: sortConfig.field === key ? sortConfig.direction : 'none',
          customBodyRenderLite: (dataIndex, rowIndex) => {
            const value = filtered[dataIndex][key];
            if (key === "Updated On") {
              return <Typography variant="body2">{value}</Typography>;
            }
            return value;
          },
          // For the column header
          customHeadLabelRender: (columnMeta) => {
            if (columnMeta.name === "Updated On") {
              return <Typography variant="body2" component="div">Updated On</Typography>;
            }
            return columnMeta.label;
          }
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
    sortOrder: {
      name: sortConfig.field || '',
      direction: sortConfig.direction
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h5" gutterBottom align="center">
        Laptop Audit
      </Typography>
      <Box sx={{ display: "flex", gap: 2, alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
        <TextField
          label="Search by ID"
          variant="outlined"
          size="small"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          sx={{ width: 200 }}
        />
        <Button variant="contained" size="small" onClick={handleSearch}>
          Search
        </Button>
      </Box>

      <MUIDataTable
        title={"Audit Records"}
        data={filtered}
        columns={columns}
        options={options}
      />
    </Box>
  );
};

export default Audit;