// import React from 'react';
// import Img1 from "./assets/img1 (copy).png";
// import Img2 from "./assets/img2.png";
// import Img3 from "./assets/img3.png";
// import Img4 from "./assets/img4.png";
// import Img5 from "./assets/img5.png";
// import Img6 from "./assets/img6.png";
// import Img7 from "./assets/img7.png";

// import group1 from "./assets/Group1.svg";
// import Group2 from "./assets/group2.svg";
// import Group3 from "./assets/Group3.svg";
// import Group4 from "./assets/Group4.svg";
// import Group5 from "./assets/Group5.svg";
// import Group6 from "./assets/group6.svg";
// import Group7 from "./assets/GroupIMg7.svg";
// import group8 from "./assets/group8 (copy).svg";
// import img7 from "./assets/IMG7.svg"
// import { Grid, Box, Container, Typography } from '@mui/material';
// import "../OurApproach.css";
// import "./style.css";
// import classes from "./style.js";
// import { Group } from '@mui/icons-material';

// const TimeLine = () => {
//   return (
//     <>
//       <Box paddingBottom="80px" sx={{ background: "rgba(248, 243, 240, 1)" }}>
//         <Container maxWidth="xl" sx={{ px: {md:9,sm:10,sm:10} }}>
//           <Grid container spacing={2}>
//             <Grid item xs={12} lg={5} md={7} sx={{ mt: "60px" }}>
//               <Typography variant='h5' color="primary.main">Our 3D model:</Typography>
//               <Typography variant='body1' sx={{ mt: 3 }}>Our 3D Model forms the backbone of our approach.
//                 Through this comprehensive approach, we transform e-waste
//                 into educational tools , thereby providing impact reports
//                 to our donors.
//               </Typography>
//             </Grid>
//           </Grid>
//           <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2 }}
//             sx={{ mt: 5, display: { xs: 'flex', lg: 'none', md: "none" } }}>
//             <main className="container-main" >
//               <Box className="container-timeline">
//                 <Box className="content-timeline active-content-timeline">
//                   <Box className="header-timeline">
//                     <Box >
//                       <Typography

//                         color="primary.main"
//                         variant="h6"
//                         sx={classes.typographyStyle}
//                         style={{ marginBottom: "40px" }}
//                       >
//                         Digital Resource Recovery
//                       </Typography>
//                     </Box>
//                     <span className="marker-timeline"></span>
//                     <img style={{ width: "170px" }} src={Img1}></img>
//                   </Box>
//                   <Box className="body-timeline">
//                     <Typography
//                       variant='body1'
//                       sx={classes.typographystyle}
//                     >
//                       We collect end-of-life laptops from corporate partners like you
//                     </Typography>
//                   </Box>

//                 </Box>
//                 <Box className="content-timeline">
//                   <Box className="header-timeline">
//                     <span className="marker-timeline"></span>
//                     <img style={{ width: "170px" }} src={Img2}></img>
//                   </Box>
//                   <Box className="body-timeline">
//                     <Typography
//                       variant='body1'
//                       sx={classes.typographystyle}
//                     >
//                       We ensure complete data erasure and privacy protection
//                     </Typography>
//                   </Box>
//                 </Box>

//                 <Box className="content-timeline">
//                   <Box className="header-timeline">
//                     <span className="marker-timeline"></span>
//                     <img style={{ width: "170px" }} src={Img3}></img>
//                   </Box>
//                   <Box className="body-timeline">
//                     <Typography
//                       variant='body1'
//                       sx={classes.typographystyle}
//                     >
//                       We restore and upgrade these laptops for educational use
//                     </Typography>
//                   </Box>
//                 </Box>
//                 <Box className="content-timeline">
//                   <Box className="header-timeline">

