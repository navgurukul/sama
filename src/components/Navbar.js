import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Link, Container } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import './Navbar.css';

const Navbar = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuItems, setMenuItems] = useState([
    { text: 'HOME', href: '/' },
    { text: 'ABOUT', href: '/about' },
    { text: 'OUR ROOTS', href: '/our-roots' },
    { text: 'WHY AGROECOLOGY', href: '/agrogcology' },
    { text: 'GRANTMAKING', href: '/grantmaking' },
    { text: "BAF'S VALUE TO FUNDERS", href: '/founders' },
    { text: 'JOIN HANDS', href: '/join' }
  ]);


  const handleMenuToggle = () => {
    setMenuVisible(!menuVisible);
  };

  return (
    <AppBar position="static" color="default" className="header">
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', position: 'relative' }}>
          <Box component="img" src="https://st2.depositphotos.com/4035913/6124/i/450/depositphotos_61243733-stock-illustration-business-company-logo.jpg" alt="Logo" className="header-logo" />
          <Box className={`nav-links ${menuVisible ? 'visible' : ''}`}>
            {menuItems.map((item, index) => (
               <Link href={item.href} className="nav-link" key={index}>
                 <Typography variant="body1">{item.text}</Typography>
               </Link>
             ))}
          </Box>
          <Box className="mobile-nav">
             <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMenuToggle}
            >
              {menuVisible ? <CloseIcon /> : <MoreVertIcon />}
            </IconButton>
            
          </Box>
        </Toolbar>
        <Box className={`mobile-menu ${menuVisible ? 'visible' : ''}`}>
          {menuItems.map((item, index) => (
            <Link href={item.href} className="nav-link" key={index}>
              <Typography variant="body1">{item.text}</Typography>
            </Link>
          ))}
        </Box>
      </Container>
    </AppBar>
  );
};

export default Navbar;




