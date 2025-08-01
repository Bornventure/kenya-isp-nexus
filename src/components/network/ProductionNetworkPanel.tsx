
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { enhancedSnmpService } from '@/services/enhancedSnmpService';
import { useClientsWithNetworkManagement } from '@/hooks/useClientsWithNetworkManagement';
import { Power, PowerOff, Settings, Activity, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const ProductionNetworkPanel = () => {
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [deviceStats, setDeviceStats] = useState<any[]>([]);
  const { data: clients, isLoading: clientsLoading } = useClientsWithNetworkManagement();

  useEffect(() => {
    loadDeviceStats();
    const interval = setInterval(loadDeviceStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDeviceStats = async () => {
    try {
      const stats = await enhancedSnmpService.getDeviceStatus();
      setDeviceStats(stats);
    } catch (error) {
      console.error('Failed to load device stats:', error);
    }
  };

  const handleDisconnectClient = async (clientId: string) => {
    setLoading(prev => ({ ...prev, [clientId]: true }));
    try {
      const success = await enhancedSnmpService.disconnectClient(clientId);
      if (success) {
        toast.success('Client disconnected successfully');
        loadDeviceStats(); // Refresh stats
      } else {
        toast.error('Failed to disconnect client');
      }
    } catch (error) {
      console.error('Error disconnecting client:', error);
      toast.error('Error disconnecting client');
    } finally {
      setLoading(prev => ({ ...prev, [clientId]: false }));
    }
  };

  const handleReconnectClient = async (clientId: string) => {
    setLoading(prev => ({ ...prev, [clientId]: true }));
    try {
      const success = await enhancedSnmpService.reconnectClient(clientId);
      if (success) {
        toast.success('Client reconnected successfully');
        loadDeviceStats(); // Refresh stats
      } else {
        toast.error('Failed to reconnect client');
      }
    } catch (error) {
      console.error('Error reconnecting client:', error);
      toast.error('Error reconnecting client');
    } finally {
      setLoading(prev => ({ ...prev, [clientId]: false }));
    }
  };

  const handleApplySpeedLimit = async (clientId: string, packageId: string) => {
    setLoading(prev => ({ ...prev, [clientId]: true }));
    try {
      const success = await enhancedSnmpService.applySpeedLimit(clientId, packageId);
      if (success) {
        toast.success('Speed limit applied successfully');
      } else {
        toast.error('Failed to apply speed limit');
      }
    } catch (error) {
      console.error('Error applying speed limit:', error);
      toast.error('Error applying speed limit');
    } finally {
      setLoading(prev => ({ ...prev, [clientId]: false }));
    }
  };

  const getClientStatus = (clientId: string) => {
    for (const device of deviceStats) {
      const client = device.clients?.find((c: any) => c.clientId === clientId);
      if (client) {
        return client.isConnected ? 'connected' : 'disconnected';
      }
    }
    return 'unknown';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-500">Connected</Badge>;
      case 'disconnected':
        return <Badge variant="destructive">Disconnected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (clientsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Production Network Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading clients...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Production Network Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Production network controls. Use with caution as these actions affect live client connections.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            {clients?.map((client) => {
              const status = getClientStatus(client.id);
              const isLoading = loading[client.id];
              
              return (
                <Card key={client.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">{client.name}</h3>
                        {getStatusBadge(status)}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Email: {client.email}</div>
                        <div>Phone: {client.phone}</div>
                        <div>Package: {client.service_packages?.name || 'No package'}</div>
                        <div>Speed: {client.service_packages?.speed || 'N/A'}</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {status === 'connected' ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDisconnectClient(client.id)}
                          disabled={isLoading}
                        >
                          <PowerOff className="h-4 w-4 mr-1" />
                          {isLoading ? 'Disconnecting...' : 'Disconnect'}
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleReconnectClient(client.id)}
                          disabled={isLoading}
                        >
                          <Power className="h-4 w-4 mr-1" />
                          {isLoading ? 'Connecting...' : 'Connect'}
                        </Button>
                      )}
                      
                      {client.service_package_id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApplySpeedLimit(client.id, client.service_package_id)}
                          disabled={isLoading}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Apply Limits
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
            
            {(!clients || clients.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                No active clients found for network management.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Device Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Network Device Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deviceStats.map((device) => (
              <Card key={device.id} className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{device.type}</span>
                  <Badge className={
                    device.status === 'online' ? 'bg-green-500' :
                    device.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }>
                    {device.status}
                  </Badge>
                </div>
                <div className="text-xs text-gray-600">
                  <div>IP: {device.ipAddress}</div>
                  <div>Clients: {device.clients?.length || 0}</div>
                  <div>Uptime: {Math.floor((device.uptime || 0) / 3600)}h</div>
                </div>
              </Card>
            ))}
          </div>
          
          {deviceStats.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No network devices available for monitoring.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductionNetworkPanel;
