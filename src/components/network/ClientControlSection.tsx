
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Wifi, 
  WifiOff, 
  Shield,
  Activity
} from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { useNetworkManagement } from '@/hooks/useNetworkManagement';
import { useToast } from '@/hooks/use-toast';

const ClientControlSection = () => {
  const { clients } = useClients();
  const { disconnectClient, reconnectClient } = useNetworkManagement();
  const { toast } = useToast();

  const activeClients = clients.filter(client => client.status === 'active');

  const handleDisconnect = async (clientId: string, clientName: string) => {
    const success = await disconnectClient(clientId);
    if (success) {
      toast({
        title: "Client Disconnected",
        description: `${clientName} has been disconnected from the network.`,
        variant: "destructive",
      });
    }
  };

  const handleReconnect = async (clientId: string, clientName: string) => {
    const success = await reconnectClient(clientId);
    if (success) {
      toast({
        title: "Client Reconnected",
        description: `${clientName} has been reconnected to the network.`,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Client Network Control</h3>
          <p className="text-sm text-muted-foreground">
            Manage client connections and apply speed limits directly from the ISP system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-green-500" />
          <span className="text-sm text-green-700">RADIUS Controlled</span>
        </div>
      </div>

      <div className="space-y-2">
        {activeClients.map((client) => (
          <Card key={client.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">{client.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {client.service_packages?.name || 'No Package'} - {client.service_packages?.speed || '10Mbps'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                  {client.status}
                </Badge>
                
                {client.status === 'active' ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDisconnect(client.id, client.name)}
                  >
                    <WifiOff className="h-4 w-4 mr-1" />
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleReconnect(client.id, client.name)}
                  >
                    <Wifi className="h-4 w-4 mr-1" />
                    Reconnect
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}

        {activeClients.length === 0 && (
          <Card className="p-8 text-center">
            <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No Active Clients</h3>
            <p className="text-muted-foreground">
              No clients are currently active on the network
            </p>
          </Card>
        )}
      </div>

      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">RADIUS Integration Active</h4>
            <p className="text-sm text-blue-800">
              Speed limits and access control are now managed automatically through RADIUS groups 
              based on the client's service package. No manual speed control needed.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ClientControlSection;
