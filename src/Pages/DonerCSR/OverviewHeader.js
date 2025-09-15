import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  Box,
  Typography,
  Avatar,
  Button,
  Chip,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Filter, ChevronDown, X, Building } from "lucide-react";

const OverviewHeader = ({ uniqueOrganizations, onOrganizationChange }) => {
  const { donorName } = useParams();
  const navigate = useNavigate();
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [selectedOrganization, setSelectedOrganization] = useState(donorName || null);
  const role = JSON.parse(localStorage.getItem("role") || "[]");
  const isAdmin = role.includes("admin");


  useEffect(() => {
    if (donorName) {
      setSelectedOrganization(donorName);
    }
  }, [donorName]);

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleOrganizationSelect = (org) => {
    setSelectedOrganization(org);
    onOrganizationChange(org); 
    handleFilterClose();

    navigate(`/donorcsr/${org}/overview`);
  };

  const handleClearFilter = () => {
    setSelectedOrganization(null);
    onOrganizationChange(null); 
    handleFilterClose();

    navigate(`/donorcsr/overview`);
  };

  return (
    <>
      {/* Header Row */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        {/* Left side - Logo + Title */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              backgroundColor: "#4caf50",
              mr: 1.5,
              fontSize: 14,
              fontWeight: 600,
            }}
          />
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" color="black">
              Sama CSR Dashboard
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontSize: 12, color: "#666" }}
            >
              Laptop Refurbishment & Distribution Tracking
            </Typography>
          </Box>
        </Box>

        {/* Right side - Filters */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {isAdmin && selectedOrganization &&(
            <Chip
              label={selectedOrganization}
              variant="outlined"
              size="small"
              onDelete={handleClearFilter}
              deleteIcon={<X size={14} />}
              sx={{
                maxWidth: 200,
                "& .MuiChip-label": {
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                },
              }}
            />
          )}
          {isAdmin && !donorName && (
            <Button
              variant="outlined"
              startIcon={<Filter size={16} />}
              endIcon={<ChevronDown size={16} />}
              onClick={handleFilterClick}
              sx={{
                textTransform: "none",
                fontSize: 14,
                px: 2,
                py: 1,
                borderColor: "#e0e0e0",
                color: "#666",
              }}
            >
              Filter by Donor
            </Button>
          )}

          <Box sx={{ textAlign: "right" }}>
            <Typography
              variant="body2"
              sx={{ fontSize: 12, color: "#666", fontWeight: "bold" }}
            >
              Corporate Partner
            </Typography>
            <Typography variant="body2" sx={{ fontSize: 12, color: "#666" }}>
              Dashboard Access
            </Typography>
          </Box>

          {/* Filter Dropdown Menu */}
          {isAdmin && !donorName && (
            <Menu
              anchorEl={filterAnchorEl}
              open={Boolean(filterAnchorEl)}
              onClose={handleFilterClose}
              PaperProps={{
                sx: {
                  maxHeight: 300,
                  width: 280,
                  mt: 1,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                  border: "1px solid #e0e0e0",
                },
              }}
            >
              <MenuItem onClick={handleClearFilter} sx={{ py: 1.5 }}>
                <ListItemIcon>
                  <X size={18} />
                </ListItemIcon>
                <ListItemText
                  primary="Clear Filter"
                  primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
                />
              </MenuItem>
              <Divider />
              {uniqueOrganizations.map((org) => (
                <MenuItem
                  key={org}
                  onClick={() => handleOrganizationSelect(org)}
                  selected={selectedOrganization === org}
                  sx={{ py: 1.5 }}
                >
                  <ListItemIcon>
                    <Building size={18} />
                  </ListItemIcon>
                  <ListItemText
                    primary={org}
                    primaryTypographyProps={{
                      fontSize: 14,
                      fontWeight:
                        selectedOrganization === org ? 600 : 400,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  />
                </MenuItem>
              ))}
            </Menu>
          )}
          {/* </Menu> */}
        </Box>
      </Box>

      {/* Filter Status Bar */}
      {isAdmin && selectedOrganization && (
        <Box
          sx={{
            mb: 3,
            p: 2,
            backgroundColor: "#f5f5f5",
            borderRadius: 1,
            border: "1px solid #e0e0e0",
          }}
        >
          <Typography variant="body2" sx={{ fontSize: 14, color: "#666" }}>
            Showing data filtered for:{" "}
            <strong>{selectedOrganization}</strong>
          </Typography>
        </Box>
      )}
    </>
  );
};

export default OverviewHeader;
