// import React, { useEffect, useState } from "react";
// import { MapContainer, GeoJSON } from "react-leaflet";
// import { Box, Container } from "@mui/material";
// import Typography from '@mui/material/Typography';
// import "leaflet/dist/leaflet.css";
// import "./LocationWiseImpact.css";
// import Location from "./../Image/location_on.png";
// import dayjs from 'dayjs';
// import isBetween from 'dayjs/plugin/isBetween';

// dayjs.extend(isBetween);

// const LocationWiseImpact = ({ dateRange, apiData }) => {
//   const [geoData, setGeoData] = useState(null);
//   const [stateData, setStateData] = useState({});
//   const [hoveredState, setHoveredState] = useState(null);
//   const [error, setError] = useState(null);

//   // console.log(dateRange, 'dateRange');
//   // console.log(apiData, 'apiData');

//   useEffect(() => {
//     const fetchGeoData = async () => {
//       try {
//         const response = await fetch("/india-geo.json");
//         const data = await response.json();
//         setGeoData(data);
//       } catch (err) {
//         console.error("Error loading GeoJSON:", err);
//         setError("Failed to load map data");
//       }
//     };

//     fetchGeoData();
//   }, []);

//   const parseMonthString = (monthStr) => {
//     if (monthStr.includes("March")) {
//       return dayjs(monthStr.replace("March", "Mar"), "MMM-YYYY");
//     } else if (monthStr.includes("April")) {
//       return dayjs(monthStr.replace("April", "Apr"), "MMM-YYYY");
//     }
//     return dayjs(monthStr, "MMM-YYYY");
//   };

//   useEffect(() => {
//     const processStateData = () => {
//       try {
//         if (!apiData) {
//           setStateData({});
//           return;
//         }

//         // If no date range is selected, show all available data
//         if (!dateRange.startDate || !dateRange.endDate) {
//           const transformedData = {};
//           const statePrograms = {};

//           // Process all data regardless of date
//           Object.keys(apiData).forEach(programId => {
//             const program = apiData[programId];
//             Object.entries(program).forEach(([monthStr, monthData]) => {
//               Object.entries(monthData).forEach(([state, metrics]) => {
//                 if (!statePrograms[state]) {
//                   statePrograms[state] = new Set();
//                 }
//                 statePrograms[state].add(programId);

//                 if (!transformedData[state]) {
//                   transformedData[state] = {
//                     ngoNum: 0,
//                     teachersTrained: 0,
//                     schoolVisits: 0,
//                     sessionConducted: 0,
//                     modules: 0,
//                     learningHour: 0
//                   };
//                 }
                
//                 // Parse metrics with fallback to 0 if invalid
//                 transformedData[state].teachersTrained += parseInt(metrics["Number of Teachers Trained"]) || 0;
//                 transformedData[state].schoolVisits += parseInt(metrics["Number of School Visits"]) || 0;
//                 transformedData[state].sessionConducted += parseInt(metrics["Number of Sessions Conducted"]) || 0;
//                 transformedData[state].modules += parseInt(metrics["Number of Modules Completed"]) || 0;
//                 transformedData[state].learningHour = transformedData[state].sessionConducted * 1;
//               });
//             });
//           });

//           // Set NGO counts
//           Object.keys(transformedData).forEach(state => {
//             if (statePrograms[state]) {
//               transformedData[state].ngoNum = statePrograms[state].size;
//             }
//           });

//           setStateData(transformedData);
//           setError(null);
//           return;
//         }

//         // If date range is selected, process data for that range
//         const selectedStartDate = dayjs(dateRange.startDate.replace("'", ""), "MMMYYYY");
//         const selectedEndDate = dayjs(dateRange.endDate.replace("'", ""), "MMMYYYY");

//         if (!selectedStartDate.isValid() || !selectedEndDate.isValid()) {
//           console.error("Invalid date format:", dateRange);
//           setStateData({});
//           setError(`Invalid date format`);
//           return;
//         }

