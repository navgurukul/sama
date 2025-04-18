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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Snackbar,
    Alert,
    ButtonGroup
} from '@mui/material';
import React, { useState, useEffect } from 'react';

const OpsWelcome = () => {
    const [laptops, setLaptops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedLaptop, setSelectedLaptop] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [filterStatus, setFilterStatus] = useState('Unresolved'); // Unresolved | Resolved

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const result = await response.json();

            if (result && Array.isArray(result)) {
                setLaptops(result);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRowClick = (laptop) => {
        setSelectedLaptop(laptop);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => setOpenDialog(false);

    const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

    const handleIssueResponse = async (isFixed) => {
        if (isFixed && selectedLaptop) {
            const SavedData = JSON.parse(localStorage.getItem('_AuthSama_'));
            const userEmail = SavedData?.[0]?.email || "System";

            try {
                await fetch(`${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=UpdateLaptopComment`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    mode: 'no-cors',
                    body: JSON.stringify({
                        type: "UpdateLaptopComment",
                        laptopId: selectedLaptop.ID,
                        updatedBy: userEmail
                    })
                });

                setSnackbar({ open: true, message: 'Issue marked as resolved.', severity: 'success' });
                await fetchData(); // Refresh list
            } catch (error) {
                console.error('Update failed:', error);
                setSnackbar({ open: true, message: 'Update failed. See console.', severity: 'error' });
            }
        }

        handleCloseDialog();
    };

    // Check if comment exactly matches "Resolved" (case insensitive)
    const isResolved = (comment) => {
        if (!comment) return false;
        return comment.trim().toLowerCase() === "resolved";
    };

    const getFilteredLaptops = () => {
        // Only show laptops with actual comment content
        const laptopsWithComments = laptops.filter(l => 
            l['Comment for the Issues'] && 
            l['Comment for the Issues'].trim() !== ''
        );
        
        if (filterStatus === 'Resolved') {
            return laptopsWithComments.filter(l => isResolved(l['Comment for the Issues']));
        }
        
        // Default Unresolved filter
        return laptopsWithComments.filter(l => !isResolved(l['Comment for the Issues']));
    };

    const filteredLaptops = getFilteredLaptops();

    if (loading) return <Container maxWidth="lg"><Typography>Loading...</Typography></Container>;
    if (error) return <Container maxWidth="lg"><Typography color="error">Error: {error}</Typography></Container>;

    return (
        <Container maxWidth="xl" sx={{ padding: '20px' }}>
            <Typography variant="h6" gutterBottom mb={5}>Laptops with Issue Comments</Typography>

            <div sx={{ mb: 3, mt:5 }}>
                <ButtonGroup variant="outlined" aria-label="filter button group" sx={{ mb: 3 }}>
                    <Button 
                        onClick={() => setFilterStatus('Unresolved')}
                        variant={filterStatus === 'Unresolved' ? 'contained' : 'outlined'}
                        color="primary"
                    >
                        Issue
                    </Button>
                    <Button 
                        onClick={() => setFilterStatus('Resolved')}
                        variant={filterStatus === 'Resolved' ? 'contained' : 'outlined'}
                        color="primary"
                    >
                        Resolved
                    </Button>
                </ButtonGroup>
            </div>

            <Typography variant="subtitle1" gutterBottom>
                {filteredLaptops.length} laptop{filteredLaptops.length !== 1 ? 's' : ''} {filterStatus.toLowerCase()}
            </Typography>

            {filteredLaptops.length > 0 ? (
                <TableContainer component={Paper} sx={{ maxHeight: '80vh' }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>ID</strong></TableCell>
                                <TableCell><strong>Processor</strong></TableCell>
                                <TableCell><strong>Battery</strong></TableCell>
                                <TableCell><strong>Assigned To</strong></TableCell>
                                <TableCell><strong>Donated To</strong></TableCell>
                                <TableCell><strong>Comment</strong></TableCell>
                                <TableCell><strong>Last Updated</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredLaptops.map((laptop, index) => (
                                <TableRow
                                    key={index}
                                    hover
                                    onClick={() => handleRowClick(laptop)}
                                    sx={{ cursor: 'pointer' }}
                                >
                                    <TableCell>{laptop.ID}</TableCell>
                                    <TableCell>{laptop.Processor || 'N/A'}</TableCell>
                                    <TableCell>
                                        {laptop['Battery Capacity'] ?
                                            `${Math.round(laptop['Battery Capacity'] * 100)}%` : 'N/A'}
                                    </TableCell>
                                    <TableCell>{laptop['Assigned To'] || 'N/A'}</TableCell>
                                    <TableCell>{laptop['Donated To'] || 'N/A'}</TableCell>
                                    <TableCell sx={{ maxWidth: '250px', whiteSpace: 'pre-wrap' }}>
                                        {laptop['Comment for the Issues'] || '-'}
                                    </TableCell>
                                    <TableCell>
                                        {laptop['Last Updated On'] ?
                                            new Date(laptop['Last Updated On']).toLocaleDateString() : 'N/A'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Typography variant="body1">No laptops found</Typography>
            )}

            {/* Dialog for issue confirmation */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Issue Resolution</DialogTitle>
                <DialogContent>
                    {selectedLaptop && (
                        <>
                            <Typography variant="body1" gutterBottom>
                                Is the issue fixed?
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                {selectedLaptop['Comment for the Issues']}
                            </Typography>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleIssueResponse(false)} color="error" variant="outlined">
                        No
                    </Button>
                    <Button onClick={() => handleIssueResponse(true)} color="primary" variant="contained">
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar Notification */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default OpsWelcome;