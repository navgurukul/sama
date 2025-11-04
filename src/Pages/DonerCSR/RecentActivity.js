import React from "react";
import { Card, CardContent, Box, Typography, Avatar, Divider, Button } from "@mui/material";
import { Calendar, Clock } from "lucide-react";
const RecentActivity = ({
    recentActivities,
    showAllActivities,
    setShowAllActivities,
    getActivityColor,
    formatActivityMessage,
    getStatusIcon,
    timeAgo,
    onActivityClick,
}) => {
    return (
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
                {/* Header */}
                <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                    <Clock size={20} style={{ marginRight: 8, color: "#555" }} />
                    <Typography variant="h6" gutterBottom>
                        Recent Activity (Last 24 Hours)
                    </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={2}>
                    Latest updates on laptop processing and distribution
                </Typography>
                {recentActivities.length === 0 ? (
                    // No activity state
                    <Box display="flex" flexDirection="column" alignItems="center" py={4}>
                        <Calendar size={48} color="#ccc" />
                        <Typography variant="body2" color="text.secondary" mt={2}>
                            No recent activity in the last 24 hours
                        </Typography>
                    </Box>
                ) : (
                    <>
                        {(showAllActivities ? recentActivities : recentActivities.slice(0, 5)).map(
                            (activity, index) => (
                                <Box key={index} mb={2} onClick={() => onActivityClick(activity)}>
                                    <Box display="flex" alignItems="center" mb={1}>
                                        <Avatar
                                            sx={{
                                                bgcolor: getActivityColor(activity.status),
                                                width: 32,
                                                height: 32,
                                                fontSize: 12,
                                                mr: 2,
                                            }}
                                        >
                                            {activity.allocatedTo ? activity.allocatedTo[0] : activity.status[0] || "?"}
                                        </Avatar>
                                        <Box flex={1}>
                                            <Typography variant="body2" fontWeight={500}>
                                                {formatActivityMessage(activity)}
                                            </Typography>


                                            <Box display="flex" alignItems="center" gap={1}>
                                                {getStatusIcon(activity.status)}
                                                <Typography variant="caption" color="text.secondary">
                                                    {timeAgo(activity.lastUpdated)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                    {index < recentActivities.length - 1 && <Divider sx={{ ml: 5 }} />}
                                </Box>
                            )
                        )}
                        {recentActivities.length > 5 && (
                            <Button
                                size="small"
                                sx={{ mt: 1 }}
                                color="primary"
                                onClick={() => setShowAllActivities(!showAllActivities)}
                            >
                                {showAllActivities ? "Show Less ↑" : "View More ↓"}
                            </Button>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
};
export default RecentActivity;
