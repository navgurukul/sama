import React, { useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { TextField, Popover, Paper, Button,InputAdornment } from '@mui/material';
import dayjs from 'dayjs';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';

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
      const formattedStart = dayjs(startDate).format("MMM'YYYY");
      const formattedEnd = dayjs(endDate).format("MMM'YYYY");
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
            endAdornment:open ? (
              <InputAdornment position="end">
                <ArrowDropDownIcon />
              </InputAdornment>
            ):<ArrowDropUpIcon/>,
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
          <Paper elevation={0} className="p-3">
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
                sx={{ marginBlock: "10px" }}
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
                sx={{ marginBlock: "10px" }}
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