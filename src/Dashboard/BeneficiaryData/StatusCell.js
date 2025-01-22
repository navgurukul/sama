import React, { useState, useEffect } from "react";
import {TextField,
    FormControl,
    Select,
    MenuItem
} from "@mui/material"

const StatusCell = ({
  status,
  id,
  handleIndividualStatusChange,
  statusDisabled,
  defaultStatus,
  dateTime,
  additionalStatuses = [],
}) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isDateEnabled, setIsDateEnabled] = useState(false);

  useEffect(() => {
    const checkDateEnabled = () => {
      const currentDate = new Date();
      const dayOfMonth = currentDate.getDate();
      setIsDateEnabled(dayOfMonth >= 1 && dayOfMonth <= 10);
      // setIsDateEnabled(dayOfMonth < 1 || dayOfMonth > 10);
    };

    const checkTimeElapsed = () => {
      if (status === "Laptop Assigned" && dateTime) {
        const assignedTime = new Date(dateTime).getTime();
        const currentTime = new Date().getTime();
        const minutesDiff = (currentTime - assignedTime) / (1000 * 60);
        // setIsEnabled(minutesDiff >= 48 * 60); // 48 hours = 48 * 60 minutes
        setIsEnabled(minutesDiff >= 1);
      }
    };

    checkDateEnabled();
    checkTimeElapsed();

    const dateInterval = setInterval(checkDateEnabled, 1000 * 60 * 60);
    const timeInterval = setInterval(checkTimeElapsed, 10000);

    return () => {
      clearInterval(dateInterval);
      clearInterval(timeInterval);
    };
  }, [status, dateTime]);

  const additionalStatusNames = additionalStatuses.map((status) => status.name);

  const getAvailableStatuses = () => {
    if (status === "Data Uploaded") {
      return defaultStatus;
    }
    if (status === "Laptop Assigned" && !isEnabled) {
      return ["Laptop Assigned"];
    }
    if (
      (status === "Laptop Assigned" && isEnabled) ||
      additionalStatusNames.includes(status)
    ) {
      return additionalStatusNames;
    }
    if (!status) {
      return defaultStatus;
    }
    return additionalStatusNames;
  };

  const availableStatuses = getAvailableStatuses();

  const shouldDisableDropdown = () => {
    if (status === "Data Uploaded") {
      return true;
    }
    if (status === "Laptop Assigned" && !isEnabled) {
      return true;
    }
    if (additionalStatusNames.includes(status) && !isDateEnabled) {
      return true;
    }
    return false;
  };

  const isDropdownDisabled = shouldDisableDropdown();

  if (isDropdownDisabled) {
    return (
      <TextField
        value={status || ""}
        disabled
        fullWidth
        variant="outlined"
        size="small"
        sx={{
          backgroundColor: "rgb(243, 243, 243)",
          "& .MuiInputBase-input.Mui-disabled": {
            WebkitTextFillColor: "rgb(115, 115, 115)",
            backgroundColor: "rgb(243, 243, 243)",
            borderRadius: "8px",
          },
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
            "&.Mui-disabled": {
              backgroundColor: "rgb(243, 243, 243)",
            },
          },
        }}
      />
    );
  }

  return (
    <FormControl fullWidth size="small">
      <Select
        value={status || ""}
        onChange={(e) => handleIndividualStatusChange(id, e.target.value, e)}
        onClick={(e) => e.stopPropagation()}
        sx={{
          backgroundColor: "rgb(243, 243, 243)",
          borderRadius: "8px",
          "& .MuiSelect-select": {
            backgroundColor: "rgb(243, 243, 243)",
            padding: "4px 8px",
          },
        }}
      >
        {availableStatuses.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default StatusCell;