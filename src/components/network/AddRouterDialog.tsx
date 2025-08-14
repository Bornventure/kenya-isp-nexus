
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useRouters } from '@/hooks/useRouters';

interface AddRouterDialogProps {
  open: boolean;
  onClose: () => void;
}

const AddRouterDialog: React.FC<AddRouterDialogProps> = ({ open, onClose }) => {
  const { createRouter } = useRouters();
  
  const [formData, setFormData] = useState({
    name: '',
    ip_address: '',
    admin_username: '',
    admin_password: '',
    snmp_community: 'public',
    snmp_version: 2,
    pppoe_interface: 'ether1',
    dns_servers: '8.8.8.8,8.8.4.4',
    client_network: '192.168.1.0/24',
    gateway: '192.168.1.1',
    status: 'offline' as const,
    connection_status: 'disconnected' as const,
    last_test_results: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createRouter({
      ...formData,
      snmp_version: Number(formData.snmp_version),
    });
    
    // Reset form
    setFormData({
      name: '',
      ip_address: '',
      admin_username: '',
      admin_password: '',
      snmp_community: 'public',
      snmp_version: 2,
      pppoe_interface: 'ether1',
      dns_servers: '8.8.8.8,8.8.4.4',
      client_network: '192.168.1.0/24',
      gateway: '192.168.1.1',
      status: 'offline',
      connection_status: 'disconnected',
      last_test_results: '',
    });
    
    onClose();
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
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
                required
                placeholder="192.168.1.1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="admin_username">Admin Username *</Label>
              <Input
                id="admin_username"
                value={formData.admin_username}
                onChange={(e) => handleInputChange('admin_username', e.target.value)}
                required
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
              <Label>SNMP Version</Label>
              <Select value={formData.snmp_version.toString()} onValueChange={(value) => handleInputChange('snmp_version', parseInt(value))}>
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
            <div>
              <Label htmlFor="pppoe_interface">PPPoE Interface</Label>
              <Input
                id="pppoe_interface"
                value={formData.pppoe_interface}
                onChange={(e) => handleInputChange('pppoe_interface', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="dns_servers">DNS Servers</Label>
              <Input
                id="dns_servers"
                value={formData.dns_servers}
                onChange={(e) => handleInputChange('dns_servers', e.target.value)}
                placeholder="8.8.8.8,8.8.4.4"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client_network">Client Network</Label>
              <Input
                id="client_network"
                value={formData.client_network}
                onChange={(e) => handleInputChange('client_network', e.target.value)}
                placeholder="192.168.1.0/24"
              />
            </div>
            
            <div>
              <Label htmlFor="gateway">Gateway</Label>
              <Input
                id="gateway"
                value={formData.gateway}
                onChange={(e) => handleInputChange('gateway', e.target.value)}
                placeholder="192.168.1.1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="last_test_results">Notes</Label>
            <Textarea
              id="last_test_results"
              value={formData.last_test_results}
              onChange={(e) => handleInputChange('last_test_results', e.target.value)}
              rows={3}
              placeholder="Additional notes about this router..."
            />
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
