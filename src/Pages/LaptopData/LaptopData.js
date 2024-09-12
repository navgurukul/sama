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
        const searchTerm = e.target.value.trim(); // Trim to avoid extra spaces
        setSearchItem(searchTerm); // Set the search term state

        if (searchTerm) {
            const filteredItems = filteredData1.filter((user) =>
                user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || // Check name
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || // Check email
                user.userId?.toString().includes(searchTerm) || // Check userId
                user.Address?.email?.toLowerCase().includes(searchTerm.toLowerCase()) || // Check Address.email
                user['contact number']?.toString().includes(searchTerm) // Check contact number
            );

            setUserData(filteredItems); // Update the data with filtered items
        } else {
            setUserData([]); // Clear the data when search is empty
        }
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
            <Typography sx={Clases.Identification} align='center' variant='h3'>Assessing Laptop</Typography>

            {filteredData.length > 0 ? (
                <TableContainer sx={Clases.TableContainerBox}>
                    <CardContent

                    >
                        <Card sx={{ mt: 1 }} style={{ boxShadow: "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px" }}>
                            <Typography sx={Clases.Identification} align='center' variant='h4' style={{ position: "relative", bottom: "20px" }}>Laptop's Identification Table</Typography>
                            <Box>
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
                                <Table sx={{ minWidth: 650, mt: 4 }} aria-label="caption table" >

                                    
                                    {searchQuery && filteredData.length > 0 ? (
                                        <TableContainer sx={Clases.TableContainerBox}>
                                            <CardContent>
                                                <Card sx={{ mt: 1 }} style={{ boxShadow: "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px" }}>
                                                   
                                                    <Box>
                                                       
                                                        <Table sx={{ minWidth: 650, mt: 4 }} aria-label="caption table">
                                                            <TableHead sx={{ backgroundColor: "rgba(92, 120, 90, 1)", color: "white" }}>
                                                                <TableRow>
                                                                    <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "15px" }}>ID</TableCell>
                                                                    <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "15px" }}>Date of Intake</TableCell>
                                                                    <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "15px" }}>Donor Company Name</TableCell>
                                                                    <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "15px" }}>ROM</TableCell>
                                                                    <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "15px" }}>Manufacturer Model</TableCell>
                                                                    <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "15px" }}>Processor</TableCell>
                                                                    <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "15px" }}>Manufacturing Date</TableCell>
                                                                    <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "15px" }}>Condition Status</TableCell>
                                                                    <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "15px" }}>Minor Issues</TableCell>
                                                                    <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "15px" }}>Major Issues</TableCell>
                                                                    <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "15px" }}>Other Issues</TableCell>
                                                                    <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "15px" }}>Inventory Location</TableCell>
                                                                    <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "15px" }}>Laptop Weight</TableCell>
                                                                    <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "15px" }}>Mac Address</TableCell>
                                                                    <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "15px" }}>Assigned</TableCell>
                                                                    <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "15px" }}>Status</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {filteredData.map((item, index) => (
                                                                    <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#f0f0f0' } }}>
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
                                                    </Box>
                                                </Card>
                                            </CardContent>
                                        </TableContainer>
                                    ) : (
                                        <p></p>
                                    )}
                                </Table>
                            </Box>
                            {showWelcome && (
                                <Container maxWidth="xxl">
                                    <Card sx={{ mt: 3 }} style={{ boxShadow: "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px" }}>
                                        <CardContent>
                                            <Typography sx={Clases.Identification} align='center' variant='h4'>
                                                User's Identification Table
                                            </Typography>
                                            <TextField
                                                value={searchItem}
                                                onChange={handleInputChange}
                                                placeholder="Search by phone or name or email"
                                                variant="outlined"
                                                sx={Clases.Seachbar}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <SearchIcon />
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />

                                            {/* Conditionally Render Table */}
                                            {searchItem ? (
                                                filteredData1.length > 0 ? (
                                                    <Table aria-label="user data table">
                                                        <TableHead sx={{ backgroundColor: "rgba(92, 120, 90, 1)", color: "white" }}>
                                                            <TableRow>
                                                                <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "15px" }}>User ID</TableCell>
                                                                <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "15px" }}>Name</TableCell>
                                                                <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "15px" }}>Email</TableCell>
                                                                <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "15px" }}>Contact Number</TableCell>
                                                                <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "15px" }}>Address</TableCell>
                                                                <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "15px" }}>Laptop Assigned</TableCell>
                                                                <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "15px" }}>Number of Family members</TableCell>
                                                                <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "15px" }}>Qualification</TableCell>
                                                                <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "15px" }}>Status</TableCell>
                                                                <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "15px" }}>Laptop Assigned</TableCell>
                                                                <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "15px" }}>Use case</TableCell>
                                                                <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: "15px" }}>ID Proof number</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {filteredData1.map((user) => (
                                                                <TableRow
                                                                    key={user.userId}
                                                                    sx={{
                                                                        '&:hover': { backgroundColor: '#f0f0f0' },
                                                                    }}
                                                                >
                                                                    <TableCell>{user.userId}</TableCell>
                                                                    <TableCell>{user.name}</TableCell>
                                                                    <TableCell>{user.email}</TableCell>
                                                                    <TableCell>{user['contact number']}</TableCell>
                                                                    <TableCell>{user.Address}</TableCell>
                                                                    <TableCell>{user["Laptop Assigned"]}</TableCell>
                                                                    <TableCell>{user["Number of Family members(who might use the laptop)"]}</TableCell>
                                                                    <TableCell>{user.Qualification}</TableCell>
                                                                    <TableCell>{user.status}</TableCell>
                                                                    <TableCell>{user["Laptop Assigned"]}</TableCell>
                                                                    <TableCell>{user["Use case"]}</TableCell>
                                                                    <TableCell>{user["ID Proof number"]}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                ) : (
                                                    // Display when no results found
                                                    <Typography align="center" sx={{ mt: 4, color: 'red' }}>
                                                        No data available.
                                                    </Typography>
                                                )
                                            ) : (
                                                null
                                            )}

                                            {searchItem && (
                                                <caption style={{ paddingTop: "30px", color: "#5C785A" }}>
                                                    <Button
                                                        sx={Clases.SubmitButton}
                                                        variant="contained"
                                                        style={{ background: "#5C785A" }}
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

                        </Card>
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





