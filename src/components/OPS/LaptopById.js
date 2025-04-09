import React, { useState, useEffect } from 'react';
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
    TextField,
    Box
} from '@mui/material';

const LaptopById = () => {
    // States
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [laptops, setLaptops] = useState([]);
    const [searchId, setSearchId] = useState('');
    
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
            setLaptops(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredLaptops = searchId 
        ? laptops.filter(laptop => 
            laptop.ID.toString().toLowerCase().includes(searchId.toLowerCase()))
        : laptops;

    if (loading) return <Container maxWidth="lg"><Typography>Loading...</Typography></Container>;
    if (error) return <Container maxWidth="lg"><Typography color="error">Error: {error}</Typography></Container>;

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
            <Box sx={{ mb: 2 }}>
                <TextField
                    label="Search by Laptop ID"
                    variant="outlined"
                    maxWidth="sm"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    placeholder="Enter Laptop ID to search..."
                />
            </Box>

            <TableContainer component={Paper} sx={{ maxHeight: '80vh', overflowX: 'auto' }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>ID</strong></TableCell>
                            <TableCell><strong>Manufacturer Model</strong></TableCell>
                            <TableCell><strong>Processor</strong></TableCell>
                            <TableCell><strong>RAM</strong></TableCell>
                            <TableCell><strong>ROM (GB)</strong></TableCell>
                            <TableCell><strong>Battery Capacity</strong></TableCell>
                            <TableCell><strong>Condition Status</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Donor Company</strong></TableCell>
                            <TableCell><strong>Inventory Location</strong></TableCell>
                            <TableCell><strong>Date</strong></TableCell>
                            <TableCell><strong>Assigned To</strong></TableCell>
                            <TableCell><strong>Donated To</strong></TableCell>
                            <TableCell><strong>Manufacturing Date</strong></TableCell>
                            <TableCell><strong>Mac Address</strong></TableCell>
                            <TableCell><strong>Weight</strong></TableCell>
                            <TableCell><strong>Major Issues</strong></TableCell>
                            <TableCell><strong>Minor Issues</strong></TableCell>
                            <TableCell><strong>Other Issues</strong></TableCell>
                            <TableCell><strong>Comments</strong></TableCell>
                            <TableCell><strong>Last Updated By</strong></TableCell>
                            <TableCell><strong>Last Updated On</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredLaptops.map((laptop, index) => (
                            <TableRow key={index} hover sx={{ cursor: 'pointer' }}>
                                <TableCell>{laptop.ID || 'N/A'}</TableCell>
                                <TableCell>{laptop['Manufacturer Model'] || 'N/A'}</TableCell>
                                <TableCell>{laptop.Processor || 'N/A'}</TableCell>
                                <TableCell>{laptop.RAM || 'N/A'}</TableCell>
                                <TableCell>{laptop.ROM || 'N/A'}</TableCell>
                                <TableCell>
                                    {laptop['Battery Capacity'] ?
                                        `${Math.round(laptop['Battery Capacity'] * 100)}%` : 'N/A'}
                                </TableCell>
                                <TableCell>{laptop['Condition Status'] || 'N/A'}</TableCell>
                                <TableCell>{laptop.Status || 'N/A'}</TableCell>
                                <TableCell>{laptop['Donor Company Name'] || 'N/A'}</TableCell>
                                <TableCell>{laptop['Inventory Location'] || 'N/A'}</TableCell>
                                <TableCell>{laptop.Date || 'N/A'}</TableCell>
                                <TableCell>{laptop['Assigned To'] || 'N/A'}</TableCell>
                                <TableCell>{laptop['Donated To'] || 'N/A'}</TableCell>
                                <TableCell>{laptop['Manufacturing Date'] || 'N/A'}</TableCell>
                                <TableCell>{laptop['Mac address'] || 'N/A'}</TableCell>
                                <TableCell>{laptop['laptop weight'] || 'N/A'}</TableCell>
                                <TableCell>{laptop['Major Issues'] || 'N/A'}</TableCell>
                                <TableCell>{laptop['Minor Issues'] || 'N/A'}</TableCell>
                                <TableCell>{laptop['Other Issues'] || 'N/A'}</TableCell>
                                <TableCell sx={{ maxWidth: '250px', whiteSpace: 'pre-wrap' }}>
                                    {laptop['Comment for the Issues'] || 'N/A'}
                                </TableCell>
                                <TableCell>{laptop['Last Updated By'] || 'N/A'}</TableCell>
                                <TableCell>
                                    {laptop['Last Updated On'] ?
                                        new Date(laptop['Last Updated On']).toLocaleDateString() : 'N/A'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default LaptopById;