// import React, { useState, useEffect, useRef } from 'react';
// import {
//   TextField,
//   Button,
//   Container,
//   CircularProgress,
//   Typography,
//   Grid,
//   Checkbox,
//   Tooltip,
//   IconButton,
//   Modal,
//   Box,
//   Select,
//   MenuItem,
// } from '@mui/material';
// import MUIDataTable from "mui-datatables";
// import GetAppIcon from '@mui/icons-material/GetApp';
// import PrintIcon from '@mui/icons-material/Print';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
// import './styles.css';
// import EditButton from './EditButton';
// import { padding } from '@mui/system';

// const style = {
//   position: 'absolute',
//   top: '50%',
//   left: '50%',
//   transform: 'translate(-50%, -50%)',
//   width: 400,
//   bgcolor: 'background.paper',
//   // border: '1px solid #000',
//   borderRadius: 4,
//   boxShadow: 24,
//   p: 4,
// };

// function LaptopTagging() {
//   const [data, setData] = useState([]);
//   const [idQuery, setIdQuery] = useState('');
//   const [macQuery, setMacQuery] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [taggedLaptops, setTaggedLaptops] = useState({}); // Track tagged status
//   const [open, setOpen] = useState(false); // Modal state
//   const [selectedRowIndex, setSelectedRowIndex] = useState(null); // To store selected row index
//   const [isChecked, setIsChecked] = useState(false); // To store the desired checked state
//   const printRef = useRef(); // Reference to the div for printing
//   const [changeStatus, setChangeStatus] = useState(false);
//   const [allData, setAllData] = useState([]);
//   const [refresh, setRefresh] = useState(false);

//   const [modelStatus, setModelStatus] = useState(false);


//  useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         const response = await fetch(
//                           `${
//                   process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi
//                 }?type=getLaptopData`);
//           // "https://script.google.com/macros/s/AKfycbxDcI2092h6NLFcV2yvJN-2NaHVp1jc9_T5qs0ntLDcltIdRRZw5nfHiZTT9prPLQsf2g/exec?type=getLaptopData");
//         const result = await response.json();
//         setAllData(result);
//         // setFilteredData(result); // Set filteredData to the fetched data initially
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData(); // Only called once when component mounts
    
//   }, [refresh]);
  
  
//   const handleSearch = () => {
     
//     const filtered = allData.filter(laptop => {
//       if (idQuery) {
//         return String(laptop.ID).toUpperCase() === idQuery.toUpperCase();
//       }
//       if (macQuery) {
//         return String(laptop['Mac address']).toUpperCase() === macQuery.toUpperCase();
//       }
//       return false;
//     });
//     setData(filtered);
    
//   };

//   useEffect(() => {
    
//     handleSearch();
//   },[loading]);
 

//   const handleDownloadPDF = () => {
//     const doc = new jsPDF();
//     const pageWidth = doc.internal.pageSize.getWidth();
//     const padding = 10;
//     const cardWidth = pageWidth - padding * 2;
//     const cardHeight = 100;
//     let yPosition = 20; // Starting Y position for the first card
  
//     data.forEach((laptop, index) => {
//       // Draw card border
//       doc.setDrawColor(0); // Black border
//       doc.rect(padding, yPosition, cardWidth, cardHeight);
  
//       // Add laptop details inside the card
//       doc.setFontSize(12);
//       doc.text(`ID: ${laptop.ID}`, padding + 5, yPosition + 10);
//       doc.text(`Donor Company: ${laptop["Donor Company Name"]}`, padding + 5, yPosition + 20);
//       doc.text(`RAM: ${laptop.RAM}`, padding + 5, yPosition + 30);
//       doc.text(`ROM: ${laptop.ROM}`, padding + 5, yPosition + 40);
//       doc.text(`Manufacturer Model: ${laptop["Manufacturer Model"]}`, padding + 5, yPosition + 50);
//       doc.text(`Minor Issues: ${laptop["Minor Issues"]}`, padding + 5, yPosition + 60);
//       doc.text(`Major Issues: ${laptop["Major Issues"]}`, padding + 5, yPosition + 70);
//       doc.text(`Mac address: ${laptop["Mac address"]}`, padding + 5, yPosition + 80);
//       // doc.text(`barcodeUrl: <img src="${laptop.barcodeUrl}" class="barcode" />`, padding + 5, yPosition + 80);
  
