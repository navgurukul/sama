import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Button,
  Link as MuiLink,
  Container,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CloseIcon from "@mui/icons-material/Close";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";
import ProfileImg from "./profile.png";
import logo from "./samalogo.png";
import useMediaQuery from "@mui/material/useMediaQuery";
import { breakpoints } from "../../theme/constant";
import BackButton from "./BackButton";
import { matchPath } from "react-router-dom";

const isRouteMatch = (pathname, patterns) => {
  return patterns.some((pattern) =>
    matchPath(
      {
        path: pattern,
        exact: true,
        strict: false,
      },
      pathname
    )
  );
};

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeTab, setActiveTab] = useState(location.pathname);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const isActive = useMediaQuery("(max-width:" + breakpoints.values.sm + "px)");

  const routArr = ["/user-details", "/userdetails/:id"];
  const routePatterns = [
    "/user-details",
    "/userdetails/:id",
    "ngo/:id",
    "edit-yearly-form/:id",
    "yearly-reporting/:id",
    "/monthly-reporting/:id",
    "/edit-form/:id",
    "monthly-reporting",
    "yearly-reporting",
    "monthly-report",
    "yearly-report",
  ];

  const menuItems = [
    { text: "About Us", href: "/about" },
    { text: "Our Approach", href: "/our-approach" },
    { text: "Donate", href: "/donate" },
  ];

  useEffect(() => {
    const authData = localStorage.getItem("_AuthSama_");
    setIsLoggedIn(!!authData);
    setActiveTab(location.pathname);
  }, [location.pathname]);

  const handleMenuToggle = () => {
    setMenuVisible(!menuVisible);
  };

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
    // console.log("Avatar clicked");
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleTabClick = (href) => {
    setActiveTab(href);
    if (href === "/") {
      setActiveTab("");
    }
    setMenuVisible(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("_AuthSama_");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    navigate("/");
    handleMenuClose();
  };

  const handleProfile = () => {
    navigate("/ngoprofile");
    handleMenuClose();
  };

  const role = JSON.parse(localStorage.getItem('role') || '[]');
  // console.log("Retrieved Role from Local Storage:", role);

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: "white.main",
        boxShadow: "0px 1px 2px 0px rgba(74, 74, 74, 0.06)",
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
            justifyContent: isActive ? "space-between" : "flex-start",
            position: "relative",
            padding: 0,
            margin: [2, 1, 2, 1],
            width: "1400px",
            "@media (max-width: 600px)": {
              width: "350px",
            },
          }}
        >
          {isRouteMatch(location.pathname, routePatterns) ? (
            <BackButton />
          ) : (
            <Link to="/" style={{ textDecoration: "none" }}>
              <Box
                component="img"
                src={logo}
                alt="Logo"
                className="header-logo"
              />
            </Link>
          )}

          <Box className={`nav-links ${menuVisible ? "visible" : ""}`}>
            {!isLoggedIn &&
              menuItems.map((item, index) => (
                <MuiLink
                  sx={{
                    margin: 1,
                    color: "#4A4A4A",
                    textDecoration: "none",
                  }}
                  component={Link}
                  to={item.href}
                  className={`nav-link ${
                    activeTab === item.href ? "active" : ""
                  }`}
                  key={index}
                  onClick={() => handleTabClick(item.href)}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      textTransform: "none",
                      color:
                        activeTab === item.href ? "primary.main" : "inherit",
                      fontWeight: activeTab === item.href ? "bold" : "normal",
                    }}
                  >
                    {item.text}
                  </Typography>
                </MuiLink>
              ))}
          </Box>

          {/* show only in mobile view when user will log in */}
          {isLoggedIn && (
            <Box className="drop">
              <Avatar
                alt="Profile"
                src={ProfileImg}
                sx={{
                  width: 40,
                  height: 40,
                  cursor: "pointer",
                  "&:hover": {
                    opacity: 0.8,
                  },
                }}
                onClick={handleProfileClick}
              />
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                sx={{
                  "& .MuiPaper-root": {
                    borderRadius: 2,
                    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                    minWidth: 200,
                  },
                }}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                {(() => {
                  const role = JSON.parse(localStorage.getItem("role") || "[]");
                  // console.log("Parsed role:", role);

                  if (role.includes("admin") || role.includes("ops")) {
                    return (
                      <MenuItem
                        onClick={handleLogout}
                        variant="body1"
                        sx={{ color: "red" }}
                      >
                        Logout
                      </MenuItem>
                    );
                  }
                  return (
                    <>
                      <MenuItem onClick={handleProfile} variant="body1">
                        Profile
                      </MenuItem>
                      <MenuItem
                        onClick={handleLogout}
                        variant="body1"
                        sx={{ color: "red" }}
                      >
                        Logout
                      </MenuItem>
                    </>
                  );
                })()}
              </Menu>
            </Box>
          )}

          {/* Code for Dashboard Login */}
          <Box sx={{ marginLeft: "auto" }}>
            {!isLoggedIn && !isActive && (
              <MuiLink
                sx={{
                  margin: 1,
                  color: "#4A4A4A",
                  textDecoration: "none",
                }}
                component={Link}
                to="/login"
              >
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{
                    fontWeight: activeTab === "/login" ? "bold" : "normal",
                    borderRadius: "100px",
                  }}
                >
                  Login
                </Button>
              </MuiLink>
            )}
            {!isLoggedIn && !isActive && (
              <MuiLink
                sx={{
                  margin: 1,
                  color: "#4A4A4A",
                  textDecoration: "none",
                }}
                component={Link}
                to="/ngoregistration"
              >
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    fontWeight: activeTab === "/login" ? "bold" : "normal",
                    borderRadius: "100px",
                    bgcolor: "#453722",
                    color: "#ffffff",
                  }}
                >
                  NGO registration
                </Button>
              </MuiLink>
            )}
          </Box>
          {!isLoggedIn && (
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
          )}
        </Toolbar>
        {!isLoggedIn && (
          <Box
            className={`mobile-menu ${
              isActive && menuVisible ? "visible" : ""
            }`}
          >
            {menuItems.map((item, index) => (
              <MuiLink
                component={Link}
                to={item.href}
                className={`nav-link ${
                  activeTab === item.href ? "active" : ""
                }`}
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
            {/* Dashboard Login in mobile menu - Hidden in mobile view */}
            {!isLoggedIn && !isActive && (
              <MuiLink
                sx={{
                  margin: 1,
                  color: "#4A4A4A",
                  textDecoration: "none",
                }}
                component={Link}
                to="/login"
                onClick={() => handleTabClick("/login")}
              >
                <Typography
                  className="LoginMobile"
                  variant="body1"
                  sx={{
                    fontWeight: activeTab === "/login" ? "bold" : "normal",
                  }}
                >
                  Dashboard Login
                </Typography>
              </MuiLink>
            )}
          </Box>
        )}
      </Container>
    </AppBar>
  );
};

export default Navbar;
