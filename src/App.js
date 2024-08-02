import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from "@mui/material/styles";
import theme from './theme/theme';
import Footer from './components/Footer';
import Home from './components/Home/Home'
import Navbar from './components/Header/Navbar';
import About from './components/About';
import GiveToday from './components/GiveToday';
import OurApproach from './components/OurApproach/OurApproach';
import './App.css';
import Commingsoon from './Commingsoon'
import EnvironmentalImpact from './EnvironmentalImpact'
function App() {
  return (
    <EnvironmentalImpact />
   
  //   <ThemeProvider theme={theme}>
  //     <Router>
  //     <div className="layout">
  //     <Navbar/>
  //         <div className="content">
  //           {" "}
            
  //     <Routes>
  //       <Route path="/" element={<Home />} />
  //       <Route path="/about" element={<About />} />
  //       <Route path="/give-today" element={<GiveToday />} />
  //       <Route path="/our-approach" element={<OurApproach />} />
  //     </Routes>
  //           {" "}
            
  //         </div>
  //         <Footer/>
  //       </div>
  //       </Router>
  // </ThemeProvider>
  );
}

export default App;
