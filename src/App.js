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
import AdminNgo from './Dashboard/AdminNgo';
// import NgoDetails from './Dashboard/AdminNgo/NgoDetails';
import TabNavigation from './Dashboard/AdminNgo/TabNavigation';
import BeneficiaryData from './Dashboard/BeneficiaryData';
import MouUpload from "./Pages/MouUpload/MouUpload";
import BeneficiaryProfile from "./Pages/BeneficiaryProfile/BeneficiaryProfile";

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
              <Route path="/ngo" element={<CompanySelection />} />
              <Route path="/ngoregistration/:donorId" element={ <NgoForm />} />
              <Route path='/ngoregistration' element={<NgoForm />} />
              <Route path="/Opslogin" element={<Opslogin />} />
              <Route path="/donormanager" element={<DonorManager />} />
              <Route path='/allngo' element={<AdminNgo/>} />
              <Route path='/mouUpload' element={<MouUpload/>} />
              <Route path='/beneficiaryProfile' element={<BeneficiaryProfile/>} />
              <Route path="/allngo/:id" element={<TabNavigation />} />
              <Route path="/laptopinventory" 
              element={
                <PrivateRoute>
                   <LaptopInventory />
                </PrivateRoute>
               }
                />
                <Route path="/beneficiarydata" element={<BeneficiaryData />} />

               <Route path="/user-details" 
               element={
                <PrivateRoute>
                  <Userdata />
                </PrivateRoute>}
                />
              <Route
                path="/data-assignment-form"
                element={
                  <PrivateRoute>
                    <DataAssignmentForm />
                  </PrivateRoute> 
                }
              />
            
              <Route
                path="/dashboard"
                element={
                  // <PrivateRoute>
                    <DashboardPage />
                  // {/* </PrivateRoute> */}
                }
              />
              <Route
                path="/ops"
                element={
                  <PrivateRoute>
                    <Ops />
                  </PrivateRoute>
                }
              />
              <Route
                path="/laptop-tagging"
                element={
                  <PrivateRoute>
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


