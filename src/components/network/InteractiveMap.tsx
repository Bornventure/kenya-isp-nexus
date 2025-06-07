
import React, { useState, useCallback } from 'react';
import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import { Client } from '@/types/client';
import ClientMarker from './ClientMarker';
import MapControls from './MapControls';
import MapLegend from './MapLegend';
import MapStyleSelector from './MapStyleSelector';
import './LeafletStyles.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';

interface InteractiveMapProps {
  clients: Client[];
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ clients }) => {
  const [mapStyle, setMapStyle] = useState('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  // Default center for Nairobi, Kenya
  const defaultCenter: [number, number] = [-1.2921, 36.8219];
  const defaultZoom = 11;

  const handleClientToggle = useCallback((clientId: string) => {
    setSelectedClient(prev => prev === clientId ? null : clientId);
  }, []);

  const handleZoomIn = () => {
    console.log('Zoom in clicked');
  };

  const handleZoomOut = () => {
    console.log('Zoom out clicked');
  };

  const handleReset = () => {
    console.log('Reset clicked');
  };

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          url={mapStyle}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <ZoomControl position="bottomright" />

        {/* Client markers */}
        {clients.map((client) => (
          <ClientMarker
            key={client.id}
            client={client}
            showPopup={selectedClient === client.id}
            onTogglePopup={() => handleClientToggle(client.id)}
          />
        ))}
      </MapContainer>

      {/* Map style selector */}
      <MapStyleSelector currentStyle={mapStyle} onStyleChange={setMapStyle} />

      {/* Map controls */}
      <MapControls 
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
      />

      {/* Legend */}
      <MapLegend />
    </div>
  );
};

export default InteractiveMap;
