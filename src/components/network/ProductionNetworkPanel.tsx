
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Router, 
  Settings, 
  Plus,
  Activity,
  Users,
  Network
} from 'lucide-react';
import MikroTikSetupWizard from './MikroTikSetupWizard';
import { useProductionNetworkManagement } from '@/hooks/useProductionNetworkManagement';

const ProductionNetworkPanel = () => {
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [activeRouters] = useState([
    {
      id: '1',
      name: 'Main Router',
      ip: '192.168.1.1',
      status: 'online',
      clients: 12,
      uptime: '5 days'
    }
  ]);

  const {
    disconnectClient,
    reconnectClient,
    getDeviceStatus
  } = useProductionNetworkManagement();

  if (showSetupWizard) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">MikroTik Router Setup</h2>
          <Button variant="outline" onClick={() => setShowSetupWizard(false)}>
            Back to Network Panel
          </Button>
        </div>
        <MikroTikSetupWizard />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Production Network Control</h2>
          <p className="text-muted-foreground">Manage your MikroTik routers and client connections</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowSetupWizard(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Router
          </Button>
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs defaultValue="routers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="routers">Active Routers</TabsTrigger>
          <TabsTrigger value="clients">Connected Clients</TabsTrigger>
          <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="routers" className="space-y-4">
          {activeRouters.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Router className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No MikroTik Routers Configured</h3>
                <p className="text-muted-foreground mb-4">
                  Add your first MikroTik router to start managing client connections and network traffic.
                </p>
                <Button onClick={() => setShowSetupWizard(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Setup MikroTik Router
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeRouters.map((router) => (
                <Card key={router.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{router.name}</CardTitle>
                      <Badge variant={router.status === 'online' ? 'default' : 'destructive'}>
                        {router.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">IP Address:</span>
                      <span className="font-medium">{router.ip}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Connected Clients:</span>
                      <span className="font-medium">{router.clients}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Uptime:</span>
                      <span className="font-medium">{router.uptime}</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        Configure
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        Monitor
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Connected Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>No clients connected. Set up your MikroTik router to see client connections.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Network Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Network className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Network monitoring will be available once you configure your MikroTik router.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductionNetworkPanel;
