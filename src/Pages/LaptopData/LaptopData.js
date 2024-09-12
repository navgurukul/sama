import React, { useEffect, useState } from 'react';
import { Container, Typography, TextField, Button, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import { Alert, AlertTitle, Box } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import { Clases } from './style.js';

const ContainerBox = styled('div')(({ theme }) => ({
    background: "white",

}));

const DarkText = styled(Typography)(({ theme }) => ({
    color: '#2E2E2E',
}));

export default function LaptopData() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showWelcome, setShowWelcome] = useState(false);
    const [userData, setUserData] = useState([]);
    const [searchItem, setSearchItem] = useState('');


    const [formData, setFormData] = useState({
        LaptopId: '',
        UserId: '',
        Date: new Date().toISOString().slice(0, 16)
    });


    const handleSubmit = (e) => {
        e.preventDefault();

        const formBody = new URLSearchParams(formData);

        fetch("https://script.google.com/macros/s/AKfycbxnPWgMITpyzau2B8h2yk3qzh5wmD29YszLl1hKOHusDl67NxNHkx9Ehc8vnRjAn3Jv/exec", {
            method: "POST",
            body: formBody,
        })
            .then(async (res) => {
                const text = await res.text();
                try {
                    return JSON.parse(text);
                } catch (error) {
                    return text;
                }
            })
            .then((data) => {
                console.log(data);
            })
            .catch((error) => {
                console.log("Error:", error);
            });
    };


    useEffect(() => {
        fetch('https://script.google.com/macros/s/AKfycbxRTl4xrlGZxt7RsWbCvyDsI_PCiFzKxrKoMweuVAaYwV4WSfC-KgvSzg_0_MYbyk9w/exec')
            .then((res) => res.json())
            .then((data) => {
                console.log('Raw data:', data);
                setUserData(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                setError(error);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        fetch('https://script.google.com/macros/s/AKfycbxJ0ioHj3RpglVQ5s7wPcphseI0cTTCn5rqUM5OdiXY3zA9817VlQ91OMs0d54NrsSN/exec')
            .then((res) => res.json())
            .then((data) => {
                console.log('Raw data:', data);
                setData(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                setError(error);
                setLoading(false);
            });
    }, []);

    const filteredData1 = userData.filter((item) =>
        item.status === 'Not Assigned'
    );
    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading data: {error.message}</div>;
    }


    const handleInputChange = (e) => {
        const searchTerm = e.target.value;
        setSearchItem(searchTerm);

        const filteredItems = filteredData1.filter((user) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setUserData(filteredItems);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading data: {error.message}</div>;
    }

    const filteredData = data.filter((item) => {
        const isTagged = item.Status && item.Status.trim().toLowerCase() === 'tagged';
        const matchesSearch =
            item.ID?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
            item['Mac Address']?.toLowerCase().includes(searchQuery.toLowerCase());
        return isTagged && matchesSearch;
    });

    const handleButtonClick = () => {
        setShowWelcome(true);
    };
    return (
        <ContainerBox maxWidth="xl" sx={{ py: 6 }}>
            {filteredData.length > 0 ? (
                <TableContainer component={Paper}>
                    <Typography sx={Clases.IdentificationTable} align='center' variant='h6'>Laptop Identification Table</Typography>
                    <CardContent >
                        <TextField
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by ID or Mac Address"
                            variant="outlined"
                            fullWidth
                            sx={Clases.searchItem}

                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Table sx={{ minWidth: 650, mt: 4 }} aria-label="caption table">
                            <TableHead sx={{ backgroundColor: "rgba(92, 120, 90, 1)", color: "white" }}>
                                <TableRow
                                >
                                    <TableCell sx={Clases.TableLaptop} >ID</TableCell>
                                    <TableCell sx={Clases.TableLaptop}>Date of Intake</TableCell>
                                    <TableCell sx={Clases.TableLaptop}>Donor Company Name</TableCell>
                                    <TableCell sx={Clases.TableLaptop}>ROM</TableCell>
                                    <TableCell sx={Clases.TableLaptop}>Manufacturer Model</TableCell>
                                    <TableCell sx={Clases.TableLaptop}>Processor</TableCell>
                                    <TableCell sx={Clases.TableLaptop}>Manufacturing Date</TableCell>
                                    <TableCell sx={Clases.TableLaptop}>Condition Status</TableCell>
                                    <TableCell sx={Clases.TableLaptop}>Minor Issues</TableCell>
                                    <TableCell sx={Clases.TableLaptop}>Major Issues</TableCell>
                                    <TableCell sx={Clases.TableLaptop}>Other Issues</TableCell>
                                    <TableCell sx={Clases.TableLaptop}>Inventory Location</TableCell>
                                    <TableCell sx={Clases.TableLaptop}>Laptop Weight</TableCell>
                                    <TableCell sx={Clases.TableLaptop}>Mac Address</TableCell>
                                    <TableCell sx={Clases.TableLaptop}>Assigned</TableCell>
                                    <TableCell sx={Clases.TableLaptop}>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredData.map((item, index) => (
                                    <TableRow key={index}
                                        sx={{
                                            '&:hover': {
                                                backgroundColor: '#f0f0f0',
                                            },
                                        }}
                                    >
                                        <TableCell>{item.ID || 'N/A'}</TableCell>
                                        <TableCell>{item['Date of Intake'] || 'N/A'}</TableCell>
                                        <TableCell>{item['Donor Company Name'] || 'N/A'}</TableCell>
                                        <TableCell>{item.ROM || 'N/A'}</TableCell>
                                        <TableCell>{item['Manufacturer Model'] || 'N/A'}</TableCell>
                                        <TableCell>{item.Processor || 'N/A'}</TableCell>
                                        <TableCell>{item['Manufacturing Date'] || 'N/A'}</TableCell>
                                        <TableCell>{item['Condition Status'] || 'N/A'}</TableCell>
                                        <TableCell>{item['Minor Issues'] || 'N/A'}</TableCell>
                                        <TableCell>{item['Major Issues'] || 'N/A'}</TableCell>
                                        <TableCell>{item['Other Issues'] || 'N/A'}</TableCell>
                                        <TableCell>{item['Inventory Location'] || 'N/A'}</TableCell>
                                        <TableCell>{item['Laptop Weight'] || 'N/A'}</TableCell>
                                        <TableCell>{item['Mac Address'] || 'N/A'}</TableCell>
                                        <TableCell>{item.Assigned || 'N/A'}</TableCell>
                                        <TableCell>{item.Status || 'N/A'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                            {searchQuery && (
                                <caption>

                                    <Button
                                        onClick={handleButtonClick}
                                        variant="contained"
                                        sx={{ background: "rgba(92, 120, 90, 1)" }}
                                        endIcon={<i className="fa fa-download" />}
                                    >
                                        Assign the laptop
                                    </Button>
                                </caption>
                            )}
                        </Table>
                        {showWelcome && (
                            <Container>
                                <Card sx={{ mt: 4, background: "#FFFAF8" }}>
                                    <CardContent>
                                        <Typography sx={Clases.Identification} align='center' variant='h4'>User's Identification Table</Typography>

                                        <TextField
                                            value={searchItem}
                                            onChange={handleInputChange}
                                            placeholder="Type to search"
                                            variant="outlined"
                                            fullWidth

                                            sx={Clases.Seachbar}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <SearchIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />

                                        {filteredData1.length > 0 ? (
                                            <Table sx={{ minWidth: 650 }} aria-label="user data table">
                                                <TableHead sx={Clases.TableHeadUser}>
                                                    <TableRow >
                                                        <TableCell sx={Clases.TableCellUser}>User ID</TableCell>
                                                        <TableCell sx={Clases.TableCellUser} >Name</TableCell>
                                                        <TableCell sx={Clases.TableCellUser}>Email</TableCell>
                                                        <TableCell sx={Clases.TableCellUser}>Contact Number</TableCell>
                                                        <TableCell sx={Clases.TableCellUser}>Address</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {filteredData1.map((user) => (
                                                        <TableRow key={user.userId}
                                                            sx={{
                                                                '&:hover': {
                                                                    backgroundColor: '#f0f0f0',
                                                                },
                                                            }}
                                                        >
                                                            <TableCell>{user.userId}</TableCell>
                                                            <TableCell>{user.name}</TableCell>
                                                            <TableCell>{user.email}</TableCell>
                                                            <TableCell>{user['contact number']}</TableCell>
                                                            <TableCell>{user.Address}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        ) : (
                                            <Typography align="center" sx={{ mt: 4, color: 'red' }}>
                                                No data available.
                                            </Typography>
                                        )}

                                        {searchItem && (
                                            <caption style={{ paddingTop: "30px" }}>
                                                <Button
                                                    sx={Clases.SubmitButton}
                                                    onClick={handleSubmit}
                                                    variant="contained"
                                                    endIcon={<i className="fa fa-download" />}
                                                >
                                                    Submit
                                                </Button>
                                            </caption>
                                        )}
                                    </CardContent>
                                </Card>
                            </Container>
                        )}
                    </CardContent>
                </TableContainer>

            ) : (
                <Box sx={Clases.AlertBox}>
                    <Alert
                        severity="warning"
                        iconMapping={{
                            warning: <WarningAmberIcon fontSize="inherit" />,
                        }}
                        sx={Clases.AlertMeg}
                    >
                        <AlertTitle sx={Clases.AlertTitle}>Warning</AlertTitle>
                        <Typography variant="body1">
                            <strong></strong>
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            Please check again or contact support if the issue persists.
                        </Typography>
                    </Alert>
                </Box>
            )}
        </ContainerBox>
    );
}