//                     <Box >
//                       <Typography
//                         color="primary.main"
//                         variant="h6"
//                         sx={classes.typographyStyle}
//                       >
//                         Digital Inclusion Pipeline
//                       </Typography>
//                     </Box>
//                     <span className="marker-timeline"></span>
//                     <img style={{ width: "170px", marginTop: "40px" }} src={Img4}></img>
//                   </Box>
//                   <Box className="body-timeline">
//                     <Typography
//                       variant='body1'
//                       sx={classes.typographystyle}
//                     >
//                       We create livelihood opportunities through our interventions
//                     </Typography>
//                   </Box>
//                 </Box>
//                 <Box className="content-timeline">
//                   <Box className="header-timeline">
//                     <span className="marker-timeline"></span>
//                     <img style={{ width: "170px" }} src={Img4}></img>
//                   </Box>
//                   <Box className="body-timeline">
//                     <Typography
//                       variant='body1'
//                       sx={classes.typographystyle}
//                     >
//                       We provide an ecosystem of pre-installed online and offline learning resources
//                     </Typography>
//                   </Box>
//                 </Box>
//                 <Box className="content-timeline">
//                   <Box className="header-timeline">
//                     <span className="marker-timeline"></span>
//                     <img style={{ width: "170px" }} src={Img5}></img>
//                   </Box>
//                   <Box className="body-timeline">
//                     <Typography
//                       variant='body1'
//                       sx={classes.typographystyle}
//                     >
//                       We connect with underserved communities through 200+ verified NGOs/Government Institutions
//                     </Typography>
//                   </Box>
//                 </Box>
//                 <Box className="content-timeline">
//                   <Box className="header-timeline">
//                     <span className="marker-timeline"></span>
//                     <Box style={{ marginTop: "30px" }}>
//                       <Typography
//                         color="primary.main"
//                         variant="h6"
//                         sx={classes.typographyStyle}
//                       >
//                         Digital Tracking and Reporting
//                       </Typography>
//                     </Box>
//                     <img src={Img6} style={{ width: "170px", marginTop: "40px" }}></img>
//                   </Box>
//                   <Box className="body-timeline">
//                     <Typography
//                       variant='body1'
//                       sx={classes.typographystyle}
//                     >
//                       We capture data on laptop’s lifecycle and community impact
//                     </Typography>
//                   </Box>
//                 </Box>

//                 <Box className="content-timeline">
//                   <Box className="header-timeline">
//                     <span className="marker-timeline"></span>
//                     <img style={{ width: "170px" }} src={Img7}></img>
//                   </Box>
//                   <Box className="body-timeline">
//                     <Typography
//                       variant='body1'
//                       sx={classes.typographystyle}
//                     >
//                       We generate transparent, real-time analytics on ESG outcomes
//                     </Typography>
//                   </Box>
//                 </Box>
//                 <Box className="content-timeline">
//                   <Box className="header-timeline">
//                     <span className="marker-timeline"></span>
//                     <img src={Img7}></img>
//                   </Box>
//                   <Box className="body-timeline">
//                     <Typography
//                       variant='body1'
//                       sx={classes.typographystyle}
//                     >
//                       We utilize insights to improve processes and maximize impact
//                     </Typography>
//                   </Box>
//                 </Box>
//               </Box>
//             </main>
//           </Grid>

//           <Grid container spacing={2} sx={{ display: { xs: 'none', lg: 'flex', md: 'flex' }, height: "auto" }}>
//             <div className="timeline">
//               <ul>
//                 <li>

//                   <Box
//                     sx={classes.titleBox}
//                   >
//                     <Typography variant='h6' color="primary.main"
//                       sx={{ padding: "32px" }}
//                     >
//                       Digital Tracking and Reporting
//                     </Typography>
//                   </Box>

//                   <Box sx={classes.containerBox}
//                   >
//                     <img
//                       style={classes.imageStyle}
//                       src={group1}
//                       alt="Digital Tracking and Reporting"
//                     />
//                     <Typography
//                       variant="body1"
//                       sx={{ ...classes.textStyle, textAlign: 'center' }}
//                       style={{ marginTop: '16px', marginLeft: '50px' }}
//                     >
//                       We collect end-of-life laptops from corporate partners like you
//                     </Typography>
//                   </Box>
//                 </li>
//                 <li>
//                   <Box
//                     sx={classes.protection}
//                   >
//                     <img
//                       style={{ width: '200px',position:"relative",bottom:"20px"}}
//                       src={Group2}
//                       alt="Digital Tracking and Reporting"
//                     />
//                     <Typography variant='body1'>
//                       We ensure complete data erasure and privacy protection
//                     </Typography>
//                   </Box>
//                 </li>
//                 <li>
//                   <Box
//                     sx={classes.educational}
//                   >
//                     <img
//                       style={{ width: '200px', marginBottom: '8px' }}
//                       src={Group3}
//                       alt="Digital Tracking and Reporting"
//                     />
//                     <Typography variant='body1' style={{ marginTop: "16px" }}>
//                       We restore and upgrade these laptops for educational use
//                     </Typography>
//                   </Box>
//                 </li>
//                 <li>
//                   <Box
//                     sx={classes.InclusionPipelineBox}
//                   >
//                     <Box sx={{ background: "rgba(206, 215, 206, 1)", width: "431px", height: "60px", borderRadius: "32px" }}>
//                       <Typography color="primary.main" variant='h6' sx={{ position: "relative", bottom: "17px", padding: "32px" }}>Digital Inclusion Pipeline</Typography>
//                     </Box>
//                   </Box>
//                 </li>
//                 <li>
//                   <Box
//                     sx={classes.interventions}
//                   >
//                     <img
//                       style={{ width: '200px', marginBottom: '8px' }}
//                       src={Group4}
//                       alt="Digital Tracking and Reporting"
//                     />
//                     <Typography variant='body1' style={{ marginTop: "16px" }}>
//                       We create livelihood opportunities through our interventions
//                     </Typography>
//                   </Box>
//                 </li>
//                 <li>
//                   <Box
//                     sx={{
//                       display: 'flex',
//                       flexDirection: 'column',
//                       alignItems: 'center',
//                       textAlign: 'center',
//                       padding: '16px',
//                       position: "relative",
//                       height: "15px",

