// // import React, { useState } from 'react';
// // import { Grid, Tabs, Tab, Typography, Box } from '@mui/material';
// // import SocialImpactPage from "./SocialImpact";
// // import EnvironmentalImpact from './EnvironmentalImpact';
// // import { DigitalHardwareText, StyledButton, TypographyButton, styles } from './style';
// // import { Container } from '@mui/system';

// // function DashboardPage() {
// //     const [activeTab, setActiveTab] = useState(0);
// //     const handleTabChange = (event, newValue) => {
// //         setActiveTab(newValue);
// //     };

// //     return (
// //         <Container maxWidth="xxl">
// //             <Container maxWidth="xl">
// //                 <Grid container spacing={2} sx={{ mt: 1 }} style={{ marginLeft: "1px" }}>
// //                     <Grid item xs={12} md={6} sm={12}>
// //                         <DigitalHardwareText>Digital Hardware Tracker</DigitalHardwareText>
// //                         <Typography className="body1" style={styles.body1} sx={{ mt: 1 }}>
// //                             Monitor your e-waste management efforts with ease
// //                         </Typography>
// //                     </Grid>
// //                 </Grid>
// //                 <Grid container spacing={2} sx={{ mt: 1 }} style={{ marginLeft: "1px" }}>
// //                     <Grid item xs={12}>
// //                         <Tabs value={activeTab} onChange={handleTabChange} indicatorColor="none">
// //                             <Tab
// //                                 label={activeTab === 0 ? (
// //                                     <StyledButton>
// //                                         <TypographyButton>Environmental Impact</TypographyButton>
// //                                     </StyledButton>
// //                                 ) : (
// //                                     <Typography className="body1">Environmental Impact</Typography>
// //                                 )}
// //                             />
// //                             <Tab
// //                                 label={activeTab === 1 ? (
// //                                     <StyledButton>
// //                                         <TypographyButton>Social Impact</TypographyButton>
// //                                     </StyledButton>
// //                                 ) : (
// //                                     <Typography className="body1">Social Impact</Typography>
// //                                 )}
// //                             />
// //                         </Tabs>
// //                     </Grid>
// //                 </Grid>

// //                 <Grid
// //                     container
// //                     spacing={2}
// //                     sx={{
// //                         mt: 2,
// //                         maxWidth: 'xl',
// //                         margin: '0 auto'
// //                     }}
// //                 >
// //                     <Grid item xs={12}>
// //                         {activeTab === 0 ? <EnvironmentalImpact /> : <SocialImpactPage />}
// //                     </Grid>
// //                 </Grid>
// //             </Container>
// //         </Container>
// //     );
// // }

// // export default DashboardPage;



// import React, { useState } from 'react';
// import { Grid, Tabs, Tab, Typography, Box } from '@mui/material';
// import SocialImpactPage from "./SocialImpact";
// import EnvironmentalImpact from './EnvironmentalImpact';
// import { DigitalHardwareText, StyledButton, TypographyButton, styles } from './style';
// import { Container } from '@mui/system';

// function DashboardPage() {
//     const [activeTab, setActiveTab] = useState(0);
//     const handleTabChange = (event, newValue) => {
//         setActiveTab(newValue);
//     };

//     return (
//         <Container maxWidth="xxl">
//             <Container maxWidth="xl">
//                 <Grid container spacing={2} sx={{ mt: 1 }} style={{ marginLeft: "1px" }}>
//                     <Grid item xs={12} md={6} sm={12}>
//                         <DigitalHardwareText>Digital Hardware Tracker</DigitalHardwareText>
//                         <Typography className="body1" style={styles.body1} sx={{ mt: 1 }}>
//                             Monitor your e-waste management efforts with ease
//                         </Typography>
//                     </Grid>
//                 </Grid>
//                 <Grid container spacing={2} sx={{ mt: 1 }} style={{ marginLeft: "1px" }}>
//                     <Grid item xs={12} lg={4} md={5}>
//                         <Tabs value={activeTab} onChange={handleTabChange} indicatorColor="none">

//                             <Tab
//                                 item xs={12} lg={4} md={5}
//                                 label={activeTab === 0 ? (
//                                     <StyledButton>
//                                         <TypographyButton>Environmental Impact</TypographyButton>
//                                     </StyledButton>
//                                 ) : (
//                                     <Typography className="body1">Environmental Impact</Typography>
//                                 )}
//                             />

//                             <Tab
//                                 item xs={12} lg={4} md={5}
//                                 label={activeTab === 1 ? (
//                                     <StyledButton>
//                                         <TypographyButton>Social Impact</TypographyButton>
//                                     </StyledButton>
//                                 ) : (
//                                     <Typography className="body1">Social Impact</Typography>
//                                 )}
//                             />
//                             {/* </Grid> */}
//                         </Tabs>
//                     </Grid>
//                 </Grid>

//                 <Grid
//                     container
//                     spacing={2}
//                     sx={{
//                         mt: 2,
//                         maxWidth: 'xl',
//                         margin: '0 auto'
//                     }}
//                 >
//                     <Grid item xs={12} sm={12} md={12}>
//                         {activeTab === 0 && (
//                             <EnvironmentalImpact />
//                         )}
//                         {activeTab === 1 && (
//                             <SocialImpactPage />
//                         )}
//                     </Grid>
//                 </Grid>
//             </Container>
//         </Container>
//     );
// }

// export default DashboardPage;



// import React, { useState } from 'react';
// import { Grid, Tabs, Tab, Typography, Box } from '@mui/material';
// import SocialImpactPage from "./SocialImpact";
// import EnvironmentalImpact from './EnvironmentalImpact';
// import { DigitalHardwareText, StyledButton, TypographyButton, styles } from './style';
// import { Container } from '@mui/system';

