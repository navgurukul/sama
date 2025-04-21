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
  Tabs,
  Tab,
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
import DropdownMenu from "./DropdownMenu";

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
const discoverUsItems = [
  { text: "About Us", href: "/about" },
  { text: "Our Approach", href: "/our-approach" },
  { text: "Our Team", href: "/ourteam" },
];

const getInvolvedItems = [
  { text: "Corporate Partners", href: "/corporatepartner" },
  { text: "Government Partners", href: "/ourgoverment" },
  { text: "Community Partners", href: "/communitypartners" },
];
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
    "corpretedb/DataViewDetail",
    "/corpretedb/NGOTrainedTable"
  ];
  // const menuItems = [
  //   { text: "About Us", href: "/about" },
  //   { text: "Our Approach", href: "/our-approach" },
  //   { text: "Donate", href: "/donate" },
  // ];


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
    setMenuVisible(false); // This will always close the menu
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

  const opsTabs = [
    { label: "Warehouse Operations", path: "/laptop-tagging" },
    { label: "Laptop Detail Form", path: "/laptopinventory" },
    { label: "NGO Form", path: "/ngoregistration" },
    { label: "Edit Questions", path: "/donormanager" },
    { label: "Laptop with Issues", path: "/laptop-with-issues" },
    { label: "Laptop Audit", path: "/audit" },
  ];

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
      <Box sx={{ paddingX: "16px", margin: 0, justifyContent: "space-between" }}>
        <Toolbar
          disableGutters
          sx={{
            justifyContent: isActive ? "space-between" : "flex-start",
            position: "relative",
            padding: 0,
            margin: [2, 1, 2, 1],
            // width: "1400px",
            "@media (max-width: 600px)": {
              width: "350px",
            },
          }}
        >
          {isRouteMatch(location.pathname, routePatterns) ? (
            <BackButton />
          ) : (
            <Box
              component="img"
              src={logo}
              alt="Logo"
              className="header-logo"
              sx={{ cursor: 'pointer' }}
              onClick={() => {
                const role = JSON.parse(localStorage.getItem("role") || "[]");
                if (role.includes("ops")) {
                  navigate("/ops"); // Navigate to ops route for admin/ops users
                } else {
                  navigate("/"); // Default home route for others
                }
              }}
            />
          )}

          {!isLoggedIn && (
            <Box className={`nav-links ${menuVisible ? "visible" : ""}`}  >
              <DropdownMenu title="Discover Us" menuItems={discoverUsItems} />
              <DropdownMenu title="Get Involved" menuItems={getInvolvedItems} />

              {/* Donate Text Link */}
              <MuiLink
                sx={{

                  textDecoration: "none",
                  color: "#4A4A4A",
                  cursor: "pointer",
                  whiteSpace: "nowrap", // Prevents wrapping
                  textAlign: "left",
                  marginTop: "9px",
                  marginLeft: "8px",
                }}
                component={Link}
                to="/donate"
                variant="body1"
              >
                Donate
              </MuiLink>
            </Box>
          )}



          {/* show only in mobile view when user will log in */}
          {isLoggedIn && (() => {
            const role = JSON.parse(localStorage.getItem("role") || "[]");

            // Admin Role Header
            if (role.includes("admin")) {
              return (
                <Box className="drop">

                  <Avatar
                    alt="Profile"
                    src={ProfileImg}
                    sx={{
                      width: 40,
                      height: 40,
                      cursor: "pointer",
                      "&:hover": { opacity: 0.8 },
                      ml: 'auto' // Push avatar to the right
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
                  >
                    <MenuItem onClick={handleLogout} sx={{ color: "red" }}>
                      <Typography variant="body1">Logout</Typography>
                    </MenuItem>
                  </Menu>
                </Box>
              );
            }

            // OPS Role Header
            if (role.includes("ops")) {
              return (
                <Box className="drop">

                  <Box sx={{ display: 'flex', mx: 'auto', marginLeft: "30px" }}>
                    <Tabs
                      value={activeTab}
                      onChange={(e, newValue) => {
                        setActiveTab(newValue);
                        navigate(newValue);
                      }}
                      sx={{
                        minHeight: 'unset',
                        '& .MuiTabs-indicator': { display: 'none' }
                      }}
                    >
                      {opsTabs.map((tab) => (
                        <Tab
                          key={tab.path}
                          label={
                            <Typography variant="body1" component="span">
                              {tab.label}
                            </Typography>
                          }
                          value={tab.path}
                          component={Link}
                          to={tab.path}
                          sx={{
                            color: 'text.secondary',
                            textTransform: 'none',
                            minWidth: 'unset',
                            minHeight: 'unset',
                            px: 2,
                            py: 1,
                            '& + &': { ml: -1 },
                            '&.Mui-selected': {
                              color: 'text.primary',
                              fontWeight: 'medium'
                            }
                          }}
                        />
                      ))}
                    </Tabs>
                  </Box>

                  <Avatar
                    alt="Profile"
                    src={ProfileImg}
                    sx={{
                      width: 40,
                      height: 40,
                      cursor: "pointer",
                      "&:hover": { opacity: 0.8 },
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
                  >
                    <MenuItem onClick={handleLogout} sx={{ color: "red" }}>
                      <Typography variant="body1">Logout</Typography>
                    </MenuItem>
                  </Menu>
                </Box>
              );
            }

            // Default logged-in header (for other roles)
            return (
              <Box className="drop">
                <Avatar
                  alt="Profile"
                  src={ProfileImg}
                  sx={{
                    width: 40,
                    height: 40,
                    cursor: "pointer",
                    "&:hover": { opacity: 0.8 },
                    ml: 'auto'
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
                >
                  <MenuItem onClick={handleProfile}>
                    <Typography variant="body1">Profile</Typography>
                  </MenuItem>
                  <MenuItem onClick={handleLogout} sx={{ color: "red" }}>
                    <Typography variant="body1">Logout</Typography>
                  </MenuItem>
                </Menu>
              </Box>
            );
          })()}


          {/* {isLoggedIn && role.includes("ops") && !isActive && (
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => {
                  setActiveTab(newValue);
                  navigate(newValue);
                }}
                sx={{
                  minHeight: 'unset',
                  '& .MuiTabs-flexContainer': {
                    gap: '8px',
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: 'primary.main',
                    height: '3px',
                  },
                }}
                TabIndicatorProps={{
                  sx: {
                    bottom: '6px',
                  }
                }}
              >
                {opsTabs.map((tab) => (
                  <Tab
                    key={tab.path}
                    label={tab.label}
                    value={tab.path}
                    component={Link}
                    to={tab.path}
                    sx={{
                      fontWeight: activeTab === tab.path ? '600' : '400',
                      color: activeTab === tab.path ? 'primary.main' : '#4A4A4A',
                      textTransform: 'none',
                      minWidth: 'unset',
                      minHeight: 'unset',
                      padding: '6px 16px',
                      fontSize: '0.875rem',
                      border: activeTab === tab.path ? '1px solid rgba(0, 0, 0, 0.12)' : '1px solid transparent',
                      borderRadius: '4px',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      },
                      '&.Mui-selected': {
                        color: 'primary.main',
                      },
                    }}
                  />
                ))}
              </Tabs>
            </Box>
          )} */}

          {/* Code for Dashboard Login */}
          <Box sx={{ marginLeft: "auto", }}>
            {!isLoggedIn && !isActive && (
              <MuiLink
                sx={{
                  margin: 1,
                  textDecoration: "none",
                }}
                component={Link}
                to="/ngoregistration"
              >
                <Button
                  type="submit"
                  sx={{
                    fontWeight: activeTab === "/login" ? "bold" : "normal",
                    borderRadius: "100px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid",
                    borderColor: "primary.main",
                    "&:hover": {
                      backgroundColor: "#FFFFFF",
                    },
                  }}
                >
                  <Typography variant="subtitle1" sx={{ color: "primary.main", }}> Submit Requirements</Typography>
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
                to="/login"
              >
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    fontWeight: activeTab === "/login" ? "bold" : "normal",
                    borderRadius: "100px",
                    color: "#ffffff",
                  }}
                >
                  <Typography variant="subtitle1" sx={{ color: "#ffff", }}> Dashboard Login</Typography>
                </Button>
              </MuiLink>
            )}
            {/* {!isLoggedIn && !isActive && (
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
            )} */}
          </Box>
          {!isLoggedIn && (
            <Box className="mobile-nav" sx={{ marginRight: "17px" }}>
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
            className={`mobile-menu ${isActive && menuVisible ? "visible" : ""
              }`}
          >
            <DropdownMenu
              title="Discover Us"
              menuItems={discoverUsItems}
              onItemClick={() => handleTabClick()} // Add this
            />
            <DropdownMenu
              title="Get Involved"
              menuItems={getInvolvedItems}
              onItemClick={() => handleTabClick()} // Add this
            />
            <Box sx={{
              alignItems: "right",
              justifyContent: "right",
              borderRadius: 1,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 1,
              padding: 1,
              marginLeft: "8px",
              marginTop: { xs: "0px", md: "20px" },
            }}>
              <MuiLink
                sx={{
                  margin: "0 5px",
                  textDecoration: "none",
                  color: "#4A4A4A",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  textAlign: "left",
                }}
                component={Link}
                to="/donate"
                variant="body1"
                onClick={() => handleTabClick("/donate")} // Add this
              >
                Donate
              </MuiLink>
            </Box>
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
      </Box>
    </AppBar>
  );
};

export default Navbar;
