// import React, { useState, useEffect, useRef } from 'react';
// import {
//   TextField,
//   Button,
//   Container,
//   CircularProgress,
//   Typography,
//   Grid,
//   Switch
// } from '@mui/material';
// import MUIDataTable from "mui-datatables";

// function MacSearch() {
//   const [data, setData] = useState([]);
//   const [idQuery, setIdQuery] = useState('');
//   const [macQuery, setMacQuery] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [selectedUser, setSelectedUser] = useState(null); // Store selected row
//   const [taggedLaptops, setTaggedLaptops] = useState({}); // Track tagged status
//   const printRef = useRef(); // Reference to the div for printing

//   useEffect(() => {
//     if (idQuery || macQuery) {
//       const url = "https://script.google.com/macros/s/AKfycbyWQ1uHiZPwjRWaFU09r6OiDwdizokTqF3v2ZoNttQp7T9EO6GVtUKtIO17qpbRC29T/exec";
//       setLoading(true);
//       const fetchData = async () => {
//         try {
//           const queryParam = idQuery ? `idQuery=${idQuery}` : macQuery ? `macQuery=${macQuery}` : '';
//           const response = await fetch(queryParam ? `${url}?${queryParam}` : url);
//           const result = await response.json();
//           setData(result);
//         } catch (error) {
//           console.error('Error:', error);
//         } finally {
//           setLoading(false);
//         }
//       };
//       fetchData();
//     }
//   }, [idQuery, macQuery]);

//   const handleReset = () => {
//     setIdQuery('');
//     setMacQuery('');
//     setSelectedUser(null); // Reset selected user
//     setTaggedLaptops({}); // Reset tagged status
//     setData([]); // Clear data
//   };

//   const handleTagChange = async (event, rowIndex) => {
//     const isChecked = event.target.checked;
//     const laptopId = data[rowIndex].ID; // Assuming each row has an ID field
//     setTaggedLaptops(prevState => ({
//       ...prevState,
//       [rowIndex]: isChecked
//     }));

//     // Make a request to the backend to update the tag status
//     const payload = {
//       id: laptopId,
//       macAddress: data[rowIndex]["Mac address"],
//       tagged: isChecked ? "Yes" : "No",
//       donorCompanyName: data[rowIndex]["Donor Company Name"],
//       ram: data[rowIndex]["RAM"],
//       rom: data[rowIndex]["ROM"],
//       manufacturerModel: data[rowIndex]["Manufacturer Model"],
//       minorIssues: data[rowIndex]["Minor Issues"],
//       majorIssues: data[rowIndex]["Major Issues"],
//       inventoryLocation: data[rowIndex]["Inventory Location"],
//       others: data[rowIndex]["Others"],
//       laptopWeight: data[rowIndex]["laptop weight"],
//       processor: data[rowIndex]["Processor"],
//       conditionStatus: data[rowIndex]["Condition Status"],
//       manufacturingDate: data[rowIndex]["Manufacturing Date"],
//     };
//     try {
//       await fetch('https://script.google.com/macros/s/AKfycbxzBINLBTlivzI_XjEvwxTl4-iUpXNmE6Zug1_PJKh9FOJGO4ZpHkelu9Jr6be_szRp/exec', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(payload),
//         mode: 'no-cors'
//       });

//       if (isChecked) {
//         const printWindow = window.open('', '_blank');
//         printWindow.document.write('<html><head><title>Print</title></head><body>');
//         printWindow.document.write(`<p>Laptop ID: ${laptopId}</p>`);
//         printWindow.document.write('</body></html>');
//         printWindow.document.close();
//         printWindow.print();
//       }
//     } catch (error) {
//       console.error('Error tagging the laptop:', error);
//     };
//   };

//   const columns = [
//     {
//       name: "Tag",
//       label: "Tag Laptop",
//       options: {
//         customBodyRender: (value, tableMeta) => {
//           const rowIndex = tableMeta.rowIndex;
//           const laptopData = data[rowIndex];
//           const isChecked = laptopData.Tagging === "Yes" || taggedLaptops[rowIndex];

//           return (
//             <Switch
//               checked={isChecked}
//               onChange={(event) => handleTagChange(event, rowIndex)}
//               color="success" // This will show a green switch when it's "checked"
//             />
//           );
//         },
//       }
//     },
//     { name: "Date", label: "Date" },
//     { name: "Donor Company Name", label: "Company Name" },
//     { name: "RAM", label: "RAM" },
//     { name: "ROM", label: "ROM" },
//     { name: "Manufacturer Model", label: "Manufacturer Model" },
//     { name: "Minor Issues", label: "Minor Issues" },
//     { name: "Major Issues", label: "Major Issues" },
//     { name: "Inventory Location", label: "Inventory Location" },
//     { name: "Mac address", label: "Mac Address" },
//   ];

