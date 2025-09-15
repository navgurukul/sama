import React, { useEffect, useState } from "react";
import MUIDataTable from "mui-datatables";
import { Typography, Chip, Select, MenuItem,TextField} from "@mui/material";

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

          // Ensure default Status is "Pending" for entries missing Status
          allPickups = allPickups.map((p) => ({ ...p, Status: p.Status || "Pending" }));

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

  // format to: DD-MM-YYYY HH:mm:ss (local time)
  const formatDate = (value) => {
    if (!value) return "N/A";
    try {
      const d = new Date(value);
      if (isNaN(d.getTime())) return value;
      const pad = (n) => String(n).padStart(2, "0");
      const day = pad(d.getDate());
      const month = pad(d.getMonth() + 1);
      const year = d.getFullYear();
      const hours = pad(d.getHours());
      const minutes = pad(d.getMinutes());
      const seconds = pad(d.getSeconds());
      return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    } catch {
      return value;
    }
  };

  // helpers for datetime-local inputs
  const toInputDateTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const tzOffset = d.getTimezoneOffset() * 60000;
    const local = new Date(d.getTime() - tzOffset);
    return local.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
  };

  const fromInputDateTimeToISO = (inputVal) => {
    if (!inputVal) return "";
    const iso = new Date(inputVal);
    return iso.toISOString();
  };

  // centralized update helper - updates local state and calls backend once
  const savePickupUpdate = async (rowIndex, changes) => {
    const updated = [...pickups];
    updated[rowIndex] = { ...(updated[rowIndex] || {}), ...changes };

    // ensure default Status
    if (!updated[rowIndex].Status) updated[rowIndex].Status = "Pending";

    const updatedBy = localStorage.getItem("userName") || "Unknown";
    updated[rowIndex]["Updated By"] = updatedBy;
    updated[rowIndex]["Updated On"] = new Date().toISOString();

    // optimistic UI update
    setPickups(updated);

    // prepare payload using Pickup ID as stable identifier
    const payload = {
      pickupId: updated[rowIndex]["Pickup ID"],
      status: updated[rowIndex].Status,
      confirmPickupDate: updated[rowIndex]["Confirm Pickup Date"] || "",
      updatedBy,
      type: "updatepickupstatus",
    };

    // console.log("[Pickup update] Sending payload:", payload);

    try {
      const res = await fetch(
        `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          mode: "no-cors",
        }
      );

      const text = await res.text();
      // console.log("Response from server:", text);
    } catch (err) {
      console.error("[Pickup update] Network error:", err);
      // consider rollback or user notification here
    }
  };

  const columns = [
    { name: "Pickup ID", label: "Pickup ID", options: { filter: true } },
    { name: "Donor Company", label: "Donor Company", options: { filter: true } },
    { name: "POC Name", label: "POC Name", options: { filter: true } },
    { name: "POC Contact", label: "POC Contact", options: { filter: false } },
    { name: "POC Email", label: "POC Email", options: { filter: false } },
    { name: "Number of Laptops", label: "Laptops", options: { filter: false } },
    { name: "Pickup Location", label: "Pickup Location", options: { filter: true } },
    { name: "Pickup By", label: "Pickup By", options: { filter: true } },
    {
      name: "Current Date & Time",
      label: "Requested On",
      options: {
        filter: false,
        customBodyRender: (value) => <Typography>{formatDate(value)}</Typography>,
      },
    },

    // Confirm pickup date: show backend date formatted and also keep editable picker.
    {
      name: "confirm pickup date",
      label: "Confirm Pickup Date",
      options: {
        filter: false,
        customBodyRender: (value, tableMeta) => {
          const rowIndex = tableMeta.rowIndex;
          const row = pickups[rowIndex] || {};
          const currentIso = row["Confirm Pickup Date"] || "";
          const inputVal = toInputDateTime(currentIso);

          const handleChange = (e) => {
            const raw = e.target.value; // YYYY-MM-DDTHH:mm
            const iso = fromInputDateTimeToISO(raw);

            savePickupUpdate(rowIndex, { "Confirm Pickup Date": iso });
          };

          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <TextField
                type="datetime-local"
                size="small"
                value={inputVal}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
              {/* {currentIso ? (
                <Typography variant="caption">{formatDate(currentIso)}</Typography>
              ) : null} */}
            </div>
          );
        },
      },
    },

    // Status column: show backend value, allow selection, update same object via savePickupUpdate
    {
      name: "Status",
      label: "Status",
      options: {
        filter: true,
        customBodyRender: (value, tableMeta) => {
          const rowIndex = tableMeta.rowIndex;
          const row = pickups[rowIndex] || {};
          const currentStatus = row.Status || "Pending";

          const handleChange = (e) => {
            const newStatus = e.target.value;
            savePickupUpdate(rowIndex, { Status: newStatus });
          };

          return (
            <Select size="small" value={currentStatus} onChange={handleChange}>
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
        customBodyRender: (value, tableMeta) => {
          const rowIndex = tableMeta.rowIndex;

          return (
            <TextField
              type="date"
              size="small"
              value={value ? value.split("T")[0] : ""} // show existing date if any
              onChange={(e) => {
                const selectedDate = e.target.value; // "YYYY-MM-DD"
                const updated = [...pickups];
                updated[rowIndex]["confirm pickup date"] = selectedDate;
                setPickups(updated); // update frontend state only
              }}
            />
          );
        },
      },
    },

    {
      name: "Updated On",
      label: "Updated On",
      options: {
        filter: false,
        customBodyRender: (value) => <Typography>{formatDate(value)}</Typography>,
      },
    },
    { name: "Updated By", label: "Updated By", options: { filter: true } },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Typography variant="h5" gutterBottom>
        Pickup Requests by Donor
      </Typography>

      <MUIDataTable
        data={pickups}
        columns={columns}
        options={{
          selectableRows: "none",
          rowsPerPage: 10,
          responsive: "standard",
          filter: true,
          filterType: "dropdown",
          download: true,
          print: false,
        }}
      />
    </div>
  );
};

export default PickupRequestByDoner;
