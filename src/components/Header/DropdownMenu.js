import React, { useState } from "react";
import {
  Popper,
  Paper,
  MenuList,
  MenuItem,
  Box,
  Typography,
  useMediaQuery,
  Collapse,
} from "@mui/material";
import { Link } from "react-router-dom";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const DropdownMenu = ({ title, menuItems }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleClick = (event) => {
    if (isMobile) {
      setOpen((prev) => !prev);
    } else {
      setAnchorEl(event.currentTarget);
      setOpen(true);
    }
  };

  const handleMouseEnter = (event) => {
    if (!isMobile) {
      setAnchorEl(event.currentTarget);
      setOpen(true);
    }
  };

  const handleMouseLeave = (event) => {
    if (!isMobile) {
      setOpen(false);
    }
  };

  return (
    <Box 
      sx={{
        alignItems:"left", 
        justifyContent:"left", 
        borderRadius: 1, 
        width: "100%", 
        display: "flex", 
        flexDirection: "column", 
        gap: 1, 
        padding: 1,
        marginLeft: {xs:"20px", md:"10px"}
        }}>
    <Box
      sx={{
        cursor: "pointer",
        display: "flex",
        textAlign: "left",        
        gap: 1,
        fontWeight: "bold",
        color: "#4A4A4A",
        flexDirection: isMobile ? "column" : "row",
        width: "90%",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start", 
          width: "max-content",
          minWidth: "120px",
        }}
      >
        <Typography variant="body1" sx={{ whiteSpace: "nowrap", textAlign: "left" }}>
          {title}
        </Typography>
        <KeyboardArrowDownIcon sx={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }} />
      </Box>

      {/* Mobile Dropdown */}
      {isMobile ? (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <Paper sx={{ marginBottom:"20px",width: "320px", backgroundColor: "#f9f9f9", boxShadow: 2, mt: 1 }}>
            <MenuList>
              {menuItems.map((item, index) => (
                <MenuItem
                  key={index}
                  component={Link}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  sx={{ textAlign: "center" }} 
                >
                  <Typography variant="body1">{item.text}</Typography>
                </MenuItem>
              ))}
            </MenuList>
          </Paper>
        </Collapse>
      ) : (
        <Popper open={open} anchorEl={anchorEl} placement="bottom-start" disablePortal>
          <Paper
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            elevation={3}
            sx={{
              mt: 1,
              borderRadius: 1,
              minWidth: 200, 
            }}
          >
            <MenuList>
              {menuItems.map((item, index) => (
                <MenuItem
                  key={index}
                  component={Link}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  sx={{ textAlign: "left" }} 
                >
                  <Typography variant="body1">{item.text}</Typography>
                </MenuItem>
              ))}
            </MenuList>
          </Paper>
        </Popper>
      )}
    </Box>
    </Box>
  );
};

export default DropdownMenu;