//                     }}
//                   >

//                   </Box>
//                 </li>
//                 <li>
//                   <Box
//                     sx={{
//                       display: 'flex',
//                       flexDirection: 'column',
//                       alignItems: 'center',
//                       textAlign: 'center',
//                       padding: '16px',
//                       position: "relative",
//                       height: "135px",
//                     }}
//                   >

//                   </Box>
//                 </li>
//                 <li>
//                   <Box
//                     sx={classes.ecosystem}
//                   >
//                     <img
//                       style={{ width: '200px', marginBottom: '8px' }}
//                       src={Group5}
//                       alt="Digital Tracking and Reporting"
//                     />
//                     <Typography variant='body1' style={{ marginTop: "16px" }}>
//                       We provide an ecosystem of pre-installed online and offline learning resources
//                     </Typography>
//                   </Box>
//                 </li>
//                 <li>
//                   <Box
//                     sx={classes.communities}
//                   >
//                     <img
//                       style={{ width: '200px', marginBottom: '8px' }}
//                       src={Group6}
//                       alt="Digital Tracking and Reporting"
//                     />
//                     <Typography variant='body1' style={{ marginTop: "16px" }}>
//                       We connect with underserved communities through 200+ verified NGOs/Government Institutions
//                     </Typography>
//                   </Box>
//                 </li>
//                 <li>
//                   <Box
//                     sx={classes.Digital}
//                   >
//                     <Box sx={{ width: "491px", height: "60px", background: "rgba(206, 215, 206, 1)", borderRadius: "32px" }}>
//                       <Typography color="primary.main" variant='h6' sx={{ position: "relative", padding: "32px", bottom: "17px" }}>Digital Tracking and Reporting</Typography>
//                     </Box>

//                   </Box>
//                 </li>
//                 <li>
//                   <Box
//                     sx={classes.lifecycle}
//                   >
//                     <img
//                       style={{ width: '200px', marginBottom: '8px' }}
//                       src={Group7}
//                       alt="Digital Tracking and Reporting"
//                     />
//                     <Typography variant='body1' style={{ marginTop: "16px" }}>
//                       We capture data on laptop’s lifecycle and community impact
//                     </Typography>
//                   </Box>
//                 </li>
//                 <li>
//                   <Box
//                     sx={{
//                       display: 'flex',
//                       flexDirection: 'column',
//                       alignItems: 'center',
//                       textAlign: 'center',
//                       padding: '16px',
//                       position: "relative",
//                       height: "10px",
//                     }}
//                   >

//                   </Box>
//                 </li>
//                 <li>
//                   <Box
//                     sx={{
//                       display: 'flex',
//                       flexDirection: 'column',
//                       alignItems: 'center',
//                       textAlign: 'center',
//                       padding: '16px',
//                       position: "relative",
//                       height: "150px",
//                       top: "30px"
//                     }}
//                   >

//                   </Box>
//                 </li>
//                 <li>
//                   <Box
//                     sx={classes.analytics}
//                   >
//                     <img
//                       style={{ width: '200px', marginBottom: '8px' }}
//                       src={img7}
//                       alt="Digital Tracking and Reporting"
//                     />
//                     <Typography variant='body1' style={{ marginTop: "16px" }}>
//                       We generate transparent, real-time analytics on ESG outcomes
//                     </Typography>
//                   </Box>
//                 </li>
//                 <li
//                 >
//                   <Box
//                     sx={classes.impact}
//                     style={{ marginTop: "-39px" }}

//                   >
//                     <Box sx={{ mt: 13 }}>
//                       <img
//                         style={{ width: '200px' }}
//                         src={group8}
//                         alt="Digital Tracking and Reporting"
//                       />
//                       <Typography variant='body1' sx={{ mt: 4 }}>
//                         We utilize insights to improve processes and maximize impact
//                       </Typography>
//                     </Box>
//                   </Box>
//                 </li>
//               </ul>
//               <Box style={{ clear: "both" }}></Box>
//             </div>
//           </Grid>
//         </Container>
//       </Box >
//     </>
//   );
// };

// export default TimeLine;




