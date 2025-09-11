import React, { useEffect, useState } from "react";
import MUIDataTable from "mui-datatables";
import { Typography, Chip, Select, MenuItem } from "@mui/material";

const PickupRequestByDoner = ({ selectedOrganization }) => {
  const [pickups, setPickups] = useState([]);
  const [totalPickups, setTotalPickups] = useState(0);

  useEffect(() => {
    const fetchPickups = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=pickupget`
        );
        const data = await res.json();

        if (data.status === "success") {
          let allPickups = data.data || [];
          if (selectedOrganization) {
            allPickups = allPickups.filter(
              (r) =>
                r["Donor Company"] &&
                r["Donor Company"].trim().toLowerCase() ===
                selectedOrganization.toLowerCase()
            );
          }
          setPickups(allPickups);
          setTotalPickups(data.totalLaptops || allPickups.length);
        } else {
          console.warn("Pickup API returned error status:", data);
        }
      } catch (err) {
        console.error("Error fetching pickups:", err);
      }
    };

    fetchPickups();
  }, [selectedOrganization]);

  const formatDate = (value) => {
    if (!value) return "N/A";
    try {
      const date = new Date(value);
      return isNaN(date.getTime()) ? value : date.toLocaleString("en-GB");
    } catch {
      return value;
    }
  };

  const columns = [
    { name: "Pickup ID", label: "Pickup ID" },
    { name: "Donor Company", label: "Donor Company" },
    { name: "POC Name", label: "POC Name" },
    { name: "POC Contact", label: "POC Contact" },
    { name: "POC Email", label: "POC Email" },
    { name: "Number of Laptops", label: "Laptops" },
    { name: "Pickup Location", label: "Pickup Location" },
    { name: "Pickup By", label: "Pickup By" },
    {
      name: "Current Date & Time",
      label: "Requested On",
      options: {
        customBodyRender: (value) => <Typography>{formatDate(value)}</Typography>,
      },
    },
    {
      name: "Status",
      label: "Status",
      options: {
        customBodyRender: (value, tableMeta) => {
          const rowIndex = tableMeta.rowIndex;
          const currentValue = pickups[rowIndex]?.Status || "Pending";

          return (
            <Select
              size="small"
              value={currentValue}
              onChange={async (e) => {
                const newStatus = e.target.value;

                // Get user name from localStorage
                const updatedBy = localStorage.getItem("userName") || "Unknown";

                const updated = [...pickups];

                // Update frontend state immediately
                updated[rowIndex].Status = newStatus;
                updated[rowIndex]["Updated By"] = updatedBy;

                // Use current timestamp for display
                const now = new Date();
                updated[rowIndex]["Updated On"] = now.toISOString();

                setPickups(updated);

                // Send update to backend (backend will save Updated On to sheet)
                try {
                  const res = await fetch(
                    `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=updatepickupstatus`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        pickupId: updated[rowIndex]["Pickup ID"],
                        status: newStatus,
                        updatedBy: updatedBy,
                      }),
                    }
                  );
                  const result = await res.json();
                  if (result.status === "success") {
                    // Optional: fetch updated row from backend to get exact date from sheet
                    // Or just leave it as `now` for UI
                  }
                } catch (err) {
                  console.error("Error updating pickup status:", err);
                }
              }}
            >
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </Select>
          );
        },
      },
    },


    {
      name: "confirm pickup date",
      label: "Confirm Pickup Date",
      options: {
        customBodyRender: (value) => (
          <Typography>{value || "Not Confirmed"}</Typography>
        ),
      },
    },
    {
      name: "Updated On",
      label: "Updated On",
      options: {
        customBodyRender: (value) => <Typography>{formatDate(value)}</Typography>,
      },
    },
    {
      name: "Updated By",
      label: "Updated By",
    },

  ];

  return (
    <div style={{ padding: "20px" }}>
      <Typography variant="h5" gutterBottom>
        Pickup Requests by Donor
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Total Laptops: {totalPickups}
      </Typography>

      <MUIDataTable
        data={pickups}
        columns={columns}
        options={{
          selectableRows: "none",
          rowsPerPage: 10,
          responsive: "standard",
        }}
      />
    </div>
  );
};

export default PickupRequestByDoner;
