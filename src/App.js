import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from "@mui/material/styles";
import theme from './theme/theme';
import Navbar from './components/Header/Navbar';
import Footer from './components/Footer/Footer';
import Home from './Pages/Home/Home';
import About from './Pages/About/About';
import GiveToday from './Pages/GiveToday';
import OurApproach from './Pages/OurApproach/OurApproach';
import Donate from './Pages/Donate/Donate';

import './App.css';
// import Commingsoon from './Commingsoon'
// import EnvironmentalImpact from './Dashboard/EnvironmentalImpact'

function App() {
  return (
      
    <ThemeProvider theme={theme}>
      <Router>
      <div className="layout">
      <Navbar/>
          <div className="content">
            {" "}
            
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/give-today" element={<GiveToday />} />
        <Route path="/our-approach" element={<OurApproach />} />
        <Route path="/donate" element={<Donate />} />
      </Routes>
            {" "}
            
          </div>
          <Footer/>
        </div>
        </Router>
  </ThemeProvider>
  );
}

export default App;
