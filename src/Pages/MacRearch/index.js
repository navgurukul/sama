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
} from '@mui/material';
import MUIDataTable from "mui-datatables";
import GetAppIcon from '@mui/icons-material/GetApp';
import PrintIcon from '@mui/icons-material/Print';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
;

function MacSearch() {
  const [data, setData] = useState([]);
  const [idQuery, setIdQuery] = useState('');
  const [macQuery, setMacQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // Store selected row
  const [taggedLaptops, setTaggedLaptops] = useState({}); // Track tagged status
  const printRef = useRef(); // Reference to the div for printing

  const handleSearch = async () => {
    if (idQuery || macQuery) {
      const url = "https://script.google.com/macros/s/AKfycbzOnMNkCIFCaPwPcXGXpW-ROdo3j1YdYzlFvpthEn7n_8oKWHBzn7e8HluT0L8w0tYU/exec?type=getLaptopData";
      setLoading(true);
      try {
        const response = await fetch(url);
        const result = await response.json();

        const filteredData = result.filter(laptop => {
          if (idQuery) {
            return laptop.ID.toUpperCase() === idQuery.toUpperCase();
          }
          if (macQuery) {
            return laptop['Mac address'].toUpperCase() === macQuery.toUpperCase();
          }
          return false;
        });
        setData(filteredData);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

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
      // doc.text(`barcodeUrl: <img src="${laptop.barcodeUrl}" class="barcode" />`, padding + 5, yPosition + 80);
  
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
              width: 400px;
              padding: 20px;
              border: 1px dashed black; /* Dashed line for cutting */
              margin-bottom: 20px;
              position: relative;
              page-break-inside: avoid;
              left: 50%;
            }
            .barcode {
              position: absolute;
              top: 20px;
              right: 20px;
              width: 150px;
              height: 50px;
            }
            table {
              width: 100%;
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
                  <th>ID:</th>
                  <td>${laptop.ID}</td>
                </tr>
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
              </table>
            </div>
          `).join('')}
        </body>
      </html>
    `);
    
    
    WindowPrint.document.close();
    WindowPrint.focus();
    WindowPrint.print();
    // WindowPrint.close();
  };

  const handleReset = () => {
    setIdQuery('');
    setMacQuery('');
    setSelectedUser(null); // Reset selected user
    setTaggedLaptops({}); // Reset tagged status
    setData([]); // Clear data
  };

  const handleTagChange = async (event, rowIndex) => {
    const isChecked = event.target.checked;
    const laptopId = data[rowIndex].ID; // Assuming each row has an ID field
    setTaggedLaptops(prevState => ({
      ...prevState,
      [rowIndex]: isChecked
    }));
    
    // Make a request to the backend to update the tag status
    const payload = {
      type:"laptopLabeling",
      id: laptopId,
      // macAddress: data[rowIndex]["Mac address"],
      status: "tagged", // Update status field
    };
    try {
      await fetch("https://script.google.com/macros/s/AKfycbzOnMNkCIFCaPwPcXGXpW-ROdo3j1YdYzlFvpthEn7n_8oKWHBzn7e8HluT0L8w0tYU/exec", {
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
  };

  const columns = [
    { name: "ID", label: "ID" },
    { name: "Donor Company Name", label: "Company Name" },
    { name: "RAM", label: "RAM" },
    { name: "ROM", label: "ROM" },
    { name: "Manufacturer Model", label: "Manufacturer Model" },
    { name: "Minor Issues", label: "Minor Issues" },
    { name: "Major Issues", label: "Major Issues" },
    { name: "Inventory Location", label: "Inventory Location" },
    { name: "Mac address", label: "Mac Address" },
    {
      name: "Tag",
      label: "Tag Laptop",
      options: {
        customBodyRender: (value, tableMeta) => {
          const rowIndex = tableMeta.rowIndex;
          const laptopData = data[rowIndex];
          const isChecked = laptopData.Status === "Tagged" || taggedLaptops[rowIndex];

          return (
            <Checkbox
              checked={isChecked}
              onChange={(event) => handleTagChange(event, rowIndex)}
              color="primary"
            />
          );
        },
      }
    },
  ];

  return (
    <Container maxWidth="xl">
      <Grid container spacing={2} style={{ marginBottom: '32px', marginTop: '80px' }}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Search by ID"
            variant="outlined"
            fullWidth
            value={idQuery}
            onChange={(e) => setIdQuery(e.target.value)}
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
            disabled={loading || (!idQuery && !macQuery)}
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

      {/* Conditionally render the data table */}
      
      <div id="tableToPrint">
        <MUIDataTable
          title={"Laptop Data"}
          data={data}
          columns={columns}
          options={{
          
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
           
            download: false, // Disable the default download button
            print: false,    // Disable the default print button
          }}
        />
      </div>
     

      {/* {!loading && data.length === 0 && (
        <Typography variant="h6" style={{ marginTop: '20px' }}>
          No data available. Please search for a laptop.
        </Typography>
      )} */}

      {/* Hidden div for printing */}
      <div ref={printRef} style={{ display: 'none' }}></div>
    </Container>
  );
}

export default MacSearch;
// import React, { useState, useEffect } from 'react';
// import {
//   TextField,
//   Button,
//   Container,
//   CircularProgress,
//   Typography,
//   Grid,
//   Checkbox,
//   Card,
//   CardContent,
// } from '@mui/material';

// function MacSearch() {
//   const [data, setData] = useState([]);
//   const [idQuery, setIdQuery] = useState('');
//   const [macQuery, setMacQuery] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [taggedLaptops, setTaggedLaptops] = useState({}); // Track tagged status

//   useEffect(() => {
//     const url = "https://script.googleusercontent.com/a/macros/navgurukul.org/echo?user_content_key=KH9kUrgkH267t83f1QedcvTZhwPab_r16OtH9q1XkaacSm-8rn2EkRZpNZucVjMn2XJaraXE48uL-CGAOiT16fb6-fd_lkziOJmA1Yb3SEsKFZqtv3DaNYcMrmhZHmUMi80zadyHLKAJ4fo5HVkxwTwh_Dbiw1N-606TFosF_cmfFavGFEfLHNkpmYDlTMR7877SNdmGtYFJp7iuIOlnv91dmRY-VSP-2lKELv8oYMMXLKLQNQbFMDCXyanNoDrXVRa7EDR7xSMBpZl_Cdk7gEy5z8VyYlK_v5rCT8fqSWc&lib=Mz-qBBK5fWsdsIbV8wt6V5DqujjucHJmb";
//     setLoading(true);
//     const fetchData = async () => {
//       try {
//         const queryParam = idQuery ? `idQuery=${idQuery}` : macQuery ? `macQuery=${macQuery}` : '';
//         const response = await fetch(queryParam ? `${url}?${queryParam}` : url);
//         const result = await response.json();
//         setData(result);
//       } catch (error) {
//         console.error('Error:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [idQuery, macQuery]);

//   const handleReset = () => {
//     setIdQuery('');
//     setMacQuery('');
//     setTaggedLaptops({}); // Reset tagged status
//   };

//   const handleTagChange = async (event, rowIndex) => {
//     const isChecked = event.target.checked;
//     const laptopId = data[rowIndex].ID; // Assuming each row has an ID field
//     setTaggedLaptops(prevState => ({
//       ...prevState,
//       [rowIndex]: isChecked
//     }));

//     // Make a request to the backend to update the status as "Tagged"
//     const payload = {
//       id: laptopId,
//       macAddress: data[rowIndex]["Mac address"],
//       status: isChecked ? "Tagged" : "Received", // Update status field
      
//     };

//     try {
//       await fetch("https://script.google.com/macros/s/AKfycbx7cVCWoQ9Dy2Qxb2rhUiUVaaWUBbIZ5ahING-9---o4U35V-XZ4T_F5m4drTFb1qts/exec", {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(payload),
//         mode: 'no-cors'
//       });
//     } catch (error) {
//       console.error('Error tagging the laptop:', error);
//     }
//   };

//   const handlePrint = (row,rowIndex) => {
//     const printContent = document.getElementById(`card-${rowIndex}`);
//     const win = window.open('', '', 'width=800,height=600');
//     win.document.write(printContent.outerHTML);
//     win.document.close();
//     // win.focus();
//     win.print();
//     // win.close();
   
//   };

//   return (
//     <Container maxWidth="lg">
//       <Grid container spacing={2} style={{ marginBottom: '20px' }}>
//         <Grid item xs={12} sm={6}>
//           <TextField
//             label="Search by ID"
//             variant="outlined"
//             fullWidth
//             value={idQuery}
//             onChange={(e) => setIdQuery(e.target.value)}
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
//             disabled={idQuery !== ''}
//           />
//         </Grid>
//       </Grid>
//       <Grid container spacing={2}>
//         <Grid item>
//           <Button
//             variant="contained"
//             color="primary"
//             onClick={() => setIdQuery(idQuery) || setMacQuery(macQuery)}
//             disabled={loading || (!idQuery && !macQuery)}
//           >
//             {loading ? <CircularProgress size={24} /> : 'Search'}
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

//       {!loading && data.length > 0 ? (
//         data.map((row, rowIndex) => (
//           <Card id={`card-${rowIndex}`} key={rowIndex} style={{ marginTop: '20px' }}>
//             <CardContent>
//               <Grid container spacing={2}>
//                 <Grid item xs={6}>
//                   <Typography variant="body1"><strong>Date:</strong></Typography>
//                 </Grid>
//                 <Grid item xs={6}>
//                   <Typography variant="body1">{row.Date}</Typography>
//                 </Grid>

//                 <Grid item xs={6}>
//                   <Typography variant="body1"><strong>Donor Company Name:</strong></Typography>
//                 </Grid>
//                 <Grid item xs={6}>
//                   <Typography variant="body1">{row["Donor Company Name"]}</Typography>
//                 </Grid>

//                 <Grid item xs={6}>
//                   <Typography variant="body1"><strong>RAM:</strong></Typography>
//                 </Grid>
//                 <Grid item xs={6}>
//                   <Typography variant="body1">{row.RAM}</Typography>
//                 </Grid>

//                 <Grid item xs={6}>
//                   <Typography variant="body1"><strong>ROM:</strong></Typography>
//                 </Grid>
//                 <Grid item xs={6}>
//                   <Typography variant="body1">{row.ROM}</Typography>
//                 </Grid>

//                 <Grid item xs={6}>
//                   <Typography variant="body1"><strong>Manufacturer Model:</strong></Typography>
//                 </Grid>
//                 <Grid item xs={6}>
//                   <Typography variant="body1">{row["Manufacturer Model"]}</Typography>
//                 </Grid>

//                 <Grid item xs={6}>
//                   <Typography variant="body1"><strong>Minor Issues:</strong></Typography>
//                 </Grid>
//                 <Grid item xs={6}>
//                   <Typography variant="body1">{row["Minor Issues"]}</Typography>
//                 </Grid>

//                 <Grid item xs={6}>
//                   <Typography variant="body1"><strong>Major Issues:</strong></Typography>
//                 </Grid>
//                 <Grid item xs={6}>
//                   <Typography variant="body1">{row["Major Issues"]}</Typography>
//                 </Grid>

//                 <Grid item xs={6}>
//                   <Typography variant="body1"><strong>Inventory Location:</strong></Typography>
//                 </Grid>
//                 <Grid item xs={6}>
//                   <Typography variant="body1">{row["Inventory Location"]}</Typography>
//                 </Grid>

//                 <Grid item xs={6}>
//                   <Typography variant="body1"><strong>Mac Address:</strong></Typography>
//                 </Grid>
//                 <Grid item xs={6}>
//                   <Typography variant="body1">{row["Mac address"]}</Typography>
//                 </Grid>

//                 <Grid item xs={6}>
//                   <Typography variant="body1"><strong>BarCod:</strong></Typography>
//                 </Grid>
//                 <Grid item xs={6}>
//                 <img
//                 src={row["barcodeUrl"]}
//                 alt="Generated Barcode"
//                 style={{ width: "150px", height: "150px" }}
//               />
//                 </Grid>

//                 <Grid item xs={6}>
//                   <Typography variant="body1"><strong>Status:</strong></Typography>
//                 </Grid>e
//                 <Grid item xs={6}>
//                   <Checkbox
//                     checked={row.Status === "Tagged" || taggedLaptops[rowIndex]}
//                     onChange={(event) => handleTagChange(event, rowIndex)}
//                     color="primary"
//                   />
//                 </Grid>

//                 <Grid item xs={12}>
//                   <Button variant="contained" color="primary" onClick={() => handlePrint(row,rowIndex)}>
//                     Print
//                   </Button>
//                 </Grid>
//               </Grid>
//             </CardContent>
//           </Card>
//         ))
//       ) : (
//         !loading && (
//           <Typography variant="h6" style={{ marginTop: '20px' }}>
//             No data found. Please search to see results.
//           </Typography>
//         )
//       )}
//     </Container>
//   );
// }
// export default MacSearch;

