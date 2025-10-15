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

const opsTabs = [
  { label: "Warehouse Operations", path: "/laptop-tagging" },
  { label: "Laptop Detail Form", path: "/laptopinventory" },
  { label: "NGO Form", path: "/ngoregistration" },
  { label: "Edit Questions", path: "/donormanager" },
  { label: "Laptop with Issues", path: "/laptop-with-issues" },
  { label: "Laptop Audit", path: "/audit" },
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
  const isMobileOrTablet = useMediaQuery(
    "(max-width:" + breakpoints.values.md + "px)"
  );
  const registrationActive = location.pathname === "/registration";

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
    "/corpretedb/NGOTrainedTable",
  ];
  useEffect(() => {
    const authData = localStorage.getItem("_AuthSama_");
    const role = JSON.parse(localStorage.getItem("role") || "[]");

    setIsLoggedIn(!!authData);
    if (authData && location.pathname === "/") {
      if (role.includes("admin")) {
        navigate("/ngo");
      } else if (role.includes("ops")) {
        navigate("/ops");
      }
    }
  }, [location.pathname, navigate]);

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

  const role = JSON.parse(localStorage.getItem("role") || "[]");

  // Render OPS header with responsiveness
  const renderOpsHeader = () => {
    if (isMobileOrTablet) {
      // Mobile/Tablet View for OPS
      return (
        <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
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

          <Box sx={{ ml: "auto", display: "flex", alignItems: "center" }}>
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
              "& .MuiDrawer-paper": { width: 280, boxSizing: "border-box" },
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
                    sx={{
                      backgroundColor:
                        activeTab === tab.path ? "primary.main" : "transparent",
                      borderRadius: "4px",
                      my: 0.5,
                      "&.Mui-selected": {
                        backgroundColor: "primary.main",
                        "& .MuiListItemText-primary": {
                          color: "common.white",
                        },
                        "&:hover": {
                          backgroundColor: "primary.dark",
                        },
                      },
                      "&:hover": {
                        backgroundColor:
                          activeTab === tab.path
                            ? "primary.dark"
                            : "action.hover",
                      },
                    }}
                  >
                    <ListItemText
                      primary={tab.label}
                      primaryTypographyProps={{
                        sx: {
                          fontWeight: "medium",
                          color:
                            activeTab === tab.path
                              ? "common.white"
                              : "text.primary",
                        },
                      }}
                    />
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
        <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
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

          <Box
            sx={{ display: "flex", alignItems: "center", ml: "auto", mr: 3 }}
          >
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{
                minHeight: "unset",
                "& .MuiTabs-indicator": { display: "none" },
                "& .MuiTabs-flexContainer": {
                  gap: "8px",
                },
              }}
            >
              {opsTabs.map((tab) => (
                <Tab
                  key={tab.path}
                  label={
                    <Typography
                      variant="body1"
                      sx={{
                        color:
                          activeTab === tab.path
                            ? "common.white"
                            : "text.primary",
                      }}
                    >
                      {tab.label}
                    </Typography>
                  }
                  value={tab.path}
                  component={Link}
                  to={tab.path}
                  sx={{
                    textTransform: "none",
                    minWidth: "unset",
                    minHeight: "unset",
                    px: 2,
                    py: 1,
                    color: "transparent",
                    fontWeight: "medium",
                    backgroundColor:
                      activeTab === tab.path ? "primary.main" : "transparent",
                    borderRadius: "100px",
                    "&:hover": {
                      backgroundColor:
                        activeTab === tab.path
                          ? "primary.main"
                          : "action.hover",
                    },
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

  const renderAdminHeader = () => {
    if (isMobileOrTablet) {
      return (
        <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
          {!isRouteMatch(location.pathname, routePatterns) && (
            <Box
              component="img"
              src={logo}
              alt="Logo"
              className="header-logo"
              sx={{ cursor: "pointer" }}
              onClick={() => navigate("/ngo")}
            />
          )}

          <Box sx={{ ml: "auto", display: "flex", alignItems: "center" }}>
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

          {/* Drawer for Admin */}
          <Drawer
            anchor="right"
            open={mobileDrawerOpen}
            onClose={handleDrawerToggle}
            sx={{ "& .MuiDrawer-paper": { width: 280 } }}
          >
            <Box
              sx={{ width: 280 }}
              role="presentation"
              onClick={handleDrawerToggle}
              onKeyDown={handleDrawerToggle}
            >
              <List>
                <ListItem
                  button
                  component={Link}
                  to="/pickup-request-by-doner"
                  selected={location.pathname === "/pickup-request-by-doner"}
                  onClick={() => navigate("/pickup-request-by-doner")}
                >
                  <ListItemText primary="Pickup Requests" />
                </ListItem>

                <ListItem
                  button
                  component={Link}
                  to="/registration"
                  selected={registrationActive}
                  onClick={() => navigate("/registration")}
                >
                  <ListItemText primary="Registration" />
                </ListItem>

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
    }
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          gap: 2,
          pl: 2,
        }}
      >
        {!isRouteMatch(location.pathname, routePatterns) && (
          <Box
            component="img"
            src={logo}
            alt="Logo"
            className="header-logo"
            sx={{ cursor: "pointer" }}
            onClick={() => navigate("/ngo")}
          />
        )}

        {isLoggedIn && role.includes("admin") && (
          <>
            <Button
              variant="body1"
              onClick={() => navigate("/pickup-request-by-doner")}
              sx={{
                textTransform: "none",
                minWidth: "unset",
                minHeight: "unset",
                px: 2,
                py: 1,
                ml: 2,
                color:
                  location.pathname === "/pickup-request-by-doner"
                    ? "common.white"
                    : "text.primary",
                backgroundColor:
                  location.pathname === "/pickup-request-by-doner"
                    ? "primary.main"
                    : "transparent",
                borderRadius: "100px",
                fontWeight: "normal",
                "&:hover": {
                  backgroundColor:
                    location.pathname === "/pickup-request-by-doner"
                      ? "primary.main"
                      : "action.hover",
                  color:
                    location.pathname === "/pickup-request-by-doner"
                      ? "common.white"
                      : "text.primary",
                },
              }}
            >
              Pickup Requests
            </Button>
            <Button
              variant="body1"
              onClick={() => navigate("/registration")}
              sx={{
                textTransform: "none",
                minWidth: "unset",
                minHeight: "unset",
                px: 2,
                py: 1,
                ml: 2,
                color: registrationActive ? "common.white" : "text.primary",
                // fontWeight: 'medium',
                backgroundColor: registrationActive
                  ? "primary.main"
                  : "transparent",
                borderRadius: "100px",
                fontWeight: "normal",
                "&:hover": {
                  backgroundColor: registrationActive
                    ? "primary.main"
                    : "action.hover",
                  color: registrationActive ? "common.white" : "text.primary",
                },
              }}
            >
              Registration
            </Button>
          </>
        )}
        <Box sx={{ display: "flex", alignItems: "center", ml: "auto", ml: 0 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => {
              setActiveTab(newValue);
              navigate(newValue);
            }}
            sx={{
              minHeight: "unset",
              "& .MuiTabs-indicator": { display: "none" },
              "& .MuiTabs-flexContainer": {
                gap: "0px",
              },
            }}
          >
            {opsTabs.map((tab) => (
              <Tab
                key={tab.path}
                label={
                  <Typography
                    variant="body1"
                    sx={{
                      color:
                        activeTab === tab.path
                          ? "common.white"
                          : "text.primary",
                    }}
                  >
                    {tab.label}
                  </Typography>
                }
                value={tab.path}
                component={Link}
                to={tab.path}
                sx={{
                  textTransform: "none",
                  minWidth: "unset",
                  minHeight: "unset",
                  px: 2,
                  py: 1,
                  color: "transparent",
                  fontWeight: "medium",
                  backgroundColor:
                    activeTab === tab.path ? "primary.main" : "transparent",
                  borderRadius: "100px",
                  "&:hover": {
                    backgroundColor:
                      activeTab === tab.path ? "primary.main" : "action.hover",
                  },
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
      <Box
        sx={{ paddingX: "16px", margin: 0, justifyContent: "space-between" }}
      >
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
              {isLoggedIn && role.includes("admin") ? (
                renderAdminHeader()
              ) : isLoggedIn && role.includes("ops") ? (
                renderOpsHeader()
              ) : isLoggedIn && role.includes("ngo") ? (
                <Box sx={{ display: "flex", alignContent: "right", width: "50%" }}>
                  <Box
                    component="img"
                    src={logo}
                    alt="Logo"
                    className="header-logo"
                    sx={{ cursor: "pointer", height: 40 }}
                    onClick={() => navigate("/")}
                  />

                  <MuiLink
                    sx={{
                      marginLeft: "auto",
                      textDecoration: "none",
                    }}
                    component={Link}
                    to="/ngoregistration"
                  >
                    <Button
                      type="submit"
                      sx={{
                        fontWeight: "normal",
                        borderRadius: "100px",
                        backgroundColor: "#FFFFFF",
                        border: "1px solid",
                        position: "relative",
                        left: "10",
                        borderColor: "primary.main",                        "&:hover": {
                          backgroundColor: "#FFFFFF",
                        },
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ color: "primary.main" }}>
                        Submit Requirements
                      </Typography>
                    </Button>
                  </MuiLink>
                </Box>
              ) : (
                <>
                  {!isLoggedIn && (
                    <Box
                      component="img"
                      src={logo}
                      alt="Logo"
                      className="header-logo"
                      sx={{ cursor: "pointer" }}
                      onClick={() => {
                        const role = JSON.parse(
                          localStorage.getItem("role") || "[]"
                        );
                        if (role.includes("ops")) {
                          navigate("/ops");
                        } else if (role.includes("admin")) {
                          navigate("/ngo");
                        } else {
                          navigate("/");
                        }
                      }}
                    />
                  )}
                </>
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
              <MuiLink
                sx={{
                  textDecoration: 'none',
                  color: '#4A4A4A',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  textAlign: 'left',
                  marginTop: '9px',
                  marginLeft: '8px',
                }}
                component={Link}
                to="/pickup"
                variant="body1"
              >
                Pickup
              </MuiLink>
            </Box>
          )}

          {isLoggedIn && !role.includes("admin") && !role.includes("ops") && (
            <Box className="drop">
              <Avatar
                alt="Profile"
                src={ProfileImg}
                sx={{
                  width: 40,
                  height: 40,
                  cursor: "pointer",
                  "&:hover": { opacity: 0.8 },
                  ml: "auto",
                }}
                onClick={handleProfileClick}
              />
            </Box>
          )}

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
                    <Typography
                      variant="subtitle1"
                      sx={{ color: "primary.main" }}
                    >
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
            className={`mobile-menu ${isActive && menuVisible ? "visible" : ""
              }`}
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
            <Box
              sx={{
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
              }}
            >
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
                to="/pickup"
                variant="body1"
                onClick={() => handleTabClick("/pickup")}
              >
                Pickup
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
        {role.includes("admin") || role.includes("ops") || role.includes("doner")? (
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