//       // Add space between cards
//       yPosition += cardHeight + 10;
  
//       // Create a new page if the current page is filled
//       if (yPosition + cardHeight > doc.internal.pageSize.getHeight() - padding) {
//         doc.addPage();
//         yPosition = 20; // Reset Y position for new page
//       }
//     });
  
//     // Download the PDF
//     doc.save("laptop_data_cards.pdf");
//   };
  

//   const handlePrint = () => {
//     const printContent = document.getElementById('tableToPrint');
//     const WindowPrint = window.open('', '', 'width=900,height=650');
    

//     // Modify this part to include the structure you want for printing
//     WindowPrint.document.write(`
//       <html>
//         <head>
//           <title>Print Laptop Data</title>
//           <style>
//             /* Add custom print styling here */
//             body {
//               font-family: Arial, sans-serif;
//             }
//             .card {
//               width: 800px;
//               padding: 20px;
//               margin-bottom: 20px;
//               position: relative;
//               page-break-inside: avoid;
//               // left: 50%;
//             }
//             .barcode {
//               position: absolute;
//               top: 20px;
//               right: 30px;
//               width: 150px;
//               height: 50px;
//               border: 1px dashed black; /* Dashed line for cutting */
//               padding: 10px;
//             }
//             table {
//               width: 100%;
//               bottom: 50px;
//               left: 10px;
//             }
//             th, td {
//               padding: 8px 0;
//               text-align: left;
//             }
//             th {
//               text-align: right;
//             }
//           </style>
//         </head>
//         <body>
//           ${data.map(laptop => `
//             <div class="card">
//               <img src="${laptop.barcodeUrl}" class="barcode" />
//               <table>
               
//                 <tr>
//                   <th>Donor Company:</th>
//                   <td>${laptop["Donor Company Name"]}</td>
//                 </tr>
//                 <tr>
//                   <th>RAM:</th>
//                   <td>${laptop.RAM}</td>
//                 </tr>
//                 <tr>
//                   <th>ROM:</th>
//                   <td>${laptop.ROM}</td>
//                 </tr>
//                 <tr>
//                   <th>Manufacturer Model:</th>
//                   <td>${laptop["Manufacturer Model"]}</td>
//                 </tr>
//                 <tr>
//                   <th>Minor Issues:</th>
//                   <td>${laptop["Minor Issues"]}</td>
//                 </tr>
//                 <tr>
//                   <th>Major Issues:</th>
//                   <td>${laptop["Major Issues"]}</td>
//                 </tr>
//                 <tr>
//                   <th>Mac Address:</th>
//                   <td>${laptop["Mac address"]}</td>
//                 </tr>

                
//               </table>
//             </div>
//           `).join('')}
//         </body>
//       </html>
//     `);
    
    
//     WindowPrint.document.close();
//     // WindowPrint.focus();
//     WindowPrint.print();
//     // WindowPrint.close();
//   };

//   const handleReset = () => {
//     setIdQuery('');
//     setMacQuery('');
//     setTaggedLaptops({}); // Reset tagged status
//     setData([]); // Clear data
//   };

//   // Updated function to handle checkbox click
//   const handleTagClick = (event, rowIndex) => {
//     event.stopPropagation();
//     event.preventDefault();

//     const isCurrentlyChecked = taggedLaptops[rowIndex] !== undefined ? taggedLaptops[rowIndex] : data[rowIndex].Working === "Not Working";
//     setSelectedRowIndex(rowIndex);
//     setIsChecked(!isCurrentlyChecked);
//     setChangeStatus(false);

