// import React, { useEffect, useState } from 'react';
// import { MapContainer, GeoJSON } from 'react-leaflet';
// import { Typography, Box,Container } from '@mui/material';
// import 'leaflet/dist/leaflet.css';
// import './LocationWiseImpact.css'
// import Location from './../Image/location_on.png'

// const stateData = {
//   Maharashtra: {
//     ngoNum: 10,
//     teachersTrained: 30,
//     schoolVisits: 20,
//     sessionConducted: 200,
//     modules: 10,
//     learningHour: 200,
//   },
//   Gujarat: {
//     ngoNum: 15,
//     teachersTrained: 25,
//     schoolVisits: 18,
//     sessionConducted: 100,
//     modules: 5,
//     learningHour: 250,
//   },
//   UttarPradesh: {
//     ngoNum: 12,
//     teachersTrained: 28,
//     schoolVisits: 22,
//     sessionConducted: 240,
//     modules: 8,
//     learningHour: 100,
//   },
//   Karnataka: {
//     ngoNum: 20,
//     teachersTrained: 40,
//     schoolVisits: 30,
//     sessionConducted: 20,
//     modules: 1,
//     learningHour: 20,
//   },
//   Telangana: {
//     ngoNum: 8,
//     teachersTrained: 35,
//     schoolVisits: 25,
//     sessionConducted: 40,
//     modules: 60,
//     learningHour: 270,
//   },
//   AndhraPradesh: {
//     ngoNum: 10,
//     teachersTrained: 30,
//     schoolVisits: 27,
//     sessionConducted: 30,
//     modules: 11,
//     learningHour: 590,
//   },
//   Odisha: {
//     ngoNum: 5,
//     teachersTrained: 18,
//     schoolVisits: 15,
//     sessionConducted: 80,
//     modules: 21,
//     learningHour: 670,
//   },

// };

// const LocationWiseImpact = () => {
//   const [geoData, setGeoData] = useState(null);
//   const [hoveredState, setHoveredState] = useState(null);

//   useEffect(() => {
//     fetch('/india-geo.json')
//       .then((response) => response.json())
//       .then((data) => setGeoData(data))
//       .catch((error) => console.error('Error loading GeoJSON:', error));
//   }, []);

//   const onEachState = (feature, layer) => {
//     const stateName = feature.properties.st_nm;

//     const hasData = stateData[stateName] && stateData[stateName].ngoNum;

//     const defaultColor = hasData ? '#CED7CE' : '#E0E0E0';

//     layer.setStyle({
//       fillColor: defaultColor,
//       weight: 2,
//       opacity: 1,
//       color: '#FFF',
//       fillOpacity: 1,
//     });

//     layer.on({
//       mouseover: (e) => {
//         if (hasData) {
//           setHoveredState({
//             name: stateName,
//             ...stateData[stateName],
//           });
//           e.target.setStyle({
//             fillColor: '#5C785A',
//             fillOpacity: 1,
//             opacity: 1,
//           });
//         } else {
//           e.target.setStyle({
//             opacity: 1,
//           });
//         }
//       },
//       mouseout: (e) => {
//         setHoveredState(null);
//         const resetColor = hasData ? '#CED7CE' : '#E0E0E0';
//         e.target.setStyle({
//           fillColor: resetColor,
//           fillOpacity: 1,
//           opacity: 1,
//           color: '#FFF',
//         });
//       },
//     });
//       };

//   return (
//   <Container maxWidth="lg">
//     {/* <Box p={3} style={{position:"relative",height:"130vh"}}> */}
//       <Typography variant="h6">State Wise NGO Presence Across India</Typography>
//       <MapContainer
//             center={[23.5, 83]}
//             zoom={4.5}
//             style={{
//               height: "757px",
//               width: "675px",
//               backgroundColor: "#ffff",
//               top:"20px",
//               left: "350px",
//             }}
//             zoomControl={false}
//             dragging={false}
//             doubleClickZoom={false}
//             scrollWheelZoom={false}
//             touchZoom={false}
//             boxZoom={false}
//             keyboard={false}
//             attributionControl={false}
//           >

