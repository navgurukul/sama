import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Avatar,
  Grid,
  Container,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from '@mui/material';
import { Business, LocationOn } from '@mui/icons-material';
import DownloadIcon from "@mui/icons-material/Download";
import DashboardHeader from './DashboardHeader';

const Ngopartner = () => {
  const [ngoPartner, setNgoPartner] = useState([]);
  const [visibleCount, setVisibleCount] = useState(4);
  const [expandedCard, setExpandedCard] = useState(null);
  const [activeType, setActiveType] = useState(null);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [uniqueOrganizations, setUniqueOrganizations] = useState([]);
  const [filteredNgoPartner, setFilteredNgoPartner] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [laptopRes, ngoRes, userRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`),
          fetch(`${process.env.REACT_APP_NgoInformationApi}?type=registration`),
          fetch(`${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getUserData`)
        ]);

        const [laptopJson, ngoJson, userJson] = await Promise.all([
          laptopRes.json(),
          ngoRes.json(),
          userRes.json()
        ]);

        const approved = ngoJson.data?.filter((ngo) => ngo.Status === "Approved") || [];

        const partners = approved.map((ngo) => {
          const laptopsAllocated = laptopJson.filter(
            (laptop) =>
              String(laptop["Allocated To"]).trim().toLowerCase() ===
              String(ngo.organizationName).trim().toLowerCase()
          );

          const beneficiariesList = userJson.filter(
            (user) =>
              String(user.Ngo).trim() === String(ngo.Id).trim() ||
              String(user.ngoId).trim() === String(ngo.Id).trim()
          );

          return {
            id: ngo.Id,
            name: ngo.organizationName,
            status: ngo.Status,
            location: ngo.location || "Unknown",
            laptops: laptopsAllocated,        // store array, not length
            beneficiaries: beneficiariesList, // store array, not length
            lastDelivery: ngo.lastDelivery || "N/A",
          };

        });

        setNgoPartner(partners);
        setFilteredNgoPartner(partners);
         const orgs = [...new Set(partners.map(partner => partner.name))].sort();
        setUniqueOrganizations(orgs);
      } catch (err) {
        console.error("Error fetching NGO partner data:", err);
      }
    };

    fetchData();
  }, []);

  const handleOrganizationChange = (org) => {
    setSelectedOrganization(org);
    
    if (!org) {
      setFilteredNgoPartner(ngoPartner);
    } else {
      const filtered = ngoPartner.filter(partner => 
        partner.name.toLowerCase() === org.toLowerCase()
      );
      setFilteredNgoPartner(filtered);
    }
    
    // Reset visible count and expanded card when filter changes
    setVisibleCount(4);
    setExpandedCard(null);
  };

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 4);
  };

  const handleToggle = (id, type) => {
    if (expandedCard === id && activeType === type) {
      setExpandedCard(null);
      setActiveType(null);
    } else {
      setExpandedCard(id);
      setActiveType(type);
    }
  };

  const handleExport = () => {
    let csvContent = "data:text/csv;charset=utf-8,";

    ngoPartner.forEach(partner => {
      csvContent += `\n${partner.name} - Laptop Data\n`;
      csvContent += "Laptop ID,Manufacturer Model,Status,Working\n";
      partner.laptops.forEach(item => {
        csvContent += `${item.ID},${item["Manufacturer Model"]},${item.Status},${item.Working ? "Yes" : "No"}\n`;
      });

      csvContent += `\n${partner.name} - Beneficiary Data\n`;
      csvContent += "NGO,Status,Laptop Assigned\n";
      partner.beneficiaries.forEach(item => {
        csvContent += `${item.Ngo},${item.status},${item["Laptop Assigned"]}\n`;
      });

      csvContent += "\n";
    });

    const blob = new Blob([decodeURIComponent(encodeURI(csvContent))], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "NGO_Laptop_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <>
      {/* Header */}
      <DashboardHeader
        uniqueOrganizations={uniqueOrganizations}
        onOrganizationChange={handleOrganizationChange}
        onExport={handleExport}
      />


      {/* NGO Partners */}
      <Container maxWidth="xl" sx={{ py: 3, bgcolor: '#f9f9f9', mt: 4 }}>
        <Box
          sx={{
            mb: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
            NGO Partners
             {selectedOrganization && (
              <Chip
                label={`Filtered: ${selectedOrganization}`}
                size="small"
                variant="outlined"
                sx={{ ml: 2 }}
              />
            )}
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', fontSize: '14px' }}>
            {filteredNgoPartner.length} of {ngoPartner.length} organizations receiving laptops
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredNgoPartner.slice(0, visibleCount).map((partner) => (
            <Card key={partner.id} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#e3f2fd', width: 48, height: 48 }}>
                      <Business sx={{ color: '#1976d2', fontSize: 24 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {partner.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOn sx={{ fontSize: 16, color: '#666' }} />
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          {partner.location}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Chip label={partner.status} color={partner.status === "Active" ? "success" : "warning"} />
                </Box>

                <Grid container spacing={4}>
                  <Grid item xs={4} textAlign="center">
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{
                        cursor: "pointer",
                        color: expandedCard === partner.id && activeType === "laptops" ? "green" : "inherit"
                      }}
                      onClick={() => handleToggle(partner.id, "laptops")}
                    >
                      {partner.laptops.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Laptops</Typography>
                  </Grid>
                  <Grid item xs={4} textAlign="center">
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{
                        cursor: "pointer",
                        color: expandedCard === partner.id && activeType === "beneficiaries" ? "green" : "inherit"
                      }}
                      onClick={() => handleToggle(partner.id, "beneficiaries")}
                    >
                      {partner.beneficiaries.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Beneficiaries</Typography>
                  </Grid>
                  <Grid item xs={4} textAlign="center">
                    <Typography variant="body2">{partner.lastDelivery}</Typography>
                    <Typography variant="body2" color="text.secondary">Last delivery</Typography>
                  </Grid>
                </Grid>
                {expandedCard === partner.id && (
                  <Box mt={3}>
                    {/* Dynamic Title */}
                    <Typography variant="h6" gutterBottom>
                      {activeType === "laptops"
                        ? `${partner.name} - Laptop Data`
                        : `${partner.name} - Beneficiary Data`}
                    </Typography>

                    <Table size="small">
                      <TableHead>
                        {activeType === "laptops" ? (
                          <TableRow>
                            <TableCell sx={{ fontWeight: "bold" }}>Laptop ID</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Manufacturer Model</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Working</TableCell>
                          </TableRow>
                        ) : (
                          <TableRow>
                            <TableCell sx={{ fontWeight: "bold" }}>NGO</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Laptop Assigned</TableCell>
                          </TableRow>
                        )}
                      </TableHead>

                      <TableBody>
                        {activeType === "laptops"
                          ? partner.laptops.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.ID}</TableCell>
                              <TableCell>{item["Manufacturer Model"]}</TableCell>
                              <TableCell>{item.Status}</TableCell>
                              <TableCell>{item.Working ? "Yes" : "No"}</TableCell>
                            </TableRow>
                          ))
                          : partner.beneficiaries.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.Ngo}</TableCell>
                              <TableCell>{item.status}</TableCell>
                              <TableCell>{item["Laptop Assigned"]}</TableCell>
                            </TableRow>
                          ))}

                      </TableBody>
                    </Table>
                  </Box>
                )}


              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Show More Button */}
        {visibleCount < filteredNgoPartner.length && (
          <Box textAlign="center" mt={3}>
            <Button variant="outlined" onClick={handleShowMore}>
              Show More
            </Button>
          </Box>
        )}
      </Container>
    </>
  );
};

export default Ngopartner;


// import React, { useEffect, useState } from 'react';
// import {
//   Box,
//   Typography,
//   Card,
//   CardContent,
//   Chip,
//   Button,
//   Avatar,
//   Grid,
//   Container,
//   Table,
//   TableHead,
//   TableBody,
//   TableRow,
//   TableCell
// } from '@mui/material';
// import { Business, LocationOn } from '@mui/icons-material';
// import DownloadIcon from "@mui/icons-material/Download";
// import DashboardHeader from './DashboardHeader'; // Make sure this path is correct

// const Ngopartner = () => {
//   const [ngoPartner, setNgoPartner] = useState([]);
//   const [filteredNgoPartner, setFilteredNgoPartner] = useState([]);
//   const [visibleCount, setVisibleCount] = useState(4);
//   const [expandedCard, setExpandedCard] = useState(null);
//   const [activeType, setActiveType] = useState(null);
//   const [selectedOrganization, setSelectedOrganization] = useState(null);
//   const [uniqueOrganizations, setUniqueOrganizations] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [laptopRes, ngoRes, userRes] = await Promise.all([
//           fetch(`${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getLaptopData`),
//           fetch(`${process.env.REACT_APP_NgoInformationApi}?type=registration`),
//           fetch(`${process.env.REACT_APP_LaptopAndBeneficiaryDetailsApi}?type=getUserData`)
//         ]);

//         const [laptopJson, ngoJson, userJson] = await Promise.all([
//           laptopRes.json(),
//           ngoRes.json(),
//           userRes.json()
//         ]);

//         const approved = ngoJson.data?.filter((ngo) => ngo.Status === "Approved") || [];

//         const partners = approved.map((ngo) => {
//           const laptopsAllocated = laptopJson.filter(
//             (laptop) =>
//               String(laptop["Allocated To"]).trim().toLowerCase() ===
//               String(ngo.organizationName).trim().toLowerCase()
//           );

//           const beneficiariesList = userJson.filter(
//             (user) =>
//               String(user.Ngo).trim() === String(ngo.Id).trim() ||
//               String(user.ngoId).trim() === String(ngo.Id).trim()
//           );

//           return {
//             id: ngo.Id,
//             name: ngo.organizationName,
//             status: ngo.Status,
//             location: ngo.location || "Unknown",
//             laptops: laptopsAllocated,
//             beneficiaries: beneficiariesList,
//             lastDelivery: ngo.lastDelivery || "N/A",
//           };
//         });

//         setNgoPartner(partners);
//         setFilteredNgoPartner(partners);
        
//         // Extract unique organizations from NGO names
//         const orgs = [...new Set(partners.map(partner => partner.name))].sort();
//         setUniqueOrganizations(orgs);
//       } catch (err) {
//         console.error("Error fetching NGO partner data:", err);
//       }
//     };

//     fetchData();
//   }, []);

//   // Handle organization filter change
//   const handleOrganizationChange = (org) => {
//     setSelectedOrganization(org);
    
//     if (!org) {
//       setFilteredNgoPartner(ngoPartner);
//     } else {
//       const filtered = ngoPartner.filter(partner => 
//         partner.name.toLowerCase() === org.toLowerCase()
//       );
//       setFilteredNgoPartner(filtered);
//     }
    
//     // Reset visible count and expanded card when filter changes
//     setVisibleCount(4);
//     setExpandedCard(null);
//   };

//   const handleShowMore = () => {
//     setVisibleCount((prev) => prev + 4);
//   };

//   const handleToggle = (id, type) => {
//     if (expandedCard === id && activeType === type) {
//       setExpandedCard(null);
//       setActiveType(null);
//     } else {
//       setExpandedCard(id);
//       setActiveType(type);
//     }
//   };

//   const handleExport = () => {
//     // Use filtered data for export if a filter is applied
//     const dataToExport = selectedOrganization ? filteredNgoPartner : ngoPartner;
    
//     let csvContent = "data:text/csv;charset=utf-8,";

//     dataToExport.forEach(partner => {
//       csvContent += `\n${partner.name} - Laptop Data\n`;
//       csvContent += "Laptop ID,Manufacturer Model,Status,Working\n";
//       partner.laptops.forEach(item => {
//         csvContent += `${item.ID},${item["Manufacturer Model"]},${item.Status},${item.Working ? "Yes" : "No"}\n`;
//       });

//       csvContent += `\n${partner.name} - Beneficiary Data\n`;
//       csvContent += "NGO,Status,Laptop Assigned\n";
//       partner.beneficiaries.forEach(item => {
//         csvContent += `${item.Ngo},${item.status},${item["Laptop Assigned"]}\n`;
//       });

//       csvContent += "\n";
//     });

//     const blob = new Blob([decodeURIComponent(encodeURI(csvContent))], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.setAttribute("href", url);
//     link.setAttribute("download", "NGO_Laptop_Report.csv");
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   return (
//     <>
//       <DashboardHeader
//         uniqueOrganizations={uniqueOrganizations}
//         onOrganizationChange={handleOrganizationChange}
//       />

//       {/* NGO Partners */}
//       <Container maxWidth="xl" sx={{ py: 3, bgcolor: '#f9f9f9' }}>
//         <Box
//           sx={{
//             mb: 3,
//             display: 'flex',
//             justifyContent: 'space-between',
//             alignItems: 'center'
//           }}
//         >
//           <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
//             NGO Partners
//             {selectedOrganization && (
//               <Chip
//                 label={`Filtered: ${selectedOrganization}`}
//                 size="small"
//                 variant="outlined"
//                 sx={{ ml: 2 }}
//               />
//             )}
//           </Typography>
//           <Box display="flex" alignItems="center" gap={2}>
//             <Typography variant="body2" sx={{ color: '#666', fontSize: '14px' }}>
//               {filteredNgoPartner.length} of {ngoPartner.length} organizations
//             </Typography>
//             {/* <Button
//               variant="contained"
//               color="primary"
//               startIcon={<DownloadIcon />}
//               sx={{ borderRadius: "10px", textTransform: "none" }}
//               onClick={handleExport}
//             >
//               Export Report
//             </Button> */}
//           </Box>
//         </Box>

//         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//           {filteredNgoPartner.slice(0, visibleCount).map((partner) => (
//             <Card key={partner.id} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
//               <CardContent sx={{ p: 3 }}>
//                 <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
//                   <Box sx={{ display: 'flex', gap: 2 }}>
//                     <Avatar sx={{ bgcolor: '#e3f2fd', width: 48, height: 48 }}>
//                       <Business sx={{ color: '#1976d2', fontSize: 24 }} />
//                     </Avatar>
//                     <Box>
//                       <Typography variant="h6" sx={{ fontWeight: 600 }}>
//                         {partner.name}
//                       </Typography>
//                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
//                         <LocationOn sx={{ fontSize: 16, color: '#666' }} />
//                         <Typography variant="body2" sx={{ color: '#666' }}>
//                           {partner.location}
//                         </Typography>
//                       </Box>
//                     </Box>
//                   </Box>
//                   <Chip 
//                     label={partner.status} 
//                     color={partner.status === "Approved" ? "success" : "warning"} 
//                     variant="outlined"
//                   />
//                 </Box>

//                 <Grid container spacing={4}>
//                   <Grid item xs={4} textAlign="center">
//                     <Typography
//                       variant="h6"
//                       fontWeight="bold"
//                       sx={{
//                         cursor: "pointer",
//                         color: expandedCard === partner.id && activeType === "laptops" ? "green" : "inherit"
//                       }}
//                       onClick={() => handleToggle(partner.id, "laptops")}
//                     >
//                       {partner.laptops.length}
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary">Laptops</Typography>
//                   </Grid>
//                   <Grid item xs={4} textAlign="center">
//                     <Typography
//                       variant="h6"
//                       fontWeight="bold"
//                       sx={{
//                         cursor: "pointer",
//                         color: expandedCard === partner.id && activeType === "beneficiaries" ? "green" : "inherit"
//                       }}
//                       onClick={() => handleToggle(partner.id, "beneficiaries")}
//                     >
//                       {partner.beneficiaries.length}
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary">Beneficiaries</Typography>
//                   </Grid>
//                   <Grid item xs={4} textAlign="center">
//                     <Typography variant="body2">{partner.lastDelivery}</Typography>
//                     <Typography variant="body2" color="text.secondary">Last delivery</Typography>
//                   </Grid>
//                 </Grid>
//                 {expandedCard === partner.id && (
//                   <Box mt={3}>
//                     <Typography variant="h6" gutterBottom>
//                       {activeType === "laptops"
//                         ? `${partner.name} - Laptop Data`
//                         : `${partner.name} - Beneficiary Data`}
//                     </Typography>

//                     <Table size="small">
//                       <TableHead>
//                         {activeType === "laptops" ? (
//                           <TableRow>
//                             <TableCell sx={{ fontWeight: "bold" }}>Laptop ID</TableCell>
//                             <TableCell sx={{ fontWeight: "bold" }}>Manufacturer Model</TableCell>
//                             <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
//                             <TableCell sx={{ fontWeight: "bold" }}>Working</TableCell>
//                           </TableRow>
//                         ) : (
//                           <TableRow>
//                             <TableCell sx={{ fontWeight: "bold" }}>NGO</TableCell>
//                             <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
//                             <TableCell sx={{ fontWeight: "bold" }}>Laptop Assigned</TableCell>
//                           </TableRow>
//                         )}
//                       </TableHead>

//                       <TableBody>
//                         {activeType === "laptops"
//                           ? partner.laptops.map((item, index) => (
//                             <TableRow key={index}>
//                               <TableCell>{item.ID}</TableCell>
//                               <TableCell>{item["Manufacturer Model"]}</TableCell>
//                               <TableCell>{item.Status}</TableCell>
//                               <TableCell>{item.Working ? "Yes" : "No"}</TableCell>
//                             </TableRow>
//                           ))
//                           : partner.beneficiaries.map((item, index) => (
//                             <TableRow key={index}>
//                               <TableCell>{item.Ngo}</TableCell>
//                               <TableCell>{item.status}</TableCell>
//                               <TableCell>{item["Laptop Assigned"]}</TableCell>
//                             </TableRow>
//                           ))}
//                       </TableBody>
//                     </Table>
//                   </Box>
//                 )}
//               </CardContent>
//             </Card>
//           ))}
//         </Box>

//         {/* Show More Button */}
//         {visibleCount < filteredNgoPartner.length && (
//           <Box textAlign="center" mt={3}>
//             <Button variant="outlined" onClick={handleShowMore}>
//               Show More
//             </Button>
//           </Box>
//         )}

//         {/* No results message */}
//         {filteredNgoPartner.length === 0 && (
//           <Box textAlign="center" mt={3}>
//             <Typography variant="body1" color="text.secondary">
//               No NGO partners found for the selected organization.
//             </Typography>
//           </Box>
//         )}
//       </Container>
//     </>
//   );
// };

// export default Ngopartner;