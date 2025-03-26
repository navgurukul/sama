import React from 'react';
import { Typography, Box, Chip } from '@mui/material';
import { LaptopStatusDropdown, LaptopWorkingCheckbox } from './LaptopStatus';

export const getTableColumns = (data, taggedLaptops, handleTagClick, handleStatusChange, EditButton) => {
  // Helper function to check if laptop has battery issues
  const hasBatteryIssue = (laptop) => {
    const minorIssues = laptop["Minor Issues"]?.toLowerCase() || "";
    const majorIssues = laptop["Major Issues"]?.toLowerCase() || "";
    return minorIssues.includes("battery") || majorIssues.includes("battery");
  };

  return [
    { 
      name: "ID", 
      label: "Serial No",
      options: {
        filter: false,
        customBodyRender: (value, tableMeta) => {
            const rowIndex = tableMeta.rowIndex;
            const laptop = data[rowIndex];
            const hasBatteryProblem = hasBatteryIssue(laptop);
            
            return (
              <Box>
                <Typography variant="body2">
                  {laptop.ID}
                </Typography>
               
              </Box>
            );
        },
        setCellProps: () => ({
          className: 'custom-body-cell'
        }),
        setCellHeaderProps: () => ({
          className: 'custom-header-cell'
        })
      }
    },
    { 
      name: "Donor Company Name", 
      label: "Company Name",
      options: {
        setCellProps: () => ({
          className: 'custom-body-cell'
        }),
        setCellHeaderProps: () => ({
          className: 'custom-header-cell'
        })
      }
    },
    { 
      name: "RAM", 
      label: "RAM",
      options: {
        setCellProps: () => ({
          className: 'custom-body-cell'
        }),
        setCellHeaderProps: () => ({
          className: 'custom-header-cell'
        })
      }
    },
    { 
      name: "ROM", 
      label: "ROM",
      options: {
        setCellProps: () => ({
          className: 'custom-body-cell'
        }),
        setCellHeaderProps: () => ({
          className: 'custom-header-cell'
        })
      }
    },
    { 
      name: "Manufacturer Model", 
      label: "Manufacturer Model",
      options: {
        filter: false,
        setCellProps: () => ({
          className: 'custom-body-cell'
        }),
        setCellHeaderProps: () => ({
          className: 'custom-header-cell'
        })
      }
    },
    { 
      name: "Minor Issues", 
      label: "Minor Issues",
      options: {
        customBodyRender: (value, tableMeta) => {
          const rowIndex = tableMeta.rowIndex;
          const laptop = data[rowIndex];
          
          return (
            <Typography variant="body2">
              {laptop["Minor Issues"] || "None"}
            </Typography>
          );
        },
        setCellProps: () => ({
          className: 'custom-body-cell'
        }),
        setCellHeaderProps: () => ({
          className: 'custom-header-cell'
        })
      }
    },
    { 
      name: "Major Issues", 
      label: "Major Issues",
      options: {
        customBodyRender: (value, tableMeta) => {
          const rowIndex = tableMeta.rowIndex;
          const laptop = data[rowIndex];
          const hasBatteryProblem = hasBatteryIssue(laptop);
          
          return (
            <Box>
              <Typography variant="body2">
                {laptop["Major Issues"] || "None"}
              </Typography>
              {hasBatteryProblem && (
                  <Chip 
                    label="Battery Issue" 
                    color="error" 
                    size="small" 
                    sx={{ mt: 1 }} 
                  />
                )}
            </Box>
          );
        },
        setCellProps: () => ({
          className: 'custom-body-cell'
        }),
        setCellHeaderProps: () => ({
          className: 'custom-header-cell'
        })
      }
    },
    { 
      name: "Inventory Location", 
      label: "Inventory Location",
      options: {

        setCellProps: () => ({
          className: 'custom-body-cell'
        }),
        setCellHeaderProps: () => ({
          className: 'custom-header-cell'
        })
      }
    },
    { 
      name: "Mac address", 
      label: "Mac Address",
      options: {
        filter: false,
        setCellProps: () => ({
          className: 'custom-body-cell'
        }),
        setCellHeaderProps: () => ({
          className: 'custom-header-cell'
        })
      }
    },
    { 
      name: "Battery Capacity", 
      label: "Battery Capacity",
      options: {
        setCellProps: () => ({
          className: 'custom-body-cell'
        }),
        setCellHeaderProps: () => ({
          className: 'custom-header-cell'
        })
      }
    },
    {
      name: "Status",
      label: "Status",
      options: {
        customBodyRender: (value, tableMeta) => {
          const rowIndex = tableMeta.rowIndex;
          const laptopData = data[rowIndex];
          return (
            <LaptopStatusDropdown 
              value={laptopData.Status || ''} 
              onChange={(event) => handleStatusChange(event, rowIndex)}
            />
          );
        },
        setCellProps: () => ({
          className: 'custom-body-cell'
        }),
        setCellHeaderProps: () => ({
          className: 'custom-header-cell'
        })
      }
    },
    {
      name: "working",
      label: "Not Working",
      options: {
        customBodyRender: (value, tableMeta) => {
          const rowIndex = tableMeta.rowIndex;
          const laptopData = data[rowIndex];
          const isChecked = taggedLaptops[rowIndex] !== undefined ? taggedLaptops[rowIndex] : laptopData.Working === "Not Working";
          
          return (
            <LaptopWorkingCheckbox 
              isChecked={isChecked} 
              onClick={(event) => handleTagClick(event, rowIndex)}
            />
          );
        },
        setCellProps: () => ({
          className: 'custom-body-cell'
        }),
        setCellHeaderProps: () => ({
          className: 'custom-header-cell'
        })
      }
    },
    {
      name: "Edit",
      label: "Edit",
      options: {
        filter: false,
        customBodyRender: (value, tableMeta) => {
          const rowIndex = tableMeta.rowIndex;
          const laptopData = data[rowIndex];
          return (
            <EditButton 
              laptopData={laptopData} 
              rowIndex={rowIndex}
              data={data}
            />
          );
        },
        setCellProps: () => ({
          className: 'custom-body-cell'
        }),
        setCellHeaderProps: () => ({
          className: 'custom-header-cell'
        })
      }
    }
  ];
};
