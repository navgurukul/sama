import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from "@mui/material/styles";
import theme from './theme/theme';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
// import About from './components/About';  
// import Projects from './components/Projects';
// import Contact from './components/Contact';
import './App.css';

function App() {
  return (
   
    <ThemeProvider theme={theme}>
      <div className="layout">
      <Navbar/>
          <div className="content">
            {" "}
            <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/about" element={<About />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/contact" element={<Contact />} /> */}
      </Routes>
            {" "}
            </Router>
          </div>
          <Footer/>
        </div>
     
    
  </ThemeProvider>
  );
}

export default App;