// function DashboardPage() {
//     const [activeTab, setActiveTab] = useState(0);
//     const handleTabChange = (event, newValue) => {
//         setActiveTab(newValue);
//     };

//     return (
//         <Container maxWidth="xxl">
//             <Container maxWidth="xl">
//                 <Grid container spacing={2} sx={{ mt: 1 }} style={{ marginLeft: "1px" }}>
//                     <Grid item xs={12} md={6} sm={12}>
//                         <DigitalHardwareText>Digital Hardware Tracker</DigitalHardwareText>
//                         <Typography className="body1" style={styles.body1} sx={{ mt: 1 }}>
//                             Monitor your e-waste management efforts with ease
//                         </Typography>
//                     </Grid>
//                 </Grid>
//                 <Grid container spacing={2} sx={{ mt: 1 }} style={{ marginLeft: "1px" }}>
//                     <Grid item xs={12}>
//                         <Tabs value={activeTab} onChange={handleTabChange} indicatorColor="none">
//                             <Grid container spacing={2}>
//                                 <Grid item xs={12} sm={12}>
//                                     <Tab
//                                         label={activeTab === 0 ? (
//                                             <StyledButton>
//                                                 <TypographyButton>Environmental Impact</TypographyButton>
//                                             </StyledButton>
//                                         ) : (
//                                             <Typography className="body1">Environmental Impact</Typography>
//                                         )}
//                                     />
//                                 </Grid>
//                                 <Grid item xs={12} sm={12}>
//                                     <Tab
//                                         label={activeTab === 1 ? (
//                                             <StyledButton>
//                                                 <TypographyButton>Social Impact</TypographyButton>
//                                             </StyledButton>
//                                         ) : (
//                                             <Typography className="body1">Social Impact</Typography>
//                                         )}
//                                     />
//                                 </Grid>
//                             </Grid>
//                         </Tabs>
//                     </Grid>
//                 </Grid>

//                 <Grid
//                     container
//                     spacing={2}
//                     sx={{
//                         mt: 2,
//                         maxWidth: 'xl',
//                         margin: '0 auto'
//                     }}
//                 >
//                     <Grid item xs={12} sm={12} md={12}>
//                         {activeTab === 0 && (
//                             <EnvironmentalImpact />
//                         )}
//                         {activeTab === 1 && (
//                             <SocialImpactPage />
//                         )}
//                     </Grid>
//                 </Grid>
//             </Container>
//         </Container>
//     );
// }

// export default DashboardPage;



// import React, { useState } from 'react';
// import { Grid, Typography, Box, Button } from '@mui/material';
// import SocialImpactPage from "./SocialImpact";
// import EnvironmentalImpact from './EnvironmentalImpact';
// import { DigitalHardwareText, StyledButton, TypographyButton, styles } from './style';
// import { Container } from '@mui/system';

// function DashboardPage() {
//     const [activeTab, setActiveTab] = useState(0);

//     const handleButtonClick = (tabIndex) => {
//         setActiveTab(tabIndex);
//     };

//     return (
//         <Container maxWidth="xxl">
//             <Container maxWidth="xl">
//                 <Grid container spacing={2} sx={{ mt: 1 }} style={{ marginLeft: "1px" }}>
//                     <Grid item xs={12} md={6} sm={12}>
//                         <DigitalHardwareText>Digital Hardware Tracker</DigitalHardwareText>
//                         <Typography className="body1" style={styles.body1} sx={{ mt: 1 }}>
//                             Monitor your e-waste management efforts with ease
//                         </Typography>
//                     </Grid>
//                 </Grid>

//                 <Grid container spacing={2} sx={{ mt: 1 }} style={{ marginLeft: "1px" }}>
//                     <Grid item xs={12} lg={4} md={5}>
//                         <Grid container spacing={2}>
//                             <Grid item xs={6}>
//                                 <Button
//                                     variant="contained"
//                                     onClick={() => handleButtonClick(0)}
//                                     sx={{ width: '100%', padding: '8px 16px', backgroundColor: activeTab === 0 ? 'primary.main' : 'grey.300' }}
//                                 >
//                                     <TypographyButton>Environmental Impact</TypographyButton>
//                                 </Button>
//                             </Grid>
//                             <Grid item xs={6}>
//                                 <Button
//                                     variant="contained"
//                                     onClick={() => handleButtonClick(1)}
//                                     sx={{ width: '100%', padding: '8px 16px', backgroundColor: activeTab === 1 ? 'primary.main' : 'grey.300' }}
//                                 >
//                                     <TypographyButton>Social Impact</TypographyButton>
//                                 </Button>
//                             </Grid>
//                         </Grid>
//                     </Grid>
//                 </Grid>

//                 <Grid
//                     container
//                     spacing={2}
//                     sx={{
//                         mt: 2,
//                         maxWidth: 'xl',
//                         margin: '0 auto'
//                     }}
//                 >
//                     <Grid item xs={12} sm={12} md={12}>
//                         {activeTab === 0 && (
//                             <EnvironmentalImpact />
//                         )}
//                         {activeTab === 1 && (
//                             <SocialImpactPage />
//                         )}
//                     </Grid>
//                 </Grid>
//             </Container>
//         </Container>
//     );
// }

// export default DashboardPage;



// import React, { useState } from 'react';
// import { Grid, Typography, Box, Button } from '@mui/material';
// import SocialImpactPage from "./SocialImpact";
// import EnvironmentalImpact from './EnvironmentalImpact';
// import { DigitalHardwareText, StyledButton, TypographyButton, styles } from './style';
// import { Container } from '@mui/system';

// function DashboardPage() {
//     const [activeTab, setActiveTab] = useState(null);

//     const handleButtonClick = (tabIndex) => {
//         setActiveTab(tabIndex);
//     };

