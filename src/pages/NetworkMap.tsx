
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Map, Radio, Wifi, Users } from 'lucide-react';

const NetworkMap: React.FC = () => {
  // Mock data for demonstration
  const networkStats = {
    totalBaseStations: 12,
    onlineStations: 10,
    totalClients: 156,
    activeConnections: 134
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Network Map</h1>
        <p className="text-muted-foreground">Visual representation of your network infrastructure</p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Base Stations</CardTitle>
            <Radio className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkStats.totalBaseStations}</div>
            <p className="text-xs text-muted-foreground">
              <Badge variant="default" className="text-xs">{networkStats.onlineStations} Online</Badge>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Access Points</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              <Badge variant="default" className="text-xs">22 Active</Badge>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkStats.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              <Badge variant="default" className="text-xs">{networkStats.activeConnections} Connected</Badge>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coverage Area</CardTitle>
            <Map className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45km²</div>
            <p className="text-xs text-muted-foreground">Service area</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Network Overview Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96 bg-muted rounded-lg">
            <div className="text-center">
              <Map className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Interactive Network Map</h3>
              <p className="text-muted-foreground">
                Network map integration will be implemented here.<br />
                This will show real-time locations of base stations, coverage areas, and client connections.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkMap;
