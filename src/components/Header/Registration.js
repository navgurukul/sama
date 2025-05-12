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
    TextField,
} from '@mui/material';
import React, { useState, useEffect } from 'react';

const Registration = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentRow, setCurrentRow] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [openRoleDialog, setOpenRoleDialog] = useState(false);
    const [openFinalConfirmDialog, setOpenFinalConfirmDialog] = useState(false);
    const [selectedRole, setSelectedRole] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_UserDetailsApis}?type=getRegistration`
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
        if (selectedStatus === 'Reject') {
            setOpenDialog(true); // Show rejection reason dialog
        } else {
            setOpenDialog(true); // Open normal status change dialog
        }
    };

    const handleDialogClose = (confirm) => {
        if (confirm) {
            if (newStatus === 'Reject') {
                setOpenFinalConfirmDialog(true);
            } else {
                setOpenRoleDialog(true); // Only open dialog if not rejected
            }
        } else {
            setNewStatus(currentRow.Status);
        }
        setOpenDialog(false);
    };

    const handleRoleDialogClose = (confirm) => {
        if (confirm) {
            setOpenFinalConfirmDialog(true);
        } else {
            setSelectedRole('');
        }
        setOpenRoleDialog(false);
    };

    const handleFinalConfirmClose = async (confirm) => {
        if (confirm) {
            await updateStatusAndRole(); // Final update
        } else {
            setSelectedRole('');
            setNewStatus(currentRow.Status);
        }
        setOpenFinalConfirmDialog(false);
    };

    const updateStatusAndRole = async (statusParam = newStatus, roleParam = selectedRole, comment = '') => {
        const email = currentRow.Email;
        const updatedData = [...data];
        const index = data.indexOf(currentRow);
        updatedData[index].Status = statusParam;
        updatedData[index].Role = roleParam;
        updatedData[index].Comment = comment; // Store comment in the data
        setData(updatedData);

        try {
            const response = await fetch(process.env.REACT_APP_UserDetailsApis, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'no-cors',
                body: JSON.stringify({
                    type: 'updateRegistration',
                    email,
                    status: statusParam,
                    role: roleParam,
                    comment: comment, // Include the comment in the request
                }),
            });
            const text = await response.text();
            console.log('Response from server:', text);
        } catch (error) {
            console.error('Error updating:', error);
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
                                        <MenuItem value="Approved">Approved</MenuItem>
                                        <MenuItem value="Reject">Reject</MenuItem>
                                    </Select>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Confirm Status Change</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        Are you sure you want to change the status of '{currentRow?.Name}' to '{newStatus}'?
                    </Typography>
                    {newStatus === 'Reject' && (
                        <TextField
                            fullWidth
                            label="Reason for Rejection"
                            multiline
                            rows={4}
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            sx={{ mt: 2 }}
                        />
                    )}
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

            <Dialog open={openRoleDialog} onClose={() => setOpenRoleDialog(false)}>
                <DialogTitle>Select Role</DialogTitle>
                <DialogContent>
                    <Typography>Select a role to assign:</Typography>
                    <Select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        fullWidth
                        displayEmpty
                        sx={{ mt: 2 }}
                    >
                        <MenuItem value=""><em>None</em></MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="ops">Ops</MenuItem>
                        <MenuItem value="customer">Customer</MenuItem>
                    </Select>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleRoleDialogClose(false)}>Cancel</Button>
                    <Button onClick={() => handleRoleDialogClose(true)} disabled={!selectedRole}>
                        Next
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openFinalConfirmDialog} onClose={() => setOpenFinalConfirmDialog(false)}>
                <DialogTitle>Confirm {newStatus === "Reject" ? "Rejection" : "Role & Status"}</DialogTitle>
                <DialogContent>
                    <Typography>
                        {newStatus === "Reject"
                            ? `Are you sure you want to reject ${currentRow?.Name}?`
                            : `Are you sure you want to set status to ${newStatus} and role to ${selectedRole} for ${currentRow?.Name}?`}                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleFinalConfirmClose(false)}>Cancel</Button>
                    <Button onClick={() => handleFinalConfirmClose(true)}>Yes</Button>
                </DialogActions>
            </Dialog>

        </Container>
    );
};

export default Registration;
