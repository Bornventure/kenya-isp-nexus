import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useClients } from '@/hooks/useClients';
import { useEquipment } from '@/hooks/useEquipment';

// Define custom icon
const clientIcon = new L.Icon({
  iconUrl: '/marker-client.svg',
  iconRetinaUrl: '/marker-client.svg',
  iconAnchor: null,
  popupAnchor: [0, -20],
  shadowUrl: null,
  shadowSize: null,
  shadowAnchor: null,
  iconSize: [30, 30],
  className: 'leaflet-div-icon'
});

const routerIcon = new L.Icon({
  iconUrl: '/marker-router.svg',
  iconRetinaUrl: '/marker-router.svg',
  iconAnchor: null,
  popupAnchor: [0, -20],
  shadowUrl: null,
  shadowSize: null,
  shadowAnchor: null,
  iconSize: [30, 30],
  className: 'leaflet-div-icon'
});

const defaultPosition: [number, number] = [-1.286389, 36.817223]; // Nairobi coordinates
const defaultZoom = 12;

const EnhancedNetworkMap = () => {
  const { clients, isLoading: isLoadingClients, error: errorClients } = useClients();
  const { equipment, isLoading: isLoadingEquipment, error: errorEquipment } = useEquipment();

  const markers = useMemo(() => {
    const clientMarkers = clients
      .filter(client => client.latitude && client.longitude)
      .map(client => ({
        id: client.id,
        type: 'client' as const,
        position: [Number(client.latitude), Number(client.longitude)] as [number, number],
        popup: `
          <div>
            <h3>${client.name}</h3>
            <p>Status: ${client.status}</p>
            <p>Type: ${client.client_type}</p>
            <p>Connection: ${client.connection_type}</p>
          </div>
        `
      }));

    const routerMarkers = equipment
      .filter(item => item.type === 'router' && item.location_coordinates)
      .map(router => {
        try {
          const coordinates = JSON.parse(router.location_coordinates);
          if (Array.isArray(coordinates) && coordinates.length === 2) {
            return {
              id: router.id,
              type: 'router' as const,
              position: [Number(coordinates[0]), Number(coordinates[1])] as [number, number],
              popup: `
                <div>
                  <h3>${router.name}</h3>
                  <p>Type: ${router.type}</p>
                  <p>Status: ${router.status}</p>
                </div>
              `
            };
          } else {
            console.warn(`Invalid coordinates for router ${router.id}:`, coordinates);
            return null;
          }
        } catch (error) {
          console.error(`Error parsing coordinates for router ${router.id}:`, error);
          return null;
        }
      })
      .filter(Boolean) as { id: string; type: "router"; position: [number, number]; popup: string; }[];

    return [...clientMarkers, ...routerMarkers];
  }, [clients, equipment]);

  if (isLoadingClients || isLoadingEquipment) {
    return <div className="text-center">Loading map data...</div>;
  }

  if (errorClients || errorEquipment) {
    return <div className="text-center text-red-500">Error loading map data.</div>;
  }

  return (
    <MapContainer center={defaultPosition} zoom={defaultZoom} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {clients.map(client => 
        client.latitude && client.longitude ? (
          <Marker
            key={client.id}
            position={[Number(client.latitude), Number(client.longitude)]}
            icon={clientIcon}
          >
            <Popup>
              <div>
                <h3 className="font-semibold">{client.name}</h3>
                <p>Status: {client.status}</p>
                <p>Type: {client.client_type}</p>
                <p>Connection: {client.connection_type}</p>
              </div>
            </Popup>
          </Marker>
        ) : null
      )}
      {equipment.map(router => {
        if (router.type === 'router' && router.location_coordinates) {
          try {
            const coordinates = JSON.parse(router.location_coordinates);
            if (Array.isArray(coordinates) && coordinates.length === 2) {
              return (
                <Marker
                  key={router.id}
                  position={[Number(coordinates[0]), Number(coordinates[1])]}
                  icon={routerIcon}
                >
                  <Popup>
                    <div>
                      <h3 className="font-semibold">{router.name}</h3>
                      <p>Type: {router.type}</p>
                      <p>Status: {router.status}</p>
                    </div>
                  </Popup>
                </Marker>
              );
            } else {
              return null;
            }
          } catch (error) {
            return null;
          }
        }
        return null;
      })}
    </MapContainer>
  );
};

export default EnhancedNetworkMap;