//         const transformedData = {};
//         const statePrograms = {};
//         let hasDataInRange = false;

//         // Process data only for the selected range
//         Object.keys(apiData).forEach(programId => {
//           const program = apiData[programId];
//           Object.entries(program).forEach(([monthStr, monthData]) => {
//             const apiMonth = parseMonthString(monthStr);

//             if (apiMonth.isValid() && 
//                 apiMonth.isBetween(selectedStartDate, selectedEndDate, 'month', '[]')) {
//               hasDataInRange = true;
              
//               Object.entries(monthData).forEach(([state, metrics]) => {
//                 if (!statePrograms[state]) {
//                   statePrograms[state] = new Set();
//                 }
//                 statePrograms[state].add(programId);

//                 if (!transformedData[state]) {
//                   transformedData[state] = {
//                     ngoNum: 0,
//                     teachersTrained: 0,
//                     schoolVisits: 0,
//                     sessionConducted: 0,
//                     modules: 0,
//                     learningHour: 0
//                   };
//                 }
                
//                 transformedData[state].teachersTrained += parseInt(metrics["Number of Teachers Trained"]) || 0;
//                 transformedData[state].schoolVisits += parseInt(metrics["Number of School Visits"]) || 0;
//                 transformedData[state].sessionConducted += parseInt(metrics["Number of Sessions Conducted"]) || 0;
//                 transformedData[state].modules += parseInt(metrics["Number of Modules Completed"]) || 0;
//                 transformedData[state].learningHour = transformedData[state].sessionConducted * 1;
//               });
//             }
//           });
//         });

//         if (!hasDataInRange) {
//           setStateData({});
//           setError(`No data available for selected date range`);
//           return;
//         }

//         // Set NGO counts
//         Object.keys(transformedData).forEach(state => {
//           if (statePrograms[state]) {
//             transformedData[state].ngoNum = statePrograms[state].size;
//           }
//         });

//         setStateData(transformedData);
//         setError(null);
//       } catch (err) {
//         console.error("Error processing state data:", err);
//         setError("Failed to process state data");
//       }
//     };

//     processStateData();
//   }, [apiData, dateRange]);

//   const onEachState = (feature, layer) => {
//     const stateName = feature.properties.st_nm;
//     const hasData = stateData && Object.keys(stateData).includes(stateName);

//     layer.setStyle({
//       fillColor: hasData ? "#CED7CE" : "#E0E0E0",
//       weight: 2,
//       opacity: 1,
//       color: "#FFF",
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
//             fillColor: "#5C785A",
//             fillOpacity: 1,
//             opacity: 1,
//           });
//         }
//       },
//       mouseout: (e) => {
//         setHoveredState(null);
//         e.target.setStyle({
//           fillColor: hasData ? "#CED7CE" : "#E0E0E0",
//           fillOpacity: 1,
//           opacity: 1,
//           color: "#FFF",
//         });
//       },
//     });
//   };

//   if (error) {
//     return (
//       <Box 
//         sx={{ 
//           display: 'flex', 
//           justifyContent: 'center', 
//           alignItems: 'center',
//           height: '400px',
//           backgroundColor: '#f5f5f5',
//           borderRadius: '8px'
//         }}
//       >
//         <Typography variant="h6" color="text.secondary">
//           {error}
//         </Typography>
//       </Box>
//     );
//   }

//   return (
//     <Container maxWidth="lg">
//       <Typography variant="h6">
//         State Wise NGO Presence Across India
//         {dateRange.startDate && dateRange.endDate && 
//           ` (${dateRange.startDate} - ${dateRange.endDate})`
//         }
//       </Typography>
//       <MapContainer
//         center={[23.5, 83]}
//         zoom={4.5}
//         style={{
//           height: "757px",
//           width: "675px",
//           backgroundColor: "#ffff",
//           top: "20px",
//           left: "350px",
//         }}
//         zoomControl={false}
//         dragging={false}
//         doubleClickZoom={false}
//         scrollWheelZoom={false}
//         touchZoom={false}
//         boxZoom={false}
//         keyboard={false}
//         attributionControl={false}
//       >
//         {geoData && (
//           <GeoJSON
//             key={JSON.stringify(stateData)}
//             data={geoData}
//             style={{ weight: 2, opacity: 1, color: "white", fillOpacity: 1 }}
//             onEachFeature={onEachState}
//           />
//         )}
//       </MapContainer>

