import React, { useState, useEffect } from "react";
import { Box, Typography, Container, Button } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

const DetailView = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { title, total, detailedData } = location.state || {};
    const [ngosName, setNgosName] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_NgoInformationApi}?type=registration`)
                const result = await response.json();
                const idToNameMap = Object.fromEntries(
                    result.data.map(item => [item.Id, item.organizationName])
                );
                setNgosName(idToNameMap);
            }
            catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    const updatedData = Object.entries(detailedData).map(([id, value]) => ({
        originalId: id,
        displayName: ngosName[id] || id, // Use organization name if found
        count: value
    }));

    if (!title || !detailedData) {
        return <Typography>No data available</Typography>;
    }

    const changeRoute = (partnerId) => {
        navigate('/ngoprofile', { state: { partnerId } });
    };

    return (
        <Container
            maxWidth="sm"
            sx={{
                mt: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: "#fff",
                minHeight: "100vh",
            }}
        >
            <Typography variant="h6" sx={{ color: "#4A4A4A", mb: 3, mt: 5 }}>
                NGO Wise {title} in the Month of January
            </Typography>
            <Box
                sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1 }}
            >
                {(updatedData).map(({ originalId, displayName, count }) => (
                    <Box
                        key={originalId}
                        onClick={() => changeRoute(originalId)}
                        sx={{ display: "grid", gridTemplateColumns: "10fr 2fr", gridGap: "5px" }}
                    >
                        <Typography
                            sx={{
                                bgcolor: "#fff",
                                px: 3,
                                py: 0.5,
                                bgcolor: "primary.light",
                                borderRadius: "6px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "left",
                                height: "63px",
                                color: "#4A4A4A",
                                color: "#4A4A4A",
                                cursor: "pointer",
                                boxShadow: "0.2px 0.2px 4px rgba(0,0,0,0.1)",
                            }}
                            variant="body1"
                        >{displayName}</Typography>
                        <Typography
                            sx={{
                                px: 3,
                                py: 0.5,
                                bgcolor: "#CED7CE",
                                borderRadius: "6px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                height: "63px",
                                fontSize: "14px",
                                fontWeight: 500,
                                color: "#4A4A4A",
                                cursor: "pointer",
                                boxShadow: "0.2px 0.2px 4px rgba(0,0,0,0.1)",
                            }}
                                variant="body1"
                        >
                            <Typography variant="body1">{count}</Typography>
                        </Typography>
                    </Box>
                ))}

                <Box sx={{ display: "grid", gridTemplateColumns: "10fr 2fr", gridGap: "5px" }}>
                    <Typography
                        sx={{
                            bgcolor: "#fff",
                            px: 3,
                            py: 0.5,
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "left",
                            height: "63px",
                            color: "#4A4A4A",
                            boxShadow: "0.2px 0.2px 4px rgba(0,0,0,0.1)",
                        }}
                    >
                        <b>Total {title}</b>
                    </Typography>
                    <Typography
                        sx={{
                            px: 3,
                            py: 0.5,
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "63px",
                            fontSize: "14px",
                            fontWeight: 500,
                            boxShadow: "0.2px 0.2px 4px rgba(0,0,0,0.1)",
                        }}
                    >
                        <Typography variant="body1"><b>{total}</b></Typography>
                    </Typography>
                </Box>
            </Box>

            <Button
                onClick={() => navigate("/corporate", { state: { tabIndex: 1 } })}
                sx={{ bgcolor: "primary.main", color: "#fff", mt: 4, cursor: "pointer" }}
            >
                Go to Dashboard
            </Button>
        </Container>
    );
};

export default DetailView;

