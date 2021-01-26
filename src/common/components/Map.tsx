import React, { useState } from "react";
import ReactMapGL, { Marker, Popup } from "react-map-gl";

export default function Map() {
  const [viewport, onViewportChange] = useState({
    latitude: 63.43,
    longitude: 10.41,
    zoom: 13,
  });
  const [marker] = useState({
    name: "Rosenborg skole",
    latitude: 63.4296,
    longitude: 10.4177,
  });
  const [popupInfo, setPopupInfo] = useState<string>();

  const mapStyle = {
    width: "100%",
    height: "100%",
  };

  const mapboxApiAccessToken =
    "pk.eyJ1Ijoic2lndXJkZ2EiLCJhIjoiWU1Ub1dLcyJ9.tgg0nUtFrh7IR7hDH3ZWKA";

  const ICON = `M20.2,15.7L20.2,15.7c1.1-1.6,1.8-3.6,1.8-5.7c0-5.6-4.5-10-10-10S2,4.5,2,10c0,2,0.6,3.9,1.6,5.4c0,0.1,0.1,0.2,0.2,0.3
  c0,0,0.1,0.1,0.1,0.2c0.2,0.3,0.4,0.6,0.7,0.9c2.6,3.1,7.4,7.6,7.4,7.6s4.8-4.5,7.4-7.5c0.2-0.3,0.5-0.6,0.7-0.9
  C20.1,15.8,20.2,15.8,20.2,15.7z`;
  const SIZE = 20;

  const onClick = () => {
    setPopupInfo("Rosenborg skole");
  };

  return (
    <ReactMapGL
      mapboxApiAccessToken={mapboxApiAccessToken}
      mapStyle="mapbox://styles/mapbox/streets-v11"
      {...viewport}
      {...mapStyle}
      onViewportChange={onViewportChange}
    >
      {popupInfo && (
        <Popup
          tipSize={5}
          anchor="top"
          {...marker}
          closeOnClick={true}
          onClose={() => setPopupInfo(undefined)}
        >
          Rosenborg skole
        </Popup>
      )}
      <Marker {...marker}>
        <svg
          height={SIZE}
          viewBox="0 0 24 24"
          style={{
            cursor: "pointer",
            fill: "#1a237e",
            stroke: "none",
            transform: `translate(${-SIZE / 2}px,${-SIZE}px)`,
          }}
          onClick={onClick}
        >
          <path d={ICON} />
        </svg>
      </Marker>
    </ReactMapGL>
  );
}
