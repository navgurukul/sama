import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Link as MuiLink,
  Container,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CloseIcon from "@mui/icons-material/Close";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";
import logo from "./samalogo.png";
import useMediaQuery from "@mui/material/useMediaQuery";

import { breakpoints } from "../../theme/constant";

const Navbar = () => {
  const location = useLocation();
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeTab, setActiveTab] = useState(location.pathname);
  const isActive = useMediaQuery("(max-width:" + breakpoints.values.sm + "px)");

  const menuItems = [
    { text: "About Us", href: "/about" },
    { text: "Our Approach", href: "/our-approach" },
    { text: "Donate", href: "/donate" },
  ];

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location.pathname]);

  const handleMenuToggle = () => {
    setMenuVisible(!menuVisible);
  };

  const handleTabClick = (href) => {
    setActiveTab(href);
    if (href === "/") {
      setActiveTab(""); // Reset activeTab if navigating to home
    }
    setMenuVisible(false);
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: "white.main",
        boxShadow: "0px -1px 0px 0px",
        justifyContent: "center",
        padding: 0,
        margin: 0,
      }}
      className="header"
    >
      <Container sx={{ padding: 0, margin: 0 }}>
        <Toolbar
          disableGutters
          sx={{
            justifyContent: isActive && "space-between",
            position: "relative",
            padding: 0,
            margin: [2, 1, 2, 1],
          }}
        >
          <Link to="/" style={{ textDecoration: "none" }}>
            <Box component="img" src={logo} alt="Loo" className="header-logo" />
          </Link>
          <Box className={`nav-links ${menuVisible ? "visible" : ""}`}>
            {menuItems.map((item, index) => (
              <MuiLink
                sx={{ margin: 1, color: "#4A4A4A" }}
                component={Link}
                to={item.href}
                className={`nav-link ${activeTab === item.href ? "active" : ""
                  }`}
                key={index}
                onClick={() => handleTabClick(item.href)}
              >
                <Typography
                  variant="body1"
                  sx={{
                    textTransform: "none",
                    color: activeTab === item.href ? "primary.main" : "inherit",
                    fontWeight: activeTab === item.href ? "bold" : "normal",
                  }}
                >
                  {item.text}
                </Typography>
              </MuiLink>
            ))}
          </Box>
          <Box className="mobile-nav">
            <IconButton
              edge="start"
              aria-label="menu"
              onClick={handleMenuToggle}
              className="MuiIconButton-root"
            >
              {menuVisible ? <CloseIcon /> : <MoreVertIcon />}
            </IconButton>
          </Box>
        </Toolbar>
        <Box className={`mobile-menu ${(isActive && menuVisible) ? "visible" : ""}`}>
          {menuItems.map((item, index) => (
            <MuiLink
              component={Link}
              to={item.href}
              className={`nav-link ${activeTab === item.href ? "active" : ""}`}
              key={index}
              onClick={() => handleTabClick(item.href)}
            >
              <Typography
                variant="body1"
                sx={{
                  fontWeight: activeTab === item.href ? "bold" : "normal",
                }}
              >
                {item.text}
              </Typography>
            </MuiLink>
          ))}
        </Box>
      </Container>
    </AppBar>
  );
};

export default Navbar;
