import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  FormHelperText,
  Divider,
  Tabs,
  Tab,
  Paper,
} from "@mui/material";

const RMSControlPanel = () => {
  const [wallpaperFile, setWallpaperFile] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const handleWallpaperChange = (e) => {
    const file = e.target.files?.[0];
    setWallpaperFile(file || null);
  };

  return (
    <Box sx={{ maxWidth: 960, mx: "auto", display: "grid", gap: 4, justifyItems: "center" }}>
      <Stack direction="row" alignItems="center" justifyContent="center" flexWrap="wrap" gap={1} sx={{ width: "100%", maxWidth: 800 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="#2e7d32" textAlign="center">
            Ops Team Control Panel
          </Typography>
          {/* <Typography variant="body2" color="text.secondary">
            Configure software install settings and wallpapers.
          </Typography> */}
        </Box>
      </Stack>

      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 840,
          borderRadius: 2,
          border: "1px solid #e0e0e0",
          boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_e, val) => setActiveTab(val)}
          textColor="success"
          indicatorColor="success"
          variant="fullWidth"
          sx={{
            bgcolor: "rgba(46,125,50,0.06)",
            "& .MuiTab-root": { fontWeight: 600, textTransform: "none" },
            "& .Mui-selected": { color: "#2e7d32" },
          }}
        >
          <Tab label="Software Install" />
          <Tab label="Wallpaper Upload" />
        </Tabs>

        {activeTab === 0 && (
          <Card elevation={0} square sx={{ border: "none" }}>
            <CardContent sx={{ display: "grid", gap: 2, alignItems: "center", justifyItems: "center" }}>
              <Box sx={{ display: "grid", gap: 1.5, width: "100%", maxWidth: 520 }}>
                <TextField
                  label="Channel Name"
                  placeholder="Enter channel name"
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Software Name"
                  placeholder="Enter software name"
                  fullWidth
                  size="small"
                />
              </Box>

              <Divider />

              <Box sx={{ display: "grid", gap: 1, width: "100%", maxWidth: 520 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Software Installation Commands
                </Typography>
                <TextField
                  placeholder="Enter commands separated by commas"
                  fullWidth
                  multiline
                  minRows={3}
                  size="small"
                />
                <FormHelperText>* Please enter commands separated by commas.</FormHelperText>
              </Box>

              <Stack direction="row" spacing={1} sx={{ pt: 1 }} flexWrap="wrap">
                <Button variant="contained" color="success">
                  Install Software
                </Button>
                <Button variant="outlined" color="success">
                  Save Settings
                </Button>
              </Stack>
            </CardContent>
          </Card>
        )}

        {activeTab === 1 && (
          <Card elevation={0} square sx={{ border: "none" }}>
            <CardContent sx={{ display: "grid", gap: 2, maxWidth: 520, mx: "auto" }}>
              <Box sx={{ display: "grid", gap: 1 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Channel Name
                </Typography>
                <TextField
                  placeholder="Enter channel name"
                  fullWidth
                  size="small"
                />
              </Box>

              <Box sx={{ display: "grid", gap: 1 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Upload Wallpaper
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  color="success"
                  sx={{ justifyContent: "flex-start" }}
                >
                  {wallpaperFile ? wallpaperFile.name : "No file chosen"}
                  <input hidden type="file" accept="image/*" onChange={handleWallpaperChange} />
                </Button>
                <FormHelperText>Upload a wallpaper image (JPG/PNG).</FormHelperText>
              </Box>

              <Stack direction="row" spacing={1} sx={{ pt: 1 }} flexWrap="wrap">
                <Button variant="contained" color="success">
                  Upload Wallpaper
                </Button>
                <Button variant="outlined" color="success">
                  Cancel
                </Button>
              </Stack>
            </CardContent>
          </Card>
        )}
      </Paper>
    </Box>
  );
};

export default RMSControlPanel;

