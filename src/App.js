import React, { Suspense, lazy } from 'react';
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
import EditorialNotFound from './Pages/Editorial/EditorialNotFound';
import EditorialLogin from './Pages/Login/OpsLogin/EditorialLogin';
import EditorialSignup from './Pages/Login/OpsLogin/EditorialSignup';
import EditorialNgoRegistration from './Pages/NGORegistration/EditorialNgoRegistration';
import PrivacyPolicy from './Pages/PrivacyPolicy';
import OurGoverment from './Pages/About/OurGoverment/OurGoverment';
import CommunityPartners from './Pages/About/CommunityPartners/CommunityPartners';
import PrivateRoute from './Privaterouts';
import DonorCSRRoute from './Pages/DonerCSR/DonorCSRRoute';
import SeoRouter from './components/SEO/SeoRouter';
import './App.css';

// Lazy-load heavy internal operational dashboards & admin tools on demand
const DashboardPage = lazy(() => import('./Dashboard'));
const MacRearch = lazy(() => import('./Pages/LaptopTagging'));
const DataAssignmentForm = lazy(() => import('./Pages/LaptopData/LaptopData'));
const LaptopInventory = lazy(() => import('./Pages/LaptopData/index'));
const Userdata = lazy(() => import('.././src/OppsFiles/UserDetails/Userdata'));
const CompanySelection = lazy(() => import('./Pages/NGORegistration/CompanySelection'));
const DonorManager = lazy(() => import('./Pages/NGORegistration/DonorManager'));
const SchoolManagement = lazy(() => import('./components/OPS/SchoolManagement'));
const AdminNgo = lazy(() => import('./Dashboard/AdminNgo'));
const TabNavigation = lazy(() => import('./Dashboard/AdminNgo/TabNavigation'));
const BeneficiaryData = lazy(() => import('./Dashboard/BeneficiaryData'));
const MouUpload = lazy(() => import('./Pages/MouUpload/MouUpload'));
const BeneficiaryProfileSub = lazy(() => import('./Dashboard/BeneficiaryData/BeneficiaryProfile'));
const BeneficiaryProfile = lazy(() => import('./Pages/BeneficiaryProfile/BeneficiaryProfile'));
const EditUserPage = lazy(() => import('./Dashboard/BeneficiaryData/EditUser/EditUserPage'));
const DocumentUpload = lazy(() => import('./components/DocumentUpload/DocumentUpload'));
const AttentionNeeded = lazy(() => import('./components/AttentionNeeded/AttentionNeeded'));
const DocumentReupload = lazy(() => import('./Pages/DocumentReupload/DocumentReupload'));
const PreliminaryForm = lazy(() => import('./Dashboard/Preliminary/PreliminaryForm'));
const Preliminary = lazy(() => import('./Dashboard/Preliminary'));
const MonthlyReportingForm = lazy(() => import('./Dashboard/Preliminary/MothlyReportingForm'));
const MonthlyForm = lazy(() => import('./Dashboard/MontlyReport/MothlyForm'));
const SubmissionSuccess = lazy(() => import('./components/SubmissionSuccess/SubmissionSuccess'));
const MonthlyEditForm = lazy(() => import('./Dashboard/MontlyReport/MonthlyEditForm'));
const NgoProfile = lazy(() => import('./Dashboard/AdminNgo/NgoProfile'));
const MonthlyReportData = lazy(() => import('./Dashboard/Preliminary/MonthlyReportData'));
const YearlyEditForm = lazy(() => import('./Dashboard/YearlyReport/YearlyEditForm'));
const YearlyForm = lazy(() => import('./Dashboard/YearlyReport/YearlyForm'));
const YearlyReportingForm = lazy(() => import('./Dashboard/Preliminary/YearlyReportingForm'));
const YearlyReportData = lazy(() => import('./Dashboard/Preliminary/YearlyReportData'));
const CorporateteDb = lazy(() => import('./CorporateDB/index'));
const DetailView = lazy(() => import('./CorporateDB/MonthlyImpact/DetailView'));
const NGOTrainedTable = lazy(() => import('./CorporateDB/YearlyImpact/NGOTrainedTable'));
const OpsWelcome = lazy(() => import('./components/OPS/OpsWelcome'));
const Audit = lazy(() => import('./components/OPS/LaptopAudit'));
const LearningAnalytics = lazy(() => import('./components/OPS/LearningAnalytics'));
const LaptopDetails = lazy(() => import('./Pages/LaptopTagging/LaptopDetails'));
const LaptopStageDetails = lazy(() => import('./Pages/LaptopTagging/LaptopStageDetails'));
const Registration = lazy(() => import('./components/Header/Registration'));
const Sidebar = lazy(() => import('./Pages/DonerCSR/SideBar'));
const Overview = lazy(() => import('./Pages/DonerCSR/Overview'));
const LaptopPipeline = lazy(() => import('./Pages/DonerCSR/LaptopPipeline'));
const LaptopTracking = lazy(() => import('./Pages/DonerCSR/LaptopTracking'));
const ImpactAnalysis = lazy(() => import('./Pages/DonerCSR/ImpactAnalysis'));
const Ngopartner = lazy(() => import('./Pages/DonerCSR/Ngopartner'));
const Pickup = lazy(() => import('./Pages/Pickup/Pickup'));
const PickupRequestByDoner = lazy(() => import('./Pages/Pickup/PickupRequestByDoner'));
const TableView = lazy(() => import('./Pages/DonerCSR/TableView'));
const RMSDetails = lazy(() => import('./Pages/DonerCSR/RMSDetails'));
const RMSControlPanel = lazy(() => import('./Pages/DonerCSR/RMSControlPanel'));
const RMSDonorDetailsNGOs = lazy(() => import('./Pages/DonerCSR/RMSDonorDetailsNGOs'));
const RMSDonorDetailsDonors = lazy(() => import('./Pages/DonerCSR/RMSDonorDetailsDonors'));

