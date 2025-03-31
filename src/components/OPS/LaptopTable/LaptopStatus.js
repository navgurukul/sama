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
      <MenuItem value="To be dispatch">To Be Dispatch</MenuItem>
      <MenuItem value="Donated">Donated</MenuItem>
    </Select>
  );
};


export const AssignedTo = ({ value, onChange }) => {
  return (
    <Select
      value={value || ''}
      onChange={onChange}
      displayEmpty
      style={{ borderRadius: "20px" }}
      fullWidth
    >
      <MenuItem value="Aman">Aman</MenuItem>
      <MenuItem value="Sallu">Saloni</MenuItem>
  
    </Select>
  );
};

export const DonatedTo = ({ value, onChange }) => {
  return (
    <Select
      value={value || ''}
      onChange={onChange}
      displayEmpty
      style={{ borderRadius: "20px" }}
      fullWidth
    >
      <MenuItem value="xyz ngo">xyz ngo</MenuItem>
      <MenuItem value="new ngo">new ngo</MenuItem>
  
    </Select>
  );
};

export const LaptopWorkingCheckbox = ({ checked, onChange }) => {
  return (
    <Checkbox
      checked={checked}
      onClick={onChange}
      color="primary"
      className="custom-body-cell"
    />
  );
};