//     return (
//         <Container maxWidth="xxl">
//             <Container maxWidth="xl">
//                 <Grid container spacing={2} sx={{ mt: 1 }} style={{ marginLeft: "1px" }}>
//                     <Grid item xs={12} md={6} sm={12}>
//                         <DigitalHardwareText>Digital Hardware Tracker</DigitalHardwareText>
//                         <Typography className="body1" style={styles.body1} sx={{ mt: 1 }}>
//                             Monitor your e-waste management efforts with ease
//                         </Typography>
//                     </Grid>
//                 </Grid>

//                 <Grid container spacing={2} sx={{ mt: 1 }} style={{ marginLeft: "1px" }}>
//                     <Grid item xs={12} lg={4} md={5}>
//                         <Grid container spacing={2}>
//                             <Grid item xs={6}>
//                                 {activeTab === null || activeTab === 0 ? (
//                                     <Typography
//                                         variant="body1"
//                                         sx={{ cursor: 'pointer', padding: '8px 16px' }}
//                                         onClick={() => handleButtonClick(0)}
//                                     >
//                                         Environmental Impact
//                                     </Typography>
//                                 ) : (
//                                     <Button
//                                         variant="contained"
//                                         onClick={() => handleButtonClick(0)}
//                                         sx={{ width: '100%', padding: '8px 16px', backgroundColor: activeTab === 0 ? 'primary.main' : 'grey.300' }}
//                                     >
//                                         <TypographyButton>Environmental Impact</TypographyButton>
//                                     </Button>
//                                 )}
//                             </Grid>
//                             <Grid item xs={6}>
//                                 {activeTab === null || activeTab === 1 ? (
//                                     <Typography
//                                         variant="body1"
//                                         sx={{ cursor: 'pointer', padding: '8px 16px' }}
//                                         onClick={() => handleButtonClick(1)}
//                                     >
//                                         Social Impact
//                                     </Typography>
//                                 ) : (
//                                     <Button
//                                         variant="contained"
//                                         onClick={() => handleButtonClick(1)}
//                                         sx={{ width: '100%', padding: '8px 16px', backgroundColor: activeTab === 1 ? 'primary.main' : 'grey.300' }}
//                                     >
//                                         <TypographyButton>Social Impact</TypographyButton>
//                                     </Button>
//                                 )}
//                             </Grid>
//                         </Grid>
//                     </Grid>
//                 </Grid>

//                 <Grid
//                     container
//                     spacing={2}
//                     sx={{
//                         mt: 2,
//                         maxWidth: 'xl',
//                         margin: '0 auto'
//                     }}
//                 >
//                     <Grid item xs={12} sm={12} md={12}>
//                         {activeTab === 0 && (
//                             <EnvironmentalImpact />
//                         )}
//                         {activeTab === 1 && (
//                             <SocialImpactPage />
//                         )}
//                     </Grid>
//                 </Grid>
//             </Container>
//         </Container>
//     );
// }

// export default DashboardPage;



// import React, { useState } from 'react';
// import { Grid, Typography, Button } from '@mui/material';
// import SocialImpactPage from "./SocialImpact";
// import EnvironmentalImpact from './EnvironmentalImpact';
// import { DigitalHardwareText, TypographyButton, styles } from './style';
// import { Container } from '@mui/system';

// function DashboardPage() {
//     const [activeTab, setActiveTab] = useState(null);

//     const handleButtonClick = (tabIndex) => {
//         setActiveTab(tabIndex);
//     };

//     return (
//         <Container maxWidth="xxl">
//             <Container maxWidth="xl">
//                 <Grid container spacing={2} sx={{ mt: 1 }} style={{ marginLeft: "1px" }}>
//                     <Grid item xs={12} md={6} sm={12}>
//                         <DigitalHardwareText>Digital Hardware Tracker</DigitalHardwareText>
//                         <Typography className="body1" style={styles.body1} sx={{ mt: 1 }}>
//                             Monitor your e-waste management efforts with ease
//                         </Typography>
//                     </Grid>
//                 </Grid>

//                 <Grid container spacing={2} sx={{ mt: 1 }} style={{ marginLeft: "1px" }}>
//                     <Grid item xs={12} lg={4} md={5}>
//                         <Grid container spacing={2}>
//                             <Grid item xs={6}>
//                                 <Button
//                                     variant={activeTab === 0 ? "contained" : "outlined"}
//                                     onClick={() => handleButtonClick(0)}
//                                     sx={{ width: '100%', padding: '8px 16px', backgroundColor: activeTab === 0 ? 'primary.main' : 'transparent', color: activeTab === 0 ? 'white' : 'black' }}
//                                 >
//                                     <TypographyButton>Environmental Impact</TypographyButton>
//                                 </Button>
//                             </Grid>
//                             <Grid item xs={6}>
//                                 <Button
//                                     variant={activeTab === 1 ? "contained" : "outlined"}
//                                     onClick={() => handleButtonClick(1)}
//                                     sx={{ width: '100%', padding: '8px 16px', backgroundColor: activeTab === 1 ? 'primary.main' : 'transparent', color: activeTab === 1 ? 'white' : 'black' }}
//                                 >
//                                     <TypographyButton>Social Impact</TypographyButton>
//                                 </Button>
//                             </Grid>
//                         </Grid>
//                     </Grid>
//                 </Grid>

//                 <Grid
//                     container
//                     spacing={2}
//                     sx={{
//                         mt: 2,
//                         maxWidth: 'xl',
//                         margin: '0 auto'
//                     }}
//                 >
//                     <Grid item xs={12} sm={12} md={12}>
//                         {activeTab === 0 && (
//                             <EnvironmentalImpact />
//                         )}
//                         {activeTab === 1 && (
//                             <SocialImpactPage />
//                         )}
//                     </Grid>
//                 </Grid>
//             </Container>
//         </Container>
//     );
// }

// export default DashboardPage;