const RouteLoadingFallback = () => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ width: 36, height: 36, border: '3px solid rgba(92,120,90,0.2)', borderTopColor: '#5C785A', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <SeoRouter />
        <div className="layout">
          <SmartHeader />
          <div className="content">
            <Suspense fallback={<RouteLoadingFallback />}>
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
              <Route path="/communications" element={<Communications />} />
              <Route path="/comms" element={<Navigate to="/communications" replace />} />
              <Route path="/contact" element={<EditorialContact />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/blog/beyond-connectivity" element={<BlogBeyondConnectivity />} />
              <Route path="/blog/from-e-waste-to-new-beginnings" element={<BlogEWaste />} />
              <Route path="/blog/rethinking-digital-inclusion" element={<BlogRethinkingInclusion />} />
              <Route path="/donate" element={<EditorialDonate />} />
              <Route path="/corporatepartner" element={<Navigate to="/donate" replace />} />
              <Route path="/corporate-partners" element={<Navigate to="/donate" replace />} />
              <Route path="/ngo-information" element={<EditorialCorporate />} />
              <Route path="/statutory-disclosures" element={<EditorialCorporate />} />
              <Route path="/about" element={<Navigate to="/" replace />} />
              <Route path="/ngoregistration/:donorId" element={<EditorialNgoRegistration />} />
              <Route path='/ngoregistration' element={<EditorialNgoRegistration />} />
              <Route path="/login" element={<EditorialLogin />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/about-initiative" element={<Navigate to="/initiatives" replace />} />
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

              <Route path="/donorcsr/*" element={<EditorialNotFound />} />
              <Route path="/donarcsr" element={<Navigate to="/donorcsr/overview" replace />} />
              <Route path="/donarcsr/*" element={<Navigate to="/donorcsr/overview" replace />} />


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
              <Route path="/our-government" element={<OurGoverment />} />
              <Route path="/ourgoverment" element={<Navigate to="/our-government" replace />} />
              <Route path="/communitypartners" element={<CommunityPartners />} />
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
              <Route path="*" element={<EditorialNotFound />} />
            </Routes>
            </Suspense>
          </div>
          <SmartFooter />
        </div>
      </Router>
    </ThemeProvider >
  );
}
export default App;


