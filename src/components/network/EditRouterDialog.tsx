import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMikrotikRouters, type MikrotikRouter } from '@/hooks/useMikrotikRouters';

interface EditRouterDialogProps {
  router: MikrotikRouter | null;
  open: boolean;
  onClose: () => void;
}

const EditRouterDialog: React.FC<EditRouterDialogProps> = ({ router, open, onClose }) => {
  const { updateRouter } = useMikrotikRouters();
  
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

  useEffect(() => {
    if (router) {
      setFormData({
        name: router.name || '',
        ip_address: router.ip_address || '',
        admin_username: router.admin_username || 'admin',
        admin_password: router.admin_password || '',
        snmp_community: router.snmp_community || 'public',
        snmp_version: router.snmp_version || 2,
        pppoe_interface: router.pppoe_interface || 'pppoe-server1',
        dns_servers: router.dns_servers || '8.8.8.8,8.8.4.4',
        client_network: router.client_network || '10.0.0.0/24',
        gateway: router.gateway || '',
      });
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!router) return;

    updateRouter({
      id: router.id,
      updates: formData
    });
    onClose();
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit MikroTik Router</DialogTitle>
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
              <Label htmlFor="admin_password">Admin Password *</Label>
              <Input
                id="admin_password"
                type="password"
                value={formData.admin_password}
                onChange={(e) => handleInputChange('admin_password', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="snmp_community">SNMP Community</Label>
              <Input
                id="snmp_community"
                value={formData.snmp_community}
                onChange={(e) => handleInputChange('snmp_community', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Update Router
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditRouterDialog;