// // // import React from 'react';
// // // import "./style.css";
// // // import { Container, Box } from '@mui/system';

// // // const data = [
// // //   {
// // //     id: 1,
// // //     subtitle: "We collect end-of-life laptops from corporate partners like you",
// // //   },
// // //   {
// // //     id: 2,
// // //     subtitle: "We ensure complete data erasure and privacy protection",
// // //   },
// // //   {
// // //     id: 3,
// // //     subtitle: "We restore and upgrade these laptops for educational use",
// // //   },
// // //   {
// // //     id: 4,
// // //     subtitle: "We create livelihood opportunities through our interventions"
// // //   },
// // //   {
// // //     id: 5,
// // //     subtitle: "We provide an ecosystem of pre-installed online and offline learning resources"
// // //   },
// // //   {
// // //     id: 6,
// // //     subtitle: "We connect with underserved communities through 200+ verified NGOs/Government Institutions"
// // //   },
// // //   {
// // //     id: 7,
// // //     subtitle: "We capture data on laptop’s lifecycle and community impact"
// // //   },
// // //   {
// // //     id: 8,
// // //     subtitle: "We generate transparent, real-time analytics on ESG outcomes"
// // //   },
// // //   {
// // //     id: 9,
// // //     subtitle: "We utilize insights to improve processes and maximize impact"
// // //   }
// // // ];

// // // function TimeLine() {
// // //   return (
// // //     <>
// // //       <Container>
// // //         <Box className="timeline">
// // //           <Box className="timeline-event" >
// // //             <Box className="card timeline-content">
// // //               <Box
// // //                 className="card-image waves-effect waves-block waves-light"
// // //                 sx={{border:"1px solid red",position:"relative",left:"290px", display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
// // //               >

// // //                 <span
// // //                   className="card-title gradient white-text text-darken-4"
// // //                   style={{ textAlign: 'center' }}
// // //                 >
// // //                   2018
// // //                   <br />
// // //                   <small>January 17th</small>
// // //                   <p>We utilize insights to improve processes and maximize </p>
// // //                 </span>
// // //               </Box>
// // //               <Box
// // //                 className="card-content teal white-text"
// // //                 sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}
// // //               >
// // //               </Box>
// // //             </Box>
// // //             <Box className="timeline-badge red lighten-3 white-text"></Box>
// // //           </Box>
// // //           <Box className="timeline-event" >
// // //             <Box className="card timeline-content">
// // //               <Box
// // //                 className="card-image waves-effect waves-block waves-light"
// // //                 sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
// // //               >
// // //                 <span
// // //                   className="card-title gradient white-text text-darken-4"
// // //                   style={{ textAlign: 'center' }}
// // //                 >
// // //                   2018
// // //                   <br />
// // //                   <small>January 17th</small>
// // //                   <p>We utilize insights to improve processes and maximize </p>
// // //                 </span>
// // //               </Box>
// // //               <Box
// // //                 className="card-content teal white-text"
// // //                 sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}
// // //               >
// // //               </Box>
// // //             </Box>
// // //             <Box className="timeline-badge red lighten-3 white-text"></Box>
// // //           </Box>
// // //           <Box className="timeline-event" >
// // //             <Box className="card timeline-content">
// // //               <Box
// // //                 className="card-image waves-effect waves-block waves-light"
// // //                 sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
// // //               >

// // //                 <span
// // //                   className="card-title gradient white-text text-darken-4"
// // //                   style={{ textAlign: 'center' }}
// // //                 >
// // //                   2018
// // //                   <br />
// // //                   <small>January 17th</small>
// // //                   <p>We utilize insights to improve processes and maximize </p>
// // //                 </span>
// // //               </Box>
// // //               <Box
// // //                 className="card-content teal white-text"
// // //                 sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}
// // //               >
// // //               </Box>
// // //             </Box>
// // //             <Box className="timeline-badge red lighten-3 white-text"></Box>
// // //           </Box>
// // //           <Box className="timeline-event" >
// // //             <Box className="card timeline-content">
// // //               <Box
// // //                 className="card-image waves-effect waves-block waves-light"
// // //                 sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
// // //               >

// // //                 <span
// // //                   className="card-title gradient white-text text-darken-4"
// // //                   style={{ textAlign: 'center' }}
// // //                 >
// // //                   2018
// // //                   <br />
// // //                   <small>January 17th</small>
// // //                   <p>We utilize insights to improve processes and maximize </p>

// // //                 </span>
// // //               </Box>
// // //               <Box
// // //                 className="card-content teal white-text"
// // //                 sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}
// // //               >
// // //               </Box>
// // //             </Box>
// // //             <Box className="timeline-badge red lighten-3 white-text"></Box>
// // //           </Box>
// // //           <Box className="timeline-event" >
// // //             <Box className="card timeline-content">
// // //               <Box
// // //                 className="card-image waves-effect waves-block waves-light"
// // //                 sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
// // //               >

