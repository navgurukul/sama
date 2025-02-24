import { useState } from "react";
import {
    Button,
    Box,
    Container,
    Typography,
    Grid,
    InputLabel,
    TextField,
    Select,
    MenuItem,
    FormControl,
} from "@mui/material";
import StayConnected from '../../../common/StayConnected'
import ourteam from '../OurTeam/style';
import OurGovermentForm from "./OurGovermentForm";

const OurGoverment = () => {

    const [selectedState, setSelectedState] = useState("");

    const handleStateChange = (event) => {
        setSelectedState(event.target.value);
    };

    return (
        <>
        <Container maxWidth="lg" sx={ourteam.container}>
            <Box sx={ourteam.GovBox}>
                <Typography variant="h5" gutterBottom>
                    Our Government Partners
                </Typography>
                <Typography variant="body1" paragraph sx={ourteam.Para}>
                    Through government collaborations, we scale our efforts
                    to reach rural and underserved <br /> areas, ensuring equitable
                    access to technology and opportunity
                </Typography>
                <Typography variant="h6" gutterBottom sx={ourteam.secondhead} mt={5}>
                    Help Sama bridge the digital divide in rural and <br />underserved areas
                </Typography>
                <OurGovermentForm />
            </Box>
        </Container>
        <StayConnected />
        </>
    );
};


export default OurGoverment;