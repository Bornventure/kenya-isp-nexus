
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClients } from '@/hooks/useClients';
import { useToast } from '@/hooks/use-toast';
import { Power, Wifi, Settings, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const ServiceActivationManager: React.FC = () => {
  const { clients } = useClients();
  const { toast } = useToast();
  const [showActivationDialog, setShowActivationDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isActivating, setIsActivating] = useState(false);

  // Filter clients that are approved but not yet active
  const pendingActivationClients = clients.filter(
    client => client.status === 'approved' && client.installation_status === 'completed'
  );

  const handleActivateService = async (client: any) => {
    setSelectedClient(client);
    setShowActivationDialog(true);
  };

  const confirmActivation = async () => {
    if (!selectedClient) return;

    setIsActivating(true);
    try {
      // Simulate service activation process
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Here you would:
      // 1. Update client status to 'active'
      // 2. Create RADIUS user account
      // 3. Configure Mikrotik settings
      // 4. Send activation SMS
      // 5. Start wallet monitoring

      console.log('Activating service for client:', selectedClient.name);
      
      // Simulate RADIUS integration
      await simulateRadiusIntegration(selectedClient);
      
      // Simulate Mikrotik configuration
      await simulateMikrotikConfig(selectedClient);

      toast({
        title: "Service Activated",
        description: `Service has been successfully activated for ${selectedClient.name}`,
      });

      setShowActivationDialog(false);
      setSelectedClient(null);
    } catch (error) {
      console.error('Service activation error:', error);
      toast({
        title: "Activation Failed",
        description: "Failed to activate service. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsActivating(false);
    }
  };

  const simulateRadiusIntegration = async (client: any) => {
    // Simulate RADIUS user creation
    console.log('Creating RADIUS user for:', client.name);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // This would integrate with your RADIUS server
    const radiusUser = {
      username: client.phone,
      password: generateRandomPassword(),
      package: client.service_package_id,
      expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    };
    
    console.log('RADIUS user created:', radiusUser);
  };

  const simulateMikrotikConfig = async (client: any) => {
    // Simulate Mikrotik configuration
    console.log('Configuring Mikrotik for:', client.name);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // This would integrate with your Mikrotik router
    const mikrotikConfig = {
      ipAddress: generateClientIP(),
      bandwidth: getPackageBandwidth(client.service_package_id),
      vlan: 'client_vlan',
      firewall_rules: ['allow_internet', 'block_local_network']
    };
    
    console.log('Mikrotik configured:', mikrotikConfig);
  };

  const generateRandomPassword = () => {
    return Math.random().toString(36).slice(-8);
  };

  const generateClientIP = () => {
    return `192.168.100.${Math.floor(Math.random() * 200) + 50}`;
  };

  const getPackageBandwidth = (packageId: string) => {
    // This would lookup actual package details
    return '10M/5M'; // Default bandwidth
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'approved':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'suspended':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'approved':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Service Activation</h2>
          <p className="text-gray-600">Activate services for approved clients</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Power className="h-3 w-3" />
          {pendingActivationClients.length} Pending
        </Badge>
      </div>

      <div className="grid gap-4">
        {pendingActivationClients.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center">
                <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <p className="text-gray-600">No services pending activation</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          pendingActivationClients.map((client) => (
            <Card key={client.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(client.status)}
                      {client.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Phone: {client.phone} | Package: {client.monthly_rate ? `KES ${client.monthly_rate}/month` : 'Not set'}
                    </p>
                  </div>
                  <Badge className={getStatusColor(client.status)}>
                    {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Installation Status</p>
                    <p className="capitalize">{client.installation_status}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Connection Type</p>
                    <p className="capitalize">{client.connection_type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Rate</p>
                    <p>KES {client.monthly_rate || 0}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleActivateService(client)}
                    className="flex items-center gap-2"
                  >
                    <Power className="h-4 w-4" />
                    Activate Service
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-1" />
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Service Activation Dialog */}
      <Dialog open={showActivationDialog} onOpenChange={setShowActivationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Activate Service</DialogTitle>
            <DialogDescription>
              Activate internet service for {selectedClient?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedClient && (
              <div className="bg-gray-50 p-4 rounded space-y-2">
                <p><strong>Client:</strong> {selectedClient.name}</p>
                <p><strong>Phone:</strong> {selectedClient.phone}</p>
                <p><strong>Package:</strong> KES {selectedClient.monthly_rate}/month</p>
                <p><strong>Connection:</strong> {selectedClient.connection_type}</p>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm font-medium">Activation Process:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Create RADIUS user account</li>
                <li>• Configure Mikrotik settings</li>
                <li>• Send activation SMS</li>
                <li>• Start service monitoring</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowActivationDialog(false)}
                disabled={isActivating}
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmActivation}
                disabled={isActivating}
              >
                {isActivating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Activating...
                  </>
                ) : (
                  <>
                    <Power className="h-4 w-4 mr-2" />
                    Activate Service
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceActivationManager;
