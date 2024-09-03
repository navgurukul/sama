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
  const [selectedName, setSelectedName] = useState("");

  const handleChange = (event) => {
    setSelectedName(event.target.value);
  };

  return (
    <div>
      <Container maxWidth="sm" align="center" sx={{ my: 5 }}>
        <Typography variant="h2" gutterBottom>
          User Details Form
        </Typography>

        <RadioGroup
          row
          value={selectedName}
          onChange={handleChange}
          sx={{ justifyContent: "center" }}
        >
          <FormControlLabel
            value="Single"
            control={<Radio />}
            label="Single Data Upload"
          />
          <FormControlLabel
            value="bulk"
            control={<Radio />}
            label="Bulk Upload"
          />
        </RadioGroup>

        <Box mt={3}>
          {selectedName === "Single" && <FormComponent />}
          {selectedName === "bulk" && <Userdatabulkupload />}
        </Box>
      </Container>
    </div>
  );
}

export default Userdata;
