import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider } from "@mui/material/styles";
import theme from './theme/theme';
import SmartHeader from './components/Header/SmartHeader';
import SmartFooter from './components/Footer/SmartFooter';
import EditorialHome from './Pages/Editorial/EditorialHome';
import Initiatives from './Pages/Editorial/Initiatives';
import SamaSaathi from './Pages/Editorial/SamaSaathi';
import AiLabs from './Pages/Editorial/AiLabs';
import GivingBack from './Pages/Editorial/GivingBack';
import FirstLaptop from './Pages/Editorial/FirstLaptop';
import BuildForGood from './Pages/Editorial/BuildForGood';
import EditorialTeam from './Pages/Editorial/EditorialTeam';
import Communications from './Pages/Editorial/Communications';
import BlogPost from './Pages/Editorial/BlogPost';
import BlogBeyondConnectivity from './Pages/Editorial/BlogBeyondConnectivity';
import BlogEWaste from './Pages/Editorial/BlogEWaste';
import BlogRethinkingInclusion from './Pages/Editorial/BlogRethinkingInclusion';
import EditorialDonate from './Pages/Editorial/EditorialDonate';
import EditorialContact from './Pages/Editorial/EditorialContact';
import EditorialCorporate from './Pages/Editorial/EditorialCorporate';
import Home from './Pages/Home';
import About from './Pages/About/About';
import OurApproach from './Pages/OurApproach/OurApproach';
import Donate from './Pages/Donate/Donate';
import DashboardPage from './Dashboard';
import MacRearch from './Pages/LaptopTagging';
import DataAssignmentForm from './Pages/LaptopData/LaptopData';
import './App.css';
import LaptopInventory from './Pages/LaptopData/index';
import Ops from './components/OPS/index';
import './App.css';
import Userdata from ".././src/OppsFiles/UserDetails/Userdata"
import EditorialLogin from './Pages/Login/OpsLogin/EditorialLogin';
import PrivateRoute from './Privaterouts';
import EditorialNgoRegistration from './Pages/NGORegistration/EditorialNgoRegistration';
import CompanySelection from './Pages/NGORegistration/CompanySelection';
import DonorManager from './Pages/NGORegistration/DonorManager';
import Ngodashboard from './components/NgoDashboard/ngodashboard';
import Admin from './components/adminDashboard/Admin';
import SchoolManagement from './components/OPS/SchoolManagement';
import AdminNgo from './Dashboard/AdminNgo';
// import NgoDetails from './Dashboard/AdminNgo/NgoDetails';
import TabNavigation from './Dashboard/AdminNgo/TabNavigation';
import BeneficiaryData from './Dashboard/BeneficiaryData';
import MouUpload from "./Pages/MouUpload/MouUpload";
import BeneficiaryProfileSub from "./Dashboard/BeneficiaryData/BeneficiaryProfile"
import BeneficiaryProfile from "./Pages/BeneficiaryProfile/BeneficiaryProfile";
import EditUserPage from './Dashboard/BeneficiaryData/EditUser/EditUserPage';
import DocumentUpload from './components/DocumentUpload/DocumentUpload';
import AttentionNeeded from './components/AttentionNeeded/AttentionNeeded';
import DocumentReupload from './Pages/DocumentReupload/DocumentReupload';
// import Ngodashboard from "./components/NgoDashboard/ngodashboard";
import PreliminaryForm from './Dashboard/Preliminary/PreliminaryForm';
import Preliminary from './Dashboard/Preliminary';
import MonthlyReportingForm from './Dashboard/Preliminary/MothlyReportingForm';
import MonthlyForm from './Dashboard/MontlyReport/MothlyForm';
import SubmissionSuccess from './components/SubmissionSuccess/SubmissionSuccess';
import MonthlyEditForm from './Dashboard/MontlyReport/MonthlyEditForm';
import NgoProfile from './Dashboard/AdminNgo/NgoProfile';
import MonthlyReportData from './Dashboard/Preliminary/MonthlyReportData';
import PrivacyPolicy from './Pages/PrivacyPolicy';
import LandingPage from './Pages/LandingPage';
import YearlyEditForm from './Dashboard/YearlyReport/YearlyEditForm';
import YearlyForm from './Dashboard/YearlyReport/YearlyForm';
import YearlyReportingForm from './Dashboard/Preliminary/YearlyReportingForm';
import YearlyReportData from './Dashboard/Preliminary/YearlyReportData';
import CorporateteDb from './CorporateDB/index';
import DetailView from './CorporateDB/MonthlyImpact/DetailView';
import NGOTrainedTable from './CorporateDB/YearlyImpact/NGOTrainedTable';
import OurTeam from './Pages/About/OurTeam/OurTeam';
import OurGoverment from './Pages/About/OurGoverment/OurGoverment';
import CommunityPartners from './Pages/About/CommunityPartners/CommunityPartners';
import CorporatePartner from './Pages/About/CorporatePartner/CorporatePartner';
import OpsWelcome from './components/OPS/OpsWelcome';
import SeoRouter from './components/SEO/SeoRouter';
import Audit from './components/OPS/LaptopAudit';
import LearningAnalytics from './components/OPS/LearningAnalytics';
import LaptopDetails from "./Pages/LaptopTagging/LaptopDetails";
import LaptopStageDetails from './Pages/LaptopTagging/LaptopStageDetails';
import EditorialSignup from './Pages/Login/OpsLogin/EditorialSignup';
import Registration from './components/Header/Registration';
import Sidebar from './Pages/DonerCSR/SideBar';
import Overview from './Pages/DonerCSR/Overview';
import LaptopPipeline from './Pages/DonerCSR/LaptopPipeline';
import LaptopTracking from './Pages/DonerCSR/LaptopTracking';
import ImpactAnalysis from './Pages/DonerCSR/ImpactAnalysis';
import Ngopartner from './Pages/DonerCSR/Ngopartner';
import Pickup from './Pages/Pickup/Pickup';
import DonorCSRRoute from './Pages/DonerCSR/DonorCSRRoute';
import PickupRequestByDoner from './Pages/Pickup/PickupRequestByDoner';
import TableView from './Pages/DonerCSR/TableView';
import RMSDetails from './Pages/DonerCSR/RMSDetails';
import RMSControlPanel from './Pages/DonerCSR/RMSControlPanel';
import RMSDonorDetailsNGOs from './Pages/DonerCSR/RMSDonorDetailsNGOs';
import RMSDonorDetailsDonors from './Pages/DonerCSR/RMSDonorDetailsDonors';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <SeoRouter />
        <div className="layout">
          <SmartHeader />
          <div className="content">
            {" "}
            <Routes>
              <Route path="/" element={<EditorialHome />} />
              <Route path="/initiatives" element={<Initiatives />} />
              <Route path="/sama-saathi" element={<SamaSaathi />} />
              <Route path="/our-approach" element={<SamaSaathi />} />
              <Route path="/labs" element={<AiLabs />} />
              <Route path="/giving" element={<GivingBack />} />
              <Route path="/first-laptop" element={<FirstLaptop />} />
              <Route path="/bfg" element={<BuildForGood />} />
              <Route path="/build-for-good" element={<BuildForGood />} />
              <Route path="/ourteam" element={<EditorialTeam />} />
              <Route path="/team" element={<EditorialTeam />} />
              <Route path="/comms" element={<Communications />} />
              <Route path="/contact" element={<EditorialContact />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/blog/beyond-connectivity" element={<BlogBeyondConnectivity />} />
              <Route path="/blog/from-e-waste-to-new-beginnings" element={<BlogEWaste />} />
              <Route path="/blog/rethinking-digital-inclusion" element={<BlogRethinkingInclusion />} />
              <Route path="/donate" element={<EditorialDonate />} />
              <Route path="/corporatepartner" element={<EditorialCorporate />} />
              <Route path="/about" element={<EditorialHome />} />
              <Route path="/ngoregistration/:donorId" element={<EditorialNgoRegistration />} />
              <Route path='/ngoregistration' element={<EditorialNgoRegistration />} />
              <Route path="/login" element={<EditorialLogin />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/about-initiative" element={<LandingPage />} />
              <Route path="/donormanager" element={<DonorManager />} /> {/* this is to add the manege the donor data*/}
              <Route path="/corporate" element={<CorporateteDb />} />
              <Route path="/corpretedb/DataViewDetail" element={<DetailView />} />
              <Route path="/corpretedb/NGOTrainedTable" element={<NGOTrainedTable />} />
              <Route
                path="/pickup-request-by-donor"
                element={
                  <PrivateRoute reqired={'admin'}>
                    <PickupRequestByDoner />
                  </PrivateRoute>
                }
                caseSensitive={false}
              />



              <Route
                path="/donorcsr"
                element={
                  <DonorCSRRoute>
                    <Sidebar />
                  </DonorCSRRoute>
                }
              >
                <Route index element={<Overview />} />
                <Route path="overview" element={<Overview />} />
                <Route path="laptop-pipeline" element={<LaptopPipeline />} />
                <Route path="laptop-tracking" element={<LaptopTracking />} />
                <Route path="partners" element={<Ngopartner />} />
                <Route path="impact-analytics" element={<ImpactAnalysis />} />
                <Route path="rms-details" element={<RMSDetails />} />
                <Route path="rms-control-panel" element={<RMSControlPanel />} />
                <Route path="rms-donor-details-ngos" element={<RMSDonorDetailsNGOs />} />
                <Route path="rms-donor-details-donors" element={<RMSDonorDetailsDonors />} />
                <Route path="school-management" element={<SchoolManagement />} />
              </Route>

              {/* <Route path="/donorcsr/:donorName" element={<Sidebar />}>
                <Route path="/donorcsr/:donorName/overview" element={<Overview />} />
                <Route path="/donorcsr/:donorName/laptop-pipeline" element={<LaptopPipeline />} />
                <Route path="/donorcsr/:donorName/partners" element={<Ngopartner />} />
                <Route path="/donorcsr/:donorName/laptop-tracking" element={<LaptopTracking />} />
                <Route path="/donorcsr/:donorName/impact-analytics" element={<LaptopTracking />} />
              </Route>
             */}

              <Route
                path="/donorcsr/table-view"
                element={
                  <DonorCSRRoute>
                    <TableView />
                  </DonorCSRRoute>
                }
              />
              <Route
                path="/donorcsr/:donorName/table-view"
                element={
                  <DonorCSRRoute>
                    <TableView />
                  </DonorCSRRoute>
                }
              />

              <Route path="/donorcsr/*" element={<h2>Page Not Found</h2>} />
              <Route path="*" element={<h2>Page Not Found</h2>} />


              <Route path="/question-selection" element={
                <PrivateRoute reqired={'ops'}>
                  <CompanySelection />
                </PrivateRoute>
              } />  {/* // this is to select the doner for the ngo Questions, need to rename the route */}
              <Route path="/submission-success" element={<SubmissionSuccess />} />
              <Route path="/preliminary" element={
                // <Preliminary />
                <PrivateRoute reqired={'ngo'} ngoType="1 to many" >
                  <Preliminary />
                </PrivateRoute>
              } />
              <Route path="/monthly-reporting" element={
                // <MonthlyReportingForm />
                <PrivateRoute reqired={'ngo'} ngoType="1 to many" >
                  <MonthlyReportingForm />
                </PrivateRoute>
              } />
              <Route path="monthly-report" element={
                // <MonthlyReportData />
                <PrivateRoute reqired={'ngo'} ngoType="1 to many" >
                  <MonthlyReportData />
                </PrivateRoute>
              } />
              <Route
                path="/preliminary-distribution"
                element={
                  <PrivateRoute reqired={'ngo'} ngoType="1 to many" >
                    <PreliminaryForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/ngo"
                element={
                  <PrivateRoute reqired={'admin'}>
                    <AdminNgo />
                  </PrivateRoute>
                }
              />
              <Route path="/ngo/:id" element={<TabNavigation />} />

              <Route path='/mouUpload' element={<MouUpload />} />
              <Route path='/beneficiaryProfile' element={
                <PrivateRoute reqired={'ngo'} ngoType="1 to one" >
                  <BeneficiaryProfile />
                </PrivateRoute>
                // <BeneficiaryProfile/>
              } />
              <Route path="/monthly-reporting/:id" element={<MonthlyForm />} />
              <Route path="/edit-form/:id" element={<MonthlyEditForm />} />
              <Route path="/laptop-with-issues" element={<OpsWelcome />} />
              <Route path="/audit" element={<Audit />} />
              <Route path="/afe" element={
                <PrivateRoute reqired={'school'}>
                  <LearningAnalytics />
                </PrivateRoute>
              } />

              {/* <Route path="/allngo/:id" element={<TabNavigation />} /> */}
              {/* <Route path="/admin-dashboard/:id" element={<TabNavigation />} /> */}
              {/* <Route path="/fileuploadform" element={<Ngodashboard />} /> */}
              <Route path="/ngoprofile" element={<NgoProfile />} />
              <Route path="/ourteam" element={<OurTeam />} />
              <Route path="/our-government" element={<OurGoverment />} />
              <Route path="/ourgoverment" element={<Navigate to="/our-government" replace />} />
              <Route path="/communitypartners" element={<CommunityPartners />} />
              <Route path="/corporatepartner" element={<CorporatePartner />} />
              <Route path="/documentreupload" element={<DocumentReupload />} />
              <Route path="/attentionneeded" element={<AttentionNeeded />} />
              <Route path='/userdetails/:id' element={<BeneficiaryProfileSub />} />
              <Route path="/laptopinventory"
                element={
                  <PrivateRoute reqired={'ops'}>
                    <LaptopInventory />
                  </PrivateRoute>
                }
              />
              <Route
                path="/documentupload"
                element={
                  <PrivateRoute reqired={'ngo'}>
                    <DocumentUpload />
                  </PrivateRoute>
                }
              />
              <Route
                path="/beneficiarydata"
                element={
                  <PrivateRoute reqired={'ngo'} ngoType="1 to one">
                    < BeneficiaryData />
                  </PrivateRoute>
                }
              />

              <Route path="/user-details"
                element={
                  // <PrivateRoute reqired={'ops'} >
                  <Userdata />
                  // </PrivateRoute>
                }
              />
              <Route
                path="/data-assignment-form"
                element={
                  <PrivateRoute reqired={'ops'}>
                    <DataAssignmentForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute reqired={'ngo'}>
                    <DashboardPage />
                  </PrivateRoute>
                }
              />
              <Route path="/edit-user/:id" element={<EditUserPage />} />
              <Route path="/signup" element={<EditorialSignup />} />
              <Route path="/registration" element={<Registration />} />

              <Route path="/yearly-reporting/:id" element={
                <PrivateRoute reqired={'ngo'} ngoType="1 to many">
                  < YearlyForm />
                </PrivateRoute>
                // <YearlyForm />
              } />
              <Route path="/edit-yearly-form/:id" element={
                <PrivateRoute reqired={'ngo'} ngoType="1 to many">
                  < YearlyEditForm />
                </PrivateRoute>

                // <YearlyEditForm />
              } />
              <Route path="/Yearly-reporting" element={
                <PrivateRoute reqired={'ngo'} ngoType="1 to many">
                  < YearlyReportingForm />
                </PrivateRoute>
                // <YearlyReportingForm/>
              } />
              <Route path="/Yearly-report" element={
                <PrivateRoute reqired={'ngo'} ngoType="1 to many">
                  < YearlyReportData />
                </PrivateRoute>
                // <YearlyReportData />
              } />


              <Route
                path="/ops"
                element={
                  <PrivateRoute reqired={'ops'}>
                    <LaptopDetails />
                  </PrivateRoute>
                }
              />  {/* // only ops team can access this to oprate the things */}
              <Route
                path="/laptop-tagging"
                element={
                  <PrivateRoute reqired={'ops'}>
                    <MacRearch />
                  </PrivateRoute>
                }
              />
              <Route
                path="/laptop-stage/:id"
                element={
                  <PrivateRoute reqired={'ops'}>
                    <LaptopStageDetails />
                  </PrivateRoute>
                }
              />
              <Route path="/pickup" element={<Pickup />} />
            </Routes>
            {" "}
          </div>
          <SmartFooter />
        </div>
      </Router>
    </ThemeProvider >
  );
}
export default App;


