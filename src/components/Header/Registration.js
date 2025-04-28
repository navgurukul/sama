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
} from '@mui/material';
import React, { useState, useEffect } from 'react';

const Registration = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch(
                'https://script.google.com/macros/s/AKfycbzrwyMBpSERDU7RkuQvc-O3Ofxu8hUPbs95c_nZJ67YnOIM-Yq4EzqNaMoMI-l0m32l/exec'
            );
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            if (Array.isArray(result)) {
                setData(result);
            }
            console.log("Fetched data:", result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (e, index, row) => {
        const newStatus = e.target.value;
        const id = row.ID; 
        
        const updatedData = [...data];
        updatedData[index].Status = newStatus;
        setData(updatedData);
    
        try {
            const response = await fetch('https://script.google.com/macros/s/AKfycbz7eoDcN16SrbO67pRjm63IOjPte7e5wmH2WQlJPr1B2bak4fYa-GaLVmUv_bsjlVMt/exec', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'no-cors',    
                body: JSON.stringify({
                    detail: 'statusUpdate',
                    id: id,
                    status: newStatus,
                }),
            });
    
            console.log('Status update request sent successfully (no-cors).');
            
        } catch (error) {
            console.error('Error sending status update request:', error);
    
            const revertedData = [...data];
            revertedData[index].Status = row.Status;
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
        </Container>
    );
};

export default Registration;
