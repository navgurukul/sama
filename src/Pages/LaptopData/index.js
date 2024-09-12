import React, { useState } from "react";
import { Typography, Container, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Box } from "@mui/material";
import Upload from "./UploadExcel";
import LaptopForm from "./LaptopForm";

const LaptopInventory = () => {
  const [uploadType, setUploadType] = useState('manual');

  const handleUploadTypeChange = (event) => {
    setUploadType(event.target.value);
  };

  return (
    <Container maxWidth="md" style={{ marginTop: "30px" }}>
      <Typography align="center" variant="h6" gutterBottom>
        Laptop Donation Form
      </Typography>

      <Box display="flex" justifyContent="center" alignItems="center" mb={3}>
     
        <FormControl component="fieldset">
          <Box display="flex" alignItems="center">
            <Typography variant="body1" style={{ marginRight: "20px" }}>
              Choose Upload Type
            </Typography>
            <RadioGroup
              row
              aria-label="uploadType"
              name="uploadType"
              value={uploadType}
              onChange={handleUploadTypeChange}
            >
              <FormControlLabel
                value="manual"
                control={<Radio />}
                label="Single Entry"
              />
              <FormControlLabel
                value="bulk"
                control={<Radio />}
                label="Bulk Data Upload"
              />
            </RadioGroup>
          </Box>
        </FormControl>
      </Box>
      <Box>
        {uploadType === 'manual' && <LaptopForm />}
        {uploadType === 'bulk' && <Upload />}
      </Box>
    </Container>
  );
};

export default LaptopInventory;
