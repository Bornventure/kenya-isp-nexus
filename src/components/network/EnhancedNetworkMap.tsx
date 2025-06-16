
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LatLngBounds, Icon } from 'leaflet';
import { useClients } from '@/hooks/useClients';
import { useEquipment } from '@/hooks/useEquipment';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MapPin, Router, Server, Wifi, Cable } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Custom icons for different equipment types
const createCustomIcon = (color: string, type: string) => {
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="12" fill="${color}" stroke="white" stroke-width="2"/>
        <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-family="Arial">
          ${type === 'router' ? 'R' : type === 'switch' ? 'S' : type === 'access_point' ? 'AP' : 'E'}
        </text>
      </svg>
    `)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Client status colors
const getClientColor = (status: string) => {
  switch (status) {
    case 'active': return '#22c55e';
    case 'suspended': return '#ef4444';
    case 'pending': return '#f59e0b';
    default: return '#6b7280';
  }
};

// Equipment type colors
const getEquipmentColor = (type: string) => {
  switch (type) {
    case 'router': return '#3b82f6';
    case 'switch': return '#8b5cf6';
    case 'access_point': return '#06b6d4';
    default: return '#6b7280';
  }
};

interface BaseStation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  coverage_radius: number;
  status: string;
}

const MapBoundsUpdater: React.FC<{ markers: Array<{lat: number, lng: number}> }> = ({ markers }) => {
  const map = useMap();

  useEffect(() => {
    if (markers.length > 0) {
      const bounds = new LatLngBounds(markers.map(m => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, markers]);

  return null;
};

const EnhancedNetworkMap: React.FC = () => {
  const [filter, setFilter] = useState<string>('all');
  const [baseStations, setBaseStations] = useState<BaseStation[]>([]);
  const { clients } = useClients();
  const { equipment } = useEquipment();
  const { profile } = useAuth();

  // Fetch base stations
  useEffect(() => {
    const fetchBaseStations = async () => {
      if (!profile?.isp_company_id) return;

      const { data } = await supabase
        .from('base_stations')
        .select('*')
        .eq('isp_company_id', profile.isp_company_id);

      if (data) {
        setBaseStations(data);
      }
    };

    fetchBaseStations();
  }, [profile?.isp_company_id]);

  // Filter clients based on status
  const filteredClients = clients.filter(client => {
    if (filter === 'all') return client.latitude && client.longitude;
    return client.status === filter && client.latitude && client.longitude;
  });

  // Filter equipment with coordinates
  const filteredEquipment = equipment.filter(eq => 
    eq.location_coordinates && eq.approval_status === 'approved'
  );

  // Prepare all markers for bounds calculation
  const allMarkers = [
    ...filteredClients.map(client => ({ lat: client.latitude!, lng: client.longitude! })),
    ...filteredEquipment.map(eq => {
      const coords = eq.location_coordinates as any;
      return { lat: coords.x || coords.lat, lng: coords.y || coords.lng };
    }),
    ...baseStations.map(bs => ({ lat: bs.latitude, lng: bs.longitude }))
  ];

  // Default center (Nairobi, Kenya)
  const defaultCenter = { lat: -1.286389, lng: 36.817223 };
  const mapCenter = allMarkers.length > 0 ? allMarkers[0] : defaultCenter;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Suspended</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Equipment</span>
          </div>
        </div>
      </div>

      {/* Map */}
      <Card>
        <CardContent className="p-0">
          <div className="h-[600px] w-full">
            <MapContainer
              center={[mapCenter.lat, mapCenter.lng]}
              zoom={10}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <MapBoundsUpdater markers={allMarkers} />

              {/* Base Stations with Coverage */}
              {baseStations.map((station) => (
                <React.Fragment key={station.id}>
                  <Marker
                    position={[station.latitude, station.longitude]}
                    icon={createCustomIcon('#dc2626', 'BS')}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-semibold">{station.name}</h3>
                        <p className="text-sm text-gray-600">Base Station</p>
                        <Badge variant={station.status === 'active' ? 'default' : 'destructive'}>
                          {station.status}
                        </Badge>
                      </div>
                    </Popup>
                  </Marker>
                  
                  {/* Coverage Circle */}
                  <Circle
                    center={[station.latitude, station.longitude]}
                    radius={station.coverage_radius}
                    fillColor="#dc2626"
                    fillOpacity={0.1}
                    color="#dc2626"
                    weight={2}
                  />
                </React.Fragment>
              ))}

              {/* Client Markers */}
              {filteredClients.map((client) => (
                <Marker
                  key={client.id}
                  position={[client.latitude!, client.longitude!]}
                  icon={createCustomIcon(getClientColor(client.status), 'C')}
                >
                  <Popup>
                    <div className="p-2 min-w-[200px]">
                      <h3 className="font-semibold">{client.name}</h3>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Phone:</span> {client.phone}</p>
                        <p><span className="font-medium">Type:</span> {client.connection_type}</p>
                        <p><span className="font-medium">Package:</span> KES {client.monthly_rate}/month</p>
                        <p><span className="font-medium">Address:</span> {client.address}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={
                            client.status === 'active' ? 'default' : 
                            client.status === 'suspended' ? 'destructive' : 'secondary'
                          }>
                            {client.status}
                          </Badge>
                          {client.wallet_balance !== undefined && (
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              Wallet: KES {client.wallet_balance}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Equipment Markers */}
              {filteredEquipment.map((eq) => {
                const coords = eq.location_coordinates as any;
                const lat = coords?.x || coords?.lat;
                const lng = coords?.y || coords?.lng;
                
                if (!lat || !lng) return null;

                return (
                  <Marker
                    key={eq.id}
                    position={[lat, lng]}
                    icon={createCustomIcon(getEquipmentColor(eq.type), eq.type.charAt(0).toUpperCase())}
                  >
                    <Popup>
                      <div className="p-2 min-w-[200px]">
                        <h3 className="font-semibold">{eq.brand} {eq.model}</h3>
                        <div className="space-y-1 text-sm">
                          <p><span className="font-medium">Type:</span> {eq.type}</p>
                          <p><span className="font-medium">Serial:</span> {eq.serial_number}</p>
                          {eq.ip_address && (
                            <p><span className="font-medium">IP:</span> {eq.ip_address}</p>
                          )}
                          {eq.mac_address && (
                            <p><span className="font-medium">MAC:</span> {eq.mac_address}</p>
                          )}
                          {eq.clients && (
                            <p><span className="font-medium">Assigned to:</span> {eq.clients.name}</p>
                          )}
                          <div className="mt-2">
                            <Badge variant={eq.status === 'active' ? 'default' : 'secondary'}>
                              {eq.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {clients.filter(c => c.status === 'active').length}
              </div>
              <div className="text-sm text-muted-foreground">Active Clients</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {clients.filter(c => c.status === 'suspended').length}
              </div>
              <div className="text-sm text-muted-foreground">Suspended Clients</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {equipment.filter(e => e.approval_status === 'approved').length}
              </div>
              <div className="text-sm text-muted-foreground">Active Equipment</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {baseStations.length}
              </div>
              <div className="text-sm text-muted-foreground">Base Stations</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedNetworkMap;
