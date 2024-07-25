import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from "@mui/material/styles";
import theme from './theme/theme';
import Footer from './components/Footer';
import Home from './components/Home';
import Navbar from './components/Header/Navbar';
import About from './components/About';
import './App.css';
import Commingsoon from './Commingsoon'
function App() {
  return (
   <div>
    <Commingsoon />
   </div>
  //   <ThemeProvider theme={theme}>
  //     <Router>
  //     <div className="layout">
  //     <Navbar/>
  //         <div className="content">
  //           {" "}
            
  //     <Routes>
  //       <Route path="/" element={<Home />} />
  //       <Route path="/about" element={<About />} />
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
