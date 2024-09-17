import React, { useState } from "react";
import {
    Button,
    Typography,
    Box,
    Modal,
    TextField,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import { major } from "@mui/system";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    borderRadius: 4,
    boxShadow: 24,
    maxHeight: 500,
    overflowY: "scroll",
    p: 4,
};

const EditButton = ({
   
    data,
    setData,
    selectedRowIndex,
    laptopData,
    isChecked,
    majorIssuesOptions = [],
    minorIssuesOptions = [],
}) => {
    const [editData, setEditData] = useState({
        id: laptopData.ID|| "",
        working:  laptopData.Working || "",
        donorCompanyName: laptopData["Donor Company Name"]  || "",
        ram: laptopData.RAM || "",
        rom: laptopData.ROM || "",
        manufacturerModel: laptopData["Manufacturer Model"] || "",
        processor: laptopData.Processor || "",
        macAddress: laptopData["MAC Address"] || "",
        status: laptopData.Status || "",
        
    });
    const [open, setOpen] = useState(false);

    const handleEditClick = () => {
        setOpen(true);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSelectChange = (e) => {
        const { name, value } = e.target;
        setEditData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSaveEdit = async () => {
        const dataToSend ={
            ...editData,
            type:"laptopLabeling"
        }
        try {
            await fetch("https://script.google.com/macros/s/AKfycbxDcI2092h6NLFcV2yvJN-2NaHVp1jc9_T5qs0ntLDcltIdRRZw5nfHiZTT9prPLQsf2g/exec", {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(dataToSend),
              mode: 'no-cors'
            });
          } catch (error) {
            console.error('Error tagging the laptop:', error);
          }

    }

    const handleModalClose = () => {
        setOpen(false);
       
    };

    return (
        <>
            <Button
                variant="outlined"
                color="primary"
                onClick={handleEditClick}
            >
                Edit
            </Button>
            <Modal open={open} onClose={handleModalClose}>
                <Box sx={style}>
                    <Typography variant="h6">Edit Laptop</Typography>
                    <Grid container spacing={2}>
                        {Object.keys(editData).map((key) => {
                            if (key === 'minorIssues' || key === 'majorIssues') {
                                return (
                                    <Grid item xs={12} sm={6} key={key}>
                                        <FormControl fullWidth margin="normal">
                                            <InputLabel>{key.replace(/([A-Z])/g, ' $1').trim()}</InputLabel>
                                            <Select
                                                label={key.replace(/([A-Z])/g, ' $1').trim()}
                                                name={key}
                                                value={editData[key] || ""}
                                                onChange={handleSelectChange}
                                            >
                                                {(key === 'minorIssues' ? minorIssuesOptions : majorIssuesOptions).map((option, index) => (
                                                    <MenuItem key={index} value={option}>
                                                        {option}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                );
                            } else {
                                return (
                                    <Grid item xs={12} sm={6} key={key}>
                                        <TextField
                                            label={key.replace(/([A-Z])/g, ' $1').trim()}
                                            name={key}
                                            value={editData[key] || ""}
                                            onChange={handleEditChange}
                                            fullWidth
                                            margin="normal"
                                        />
                                    </Grid>
                                );
                            }
                        })}
                    </Grid>
                    <Box mt={2}>
                        <Button variant="contained" color="primary" onClick={handleSaveEdit}>
                            Save
                        </Button>
                        <Button variant="outlined" color="secondary" onClick={handleModalClose} sx={{ ml: 2 }}>
                            Cancel
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </>
    );
};

export default EditButton;
