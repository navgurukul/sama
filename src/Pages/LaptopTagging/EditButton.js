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
    Checkbox,
    ListItemText,
    IconButton,
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit'; // Import the Edit icon


const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: 'background.paper',
    borderRadius: 4,
    boxShadow: 24,
    maxHeight: 600,
    overflowY: "scroll",
    p: 4,
    
};

const EditButton = ({
    setRefresh,
    laptopData,
    refresh,
   
}) => {
    const [editData, setEditData] = useState();

    const [open, setOpen] = useState(false);

    const handleEditClick = () => {

    const currentDate = new Date().toISOString().split('T')[0];
    
    const SavedData = JSON.parse(localStorage.getItem('_AuthSama_')); 
    const userEmail = SavedData?.[0]?.email || "Email not found";

    const lastUpdatedBy = userEmail || 'Unknown';

        setEditData({
            id: laptopData.ID || "",
            donorCompanyName: laptopData["Donor Company Name"] || "",
            ram: laptopData.RAM || "",
            rom: laptopData.ROM || "",
            manufacturerModel: laptopData["Manufacturer Model"] || "",
            processor: laptopData.Processor || "",
            macAddress: laptopData["Mac address"] || "",
            status: laptopData.Status || "",
            working: laptopData.Working || "",
            batteryCapacity: laptopData["Battery Capacity"] || "",
            inventoryLocation: laptopData["Inventory Location"] || "",
            laptopWeight: laptopData["laptop weight"] || "",
            conditionStatus: laptopData["Condition Status"] || "",
            manufacturingDate: laptopData["Manufacturing Date"] || "",
            majorIssues: laptopData["Major Issues"] ? laptopData["Major Issues"].split(",") : [],
            minorIssues: laptopData["Minor Issues"] ? laptopData["Minor Issues"].split(",") : [],
            assignedTo: laptopData["Assigned To"] || "",
            donatedTo: laptopData["Donated To"] || "",
            lastUpdatedOn: currentDate,
            lastUpdatedBy: lastUpdatedBy,
        });
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
            [name]: typeof value === 'string' ? value.split(',') : value,
        }));
    };

    const handleSaveEdit = async () => {
        const dataToSend = {
            ...editData,
            type: "laptopLabeling",
        };

        try {
            
            await fetch(
                `${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        
                    },
                    body: JSON.stringify(dataToSend),
                    mode: "no-cors",
                }
            );
            handleModalClose();

            // Close the modal and reset the data after successfully saving
            if (setRefresh) {
                setRefresh(!refresh);
              }
            // setRefresh(!refresh);
            setEditData(
                {
                    id: "",
                    donorCompanyName: "",
                    ram: "",
                    rom: "",
                    manufacturerModel: "",
                    processor: "",
                    macAddress: "",
                    status: "",
                    working: "",
                    batteryCapacity:"",
                    inventoryLocation: "",
                    laptopWeight: "",
                    conditionStatus: "",
                    manufacturingDate: "",
                    majorIssues: [],
                    minorIssues: [],
                    assignedTo: "",
                    donatedTo: "",
                    lastUpdatedOn: "",
                    lastUpdatedBy: "",
                }
            );
            
        } catch (error) {
            console.error("Error tagging the laptop:", error);
        }
    };

    const handleModalClose = () => {
        setOpen(false);
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
        "Touchpad Sensitivity",
    ];

    return (
        <>
             <IconButton
                color="primary"
                onClick={handleEditClick}
                aria-label="edit"
            >
                <EditIcon />
            </IconButton>
            <Modal open={open} onClose={handleModalClose}>
                <Box sx={style}>
                    <Typography variant="h6">Edit Laptop</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label="Donor Company Name"
                                name="donorCompanyName"
                                value={editData?.donorCompanyName || ""}
                                onChange={handleEditChange}
                                fullWidth
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="RAM"
                                name="ram"
                                value={editData?.ram || ""}
                                onChange={handleEditChange}
                                fullWidth
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="ROM"
                                name="rom"
                                value={editData?.rom || ""}
                                onChange={handleEditChange}
                                fullWidth
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Manufacturer Model"
                                name="manufacturerModel"
                                value={editData?.manufacturerModel || ""}
                                onChange={handleEditChange}
                                fullWidth
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Processor"
                                name="processor"
                                value={editData?.processor || ""}
                                onChange={handleEditChange}
                                fullWidth
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="MAC Address"
                                name="macAddress"
                                value={editData?.macAddress || ""}
                                onChange={handleEditChange}
                                fullWidth
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Laptop Weight"
                                name="laptopWeight"
                                value={editData?.laptopWeight || ""}
                                onChange={handleEditChange}
                                fullWidth
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Condition Status"
                                name="conditionStatus"
                                value={editData?.conditionStatus || ""}
                                onChange={handleEditChange}
                                fullWidth
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Manufacturing Date"
                                name="manufacturingDate"
                                InputLabelProps={{ shrink: true }}
                                value={editData?.manufacturingDate || ""}
                                onChange={handleEditChange}
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                type="date"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Major Issues</InputLabel>
                                <Select
                                    label="Major Issues"
                                    name="majorIssues"
                                    value={editData?.majorIssues || []}
                                    multiple
                                    onChange={handleSelectChange}
                                    renderValue={(selected) => selected.join(', ')}
                                >
                                    {majorIssueOptions.map((option, index) => (
                                        <MenuItem key={index} value={option}>
                                            <Checkbox checked={editData?.majorIssues?.indexOf(option) > -1} />
                                            <ListItemText primary={option} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Minor Issues</InputLabel>
                                <Select
                                    label="Minor Issues"
                                    name="minorIssues"
                                    value={editData?.minorIssues || []}
                                    multiple
                                    onChange={handleSelectChange}
                                    renderValue={(selected) => selected.join(', ')}
                                >
                                    {minorIssuesOptions.map((option, index) => (
                                        <MenuItem key={index} value={option}>
                                            <Checkbox checked={editData?.minorIssues?.indexOf(option) > -1} />
                                            <ListItemText primary={option} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Battery Capacity"
                                name="batteryCapacity"
                                value={editData?.batteryCapacity || ""}
                                onChange={handleEditChange}
                                fullWidth
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Inventory Location"
                                name="inventoryLocation"
                                value={editData?.inventoryLocation || ""}
                                onChange={handleEditChange}
                                fullWidth
                                margin="normal"
                            />
                        </Grid>
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