import BgVideoPage from "./BgVideoPage";
import Overview from "./Overview/index";
import SamaGoals from "./SamaGoals";
import StayConnected from '../../common/StayConnected'
import ServicesSection from "./Service";
import { 
  Container,
 } from '@mui/material';
import ourteam from '../../Pages/About/OurTeam/style';



function About() {
  return (
    <>
      <Container maxWidth="lg" sx={ourteam.container}>
        <BgVideoPage></BgVideoPage>
        {/* <Overview></Overview> */}
        {/* <SamaGoals></SamaGoals> */}
      </Container>
      <ServicesSection></ServicesSection>

      <StayConnected />
    </>
  )
}
export default About;