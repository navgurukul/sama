import { Container, Typography} from "@mui/material";
import StayConnected from '../../../common/StayConnected'
import ourteam from '../OurTeam/style';
import GreenBox from './GreenBox';
import CommunityForm from './CommunityForm'
import ImageBox from "./ImageBox";

const CommunityPartners = () => {
    return (
        <>
            <Container maxWidth="lg" sx={ourteam.Communitycontainer} >
                <Typography variant="h5" gutterBottom mt={5}>
                    Our Community Partners
                </Typography>
                <Typography variant="body1" paragraph mt={2}>
                    Our community partners bring local insights and on-the-ground support,
                    helping us<br /> connect with and empower the individuals who need it most
                </Typography>
                <ImageBox />
                <GreenBox />
                <CommunityForm />
                <StayConnected />
            </Container>
        </>
    )
}
export default CommunityPartners;