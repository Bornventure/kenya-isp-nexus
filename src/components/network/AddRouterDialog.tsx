
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMikrotikRouters } from '@/hooks/useMikrotikRouters';

interface AddRouterDialogProps {
  open: boolean;
  onClose: () => void;
}

const AddRouterDialog: React.FC<AddRouterDialogProps> = ({ open, onClose }) => {
  const { createRouter } = useMikrotikRouters();
  
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRouter(formData);
    onClose();
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
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add MikroTik Router</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Router Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="ip_address">IP Address *</Label>
              <Input
                id="ip_address"
                value={formData.ip_address}
                onChange={(e) => handleInputChange('ip_address', e.target.value)}
                placeholder="192.168.1.1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="admin_username">Admin Username</Label>
              <Input
                id="admin_username"
                value={formData.admin_username}
                onChange={(e) => handleInputChange('admin_username', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="admin_password">Admin Password *</Label>
              <Input
                id="admin_password"
                type="password"
                value={formData.admin_password}
                onChange={(e) => handleInputChange('admin_password', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="snmp_community">SNMP Community</Label>
              <Input
                id="snmp_community"
                value={formData.snmp_community}
                onChange={(e) => handleInputChange('snmp_community', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="snmp_version">SNMP Version</Label>
              <Input
                id="snmp_version"
                type="number"
                value={formData.snmp_version}
                onChange={(e) => handleInputChange('snmp_version', parseInt(e.target.value))}
                min="1"
                max="3"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pppoe_interface">PPPoE Interface</Label>
              <Input
                id="pppoe_interface"
                value={formData.pppoe_interface}
                onChange={(e) => handleInputChange('pppoe_interface', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="client_network">Client Network</Label>
              <Input
                id="client_network"
                value={formData.client_network}
                onChange={(e) => handleInputChange('client_network', e.target.value)}
                placeholder="10.0.0.0/24"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dns_servers">DNS Servers</Label>
              <Input
                id="dns_servers"
                value={formData.dns_servers}
                onChange={(e) => handleInputChange('dns_servers', e.target.value)}
                placeholder="8.8.8.8,8.8.4.4"
              />
            </div>
            
            <div>
              <Label htmlFor="gateway">Gateway</Label>
              <Input
                id="gateway"
                value={formData.gateway}
                onChange={(e) => handleInputChange('gateway', e.target.value)}
                placeholder="Will auto-generate if empty"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add Router
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddRouterDialog;