// // //                 <span
// // //                   className="card-title gradient white-text text-darken-4"
// // //                   style={{ textAlign: 'center' }}
// // //                 >
// // //                   2018
// // //                   <br />
// // //                   <small>January 17th</small>
// // //                 </span>
// // //                 <p>We utilize insights to improve processes and maximize </p>

// // //               </Box>
// // //               <Box
// // //                 className="card-content teal white-text"
// // //                 sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}
// // //               >
// // //               </Box>
// // //             </Box>
// // //             <Box className="timeline-badge red lighten-3 white-text"></Box>
// // //           </Box>
// // //           <Box className="timeline-event" >
// // //             <Box className="card timeline-content">
// // //               <Box
// // //                 className="card-image waves-effect waves-block waves-light"
// // //                 sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
// // //               >

// // //                 <span
// // //                   className="card-title gradient white-text text-darken-4"
// // //                   style={{ textAlign: 'center' }}
// // //                 >
// // //                   2018
// // //                   <br />
// // //                   <small>January 17th</small>
// // //                 </span>
// // //               </Box>
// // //               <Box
// // //                 className="card-content teal white-text"
// // //                 sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}
// // //               >
// // //                 <p>We utilize insights to improve processes and maximize </p>

// // //               </Box>
// // //             </Box>
// // //             <Box className="timeline-badge red lighten-3 white-text"></Box>
// // //           </Box>
// // //           <Box className="timeline-event" >
// // //             <Box className="card timeline-content">
// // //               <Box
// // //                 className="card-image waves-effect waves-block waves-light"
// // //                 sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
// // //               >

// // //                 <span
// // //                   className="card-title gradient white-text text-darken-4"
// // //                   style={{ textAlign: 'center' }}
// // //                 >
// // //                   2018
// // //                   <br />
// // //                   <small>January 17th</small>
// // //                 </span>
// // //               </Box>
// // //               <Box
// // //                 className="card-content teal white-text"
// // //                 sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}
// // //               >
// // //                 <p>We utilize insights to improve processes and maximize </p>
// // //               </Box>
// // //             </Box>
// // //             <Box className="timeline-badge red lighten-3 white-text"></Box>
// // //           </Box>
// // //         </Box>
// // //       </Container>
// // //     </>
// // //   );
// // // }

// // // export default TimeLine;




// import "./style.css";
// function TimeLine() {
//   return (
//     <>
//       <div class="my-timeline">
//         <div class="my-container left-container">
//           <h5>Year 1994</h5>
//           <div class="text-box">
//             <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, rerum! Non, laborum illum ea at ducimus, quia animi veniam, sapiente laudantium saepe magni aliquid dignissimos rerum quam placeat consectetur! Assumenda.</p>
//           </div>
//           <img class="timeline-image" src="http://flagcorp.brandedbybrandemic.com/wp-content/uploads/2023/10/Frame-39652-1.svg" alt="">
//         </div>

//         <div class="my-container right-container">
//           <h5>Year 1996</h5>
//           <div class="text-box">
//             <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, rerum! Non, laborum illum ea at ducimus, quia animi veniam, sapiente laudantium saepe magni aliquid dignissimos rerum quam placeat consectetur! Assumenda.</p>
//           </div>
//           <img class="timeline-image" src="http://flagcorp.brandedbybrandemic.com/wp-content/uploads/2023/10/Frame-39652-1.svg" alt="">
//         </div>

//         <div class="my-container left-container">
//           <h5>Year 1998</h5>
//           <div class="text-box">
//             <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, rerum! Non, laborum illum ea at ducimus, quia animi veniam, sapiente laudantium saepe magni aliquid dignissimos rerum quam placeat consectetur! Assumenda.</p>
//           </div>
//           <img class="timeline-image" src="http://flagcorp.brandedbybrandemic.com/wp-content/uploads/2023/10/Frame-39652-1.svg" alt="">
//         </div>

//         <div class="my-container right-container">
//           <h5>Year 2000</h5>
//           <div class="text-box">
//             <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, rerum! Non, laborum illum ea at ducimus, quia animi veniam, sapiente laudantium saepe magni aliquid dignissimos rerum quam placeat consectetur! Assumenda.</p>
//           </div>
//           <!-- No circle for this item -->
//         </div>

