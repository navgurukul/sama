import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Box, Typography, Radio } from '@mui/material';

const DynamicLineChart = () => {
  const [activeMetric, setActiveMetric] = useState('Sessions Conducted');

  const chartData = [
    { month: '', value: 0 },
    { month: 'Jan 23', value: 100 },
    { month: 'Feb 23', value: 150 },
    { month: 'Mar 23', value: 120 },
    { month: 'Apr 23', value: 300 },
    { month: 'May 23', value: 250 },
    { month: 'Jun 23', value: 400 },
    { month: 'Jul 23', value: 350 },
    { month: 'Aug 23', value: 450 },
    { month: 'Sep 23', value: 400 },
    { month: 'Oct 23', value: 450 },
    { month: 'Nov 23', value: 450 },
    { month: 'Dec 23', value: 450 }
  ];

  const metrics = [
    'Sessions Conducted',
    'Teachers Trained',
    'States Impacted',
    'School Visit by Ashroi Teacher',
    'Learning Hours'
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{
          backgroundColor: '#fff',
          border: '1px solid #E0E0E0',
          p: 2,
          borderRadius: 1,
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <Typography variant="subtitle2" sx={{ color: '#B25F65', display: 'block', mb: 1 }}>
            {label}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle2" sx={{ color: '#4A4A4A', fontWeight: 500 }}>
              {activeMetric}
            </Typography>
            <Typography variant="subtitle2" sx={{ color: '#453722' }}>
              {payload[0].value}
            </Typography>
          </Box>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{
      mt: "3rem",
      borderRadius: "0.375rem",
      backgroundColor: "#fff",
      boxShadow: "0px 2px 10px 0px rgba(0, 0, 0, 0.10)",
      padding: "3rem",
    }}>
      <Box sx={{
        display: 'flex',
        gap: 3,
        mb: 3,
        overflowX: 'auto',
        '&::-webkit-scrollbar': { height: 6 },
        '&::-webkit-scrollbar-thumb': { backgroundColor: '#ddd', borderRadius: 3 }
      }}>
        {metrics.map((metric) => (
          <Box
            key={metric}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              whiteSpace: 'nowrap',

            }}
            onClick={() => setActiveMetric(metric)}
          >
            <Radio
              checked={activeMetric === metric}
              sx={{
                '&.MuiRadio-root': {
                  padding: '4px',
                },
                '& .MuiSvgIcon-root': {
                  fontSize: 16,
                },
                '&.Mui-checked': {
                  color: 'primary.main',
                },
              }}
            />
            <Typography
              sx={{ color: "#4A4A4A" }}
              variant={activeMetric === metric ? 'subtitle1' : "body1"}
            >
              {metric}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{
        height: 400,
        backgroundColor: '#fff',
        position: 'relative'
      }}>
        <Typography
          variant='secondary.text'
          sx={{
            position: 'absolute',
            left: -12,
            top: '43%',
            transform: 'translate(-20%, -50%) rotate(-90deg)',
            transformOrigin: 'center',
            color: "#828282",
            whiteSpace: 'nowrap',
          }}
        >
          Number of Sessions Conducted
        </Typography>


        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 50, bottom: 40 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f0f0f0"
              vertical={true}
              horizontal={true}
            />
            <XAxis
              dataKey="month"
              tick={{ fill: "#666", fontSize: 12 }}
              axisLine={{ stroke: "#E0E0E0" }}
              tickLine={{ stroke: "#E0E0E0" }}
              label={{
                value: "Months",
                position: "bottom",
                offset: 20,
                style: { fill: "#828282", fontSize: "16px" },
              }}
            />
            <YAxis
              tick={{ fill: '#666', fontSize: 12 }}
              axisLine={{ stroke: '#E0E0E0' }}
              tickLine={{ stroke: '#E0E0E0' }}
              domain={[0, 600]}
              ticks={[0, 100, 200, 300, 400, 500, 600]}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={false}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#B25F65"
              strokeWidth={1.5}
              dot={{
                r: 4,
                border: '1px solid#B25F65',
                fill: '#fff',
                strokeWidth: 1
              }}
              activeDot={{
                r: 6,
                fill: '#B25F65',
                stroke: '#B25F65',
                strokeWidth: 1,
                cursor: 'pointer'
              }}
              connectNulls={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default DynamicLineChart;