
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wifi, 
  Router, 
  Users,
  Activity,
  Settings,
  AlertTriangle
} from 'lucide-react';

interface HotspotNetworkIntegrationProps {
  selectedHotspot?: string;
}

const HotspotNetworkIntegration: React.FC<HotspotNetworkIntegrationProps> = ({ selectedHotspot }) => {
  const [networkStatus, setNetworkStatus] = useState({
    isConnected: true,
    signalStrength: 85,
    connectedDevices: 12,
    bandwidth: '45.2 Mbps'
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-6 w-6" />
            Hotspot Network Integration
            {selectedHotspot && (
              <Badge variant="outline">
                {selectedHotspot}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="status" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="status">Status</TabsTrigger>
              <TabsTrigger value="devices">Devices</TabsTrigger>
              <TabsTrigger value="bandwidth">Bandwidth</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="status" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Connection</span>
                    </div>
                    <p className="text-2xl font-bold mt-2">
                      {networkStatus.isConnected ? 'Active' : 'Inactive'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Signal</span>
                    </div>
                    <p className="text-2xl font-bold mt-2">{networkStatus.signalStrength}%</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">Devices</span>
                    </div>
                    <p className="text-2xl font-bold mt-2">{networkStatus.connectedDevices}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Router className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium">Bandwidth</span>
                    </div>
                    <p className="text-2xl font-bold mt-2">{networkStatus.bandwidth}</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="devices" className="space-y-4">
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Connected devices will appear here</p>
              </div>
            </TabsContent>

            <TabsContent value="bandwidth" className="space-y-4">
              <div className="text-center py-8">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Bandwidth monitoring charts will appear here</p>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="text-center py-8">
                <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Network settings will appear here</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default HotspotNetworkIntegration;