//       {hoveredState && (
//         <div className="hover-dialog">
//           <div className="dialog-header">
//             <img src={Location} alt="State Location" className="state-icon" />
//             <Typography color="primary" variant="subtitle1">
//               {hoveredState.name}
//             </Typography>
//           </div>
//           <div className="dialog-body">
//             <div className="ngo-data">
//               <div className="ngo-data-in">
//                 <div>
//                   <Typography variant="subtitle2">Total NGOs</Typography>
//                 </div>
//                 <div>
//                   <span>{hoveredState.ngoNum}</span>
//                 </div>
//               </div>
//               <div className="ngo-data-in">
//                 <div>
//                   <Typography color="#4A4A4A" variant="subtitle2">
//                     Number of Teachers Trained
//                   </Typography>
//                 </div>
//                 <div>
//                   <span>{hoveredState.teachersTrained}</span>
//                 </div>
//               </div>
//               <div className="ngo-data-in">
//                 <div>
//                   <Typography color="#4A4A4A" variant="subtitle2">
//                     Number of School Visits
//                   </Typography>
//                 </div>
//                 <div>
//                   <span>{hoveredState.schoolVisits}</span>
//                 </div>
//               </div>
//               <div className="ngo-data-in">
//                 <div>
//                   <Typography color="#4A4A4A" variant="subtitle2">
//                     Number of Sessions Conducted
//                   </Typography>
//                 </div>
//                 <div>
//                   <span>{hoveredState.sessionConducted}</span>
//                 </div>
//               </div>
//               <div className="ngo-data-in">
//                 <div>
//                   <Typography color="#4A4A4A" variant="subtitle2">
//                     Number of Modules Completed
//                   </Typography>
//                 </div>
//                 <div>
//                   <span>{hoveredState.modules}</span>
//                 </div>
//               </div>
//               <div className="ngo-data-in">
//                 <div>
//                   <Typography color="#4A4A4A" variant="subtitle2">
//                     Total Learning Hours
//                   </Typography>
//                 </div>
//                 <div>
//                   <span>{hoveredState.learningHour}</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </Container>
//   );
// };

// export default LocationWiseImpact;

import React, { useEffect, useState, useRef } from "react";
import { MapContainer, GeoJSON } from "react-leaflet";
import { Box, Container } from "@mui/material";
import Typography from '@mui/material/Typography';
import "leaflet/dist/leaflet.css";
import "./LocationWiseImpact.css";
import Location from "./../Image/location_on.png";
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

