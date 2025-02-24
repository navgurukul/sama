import { Container, Typography} from "@mui/material";
import StayConnected from '../../../common/StayConnected'
import ourteam from '../OurTeam/style';
import CompanyLogo from "./CompanyLogo";
import CorporateForm from './CorporateForm'

const CorporatePartner = () => {
    return (
        <>
            <Container maxWidth="lg" sx={ourteam.container}>
                <Typography variant="h5" gutterBottom >
                    Our Corporate Partners
                </Typography>
                <Typography variant="body1" paragraph>
                    Our corporate partners enable us to turn unused laptops 
                    into life-changing tools for<br/> underserved communities, 
                    fostering education, employment, and sustainability
                </Typography>
                <CompanyLogo />
                <CorporateForm />
            </Container>
            <StayConnected />
        </>
    )
}
export default CorporatePartner;