//     setOpen(true); // Open the modal
//   };



//   // Function to handle modal confirmation (Okay button)
//   const handleModalConfirm = async () => {
//     const rowIndex = data[selectedRowIndex];
//     const laptopId = data[selectedRowIndex]?.ID;

//     // Update the taggedLaptops state
//     if (!changeStatus) {
//     setTaggedLaptops(prevState => ({
//       ...prevState,
//       [selectedRowIndex]: isChecked
//     }));
//   }

   
//       const payload = {
//         type:"laptopLabeling",
//         id: laptopId,
//         working: !changeStatus ? (!isChecked?"Working":"Not Working"):rowIndex.Working,
//         donorCompanyName: rowIndex["Donor Company Name"],
//         ram: rowIndex.RAM,
//         rom: rowIndex.ROM,
//         manufacturerModel: rowIndex["Manufacturer Model"], 
//         inventoryLocation: rowIndex["Inventory Location"],
//         macAddress: rowIndex["Mac address"],
//         processor: rowIndex["Processor"],
//         others: rowIndex["Others"], 
//         status: rowIndex["Status"],
//         laptopWeight: rowIndex["laptop weight"],
//         conditionStatus: rowIndex["Condition Status"],
//         manufacturingDate: rowIndex["Manufacturing Date"],
//       };
//       try {
//         await fetch(
//           `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}`,{
//           // "https://script.google.com/macros/s/AKfycbxDcI2092h6NLFcV2yvJN-2NaHVp1jc9_T5qs0ntLDcltIdRRZw5nfHiZTT9prPLQsf2g/exec", {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify(payload),
//           mode: 'no-cors'
//         });
//         setRefresh(!refresh);
//       } catch (error) {
//         console.error('Error tagging the laptop:', error);
//       }
   
//     setOpen(false);
//     setSelectedRowIndex(null);
//     setIsChecked(false);
//     setModelStatus(false);
    
//     handleSearch()
//   };

//   // Function to handle modal cancellation (Cancel button)
//   const handleModalClose = () => {
//     setOpen(false);
//     setSelectedRowIndex(null);
//     setIsChecked(false);
//     setModelStatus(false);
//   };

//   // Function to handle status change
//   const handleStatusChange = (event, rowIndex) => {
//     setSelectedRowIndex(rowIndex);
//     const modelStatustatus = event.target.value;
//     const updatedData = [...data];
//     updatedData[rowIndex].Status = modelStatustatus;
//     setData(updatedData);
//     setModelStatus(true);
//     setChangeStatus(true);
//     setOpen(true);
//     // setRefresh(!refresh);
    
//   };

