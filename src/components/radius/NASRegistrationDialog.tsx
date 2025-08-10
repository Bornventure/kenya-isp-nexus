
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Router, Shield, Network, CheckCircle } from 'lucide-react';
import { useInventoryItems } from '@/hooks/useInventory';
import { useMikrotikRouters } from '@/hooks/useMikrotikRouters';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface NASRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NASRegistrationDialog: React.FC<NASRegistrationDialogProps> = ({
  open,
  onOpenChange
}) => {
  const [step, setStep] = useState(1);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<any>(null);
  const [nasConfig, setNasConfig] = useState({
    nas_name: '',
    nas_ip: '',
    shared_secret: '',
    radius_server: '127.0.0.1',
    radius_port: '1812',
    pppoe_interface: 'pppoe-server1',
    client_network: '10.0.0.0/24',
    description: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const { profile } = useAuth();
  const { toast } = useToast();
  const { createRouter } = useMikrotikRouters();

  // Get MikroTik routers from inventory that aren't deployed yet
  const { data: inventoryItems = [] } = useInventoryItems({
    category: 'Network Hardware',
    status: 'In Stock'
  });

  const mikrotikInventory = inventoryItems.filter(item => 
    item.type?.toLowerCase().includes('mikrotik') || 
    item.manufacturer?.toLowerCase().includes('mikrotik') ||
    item.model?.toLowerCase().includes('router')
  );

  const handleInventorySelection = (itemId: string) => {
    const item = mikrotikInventory.find(i => i.id === itemId);
    if (item) {
      setSelectedInventoryItem(item);
      setNasConfig(prev => ({
        ...prev,
        nas_name: item.name || `${item.manufacturer} ${item.model}`,
        nas_ip: typeof item.ip_address === 'string' ? item.ip_address : '',
        description: `NAS created from inventory item: ${item.item_id}`
      }));
      setStep(2);
    }
  };

  const handleNASRegistration = async () => {
    if (!selectedInventoryItem || !profile?.isp_company_id) return;

    setIsProcessing(true);
    try {
      // 1. Create MikroTik router entry
      const routerData = {
        name: nasConfig.nas_name,
        ip_address: nasConfig.nas_ip,
        admin_username: 'admin',
        admin_password: '', // Will need to be set by admin
        snmp_community: 'public',
        snmp_version: 2,
        pppoe_interface: nasConfig.pppoe_interface,
        dns_servers: '8.8.8.8,8.8.4.4',
        client_network: nasConfig.client_network,
        gateway: nasConfig.nas_ip,
        status: 'pending' as const,
        connection_status: 'offline' as const,
        last_test_results: null
      };

      // Create router in the system
      createRouter(routerData);

      // 2. Register as RADIUS NAS client
      const { error: nasError } = await supabase
        .from('radius_nas_clients')
        .insert({
          nas_name: nasConfig.nas_name,
          nas_ip: nasConfig.nas_ip,
          nas_secret: nasConfig.shared_secret,
          nas_type: 'mikrotik',
          description: nasConfig.description,
          is_active: true,
          isp_company_id: profile.isp_company_id
        });

      if (nasError) throw nasError;

      // 3. Update inventory item status
      const { error: inventoryError } = await supabase
        .from('inventory_items')
        .update({
          status: 'Deployed',
          is_network_equipment: true,
          ip_address: nasConfig.nas_ip,
          notes: `Deployed as RADIUS NAS: ${nasConfig.nas_name}`
        })
        .eq('id', selectedInventoryItem.id);

      if (inventoryError) throw inventoryError;

      toast({
        title: "NAS Registration Successful",
        description: `${nasConfig.nas_name} has been registered as a RADIUS client and deployed from inventory.`,
      });

      setStep(3);
    } catch (error) {
      console.error('Error registering NAS:', error);
      toast({
        title: "Registration Failed",
        description: "Failed to register NAS client. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetDialog = () => {
    setStep(1);
    setSelectedInventoryItem(null);
    setNasConfig({
      nas_name: '',
      nas_ip: '',
      shared_secret: '',
      radius_server: '127.0.0.1',
      radius_port: '1812',
      pppoe_interface: 'pppoe-server1',
      client_network: '10.0.0.0/24',
      description: ''
    });
    setIsProcessing(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={resetDialog}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Register MikroTik Router as RADIUS Client (NAS)
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Step 1: Select a MikroTik router from your inventory to deploy as a RADIUS client.
            </div>

            {mikrotikInventory.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Router className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No MikroTik Routers Available</h3>
                  <p className="text-sm text-muted-foreground">
                    Add MikroTik routers to your inventory first, then return here to deploy them as RADIUS clients.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3">
                {mikrotikInventory.map((item) => (
                  <Card 
                    key={item.id} 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleInventorySelection(item.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Router className="h-8 w-8 text-blue-500" />
                          <div>
                            <div className="font-medium">{item.name || `${item.manufacturer} ${item.model}`}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.item_id} • {item.serial_number || 'No S/N'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{item.status}</Badge>
                          {item.mac_address && (
                            <div className="text-xs text-muted-foreground mt-1">
                              MAC: {item.mac_address}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 2 && selectedInventoryItem && (
          <div className="space-y-6">
            <div className="text-sm text-muted-foreground">
              Step 2: Configure RADIUS NAS settings for this router.
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Selected Router</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Router className="h-8 w-8 text-blue-500" />
                  <div>
                    <div className="font-medium">{selectedInventoryItem.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedInventoryItem.item_id} • {selectedInventoryItem.manufacturer} {selectedInventoryItem.model}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nas_name">NAS Name</Label>
                <Input
                  id="nas_name"
                  value={nasConfig.nas_name}
                  onChange={(e) => setNasConfig(prev => ({ ...prev, nas_name: e.target.value }))}
                  placeholder="Main Router NAS"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nas_ip">Router IP Address</Label>
                <Input
                  id="nas_ip"
                  value={nasConfig.nas_ip}
                  onChange={(e) => setNasConfig(prev => ({ ...prev, nas_ip: e.target.value }))}
                  placeholder="192.168.1.1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shared_secret">RADIUS Shared Secret</Label>
                <Input
                  id="shared_secret"
                  type="password"
                  value={nasConfig.shared_secret}
                  onChange={(e) => setNasConfig(prev => ({ ...prev, shared_secret: e.target.value }))}
                  placeholder="Enter strong shared secret"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pppoe_interface">PPPoE Interface</Label>
                <Input
                  id="pppoe_interface"
                  value={nasConfig.pppoe_interface}
                  onChange={(e) => setNasConfig(prev => ({ ...prev, pppoe_interface: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_network">Client Network Range</Label>
              <Input
                id="client_network"
                value={nasConfig.client_network}
                onChange={(e) => setNasConfig(prev => ({ ...prev, client_network: e.target.value }))}
                placeholder="10.0.0.0/24"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={nasConfig.description}
                onChange={(e) => setNasConfig(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Additional notes about this NAS client..."
              />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button 
                onClick={handleNASRegistration}
                disabled={!nasConfig.nas_name || !nasConfig.nas_ip || !nasConfig.shared_secret || isProcessing}
              >
                {isProcessing ? 'Registering...' : 'Register NAS Client'}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">NAS Registration Complete!</h3>
              <p className="text-muted-foreground">
                Your MikroTik router has been successfully registered as a RADIUS client and deployed from inventory.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="text-left space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <Network className="h-4 w-4 mt-0.5 text-blue-500" />
                  <span>Configure the router's admin credentials in the MikroTik Routers section</span>
                </div>
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 mt-0.5 text-green-500" />
                  <span>Test the RADIUS connection from the Network Management panel</span>
                </div>
                <div className="flex items-start gap-2">
                  <Router className="h-4 w-4 mt-0.5 text-orange-500" />
                  <span>Apply the RADIUS configuration to your MikroTik router</span>
                </div>
              </CardContent>
            </Card>

            <Button onClick={resetDialog} className="w-full">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NASRegistrationDialog;
