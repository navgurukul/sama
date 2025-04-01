import React, {useEffect, useState} from 'react';
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
      <MenuItem value="Shweta Deshmukh">Shweta Deshmukh</MenuItem>
      <MenuItem value="Rahul">Rahul</MenuItem>
      <MenuItem value="Pradeep">Pradeep</MenuItem>
      <MenuItem value="Nitesh">Nitesh</MenuItem>
  
    </Select>
  );
};

export const DonatedTo = ({ value, onChange }) => {
  const [approvedNgos, setApprovedNgos] = useState([]);

  useEffect(() => {
    const fetchApprovedNgos = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_NgoInformationApi}?type=registration`
        );
        const responseData = await response.json();

        // Filter only approved NGOs
        const filteredNgos = (responseData.data).filter((ngo) => ngo.Status === "Approved");

        
        // Extract names of approved NGOs
        setApprovedNgos(filteredNgos.map((ngo) => ngo.organizationName));


      } catch (error) {
        console.error("Error fetching NGO data:", error);
      }
    };

    fetchApprovedNgos();
  }, []);

  return (
    <Select
      value={value || ""}
      onChange={onChange}
      displayEmpty
      style={{ borderRadius: "20px", color: "black" }}
      fullWidth
    >
      {approvedNgos.length > 0 ? (
        approvedNgos.map((ngo) => (
          <MenuItem key={ngo} value={ngo}>
            {ngo}
          </MenuItem>
        ))
      ) : (
        <MenuItem disabled>No Approved NGOs</MenuItem>
      )}
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