//   const columns = [
//     { 
//       name: "ID", 
//       label: "Serial No", //Serial No = ID  
//       options: {
//         setCellProps: () => ({
//           className: 'custom-body-cell'
//         }),
//         setCellHeaderProps: () => ({
//           className: 'custom-header-cell'
//         })
//       }
//     },
//     { 
//       name: "Donor Company Name", 
//       label: "Company Name",
//       options: {
//         setCellProps: () => ({
//           className: 'custom-body-cell'
//         }),
//         setCellHeaderProps: () => ({
//           className: 'custom-header-cell'
//         })
//       }
//     },
//     { 
//       name: "RAM", 
//       label: "RAM",
//       options: {
//         setCellProps: () => ({
//           className: 'custom-body-cell'
//         }),
//         setCellHeaderProps: () => ({
//           className: 'custom-header-cell'
//         })
//       }
//     },
//     { 
//       name: "ROM", 
//       label: "ROM",
//       options: {
//         setCellProps: () => ({
//           className: 'custom-body-cell'
//         }),
//         setCellHeaderProps: () => ({
//           className: 'custom-header-cell'
//         })
//       }
//     },
//     { 
//       name: "Manufacturer Model", 
//       label: "Manufacturer Model",
//       options: {
//         setCellProps: () => ({
//           className: 'custom-body-cell'
//         }),
//         setCellHeaderProps: () => ({
//           className: 'custom-header-cell'
//         })
//       }
//     },
//     { 
//       name: "Minor Issues", 
//       label: "Minor Issues",
//       options: {
//         setCellProps: () => ({
//           className: 'custom-body-cell'
//         }),
//         setCellHeaderProps: () => ({
//           className: 'custom-header-cell'
//         })
//       }
//     },
//     { 
//       name: "Major Issues", 
//       label: "Major Issues",
//       options: {
//         setCellProps: () => ({
//           className: 'custom-body-cell'
//         }),
//         setCellHeaderProps: () => ({
//           className: 'custom-header-cell'
//         })
//       }
//     },
//     { 
//       name: "Inventory Location", 
//       label: "Inventory Location",
//       options: {
//         setCellProps: () => ({
//           className: 'custom-body-cell'
//         }),
//         setCellHeaderProps: () => ({
//           className: 'custom-header-cell'
//         })
//       }
//     },
//     { 
//       name: "Mac address", 
//       label: "Mac Address",
//       options: {
//         setCellProps: () => ({
//           className: 'custom-body-cell'
//         }),
//         setCellHeaderProps: () => ({
//           className: 'custom-header-cell'
//         })
//       }
//     },
//     {
//       name: "Status",
//       label: "Status",
//       options: {
//         customBodyRender: (value, tableMeta) => {
//           const rowIndex = tableMeta.rowIndex;
//           const laptopData = data[rowIndex];
//           return (
//             <Select
//               value={laptopData.Status}
//               onChange={(event) => handleStatusChange(event, rowIndex)}
//               displayEmpty
//               style={{borderRadius:"20px"}}
//             >
              
//               <MenuItem value="Laptop Received">Laptop Received</MenuItem>
//               <MenuItem value="Laptop Refurbished">Laptop Refurbished</MenuItem>
//             </Select>
//           );
//         },
//         setCellProps: () => ({
//           className: 'custom-body-cell'
//         }),
//         setCellHeaderProps: () => ({
//           className: 'custom-header-cell'
//         })
//       }
//     },
//     {
//       name: "working",
//       label: "Not Working",// Not Working
//       options: {
//         customBodyRender: (value, tableMeta) => {
//           const rowIndex = tableMeta.rowIndex;
//           const laptopData = data[rowIndex];
//           const isChecked = taggedLaptops[rowIndex] !== undefined ? taggedLaptops[rowIndex] : laptopData.Working === "Not Working";
          
//           return (
//             <Checkbox
//               checked={isChecked}
//               onClick={(event) => handleTagClick(event, rowIndex)}
//               color="primary"
//               className="custom-body-cell"
//             /> 
          
//           )
        
       
//         },
//         setCellProps: () => ({
//           className: 'custom-body-cell'
//         }),
//         setCellHeaderProps: () => ({
//           className: 'custom-header-cell'
//         })
//       }
//     },
//     {
//       name: "Edit",
//       label: "Edit",
//       options: {
//         customBodyRender: (value, tableMeta) => {
//           const rowIndex = tableMeta.rowIndex;
//           const laptopData = data[rowIndex]; // Fetch the current row's laptop data
//           return (
//             <EditButton 
//             laptopData={laptopData} 
//             rowIndex={rowIndex}
//             data={data}
//             setData={setData}
//             setOpen={setOpen}
//             setSelectedRowIndex={setSelectedRowIndex}
//             style={style}
//             setRefresh={setRefresh}
//             refresh={refresh}

//             />
//           );
//         },
//         setCellProps: () => ({
//           className: 'custom-body-cell'
//         }),
//         setCellHeaderProps: () => ({
//           className: 'custom-header-cell'
//         })
//       }
//     }
//   ];

  
  
