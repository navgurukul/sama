import React from 'react';
import { Typography, Box, Chip } from '@mui/material';
import { LaptopStatusDropdown,AssignedTo, DonatedTo,  LaptopWorkingCheckbox } from './LaptopStatus';

export const getTableColumns = (data, taggedLaptops, handleWorkingToggle, handleStatusChange, handleAssignedToChange, handleDonatedToChange, EditButton) => {
  // Helper function to check if laptop has battery issues
  const hasBatteryIssue = (laptop) => {
    const minorIssues = laptop["Minor Issues"]?.toLowerCase() || "";
    const majorIssues = laptop["Major Issues"]?.toLowerCase() || "";
    return minorIssues.includes("battery") || majorIssues.includes("battery");
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(); // Format as MM/DD/YYYY or based on locale
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
            name: "updatedOn",
            label: "Last Updated On",
            options: {
              customBodyRender: (value, tableMeta) => {
                const rowIndex = tableMeta.rowIndex;
                const laptopData = data[rowIndex];
                
                return (
                  <Typography variant="body2">
                    {formatDate(laptopData["Last Updated On"])}
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
            name: "lastUpdatedBy",
            label: "Last Updated By",
            options: {
              customBodyRender: (value, tableMeta) => {
                const rowIndex = tableMeta.rowIndex;
                const laptopData = data[rowIndex];

                return (
                  <Typography variant="body2">
                    {laptopData["Last Updated By"]}
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
    // ... (other columns remain the same until Status)
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
      name: "Assigned To",
      label: "Assigned To",
      options: {
        customBodyRender: (value, tableMeta) => {
          const rowIndex = tableMeta.rowIndex;
          const laptopData = data[rowIndex];
          return (
            <AssignedTo 
              value={laptopData["Assigned To"] || 'Not Assigned'}  // Fixed: Use correct field
              onChange={(event) => handleAssignedToChange(event, rowIndex)}
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
      name: "Donated To",
      label: "Donated To",
      options: {
        customBodyRender: (value, tableMeta) => {
          const rowIndex = tableMeta.rowIndex;
          const laptopData = data[rowIndex];
          return (
            <DonatedTo 
              value={laptopData["Donated To"] || ''}  // Fixed: Use correct field
              onChange={(event) => handleDonatedToChange(event, rowIndex)}
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
      name: "Working",
      label: "working",
      options: {
        customBodyRender: (value, tableMeta) => {
          const rowIndex = tableMeta.rowIndex;
          const laptopData = data[rowIndex];
          const isWorking = laptopData.Working === "Working";
          
          return (
            <LaptopWorkingCheckbox 
              checked={isWorking}
              onChange={(event) => handleWorkingToggle(event, rowIndex)}
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

    // ... (Edit column remains the same)
  ];
};