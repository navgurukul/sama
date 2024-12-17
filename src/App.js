import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from "@mui/material/styles";
import theme from './theme/theme';
import Navbar from './components/Header/Navbar';
import Footer from './components/Footer/Footer';
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
import Opslogin from './Pages/Login/OpsLogin/Opslogin';
import PrivateRoute from './Privaterouts';
import NgoForm from "../src/Pages/NGORegistration/RegistrationForm"
import CompanySelection from './Pages/NGORegistration/CompanySelection';
import DonorManager from './Pages/NGORegistration/DonorManager';
import Ngodashboard from './components/NgoDashboard/ngodashboard';
import Admin from './components/adminDashboard/Admin';
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
import PrivacyPolicy from './Pages/PrivacyPolicy';

function App() {
  return (
    <ThemeProvider theme={theme}>
     <Router>
        <div className="layout">
          <Navbar />
          <div className="content">
            {" "}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/our-approach" element={<OurApproach />} />
              <Route path="/donate" element={<Donate />} />
              <Route path="/ngoregistration/:donorId" element={ <NgoForm />} />
              <Route path='/ngoregistration' element={<NgoForm />} />  {/* // this is for all the ngo's */}
              <Route path="/login" element={<Opslogin />} /> {/* // need to rename this component */}
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/donormanager" element={<DonorManager />} /> {/* this is to add the manege the donor data*/}
              <Route path="/question-selection" element={    
                <PrivateRoute reqired={'ops'}>
                <CompanySelection />
                </PrivateRoute> 
                } />  {/* // this is to select the doner for the ngo Questions, need to rename the route */}

                {/* <Route path="/preliminary-distribution" element={<PreliminaryForm />} /> */}
              <Route path="/preliminary" element={<Preliminary />} />
              {/* <Route path="/monthly-reporting" element={<MonthlyReportingForm />} /> */}
              <Route 
              path="/preliminary-distribution" 
              element={
                <PrivateRoute reqired={'ngo'}>
                   <PreliminaryForm/>
                 </PrivateRoute>
               }
                />                
              {/* <Route path='/allngo' element={<AdminNgo/>} /> */}
              <Route 
              path="/ngo" 
              element={
                <PrivateRoute reqired={'admin'}>
                   <AdminNgo/>
                 </PrivateRoute>
               }
                />
                <Route path="/ngo/:id" element={<TabNavigation />} />
              <Route path='/mouUpload' element={<MouUpload/>} />
              <Route path='/beneficiaryProfile' element={<BeneficiaryProfile/>} />
              {/* <Route path="/allngo/:id" element={<TabNavigation />} /> */}
              {/* <Route path="/admin-dashboard/:id" element={<TabNavigation />} /> */}
              {/* <Route path="/beneficiarydata" element={<BeneficiaryData />} /> */}
              {/* <Route path="/fileuploadform" element={<Ngodashboard />} /> */}
              {/* <Route path="/documentupload" element={<DocumentUpload />} /> */}
              {/* <Route path="/documentreupload" element={<DocumentReupload />} /> */}
              {/* <Route path="/attentionneeded" element={<AttentionNeeded />} /> */}
                <Route path='/userdetails/:id' element={<BeneficiaryProfileSub />} />
              <Route path="/laptopinventory" 
              element={
                <PrivateRoute reqired={'ops'}>
                   <LaptopInventory />
                </PrivateRoute>
               }
                />
                {/* <Route path="/documentupload" element={<DocumentUpload />} /> */}
                <Route 
                // path="/ngo-dashboard" 
                path="/documentupload"
              element={
                <PrivateRoute reqired={'ngo'}>
                  <DocumentUpload />
                   {/* <Ngodashboard /> */}
                </PrivateRoute>
               }
                />
                <Route 
                // path="/ngo-dashboard" 
                path="/beneficiarydata"
              element={
                <PrivateRoute reqired={'ngo'}>
                  < BeneficiaryData/>
                   {/* <Ngodashboard /> */}
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
              
              
              <Route
                path="/ops"
                element={
                  <PrivateRoute reqired={'ops'}> 
                    <Ops />
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
            </Routes>
            {" "}
          </div>
          <Footer />
        </div>
      </Router>
      

    </ThemeProvider>
  );
}
export default App;


