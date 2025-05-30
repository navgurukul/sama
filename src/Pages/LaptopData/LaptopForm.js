import React, { useState } from "react";
import {
  TextField,
  Button,
  Container,
  Grid,
  MenuItem,
  Checkbox,
  ListItemText,
  Snackbar,
  Alert,
  FormHelperText,
  InputAdornment,
  Typography,
  Select,
} from "@mui/material";
import "./common.css";

function LaptopForm() {
  const [formData, setFormData] = useState({
    type: "laptopLabeling",
    id: "",
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

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const requiredFields = [
    "id",
    "donorCompanyName",
    // "ram",
    // "rom",
    // "conditionStatus",
    // "manufacturerModel",
    // "processor",
    // "manufacturingDate",
    // "minorIssues",
    // "majorIssues",
    "inventoryLocation",
    // "laptopWeight",
    // "macAddress",
    // "batteryCapacity",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: typeof value === "string" ? value.split(",") : value,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    requiredFields.forEach(field => {
      if (!formData[field] || (Array.isArray(formData[field]) && formData[field].length === 0)) {
        newErrors[field] = "This field is required";
        isValid = false;
      }
    });

    setErrors(newErrors);

    if (!isValid) {
      setSnackbarMessage("Please fill all required fields");
      setSnackbarOpen(true);
    }

    return isValid;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await fetch(
        `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}`,
        {
          method: "POST",
          body: JSON.stringify(formData),
          mode: "no-cors",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      alert("Data uploaded successfully!");
      setLoading(false);

      // Reset form
      setFormData({
        type: "laptopLabeling",
        id: "",
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
    } catch (error) {
      console.error("Error:", error);
      setSnackbarMessage("An error occurred. Please try again.");
      setSnackbarOpen(true);
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
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
    "Camera issue",
    "Charging point issue",
    "Fan Error",
    "Wifi issue"
  ];

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

  // Helper function to add required star to label
  const getLabel = (fieldName) => (
    <>
      {fieldName}
      {requiredFields.includes(fieldName) && (
        <span style={{ color: "red" }}> *</span>
      )}
    </>
  );

  return (
    <>
      <Container sx={{ mt: 5 }} maxWidth="sm">
        {loading && (
          <div className="overlay">
            <div className="loader">Loading...</div>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1">Serial Number <span style={{ color: "red" }}>*</span></Typography>
              <TextField
                fullWidth
                name="id"
                value={formData.id}
                onChange={handleChange}
                variant="outlined"
                error={!!errors.id}
                helperText={errors.id}
              />

            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">Donor Company Name <span style={{ color: "red" }}>*</span></Typography>

              <TextField
                fullWidth
                name="donorCompanyName"
                value={formData.donorCompanyName}
                onChange={handleChange}
                variant="outlined"
                error={!!errors.donorCompanyName}
                helperText={errors.donorCompanyName}
              // required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">RAM
                {/* <span style={{ color: "red" }}>*</span> */}
              </Typography>
              <Select
                fullWidth
                name="ram"
                value={formData.ram}
                onChange={handleChange}
                variant="outlined"
                error={!!errors.ram}
                helperText={errors.ram}
              >
                {["8GB", "12GB", "16GB", "24GB", "32GB"].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">ROM
                {/* <span style={{ color: "red" }}>*</span> */}
              </Typography>
              <Select
                fullWidth
                name="rom"
                value={formData.rom}
                onChange={handleChange}
                variant="outlined"
                error={!!errors.rom}
                helperText={errors.rom}
              >
                {["256GB", "512GB", "1TB"].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">Manufacturer Model
                {/* <span style={{ color: "red" }}>*</span> */}
              </Typography>
              <TextField
                fullWidth
                name="manufacturerModel"
                value={formData.manufacturerModel}
                onChange={handleChange}
                variant="outlined"
                error={!!errors.manufacturerModel}
                helperText={errors.manufacturerModel}
              // required
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">Processor
                {/* <span style={{ color: "red" }}>*</span> */}
              </Typography>
              <Select
                fullWidth
                name="processor"
                value={formData.processor}
                onChange={handleChange}
                variant="outlined"
                error={!!errors.processor}
                helperText={errors.processor}
              >
                {["i3", "i5", "i7", "Ryzen 3", "Ryzen 5", "Ryzen 7"].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">Manufacturing Date
                {/* <span style={{ color: "red" }}>*</span> */}
              </Typography>
              <TextField
                fullWidth
                name="manufacturingDate"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.manufacturingDate}
                onChange={handleChange}
                variant="outlined"
                error={!!errors.manufacturingDate}
                helperText={errors.manufacturingDate}
              // required
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">Condition Status
                {/* <span style={{ color: "red" }}>*</span> */}
              </Typography>
              <TextField
                fullWidth
                name="conditionStatus"
                value={formData.conditionStatus}
                onChange={handleChange}
                variant="outlined"
                error={!!errors.conditionStatus}
                helperText={errors.conditionStatus}
              // required
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">Minor Issues
                {/* <span style={{ color: "red" }}>*</span> */}
              </Typography>
              <TextField
                fullWidth
                select
                name="minorIssues"
                variant="outlined"
                SelectProps={{
                  multiple: true,
                  value: formData.minorIssues,
                  onChange: handleSelectChange,
                  renderValue: (selected) => selected.join(", "),
                }}
                error={!!errors.minorIssues}
                helperText={errors.minorIssues}
              // required
              >
                {minorIssuesOptions.map((issue) => (
                  <MenuItem key={issue} value={issue}>
                    <Checkbox checked={formData.minorIssues.indexOf(issue) > -1} />
                    <ListItemText primary={issue} />
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1">Major Issues
                {/* <span style={{ color: "red" }}>*</span> */}
              </Typography>
              <TextField
                fullWidth
                select
                name="majorIssues"
                variant="outlined"
                SelectProps={{
                  multiple: true,
                  value: formData.majorIssues,
                  onChange: handleSelectChange,
                  renderValue: (selected) => selected.join(", "),
                }}
                error={!!errors.majorIssues}
                helperText={errors.majorIssues}
              // required
              >
                {majorIssueOptions.map((issue) => (
                  <MenuItem key={issue} value={issue}>
                    <Checkbox
                      checked={formData.majorIssues.indexOf(issue) > -1}
                    />
                    <ListItemText primary={issue} />
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">Other Laptop Issues optional
                {/* <span style={{ color: "red" }}>*</span> */}
              </Typography>

              <TextField
                fullWidth
                name="others"
                value={formData.others}
                onChange={handleChange}
                variant="outlined"
                sx={{ mt: 2 }}
                error={!!errors.others}
                helperText={errors.others}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">Battery Capacity
                {/* <span style={{ color: "red" }}>*</span> */}
              </Typography>
              <TextField
                fullWidth
                name="batteryCapacity"
                value={formData.batteryCapacity}
                onChange={handleChange}
                variant="outlined"
                sx={{ mt: 2 }}
                error={!!errors.batteryCapacity}
                helperText={errors.batteryCapacity}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">
                Inventory Location <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                select
                name="inventoryLocation"
                value={formData.inventoryLocation}
                onChange={handleChange}
                variant="outlined"
                error={!!errors.inventoryLocation}
                helperText={errors.inventoryLocation}
              >
                {["Sarjapur Campus Bangalore", "Anish Jadhav Memorial Foundation Navgurukul Campus Pune"].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">Laptop Weight
                {/* <span style={{ color: "red" }}>*</span> */}
              </Typography>
              <TextField
                fullWidth
                name="laptopWeight"
                value={formData.laptopWeight}
                onChange={handleChange}
                variant="outlined"
                error={!!errors.laptopWeight}
                helperText={errors.laptopWeight}
              // required
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1">Mac address
                {/* <span style={{ color: "red" }}>*</span> */}
              </Typography>
              <TextField
                fullWidth
                name="macAddress"
                value={formData.macAddress}
                onChange={handleChange}
                variant="outlined"
                error={!!errors.macAddress}
                helperText={errors.macAddress}
              // required
              />

            </Grid>
            <Grid item xs={12} style={{ marginBottom: "10%" }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
}

export default LaptopForm;