//         <div class="my-container left-container">
//           <h5>Year 2001</h5>
//           <div class="text-box">
//             <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, rerum! Non, laborum illum ea at ducimus, quia animi veniam, sapiente laudantium saepe magni aliquid dignissimos rerum quam placeat consectetur! Assumenda.</p>
//           </div>
//           <img class="timeline-image" src="http://flagcorp.brandedbybrandemic.com/wp-content/uploads/2023/10/Frame-39652-1.svg" alt="">
//         </div>

//         <div class="my-container right-container">
//           <h5>Year 2002</h5>
//           <div class="text-box">
//             <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, rerum! Non, laborum illum ea at ducimus, quia animi veniam, sapiente laudantium saepe magni aliquid dignissimos rerum quam placeat consectetur! Assumenda.</p>
//           </div>
//           <img class="timeline-image" src="http://flagcorp.brandedbybrandemic.com/wp-content/uploads/2023/10/Frame-39652-1.svg" alt="">
//         </div>

//         <div class="my-container left-container">
//           <h5>Year 2004</h5>
//           <div class="text-box">
//             <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, rerum! Non, laborum illum ea at ducimus, quia animi veniam, sapiente laudantium saepe magni aliquid dignissimos rerum quam placeat consectetur! Assumenda.</p>
//           </div>
//           <img class="timeline-image" src="http://flagcorp.brandedbybrandemic.com/wp-content/uploads/2023/10/Frame-39652-1.svg" alt="">
//         </div>

//         <div class="my-container right-container">
//           <h5>Year 2008</h5>
//           <div class="text-box">
//             <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, rerum! Non, laborum illum ea at ducimus, quia animi veniam, sapiente laudantium saepe magni aliquid dignissimos rerum quam placeat consectetur! Assumenda.</p>
//           </div>
//           {/* <!-- No circle for this item --> */}
//         </div>

//         <div class="timeline-line"></div>
//       </div>

//     </>
//   )
// }
// export default TimeLine;




// import "./style.css";

// function TimeLine() {
//   return (
//     <>
//       <div className="my-timeline">
//         <div className="my-container left-container">
//           <h5>Year 1994</h5>
//           <div className="text-box">
//             <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, rerum! Non, laborum illum ea at ducimus, quia animi veniam, sapiente laudantium saepe magni aliquid dignissimos rerum quam placeat consectetur! Assumenda.</p>
//           </div>
//           <img className="timeline-image" src="http://flagcorp.brandedbybrandemic.com/wp-content/uploads/2023/10/Frame-39652-1.svg" alt=""/>
//         </div>

//         <div className="my-container right-container">
//           <h5>Year 1996</h5>
//           <div className="text-box">
//             <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, rerum! Non, laborum illum ea at ducimus, quia animi veniam, sapiente laudantium saepe magni aliquid dignissimos rerum quam placeat consectetur! Assumenda.</p>
//           </div>
//           <img className="timeline-image" src="http://flagcorp.brandedbybrandemic.com/wp-content/uploads/2023/10/Frame-39652-1.svg" alt=""/>
//         </div>

//         <div className="my-container left-container">
//           <h5>Year 1998</h5>
//           <div className="text-box">
//             <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, rerum! Non, laborum illum ea at ducimus, quia animi veniam, sapiente laudantium saepe magni aliquid dignissimos rerum quam placeat consectetur! Assumenda.</p>
//           </div>
//           <img className="timeline-image" src="http://flagcorp.brandedbybrandemic.com/wp-content/uploads/2023/10/Frame-39652-1.svg" alt=""/>
//         </div>

//         <div className="my-container right-container">
//           <h5>Year 2000</h5>
//           <div className="text-box">
//             <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, rerum! Non, laborum illum ea at ducimus, quia animi veniam, sapiente laudantium saepe magni aliquid dignissimos rerum quam placeat consectetur! Assumenda.</p>
//           </div>
//           {/* No circle for this item */}
//         </div>

//         <div className="my-container left-container">
//           <h5>Year 2001</h5>
//           <div className="text-box">
//             <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, rerum! Non, laborum illum ea at ducimus, quia animi veniam, sapiente laudantium saepe magni aliquid dignissimos rerum quam placeat consectetur! Assumenda.</p>
//           </div>
//           <img className="timeline-image" src="http://flagcorp.brandedbybrandemic.com/wp-content/uploads/2023/10/Frame-39652-1.svg" alt=""/>
//         </div>

//         <div className="my-container right-container">
//           <h5>Year 2002</h5>
//           <div className="text-box">
//             <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, rerum! Non, laborum illum ea at ducimus, quia animi veniam, sapiente laudantium saepe magni aliquid dignissimos rerum quam placeat consectetur! Assumenda.</p>
//           </div>
//           <img className="timeline-image" src="http://flagcorp.brandedbybrandemic.com/wp-content/uploads/2023/10/Frame-39652-1.svg" alt=""/>
//         </div>

