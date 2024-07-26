import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Link as MuiLink, Container } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeTab, setActiveTab] = useState(location.pathname);

  const menuItems = [
    { text: 'HOME', href: '/' },
    { text: 'ABOUT', href: '/about' },
    { text: 'Our Approach', href: '/our-approach' },
    { text: 'Give Today', href: '/give-today' },
    
   
  ];

  const handleMenuToggle = () => {
    setMenuVisible(!menuVisible);
  };

  const handleTabClick = (href) => {
    setActiveTab(href);
    setMenuVisible(false); 
  };

  return (
    <AppBar position="static"
      sx={{ backgroundColor: '#ffffff', boxShadow: 'none',
         height: {
          md: '91.4531px', 
          lg: '91.4531px', 
        },
        justifyContent:"center",
      }}  className="header">

      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', position: 'relative' }}>
          <Box component="img" src="https://st2.depositphotos.com/4035913/6124/i/450/depositphotos_61243733-stock-illustration-business-company-logo.jpg" alt="Logo" className="header-logo" />
          <Box className={`nav-links ${menuVisible ? 'visible' : ''}`}>
            {menuItems.map((item, index) => (
              <MuiLink
                component={Link}
                to={item.href}
                className={`nav-link ${activeTab === item.href ? 'active' : ''}`}
                key={index}
                onClick={() => handleTabClick(item.href)}
              >
                <Typography variant="body1">{item.text}</Typography>
              </MuiLink>
            ))}
          </Box>
          <Box className="mobile-nav">
            <IconButton
              edge="start"
              color="#045B50"
              aria-label="menu"
              onClick={handleMenuToggle}
              className="MuiIconButton-root"
            >
              {menuVisible ? <CloseIcon  /> : <MoreVertIcon />}
            </IconButton>
          </Box>
        </Toolbar>
        <Box className={`mobile-menu ${menuVisible ? 'visible' : ''}`}>
          {menuItems.map((item, index) => (
            <MuiLink
              component={Link}
              to={item.href}
              className={`nav-link ${activeTab === item.href ? 'active' : ''}`}
              key={index}
              onClick={() => handleTabClick(item.href)}
            >
              <Typography variant="body1">{item.text}</Typography>
            </MuiLink>
          ))}
        </Box>
      </Container>

    </AppBar>
  );
};

export default Navbar;