//         {geoData && (
//           <GeoJSON
//             data={geoData}
//             style={{ weight: 2, opacity: 1, color: 'white', fillOpacity: 1 }}
//             onEachFeature={onEachState}
//           />
//         )}
//       </MapContainer>
//         {hoveredState && (
//         <div className="hover-dialog">
//           <div className="dialog-header">
//             <img src={Location} alt="State Location" className="state-icon" />
//             <Typography color="primary" variant="subtitle1">{hoveredState.name}
//           </Typography>
//         </div>
//           <div className="dialog-body">
//             <div className="ngo-data">
//               <div className="ngo-data-in">
//                 <div>
//                   <Typography variant="subtitle2">Total NGOs </Typography>
//                 </div>
//                 <div>
//                 <span color="text.secondary" variant="subtitle2">{hoveredState.ngoNum}</span>
//                 </div>
//               </div>
//               <div className="ngo-data-in">
//                 <div>
//                   <Typography color= "#4A4A4A" variant="subtitle2">Number of Teachers Trained</Typography>
//                 </div >
//                 <div>
//                   <span  variant="subtitle2">{hoveredState.teachersTrained}</span>
//                 </div>

//               </div>
//               <div className="ngo-data-in">
//                 <div>
//                   <Typography color= "#4A4A4A" variant="subtitle2">Number of School Visits</Typography>
//                 </div>
//                 <div>
//                   <span color="text.secondary" variant="subtitle2">{hoveredState.schoolVisits}</span>
//                 </div>
//               </div>
//               <div className="ngo-data-in">
//                 <div>
//                   <Typography color= "#4A4A4A" variant="subtitle2">Number of Sessions Conducted</Typography>
//                 </div>
//                 <div>
//                   <span color="text.secondary" variant="subtitle2">{hoveredState.sessionConducted}</span>
//                 </div>
//               </div>
//               <div className="ngo-data-in">
//                 <div>
//                   <Typography color= "#4A4A4A" variant="subtitle2">Number of Modules Completed</Typography>
//                 </div>
//                 <div>
//                   <span color="text.secondary" variant="subtitle2">{hoveredState.modules}</span>
//                 </div>
//               </div>
//               <div className="ngo-data-in">
//                 <div>
//                   <Typography color= "#4A4A4A" variant="subtitle2">Total Learning Hours</Typography>
//                 </div>
//                 <div>
//                   <span color="text.secondary" variant="subtitle2">{hoveredState.learningHour}</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//        )}
//     {/* </Box> */}
//   </Container>
//   );
// };

// export default LocationWiseImpact;

import React, { useEffect, useState } from "react";
import { MapContainer, GeoJSON } from "react-leaflet";
import { Typography, Box, Container } from "@mui/material";
import "leaflet/dist/leaflet.css";
import "./LocationWiseImpact.css";
import Location from "./../Image/location_on.png";

