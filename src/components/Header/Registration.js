import {
    Container,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TextField,
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
    const [openRoleDialog, setOpenRoleDialog] = useState(false);
    const [openFinalConfirmDialog, setOpenFinalConfirmDialog] = useState(false);
    const [selectedRole, setSelectedRole] = useState('');
    const [openReasonDialog, setOpenReasonDialog] = useState(false);
    const [rejectReason, setRejectReason] = useState('');



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
            if (newStatus === "Reject") {
                // Open reason dialog first
                setOpenReasonDialog(true);
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
            await updateStatusAndRole(); // This works for both Approve and Reject
        } else {
            setSelectedRole('');
            setNewStatus(currentRow.Status);
        }
        setOpenFinalConfirmDialog(false);
        setRejectReason('');

    };


    const updateStatusAndRole = async (statusParam = newStatus, roleParam = selectedRole) => {
        const email = currentRow.Email;
        const updatedData = [...data];
        const index = data.indexOf(currentRow);
        updatedData[index].Status = statusParam;
        updatedData[index].Role = roleParam;

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
                    email,
                    status: statusParam,
                    role: roleParam,
                    reason: statusParam === "Reject" ? rejectReason : "", // <-- Add this line
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
            <Dialog open={openReasonDialog} onClose={() => setOpenReasonDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>
                    Enter Rejection Reason
                </DialogTitle>

                <DialogContent>
                    <Typography sx={{ mb: 2 }}>
                        Please provide a reason for rejecting <strong>{currentRow?.Name}</strong>:
                    </Typography>

                    <TextField
                        multiline
                        rows={4}
                        fullWidth
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Enter reason here..."
                        variant="outlined"
                        sx={{ mt: 1 }}
                    />
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        color="primary"
                        onClick={() => {
                            setRejectReason('');
                            setOpenReasonDialog(false);
                        }}                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            if (rejectReason.trim()) {
                                setOpenReasonDialog(false);
                                setOpenFinalConfirmDialog(true);
                            }
                        }}
                        disabled={!rejectReason.trim()}
                    >
                        Next
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openFinalConfirmDialog} onClose={() => setOpenFinalConfirmDialog(false)}>
                <DialogTitle>Confirm {newStatus === "Reject" ? "Rejection" : "Role & Status"}</DialogTitle>
                <DialogContent>
                    <Typography>
                        {newStatus === "Reject"
                            ? <>Are you sure you want to reject <strong>{currentRow?.Name}</strong>?</>
                            : <>
                                Are you sure you want to set status to <strong>{newStatus}</strong> and role to <strong>{selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}</strong> for <strong>{currentRow?.Name}</strong>?
                            </>
                        }
                    </Typography>

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

