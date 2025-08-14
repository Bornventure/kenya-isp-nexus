
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Wifi, Router, Users, Activity } from 'lucide-react';

const NetworkMapPage = () => {
  // Mock data for network map
  const networkNodes = [
    {
      id: '1',
      name: 'Central Hub - Nairobi',
      type: 'hub',
      status: 'active',
      clients: 45,
      location: { lat: -1.2921, lng: 36.8219 },
      equipment: ['Router MikroTik RB4011', 'Switch 24-port']
    },
    {
      id: '2',
      name: 'Westlands Branch',
      type: 'branch',
      status: 'active',
      clients: 23,
      location: { lat: -1.2676, lng: 36.8092 },
      equipment: ['Router RB951Ui-2HnD']
    },
    {
      id: '3',
      name: 'Karen Hotspot',
      type: 'hotspot',
      status: 'maintenance',
      clients: 8,
      location: { lat: -1.3197, lng: 36.7073 },
      equipment: ['Access Point cAP ac']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hub': return <Router className="h-5 w-5" />;
      case 'branch': return <Wifi className="h-5 w-5" />;
      case 'hotspot': return <MapPin className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Network Map</h1>
        <p className="text-muted-foreground">
          Visual overview of your network infrastructure and client locations
        </p>
      </div>

      {/* Network Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Nodes</CardTitle>
            <Router className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkNodes.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {networkNodes.filter(n => n.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {networkNodes.reduce((sum, node) => sum + node.clients, 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <MapPin className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {networkNodes.filter(n => n.status === 'maintenance').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Map Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Network Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Interactive map will be displayed here</p>
              <p className="text-sm text-gray-500 mt-2">
                Showing network nodes, client locations, and connection status
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Nodes List */}
      <Card>
        <CardHeader>
          <CardTitle>Network Nodes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {networkNodes.map((node) => (
              <div key={node.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getTypeIcon(node.type)}
                  <div>
                    <h3 className="font-semibold">{node.name}</h3>
                    <p className="text-sm text-gray-600">
                      {node.equipment.join(', ')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-sm font-medium">{node.clients}</div>
                    <div className="text-xs text-gray-500">Clients</div>
                  </div>
                  
                  <Badge className={getStatusColor(node.status)}>
                    {node.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkMapPage;