//   return (
//     <Container maxWidth="xl">
//       <Grid container spacing={2} style={{ marginBottom: '32px', marginTop: '80px' }}>
//         <Grid item xs={12} sm={6}>
//           <TextField
//             label="Search by Serial No"
//             variant="outlined"
//             fullWidth
//             value={idQuery}
//             onChange={(e) => setIdQuery(e.target.value)}
//             onKeyDown={(e) => e.key === 'Enter' && handleSearch()} // Trigger search on Enter key
//             disabled={macQuery !== ''}
//           />
//         </Grid>
//         <Grid item xs={12} sm={6}>
//           <TextField
//             label="Search by Mac Address"
//             variant="outlined"
//             fullWidth
//             value={macQuery}
//             onChange={(e) => setMacQuery(e.target.value)}
//             onKeyDown={(e) => e.key === 'Enter' && handleSearch()} // Trigger search on Enter key
//             disabled={idQuery !== ''}
//           />
//         </Grid>
//       </Grid>
//       <Grid container spacing={2} style={{marginBottom:"32px"}}>
//         <Grid item>
//           <Button
//             variant="contained"
//             color="primary"
//             onClick={handleSearch}
//             disabled={(!idQuery && !macQuery)}
//           >
//             {'Search'}
//           </Button>
//         </Grid>
//         <Grid item>
//           <Button
//             variant="outlined"
//             color="secondary"
//             onClick={handleReset}
//             disabled={loading}
//           >
//             Reset
//           </Button>
//         </Grid>
//       </Grid>

//       {/* Conditionally render the data table */}
      
//       <div id="tableToPrint" >
//         <MUIDataTable
//           title={"Laptop Data"}
//           data={data}
//           columns={columns}
//           options={{
//             responsive: 'scrollMaxHeight', // Adjust table height dynamically
//             customToolbar: () => (
//               <React.Fragment>
//                 <Tooltip title={"Download PDF"}>
//                   <IconButton onClick={handleDownloadPDF}>
//                     <GetAppIcon />
//                   </IconButton>
//                 </Tooltip>
//                 <Tooltip title={"Print"}>
//                   <IconButton onClick={handlePrint}>
//                     <PrintIcon />
//                   </IconButton>
//                 </Tooltip>
//               </React.Fragment>
//             ),
//             filterType: 'checkbox',
//             selectableRows: 'none', 
            
//             download: false, // Disable the default download button
//             print: false,    // Disable the default print button
//             sort: false,
//           }}
//         />
//       </div>
     
//       {/* Modal for checkbox click */}
//       <Modal
//         open={open}
//         onClose={handleModalClose}
//         aria-labelledby="modal-modal-title"
//         aria-describedby="modal-modal-description"
//       >
//         <Box sx={style}>
//           <Typography id="modal-modal-title" variant="h6" component="h2">
            
//             {modelStatus ? "Status" :!isChecked ? 'Working' : 'Not Working'}
//           </Typography>
//           <Typography id="modal-modal-description" sx={{ mt: 2 }}>

          
//          {modelStatus ?
//           "Are you sure you want to change the status for this laptop?"
//           : `Are you sure you want to mark this laptop as ${!isChecked ? 'Working' : 'Not Working'}?`
//          }
//           </Typography>
//           <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
//             <Button variant="outlined" color="secondary" onClick={handleModalClose} style={{ marginRight: 8 }}>
//               Cancel
//             </Button>
//             <Button variant="contained" color="primary" onClick={handleModalConfirm}>
//               Yes
//             </Button>
//           </Box>
//         </Box>
//       </Modal>

//       {/* Hidden div for printing */}
//       <div ref={printRef} style={{ display: 'none' }}></div>
//     </Container>
//   );
// }

// export default LaptopTagging;


// above code is working and existing code


