import { Button, Box, Container, Typography, Grid, Card, CardMedia, TextField } from "@mui/material";
import StayConnected from '../../../common/StayConnected'
import ourteam from '../OurTeam/style';
import Quote from './quote.png'

const CommunityPartners = () => {
    return (
        <>
            <Container maxWidth="lg" sx={ourteam.container}>
                <Typography variant="h5" gutterBottom>
                    Our Community Partners
                </Typography>
                <Typography variant="body1" paragraph>
                    Our community partners bring local insights and on-the-ground support,
                    helping us<br /> connect with and empower the individuals who need it most
                </Typography>
                <Box sx={ourteam.GreenBox}>
                    <h1>gyg</h1>
                </Box>
                <StayConnected />
            </Container>
        </>
    )
}
export default CommunityPartners;