// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
// import { SingleInputDateRangeField } from '@mui/x-date-pickers-pro/SingleInputDateRangeField';
// import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
// import React from 'react';
// import dayjs from 'dayjs';

// const CustomDateRangePicker = ({ onDateRangeChange }) => {
//   const formatDate = (date) => {
//     if (!date) return '';
//     return dayjs(date).format('MMMM YYYY');
//   };

//   const handleDateChange = (newValue) => {
//     if (newValue[0] && newValue[1]) {
//       const formattedRange = {
//         startDate: formatDate(newValue[0]),
//         endDate: formatDate(newValue[1]),
//       };
//       onDateRangeChange(formattedRange);
//     }
//   };

//   return (
//     <LocalizationProvider dateAdapter={AdapterDayjs}>
//       <DemoContainer components={['SingleInputDateRangeField']}>
//         <DateRangePicker
//           slots={{ field: SingleInputDateRangeField }}
//           name="allowedRange"
//           onChange={handleDateChange}
//           slotProps={{
//             field: {
//               format: 'MMMM YYYY',
//               formatDensity: "spacious",
//               placeholder: "Select Month Range"
//             },
//             textField: {
//               InputProps: {
//                 sx: { width: '300px' } 
//               }
//             }
//           }}
//         />
//       </DemoContainer>
//     </LocalizationProvider>
//   );
// };

// export default CustomDateRangePicker;






import React, { useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { TextField, Popover, Paper, Button } from '@mui/material';
import dayjs from 'dayjs';

const SingleInputDateRangePicker = ({ onDateRangeChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [displayValue, setDisplayValue] = useState('');

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleApply = () => {
    if (startDate && endDate) {
      const formattedStart = dayjs(startDate).format('MMMM YYYY');
      const formattedEnd = dayjs(endDate).format('MMMM YYYY');
      setDisplayValue(`${formattedStart} - ${formattedEnd}`);
      onDateRangeChange({
        startDate: formattedStart,
        endDate: formattedEnd
      });
    }
    handleClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? 'date-range-popover' : undefined;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div>
        <TextField
          size="small"
          placeholder="Select Date Range"
          value={displayValue}
          onClick={handleClick}
          InputProps={{
            readOnly: true,
          }}
          sx={{ width: '300px' }}
        />
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          PaperProps={{
            sx: { width: '280px' }
          }}
        >
          <Paper className="p-3">
            <div className="space-y-3">
              <DesktopDatePicker
                value={startDate}
                onChange={setStartDate}
                views={['month', 'year']}
                format="MMMM YYYY"
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    placeholder: "Start Month"
                  }
                }}
              />
              <DesktopDatePicker
                value={endDate}
                onChange={setEndDate}
                views={['month', 'year']}
                format="MMMM YYYY"
                minDate={startDate}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    placeholder: "End Month"
                  }
                }}
              />
              <Button 
                size="small" 
                variant="contained" 
                onClick={handleApply}
                disabled={!startDate || !endDate}
                fullWidth
              >
                Apply
              </Button>
            </div>
          </Paper>
        </Popover>
      </div>
    </LocalizationProvider>
  );
};

export default SingleInputDateRangePicker;