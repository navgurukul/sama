import React from 'react';
import { Typography, Box, Chip, Button } from '@mui/material';
import { LaptopStatusDropdown, AssignedTo, DonatedTo, LaptopWorkingCheckbox } from './LaptopStatus';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const getTableColumns = (data, taggedLaptops, handleWorkingToggle, handleStatusChange, handleAssignedToChange, handleDonatedToChange, EditButton, refresh, setRefresh, sortConfig, handleSort, activityData = {}) => {
  // Helper function to check if laptop has battery issues
  const hasBatteryIssue = (laptop) => {
    const minorIssues = laptop["Minor Issues"]?.toLowerCase() || "";
    const majorIssues = laptop["Major Issues"]?.toLowerCase() || "";
    return minorIssues.includes("battery") || majorIssues.includes("battery");
  };
  const generateActivityPDF = (laptopId, activityData, summaryData) => {
    const doc = new jsPDF();

    // Set font and add title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(`Activity Report - ${laptopId}`, 14, 20);

    // Add date
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    // Convert duration to readable format


    // Prepare summary data - separate usage categories and AFK
    const usageCategories = [
      ['Browsing', summaryData.usage?.browsing || '0 sec'],
      ['Programming', summaryData.usage?.programming || '0 sec'],
      ['Other', summaryData.usage?.other || '0 sec']
    ];

    // Add usage categories table
    doc.autoTable({
      startY: 40,
      head: [['Activity Category', 'Time Spent']],
      body: usageCategories,
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        cellPadding: 5,
        fontSize: 10
      },
      columnStyles: {
        0: { cellWidth: 'wrap' },
        1: { cellWidth: 'auto' }
      }
    });

    // Add AFK section separately
    doc.setFont('helvetica', 'bold');
    doc.text('AFK Time:', 14, doc.lastAutoTable.finalY + 15);
    doc.setFont('helvetica', 'normal');
    doc.text(summaryData.afk || '0 sec', 50, doc.lastAutoTable.finalY + 15);

    // Add activity log section if needed
    if (activityData && activityData.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Detailed Activity Log', 14, doc.lastAutoTable.finalY + 25);

      const activityRows = activityData.map(entry => [
        entry.time,
        entry.app || '-',
        entry.title?.substring(0, 30) || '-',
        formatDuration(entry.duration),
        entry.category
      ]);

      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 30,
        head: [['Time', 'App', 'Title', 'Duration', 'Category']],
        body: activityRows,
        styles: {
          fontSize: 8,
          cellPadding: 3
        }
      });
    }

    doc.save(`Activity_Report_${laptopId}.pdf`);
  };
  const formatDuration = (duration) => {
    if (typeof duration === 'string') return duration;
    if (typeof duration !== 'number') return "0 sec";

    const mins = Math.floor(duration / 60);
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;

    if (hrs > 0) return `${hrs} hr ${remainingMins} min`;
    if (mins > 0) return `${mins} min`;
    return `${duration} sec`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not Updated";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // Handle cases where dateString is already in a different format
        return dateString;
      }

      // Format as DD-MM-YYYY HH:MM:SS
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');

      return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
      console.error("Date formatting error:", error);
      return dateString;
    }
  };

  return [
    {
      name: "ID",
      label: "Serial No",
      options: {
        sort: false,
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
        sort: false,
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
      name: "RAM",
      label: "RAM",
      options: {
        sort: false,
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
        sort: false,
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
        sort: false,
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
        sort: false,
        filter: false,
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
        sort: false,
        filter: false,
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
        sort: false,
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
        sort: false,
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
        sort: false,
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
      name: "updatedOn",
      label: "Last Updated On",
      options: {
        filter: false,
        sort: true,
        sortDirection: sortConfig.field === "Last Updated On" ? sortConfig.direction : "none",
        customBodyRender: (value, tableMeta) => {
          const rowIndex = tableMeta.rowIndex;
          const laptopData = data[rowIndex];
          const lastUpdatedOn = laptopData["Last Updated On"] || laptopData.lastUpdatedOn;

          return (
            <Typography variant="body2" noWrap>
              {formatDate(lastUpdatedOn)}
            </Typography>
          );
        },

        customHeadLabelRender: ({ label, index }) => (
          <Box

            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',

            }}
            onClick={() => handleSort("Last Updated On")}
          >
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: "rgba(0, 0, 0, 0.87)", fontFamily: "Montserrat !important", fontSize: "16px !important", whiteSpace: 'nowrap' }}>
              {label}
            </Typography>
            <Box sx={{ ml: 1, }}>
              {sortConfig.field === "Last Updated On" ?
                (sortConfig.direction === "asc" ? "↑" : "↓") :
                "↕"
              }
            </Box>
          </Box>
        ),
        setCellProps: () => ({
          className: 'custom-body-cell'
        }),
        setCellHeaderProps: () => ({
          className: 'custom-header-cell'
        }),
      }
    },
    {
      name: "lastUpdatedBy",
      label: "Last Updated By",
      options: {
        sort: false,
        customBodyRender: (value, tableMeta) => {
          const rowIndex = tableMeta.rowIndex;
          const laptopData = data[rowIndex];

          return (
            <Typography variant="body2" noWrap>
              {laptopData["Last Updated By"] || laptopData.lastUpdatedBy || "Not Available"}
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
      name: "Status",
      label: "Status",
      options: {
        sort: false,
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
        sort: false,
        customBodyRender: (value, tableMeta) => {
          const rowIndex = tableMeta.rowIndex;
          const laptopData = data[rowIndex];
          return (
            <AssignedTo
              value={laptopData["Assigned To"] || 'Not Assigned'}
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
      name: "Allocated To",
      label: "Allocated To",
      options: {
        sort: false,
        filter: false,
        customBodyRender: (value, tableMeta) => {
          const rowIndex = tableMeta.rowIndex;
          const laptopData = data[rowIndex];
          return (
            <DonatedTo
              value={laptopData["Allocated To"] || ''}
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
      label: "Not Working",
      options: {
        sort: false,
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
        sort: false,
        filter: false,
        customBodyRender: (value, tableMeta) => {
          const rowIndex = tableMeta.rowIndex;
          const laptopData = data[rowIndex];
          return (
            <EditButton
              laptopData={laptopData}
              rowIndex={rowIndex}
              data={data}
              setRefresh={setRefresh}
              refresh={refresh}
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
      name: "Inspection Files",
      label: "Inspection Files",
      options: {
        sort: false,
        filter: false,
        customBodyRender: (value, tableMeta) => {
          const rowIndex = tableMeta.rowIndex;
          const laptopData = data[rowIndex];

          const rawLinks = laptopData["Inspection Files"] || laptopData.inspectionFiles;

          if (!rawLinks || typeof rawLinks !== 'string') {
            return <Typography variant="body2" color="textSecondary">No files</Typography>;
          }

          // Clean and split the links
          const cleanedLinks = rawLinks
            .replace(/'/g, '') // Remove single quotes
            .split(/,\s*|\s+/) // Split by comma (with optional space) or any whitespace
            .filter(link => link.startsWith('http'));

          if (cleanedLinks.length === 0) {
            return <Typography variant="body2" color="textSecondary">No valid links</Typography>;
          }

          return (
            <Box sx={{ position: 'relative' }}>
              <Button
                variant="outlined"
                size="small"
                sx={{
                  minWidth: '100px',
                  textTransform: 'none',
                  fontSize: '0.8rem',
                  padding: '4px 12px',
                  borderColor: 'divider',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                View Files ({cleanedLinks.length})
                <Box component="span" sx={{ ml: 0.5 }}>▼</Box>
              </Button>
              <Box
                component="div"
                sx={{
                  position: 'absolute',
                  right: '0%',
                  top: 50,
                  zIndex: 100,
                  backgroundColor: 'background.paper',
                  boxShadow: 3,
                  borderRadius: 1,
                  minWidth: '160px',
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'none',
                  '&:hover': {
                    display: 'block'
                  },
                  'button:hover + &, &:hover': {
                    display: 'block'
                  }
                }}
              >
                {cleanedLinks.map((link, index) => (
                  <Box
                    key={index}
                    component="a"
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      display: 'block',
                      padding: '8px 16px',
                      textDecoration: 'none',
                      color: 'text.primary',
                      fontSize: '0.8rem',
                      '&:hover': {
                        backgroundColor: 'action.selected',
                        color: 'primary.main'
                      }
                    }}
                  >
                    Inspection File {index + 1}
                  </Box>
                ))}
              </Box>
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
      name: "Activity Watch PDF",
      label: "Activity PDF",
      options: {
        sort: false,
        filter: false,
        customBodyRender: (value, tableMeta) => {
          const rowIndex = tableMeta.rowIndex;
          const laptopData = data[rowIndex];
          const laptopId = laptopData.ID;

          // Only show for laptops with ActivityWatch data
          const awLaptops = ['roshni-ThinkPad-E14', 'navgurukul-ThinkPad-E14'];
          if (!awLaptops.includes(laptopId)) {
            return <Typography variant="body2">N/A</Typography>;
          }

          const handleDownload = async () => {
            try {
              const [activityRes, summaryRes] = await Promise.all([
                fetch(`http://localhost:5000/api/activity/${laptopId}`),
                fetch(`http://localhost:5000/api/summary/${laptopId}`)
              ]);

              if (!activityRes.ok || !summaryRes.ok) {
                throw new Error(`API request failed: ${activityRes.status} ${summaryRes.status}`);
              }

              const [activityData, summaryData] = await Promise.all([
                activityRes.json(),
                summaryRes.json()
              ]);

              generateActivityPDF(laptopId, activityData, summaryData);
            } catch (error) {
              console.error('Download failed:', error);
              alert('Failed to generate PDF. Please check console for details.');
            }
          };

          return (
            <Button
              variant="outlined"
              size="small"
              onClick={handleDownload}
              sx={{
                textTransform: 'none',
                fontSize: '0.75rem',
                padding: '4px 8px'
              }}
            >
              Download
            </Button>
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
      name: "AFK_Time", // We use ID to match with activity data
      label: "AFK Time",
      options: {
        sort: true,
        filter: false,
        customBodyRender: (value, tableMeta) => {
          const rowIndex = tableMeta.rowIndex;
          const laptopId = data[rowIndex].ID;

          // Get AFK time from activity data
          const afkTime = activityData[laptopId]?.afk || '0 sec';

          return (
            <Typography variant="body2">
              {afkTime}
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
    }
  ];
};