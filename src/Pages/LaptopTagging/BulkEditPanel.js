import React, { useState, useEffect } from 'react';
import {
    Button,
    Grid,
    Typography,
    Paper,
    FormControl,
    Select,
    MenuItem,
} from '@mui/material';

const BulkEditPanel = ({
    selectedRows,
    onBulkUpdate,
    workingFilter,
    statusFilter
}) => {
    const [approvedNgos, setApprovedNgos] = useState([]);
    const [bulkWorking, setBulkWorking] = useState(workingFilter);
    const [bulkStatus, setBulkStatus] = useState(statusFilter);
    const [bulkAssignedTo, setBulkAssignedTo] = useState('all');
    const [bulkAllocatedTo, setBulkAllocatedTo] = useState('all');
    const [bulkDistributed, setBulkDistributed] = useState('all');

    // const [confirmOpen, setConfirmOpen] = useState(false);
    // const [pendingUpdates, setPendingUpdates] = useState([]);

    useEffect(() => {
        const fetchApprovedNgos = async () => {
            try {
                const response = await fetch(
                    `${process.env.REACT_APP_NgoInformationApi}?type=registration`
                );
                const responseData = await response.json();
                const filteredNgos = responseData.data.filter(ngo => ngo.Status === "Approved");
                setApprovedNgos(filteredNgos.map(ngo => ngo.organizationName));
            } catch (error) {
                console.error("Error fetching NGO data:", error);
            }
        };

        fetchApprovedNgos();
    }, []);

    const handleBulkUpdate = () => {
        const updates = [];

        if (bulkWorking !== 'all' && bulkWorking !== workingFilter) {
            updates.push({ field: 'Working', value: bulkWorking });
        }

        if (bulkStatus !== 'all' && bulkStatus !== statusFilter) {
            updates.push({ field: 'Status', value: bulkStatus });
        }

        if (bulkAssignedTo !== 'all') {
            updates.push({ field: 'Assigned To', value: bulkAssignedTo });
        }

        if (bulkAllocatedTo !== 'all') {
            updates.push({ field: 'Allocated To', value: bulkAllocatedTo });
        }
        if (bulkDistributed !== 'all') {
            updates.push({ field: 'Distributed', value: bulkDistributed });
        }


        if (updates.length > 0) {
            onBulkUpdate(updates);
        }
    };

    return (
        <>
            <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Bulk Edit ({selectedRows.length} selected)
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <Typography variant="subtitle2" gutterBottom>
                                Working Status
                            </Typography>
                            <Select
                                value={bulkWorking}
                                onChange={(e) => setBulkWorking(e.target.value)}
                                variant="outlined"
                                size="small"
                            >
                                <MenuItem value="all">No Change</MenuItem>
                                <MenuItem value="Working">Working</MenuItem>
                                <MenuItem value="Not Working">Not Working</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <Typography variant="subtitle2" gutterBottom>
                                Status
                            </Typography>
                            <Select
                                value={bulkStatus}
                                onChange={(e) => setBulkStatus(e.target.value)}
                                variant="outlined"
                                size="small"
                            >
                                <MenuItem value="all">No Change</MenuItem>
                                <MenuItem value="Laptop Received">Laptop Received</MenuItem>
                                <MenuItem value="Laptop Refurbished">Laptop Refurbished</MenuItem>
                                <MenuItem value="Allocated">Allocated</MenuItem>
                                <MenuItem value="To be dispatch">To be dispatch</MenuItem>
                                <MenuItem value="Distributed" >Distributed</MenuItem>
                                <MenuItem value="Not Working">Not Working</MenuItem>

                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <Typography variant="subtitle2" gutterBottom>
                                Assigned To
                            </Typography>
                            <Select
                                value={bulkAssignedTo}
                                onChange={(e) => setBulkAssignedTo(e.target.value)}
                                variant="outlined"
                                size="small"
                            >
                                <MenuItem value="all">No Change</MenuItem>
                                <MenuItem value="Shweta Deshmukh">Shweta Deshmukh</MenuItem>
                                <MenuItem value="Rahul">Rahul</MenuItem>
                                <MenuItem value="Pradeep">Pradeep</MenuItem>
                                <MenuItem value="Nitesh">Nitesh</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <Typography variant="subtitle2" gutterBottom>
                                Allocated To
                            </Typography>
                            <Select
                                value={bulkAllocatedTo}
                                onChange={(e) => setBulkAllocatedTo(e.target.value)}
                                variant="outlined"
                                size="small"
                            >
                                <MenuItem value="all">No Change</MenuItem>
                                {approvedNgos.map(ngo => (
                                    <MenuItem key={ngo} value={ngo}>{ngo}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <Typography variant="subtitle2" gutterBottom>
                                Distributed
                            </Typography>
                            <Select
                                value={bulkDistributed}
                                onChange={(e) => setBulkDistributed(e.target.value)}
                                variant="outlined"
                                size="small"
                            >
                                <MenuItem value="all">No Change</MenuItem>
                                <MenuItem value="Yes">Yes</MenuItem>
                                <MenuItem value="No">No</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                        <Button
                            variant="contained"
                            sx={{ mt: 2 }}
                            onClick={handleBulkUpdate}
                            disabled={
                                (bulkWorking === 'all' || bulkWorking === workingFilter) &&
                                (bulkStatus === 'all' || bulkStatus === statusFilter) &&
                                bulkAssignedTo === 'all' &&
                                bulkAllocatedTo === 'all' &&
                                bulkDistributed === 'all'
                                
                            }
                        >
                            Apply All Changes
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </>
    );
};

export default BulkEditPanel;