
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Radio, MapPin, Activity, AlertTriangle } from 'lucide-react';

const BaseStations = () => {
  const stations = [
    {
      id: 'BS001',
      name: 'Downtown Station Alpha',
      location: 'Downtown District, Sector 7',
      status: 'online',
      signalStrength: 95,
      connectedDevices: 128,
      lastPing: '2 minutes ago',
      type: 'Primary'
    },
    {
      id: 'BS002', 
      name: 'Residential Hub Beta',
      location: 'Residential Area, Zone 3',
      status: 'online',
      signalStrength: 87,
      connectedDevices: 64,
      lastPing: '1 minute ago',
      type: 'Secondary'
    },
    {
      id: 'BS003',
      name: 'Industrial Zone Gamma',
      location: 'Industrial Complex, Block A',
      status: 'warning',
      signalStrength: 72,
      connectedDevices: 32,
      lastPing: '15 minutes ago',
      type: 'Remote'
    },
    {
      id: 'BS004',
      name: 'Suburban Point Delta',
      location: 'Suburban District, Area 12',
      status: 'offline',
      signalStrength: 0,
      connectedDevices: 0,
      lastPing: '2 hours ago',
      type: 'Remote'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'online': return 'default';
      case 'warning': return 'destructive';
      case 'offline': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Base Stations</h1>
          <p className="text-muted-foreground">Monitor and manage your network base stations</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Station
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Radio className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stations.filter(s => s.status === 'online').length}</p>
                <p className="text-sm text-muted-foreground">Online</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stations.filter(s => s.status === 'warning').length}</p>
                <p className="text-sm text-muted-foreground">Warning</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <Activity className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stations.filter(s => s.status === 'offline').length}</p>
                <p className="text-sm text-muted-foreground">Offline</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Radio className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stations.reduce((acc, s) => acc + s.connectedDevices, 0)}</p>
                <p className="text-sm text-muted-foreground">Total Devices</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stations.map((station) => (
          <Card key={station.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getStatusColor(station.status)} text-white`}>
                    <Radio className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{station.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {station.location}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={getStatusVariant(station.status)}>
                  {station.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Signal Strength</p>
                    <p className="font-semibold">{station.signalStrength}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Connected Devices</p>
                    <p className="font-semibold">{station.connectedDevices}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-semibold">{station.type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Ping</p>
                    <p className="font-semibold">{station.lastPing}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Configure
                  </Button>
                  <Button size="sm" className="flex-1">
                    Monitor
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BaseStations;
