import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from "@mui/material/styles";
import theme from './theme/theme';
import Navbar from './components/Header/Navbar';
import Footer from './components/Footer/Footer';
import Home from './Pages/Home';
import About from './Pages/About/About';
import GiveToday from './Pages/GiveToday';
import OurApproach from './Pages/OurApproach/OurApproach';
import Donate from './Pages/Donate/Donate';
import DashboardPage from "./Dashboard/index"
import './App.css';
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
              <Route path="/give-today" element={<GiveToday />} />
              <Route path="/our-approach" element={<OurApproach />} />
              <Route path="/donate" element={<Donate />} />
              <Route path="/dashboard" element={< DashboardPage/>} />
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



