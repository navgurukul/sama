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
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
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
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const isActive = useMediaQuery("(max-width:" + breakpoints.values.sm + "px)");
  const isMobileOrTablet = useMediaQuery("(max-width:" + breakpoints.values.md + "px)");

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

  const handleDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const role = JSON.parse(localStorage.getItem('role') || '[]');

  const opsTabs = [
    { label: "Warehouse Operations", path: "/laptop-tagging" },
    { label: "Laptop Detail Form", path: "/laptopinventory" },
    { label: "NGO Form", path: "/ngoregistration" },
    { label: "Edit Questions", path: "/donormanager" },
    { label: "Laptop with Issues", path: "/laptop-with-issues" },
    { label: "Laptop Audit", path: "/audit" },
  ];

  // Render OPS header with responsiveness
  const renderOpsHeader = () => {
    if (isMobileOrTablet) {
      // Mobile/Tablet View for OPS
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          {!isRouteMatch(location.pathname, routePatterns) && (
            <Box
              component="img"
              src={logo}
              alt="Logo"
              className="header-logo"
              sx={{ cursor: 'pointer' }}
              onClick={() => navigate("/ops")}
            />
          )}

          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerToggle}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>

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
          </Box>

          <Drawer
            anchor="right"
            open={mobileDrawerOpen}
            onClose={handleDrawerToggle}
            sx={{
              '& .MuiDrawer-paper': { width: 280, boxSizing: 'border-box' },
            }}
          >
            <Box
              sx={{ width: 280 }}
              role="presentation"
              onClick={handleDrawerToggle}
              onKeyDown={handleDrawerToggle}
            >
              <List>
                {opsTabs.map((tab) => (
                  <ListItem
                    button
                    key={tab.path}
                    component={Link}
                    to={tab.path}
                    selected={activeTab === tab.path}
                    onClick={() => {
                      setActiveTab(tab.path);
                      navigate(tab.path);
                    }}
                  >
                    <ListItemText primary={tab.label} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Drawer>
        </Box>
      );
    } else {
      // Desktop View for OPS
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          {!isRouteMatch(location.pathname, routePatterns) && (
            <Box
              component="img"
              src={logo}
              alt="Logo"
              className="header-logo"
              sx={{ cursor: 'pointer' }}
              onClick={() => navigate("/ops")}
            />
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto', mr: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => {
                setActiveTab(newValue);
                navigate(newValue);
              }}
              sx={{
                minHeight: 'unset',
                '& .MuiTabs-indicator': { display: 'none' },
                '& .MuiTabs-flexContainer': {
                  gap: '8px'
                }
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
        </Box>
      );
    }
  };

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
            "@media (max-width: 600px)": {
              width: "100%",
            },
          }}
        >
          {isRouteMatch(location.pathname, routePatterns) ? (
            <BackButton />
          ) : (
            <>
              {isLoggedIn && role.includes("admin") && (
                <Button
                  variant="contained"
                  sx={{
                    marginRight: 2,
                    borderRadius: "100px",
                    backgroundColor: "primary.main",
                  }}
                  onClick={() => navigate("/registration")}
                >
                  <Typography variant="subtitle1" sx={{ color: "#ffffff" }}>
                    Registration
                  </Typography>
                </Button>
              )}

              {!isLoggedIn && (
                <Box
                  component="img"
                  src={logo}
                  alt="Logo"
                  className="header-logo"
                  sx={{ cursor: 'pointer' }}
                  onClick={() => {
                    const role = JSON.parse(localStorage.getItem("role") || "[]");
                    if (role.includes("ops")) {
                      navigate("/ops");
                    } else {
                      navigate("/");
                    }
                  }}
                />
              )}
            </>
          )}
          {!isLoggedIn && (
            <Box className={`nav-links ${menuVisible ? "visible" : ""}`}>
              <DropdownMenu title="Discover Us" menuItems={discoverUsItems} />
              <DropdownMenu title="Get Involved" menuItems={getInvolvedItems} />
              <MuiLink
                sx={{
                  textDecoration: "none",
                  color: "#4A4A4A",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
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
                      ml: 'auto'
                    }}
                    onClick={handleProfileClick}
                  />
                </Box>
              );
            }

            // OPS Role Header
            if (role.includes("ops")) {
              return renderOpsHeader();
            }

            // Default logged-in header
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
              </Box>
            );
          })()}

          {/* Dashboard Login and Submit Requirements Buttons */}
          <Box sx={{ marginLeft: "auto" }}>
            {!isLoggedIn && !isActive && (
              <>
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
                    <Typography variant="subtitle1" sx={{ color: "primary.main" }}>
                      Submit Requirements
                    </Typography>
                  </Button>
                </MuiLink>

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
                    <Typography variant="subtitle1" sx={{ color: "#ffff" }}>
                      Dashboard Login
                    </Typography>
                  </Button>
                </MuiLink>
              </>
            )}
          </Box>

          {/* Mobile Navigation Menu Toggle */}
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

        {/* Mobile Menu for Non-logged-in Users */}
        {!isLoggedIn && (
          <Box
            className={`mobile-menu ${isActive && menuVisible ? "visible" : ""}`}
          >
            <DropdownMenu
              title="Discover Us"
              menuItems={discoverUsItems}
              onItemClick={() => handleTabClick()}
            />
            <DropdownMenu
              title="Get Involved"
              menuItems={getInvolvedItems}
              onItemClick={() => handleTabClick()}
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
                onClick={() => handleTabClick("/donate")}
              >
                Donate
              </MuiLink>
            </Box>
            {!isLoggedIn && isActive && (
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

      {/* Profile Menu */}
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
        {role.includes("admin") || role.includes("ops") ? (
          <MenuItem onClick={handleLogout} sx={{ color: "red" }}>
            <Typography variant="body1">Logout</Typography>
          </MenuItem>
        ) : (
          <>
            <MenuItem onClick={handleProfile}>
              <Typography variant="body1">Profile</Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ color: "red" }}>
              <Typography variant="body1">Logout</Typography>
            </MenuItem>
          </>
        )}
      </Menu>
    </AppBar>
  );
};

export default Navbar;