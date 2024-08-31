import React, { useState } from "react";
import {
  TextField,
  Button,
  Container,
  Grid,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  ListItemText,
} from "@mui/material";

function LaptopForm() {
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
  });
  console.log(formData);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: typeof value === "string" ? value.split(",") : value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbxamFLfoY7ME3D6xCQ9f9z5UrhG2Nui5gq06bR1g4aiidMj3djQ082dM56oYnuPFb2PuA/exec",
        {
          method: "POST",
          body: JSON.stringify(formData),
          mode: "no-cors",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      // In no-cors mode, you can't read the response body, so you can't use response.json()
      setFormData({
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
      });
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  };
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
  const minorIssuesOptions = [
    "Cosmetic Wear",
    "Loose Hinges",
    "Dead Pixels",
    "Fading Keyboard",
    "Small Battery Capacity Loss",
    "Minor Software Issues",
    "Port Wear",
    "Trackpad Sensitivity",
  ];
  return (
    <>
      <Container sx={{ mt: 5 }} maxWidth="sm">
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
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
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
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
