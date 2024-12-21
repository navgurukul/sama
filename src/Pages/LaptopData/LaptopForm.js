import React, { useState } from "react"; // Import React and the useState hook from React
import {
  TextField,
  Button,
  Container,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
} from "@mui/material";
import "./common.css";

function LaptopForm() {
  // State to store form data
  const [formData, setFormData] = useState({
    type: "laptopLabeling",
    donorCompanyName: "",
    ram: "",
    rom: "",
    manufacturerModel: "",
    processor: "",
    manufacturingDate: "",
    conditionStatus: "",
    minorIssues: [],
    majorIssues: [],
    inventoryLocation: "",
    laptopWeight: "",
    others: "",
    macAddress: "",
    batteryCapacity: "",
  });

  // State to manage loading state for the loader
  const [loading, setLoading] = useState(false);

  // Function to handle changes in text fields
  const handleChange = (e) => {
    const { name, value } = e.target; // Get the name and value from the event target
    setFormData({
      ...formData, // Spread existing form data
      [name]: value, // Update the changed field
    });
  };

  // Function to handle changes in select fields
  const handleSelectChange = (e) => {
    const { name, value } = e.target; // Get the name and value from the event target
    setFormData({
      ...formData, // Spread existing form data
      [name]: typeof value === "string" ? value.split(",") : value, // Update select field values
    });
  };

  const validateForm = () => {
    const requiredFields = [
      "donorCompanyName",
      "conditionStatus",
    ];
    for (let field of requiredFields) {
      if (!formData[field].trim()) {
        alert(`${field} is required.`);
        return false;
      }
    }
    return true;
  };
  

  // Function to handle form submission
  const handleSubmit = async (e) => {

    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      await fetch(
        "https://script.google.com/macros/s/AKfycbxDcI2092h6NLFcV2yvJN-2NaHVp1jc9_T5qs0ntLDcltIdRRZw5nfHiZTT9prPLQsf2g/exec",
        {
          method: "POST",
          body: JSON.stringify(formData), // Convert form data to JSON
          mode: "no-cors", // Use no-cors mode since it's a cross-origin request
          headers: {
            "Content-Type": "application/json", // Specify content type as JSON
          },
        }
      );

      alert("Data uploaded successfully!"); // Show success message after data upload
      setLoading(false); // Hide the loader

      // Reset the form data to its initial state
      setFormData({
        type: "laptopLabeling",
        id:"",
        donorCompanyName: "",
        ram: "",
        rom: "",
        manufacturerModel: "",
        processor: "",
        manufacturingDate: "",
        conditionStatus: "",
        minorIssues: [],
        majorIssues: [],
        inventoryLocation: "",
        laptopWeight: "",
        others: "",
        macAddress: "",
        batteryCapacity:"",
      });
    } catch (error) {
      console.error("Error:", error); // Log error to the console
      alert("An error occurred. Please try again."); // Show error message
      setLoading(false); // Hide the loader on error
    }
  };

  // Options for major issues in the select field
  const majorIssueOptions = [
    "Fan",
    "Speaker",
    "Microphone",
    "Damaged Screen",
    "Faulty Battery",
    "Overheating",
    "Malfunctioning Keyboard",
    "Broken Ports",
    "Hard Drive Issues",
    "Defective Motherboard",
    "Audio Problems",
    "Graphics Card Issues",
    "Water Damage",
    "USB Ports",
  ];

  // Options for minor issues in the select field
  const minorIssuesOptions = [
    "Cosmetic Wear",
    "Loose Hinges",
    "Dead Pixels",
    "Fading Keyboard",
    "Small Battery Capacity Loss",
    "Minor Software Issues",
    "Port Wear",
    "Touchpad Sensitivity",
  ];

  return (
    <>
      <Container sx={{ mt: 5, }} maxWidth="sm">
        {/* Display the loader and overlay if loading is true */}
        {loading && (
          <div className="overlay">
            <div className="loader">Loading...</div>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Form Fields */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Serial Number"
                name="id"
                value={formData.id}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Donor Company Name"
                name="donorCompanyName"
                value={formData.donorCompanyName}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="RAM"
                name="ram"
                value={formData.ram}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ROM"
                name="rom"
                value={formData.rom}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Manufacturer Model"
                name="manufacturerModel"
                value={formData.manufacturerModel}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Processor"
                name="processor"
                value={formData.processor}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Manufacturing Date"
                name="manufacturingDate"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.manufacturingDate}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Condition Status"
                name="conditionStatus"
                value={formData.conditionStatus}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Minor Issues</InputLabel>
                <Select
                  multiple
                  value={formData.minorIssues}
                  onChange={handleSelectChange}
                  name="minorIssues"
                  renderValue={(selected) => selected.join(", ")}
                >
                  {minorIssuesOptions.map((issue) => (
                    <MenuItem key={issue} value={issue}>
                      <Checkbox
                        checked={formData.minorIssues.indexOf(issue) > -1}
                      />
                      <ListItemText primary={issue} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Major Issues</InputLabel>
                <Select
                  multiple
                  value={formData.majorIssues}
                  onChange={handleSelectChange}
                  name="majorIssues"
                  renderValue={(selected) => selected.join(", ")}
                >
                  {majorIssueOptions.map((issue) => (
                    <MenuItem key={issue} value={issue}>
                      <Checkbox
                        checked={formData.majorIssues.indexOf(issue) > -1}
                      />
                      <ListItemText primary={issue} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Other Laptop Issues optional"
                name="others"
                value={formData.others}
                onChange={handleChange}
                variant="outlined"
                sx={{ mt: 2 }}
              />
              <TextField
                fullWidth
                label="Battery Capacity"
                name="batteryCapacity"
                value={formData.batteryCapacity}
                onChange={handleChange}
                variant="outlined"
                sx={{ mt: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Inventory Location"
                name="inventoryLocation"
                value={formData.inventoryLocation}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Laptop Weight"
                name="laptopWeight"
                value={formData.laptopWeight}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mac address"
                name="macAddress"
                value={formData.macAddress}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} style={{marginBottom:"10%"}}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading} // Disable button while loading
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
      </Container>
    </>
  );
}

export default LaptopForm; 