// import React, { useState } from 'react';
// import { Grid, Typography, Button } from '@mui/material';
// import SocialImpactPage from "./SocialImpact";
// import EnvironmentalImpact from './EnvironmentalImpact';
// import { DigitalHardwareText, TypographyButton, styles } from './style';
// import { Container } from '@mui/system';

// function DashboardPage() {
//     const [activeTab, setActiveTab] = useState(0); // 0 for Environmental Impact, 1 for Social Impact

//     const handleButtonClick = (tabIndex) => {
//         setActiveTab(tabIndex);
//     };

//     return (
//         <Container maxWidth="xxl">
//             <Container maxWidth="xl">
//                 <Grid container spacing={2} sx={{ mt: 1 }} style={{ marginLeft: "1px" }}>
//                     <Grid item xs={12} md={6} sm={12}>
//                         <DigitalHardwareText>Digital Hardware Tracker</DigitalHardwareText>
//                         <Typography className="body1" style={styles.body1} sx={{ mt: 1 }}>
//                             Monitor your e-waste management efforts with ease
//                         </Typography>
//                     </Grid>
//                 </Grid>

//                 <Grid container spacing={2} sx={{ mt: 1 }} style={{ marginLeft: "1px" }}>
//                     <Grid item xs={12} lg={4} md={5}>
//                         <Grid container spacing={2}>
//                             <Grid item xs={6}>
//                                 <Button
//                                     variant={activeTab === 0 ? "contained" : "outlined"}
//                                     onClick={() => handleButtonClick(0)}
//                                     sx={{
//                                         width: '100%',
//                                         padding: '8px 16px',
//                                         backgroundColor: activeTab === 0 ? 'primary.main' : 'transparent',
//                                         color: activeTab === 0 ? 'white' : 'black',
//                                         borderColor: activeTab === 0 ? 'transparent' : 'black'
//                                     }}
//                                 >
//                                     <TypographyButton>Environmental Impact</TypographyButton>
//                                 </Button>
//                             </Grid>
//                             <Grid item xs={6}>
//                                 <Button
//                                     variant={activeTab === 1 ? "contained" : "outlined"}
//                                     onClick={() => handleButtonClick(1)}
//                                     sx={{
//                                         width: '100%',
//                                         padding: '8px 16px',
//                                         backgroundColor: activeTab === 1 ? 'primary.main' : 'transparent',
//                                         color: activeTab === 1 ? 'white' : 'black',
//                                         borderColor: activeTab === 1 ? 'transparent' : 'black'
//                                     }}
//                                 >
//                                     <TypographyButton>Social Impact</TypographyButton>
//                                 </Button>
//                             </Grid>
//                         </Grid>
//                     </Grid>
//                 </Grid>

//                 <Grid
//                     container
//                     spacing={2}
//                     sx={{
//                         mt: 2,
//                         maxWidth: 'xl',
//                         margin: '0 auto'
//                     }}
//                 >
//                     <Grid item xs={12} sm={12} md={12}>
//                         {activeTab === 0 && (
//                             <EnvironmentalImpact />
//                         )}
//                         {activeTab === 1 && (
//                             <SocialImpactPage />
//                         )}
//                     </Grid>
//                 </Grid>
//             </Container>
//         </Container>
//     );
// }

// export default DashboardPage;


// import React, { useState } from 'react';
// import { Grid, Typography, Button } from '@mui/material';
// import SocialImpactPage from "./SocialImpact";
// import EnvironmentalImpact from './EnvironmentalImpact';
// import { DigitalHardwareText, TypographyButton, styles } from './style';
// import { Container } from '@mui/system';

// function DashboardPage() {
//     const [activeTab, setActiveTab] = useState(0); // 0 for Environmental Impact, 1 for Social Impact

//     const handleButtonClick = (tabIndex) => {
//         setActiveTab(tabIndex);
//     };

//     return (
//         <Container maxWidth="xxl">
//             <Container maxWidth="xl">
//                 <Grid container spacing={2} sx={{ mt: 1 }} style={{ marginLeft: "1px" }}>
//                     <Grid item xs={12} md={6} sm={12}>
//                         <DigitalHardwareText>Digital Hardware Tracker</DigitalHardwareText>
//                         <Typography className="body1" style={styles.body1} sx={{ mt: 1 }}>
//                             Monitor your e-waste management efforts with ease
//                         </Typography>
//                     </Grid>
//                 </Grid>

//                 <Grid container spacing={2} sx={{ mt: 1 }} style={{ marginLeft: "1px" }}>
//                     <Grid item xs={12} lg={4} md={5}>
//                         <Grid container spacing={2}>
//                             <Grid item xs={6}>
//                                 <Button
//                                     variant={activeTab === 0 ? "contained" : "outlined"}
//                                     onClick={() => handleButtonClick(0)}
//                                     sx={{
//                                         width: '100%',
//                                         padding: '8px 16px',
//                                         backgroundColor: activeTab === 0 ? 'primary.main' : 'transparent',
//                                         color: activeTab === 0 ? 'white' : 'black',
//                                         borderColor: activeTab === 0 ? 'transparent' : 'black',
//                                         '&:hover': {
//                                             backgroundColor: activeTab === 0 ? 'primary.main' : 'transparent',
//                                             borderColor: activeTab === 0 ? 'transparent' : 'black',
//                                             color: activeTab === 0 ? 'white' : 'black',
//                                         },
//                                     }}
//                                 >
//                                     <TypographyButton>Environmental Impact</TypographyButton>
//                                 </Button>
//                             </Grid>
//                             <Grid item xs={6}>
//                                 <Button
//                                     variant={activeTab === 1 ? "contained" : "outlined"}
//                                     onClick={() => handleButtonClick(1)}
//                                     sx={{
//                                         width: '100%',
//                                         padding: '8px 16px',
//                                         backgroundColor: activeTab === 1 ? 'primary.main' : 'transparent',
//                                         color: activeTab === 1 ? 'white' : 'black',
//                                         borderColor: activeTab === 1 ? 'transparent' : 'black',
//                                         '&:hover': {
//                                             backgroundColor: activeTab === 1 ? 'primary.main' : 'transparent',
//                                             borderColor: activeTab === 1 ? 'transparent' : 'black',
//                                             color: activeTab === 1 ? 'white' : 'black',
//                                         },
//                                     }}
//                                 >
//                                     <TypographyButton>Social Impact</TypographyButton>
//                                 </Button>
//                             </Grid>
//                         </Grid>
//                     </Grid>
//                 </Grid>

