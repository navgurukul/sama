import React, { useState, useEffect } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { TextField, Popover, Paper, Button, InputAdornment, Stack } from '@mui/material';
import dayjs from 'dayjs';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';

const SingleInputDateRangePicker = ({ onDateRangeChange, dateRange, apiData }) => {
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

  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
    setDisplayValue('');
    onDateRangeChange({ startDate: null, endDate: null });
  };

  const open = Boolean(anchorEl);
  const id = open ? 'date-range-popover' : undefined;

  // Default date range
  const monthMapping = {
    January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
    July: 7, August: 8, September: 9, October: 10, November: 11, December: 12
  };

  const getFullDataRange = (apiData) => {
    const allDates = [];

    Object.values(apiData).forEach((monthsData) => {
      allDates.push(...Object.keys(monthsData));
    });

    if (allDates.length === 0) return null;

    const sortedDates = allDates.sort((a, b) => {
      const [monthA, yearA] = a.split("-");
      const [monthB, yearB] = b.split("-");
      return new Date(`${yearA}-${monthMapping[monthA]}-01`) - new Date(`${yearB}-${monthMapping[monthB]}-01`);
    });

    return {
      start: `${sortedDates[0]}`,
      end: `${sortedDates[sortedDates.length - 1]}`
    };
  };

  useEffect(() => {
    if (apiData) {
      const range = getFullDataRange(apiData);
      if (range) {
        const [startMonth, startYear] = range.start.split("-");
        const [endMonth, endYear] = range.end.split("-");

        const formattedStart = dayjs(`${startYear}-${monthMapping[startMonth]}-01`).format("MMM'YYYY");
        const formattedEnd = dayjs(`${endYear}-${monthMapping[endMonth]}-01`).format("MMM'YYYY");

        setStartDate(dayjs(`${startYear}-${monthMapping[startMonth]}-01`));
        setEndDate(dayjs(`${endYear}-${monthMapping[endMonth]}-01`));
        !displayValue && setDisplayValue(`${formattedStart} - ${formattedEnd}`);
      }
    }
  }, [apiData, displayValue]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div>
        <TextField
          size="small"
          placeholder={displayValue}
          value={displayValue}
          onClick={handleClick}
          InputProps={{
            readOnly: true,
            endAdornment: open ? (
              <InputAdornment position="end">
                <ArrowDropDownIcon />
              </InputAdornment>
            ) : (
              <ArrowDropUpIcon />
            ),
          }}
          sx={{ width: '300px', backgroundColor: "#FFFAF8" }}
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
                format="MM/YYYY"
                maxDate={dayjs()} // Disable future dates
                shouldDisableYear={(year) => year.year() > dayjs().year()} 
                shouldDisableMonth={(month) => {
                  const selectedYear = month.year();
                  const currentYear = dayjs().year();
                  return selectedYear === currentYear && month.month() > dayjs().month(); // Disable future months only for this year
                }}
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
                format="MM/YYYY"
                minDate={startDate}
                maxDate={dayjs()} // Disable future dates
                shouldDisableYear={(year) => year.year() > dayjs().year()} 
                shouldDisableMonth={(month) => {
                  const selectedYear = month.year();
                  const currentYear = dayjs().year();
                  return selectedYear === currentYear && month.month() > dayjs().month(); // Disable future months only for this year
                }}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    placeholder: "End Month"
                  }
                }}
              />

              <Stack direction="row" spacing={2} sx={{ marginBlock: "10px" }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleReset}
                  fullWidth
                >
                  Reset
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleApply}
                  disabled={!startDate || !endDate}
                  fullWidth
                >
                  Apply
                </Button>
              </Stack>
            </div>
          </Paper>
        </Popover>
      </div>
    </LocalizationProvider>
  );
};

export default SingleInputDateRangePicker;
