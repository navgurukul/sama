import React, { useState, useEffect } from 'react';
import { TextField } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const DateRangeSelector = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [formattedRange, setFormattedRange] = useState('');

  const formatDate = (date) => {
    if (!date) return '';
    return dayjs(date).format('MMM\'YY');
  };

  useEffect(() => {
    if (startDate && endDate) {
      setFormattedRange(`${formatDate(startDate)} - ${formatDate(endDate)}`);
    } else {
      setFormattedRange('');
    }
  }, [startDate, endDate]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div style={{
        padding: '20px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        backgroundColor: 'white',
        maxWidth: '300px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <DatePicker
          label="Start Date"
          value={startDate}
          onChange={(newValue) => setStartDate(newValue)}
          slotProps={{
            textField: {
              placeholder: 'Start',
              size: "small",
              fullWidth: true
            }
          }}
        />
        
        <DatePicker
          label="End Date"
          value={endDate}
          onChange={(newValue) => setEndDate(newValue)}
          minDate={startDate}
          slotProps={{
            textField: {
              placeholder: 'End',
              size: "small",
              fullWidth: true
            }
          }}
        />
      </div>
    </LocalizationProvider>
  );
};

export default DateRangeSelector;