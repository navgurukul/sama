import { Container, Typography} from "@mui/material";
import StayConnected from '../../../common/StayConnected'
import ourteam from '../OurTeam/style';
import CompanyLogo from "./CompanyLogo";
import CorporateForm from './CorporateForm'

const CorporatePartner = () => {
    return (
        <>
            <Container maxWidth="lg" sx={ourteam.container}>
                <Typography component="h1" variant="h5" gutterBottom >
                    Our Corporate Partners
                </Typography>
                <Typography variant="body1" paragraph>
                    Our corporate partners enable us to turn retired laptops 
                    into life-changing tools for underserved communities, 
                    fostering digital education, career opportunities, and sustainable e-waste solutions.
                </Typography>
                <CompanyLogo />
                <CorporateForm />
            </Container>
            <StayConnected />
        </>
    )
}
export default CorporatePartner;