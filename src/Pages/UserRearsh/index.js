// import React, { useState, useEffect } from 'react';
// import {
//   TextField,
//   Button,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Container,
//   CircularProgress,
//   Typography
// } from '@mui/material';

// function UserRearsh() {
//   const [data, setData] = useState([]);
//   const [idQuery, setIdQuery] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [action, setAction] = useState('getLaptopData');
  
//   useEffect(() => {
//     const url = "https://script.google.com/macros/s/AKfycbzoDFfHvdHiX4P6UqzTr_ZZZ7ouaSRHIjmfT5cNEgZLHruYDTUP2QlfqqimeokdLEhP/exec";
//     setLoading(true);
//     const fetchData = async () => {
//       try {
//         const response = await fetch(idQuery ? `${url}?idQuery=${idQuery}&type=${action}` : `${url}?assignQuery=yes&type=getLaptopData`, {
//             method: 'GET',
//           });
//           const result = await response.json();
//           setData(result);
        
//       } catch (error) {
//         console.error('Error:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [idQuery,action]);

//   const renderTableHeader = () => {
//     if (data.length === 0) return null;
//     return Object.keys(data[0]).map((key, index) => (
//       <TableCell key={index}>{key.toUpperCase()}</TableCell>
//     ));
//   };

//   const renderTableBody = () => {
//     return data.map((item, index) => (
//       <TableRow key={index}>
//         {Object.values(item).map((value, idx) => (
//           <TableCell key={idx}>{value}</TableCell>
//         ))}
//       </TableRow>
//     ));
//   };

//   return (
//     <Container>
//       <TextField
//         label="Search by ID"
//         variant="outlined"
//         fullWidth
//         value={idQuery}
//         onChange={(e) => setIdQuery(e.target.value)}
//         margin="normal"
//       />
//       <Button
//         variant="contained"
//         color="primary"
//         onClick={() => setIdQuery(idQuery)}
//         disabled={loading}
//         style={{ marginTop: '10px' }}
//       >
//         {loading ? <CircularProgress size={24} /> : 'Search'}
//       </Button>

//       {loading ? (
//         <Typography variant="h6" style={{ marginTop: '20px' }}>Loading...</Typography>
//       ) : (
//         <TableContainer component={Paper} style={{ marginTop: '20px' }}>
//           <Table>
//             <TableHead>
//               <TableRow>
//                 {renderTableHeader()}
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {renderTableBody()}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       )}
//     </Container>
//   );
// }

// export default UserRearsh;
import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Grid,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Checkbox,
  ListItemText,
} from '@mui/material';

const minorIssuesOptions = [
  'Screen Issue',
  'Battery Problem',
  'Keyboard Malfunction',
  'Audio Issue',
  'Touchpad Problem',
];

const majorIssuesOptions = [
  'Motherboard Failure',
  'Hard Drive Failure',
  'Power Supply Issue',
  'Overheating',
  'Graphics Card Failure',
];

function LaptopForm() {
  const [formData, setFormData] = useState({
    type:"laptopLabeling",
    donorCompanyName: '',
    ram: '',
    rom: '',
    manufacturerModel: '',
    processor: '',
    manufacturingDate: '',
    conditionStatus: '',
    minorIssues: [],
    majorIssues: [],
    otherIssues: '',
    inventoryLocation: '',
    laptopWeight: '',
    macAddress: '',
  
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    try{
    await fetch('https://script.google.com/macros/s/AKfycbzOnMNkCIFCaPwPcXGXpW-ROdo3j1YdYzlFvpthEn7n_8oKWHBzn7e8HluT0L8w0tYU/exec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
      mode: 'no-cors'
    });
  } catch (error) {
    console.error('Error tagging the laptop:', error);
  }
  };

  return (
    <Container maxWidth="md">
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>

          <Grid item xs={12}>
            <TextField
              label="Donor Company Name"
              name="donorCompanyName"
              variant="outlined"
              fullWidth
              value={formData.donorCompanyName}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="RAM"
              name="ram"
              variant="outlined"
              fullWidth
              value={formData.ram}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="ROM"
              name="rom"
              variant="outlined"
              fullWidth
              value={formData.rom}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Manufacturer Model"
              name="manufacturerModel"
              variant="outlined"
              fullWidth
              value={formData.manufacturerModel}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Processor"
              name="processor"
              variant="outlined"
              fullWidth
              value={formData.processor}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Manufacturing Date"
              name="manufacturingDate"
              variant="outlined"
              fullWidth
              type="date"
              InputLabelProps={{
                shrink: true,
              }}
              value={formData.manufacturingDate}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Condition Status"
              name="conditionStatus"
              variant="outlined"
              fullWidth
              value={formData.conditionStatus}
              onChange={handleChange}
            />
          </Grid>

          {/* Minor Issues Multi-select */}
          <Grid item xs={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Minor Issues</InputLabel>
              <Select
                name="minorIssues"
                multiple
                value={formData.minorIssues}
                onChange={handleSelectChange}
                renderValue={(selected) => selected.join(', ')}
              >
                {minorIssuesOptions.map((issue) => (
                  <MenuItem key={issue} value={issue}>
                    <Checkbox checked={formData.minorIssues.indexOf(issue) > -1} />
                    <ListItemText primary={issue} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Major Issues Multi-select */}
          <Grid item xs={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Major Issues</InputLabel>
              <Select
                name="majorIssues"
                multiple
                value={formData.majorIssues}
                onChange={handleSelectChange}
                renderValue={(selected) => selected.join(', ')}
              >
                {majorIssuesOptions.map((issue) => (
                  <MenuItem key={issue} value={issue}>
                    <Checkbox checked={formData.majorIssues.indexOf(issue) > -1} />
                    <ListItemText primary={issue} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Other Issues"
              name="otherIssues"
              variant="outlined"
              fullWidth
              value={formData.otherIssues}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Inventory Location"
              name="inventoryLocation"
              variant="outlined"
              fullWidth
              value={formData.inventoryLocation}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Laptop Weight"
              name="laptopWeight"
              variant="outlined"
              fullWidth
              value={formData.laptopWeight}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Mac Address"
              name="macAddress"
              variant="outlined"
              fullWidth
              value={formData.macAddress}
              onChange={handleChange}
            />
          </Grid>

     

          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Submit
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
}

export default LaptopForm;