import React, { useState, useEffect, useRef } from 'react';
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
  const [taggedLaptops, setTaggedLaptops] = useState({}); // Track tagged status
  const [open, setOpen] = useState(false); // Modal state
  const [selectedRowIndex, setSelectedRowIndex] = useState(null); // To store selected row index
  const [isChecked, setIsChecked] = useState(false); // To store the desired checked state
  const printRef = useRef(); // Reference to the div for printing
  const [changeStatus, setChangeStatus] = useState(false);
  const [allData, setAllData] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [modelStatus, setModelStatus] = useState(false);
  const [donatedToStatus, setDonatedToStatus] = useState(false);
  const [modalAction, setModalAction] = useState(''); // Track which action triggered the modal
  const [newValue, setNewValue] = useState(''); // Store the new value being set

  // Dummy NGO names
  const ngoList = [
    "Akshaya Patra Foundation",
    "Pratham Education Foundation",
    "Teach For India",
    "Child Rights and You (CRY)",
    "Goonj",
    "HelpAge India",
    "Smile Foundation",
    "Give India",
    "Nanhi Kali",
    "SOS Children's Villages"
  ];

  // Get user email from localStorage when component mounts
  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (email) {
      setUserEmail(email);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`
        );
        const result = await response.json();
        setAllData(result);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refresh]);

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
    
    // Initialize tagged laptops state based on data
    const initialTaggedState = {};
    filtered.forEach((laptop, index) => {
      initialTaggedState[index] = laptop.Working === "Not Working";
    });
    
    setTaggedLaptops(initialTaggedState);
    setData(filtered);
  };

  useEffect(() => {
    if (allData.length > 0 && (idQuery || macQuery)) {
      handleSearch();
    }
  }, [allData]);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const padding = 10;
    const cardWidth = pageWidth - padding * 2;
    const cardHeight = 100;
    let yPosition = 20; // Starting Y position for the first card
  
    data.forEach((laptop) => {
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
      doc.text(`Donated To: ${laptop["Donated To"] || "Not Donated"}`, padding + 5, yPosition + 90);
  
      // Add space between cards
      yPosition += cardHeight + 20;
  
      // Create a new page if the current page is filled
      if (yPosition + cardHeight > doc.internal.pageSize.getHeight() - padding) {
        doc.addPage();
        yPosition = 20; // Reset Y position for new page
      }
    });
  
    // Download the PDF
    doc.save("laptop_data_cards.pdf");
  };

  const handlePrint = () => {
    const WindowPrint = window.open('', '', 'width=900,height=650');
    
    WindowPrint.document.write(`
      <html>
        <head>
          <title>Print Laptop Data</title>
          <style>
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
                <tr>
                  <th>Donated To:</th>
                  <td>${laptop["Donated To"] || "Not Donated"}</td>
                </tr>
              </table>
            </div>
          `).join('')}
        </body>
      </html>
    `);
    
    WindowPrint.document.close();
    WindowPrint.print();
  };

  const handleReset = () => {
    setIdQuery('');
    setMacQuery('');
    setTaggedLaptops({}); // Reset tagged status
    setData([]); // Clear data
  };

  // Function to handle checkbox click for working/not working status
  const handleTagClick = (event, rowIndex) => {
    event.stopPropagation();
    event.preventDefault();

    const isCurrentlyChecked = taggedLaptops[rowIndex] !== undefined ? taggedLaptops[rowIndex] : data[rowIndex].Working === "Not Working";
    setSelectedRowIndex(rowIndex);
    setIsChecked(!isCurrentlyChecked);
    setNewValue(!isCurrentlyChecked ? "Not Working" : "Working");
    
    // Reset other modal flags
    setChangeStatus(false);
    setDonatedToStatus(false);
    setModelStatus(false);
    setModalAction('working');
    
    setOpen(true);
  };

  // Function to handle donated to change
  const handleDonatedToChange = (event, rowIndex) => {
    const donatedTo = event.target.value;
    setSelectedRowIndex(rowIndex);
    setNewValue(donatedTo);
    
    // Reset other modal flags
    setDonatedToStatus(true);
    setChangeStatus(false);
    setModelStatus(false);
    setModalAction('donation');
    
    setOpen(true);
  };

  // Function to handle status change
  const handleStatusChange = (event, rowIndex) => {
    const modelStatus = event.target.value;
    setSelectedRowIndex(rowIndex);
    setNewValue(modelStatus);
    
    // Reset other modal flags
    setModelStatus(true);
    setChangeStatus(true);
    setDonatedToStatus(false);
    setModalAction('status');
    
    setOpen(true);
  };

  // Function to get current timestamp in ISO format
  const getCurrentTimestamp = () => {
    return new Date().toISOString();
  };

  // Function to handle modal confirmation (Okay button)
  const handleModalConfirm = async () => {
    if (selectedRowIndex === null) return;
    
    const rowData = data[selectedRowIndex];
    const laptopId = rowData?.ID;
    
    // Get user email from localStorage
    const storedEmail = localStorage.getItem('userEmail') || userEmail || 'unknown@example.com';
    
    // Get current timestamp
    const timestamp = getCurrentTimestamp();
    
    // Update local state immediately for better UI responsiveness
    const updatedData = [...data];
    
    if (modalAction === 'working') {
      // Update working/not working status
      updatedData[selectedRowIndex].Working = newValue;
      setTaggedLaptops(prevState => ({
        ...prevState,
        [selectedRowIndex]: newValue === "Not Working"
      }));
    } else if (modalAction === 'donation') {
      // Update donated to status
      updatedData[selectedRowIndex]["Donated To"] = newValue;
    } else if (modalAction === 'status') {
      // Update laptop status
      updatedData[selectedRowIndex].Status = newValue;
    }
    
    // Update the UI immediately
    setData(updatedData);

    // Prepare payload for API
    const payload = {
      type: "laptopLabeling",
      id: laptopId,
      working: updatedData[selectedRowIndex].Working,
      donorCompanyName: rowData["Donor Company Name"],
      ram: rowData.RAM,
      rom: rowData.ROM,
      manufacturerModel: rowData["Manufacturer Model"], 
      inventoryLocation: rowData["Inventory Location"],
      macAddress: rowData["Mac address"],
      processor: rowData["Processor"],
      others: rowData["Others"], 
      status: updatedData[selectedRowIndex].Status,
      laptopWeight: rowData["laptop weight"],
      conditionStatus: rowData["Condition Status"],
      manufacturingDate: rowData["Manufacturing Date"],
      donatedTo: updatedData[selectedRowIndex]["Donated To"] || "",
      updatedBy: storedEmail,
      timestamp: timestamp
    };
    
    try {
      await fetch(
        `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        mode: 'no-cors'
      });
      
      // Refresh all data from server after successful update
      setRefresh(prev => !prev);
    } catch (error) {
      console.error('Error updating the laptop:', error);
    }
   
    // Reset modal state
    setOpen(false);
    setSelectedRowIndex(null);
    setIsChecked(false);
    setModelStatus(false);
    setDonatedToStatus(false);
    setChangeStatus(false);
    setModalAction('');
    setNewValue('');
  };

  // Function to handle modal cancellation (Cancel button)
  const handleModalClose = () => {
    setOpen(false);
    setSelectedRowIndex(null);
    setIsChecked(false);
    setModelStatus(false);
    setDonatedToStatus(false);
    setChangeStatus(false);
    setModalAction('');
    setNewValue('');
  };

  const columns = [
    { 
      name: "ID", 
      label: "Serial No",
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
          if (rowIndex < 0 || !data[rowIndex]) return null;
          
          return (
            <Select
              value={data[rowIndex].Status || ""}
              onChange={(event) => handleStatusChange(event, rowIndex)}
              displayEmpty
              style={{borderRadius:"20px"}}
            >
              <MenuItem value="Laptop Received">Laptop Received</MenuItem>
              <MenuItem value="Laptop Refurbished">Laptop Refurbished</MenuItem>
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
      name: "Donated To",
      label: "Donated To",
      options: {
        customBodyRender: (value, tableMeta) => {
          const rowIndex = tableMeta.rowIndex;
          if (rowIndex < 0 || !data[rowIndex]) return null;
          
          return (
            <Select
              value={data[rowIndex]["Donated To"] || ""}
              onChange={(event) => handleDonatedToChange(event, rowIndex)}
              displayEmpty
              style={{borderRadius:"20px"}}
            >
              <MenuItem value="">Not Donated</MenuItem>
              {ngoList.map((ngo, index) => (
                <MenuItem key={index} value={ngo}>{ngo}</MenuItem>
              ))}
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
          if (rowIndex < 0 || !data[rowIndex]) return null;
          
          const isChecked = taggedLaptops[rowIndex] !== undefined 
            ? taggedLaptops[rowIndex] 
            : data[rowIndex].Working === "Not Working";
          
          return (
            <Checkbox
              checked={isChecked}
              onClick={(event) => handleTagClick(event, rowIndex)}
              color="primary"
              className="custom-body-cell"
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
        customBodyRender: (value, tableMeta) => {
          const rowIndex = tableMeta.rowIndex;
          if (rowIndex < 0 || !data[rowIndex]) return null;
          
          return (
            <EditButton 
              laptopData={data[rowIndex]} 
              rowIndex={rowIndex}
              data={data}
              setData={setData}
              setOpen={setOpen}
              setSelectedRowIndex={setSelectedRowIndex}
              style={style}
              setRefresh={setRefresh}
              refresh={refresh}
              userEmail={userEmail}
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
      <Grid container spacing={2} style={{ marginBottom: '32px', marginTop: '80px' }}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Search by Serial No"
            variant="outlined"
            fullWidth
            value={idQuery}
            onChange={(e) => setIdQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()} 
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
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()} 
            disabled={idQuery !== ''}
          />
        </Grid>
      </Grid>
      <Grid container spacing={2} style={{marginBottom:"32px"}}>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            disabled={(!idQuery && !macQuery) || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Search'}
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleReset}
            disabled={loading}
          >
            Reset
          </Button>
        </Grid>
      </Grid>

      <div id="tableToPrint" >
        <MUIDataTable
          title={"Laptop Data"}
          data={data}
          columns={columns}
          options={{
            responsive: 'scrollMaxHeight',
            customToolbar: () => (
              <React.Fragment>
                <Tooltip title={"Download PDF"}>
                  <IconButton onClick={handleDownloadPDF}>
                    <GetAppIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={"Print"}>
                  <IconButton onClick={handlePrint}>
                    <PrintIcon />
                  </IconButton>
                </Tooltip>
              </React.Fragment>
            ),
            filterType: 'checkbox',
            selectableRows: 'none', 
            download: false,
            print: false,
            sort: false,
          }}
        />
      </div>
     
      {/* Modal for all actions */}
      <Modal
        open={open}
        onClose={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {modalAction === 'donation' ? "Donation Status" : 
             modalAction === 'status' ? "Status Update" : 
             modalAction === 'working' ? (newValue === "Working" ? 'Mark as Working' : 'Mark as Not Working') :
             "Update Laptop"}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {modalAction === 'donation' ? 
             `Are you sure you want to ${newValue ? `donate this laptop to ${newValue}` : 'mark this laptop as not donated'}?` :
             modalAction === 'status' ?
             `Are you sure you want to change the status to "${newValue}"?` :
             modalAction === 'working' ?
             `Are you sure you want to mark this laptop as ${newValue}?` :
             "Are you sure you want to update this laptop?"}
          </Typography>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="outlined" color="secondary" onClick={handleModalClose} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleModalConfirm}>
              Yes, Update
            </Button>
          </Box>
        </Box>
      </Modal>

      <div ref={printRef} style={{ display: 'none' }}></div>
    </Container>
  );
}

export default LaptopTagging;