
import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Client } from '@/types/client';
import { Equipment } from '@/types/equipment';
import { MikrotikRouter } from '@/hooks/useMikrotikRouters';

// Fix for default markers
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

interface EnhancedNetworkMapProps {
  clients: Client[];
  equipment: Equipment[];
  routers: MikrotikRouter[];
}

const EnhancedNetworkMap: React.FC<EnhancedNetworkMapProps> = ({
  clients,
  equipment,
  routers
}) => {
  // Default center for Kenya
  const defaultCenter: [number, number] = [-0.0236, 37.9062];
  const defaultZoom = 7;

  // Create custom icons
  const createIcon = (color: string, type: 'client' | 'equipment' | 'router') => {
    const iconSize: [number, number] = type === 'client' ? [25, 25] : [30, 30];
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${color}; width: ${iconSize[0]}px; height: ${iconSize[1]}px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize,
      iconAnchor: [iconSize[0] / 2, iconSize[1] / 2],
    });
  };

  // Filter clients with valid coordinates
  const validClients = useMemo(() => {
    return clients.filter(client => 
      client.latitude && 
      client.longitude && 
      !isNaN(Number(client.latitude)) && 
      !isNaN(Number(client.longitude))
    );
  }, [clients]);

  // Filter equipment with valid coordinates
  const validEquipment = useMemo(() => {
    return equipment.filter(eq => 
      eq.location_coordinates && 
      Array.isArray(eq.location_coordinates) &&
      eq.location_coordinates.length >= 2 &&
      !isNaN(Number(eq.location_coordinates[0])) &&
      !isNaN(Number(eq.location_coordinates[1]))
    );
  }, [equipment]);

  // Mock router coordinates (in real implementation, this would come from the database)
  const routerLocations = useMemo(() => {
    return routers.map((router, index) => ({
      ...router,
      lat: -0.0236 + (index * 0.01), // Mock coordinates around Nairobi
      lng: 37.9062 + (index * 0.01)
    }));
  }, [routers]);

  const getClientStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981'; // green
      case 'suspended': return '#ef4444'; // red
      case 'pending': return '#f59e0b'; // yellow
      case 'approved': return '#3b82f6'; // blue
      case 'disconnected': return '#6b7280'; // gray
      default: return '#6b7280';
    }
  };

  const getEquipmentStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return '#10b981'; // green
      case 'available': return '#3b82f6'; // blue
      case 'maintenance': return '#f59e0b'; // yellow
      case 'retired': return '#ef4444'; // red
      default: return '#6b7280';
    }
  };

  const getRouterStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#10b981'; // green
      case 'offline': return '#ef4444'; // red
      case 'testing': return '#f59e0b'; // yellow
      default: return '#6b7280';
    }
  };

  return (
    <div className="space-y-4">
      {/* Map Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Clients on Map</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{validClients.length}</div>
            <p className="text-xs text-muted-foreground">of {clients.length} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Active Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {validClients.filter(c => c.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">online now</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Network Equipment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{validEquipment.length}</div>
            <p className="text-xs text-muted-foreground">deployed devices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">MikroTik Routers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{routers.length}</div>
            <p className="text-xs text-muted-foreground">
              {routers.filter(r => r.connection_status === 'online').length} online
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Map */}
      <Card>
        <CardHeader>
          <CardTitle>Network Coverage Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] w-full">
            <MapContainer
              center={defaultCenter}
              zoom={defaultZoom}
              style={{ height: '100%', width: '100%' }}
              className="rounded-lg"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              {/* Client Markers */}
              {validClients.map((client) => (
                <Marker
                  key={`client-${client.id}`}
                  position={[Number(client.latitude), Number(client.longitude)]}
                  icon={createIcon(getClientStatusColor(client.status), 'client')}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold">{client.name}</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <span>Status:</span>
                          <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                            {client.status}
                          </Badge>
                        </div>
                        <div>Phone: {client.phone}</div>
                        <div>Package: {client.service_packages?.name || 'Not assigned'}</div>
                        <div>Location: {client.address}</div>
                        <div>Monthly Rate: KES {client.monthly_rate.toLocaleString()}</div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Equipment Markers */}
              {validEquipment.map((eq) => (
                <Marker
                  key={`equipment-${eq.id}`}
                  position={[Number(eq.location_coordinates[0]), Number(eq.location_coordinates[1])]}
                  icon={createIcon(getEquipmentStatusColor(eq.status), 'equipment')}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold">{eq.brand} {eq.model}</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <span>Status:</span>
                          <Badge variant={eq.status === 'deployed' ? 'default' : 'secondary'}>
                            {eq.status}
                          </Badge>
                        </div>
                        <div>Type: {eq.type}</div>
                        <div>Serial: {eq.serial_number}</div>
                        {eq.ip_address && <div>IP: {eq.ip_address}</div>}
                        {eq.location && <div>Location: {eq.location}</div>}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Router Markers */}
              {routerLocations.map((router) => (
                <Marker
                  key={`router-${router.id}`}
                  position={[router.lat, router.lng]}
                  icon={createIcon(getRouterStatusColor(router.connection_status), 'router')}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold">{router.name}</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <span>Status:</span>
                          <Badge variant={router.connection_status === 'online' ? 'default' : 'destructive'}>
                            {router.connection_status}
                          </Badge>
                        </div>
                        <div>IP: {router.ip_address}</div>
                        <div>Network: {router.client_network}</div>
                        <div>Gateway: {router.gateway}</div>
                        {router.last_test_results && (
                          <div>Last Test: {new Date(router.last_test_results.timestamp).toLocaleString()}</div>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Coverage areas for routers */}
              {routerLocations.filter(r => r.connection_status === 'online').map((router) => (
                <Circle
                  key={`coverage-${router.id}`}
                  center={[router.lat, router.lng]}
                  radius={2000} // 2km coverage radius
                  fillColor="#3b82f6"
                  fillOpacity={0.1}
                  color="#3b82f6"
                  weight={1}
                />
              ))}
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Map Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Clients</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500 border border-white"></div>
                  <span>Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500 border border-white"></div>
                  <span>Suspended</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500 border border-white"></div>
                  <span>Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gray-500 border border-white"></div>
                  <span>Disconnected</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Equipment</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-500 border border-white"></div>
                  <span>Deployed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-500 border border-white"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-yellow-500 border border-white"></div>
                  <span>Maintenance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-red-500 border border-white"></div>
                  <span>Retired</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">MikroTik Routers</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-500 border border-white"></div>
                  <span>Online</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-red-500 border border-white"></div>
                  <span>Offline</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-yellow-500 border border-white"></div>
                  <span>Testing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border-2 border-blue-500 bg-blue-100"></div>
                  <span>Coverage Area (2km)</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedNetworkMap;
