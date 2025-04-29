import {
    Container,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Select,
    MenuItem,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
} from '@mui/material';
import React, { useState, useEffect } from 'react';

const Registration = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentRow, setCurrentRow] = useState(null);
    const [newStatus, setNewStatus] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_UserDetailApi}?type=getRegistration`
            );
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            if (Array.isArray(result)) {
                setData(result);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (e, index, row) => {
        const selectedStatus = e.target.value;
        setCurrentRow(row);
        setNewStatus(selectedStatus);
        setOpenDialog(true);
    };

    const handleDialogClose = (confirm) => {
        if (confirm) {
            // Update the status if the user clicks Yes
            updateStatus();
        } else {
            // Revert the status change if the user clicks Cancel
            setNewStatus(currentRow.Status);
        }
        setOpenDialog(false);
    };

    const updateStatus = async () => {
        const email = currentRow.Email;
        const updatedData = [...data];
        const index = data.indexOf(currentRow);
        updatedData[index].Status = newStatus;
        setData(updatedData);

        try {
            const response = await fetch(process.env.REACT_APP_UserDetailApi, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'no-cors',
                body: JSON.stringify({
                    type: 'updateRegistration',
                    email: email,       // use email instead of id
                    status: newStatus,  // lowercase to match backend
                }),
            });

            const text = await response.text();
            console.log('Response from server:', text);
        } catch (error) {
            console.error('Error updating status:', error);

            // Revert the update in case of error
            const revertedData = [...data];
            const index = data.indexOf(currentRow);
            revertedData[index].Status = currentRow.Status;
            setData(revertedData);
        }
    };

    if (loading) {
        return (
            <Container maxWidth="lg">
                <Typography>Loading...</Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg">
                <Typography color="error">Error: {error}</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ padding: '20px' }}>
            <TableContainer component={Paper}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Name</strong></TableCell>
                            <TableCell><strong>Email</strong></TableCell>
                            <TableCell><strong>Password</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell>{row.Name || 'N/A'}</TableCell>
                                <TableCell>{row.Email || 'N/A'}</TableCell>
                                <TableCell>{row.Password || 'N/A'}</TableCell>
                                <TableCell>
                                    <Select
                                        value={row.Status || ''}
                                        onChange={(e) => handleStatusChange(e, index, row)}
                                        displayEmpty
                                        fullWidth
                                    >
                                        <MenuItem value="ops">ops</MenuItem>
                                        <MenuItem value="admin">admin</MenuItem>
                                    </Select>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
            >
                <DialogTitle>Confirm Status Change</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        Are you sure you want to change the status of '{currentRow?.Name}' to '{newStatus}'?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleDialogClose(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={() => handleDialogClose(true)} color="primary">
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Registration;
