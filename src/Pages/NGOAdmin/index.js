
import * as React from 'react';
import { TablePagination, TableCell, TableHead, TableRow, TableContainer, TextField, Container, IconButton, Typography, Box, InputLabel, MenuItem, ListSubheader, FormControl, Select, Table, TableBody, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import { classes } from "./style";
import { Search } from '@mui/icons-material';

const columns = [
    { id: 'NGO ID', label: 'NGO ID', minWidth: 15 },
    { id: 'NGO Name', label: 'NGO Name', minWidth: 15 },
    { id: 'POC Name', label: 'POC Name', minWidth: 40 },
    { id: 'Contact Number', label: 'Contact Number', minWidth: 200 },
    { id: 'Laptop Requirement', label: 'Laptop Requirement', minWidth: 30 },
    { id: 'Location of Operation', label: 'Location of Operation', minWidth: 20 },
    { id: 'Purpose', label: 'Purpose', minWidth: 30, align: 'right' },
    { id: 'Status', label: 'Status', align: 'center', minWidth: 50 },
    { id: 'Actions', label: 'Actions', align: 'center', minWidth: 50 },

];

function createData(ngoId, ngoName, pocName, contactNumber, laptopRequirement, location, purpose, status) {
    return { 'NGO ID': ngoId, 'NGO Name': ngoName, 'POC Name': pocName, 'Contact Number': contactNumber, 'Laptop Requirement': laptopRequirement, 'Location of Operation': location, 'Purpose': purpose, 'Status': status };
}

const rows = [
    createData('NG12345', 'Give India Foundations', 'Anjali Garg', '9765846543', '150', 'Bangalore', 'Online courses for skill development', 'Pending'),
    createData('NG54321', 'Give India Foundations', 'Anjali Garg', '9765846543', '10', 'Los Angeles', 'Online courses for skill development', 'Approved'),
    createData('NG12345', 'Give India Foundations', 'Anjali Garg', '9765846543', '150', 'Bangalore', 'Online courses for skill development', 'Pending'),
    createData('NG54321', 'Give India Foundations', 'Anjali Garg', '9765846543', '10', 'Los Angeles', 'Online courses for skill development', 'Approved'),
    createData('NG12345', 'Give India Foundations', 'Anjali Garg', '9765846543', '150', 'Bangalore', 'Online courses for skill development', 'Pending'),
    createData('NG54321', 'Give India Foundations', 'Anjali Garg', '9765846543', '10', 'Los Angeles', 'Online courses for skill development', 'Approved'),
    createData('NG12345', 'Give India Foundations', 'Anjali Garg', '9765846543', '150', 'Bangalore', 'Online courses for skill development', 'Pending'),
    createData('NG54321', 'Give India Foundations', 'Anjali Garg', '9765846543', '10', 'Los Angeles', 'Online courses for skill development', 'Approved'),
    createData('NG12345', 'Give India Foundations', 'Anjali Garg', '9765846543', '150', 'Bangalore', 'Online courses for skill development', 'Pending'),
    createData('NG54321', 'Give India Foundations', 'Anjali Garg', '9765846543', '10', 'Los Angeles', 'Online courses for skill development', 'Approved'),
];

function NgoDashboard() {

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    return (
        <Container maxWidth="xxl" sx={classes.mainContainer}>
            <Box sx={{ px: 3 }}>
                <Typography variant='h6'>All NGOs (100)</Typography>
                <TextField
                    label="Search by Name, Location, Contact Number..."
                    id="custom-css-outlined-input"
                    sx={classes.TextField}
                    InputProps={{
                        startAdornment: (
                            <Search sx={classes.selectDropdown} />
                        ),
                    }}
                    variant="outlined"
                />
                <div style={{ marginTop: "32px" }}>
                    <FilterListIcon sx={{ mt: 3 }} />
                    <span sx={classes.span} style={classes.span}>Filter</span>

                    <FormControl sx={{ m: 1, minWidth: 208 }}>
                        <InputLabel htmlFor="grouped-select">Laptops Required</InputLabel>
                        <Select defaultValue="" id="grouped-select" label="Laptops Required">
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            <ListSubheader>Category 1</ListSubheader>
                            <MenuItem value={1}>Option 1</MenuItem>

                        </Select>
                    </FormControl>
                    <FormControl sx={{ m: 1, minWidth: 208 }}>
                        <InputLabel htmlFor="grouped-select">Purpose</InputLabel>
                        <Select defaultValue="" id="grouped-select" label="Purpose">
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            <ListSubheader>Category 1</ListSubheader>
                            <MenuItem value={1}>Option 1</MenuItem>

                        </Select>
                    </FormControl>
                    <FormControl sx={{ m: 1, minWidth: 208 }}>
                        <InputLabel htmlFor="grouped-select">Location of Operation</InputLabel>
                        <Select defaultValue="" id="grouped-select" label="Location of Operation">
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            <ListSubheader>Category 1</ListSubheader>
                            <MenuItem value={1}>Option 1</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl sx={{ m: 1, minWidth: 208 }}>
                        <InputLabel htmlFor="grouped-select">Status</InputLabel>
                        <Select defaultValue="" id="grouped-select" label="Status">
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            <ListSubheader>Category 1</ListSubheader>
                            <MenuItem value={1}>Option 1</MenuItem>
                        </Select>
                    </FormControl>
                </div>
                <Box
                    sx={classes.containerBox}>
                    <TableContainer
                        sx={{ border: "none" }}
                    >
                        <Table
                            sx={{
                                border: 'none',
                                '& th, & td': {
                                    border: 'none',
                                },
                            }}
                        >
                            <TableHead >
                                <TableRow>
                                    {columns.map((column) => (
                                        <TableCell

                                            key={column.id}
                                            align={column.align || 'left'}
                                            style={{ minWidth: column.minWidth }}
                                        >
                                            <Typography variant='subtitle2' style={{ fontWeight: "bold" }}> {column.label}</Typography>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, rowIndex) => (
                                    <TableRow hover role="checkbox" tabIndex={-1} key={rowIndex}>
                                        {columns.map((column) => {
                                            const value = row[column.id];

                                            if (column.id === 'Status') {
                                                return (
                                                    <FormControl sx={{ m: 1, minWidth: 208 }}>
                                                        <InputLabel htmlFor="grouped-select">
                                                            <span style={{ flex: 1 }}>
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    width="8"
                                                                    height="8"
                                                                    viewBox="0 0 8 8"
                                                                    fill="none"
                                                                    style={{ marginRight: '8px' }}
                                                                >
                                                                    <circle cx="4" cy="4" r="4" fill="#FFAD33" />
                                                                </svg>
                                                                Request Submitted</span></InputLabel>
                                                        <Select defaultValue="" id="grouped-select" label=" Request Submitted">
                                                            <MenuItem value="">
                                                                <em>None</em>
                                                            </MenuItem>
                                                            <ListSubheader>Category 1</ListSubheader>
                                                            <MenuItem value={1}>Option 1</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                );
                                            }
                                            if (column.id === 'Actions') {
                                                return (
                                                    <TableCell
                                                        sx={{ border: "none" }}
                                                        key={column.id}
                                                        align="center"
                                                    >
                                                        <IconButton
                                                            aria-label="delete"
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                );
                                            }
                                            return (
                                                <TableCell
                                                    key={column.id}
                                                    align={column.align || 'left'}
                                                    sx={{ border: "none" }}
                                                >
                                                    <Typography variant='body2' sx={{ textAlign: "center" }}>
                                                        {value ? value : '-'}
                                                    </Typography>
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Divider sx={{ mt: 1 }}></Divider>
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 100]}
                            component="div"
                            sx={classes.tablePadination}
                            count={rows.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </TableContainer>
                </Box>
            </Box>
        </Container >
    );
}

export default NgoDashboard;


