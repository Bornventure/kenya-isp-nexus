
import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Icon } from 'leaflet';
import { DatabaseClient } from '@/hooks/useClients';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default markers
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface EnhancedNetworkMapProps {
  clients: DatabaseClient[];
  showConnections?: boolean;
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
}

const EnhancedNetworkMap: React.FC<EnhancedNetworkMapProps> = ({
  clients,
  showConnections = false,
  centerLat = -1.2921,
  centerLng = 36.8219,
  zoom = 10
}) => {
  // Filter clients that have valid coordinates
  const clientsWithCoordinates = useMemo(() => {
    return clients.filter(client => 
      client.latitude !== null && 
      client.longitude !== null && 
      client.latitude !== undefined && 
      client.longitude !== undefined
    );
  }, [clients]);

  // Create connections between clients if enabled
  const connections = useMemo(() => {
    if (!showConnections || clientsWithCoordinates.length < 2) return [];
    
    const lines = [];
    for (let i = 0; i < clientsWithCoordinates.length - 1; i++) {
      const client1 = clientsWithCoordinates[i];
      const client2 = clientsWithCoordinates[i + 1];
      
      if (client1.latitude && client1.longitude && client2.latitude && client2.longitude) {
        lines.push({
          positions: [
            [client1.latitude, client1.longitude] as [number, number],
            [client2.latitude, client2.longitude] as [number, number]
          ],
          id: `${client1.id}-${client2.id}`
        });
      }
    }
    return lines;
  }, [clientsWithCoordinates, showConnections]);

  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'suspended': return 'orange';
      case 'pending': return 'blue';
      default: return 'red';
    }
  };

  return (
    <div className="h-full w-full">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Render client markers */}
        {clientsWithCoordinates.map((client) => (
          <Marker
            key={client.id}
            position={[client.latitude!, client.longitude!]}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">{client.name}</h3>
                <p className="text-sm text-gray-600">{client.email}</p>
                <p className="text-sm text-gray-600">{client.phone}</p>
                <p className="text-sm">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 bg-${getMarkerColor(client.status)}-500`}></span>
                  Status: {client.status}
                </p>
                <p className="text-sm">Type: {client.connection_type}</p>
                <p className="text-sm">Package: {client.service_packages?.name || 'N/A'}</p>
                <p className="text-sm">Rate: KSh {client.monthly_rate}/month</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Render connections if enabled */}
        {showConnections && connections.map((connection) => (
          <Polyline
            key={connection.id}
            positions={connection.positions}
            color="blue"
            weight={2}
            opacity={0.6}
          />
        ))}
      </MapContainer>
    </div>
  );
};

export default EnhancedNetworkMap;