//                 <Grid
//                     container
//                     spacing={2}
//                     sx={{
//                         mt: 2,
//                         maxWidth: 'xl',
//                         margin: '0 auto'
//                     }}
//                 >
//                     <Grid item xs={12} sm={12} md={12}>
//                         {activeTab === 0 && (
//                             <EnvironmentalImpact />
//                         )}
//                         {activeTab === 1 && (
//                             <SocialImpactPage />
//                         )}
//                     </Grid>
//                 </Grid>
//             </Container>
//         </Container>
//     );
// }

// export default DashboardPage;



// import React, { useState } from 'react';
// import { Grid, Typography, Button } from '@mui/material';
// import SocialImpactPage from "./SocialImpact";
// import EnvironmentalImpact from './EnvironmentalImpact';
// import { DigitalHardwareText, TypographyButton, styles } from './style';
// import { Container } from '@mui/system';

// function DashboardPage() {
//     const [activeTab, setActiveTab] = useState(0); // 0 for Environmental Impact, 1 for Social Impact

//     const handleButtonClick = (tabIndex) => {
//         setActiveTab(tabIndex);
//     };

//     return (
//         <Container maxWidth="xxl">
//             <Container maxWidth="xl">
//                 <Grid container spacing={2} sx={{ mt: 1 }} style={{ marginLeft: "1px" }}>
//                     <Grid item xs={12} md={6} sm={12}>
//                         <DigitalHardwareText>Digital Hardware Tracker</DigitalHardwareText>
//                         <Typography className="body1" style={styles.body1} sx={{ mt: 1 }}>
//                             Monitor your e-waste management efforts with ease
//                         </Typography>
//                     </Grid>
//                 </Grid>

//                 <Grid container spacing={2} sx={{ mt: 1 }} style={{ marginLeft: "1px" }}>
//                     <Grid item xs={12} lg={4} md={5}>
//                         <Grid container spacing={2}>
//                             <Grid item xs={6}>
//                                 <Button
//                                     variant={activeTab === 0 ? "contained" : "outlined"}
//                                     onClick={() => handleButtonClick(0)}
//                                     sx={{
//                                         width: '100%',
//                                         padding: '8px 16px',
//                                         backgroundColor: activeTab === 0 ? 'primary.main' : 'transparent',
//                                         color: activeTab === 0 ? 'white' : 'black',
//                                         border: activeTab === 0 ? 'none' : '1px solid black',
//                                         '&:hover': {
//                                             backgroundColor: activeTab === 0 ? 'primary.main' : 'transparent',
//                                             borderColor: activeTab === 0 ? 'transparent' : 'black',
//                                             color: 'black',
//                                         },
//                                     }}
//                                 >
//                                     <TypographyButton>Environmental Impact</TypographyButton>
//                                 </Button>
//                             </Grid>
//                             <Grid item xs={6}>
//                                 <Button
//                                     variant={activeTab === 1 ? "contained" : "outlined"}
//                                     onClick={() => handleButtonClick(1)}
//                                     sx={{
//                                         width: '100%',
//                                         padding: '8px 16px',
//                                         backgroundColor: activeTab === 1 ? 'primary.main' : 'transparent',
//                                         color: activeTab === 1 ? 'white' : 'black',
//                                         border: activeTab === 1 ? 'none' : '1px solid black',
//                                         '&:hover': {
//                                             backgroundColor: activeTab === 1 ? 'primary.main' : 'transparent',
//                                             borderColor: activeTab === 1 ? 'transparent' : 'black',
//                                             color: 'black',
//                                         },
//                                     }}
//                                 >
//                                     <TypographyButton>Social Impact</TypographyButton>
//                                 </Button>
//                             </Grid>
//                         </Grid>
//                     </Grid>
//                 </Grid>

//                 <Grid
//                     container
//                     spacing={2}
//                     sx={{
//                         mt: 2,
//                         maxWidth: 'xl',
//                         margin: '0 auto'
//                     }}
//                 >
//                     <Grid item xs={12} sm={12} md={12}>
//                         {activeTab === 0 && (
//                             <EnvironmentalImpact />
//                         )}
//                         {activeTab === 1 && (
//                             <SocialImpactPage />
//                         )}
//                     </Grid>
//                 </Grid>
//             </Container>
//         </Container>
//     );
// }

// export default DashboardPage;


// import React, { useState } from 'react';
// import { Grid, Typography, Button } from '@mui/material';
// import SocialImpactPage from "./SocialImpact";
// import EnvironmentalImpact from './EnvironmentalImpact';
// import { DigitalHardwareText, TypographyButton, styles } from './style';
// import { Container } from '@mui/system';

// function DashboardPage() {
//     const [activeTab, setActiveTab] = useState(0); // 0 for Environmental Impact, 1 for Social Impact

//     const handleButtonClick = (tabIndex) => {
//         setActiveTab(tabIndex);
//     };

//     return (
//         <Container maxWidth="xxl">
//             <Container maxWidth="xl">
//                 <Grid container spacing={2} sx={{ mt: 1 }} style={{ marginLeft: "1px" }}>
//                     <Grid item xs={12} md={6} sm={12}>
//                         <DigitalHardwareText>Digital Hardware Tracker</DigitalHardwareText>
//                         <Typography className="body1" style={styles.body1} sx={{ mt: 1 }}>
//                             Monitor your e-waste management efforts with ease
//                         </Typography>
//                     </Grid>
//                 </Grid>

