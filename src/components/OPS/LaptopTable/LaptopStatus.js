import React from 'react';
import { Select, MenuItem, Checkbox } from '@mui/material';

export const LaptopStatusDropdown = ({ value, onChange }) => {
  return (
    <Select
      value={value || ''}
      onChange={onChange}
      displayEmpty
      style={{ borderRadius: "20px" }}
      fullWidth
    >
      <MenuItem value="Laptop Received">Laptop Received</MenuItem>
      <MenuItem value="Laptop Refurbished">Laptop Refurbished</MenuItem>
    </Select>
  );
};


export const LaptopWorkingCheckbox = ({ isChecked, onClick }) => {
  return (
    <Checkbox
      checked={isChecked}
      onClick={onClick}
      color="primary"
      className="custom-body-cell"
    />
  );
};

