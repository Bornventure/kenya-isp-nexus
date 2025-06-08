
import React, { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import { Client } from '@/types/client';
import ClientMarker from './ClientMarker';
import MapControls from './MapControls';
import MapLegend from './MapLegend';
import MapStyleSelector from './MapStyleSelector';
import ErrorBoundary from './ErrorBoundary';
import './LeafletStyles.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Initialize Leaflet icons only once
let iconsInitialized = false;

const initializeLeafletIcons = () => {
  if (!iconsInitialized) {
    // Fix Leaflet's default icon path issues with webpack
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
    });
    iconsInitialized = true;
  }
};

interface InteractiveMapProps {
  clients: Client[];
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ clients }) => {
  const [mapStyle, setMapStyle] = useState('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [hoveredClient, setHoveredClient] = useState<string | null>(null);
  const [mapKey, setMapKey] = useState(0);

  // Initialize Leaflet icons on component mount
  useEffect(() => {
    initializeLeafletIcons();
  }, []);

  // Default center for Nairobi, Kenya
  const defaultCenter: [number, number] = [-1.2921, 36.8219];
  const defaultZoom = 11;

  const handleClientToggle = useCallback((clientId: string) => {
    setSelectedClient(prev => prev === clientId ? null : clientId);
  }, []);

  const handleClientHover = useCallback((clientId: string | null) => {
    setHoveredClient(clientId);
  }, []);

  const handleZoomIn = () => {
    console.log('Zoom in clicked');
  };

  const handleZoomOut = () => {
    console.log('Zoom out clicked');
  };

  const handleReset = () => {
    console.log('Reset clicked');
    setSelectedClient(null);
    setHoveredClient(null);
    setMapKey(prev => prev + 1);
  };

  // Handle map style changes
  const handleStyleChange = useCallback((newStyle: string) => {
    setMapStyle(newStyle);
  }, []);

  return (
    <ErrorBoundary>
      <div className="relative w-full h-[600px] rounded-lg overflow-hidden border">
        <MapContainer
          key={mapKey}
          center={defaultCenter}
          zoom={defaultZoom}
          style={{ height: '100%', width: '100%' }}
          className="w-full h-full z-0"
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
              isHovered={hoveredClient === client.id}
              onTogglePopup={() => handleClientToggle(client.id)}
              onHover={() => handleClientHover(client.id)}
              onHoverEnd={() => handleClientHover(null)}
            />
          ))}
        </MapContainer>

        {/* Map style selector */}
        <MapStyleSelector currentStyle={mapStyle} onStyleChange={handleStyleChange} />

        {/* Map controls */}
        <MapControls 
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onReset={handleReset}
        />

        {/* Legend */}
        <MapLegend />

        {/* Status indicators overlay */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="text-sm font-medium mb-2">Client Status</div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Active ({clients.filter(c => c.status === 'active').length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Suspended ({clients.filter(c => c.status === 'suspended').length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Pending ({clients.filter(c => c.status === 'pending').length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <span>Disconnected ({clients.filter(c => c.status === 'disconnected').length})</span>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default InteractiveMap;
