
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Wifi, Router, Users, Activity, Settings } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { useEquipment } from '@/hooks/useEquipment';
import { useMikrotikRouters } from '@/hooks/useMikrotikRouters';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const NetworkMapPage = () => {
  const { clients } = useClients();
  const { equipment } = useEquipment();
  const { routers } = useMikrotikRouters();
  const [mapData, setMapData] = useState<any[]>([]);

  useEffect(() => {
    // Combine real data from clients, equipment, and routers
    const networkNodes = [];

    // Add clients with coordinates
    const clientsWithCoords = clients.filter(client => 
      client.latitude && client.longitude
    ).map(client => ({
      id: client.id,
      name: client.name,
      type: 'client',
      status: client.status,
      location: { lat: Number(client.latitude), lng: Number(client.longitude) },
      address: client.address,
      package: client.service_packages?.name || 'No package',
      connection_type: client.connection_type
    }));

    // Add equipment with locations
    const equipmentWithCoords = equipment.filter(eq => 
      eq.location_coordinates
    ).map(eq => ({
      id: eq.id,
      name: `${eq.brand} ${eq.model}`.trim() || eq.type,
      type: 'equipment',
      status: eq.status,
      location: eq.location_coordinates ? {
        lat: eq.location_coordinates.x,
        lng: eq.location_coordinates.y
      } : null,
      equipment_type: eq.type,
      serial_number: eq.serial_number
    }));

    // Add routers (using a default location for demo, in real app you'd store coordinates)
    const routersData = routers.map(router => ({
      id: router.id,
      name: router.name,
      type: 'router',
      status: router.connection_status,
      location: { lat: -1.2921, lng: 36.8219 }, // Default to Nairobi for demo
      ip_address: router.ip_address,
      router_status: router.status
    }));

    setMapData([...clientsWithCoords, ...equipmentWithCoords, ...routersData]);
  }, [clients, equipment, routers]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'online':
      case 'available': return 'bg-green-100 text-green-800';
      case 'suspended':
      case 'offline':
      case 'maintenance': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'router': return <Router className="h-5 w-5" />;
      case 'equipment': return <Wifi className="h-5 w-5" />;
      case 'client': return <Users className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  // Count active connections
  const activeConnections = mapData.filter(node => 
    ['active', 'online', 'available'].includes(node.status)
  ).length;

  const totalClients = clients.length;
  const onlineClients = clients.filter(c => c.status === 'active').length;
  const totalEquipment = equipment.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Network Map</h1>
          <p className="text-muted-foreground">
            Live network topology showing clients, equipment, and infrastructure
          </p>
        </div>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Configure Map
        </Button>
      </div>

      {/* Network Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground">
              {onlineClients} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {activeConnections}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Equipment</CardTitle>
            <Router className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalEquipment}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Nodes</CardTitle>
            <MapPin className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {mapData.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Map */}
      <Card>
        <CardHeader>
          <CardTitle>Live Network Map</CardTitle>
        </CardHeader>
        <CardContent>
          {mapData.length > 0 ? (
            <div className="h-96 w-full">
              <MapContainer
                center={[-1.2921, 36.8219]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                className="rounded-lg"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {mapData.map((node) => (
                  node.location && (
                    <Marker
                      key={node.id}
                      position={[node.location.lat, node.location.lng]}
                    >
                      <Popup>
                        <div className="p-2">
                          <div className="flex items-center gap-2 mb-2">
                            {getTypeIcon(node.type)}
                            <strong>{node.name}</strong>
                          </div>
                          <Badge className={getStatusColor(node.status)}>
                            {node.status}
                          </Badge>
                          <div className="mt-2 text-sm">
                            <p><strong>Type:</strong> {node.type}</p>
                            {node.address && <p><strong>Address:</strong> {node.address}</p>}
                            {node.ip_address && <p><strong>IP:</strong> {node.ip_address}</p>}
                            {node.package && <p><strong>Package:</strong> {node.package}</p>}
                            {node.connection_type && <p><strong>Connection:</strong> {node.connection_type}</p>}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  )
                ))}
              </MapContainer>
            </div>
          ) : (
            <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No network nodes with coordinates found</p>
                <p className="text-sm text-gray-500 mt-2">
                  Add latitude/longitude coordinates to clients and equipment to see them on the map
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Network Nodes List */}
      <Card>
        <CardHeader>
          <CardTitle>Network Nodes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mapData.length > 0 ? (
              mapData.map((node) => (
                <div key={node.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(node.type)}
                    <div>
                      <h3 className="font-semibold">{node.name}</h3>
                      <p className="text-sm text-gray-600">
                        {node.type === 'client' && node.address}
                        {node.type === 'equipment' && `${node.equipment_type} - ${node.serial_number}`}
                        {node.type === 'router' && node.ip_address}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-sm font-medium">
                        {node.type === 'client' && (node.package || 'No Package')}
                        {node.type === 'equipment' && node.equipment_type}
                        {node.type === 'router' && 'MikroTik Router'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {node.type.charAt(0).toUpperCase() + node.type.slice(1)}
                      </div>
                    </div>
                    
                    <Badge className={getStatusColor(node.status)}>
                      {node.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Network Nodes</h3>
                <p className="text-muted-foreground mb-4">
                  Add clients, equipment, or routers with location data to populate the network map.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkMapPage;
