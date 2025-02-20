import React from "react";
import { Box, Typography, Container, Button } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

const DetailView = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { title1, data, total, about } = location.state || {};

    if (!data) {
        return <Typography>No data available</Typography>;
    }

    const changeRoute = () => {
        navigate('/ngoprofile');
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
            <pre><Typography
                variant="h6"
                sx={{
                    // mb: 3,
                    color: "#4A4A4A",
                    // textAlign: "center",
                }}
            >
                NGO Wise {title1} in the Month of January
            </Typography></pre>

            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,

                }}
            >
                {data.map((item, index) => (
                    <Box
                        key={index}
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "10fr 2fr",
                            gridGap: "5px",
                            alignItems: "left",
                            
                        }}
                        onClick={changeRoute}
                    >
                        <Box
                            
                            sx={{
                                bgcolor: "primary.light",
                                px: 3,
                                py: 0.5,
                                borderRadius: "6px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "left",
                                height: "63px",
                                color: "#4A4A4A",
                                
                            }}
                        >
                            <Typography >{item.name}</Typography>
                        </Box>
                        <Box
                            sx={{
                                bgcolor: "#CED7CE",
                                px: 3,
                                py: 0.5,
                                borderRadius: "6px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                height: "63px",
                                color: "#4A4A4A",
                                fontSize: "14px",
                                fontWeight: 500,
                            }}
                        >
                            <Typography>{item.count}</Typography>
                        </Box>
                    </Box>
                ))}

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "10fr 2fr", 
                        gridGap: "5px", 
                        alignItems: "left",
                    }}
                >
                    <Typography
                        variant="body1"
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
                        <b>Total {about}</b>
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
                            boxShadow: "0.2px 0.2px 4px rgba(0,0,0,0.1)",
                        }}
                    >
                        <Typography><b>{total}</b></Typography>
                    </Typography>
                </Box>
            </Box>

            <Button
                onClick={() =>  navigate(`/corpretedb?tab=monthly-impact`)}
                sx={{
                    bgcolor: "primary.main",
                    color: "#fff",
                    mt: 4,
                    cursor: "pointer",
                }}
            >
                Go to Dashboard
            </Button>
        </Container>
    );
};

export default DetailView;