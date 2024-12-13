import { Container, Button, CircularProgress, Alert } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const MonthlyReport = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFormCreated, setIsFormCreated] = useState(null);

    const API_URL = `https://script.google.com/macros/s/AKfycbxTda3e4lONdLRT13N2lVj7Z-P0q-ITSe1mvh-n9x9BG8wZo9nvnT7HXytpscigB0fm/exec?type=Monthly&&id=${id}`;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(API_URL);

                // Assuming the API returns { success: true, exists: true/false }
                if (response.data) {
                    setIsFormCreated(response.data.success);
                    

                } else {
                    throw new Error('Invalid response from server');
                }
            } catch (err) {
                setError('Failed to load data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleButtonClick = () => {
        if (isFormCreated) {
            navigate(`/edit-form/${id}`);
        } else {
            navigate(`/monthly-reporting/${id}`);
        }
    };

    return (
        <Container maxWidth="md" sx={{  mt: 5 }}>
            <h1>Monthly Report</h1>
            <p>Click the button below to {isFormCreated ? "edit" : "create"} your monthly report form</p>

            {loading ? (
                <CircularProgress /> // Show a loader while checking
            ) : error ? (
                <Alert severity="error">{error}</Alert> // Display error if any
            ) : (
                <Button variant="contained" onClick={handleButtonClick}>
                    {isFormCreated ? "Edit Form" : "Create Form"}
                </Button>
            )}
        </Container>
    );
};

export default MonthlyReport;