//                 <Grid container spacing={2} sx={{ mt: 1 }} style={{ marginLeft: "1px" }}>
//                     <Grid item xs={12} lg={4} md={5}>
//                         <Grid container spacing={2}>
//                             <Grid item xs={6}>
//                                 <Button
//                                     variant={activeTab === 0 ? "contained" : "outlined"}
//                                     onClick={() => handleButtonClick(0)}
//                                     sx={{
//                                         width: '100%',
//                                         padding: '8px 16px',
//                                         backgroundColor: activeTab === 0 ? 'primary.main' : 'transparent',
//                                         color: activeTab === 0 ? 'white' : 'black',
//                                         border: activeTab === 0 ? 'none' : '1px solid black',
//                                         '&:hover': {
//                                             backgroundColor: activeTab === 0 ? 'primary.main' : 'transparent',
//                                             borderColor: activeTab === 0 ? 'transparent' : 'black',
//                                             color: 'black', // ensure hover text color is black for inactive buttons
//                                         },
//                                     }}
//                                 >
//                                     <TypographyButton>Environmental Impact</TypographyButton>
//                                 </Button>
//                             </Grid>
//                             <Grid item xs={6}>
//                                 <Button
//                                     variant={activeTab === 1 ? "contained" : "outlined"}
//                                     onClick={() => handleButtonClick(1)}
//                                     sx={{
//                                         width: '100%',
//                                         padding: '8px 16px',
//                                         backgroundColor: activeTab === 1 ? 'primary.main' : 'transparent',
//                                         color: activeTab === 1 ? 'white' : 'black',
//                                         border: activeTab === 1 ? 'none' : '1px solid black',
//                                         '&:hover': {
//                                             backgroundColor: activeTab === 1 ? 'primary.main' : 'transparent',
//                                             borderColor: activeTab === 1 ? 'transparent' : 'black',
//                                             color: 'black', // ensure hover text color is black for inactive buttons
//                                         },
//                                     }}
//                                 >
//                                     <TypographyButton style={{color:"black"}}>Social Impact</TypographyButton>
//                                 </Button>
//                             </Grid>
//                         </Grid>
//                     </Grid>
//                 </Grid>

//                 <Grid
//                     container
//                     spacing={2}
//                     sx={{
//                         mt: 2,
//                         maxWidth: 'xl',
//                         margin: '0 auto'
//                     }}
//                 >
//                     <Grid item xs={12} sm={12} md={12}>
//                         {activeTab === 0 && (
//                             <EnvironmentalImpact />
//                         )}
//                         {activeTab === 1 && (
//                             <SocialImpactPage />
//                         )}
//                     </Grid>
//                 </Grid>
//             </Container>
//         </Container>
//     );
// }

// export default DashboardPage;



// import React, { useState } from 'react';
// import { Grid, Typography, Button } from '@mui/material';
// import SocialImpactPage from "./SocialImpact";
// import EnvironmentalImpact from './EnvironmentalImpact';
// import { DigitalHardwareText, TypographyButton, styles } from './style';
// import { Container } from '@mui/system';

// function DashboardPage() {
//     const [activeTab, setActiveTab] = useState(0); // 0 for Environmental Impact, 1 for Social Impact

//     const handleButtonClick = (tabIndex) => {
//         setActiveTab(tabIndex);
//     };

//     return (
//         <Container maxWidth="xxl">
//             <Container maxWidth="xl">
//                 <Grid container spacing={2} sx={{ mt: 1 }} style={{ marginLeft: "1px" }}>
//                     <Grid item xs={12} md={6} sm={12}>
//                         <DigitalHardwareText>Digital Hardware Tracker</DigitalHardwareText>
//                         <Typography className="body1" style={styles.body1} sx={{ mt: 1 }}>
//                             Monitor your e-waste management efforts with ease
//                         </Typography>
//                     </Grid>
//                 </Grid>

//                 <Grid container spacing={2} sx={{ mt: 1 }} style={{ marginLeft: "1px" }}>
//                     <Grid item xs={12} lg={4} md={5}>
//                         <Grid container spacing={2}>
//                             <Grid item xs={6}>
//                                 <Button
//                                     variant="outlined" // use outlined variant but adjust styling
//                                     onClick={() => handleButtonClick(0)}
//                                     sx={{
//                                         width: '100%',
//                                         padding: '8px 16px',
//                                         backgroundColor: activeTab === 0 ? 'primary.main' : 'transparent',
//                                         color: activeTab === 0 ? 'white' : 'black',
//                                         border: 'none', // remove border
//                                         '&:hover': {
//                                             backgroundColor: activeTab === 0 ? 'primary.main' : 'transparent',
//                                             border: 'none', // remove border on hover
//                                             color: 'black', // ensure text color is black on hover for inactive buttons
//                                         },
//                                     }}
//                                 >
//                                     <TypographyButton>Environmental Impact</TypographyButton>
//                                 </Button>
//                             </Grid>
//                             <Grid item xs={6}>
//                                 <Button
//                                     variant="outlined" // use outlined variant but adjust styling
//                                     onClick={() => handleButtonClick(1)}
//                                     sx={{
//                                         borderRadius:"100px",
//                                         width: '100%',
//                                         padding: '8px 16px',
//                                         backgroundColor: activeTab === 1 ? 'primary.main' : 'transparent',
//                                         color: activeTab === 1 ? 'white' : 'black',
//                                         border: 'none', // remove border
//                                         '&:hover': {
//                                             backgroundColor: activeTab === 1 ? 'primary.main' : 'transparent',
//                                             border: 'none', // remove border on hover
//                                             color: 'black', // ensure text color is black on hover for inactive buttons
//                                         },
//                                     }}
//                                 >
//                                     <TypographyButton style={{color:"black"}}>Social Impact</TypographyButton>
//                                 </Button>
//                             </Grid>
//                         </Grid>
//                     </Grid>
//                 </Grid>

