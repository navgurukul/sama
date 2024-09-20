import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import {
  TextField,
  Button,
  Container,
  CircularProgress,
  Typography,
  Grid,
  Checkbox,
  Tooltip,
  IconButton,
  Modal,
  Box,
  Card,
  Select,
  MenuItem,
} from '@mui/material';
import MUIDataTable from "mui-datatables";
import GetAppIcon from '@mui/icons-material/GetApp';
import PrintIcon from '@mui/icons-material/Print';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './styles.css';
import EditButton from './EditButton';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 4,
  boxShadow: 24,
  p: 4,
};

function LaptopTagging() {
  const [data, setData] = useState([]);
  const [idQuery, setIdQuery] = useState('');
  const [macQuery, setMacQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const [searchLoading, setSearchLoading] = useState(false); // New state for Search button loading
  const [taggedLaptops, setTaggedLaptops] = useState({}); // Track tagged status
  const [open, setOpen] = useState(false); // Modal state
  const [selectedRowIndex, setSelectedRowIndex] = useState(null); // To store selected row index
  const [isChecked, setIsChecked] = useState(false); // To store the desired checked state
  const printRef = useRef(); // Reference to the div for printing
  const [changeStatus, setChangeStatus] = useState(false);
  const [allData, setAllData] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [modelStatus, setModelStatus] = useState(false);
  const [showData, setShowData] = useState(false);

  const theme = useTheme();
  const isXsOrSm = useMediaQuery(theme.breakpoints.down('sm')); // Check for xs and sm
  const isMdOrLg = useMediaQuery(theme.breakpoints.up('md')); // Check for md and lg
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://script.google.com/macros/s/AKfycbxDcI2092h6NLFcV2yvJN-2NaHVp1jc9_T5qs0ntLDcltIdRRZw5nfHiZTT9prPLQsf2g/exec?type=getLaptopData");
        const result = await response.json();

        // Check if fetched data is different from current allData
        if (JSON.stringify(result) !== JSON.stringify(allData)) {
          setAllData(result);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };


    fetchData(); // Initial fetch on mount

    const intervalId = setInterval(fetchData, 1000); // Adjust as needed

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [allData]);

  useEffect(() => {
    if (showData) {
      // Perform the search only if showData is true
      handleSearch();
    }
  }, [showData, allData, idQuery, macQuery]);

  const handleSearch = () => {
    const filtered = allData.filter(laptop => {
      if (idQuery) {
        return String(laptop.ID).toUpperCase() === idQuery.toUpperCase();
      }
      if (macQuery) {
        return String(laptop['Mac address']).toUpperCase() === macQuery.toUpperCase();
      }
      return false;
    });
    setData(filtered); // Update the data with filtered results
    setShowData(true); // Set to true when the button is clicked

  };
  // Handle Download PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const padding = 10;
    const cardWidth = pageWidth - padding * 2;
    const cardHeight = 100;
    let yPosition = 20; // Starting Y position for the first card

    data.forEach((laptop, index) => {
      // Draw card border
      doc.setDrawColor(0); // Black border
      doc.rect(padding, yPosition, cardWidth, cardHeight);

      // Add laptop details inside the card
      doc.setFontSize(12);
      doc.text(`ID: ${laptop.ID}`, padding + 5, yPosition + 10);
      doc.text(`Donor Company: ${laptop["Donor Company Name"]}`, padding + 5, yPosition + 20);
      doc.text(`RAM: ${laptop.RAM}`, padding + 5, yPosition + 30);
      doc.text(`ROM: ${laptop.ROM}`, padding + 5, yPosition + 40);
      doc.text(`Manufacturer Model: ${laptop["Manufacturer Model"]}`, padding + 5, yPosition + 50);
      doc.text(`Minor Issues: ${laptop["Minor Issues"]}`, padding + 5, yPosition + 60);
      doc.text(`Major Issues: ${laptop["Major Issues"]}`, padding + 5, yPosition + 70);
      doc.text(`Mac address: ${laptop["Mac address"]}`, padding + 5, yPosition + 80);
      // doc.text(barcodeUrl: <img src="${laptop.barcodeUrl}" class="barcode" />, padding + 5, yPosition + 80);

      // Add space between cards
      yPosition += cardHeight + 10;

      // Create a new page if the current page is filled
      if (yPosition + cardHeight > doc.internal.pageSize.getHeight() - padding) {
        doc.addPage();
        yPosition = 20; // Reset Y position for new page
      }
    });

    // Download the PDF
    doc.save("laptop_data_cards.pdf");
  };

  // Handle Print
  const handlePrint = () => {
    const printContent = document.getElementById('tableToPrint');
    const WindowPrint = window.open('', '', 'width=900,height=650');

    // Modify this part to include the structure you want for printing
    WindowPrint.document.write(`
      <html>
        <head>
          <title>Print Laptop Data</title>
          <style>
            /* Add custom print styling here */
            body {
              font-family: Arial, sans-serif;
            }
            .card {
              width: 800px;
              padding: 20px;
              margin-bottom: 20px;
              position: relative;
              page-break-inside: avoid;
            }
            .barcode {
              position: absolute;
              top: 20px;
              right: 30px;
              width: 150px;
              height: 50px;
              border: 1px dashed black; /* Dashed line for cutting */
              padding: 10px;
            }
            table {
              width: 100%;
              bottom: 50px;
              left: 10px;
            }
            th, td {
              padding: 8px 0;
              text-align: left;
            }
            th {
              text-align: right;
            }
          </style>
        </head>
        <body>
          ${data.map(laptop => `
            <div class="card">
              <img src="${laptop.barcodeUrl}" class="barcode" />
              <table>
                <tr>
                  <th>Donor Company:</th>
                  <td>${laptop["Donor Company Name"]}</td>
                </tr>
                <tr>
                  <th>RAM:</th>
                  <td>${laptop.RAM}</td>
                </tr>
                <tr>
                  <th>ROM:</th>
                  <td>${laptop.ROM}</td>
                </tr>
                <tr>
                  <th>Manufacturer Model:</th>
                  <td>${laptop["Manufacturer Model"]}</td>
                </tr>
                <tr>
                  <th>Minor Issues:</th>
                  <td>${laptop["Minor Issues"]}</td>
                </tr>
                <tr>
                  <th>Major Issues:</th>
                  <td>${laptop["Major Issues"]}</td>
                </tr>
                <tr>
                  <th>Mac Address:</th>
                  <td>${laptop["Mac address"]}</td>
                </tr>
              </table>
            </div>
          `).join('')}
        </body>
      </html>
    `);

    WindowPrint.document.close();
    WindowPrint.print();
    // Optionally close the window after printing
    // WindowPrint.close();
  };

  // Handle Reset
  const handleReset = () => {
    setIdQuery('');
    setMacQuery('');
    setTaggedLaptops({}); // Reset tagged status
    setData([]); // Clear data
  };

  // Updated function to handle checkbox click
  const handleTagClick = (event, rowIndex) => {
    event.stopPropagation();
    event.preventDefault();

    const isCurrentlyChecked = taggedLaptops[rowIndex] !== undefined ? taggedLaptops[rowIndex] : data[rowIndex].Working === "Not Working";
    setSelectedRowIndex(rowIndex);
    setIsChecked(!isCurrentlyChecked);
    setChangeStatus(false);

    setOpen(true); // Open the modal
  };

  // Function to handle modal confirmation (Okay button)
  const handleModalConfirm = async () => {
    const rowData = data[selectedRowIndex];
    const laptopId = rowData?.ID;

    // Update the taggedLaptops state
    if (!changeStatus) {
      setTaggedLaptops(prevState => ({
        ...prevState,
        [selectedRowIndex]: isChecked
      }));
    }

    const payload = {
      type: "laptopLabeling",
      id: laptopId,
      working: !changeStatus ? (!isChecked ? "Working" : "Not Working") : rowData.Working,
      donorCompanyName: rowData["Donor Company Name"],
      ram: rowData.RAM,
      rom: rowData.ROM,
      manufacturerModel: rowData["Manufacturer Model"],
      inventoryLocation: rowData["Inventory Location"],
      macAddress: rowData["Mac address"],
      processor: rowData["Processor"],
      others: rowData["Others"],
      status: rowData["Status"],
      laptopWeight: rowData["laptop weight"],
      conditionStatus: rowData["Condition Status"],
      manufacturingDate: rowData["Manufacturing Date"],
    };
    try {
      await fetch("https://script.google.com/macros/s/AKfycbxDcI2092h6NLFcV2yvJN-2NaHVp1jc9_T5qs0ntLDcltIdRRZw5nfHiZTT9prPLQsf2g/exec", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        mode: 'no-cors'
      });
    } catch (error) {
      console.error('Error tagging the laptop:', error);
    }

    setOpen(false);
    setSelectedRowIndex(null);
    setIsChecked(false);
    setModelStatus(false);
    setRefresh(!refresh); // Trigger data re-fetch
    handleSearch(); // Remove this line as handleSearch will be called via useEffect
  };

  // Function to handle modal cancellation (Cancel button)
  const handleModalClose = () => {
    setOpen(false);
    setSelectedRowIndex(null);
    setIsChecked(false);
    setModelStatus(false);
  };

  // Function to handle status change
  const handleStatusChange = (event, rowIndex) => {
    setSelectedRowIndex(rowIndex);
    const modelStatustatus = event.target.value;
    const updatedData = [...data];
    updatedData[rowIndex].Status = modelStatustatus;
    setData(updatedData);
    setModelStatus(true);
    setChangeStatus(true);
    setOpen(true);
  };

  const columns = [
    {
      name: "ID",
      label: "Serial No", // Serial No = ID  
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
            <Select
              value={laptopData.Status}
              onChange={(event) => handleStatusChange(event, rowIndex)}
              displayEmpty
              style={{ borderRadius: "20px", fontSize: "14px" }}
            >
              {/* <MenuItem value=""><em>None</em></MenuItem> */}
              <MenuItem value="Data Entered" style={{ fontSize: "14px" }}>Data Entered</MenuItem>
              <MenuItem value="Laptop Received" style={{ fontSize: "14px" }}>Laptop Received</MenuItem>
              <MenuItem value="Laptop Refurbished" style={{ fontSize: "14px" }}>Laptop Refurbished</MenuItem>
            </Select>
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
            <Checkbox
              checked={isChecked}
              onClick={(event) => handleTagClick(event, rowIndex)}
              color="primary"
              className="custom-body-cell"
            />
          )
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
        customBodyRender: (value, tableMeta) => {
          const rowIndex = tableMeta.rowIndex;
          const laptopData = data[rowIndex]; // Fetch the current row's laptop data
          return (
            <EditButton
              laptopData={laptopData}
              rowIndex={rowIndex}
              data={data}
              setData={setData}
              setOpen={setOpen}
              setSelectedRowIndex={setSelectedRowIndex}
              style={style}
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
    }
  ];

  return (
    <Container maxWidth="xl">
      {/* Search Fields */}
      <Grid container spacing={2}  style={{ marginBottom: '32px', marginTop: '80px' }}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Search by Serial No"
            variant="outlined"
            fullWidth
            value={idQuery}
            onChange={(e) => setIdQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(true)} // Trigger manual search on Enter key
            disabled={macQuery !== ''}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Search by Mac Address"
            variant="outlined"
            fullWidth
            value={macQuery}
            onChange={(e) => setMacQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(true)} // Trigger manual search on Enter key
            disabled={idQuery !== ''}
          />
        </Grid>
      </Grid>

      {/* Search and Reset Buttons */}
      <Grid container spacing={2} style={{ marginBottom: '32px'}}>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch} // Manual search on click
            disabled={searchLoading || (!idQuery && !macQuery)} // Disable if loading or no query
          >
            {searchLoading ? <CircularProgress size={24} /> : 'Search'}
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleReset}
            disabled={loading} // Optionally, disable Reset button while fetching data
          >
            Reset
          </Button>
        </Grid>
      </Grid>
      <div>
        {isXsOrSm ? ( // Show data on xs and sm
          <Card>
            <Typography variant='h6'>Laptop Data</Typography>
            <Grid container spacing={2} sx={{ mt: 2, px: 2 }} >
              <Tooltip title="Download PDF">
                <IconButton onClick={handleDownloadPDF}>
                  <GetAppIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Print">
                <IconButton onClick={handlePrint}>
                  <PrintIcon />
                </IconButton>
              </Tooltip>
              {data.map((item, index) => (
                <Grid item xs={12} key={index}>
                  <Grid container spacing={2}>
                    {Object.keys(item).map((key) => (
                      <React.Fragment key={key}>
                        <Grid item xs={4}>
                          <Typography variant="body2" style={{ fontWeight: 'bold' }}>
                            {key}:
                          </Typography>
                        </Grid>
                        <Grid item xs={8}>
                          <Typography variant="body2">
                            {item[key]}
                          </Typography>
                        </Grid>
                      </React.Fragment>
                    ))}
                  </Grid>

                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="body2" style={{ fontWeight: 'bold' }}>Not Working</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Checkbox
                        checked={isChecked}
                        onClick={(event) => handleTagClick(event, index)}
                        color="primary"
                        className="custom-body-cell"
                      />
                    </Grid>
                  </Grid>

                  <Grid container alignItems="center" spacing={5}>
                    <Grid item xs={4}>
                      <Typography variant="body2" style={{ fontWeight: 'bold' }}>Status</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Select
                        value={item.Status} // Use the current item's status
                        onChange={(event) => handleStatusChange(event, index)}
                        displayEmpty
                        style={{ borderRadius: '20px' }}
                      >
                        <MenuItem value="Data Entered">Data Entered</MenuItem>
                        <MenuItem value="Laptop Received">Laptop Received</MenuItem>
                        <MenuItem value="Laptop Refurbished">Laptop Refurbished</MenuItem>
                      </Select>
                    </Grid>
                  </Grid>

                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="body2" style={{ fontWeight: 'bold' }}>Edit</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <EditButton
                        laptopData={item} // Pass the current item data
                        rowIndex={index}
                        data={data}
                        setData={setData}
                        setOpen={setOpen}
                        setSelectedRowIndex={setSelectedRowIndex}
                        style={style}
                        setRefresh={setRefresh}
                        refresh={refresh}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              ))}
            </Grid>
          </Card>
        ) : (
          isMdOrLg && (
            <MUIDataTable
              title="Laptop Data"
              data={data}
              columns={columns}
              options={{
                responsive: 'scrollMaxHeight', // Adjust table height dynamically
                customToolbar: () => (
                  <React.Fragment>
                    <Tooltip title="Download PDF">
                      <IconButton onClick={handleDownloadPDF}>
                        <GetAppIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Print">
                      <IconButton onClick={handlePrint}>
                        <PrintIcon />
                      </IconButton>
                    </Tooltip>
                  </React.Fragment>
                ),
                filterType: 'checkbox',
                selectableRows: 'none',
                download: false, // Disable the default download button
                print: false,    // Disable the default print button
                sort: false,
              }}
            />
          )
        )}
      </div>

      {/* Modal for checkbox click */}
      <Modal
        open={open}
        onClose={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            ...style,
            padding: isSmallScreen ? '16px' : '24px', // Adjust padding
            width: isSmallScreen ? '70%' : '400px' // Set a responsive width
          }}
        >
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {modelStatus ? 'Status' : !isChecked ? 'Working' : 'Not Working'}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {modelStatus
              ? 'Are you sure you want to change the status for this laptop?'
              : `Are you sure you want to mark this laptop as ${!isChecked ? 'Working' : 'Not Working'}?`}
          </Typography>
          <Box sx={{ mt: 3, display: 'flex', flexDirection: isSmallScreen ? 'column' : 'row', justifyContent: 'flex-end' }}>
            <Button variant="outlined" color="secondary" onClick={handleModalClose} style={{ marginRight: isSmallScreen ? 0 : 8, marginBottom: isSmallScreen ? 8 : 0 }}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleModalConfirm}>
              Yes
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Hidden div for printing */}
      <div ref={printRef} style={{ display: 'none' }}></div>
    </Container>

  );
}

export default LaptopTagging;