const LocationWiseImpact = () => {
  const [geoData, setGeoData] = useState(null);
  const [stateData, setStateData] = useState({});
  const [hoveredState, setHoveredState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchStateData = async () => {
      try {
        const response = await fetch(
          "https://script.google.com/macros/s/AKfycbzjIvQJgBpdYwShV6LQOuyNtccmafG3iHFYzmEBQ6FBjiSeT3TuSEyAM46OMYMTsPBC/exec?type=corporatedbStatewise&doner=Amazon"
        );
        const data = await response.json();
        console.log("API Response:", data);

        // Transform the data structure
        const transformedData = {};
        
        // Track which programs are present for each state
        const statePrograms = {};
        
        // Iterate through each program (SAM-37, SAM-39, etc.)
        Object.keys(data).forEach(programId => {
          const program = data[programId];
          // Iterate through each month in the program
          Object.values(program).forEach(monthData => {
            // Iterate through each state in the month
            Object.keys(monthData).forEach(state => {
              // Initialize tracking for this state if needed
              if (!statePrograms[state]) {
                statePrograms[state] = new Set();
              }
              // Add this program to the state's set
              statePrograms[state].add(programId);

              if (!transformedData[state]) {
                transformedData[state] = {
                  ngoNum: 0,  // Will be set after all programs are processed
                  teachersTrained: 0,
                  schoolVisits: 0,
                  sessionConducted: 0,
                  modules: 0,
                  learningHour: 0
                };
              }
              
              // Sum up the metrics for each state
              const metrics = monthData[state];
              transformedData[state].teachersTrained += parseInt(metrics["Number of Teachers Trained"] || 0);
              transformedData[state].schoolVisits += parseInt(metrics["Number of School Visits"] || 0);
              transformedData[state].sessionConducted += parseInt(metrics["Number of Sessions Conducted"] || 0);
              transformedData[state].modules += parseInt(metrics["Number of Modules Completed"] || 0);
              transformedData[state].learningHour = transformedData[state].sessionConducted * 1;
            });
          });
        });

        // Set the final NGO count for each state
        Object.keys(transformedData).forEach(state => {
          transformedData[state].ngoNum = statePrograms[state].size;
        });

        console.log("Transformed Data:", transformedData);
        setStateData(transformedData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching state data:", err);
        setError("Failed to load state data");
        setLoading(false);
      }
    };

    const fetchGeoData = async () => {
      try {
        const response = await fetch("/india-geo.json");
        const data = await response.json();
        setGeoData(data);
      } catch (err) {
        console.error("Error loading GeoJSON:", err);
        setError("Failed to load map data");
      }
    };

    fetchStateData();
    fetchGeoData();
  }, []);

  const onEachState = (feature, layer) => {
    const stateName = feature.properties.st_nm;
    const hasData = stateData[stateName];

    const defaultColor = hasData ? "#CED7CE" : "#E0E0E0";

    layer.setStyle({
      fillColor: defaultColor,
      weight: 2,
      opacity: 1,
      color: "#FFF",
      fillOpacity: 1,
    });

    layer.on({
      mouseover: (e) => {
        if (hasData) {
          setHoveredState({
            name: stateName,
            ...stateData[stateName],
          });
          e.target.setStyle({
            fillColor: "#5C785A",
            fillOpacity: 1,
            opacity: 1,
          });
        } else {
          e.target.setStyle({
            opacity: 1,
          });
        }
      },
      mouseout: (e) => {
        setHoveredState(null);
        const resetColor = hasData ? "#CED7CE" : "#E0E0E0";
        e.target.setStyle({
          fillColor: resetColor,
          fillOpacity: 1,
          opacity: 1,
          color: "#FFF",
        });
      },
    });
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h6">State Wise NGO Presence Across India</Typography>
      <MapContainer
        center={[23.5, 83]}
        zoom={4.5}
        style={{
          height: "757px",
          width: "675px",
          backgroundColor: "#ffff",
          top: "20px",
          left: "350px",
        }}
        zoomControl={false}
        dragging={false}
        doubleClickZoom={false}
        scrollWheelZoom={false}
        touchZoom={false}
        boxZoom={false}
        keyboard={false}
        attributionControl={false}
      >
        {geoData && (
          <GeoJSON
            data={geoData}
            style={{ weight: 2, opacity: 1, color: "white", fillOpacity: 1 }}
            onEachFeature={onEachState}
          />
        )}
      </MapContainer>

      {hoveredState && (
        <div className="hover-dialog">
          <div className="dialog-header">
            <img src={Location} alt="State Location" className="state-icon" />
            <Typography color="primary" variant="subtitle1">
              {hoveredState.name}
            </Typography>
          </div>
          <div className="dialog-body">
            <div className="ngo-data">
              <div className="ngo-data-in">
                <div>
                  <Typography variant="subtitle2">Total NGOs</Typography>
                </div>
                <div>
                  <span>{hoveredState.ngoNum}</span>
                </div>
              </div>
              <div className="ngo-data-in">
                <div>
                  <Typography color="#4A4A4A" variant="subtitle2">
                    Number of Teachers Trained
                  </Typography>
                </div>
                <div>
                  <span>{hoveredState.teachersTrained}</span>
                </div>
              </div>
              <div className="ngo-data-in">
                <div>
                  <Typography color="#4A4A4A" variant="subtitle2">
                    Number of School Visits
                  </Typography>
                </div>
                <div>
                  <span>{hoveredState.schoolVisits}</span>
                </div>
              </div>
              <div className="ngo-data-in">
                <div>
                  <Typography color="#4A4A4A" variant="subtitle2">
                    Number of Sessions Conducted
                  </Typography>
                </div>
                <div>
                  <span>{hoveredState.sessionConducted}</span>
                </div>
              </div>
              <div className="ngo-data-in">
                <div>
                  <Typography color="#4A4A4A" variant="subtitle2">
                    Number of Modules Completed
                  </Typography>
                </div>
                <div>
                  <span>{hoveredState.modules}</span>
                </div>
              </div>
              <div className="ngo-data-in">
                <div>
                  <Typography color="#4A4A4A" variant="subtitle2">
                    Total Learning Hours
                  </Typography>
                </div>
                <div>
                  <span>{hoveredState.learningHour}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default LocationWiseImpact;
