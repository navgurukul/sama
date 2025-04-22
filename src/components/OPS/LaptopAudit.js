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
      const filteredData = data.filter((row) =>
        row["ID"]?.toLowerCase().includes(searchId.toLowerCase())
      );
      setFiltered(filteredData);
    }
  };

  // Dynamically create columns from keys
  const columns = data[0]
    ? Object.keys(data[0]).map((key) => ({
        name: key,
        label: key,
        options: {
          display: "true",
          filter: true,
          sort: false,
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
  };

  return (
    <Box sx={{ padding: 3 }}>
     <Typography variant="h5" gutterBottom align="center">
    Laptop Audit
  </Typography>

  <Box sx={{ display: "flex", gap: 2, alignItems: "center" ,align : "center", justifyContent:"center", marginBottom: 4}}>
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
