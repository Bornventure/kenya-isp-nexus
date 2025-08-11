
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePromoteToMikrotikRouter } from '@/hooks/usePromoteToMikrotikRouter';
import { Loader2 } from 'lucide-react';

interface InventoryItem {
  id: string;
  item_id: string;
  name?: string;
  type: string;
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  mac_address?: string;
}

interface PromoteToMikrotikDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventoryItem: InventoryItem | null;
}

const PromoteToMikrotikDialog: React.FC<PromoteToMikrotikDialogProps> = ({
  open,
  onOpenChange,
  inventoryItem,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    ip_address: '',
    admin_username: 'admin',
    admin_password: '',
    snmp_community: 'public',
    snmp_version: 2,
    pppoe_interface: 'pppoe-server1',
    dns_servers: '8.8.8.8,8.8.4.4',
    client_network: '10.0.0.0/24',
    gateway: '',
  });

  const { mutate: promoteToMikrotik, isPending } = usePromoteToMikrotikRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inventoryItem) return;

    console.log('Promoting item to MikroTik router with data:', formData);
    promoteToMikrotik(
      {
        inventoryItemId: inventoryItem.id,
        routerData: {
          ...formData,
          name: formData.name || `${inventoryItem.manufacturer} ${inventoryItem.model}`,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setFormData({
            name: '',
            ip_address: '',
            admin_username: 'admin',
            admin_password: '',
            snmp_community: 'public',
            snmp_version: 2,
            pppoe_interface: 'pppoe-server1',
            dns_servers: '8.8.8.8,8.8.4.4',
            client_network: '10.0.0.0/24',
            gateway: '',
          });
        },
      }
    );
  };

  if (!inventoryItem) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Promote to MikroTik Router</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Item Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Current Inventory Item</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Item ID:</span> {inventoryItem.item_id}
                </div>
                <div>
                  <span className="font-medium">Type:</span> {inventoryItem.type}
                </div>
                <div>
                  <span className="font-medium">Manufacturer:</span> {inventoryItem.manufacturer || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Model:</span> {inventoryItem.model || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Serial:</span> {inventoryItem.serial_number || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">MAC:</span> {inventoryItem.mac_address || 'N/A'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Router Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">MikroTik Router Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Router Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={`${inventoryItem.manufacturer} ${inventoryItem.model}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ip_address">IP Address *</Label>
                  <Input
                    id="ip_address"
                    value={formData.ip_address}
                    onChange={(e) => setFormData(prev => ({ ...prev, ip_address: e.target.value }))}
                    placeholder="192.168.1.1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admin_username">Admin Username</Label>
                  <Input
                    id="admin_username"
                    value={formData.admin_username}
                    onChange={(e) => setFormData(prev => ({ ...prev, admin_username: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin_password">Admin Password *</Label>
                  <Input
                    id="admin_password"
                    type="password"
                    value={formData.admin_password}
                    onChange={(e) => setFormData(prev => ({ ...prev, admin_password: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="snmp_community">SNMP Community</Label>
                  <Input
                    id="snmp_community"
                    value={formData.snmp_community}
                    onChange={(e) => setFormData(prev => ({ ...prev, snmp_community: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="snmp_version">SNMP Version</Label>
                  <Select 
                    value={formData.snmp_version.toString()} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, snmp_version: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">v1</SelectItem>
                      <SelectItem value="2">v2c</SelectItem>
                      <SelectItem value="3">v3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pppoe_interface">PPPoE Interface</Label>
                  <Input
                    id="pppoe_interface"
                    value={formData.pppoe_interface}
                    onChange={(e) => setFormData(prev => ({ ...prev, pppoe_interface: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client_network">Client Network</Label>
                  <Input
                    id="client_network"
                    value={formData.client_network}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_network: e.target.value }))}
                    placeholder="10.0.0.0/24"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dns_servers">DNS Servers</Label>
                  <Input
                    id="dns_servers"
                    value={formData.dns_servers}
                    onChange={(e) => setFormData(prev => ({ ...prev, dns_servers: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gateway">Gateway</Label>
                  <Input
                    id="gateway"
                    value={formData.gateway}
                    onChange={(e) => setFormData(prev => ({ ...prev, gateway: e.target.value }))}
                    placeholder="192.168.1.1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending || !formData.ip_address || !formData.admin_password}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Promoting...
                </>
              ) : (
                'Promote to MikroTik Router'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PromoteToMikrotikDialog;
