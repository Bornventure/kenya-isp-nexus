
import React from 'react';
import { useClients } from '@/hooks/useClients';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Activity, Users } from 'lucide-react';
import { enhancedSnmpService } from '@/services/enhancedSnmpService';
import { dataUsageService } from '@/services/dataUsageService';

const ProductionNetworkPanel = () => {
  const { clients: clientsData, isLoading, error } = useClients();

  const handleDisconnectClient = async (clientId: string) => {
    const success = await enhancedSnmpService.disconnectClient(clientId);
    if (success) {
      console.log(`Client ${clientId} disconnected successfully`);
    }
  };

  const handleReconnectClient = async (clientId: string) => {
    const success = await enhancedSnmpService.reconnectClient(clientId);
    if (success) {
      console.log(`Client ${clientId} reconnected successfully`);
    }
  };

  const handleDataUsageTracking = async (clientId: string) => {
    // Track some sample data usage
    await dataUsageService.trackDataUsage(clientId, 1024000, 512000, 'default-equipment');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading network data...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">Error loading network data: {error.message}</div>
        </CardContent>
      </Card>
    );
  }

  const activeClients = clientsData.filter(client => client.status === 'active');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientsData.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Wifi className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeClients.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Clients</CardTitle>
            <WifiOff className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {clientsData.length - activeClients.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Status</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium text-green-600">Online</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client Network Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clientsData.slice(0, 10).map((client) => (
              <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col">
                    <span className="font-medium">{client.name}</span>
                    <span className="text-sm text-muted-foreground">{client.email}</span>
                  </div>
                  <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                    {client.status}
                  </Badge>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDataUsageTracking(client.id)}
                  >
                    Track Usage
                  </Button>
                  {client.status === 'active' ? (
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDisconnectClient(client.id)}
                    >
                      <WifiOff className="h-4 w-4 mr-2" />
                      Disconnect
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="default"
                      onClick={() => handleReconnectClient(client.id)}
                    >
                      <Wifi className="h-4 w-4 mr-2" />
                      Reconnect
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductionNetworkPanel;