//                 <Grid
//                     container
//                     spacing={2}
//                     sx={{
//                         mt: 2,
//                         maxWidth: 'xl',
//                         margin: '0 auto'
//                     }}
//                 >
//                     <Grid item xs={12} sm={12} md={12}>
//                         {activeTab === 0 && (
//                             <EnvironmentalImpact />
//                         )}
//                         {activeTab === 1 && (
//                             <SocialImpactPage />
//                         )}
//                     </Grid>
//                 </Grid>
//             </Container>
//         </Container>
//     );
// }

// export default DashboardPage;



// import React, { useState } from 'react';
// import { Grid, Typography, Button } from '@mui/material';
// import SocialImpactPage from "./SocialImpact";
// import EnvironmentalImpact from './EnvironmentalImpact';
// import { TypographyButton, styles } from './style';
// import { Container } from '@mui/system';

// function DashboardPage() {
//     const [activeTab, setActiveTab] = useState(0); 

//     const handleButtonClick = (tabIndex) => {
//         setActiveTab(tabIndex);
//     };

//     return (
//         <Container maxWidth="xxl">
//             <Container maxWidth="xl">
//                 <Grid container spacing={2} sx={{ mt: 1 }} style={{ marginLeft: "1px" }}>
//                     <Grid item xs={12} md={6} sm={12} >
//                         <Typography style={styles.DigitalTitle} sx={{width:{sm:"100%"}}}>Digital Hardware Tracker</Typography>
//                         <Typography className="body1" style={styles.body1} sx={{ mt: 1 }}>
//                             Monitor your e-waste management efforts with ease
//                         </Typography>
//                     </Grid>
//                 </Grid>

//                 <Grid container spacing={2} sx={{ mt: 1 }} style={{ marginLeft: "1px" }}>
//                     <Grid item xs={12} lg={4} md={8}>
//                         <Grid container spacing={2}>
//                             <Grid item xs={12} lg={6} md={6} sm={6}>
//                                 <Button
//                                     variant="outlined" // use outlined variant but adjust styling
//                                     onClick={() => handleButtonClick(0)}
//                                     sx={{
//                                         width: '100%',
//                                         padding: '8px 16px',
//                                         backgroundColor: activeTab === 0 ? 'primary.main' : 'transparent',
//                                         color: activeTab === 0 ? 'black' : 'white',
//                                         border: 'none',
//                                         '&:hover': {
//                                             backgroundColor: activeTab === 0 ? 'primary.main' : 'transparent',
//                                             border: 'none',
//                                             color: 'white',
//                                         },
//                                         borderRadius: "50px",
//                                     }}
//                                 >
//                                     <TypographyButton style={{ color: "black" }}>Environmental Impact</TypographyButton>
//                                 </Button>
//                             </Grid>
//                             <Grid item xs={12} md={6} sm={6}>
//                                 <Button
//                                     variant="outlined"
//                                     onClick={() => handleButtonClick(1)}
//                                     sx={{
//                                         width: '100%',
//                                         backgroundColor: activeTab === 1 ? 'primary.main' : 'transparent',
//                                         color: activeTab === 1 ? 'red' : 'black',
//                                         border: 'none',
//                                         '&:hover': {
//                                             backgroundColor: activeTab === 1 ? 'primary.main' : 'transparent',
//                                             border: 'none',
//                                             color: 'black',
//                                         },
//                                         borderRadius: "50px"

//                                     }}
//                                 >
//                                     <TypographyButton style={{ color: "black" }}>Social Impact</TypographyButton>
//                                 </Button>
//                             </Grid>
//                         </Grid>
//                     </Grid>
//                 </Grid>

//                 <Grid
//                     container
//                     spacing={2}
//                     sx={{
//                         mt: 2,
//                         maxWidth: 'xl',
//                         margin: '0 auto'
//                     }}
//                 >
//                     <Grid item xs={12} sm={12} md={12}>
//                         {activeTab === 0 && (
//                             <EnvironmentalImpact />
//                         )}
//                         {activeTab === 1 && (
//                             <SocialImpactPage />
//                         )}
//                     </Grid>
//                 </Grid>
//             </Container>
//         </Container>
//     );
// }

// export default DashboardPage;


// import React, { useState } from 'react';
// import { Grid, Typography, Button } from '@mui/material';
// import SocialImpactPage from "./SocialImpact";
// import EnvironmentalImpact from './EnvironmentalImpact';
// import { TypographyButton, styles } from './style';
// import { Container } from '@mui/system';

// function DashboardPage() {
//     const [activeTab, setActiveTab] = useState(0);

//     const handleButtonClick = (tabIndex) => {
//         setActiveTab(tabIndex);
//     };

//     return (
//         <Container maxWidth="xxl">
//             <Container maxWidth="xl">
//                 <Grid container spacing={2} sx={{ mt: 1 }} style={{ marginLeft: "1px" }}>
//                     <Grid item xs={12} md={6} sm={12} >
//                         <Typography style={styles.DigitalTitle} sx={{ width: { sm: "100%" } }}>Digital Hardware Tracker</Typography>
//                         <Typography className="body1" style={styles.body1} sx={{ mt: 1 }}>
//                             Monitor your e-waste management efforts with ease
//                         </Typography>
//                     </Grid>
//                 </Grid>

