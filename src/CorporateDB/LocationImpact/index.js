import React, { useEffect, useState } from 'react';
import { MapContainer, GeoJSON } from 'react-leaflet';
import { Typography, Box } from '@mui/material';
import 'leaflet/dist/leaflet.css';
import './LocationWiseImpact.css'
import Location from './../Image/location_on.png'


const stateData = {
  Maharashtra: {
    ngoNum: 10,
    teachersTrained: 30,
    schoolVisits: 20,
    sessionConducted: 200,
    modules: 10,
    learningHour: 200,
  },
  Gujarat: {
    ngoNum: 15,
    teachersTrained: 25,
    schoolVisits: 18,
    sessionConducted: 100,
    modules: 5,
    learningHour: 250,
  },
  UttarPradesh: {
    ngoNum: 12,
    teachersTrained: 28,
    schoolVisits: 22,
    sessionConducted: 240,
    modules: 8,
    learningHour: 100,
  },
  Karnataka: {
    ngoNum: 20,
    teachersTrained: 40,
    schoolVisits: 30,
    sessionConducted: 20,
    modules: 1,
    learningHour: 20,
  },
  Telangana: {
    ngoNum: 8,
    teachersTrained: 35,
    schoolVisits: 25,
    sessionConducted: 40,
    modules: 60,
    learningHour: 270,
  },
  AndhraPradesh: {
    ngoNum: 10,
    teachersTrained: 30,
    schoolVisits: 27,
    sessionConducted: 30,
    modules: 11,
    learningHour: 590,
  },
  Odisha: {
    ngoNum: 5,
    teachersTrained: 18,
    schoolVisits: 15,
    sessionConducted: 80,
    modules: 21,
    learningHour: 670,
  },
 
};


const LocationWiseImpact = () => {
  const [geoData, setGeoData] = useState(null);
  const [hoveredState, setHoveredState] = useState(null);
  
  useEffect(() => {
    fetch('/india-geo.json') 
      .then((response) => response.json())
      .then((data) => setGeoData(data))
      .catch((error) => console.error('Error loading GeoJSON:', error));
  }, []);

  const onEachState = (feature, layer) => {
    const stateName = feature.properties.st_nm;
  
    const hasData = stateData[stateName] && stateData[stateName].ngoNum;
  
    const defaultColor = hasData ? '#CED7CE' : '#E0E0E0';

    layer.setStyle({
      fillColor: defaultColor,
      weight: 2,
      opacity: 1, 
      color: '#FFF', 
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
            fillColor: '#5C785A', 
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
        const resetColor = hasData ? '#CED7CE' : '#E0E0E0';
        e.target.setStyle({
          fillColor: resetColor, 
          fillOpacity: 1, 
          opacity: 1, 
          color: '#FFF', 
        });
      },
    });
      };
  

  return (
    <Box p={3} style={{position:"relative",height:"130vh"}}>
      <Typography variant="h6">State Wise NGO Presence Across India</Typography>
      <MapContainer
            center={[23.5, 83]}
            zoom={4.5}
            style={{
              height: "757px",
              width: "675px",
              backgroundColor: "#ffff",
              top:"20px",
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
            style={{ weight: 2, opacity: 1, color: 'white', fillOpacity: 1 }}
            onEachFeature={onEachState} 
          />
        )}
      </MapContainer>
        {hoveredState && (
        <div className="hover-dialog">
          <div className="dialog-header">
            <img src={Location} alt="State Location" className="state-icon" />
            <Typography color="primary" variant="subtitle1">{hoveredState.name}
          </Typography>          
        </div>
          <div className="dialog-body">
            <div className="ngo-data">
              <div className="ngo-data-in">
                <div>
                  <Typography variant="subtitle2">Total NGOs </Typography>
                </div>
                <div>
                <span color="text.secondary" variant="subtitle2">{hoveredState.ngoNum}</span>
                </div>
              </div>
              <div className="ngo-data-in">
                <div>
                  <Typography color= "#4A4A4A" variant="subtitle2">Number of Teachers Trained</Typography>
                </div >
                <div>
                  <span  variant="subtitle2">{hoveredState.teachersTrained}</span>
                </div>

              </div>
              <div className="ngo-data-in">
                <div>
                  <Typography color= "#4A4A4A" variant="subtitle2">Number of School Visits</Typography>
                </div>
                <div>
                  <span color="text.secondary" variant="subtitle2">{hoveredState.schoolVisits}</span>
                </div>
              </div>
              <div className="ngo-data-in">
                <div>
                  <Typography color= "#4A4A4A" variant="subtitle2">Number of Sessions Conducted</Typography>
                </div>
                <div>
                  <span color="text.secondary" variant="subtitle2">{hoveredState.sessionConducted}</span>
                </div>
              </div>
              <div className="ngo-data-in">
                <div>
                  <Typography color= "#4A4A4A" variant="subtitle2">Number of Modules Completed</Typography>
                </div>
                <div>
                  <span color="text.secondary" variant="subtitle2">{hoveredState.modules}</span>
                </div>
              </div>
              <div className="ngo-data-in">
                <div>
                  <Typography color= "#4A4A4A" variant="subtitle2">Total Learning Hours</Typography>
                </div>
                <div>
                  <span color="text.secondary" variant="subtitle2">{hoveredState.learningHour}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
       )}
    </Box>
  );
};

export default LocationWiseImpact;
