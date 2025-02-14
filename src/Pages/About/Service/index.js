
import ServiceCards from './ServiceCards';
import StatsSection from './StatsSection';
import HeaderText from './HeaderText';
import {  Container} from '@mui/material';

const Service = () => {
    return (
        <Container maxWidth="lg">
            <HeaderText />
            <ServiceCards />
            <StatsSection />
        </Container>
    );
};

export default Service;