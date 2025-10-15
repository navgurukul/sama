import React, {useEffect, useState} from 'react';
import { Select, MenuItem, Checkbox } from '@mui/material';

export const LaptopStatusDropdown = ({ value = '', onChange }) => {
  let options = [];

  // Get regular flow options based on current status
  switch (value) {
    case '':
      options = ['In Transit', 'Laptop Received'];
      break;
    case 'In Transit':
      options = ['Laptop Received'];
      break;
    case 'Laptop Received':
      options = ['Laptop Refurbished', 'To Be Dispatch'];
      break;
    case 'Laptop Refurbished':
      options = ['To Be Dispatch'];
      break;
    case 'To Be Dispatch':
      options = ['Allocated'];
      break;
    case 'Allocated':
      options = ['Distributed'];
      break;
    case 'Not Working':
      options = ['In Transit']; // Allow returning to flow from Not Working
      break;
    case 'Distributed':
      options = []; // Final status
      break;
    default:
      options = ['In Transit', 'Laptop Received']; // Show initial options if status not recognized
      break;
  }

  // Add 'Not Working' option if it's not already the current status
  if (value !== 'Not Working') {
    options.push('Not Working');
  }

  return (
    <Select
      value={value}
      onChange={onChange}
      displayEmpty
      style={{ borderRadius: '20px' }}
      fullWidth
    >
      {/* Show placeholder for empty value */}
      {!value && <MenuItem value="">Select Status</MenuItem>}

      {/* Always show the current value if not empty */}
      {value && <MenuItem value={value}>{value}</MenuItem>}

      {/* Show valid next statuses if any */}
      {options.map((status) =>
        status !== value ? (
          <MenuItem key={status} value={status}>
            {status}
          </MenuItem>
        ) : null
      )}
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
      checked={!checked}
      onClick={onChange}
      color="primary"
      className="custom-body-cell"
    />
  );
};

