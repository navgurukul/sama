import React, { useState } from "react";
import {
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Box,
} from "@mui/material";

import FormComponent from "./Userdetails";
import Userdatabulkupload from "./Userdatabulkupload";
import { Container } from "@mui/system";
function Userdata() {
  const [selectedName, setSelectedName] = useState("bulk");

  const handleChange = (event) => {
    setSelectedName(event.target.value);
  };

  return (
    <div>
      <Container maxWidth="sm"  sx={{ my: 5 }}>
        <Typography variant="h6" gutterBottom>
         Add Beneficiaries
        </Typography>

        <RadioGroup
          row
          value={selectedName}
          onChange={handleChange}
          
        >
          <FormControlLabel
            value="bulk"
            control={<Radio />}
            label="Bulk Upload"
          />
          <FormControlLabel
            value="Single"
            control={<Radio />}
            label="One at a time"
          />
          
        </RadioGroup>

        <Box mt={3}>
        {selectedName === "bulk" && <Userdatabulkupload />}
        {selectedName === "Single" && <FormComponent />}
          
        </Box>
      </Container>
    </div>
  );
}

export default Userdata;
