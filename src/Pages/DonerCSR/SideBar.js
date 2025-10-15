import React, { useState } from "react";
import { NavLink, Outlet, useParams } from "react-router-dom";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  Drawer
} from "@mui/material";
import {
  BarChart2,
  Package,
  Building,
  TrendingUp,
  ClipboardList,
  Settings,
  Search,
  Menu as MenuIcon
} from "lucide-react";

const navItems = [
  {
    section: "Main Navigation",
    items: [
      { label: "Overview", icon: <BarChart2 size={20} />, path: "overview" },
      { label: "Laptop Pipeline", icon: <Package size={20} />, path: "laptop-pipeline" },
      { label: "NGO Partners", icon: <Building size={20} />, path: "partners" },
      { label: "Laptop Tracking", icon: <Search size={20} />, path: "laptop-tracking" },
      // { label: "Impact Analytics", icon: <TrendingUp size={20} />, path: "/donorcsr/impact-analytics" },
      // { label: "Pickup Requests", icon: <ClipboardList size={20} />, path: "/donorcsr/requests" },
    ],
  },
  // {
  //   section: "Administration",
  //   items: [
  //     { label: "Settings", icon: <Settings size={20} />, path: "/donorcsr/settings" },
  //   ],
  // },
];

const Sidebar = () => {
  const { donorName } = useParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const sidebarContent = (
    <>
      {navItems.map((group, idx) => (
        <Box key={idx} sx={{ mb: 3 }}>
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, color: "#777", px: 1, mb: 1, display: "block" }}
          >
            {group.section}
          </Typography>
          <List disablePadding>
            {group.items.map((item) => {
              // 👇 If donorName exists, keep it in path, otherwise default
              const toPath = donorName
                ? `/donorcsr/${donorName}/${item.path}`
                : `/donorcsr/${item.path}`;


              return (

                <ListItemButton
                  key={item.label}
                  component={NavLink}
                  to={toPath}
                  style={({ isActive }) => ({
                    borderRadius: 8,
                    marginBottom: 4,
                    color: isActive ? "#2e7d32" : "inherit",
                    backgroundColor: isActive ? "rgba(46, 125, 50, 0.08)" : "transparent",
                    fontWeight: isActive ? 600 : 400,
                  })}
                >
                  <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  />
                </ListItemButton>
              );
            })}
          </List>
          {idx < navItems.length - 1 && <Divider sx={{ mt: 2 }} />}
        </Box>
      ))}
    </>
  );
  return (
    <Box sx={{ display: "flex" }}>
      <IconButton
        color="inherit"
        edge="start"
        onClick={handleDrawerToggle}
        sx={{ display: { sm: "none" }, position: "fixed", top: 16, left: 16, zIndex: 1300 }}
      >
        <MenuIcon />
      </IconButton>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": { width: 240 },
        }}
      >
        {sidebarContent}
      </Drawer>

      <Box
        sx={{
          width: 240,
          height: "100vh",
          bgcolor: "#fff",
          borderRight: "1px solid #e0e0e0",
          p: 2,
          flexShrink: 0,
          display: { xs: "none", sm: "block" },
        }}
      >
        {sidebarContent}
      </Box>
      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default Sidebar;
