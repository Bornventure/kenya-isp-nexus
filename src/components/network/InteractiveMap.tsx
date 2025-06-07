import React, { useState, useCallback } from 'react';
import Map, { NavigationControl } from 'react-map-gl';
import { Client } from '@/types/client';
import ClientMarker from './ClientMarker';
import MapControls from './MapControls';
import MapLegend from './MapLegend';
import MapStyleSelector from './MapStyleSelector';
import 'mapbox-gl/dist/mapbox-gl.css';

interface InteractiveMapProps {
  clients: Client[];
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ clients }) => {
  const [viewState, setViewState] = useState({
    longitude: 34.75,
    latitude: -0.1,
    zoom: 12,
    pitch: 0,
    bearing: 0
  });
  
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v12');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  // You'll need to set your Mapbox access token
  const MAPBOX_TOKEN = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbTI4a2p6dTUwNWZzMmxzNGp5cXh1bzViIn0.cBX2nEN_rFKbhZ9JRvfGxA';

  const handleZoomIn = useCallback(() => {
    setViewState(prev => ({ ...prev, zoom: Math.min(prev.zoom + 1, 20) }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setViewState(prev => ({ ...prev, zoom: Math.max(prev.zoom - 1, 1) }));
  }, []);

  const handleReset = useCallback(() => {
    setViewState({
      longitude: 34.75,
      latitude: -0.1,
      zoom: 12,
      pitch: 0,
      bearing: 0
    });
  }, []);

  const handleClientToggle = useCallback((clientId: string) => {
    setSelectedClient(prev => prev === clientId ? null : clientId);
  }, []);

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle={mapStyle}
        mapboxAccessToken={MAPBOX_TOKEN}
        attributionControl={false}
      >
        {/* Navigation controls */}
        <NavigationControl position="bottom-right" />

        {/* Client markers */}
        {clients.map((client) => (
          <ClientMarker
            key={client.id}
            client={client}
            showPopup={selectedClient === client.id}
            onTogglePopup={() => handleClientToggle(client.id)}
          />
        ))}
      </Map>

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
