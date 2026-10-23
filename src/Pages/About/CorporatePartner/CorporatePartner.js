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
                    into life-changing tools for underserved communities. With over <strong>17,000+ laptops refurbished and deployed</strong>, 
                    certified DoD/NIST data sanitization, and Section 80G tax benefit certificates, we help leading businesses achieve ESG compliance and measurable digital education impact.
                </Typography>
                <CompanyLogo />
                <CorporateForm />
            </Container>
            <StayConnected />
        </>
    )
}
export default CorporatePartner;