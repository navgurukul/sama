import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Select,
  MenuItem,
  CircularProgress,
  Grid,
  Chip,
  IconButton
} from "@mui/material";
import { Edit2, Check, X, ShieldAlert } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

const AfeTracker = () => {
  const [requests, setRequests] = useState([]);
  const [inventorySummary, setInventorySummary] = useState(null);
  const [rmsStats, setRmsStats] = useState({ active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editFields, setEditFields] = useState({});
  const [userRole, setUserRole] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5);

  // Check roles
  useEffect(() => {
    try {
      const storedRole = localStorage.getItem("role");
      if (storedRole) {
        setUserRole(JSON.parse(storedRole));
      }
    } catch (e) {
      console.error("Error parsing user role:", e);
    }
  }, []);

  const isAdmin = userRole.includes("admin");
  const isAfeApprover = userRole.includes("afe_approver");
  const hasAccess = isAdmin || isAfeApprover;

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.REACT_APP_NgoInformationApi || "http://localhost:8000/ngo-exec";
      const res = await fetch(`${baseUrl}?type=registration`);
      const data = await res.json();
      if (data && data.data) {
        // Filter out drafts from the AFE team dashboard, and only show Amazon requests
        const nonDrafts = data.data.filter((req) => 
          (req.Status || "").toLowerCase() !== "draft" && 
          req.Doner === "Amazon"
        );
        setRequests(nonDrafts);
      }
    } catch (e) {
      console.error("Error fetching AFE requests:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventorySummary = async () => {
    try {
      const baseUrl = process.env.REACT_APP_NgoInformationApi ? process.env.REACT_APP_NgoInformationApi.replace('/ngo-exec', '') : "http://localhost:8000";
      const res = await fetch(`${baseUrl}/api/afe/inventory-summary`);
      const data = await res.json();
      if (data && data.status === "success") {
        setInventorySummary(data.data);
      }
    } catch (e) {
      console.error("Error fetching AFE inventory summary:", e);
    }
  };

  const fetchRmsStats = async () => {
    try {
      const baseUrl = process.env.REACT_APP_NgoInformationApi ? process.env.REACT_APP_NgoInformationApi.replace('/ngo-exec', '') : "http://localhost:8000";
      const res = await fetch(`${baseUrl}/api/rms-stats`);
      const data = await res.json();
      if (data) {
        setRmsStats({ active: data.active || 0, inactive: data.inactive || 0 });
      }
    } catch (e) {
      console.error("Error fetching RMS stats:", e);
    }
  };

  useEffect(() => {
    if (hasAccess) {
      fetchRequests();
      fetchInventorySummary();
      fetchRmsStats();
    }
  }, [hasAccess]);

  if (!hasAccess) {
    return null;
  }

  const handleStartEdit = (req) => {
    setEditingId(req.Id);
    const initialStatus = (req.Status === "Submitted Request" || !req.Status) ? "Pending Review" : req.Status;
    setEditFields({
      approved_quantity: req.approved_quantity || req["Laptop require"] || 0,
      approver_name: req.approver_name || "",
      partner_type: req.partner_type || "External Partner",
      status: initialStatus,
      dispatch_location: req.dispatch_location || "Pune",
      expected_delivery_days: req.expected_delivery_days || 3,
      dispatch_date: req.dispatch_date || "",
      delivery_date: req.delivery_date || "",
      attached_email_link: req.attached_email_link || ""
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (reqId) => {
    try {
      const payload = {
        id: reqId,
        type: "NGO",
        ...editFields
      };

      const apiUrl = process.env.REACT_APP_NgoInformationApi || "http://localhost:8000/ngo-exec";
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.status === "success") {
        setEditingId(null);
        fetchRequests();
      } else {
        alert("Failed to save. Server returned: " + JSON.stringify(data));
      }
    } catch (e) {
      console.error("Failed to save changes:", e);
      alert("Network or Client Error: " + e.message);
    }
  };

  // Calculations for Visualizations
  const getPipelineData = () => {
    const counts = {
      "Pending Review": 0,
      "Approved": 0,
      "Refurbishing": 0,
      "Dispatched": 0,
      "Delivered": 0
    };
    requests.forEach(r => {
      const status = r.Status || "Pending Review";
      if (counts[status] !== undefined) {
        counts[status]++;
      } else {
        counts["Pending Review"]++;
      }
    });
    return Object.keys(counts).map(key => ({
      name: key,
      count: counts[key]
    }));
  };

  const getRMSData = () => {
    return [
      { name: "Active", value: rmsStats.active || 1, color: "#4caf50" }, // Fallback to 1 if 0 so pie chart doesn't break
      { name: "Inactive (30+ Days)", value: rmsStats.inactive || 0, color: "#f44336" }
    ];
  };

  const pipelineData = getPipelineData();
  const rmsData = getRMSData();

  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: "#5C785A" }}>
        AFE Laptop Inventory Tracker
      </Typography>

      {/* Inventory Summary Cards */}
      {inventorySummary && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {["Total Received", "Total Refurbished", "Total Distributed", "Current Stock"].map((key, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Card variant="outlined" sx={{ borderRadius: 2, backgroundColor: "#fcfaf8" }}>
                <CardContent sx={{ pb: "16px !important", textAlign: "center" }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                    {key}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: "#5C785A", mb: 1 }}>
                    {inventorySummary[key]?.Total || 0}
                  </Typography>
                  <Box sx={{ display: "flex", justifyContent: "space-between", px: 1 }}>
                    <Typography variant="caption" sx={{ color: "#666" }}>
                      Macbook: <b>{inventorySummary[key]?.Macbook || 0}</b>
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#666" }}>
                      Windows: <b>{inventorySummary[key]?.Windows || 0}</b>
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Visualizations Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Laptop Status Pipeline
              </Typography>
              <Box sx={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pipelineData}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: "#f5f5f5" }} />
                    <Bar dataKey="count" fill="#5C785A" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                RMS Device Health
              </Typography>
              <Box sx={{ height: 220, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie
                      data={rmsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {rmsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <Box sx={{ display: "flex", gap: 3, mt: 1 }}>
                  {rmsData.map((item, i) => (
                    <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: item.color }} />
                      <Typography variant="caption" color="text.secondary">{item.name}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Table */}
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        {loading ? (
          <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#fcfaf8" }}>
                <TableCell sx={{ fontWeight: 600 }}>NGO Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Partner Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Req Qty</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Approved Qty</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Approver</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Timeline / Location</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    No AFE laptop requests found.
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {requests.slice(0, visibleCount).map((req) => {
                    const isEditing = editingId === req.Id;
                    return (
                      <TableRow key={req.Id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {req.organizationName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {req.email}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        {isEditing ? (
                          <Select
                            size="small"
                            value={editFields.partner_type}
                            onChange={(e) => setEditFields({ ...editFields, partner_type: e.target.value })}
                          >
                            <MenuItem value="External Partner">External Partner</MenuItem>
                            <MenuItem value="AFE Partner">AFE Partner</MenuItem>
                          </Select>
                        ) : (
                          <Chip label={req.partner_type || "External Partner"} size="small" variant="outlined" />
                        )}
                      </TableCell>
                      
                      <TableCell>{req["Laptop require"] || 0}</TableCell>
                      
                      <TableCell>
                        {isEditing ? (
                          <TextField
                            size="small"
                            type="number"
                            style={{ width: 80 }}
                            value={editFields.approved_quantity}
                            onChange={(e) => setEditFields({ ...editFields, approved_quantity: parseInt(e.target.value) || 0 })}
                          />
                        ) : (
                          req.approved_quantity || "-"
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {isEditing ? (
                          <Select
                            size="small"
                            value={editFields.approver_name}
                            onChange={(e) => setEditFields({ ...editFields, approver_name: e.target.value })}
                          >
                            <MenuItem value="">Select Approver</MenuItem>
                            <MenuItem value="Prateek">Prateek</MenuItem>
                            <MenuItem value="Ashhar">Ashhar</MenuItem>
                            <MenuItem value="Shruthi">Shruthi</MenuItem>
                          </Select>
                        ) : (
                          req.approver_name || "-"
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {isEditing ? (
                          <Select
                            size="small"
                            value={editFields.status}
                            onChange={(e) => setEditFields({ ...editFields, status: e.target.value })}
                          >
                            <MenuItem value="Pending Review">Pending Review</MenuItem>
                            <MenuItem value="Approved">Approved</MenuItem>
                          </Select>
                        ) : (
                          <Chip 
                            label={req.Status} 
                            size="small" 
                            color={
                              req.Status === "Delivered" ? "success" : 
                              req.Status === "Dispatched" ? "info" : 
                              req.Status === "Approved" ? "primary" : "default"
                            } 
                          />
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {isEditing ? (
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            <TextField
                              size="small"
                              label="Dispatch Location"
                              value={editFields.dispatch_location}
                              onChange={(e) => setEditFields({ ...editFields, dispatch_location: e.target.value })}
                            />
                          </Box>
                        ) : (
                          <Box>
                            {req.dispatch_location && <Typography variant="caption" display="block">Loc: {req.dispatch_location}</Typography>}
                          </Box>
                        )}
                      </TableCell>
                      
                      <TableCell align="right">
                        {isEditing ? (
                          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                            <IconButton size="small" onClick={() => handleSaveEdit(req.Id)}>
                              <Check size={16} color="green" />
                            </IconButton>
                            <IconButton size="small" onClick={handleCancelEdit}>
                              <X size={16} color="red" />
                            </IconButton>
                          </Box>
                        ) : (
                          <IconButton size="small" onClick={() => handleStartEdit(req)}>
                            <Edit2 size={16} />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                  })}
                  {visibleCount < requests.length && (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 2 }}>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          onClick={() => setVisibleCount(requests.length)}
                          sx={{ borderColor: "#5C785A", color: "#5C785A", "&:hover": { borderColor: "#455a44", backgroundColor: "rgba(92, 120, 90, 0.04)" } }}
                        >
                          See More ({requests.length - visibleCount} more)
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </Box>
  );
};

export default AfeTracker;