const LocationWiseImpact = ({ dateRange, apiData }) => {
  const [geoData, setGeoData] = useState(null);
  const [stateData, setStateData] = useState({});
  const [hoveredState, setHoveredState] = useState(null);
  const [error, setError] = useState(null);
  // Add state for tracking the dialog position
  const [dialogPosition, setDialogPosition] = useState({ x: 0, y: 0 });
  // Reference to the map container
  const mapContainerRef = useRef(null);

  // console.log(dateRange, 'dateRange');
  // console.log(apiData, 'apiData');

  useEffect(() => {
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

    fetchGeoData();
  }, []);

  const parseMonthString = (monthStr) => {
    if (monthStr.includes("March")) {
      return dayjs(monthStr.replace("March", "Mar"), "MMM-YYYY");
    } else if (monthStr.includes("April")) {
      return dayjs(monthStr.replace("April", "Apr"), "MMM-YYYY");
    }
    return dayjs(monthStr, "MMM-YYYY");
  };

  useEffect(() => {
    const processStateData = () => {
      try {
        if (!apiData) {
          setStateData({});
          return;
        }

        // If no date range is selected, show all available data
        if (!dateRange.startDate || !dateRange.endDate) {
          const transformedData = {};
          const statePrograms = {};

          // Process all data regardless of date
          Object.keys(apiData).forEach(programId => {
            const program = apiData[programId];
            Object.entries(program).forEach(([monthStr, monthData]) => {
              Object.entries(monthData).forEach(([state, metrics]) => {
                if (!statePrograms[state]) {
                  statePrograms[state] = new Set();
                }
                statePrograms[state].add(programId);

                if (!transformedData[state]) {
                  transformedData[state] = {
                    ngoNum: 0,
                    teachersTrained: 0,
                    schoolVisits: 0,
                    sessionConducted: 0,
                    modules: 0,
                    learningHour: 0
                  };
                }
                
                // Parse metrics with fallback to 0 if invalid
                transformedData[state].teachersTrained += parseInt(metrics["Number of Teachers Trained"]) || 0;
                transformedData[state].schoolVisits += parseInt(metrics["Number of School Visits"]) || 0;
                transformedData[state].sessionConducted += parseInt(metrics["Number of Sessions Conducted"]) || 0;
                transformedData[state].modules += parseInt(metrics["Number of Modules Completed"]) || 0;
                transformedData[state].learningHour = transformedData[state].sessionConducted * 1;
              });
            });
          });

          // Set NGO counts
          Object.keys(transformedData).forEach(state => {
            if (statePrograms[state]) {
              transformedData[state].ngoNum = statePrograms[state].size;
            }
          });

          setStateData(transformedData);
          setError(null);
          return;
        }

        // If date range is selected, process data for that range
        const selectedStartDate = dayjs(dateRange.startDate.replace("'", ""), "MMMYYYY");
        const selectedEndDate = dayjs(dateRange.endDate.replace("'", ""), "MMMYYYY");

        if (!selectedStartDate.isValid() || !selectedEndDate.isValid()) {
          console.error("Invalid date format:", dateRange);
          setStateData({});
          setError(`Invalid date format`);
          return;
        }

        const transformedData = {};
        const statePrograms = {};
        let hasDataInRange = false;

        // Process data only for the selected range
        Object.keys(apiData).forEach(programId => {
          const program = apiData[programId];
          Object.entries(program).forEach(([monthStr, monthData]) => {
            const apiMonth = parseMonthString(monthStr);

            if (apiMonth.isValid() && 
                apiMonth.isBetween(selectedStartDate, selectedEndDate, 'month', '[]')) {
              hasDataInRange = true;
              
              Object.entries(monthData).forEach(([state, metrics]) => {
                if (!statePrograms[state]) {
                  statePrograms[state] = new Set();
                }
                statePrograms[state].add(programId);

                if (!transformedData[state]) {
                  transformedData[state] = {
                    ngoNum: 0,
                    teachersTrained: 0,
                    schoolVisits: 0,
                    sessionConducted: 0,
                    modules: 0,
                    learningHour: 0
                  };
                }
                
                transformedData[state].teachersTrained += parseInt(metrics["Number of Teachers Trained"]) || 0;
                transformedData[state].schoolVisits += parseInt(metrics["Number of School Visits"]) || 0;
                transformedData[state].sessionConducted += parseInt(metrics["Number of Sessions Conducted"]) || 0;
                transformedData[state].modules += parseInt(metrics["Number of Modules Completed"]) || 0;
                transformedData[state].learningHour = transformedData[state].sessionConducted * 1;
              });
            }
          });
        });

        if (!hasDataInRange) {
          setStateData({});
          setError(`No data available for selected date range`);
          return;
        }

        // Set NGO counts
        Object.keys(transformedData).forEach(state => {
          if (statePrograms[state]) {
            transformedData[state].ngoNum = statePrograms[state].size;
          }
        });

        setStateData(transformedData);
        setError(null);
      } catch (err) {
        console.error("Error processing state data:", err);
        setError("Failed to process state data");
      }
    };

    processStateData();
  }, [apiData, dateRange]);

  // Function to calculate the position of the dialog based on event coordinates
  const calculateDialogPosition = (e) => {
    if (!mapContainerRef.current) return { x: 0, y: 0 };
    
    // Get map container bounds
    const mapBounds = mapContainerRef.current.getBoundingClientRect();
    
    // Get coordinates relative to map container
    let x = e.originalEvent.clientX - mapBounds.left;
    let y = e.originalEvent.clientY - mapBounds.top;
    
    // Adjust position to ensure dialog stays within map bounds
    // Assume dialog is approximately 300px wide and 400px tall
    const dialogWidth = 300;
    const dialogHeight = 400;
    
    // Ensure dialog doesn't go beyond right edge
    if (x + dialogWidth > mapBounds.width) {
      x = x - dialogWidth;
    }
    
    // Ensure dialog doesn't go beyond bottom edge
    if (y + dialogHeight > mapBounds.height) {
      y = y - dialogHeight;
    }
    
    return { x, y };
  };

  const onEachState = (feature, layer) => {
    const stateName = feature.properties.st_nm;
    const hasData = stateData && Object.keys(stateData).includes(stateName);

    layer.setStyle({
      fillColor: hasData ? "#CED7CE" : "#E0E0E0",
      weight: 2,
      opacity: 1,
      color: "#FFF",
      fillOpacity: 1,
      cursor: hasData ? 'pointer' : 'default',
    });

    layer.on({
      mouseover: (e) => {
        if (hasData) {
          // Calculate and set the dialog position based on mouse position
          const position = calculateDialogPosition(e);
          setDialogPosition(position);
          
          setHoveredState({
            name: stateName,
            ...stateData[stateName],
          });
          e.target.setStyle({
            fillColor: "#5C785A",
            fillOpacity: 1,
            opacity: 1,
          });
          e.target.getElement().style.cursor = 'pointer';
        } else {
          e.target.getElement().style.cursor = 'default';
        }
        
      },
      mouseout: (e) => {
        setHoveredState(null);
        e.target.setStyle({
          fillColor: hasData ? "#CED7CE" : "#E0E0E0",
          fillOpacity: 1,
          opacity: 1,
          color: "#FFF",
        });
        e.target.getElement().style.cursor = 'default';
      },
      // Add click handler to handle clicks on states
      click: (e) => {
        if (hasData) {
          // Calculate and set the dialog position based on click position
          const position = calculateDialogPosition(e);
          setDialogPosition(position);
          
          setHoveredState({
            name: stateName,
            ...stateData[stateName],
          });
          e.target.setStyle({
            fillColor: "#5C785A",
            fillOpacity: 1,
            opacity: 1,
          });
        }
      }
    });
  };

  if (error) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: '400px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
        }}
      >
        <Typography variant="h6" color="text.secondary">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{position:"relative" ,right:"20px",}}>
      <Typography variant="h6">
        State Wise NGO Presence Across India
        {dateRange.startDate && dateRange.endDate && 
          ` (${dateRange.startDate} - ${dateRange.endDate})`
        }
      </Typography>
      <div style={{ position: 'relative' }} ref={mapContainerRef}>
        <MapContainer
          center={[23.5, 83]}
          zoom={4.5}
          style={{
            height: "800px",
            width: "675px",
            backgroundColor: "#ffff",
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
              key={JSON.stringify(stateData)}
              data={geoData}
              style={{ weight: 2, opacity: 1, color: "white", fillOpacity: 1 }}
              onEachFeature={onEachState}
            />
          )}
        </MapContainer>

        {hoveredState && (
          <div 
            className="hover-dialog" 
            style={{
              position: 'absolute',
              left: `${dialogPosition.x}px`,
              top: `${dialogPosition.y}px`,
              zIndex: 1000
            }}
          >
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
      </div>
    </Container>
  );
};

export default LocationWiseImpact;