//                 <Grid container spacing={2} sx={{ mt: 1 }} style={{ marginLeft: "1px" }}>
//                     <Grid item xs={12} lg={4} md={8}>
//                         <Grid container spacing={2}>
//                             <Grid item xs={12} lg={6} md={6} sm={6}>
//                                 <Button
//                                     variant="outlined"
//                                     onClick={() => handleButtonClick(0)}
//                                     sx={{
//                                         width: '100%',
//                                         padding: '8px 16px',
//                                         backgroundColor: activeTab === 0 ? 'primary.main' : 'transparent',
//                                         color: activeTab === 0 ? 'white' : 'black',
//                                         border: 'none',
//                                         '&:hover': {
//                                             backgroundColor: activeTab === 0 ? 'primary.main' : 'transparent',
//                                             color: activeTab === 0 ? 'white' : 'black',
//                                             border: 'none',
//                                         },
//                                         borderRadius: "50px",
//                                     }}
//                                 >
//                                     <TypographyButton style={{ color: activeTab === 0 ? 'white' : 'black' }}>Environmental Impact</TypographyButton>
//                                 </Button>
//                             </Grid>
//                             <Grid item xs={12} md={6} sm={6}>
//                                 <Button
//                                     variant="outlined"
//                                     onClick={() => handleButtonClick(1)}
//                                     sx={{
//                                         width: '100%',
//                                         backgroundColor: activeTab === 1 ? 'primary.main' : 'transparent',
//                                         color: activeTab === 1 ? 'white' : 'black',
//                                         border: 'none',
//                                         '&:hover': {
//                                             backgroundColor: activeTab === 1 ? 'primary.main' : 'transparent',
//                                             color: activeTab === 1 ? 'white' : 'black',
//                                             border: 'none',
//                                         },
//                                         borderRadius: "50px"
//                                     }}
//                                 >
//                                     <TypographyButton style={{ color: activeTab === 1 ? 'white' : 'black' }}>Social Impact</TypographyButton>
//                                 </Button>
//                             </Grid>
//                         </Grid>
//                     </Grid>
//                 </Grid>

//                 <Grid
//                     container
//                     spacing={2}
//                     sx={{
//                         mt: 2,
//                         maxWidth: 'xl',
//                         margin: '0 auto'
//                     }}
//                 >
//                     <Grid item xs={12} sm={12} md={12}>
//                         {activeTab === 0 && (
//                             <EnvironmentalImpact />
//                         )}
//                         {activeTab === 1 && (
//                             <SocialImpactPage />
//                         )}
//                     </Grid>
//                 </Grid>
//             </Container>
//         </Container>
//     );
// }

// export default DashboardPage;



import React, { useState } from 'react';
import { Grid, Typography, Button } from '@mui/material';
import SocialImpactPage from "./SocialImpact";
import EnvironmentalImpact from './EnvironmentalImpact';
import { TypographyButton, styles } from './style';
import { Container } from '@mui/system';

function DashboardPage() {
    const [activeTab, setActiveTab] = useState(0);

    const handleButtonClick = (tabIndex) => {
        setActiveTab(tabIndex);
    };

    return (
        <Container maxWidth="xxl">
            <Container maxWidth="xl">
                <Grid container spacing={2} sx={{ mt: 1 }} style={{ marginLeft: "1px" }}>
                    <Grid item xs={12} md={6} sm={12} >
                        <Typography style={styles.DigitalTitle} sx={{ width: { sm: "100%" } }}>Digital Hardware Tracker</Typography>
                        <Typography className="body1" style={styles.body1} sx={{ mt: 1 }}>
                            Monitor your e-waste management efforts with ease
                        </Typography>
                    </Grid>
                </Grid>

                <Grid container spacing={2} sx={{ mt: 1 }} style={{ marginLeft: "1px" }}>
                    <Grid item xs={12} lg={4} md={8}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} lg={6} md={6} sm={6}>
                                <Button
                                    variant="outlined"
                                    onClick={() => handleButtonClick(0)}
                                    sx={{
                                        width: { xs: '100%', sm: '80%',lg:"100%" }, // 50% on small screens, 100% on larger screens
                                        padding: '8px 16px',
                                        backgroundColor: activeTab === 0 ? 'primary.main' : 'transparent',
                                        color: activeTab === 0 ? 'white' : 'black',
                                        border: 'none',
                                        '&:hover': {
                                            backgroundColor: activeTab === 0 ? 'primary.main' : 'transparent',
                                            color: activeTab === 0 ? 'white' : 'black',
                                            border: 'none',
                                        },
                                        borderRadius: "50px",
                                    }}
                                >
                                    <TypographyButton style={{ color: activeTab === 0 ? 'white' : 'var(--text, #4A4A4A)' }}>Environmental Impact</TypographyButton>
                                </Button>
                            </Grid>
                            <Grid item xs={12} md={6} sm={6}>
                                <Button
                                    variant="outlined"
                                    onClick={() => handleButtonClick(1)}
                                    sx={{
                                        width: { xs: '100%', sm: '80%',lg:"100%" },
                                        backgroundColor: activeTab === 1 ? 'primary.main' : 'transparent',
                                        color: activeTab === 1 ? 'white' : 'black',
                                        border: 'none',
                                        '&:hover': {
                                            backgroundColor: activeTab === 1 ? 'primary.main' : 'transparent',
                                            color: activeTab === 1 ? 'white' : 'black',
                                            border: 'none',
                                        },
                                        borderRadius: "50px"
                                    }}
                                >
                                    <TypographyButton style={{ color: activeTab === 1 ? 'white' : 'var(--text, #4A4A4A)' }}>Social Impact</TypographyButton>
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>

                <Grid
                    container
                    spacing={2}
                    sx={{
                        mt: 2,
                        maxWidth: 'xl',
                        margin: '0 auto'
                    }}
                >
                    <Grid item xs={12} sm={12} md={12}>
                        {activeTab === 0 && (
                            <EnvironmentalImpact />
                        )}
                        {activeTab === 1 && (
                            <SocialImpactPage />
                        )}
                    </Grid>
                </Grid>
            </Container>
        </Container>
    );
}

export default DashboardPage;
