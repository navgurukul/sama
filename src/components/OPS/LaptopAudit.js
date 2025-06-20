import React, { useEffect, useState } from "react";
import axios from "axios";
import MUIDataTable from "mui-datatables";
import { TextField, Button, Box, Typography } from "@mui/material";

// const formatDate = (dateString) => {
//   if (!dateString) return "";
//   const date = new Date(dateString);
//   return date.toLocaleString("en-IN", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: false,
//   });
// };

const parseCustomDateString = (dateStr) => {
  if (!dateStr) return null;
  const [datePart, timePart] = dateStr.split(" ");
  if (!datePart || !timePart) return null;

  const [day, month, year] = datePart.split("-").map(Number);
  const [hour, minute, second] = timePart.split(":").map(Number);

  return new Date(year, month - 1, day, hour, minute, second);
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

      const formattedData = response.data.map((row) => ({ ...row }));

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
      const filteredData = data.filter((row) =>
        row["ID"]?.toLowerCase().includes(searchId.toLowerCase())
      );
      setFiltered(filteredData);
    }
  };

  // Function to sort data
  const handleSort = (field) => {
    const direction =
      sortConfig.field === field && sortConfig.direction === "desc"
        ? "asc"
        : "desc";
  
    setSortConfig({ field, direction });
  
    const sortedData = [...filtered].sort((a, b) => {
      const valA = a[field];
      const valB = b[field];
  
      if (!valA) return 1;
      if (!valB) return -1;
  
      if (field === "Updated On") {
        const dateA = parseCustomDateString(valA);
        const dateB = parseCustomDateString(valB);
        return direction === "asc" ? dateA - dateB : dateB - dateA;
      }
  
      return direction === "asc"
        ? valA.toString().localeCompare(valB.toString())
        : valB.toString().localeCompare(valA.toString());
    });
  
    setFiltered(sortedData);
  };
  
  
  // Custom cell rendering function for "Updated On" column
  // const customCellRender = (value, tableMeta, updateValue, displayData) => {
  //   const columnName = columns[tableMeta.columnIndex].name;
  //   if (columnName === "Updated On") {
  //     return <Typography sx={{ fontSize: '1.1rem', fontWeight: 'medium' }}>{value}</Typography>;
  //   }
  //   return value;
  // };

  // Dynamically create columns from keys
  // const getUniqueFormattedDates = () => {
  //   const uniqueDates = [...new Set(filtered.map(row => row["Updated On"]).filter(Boolean))];
  //   return uniqueDates.map(dateString => formatDate(dateString));
  // };
  
  const columns = filtered.length > 0
    ? Object.entries(filtered[0]).map(([key], columnIndex) => {
        const isUpdatedOn = key === "Updated On";
  
        return {
          name: key,
          label: key,
          options: {
            display: "true",
            filter: true,
            sort: isUpdatedOn,
            sortDirection: sortConfig.field === key ? sortConfig.direction : "none",
            onSort: () => handleSort(key),
            ...(isUpdatedOn && {
              filterOptions: {
                names: [...new Set(filtered.map(row => row["Updated On"]).filter(Boolean))],
                logic: (value, filters) => !filters.includes(value)
              }              
            }),
            customBodyRenderLite: (index) => {
              const cellValue = filtered[index][key];
              return isUpdatedOn ? (
                <Typography variant="body2">{cellValue}</Typography>
              ) : (
                cellValue
              );
            },                      
            customHeadLabelRender: ({ name, label }) =>
              name === "Updated On" ? (
                <Typography variant="body2">Updated On</Typography>
              ) : (
                label
              ),
          },
        };
      })
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
    },
    customSort: (data, colIndex, order) => {
      const columnName = columns[colIndex]?.name;
  
      return data.sort((a, b) => {
        const valA = a.data[colIndex];
        const valB = b.data[colIndex];
  
        if (columnName === "Updated On") {
          const dateA = parseCustomDateString(valA);
          const dateB = parseCustomDateString(valB);
          return order === "asc" ? dateA - dateB : dateB - dateA;
        }
  
        // Default string comparison
        return order === "asc"
          ? valA?.toString().localeCompare(valB?.toString())
          : valB?.toString().localeCompare(valA?.toString());
      });
    },
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