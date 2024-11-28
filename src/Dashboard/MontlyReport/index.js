import { Container, Button } from '@mui/material';
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

const MonthlyReport = () => {
    const { id } = useParams();

    console.log(id);
    const handleCreateForm = () => {
        // Logic to create form goes here
        console.log('Create Form button clicked');
        Navigate(`/monthly-reporting/${id}`);
    };

    return (
       <Container maxWidth="sm" sx={{alignItems: 'center', justifyContent: 'center', textAlign: 'center',mt: 5 }}>
            <h1>Monthly Report</h1>
            <p>Click the button below to create a new monthly report form</p>
            <Button href={`/monthly-reporting/${id}`} variant="contained"> Create Form</Button>
        </Container>
    );

};

export default MonthlyReport;