//         <div className="my-container left-container">
//           <h5>Year 2004</h5>
//           <div className="text-box">
//             <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, rerum! Non, laborum illum ea at ducimus, quia animi veniam, sapiente laudantium saepe magni aliquid dignissimos rerum quam placeat consectetur! Assumenda.</p>
//           </div>
//           <img className="timeline-image" src="http://flagcorp.brandedbybrandemic.com/wp-content/uploads/2023/10/Frame-39652-1.svg" alt=""/>
//         </div>

//         <div className="my-container right-container">
//           <h5>Year 2008</h5>
//           <div className="text-box">
//             <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, rerum! Non, laborum illum ea at ducimus, quia animi veniam, sapiente laudantium saepe magni aliquid dignissimos rerum quam placeat consectetur! Assumenda.</p>
//           </div>
//         </div>

//         <div className="timeline-line"></div>
//       </div>
//     </>
//   );
// }

// export default TimeLine;



// import "./style.css";

// function TimeLine() {
//   return (
//     <>
//       <div className="my-timeline">
//         <div className="my-container left-container">
//           <div className="timeline-point"></div>
//           <h5>Year 1994</h5>
//           <div className="text-box">
//             <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, rerum! Non, laborum illum ea at ducimus, quia animi veniam, sapiente laudantium saepe magni aliquid dignissimos rerum quam placeat consectetur! Assumenda.</p>
//           </div>
//           <img className="timeline-image" src="http://flagcorp.brandedbybrandemic.com/wp-content/uploads/2023/10/Frame-39652-1.svg" alt="" />
//         </div>

//         <div className="my-container right-container">
//           <div className="timeline-point"></div>
//           <h5>Year 1996</h5>
//           <div className="text-box">
//             <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, rerum! Non, laborum illum ea at ducimus, quia animi veniam, sapiente laudantium saepe magni aliquid dignissimos rerum quam placeat consectetur! Assumenda.</p>
//           </div>
//           <img className="timeline-image" src="http://flagcorp.brandedbybrandemic.com/wp-content/uploads/2023/10/Frame-39652-1.svg" alt="" />
//         </div>

//         <div className="my-container left-container">
//           <div className="timeline-point"></div>
//           <h5>Year 1998</h5>
//           <div className="text-box">
//             <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, rerum! Non, laborum illum ea at ducimus, quia animi veniam, sapiente laudantium saepe magni aliquid dignissimos rerum quam placeat consectetur! Assumenda.</p>
//           </div>
//           <img className="timeline-image" src="http://flagcorp.brandedbybrandemic.com/wp-content/uploads/2023/10/Frame-39652-1.svg" alt="" />
//         </div>

//         <div className="my-container right-container">
//           {/* No circle for this item */}
//           <h5>Year 2000</h5>
//           <div className="text-box">
//             <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, rerum! Non, laborum illum ea at ducimus, quia animi veniam, sapiente laudantium saepe magni aliquid dignissimos rerum quam placeat consectetur! Assumenda.</p>
//           </div>
//         </div>

//         <div className="my-container left-container">
//           <div className="timeline-point"></div>
//           <h5>Year 2001</h5>
//           <div className="text-box">
//             <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, rerum! Non, laborum illum ea at ducimus, quia animi veniam, sapiente laudantium saepe magni aliquid dignissimos rerum quam placeat consectetur! Assumenda.</p>
//           </div>
//           <img className="timeline-image" src="http://flagcorp.brandedbybrandemic.com/wp-content/uploads/2023/10/Frame-39652-1.svg" alt="" />
//         </div>

//         <div className="my-container right-container">
//           <div className="timeline-point"></div>
//           <h5>Year 2002</h5>
//           <div className="text-box">
//             <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, rerum! Non, laborum illum ea at ducimus, quia animi veniam, sapiente laudantium saepe magni aliquid dignissimos rerum quam placeat consectetur! Assumenda.</p>
//           </div>
//           <img className="timeline-image" src="http://flagcorp.brandedbybrandemic.com/wp-content/uploads/2023/10/Frame-39652-1.svg" alt="" />
//         </div>

//         <div className="my-container left-container">
//           <div className="timeline-point"></div>
//           <h5>Year 2004</h5>
//           <div className="text-box">
//             <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, rerum! Non, laborum illum ea at ducimus, quia animi veniam, sapiente laudantium saepe magni aliquid dignissimos rerum quam placeat consectetur! Assumenda.</p>
//           </div>
//           <img className="timeline-image" src="http://flagcorp.brandedbybrandemic.com/wp-content/uploads/2023/10/Frame-39652-1.svg" alt="" />
//         </div>

