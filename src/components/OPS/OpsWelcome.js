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
    Button
} from '@mui/material';
import React, { useState, useEffect } from 'react';

const OpsWelcome = () => {
    const [laptopsWithComments, setLaptopsWithComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedLaptop, setSelectedLaptop] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            
            if (result && Array.isArray(result)) {
                const filtered = result.filter(laptop => 
                    laptop['Comment for the Issues'] && laptop['Comment for the Issues'].trim() !== ''
                );
                setLaptopsWithComments(filtered);
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

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleIssueResponse = async (isFixed) => {
        if (isFixed && selectedLaptop) {
            const SavedData = JSON.parse(localStorage.getItem('_AuthSama_'));
            const userEmail = SavedData?.[0]?.email || "System";
            try {
                await fetch((`${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=UpdateLaptopComment`), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    mode: 'no-cors',
                    body: JSON.stringify({
                        type: "UpdateLaptopComment",
                        laptopId: selectedLaptop.ID,
                        updatedBy: userEmail
                    })
                });
                alert('Update request sent! Refreshing data...');
                await fetchData(); // Refresh the table data
            } catch (error) {
                console.error('Network error:', error);
                alert('Update request failed to send (check console)');
            }
        }
        handleCloseDialog();
    };

    

    if (loading) return <Container maxWidth="lg"><Typography>Loading...</Typography></Container>;
    if (error) return <Container maxWidth="lg"><Typography color="error">Error: {error}</Typography></Container>;

    return (
        <Container maxWidth="xl" sx={{ padding: '20px' }}>
            <Typography variant="h6" gutterBottom>Laptops with Issue Comments</Typography>
            <Typography variant="subtitle1" gutterBottom sx={{ mb: 3 }}>
                {laptopsWithComments.length} laptop{laptopsWithComments.length !== 1 ? 's' : ''} with comments found
            </Typography>

            {laptopsWithComments.length > 0 ? (
                <TableContainer component={Paper} sx={{ maxHeight: '80vh' }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>ID</strong></TableCell>
                                <TableCell><strong>Processor</strong></TableCell>
                                <TableCell><strong>Battery</strong></TableCell>
                                <TableCell><strong>Assigned To</strong></TableCell>
                                <TableCell><strong>Allocated To</strong></TableCell>
                                <TableCell><strong>Comment</strong></TableCell>
                                <TableCell><strong>Last Updated</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {laptopsWithComments.map((laptop, index) => (
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
                                        {laptop['Comment for the Issues']}
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
                <Typography variant="body1">No laptops with issue comments found</Typography>
            )}

            {/* Dialog for issue confirmation */}
            <Dialog 
                open={openDialog} 
                onClose={handleCloseDialog} 
                aria-labelledby="confirm-dialog-title"
                aria-describedby="confirm-dialog-description"
            >
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
                <DialogActions sx={{padding: '20px'}}>
                    <Button 
                        onClick={() => handleIssueResponse(false)} 
                        color="primary"                        
                        variant="outlined"

                    >
                        No
                    </Button>
                    <Button 
                        onClick={() => handleIssueResponse(true)} 
                        color="primary"
                        variant="contained"
                        autoFocus
                    >
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default OpsWelcome;