import React, { useState } from "react";
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
import { Filter, ChevronDown, X, Building, Download } from "lucide-react";
import ComputerIcon from "@mui/icons-material/Computer";

const DashboardHeader = ({ uniqueOrganizations, onOrganizationChange }) => {
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [selectedOrganization, setSelectedOrganization] = useState(null);

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
  };

  const handleClearFilter = () => {
    setSelectedOrganization(null);
    onOrganizationChange(null);
    handleFilterClose();
  };



  return (
    <>
      {/* Header Row */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 2,
          py: 2,
          borderBottom: "1px solid #eee",
        }}
      >
        {/* Left Section */}
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              backgroundColor: "#4CAF50",
              color: "white",
              p: 1,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ComputerIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" color="black">
              Corporate CSR Dashboard
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Laptop Donation Impact Tracking
            </Typography>
          </Box>
        </Box>

        {/* Right Section */}
        <Box display="flex" alignItems="center" gap={2}>
          {selectedOrganization && (
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
            Filter by Organization
          </Button>


          <Typography variant="body2" color="text.secondary">
            Corporate Partner
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Download size={16} />}
            sx={{ borderRadius: "10px", textTransform: "none" }}
          >
            Export Report
          </Button>
          {/* Filter Dropdown Menu */}
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
                    fontWeight: selectedOrganization === org ? 600 : 400,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                />
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Box>

      {/* Filter Status Bar */}
      {selectedOrganization && (
        <Box
          sx={{
            p: 2,
            backgroundColor: "#f5f5f5",
            borderRadius: 1,
            border: "1px solid #e0e0e0",
          }}
        >
          <Typography variant="body2" sx={{ fontSize: 14, color: "#666" }}>
            Showing data filtered for: <strong>{selectedOrganization}</strong>
          </Typography>
        </Box>
      )}
    </>
  );
};


export default DashboardHeader;