//         <div className="my-container right-container">
//           {/* No circle for this item */}
//           <h5>Year 2008</h5>
//           <div className="text-box">
//             <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, rerum! Non, laborum illum ea at ducimus, quia animi veniam, sapiente laudantium saepe magni aliquid dignissimos rerum quam placeat consectetur! Assumenda.</p>
//           </div>
//         </div>

//         <div className="timeline-line"></div>
//       </div>
//     </>
//   );
// }

// export default TimeLine;

import "./style.css";
export default function TimeLine() {
  return (
    <>
      <div className="my-timeline">
        <div className="my-container left-container">
          <div className="timeline-point">
            <div className="circle"></div> {/* Added circle */}
          </div>
          <h5>Year 1994</h5>
          <div className="text-box">
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, rerum! Non, laborum illum ea at ducimus, quia animi veniam, sapiente laudantium saepe magni aliquid dignissimos rerum quam placeat consectetur! Assumenda.</p>
          </div>
          <img className="timeline-image" src="http://flagcorp.brandedbybrandemic.com/wp-content/uploads/2023/10/Frame-39652-1.svg" alt="" />
        </div>

        <div className="my-container right-container">
          <div className="timeline-point">
            <div className="circle"></div> {/* Added circle */}
          </div>
          <h5>Year 1996</h5>
          <div className="text-box">
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, rerum! Non, laborum illum ea at ducimus, quia animi veniam, sapiente laudantium saepe magni aliquid dignissimos rerum quam placeat consectetur! Assumenda.</p>
          </div>
          <img className="timeline-image" src="http://flagcorp.brandedbybrandemic.com/wp-content/uploads/2023/10/Frame-39652-1.svg" alt="" />
        </div>

        <div className="my-container left-container">
          <div className="timeline-point">
            <div className="circle"></div> {/* Added circle */}
          </div>
          <h5>Year 1998</h5>
          <div className="text-box">
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, rerum! Non, laborum illum ea at ducimus, quia animi veniam, sapiente laudantium saepe magni aliquid dignissimos rerum quam placeat consectetur! Assumenda.</p>
          </div>
          <img className="timeline-image" src="http://flagcorp.brandedbybrandemic.com/wp-content/uploads/2023/10/Frame-39652-1.svg" alt="" />
        </div>

        <div className="my-container right-container">
          {/* No circle for this item */}
          <h5>Year 2000</h5>
          <div className="text-box">
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, rerum! Non, laborum illum ea at ducimus, quia animi veniam, sapiente laudantium saepe magni aliquid dignissimos rerum quam placeat consectetur! Assumenda.</p>
          </div>
        </div>

        <div className="my-container left-container">
          <div className="timeline-point">
            <div className="circle"></div> {/* Added circle */}
          </div>
          <h5>Year 2001</h5>
          <div className="text-box">
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, rerum! Non, laborum illum ea at ducimus, quia animi veniam, sapiente laudantium saepe magni aliquid dignissimos rerum quam placeat consectetur! Assumenda.</p>
          </div>
          <img className="timeline-image" src="http://flagcorp.brandedbybrandemic.com/wp-content/uploads/2023/10/Frame-39652-1.svg" alt="" />
        </div>

        <div className="my-container right-container">
          <div className="timeline-point">
            <div className="circle"></div> {/* Added circle */}
          </div>
          <h5>Year 2002</h5>
          <div className="text-box">
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, rerum! Non, laborum illum ea at ducimus, quia animi veniam, sapiente laudantium saepe magni aliquid dignissimos rerum quam placeat consectetur! Assumenda.</p>
          </div>
          <img className="timeline-image" src="http://flagcorp.brandedbybrandemic.com/wp-content/uploads/2023/10/Frame-39652-1.svg" alt="" />
        </div>

        <div className="my-container left-container">
          <div className="timeline-point">
            <div className="circle"></div> {/* Added circle */}
          </div>
          <h5>Year 2004</h5>
          <div className="text-box">
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, rerum! Non, laborum illum ea at ducimus, quia animi veniam, sapiente laudantium saepe magni aliquid dignissimos rerum quam placeat consectetur! Assumenda.</p>
          </div>
          <img className="timeline-image" src="http://flagcorp.brandedbybrandemic.com/wp-content/uploads/2023/10/Frame-39652-1.svg" alt="" />
        </div>

        <div className="my-container right-container">
          {/* No circle for this item */}
          <h5>Year 2008</h5>
          <div className="text-box">
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, rerum! Non, laborum illum ea at ducimus, quia animi veniam, sapiente laudantium saepe magni aliquid dignissimos rerum quam placeat consectetur! Assumenda.</p>
          </div>
        </div>

        <div className="timeline-line"></div>
      </div>
    </>
  );
}
