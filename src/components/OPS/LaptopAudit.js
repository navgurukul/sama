import React, { useEffect, useState } from "react";
import axios from "axios";
import MUIDataTable from "mui-datatables";
import { TextField, Button, Box, Typography } from "@mui/material";


const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const [datePart, timePart] = dateStr.split(" ");
  if (!datePart || !timePart) return null;

  const [day, month, year] = datePart.split("-").map(Number);
  const [hour, minute, second] = timePart.split(":").map(Number);

  return new Date(year, month - 1, day, hour, minute, second);
};



const Audit = () => {
  const [data, setData] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [appliedSearchId, setAppliedSearchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({
    field: null,
    direction: 'asc'
  });



  const fetchAuditData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=audit&includeMeta=1&page=${page + 1}&limit=${rowsPerPage}&idQuery=${encodeURIComponent(appliedSearchId)}`
      );

      const responseData = response.data || {};
      const rows = Array.isArray(responseData.data)
        ? responseData.data
        : (Array.isArray(responseData) ? responseData : []);
      const formattedData = rows.map((row) => ({ ...row }));
      setData(formattedData);
      setTotalCount(responseData?.meta?.total ?? formattedData.length);
    } catch (err) {
      console.error("Error fetching audit data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, [page, rowsPerPage, appliedSearchId]);

  const handleSearch = () => {
    setAppliedSearchId(searchId.trim());
    setPage(0);
  };

  // Function to sort data
  const handleSort = (field) => {
    const direction =
      sortConfig.field === field && sortConfig.direction === "desc"
        ? "asc"
        : "desc";

    setSortConfig({ field, direction });

    const sortedData = [...data].sort((a, b) => {
      const valA = a[field];
      const valB = b[field];

      if (!valA) return 1;
      if (!valB) return -1;

      if (field === "Updated On") {
        const dateA = formatDate(valA);
        const dateB = formatDate(valB);
        return direction === "asc" ? dateA - dateB : dateB - dateA;
      }

      return direction === "asc"
        ? valA.toString().localeCompare(valB.toString())
        : valB.toString().localeCompare(valA.toString());
    });

    setData(sortedData);
  };

  const columns = data.length > 0
    ? Object.entries(data[0]).map(([key], columnIndex) => {
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
              names: [...new Set(data.map(row => row["Updated On"]).filter(Boolean))],
              logic: (value, filters) => !filters.includes(value)
            }
          }),
          customBodyRenderLite: (index) => {
            const cellValue = data[index][key];
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
    serverSide: true,
    count: totalCount,
    page,
    rowsPerPage,
    selectableRows: "none",
    filter: true,
    download: true,
    print: false,
    viewColumns: true,
    search: false, // we are using our own search box
    rowsPerPageOptions: [10, 20, 50, 100],
    responsive: "standard",
    onTableChange: (action, tableState) => {
      if (action === "changePage") {
        setPage(tableState.page);
      }
      if (action === "changeRowsPerPage") {
        setRowsPerPage(tableState.rowsPerPage);
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

        if (columnName === "Updated On") {
          const dateA = formatDate(valA);
          const dateB = formatDate(valB);
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
        data={data}
        columns={columns}
        options={options}
      />
    </Box>
  );
};

export default Audit;