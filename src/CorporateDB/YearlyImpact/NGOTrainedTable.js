import React from 'react';
import { Box, Typography, Grid, Paper, IconButton, Button } from '@mui/material';
import './styles/NGOTrainedTable.css';
import { useNavigate } from 'react-router-dom';
import SaveAltIcon from '@mui/icons-material/SaveAlt';

const NGOTrainedTable = () => {
    const navigate = useNavigate();
    const months = ['Jan23', 'Feb23', 'Mar23', 'Apr23', 'May23', 'Jun23', 'Jul23', 'Aug23', 'Sep23', 'Oct23', 'Nov23', 'Dec23'];
    const ngoData = [
        { name: 'Give India Foundations', monthly: [250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250] },
        { name: 'Give India Foundations', monthly: [250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250] },
        { name: 'Give India Foundations', monthly: [250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250] },
        { name: 'Give India Foundations', monthly: [250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250] },
        { name: 'Give India Foundations', monthly: [250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250] },
        { name: 'Give India Foundations', monthly: [250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250] },
        { name: 'Give India Foundations', monthly: [250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250] },
        { name: 'Give India Foundations', monthly: [250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250] },
    ];

    const total = ngoData.reduce((acc, ngo) => {
        ngo.monthly.forEach((value, index) => {
            acc[index] += value;
        });
        return acc;
    }, Array(12).fill(0));

    return (
        <Box className="container">
            {/* Title */}
            <Box className="ngo-header" gap={1}>
                <Typography variant="h6" textAlign="left">
                    NGO Wise Teachers Trained for 2023-24
                </Typography>
                <IconButton sx={{ color: "#828282" }}>
                    <SaveAltIcon />
                </IconButton>
            </Box>

            <Grid container spacing={1} columnSpacing={1} wrap="nowrap">
                <Grid item xs={3}>
                    <Paper
                        className='ngo-cell'
                    >
                        NGO Name
                    </Paper>
                </Grid>
                {months.map((month, idx) => (
                    <Grid item xs={1} key={idx}>
                        <Paper
                            className='month-cell'
                        >
                            {month}
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {ngoData.map((ngo, index) => (
                <Grid container spacing={2} key={index} wrap="nowrap">
                    <Grid item xs={3}>
                        <Paper className='ngo-cell' sx={{
                            bgcolor: "primary.light",
                        }}>{ngo.name}</Paper>
                    </Grid>
                    {ngo.monthly.map((value, idx) => (
                        <Grid item xs={1} key={idx}>
                            <Paper className='month-cell' sx={{
                                bgcolor: "#CED7CE",
                            }}>{value}</Paper>
                        </Grid>
                    ))}
                </Grid>
            ))}

            <Grid container spacing={2} wrap="nowrap">
                <Grid item xs={3}>
                    <Paper
                        className='ngo-cell'
                    >
                       Total Number of Teacher’s Trained
                    </Paper>
                </Grid>
                {total.map((value, idx) => (
                    <Grid item xs={1} key={idx}>
                        <Paper
                            className='month-cell'
                        >
                            {value}
                        </Paper>
                    </Grid>
                ))}
            </Grid>
            {/* Button */}
            <Button
                onClick={() => navigate("/corpretedb")}
                sx={{
                    bgcolor: "primary.main",
                    color: "#fff",
                    mt: 4,
                    cursor: "pointer",
                }}
            >
                Go to Dashboard
            </Button>
        </Box>
    );
};

export default NGOTrainedTable;

