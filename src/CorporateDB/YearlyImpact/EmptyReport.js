import React from 'react'
import { Box, Typography } from '@mui/material'
import "./styles/YearlyImpect.css"
import cardChart from "../Image/Chart 2 1.svg"

const EmptyReport = () => {
    return (
        <Box className="empty-report">
            <img src={cardChart} alt="empty yearly report" />
            <Typography variant='body1'>Please wait for the yearly report 2023-2024 to become available at the end of the year once all the data is available</Typography>
        </Box>
    )
}

export default EmptyReport