//   const options = {
//     filterType: 'checkbox',
//     selectableRows: 'none', // Disable selecting multiple rows
//     rowsPerPage: 10,
//     download: true,
//     print: true,
//     search: false,
//   };

//   return (
//     <Container maxWidth="xl">
//       <Grid container spacing={2} style={{ marginBottom: '20px', marginTop: '20px' }}>
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

//       {/* Conditionally render the data table */}
//       {!loading && data.length > 0 && (
//         <MUIDataTable
//           title={"Laptop Data"}
//           data={data}
//           columns={columns}
//           options={options}
//         />
//       )}

//       {!loading && data.length === 0 && (
//         <Typography variant="h6" style={{ marginTop: '20px' }}>
//           No data available. Please search for a laptop.
//         </Typography>
//       )}

//       {/* Hidden div for printing */}
//       <div ref={printRef} style={{ display: 'none' }}></div>
//     </Container>
//   );
// }

// export default MacSearch;
import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Container,
  CircularProgress,
  Typography,
  Grid,
  Checkbox,
  Card,
  CardContent,
} from '@mui/material';

function MacSearch() {
  const [data, setData] = useState([]);
  const [idQuery, setIdQuery] = useState('');
  const [macQuery, setMacQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [taggedLaptops, setTaggedLaptops] = useState({}); // Track tagged status

  useEffect(() => {
    const url = "https://script.google.com/macros/s/AKfycbyWQ1uHiZPwjRWaFU09r6OiDwdizokTqF3v2ZoNttQp7T9EO6GVtUKtIO17qpbRC29T/exec";
    setLoading(true);
    const fetchData = async () => {
      try {
        const queryParam = idQuery ? `idQuery=${idQuery}` : macQuery ? `macQuery=${macQuery}` : '';
        const response = await fetch(queryParam ? `${url}?${queryParam}` : url);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [idQuery, macQuery]);

  const handleReset = () => {
    setIdQuery('');
    setMacQuery('');
    setTaggedLaptops({}); // Reset tagged status
  };

  const handleTagChange = async (event, rowIndex) => {
    const isChecked = event.target.checked;
    const laptopId = data[rowIndex].ID; // Assuming each row has an ID field
    setTaggedLaptops(prevState => ({
      ...prevState,
      [rowIndex]: isChecked
    }));

    // Make a request to the backend to update the status as "Tagged"
    const payload = {
      id: laptopId,
      macAddress: data[rowIndex]["Mac address"],
      status: isChecked ? "Tagged" : "Received", // Update status field
      
    };

    try {
      await fetch('https://script.google.com/macros/s/AKfycbxnmLLeaOu6vUtEYfnZjAVGkykBBZF8Ne30F0AJmK8UuKC9dWPo_ujlCOga3CbpY0w-/exec', {
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

  const handlePrint = (row,rowIndex) => {
    const printContent = document.getElementById(`card-${rowIndex}`);
    const win = window.open('', '', 'width=800,height=600');
    win.document.write(printContent.outerHTML);
    win.document.close();
    // win.focus();
    win.print();
    // win.close();
   
  };

  return (
    <Container maxWidth="lg">
      <Grid container spacing={2} style={{ marginBottom: '20px' }}>
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
      <Grid container spacing={2}>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIdQuery(idQuery) || setMacQuery(macQuery)}
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

      {!loading && data.length > 0 ? (
        data.map((row, rowIndex) => (
          <Card id={`card-${rowIndex}`} key={rowIndex} style={{ marginTop: '20px' }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body1"><strong>Date:</strong></Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">{row.Date}</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body1"><strong>Donor Company Name:</strong></Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">{row["Donor Company Name"]}</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body1"><strong>RAM:</strong></Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">{row.RAM}</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body1"><strong>ROM:</strong></Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">{row.ROM}</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body1"><strong>Manufacturer Model:</strong></Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">{row["Manufacturer Model"]}</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body1"><strong>Minor Issues:</strong></Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">{row["Minor Issues"]}</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body1"><strong>Major Issues:</strong></Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">{row["Major Issues"]}</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body1"><strong>Inventory Location:</strong></Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">{row["Inventory Location"]}</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body1"><strong>Mac Address:</strong></Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">{row["Mac address"]}</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body1"><strong>Status:</strong></Typography>
                </Grid>
                <Grid item xs={6}>
                  <Checkbox
                    checked={row.Status === "Tagged" || taggedLaptops[rowIndex]}
                    onChange={(event) => handleTagChange(event, rowIndex)}
                    color="primary"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button variant="contained" color="primary" onClick={() => handlePrint(row,rowIndex)}>
                    Print
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))
      ) : (
        !loading && (
          <Typography variant="h6" style={{ marginTop: '20px' }}>
            No data found. Please search to see results.
          </Typography>
        )
      )}
    </Container>
  );
}
export default MacSearch;

