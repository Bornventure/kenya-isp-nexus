
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { usePromoteToMikrotikRouter } from '@/hooks/usePromoteToMikrotikRouter';
import { Loader2, AlertCircle, Router } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { InventoryItem } from '@/hooks/useInventory';

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
  const [routerData, setRouterData] = useState({
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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const { mutate: promoteToRouter, isPending } = usePromoteToMikrotikRouter();

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open && inventoryItem) {
      setRouterData(prev => ({
        ...prev,
        name: inventoryItem.name || `${inventoryItem.manufacturer || 'MikroTik'} Router`,
        ip_address: '',
        admin_password: '',
        gateway: '',
      }));
      setErrors({});
    }
  }, [open, inventoryItem]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!routerData.name.trim()) {
      newErrors.name = 'Router name is required';
    }

    if (!routerData.ip_address) {
      newErrors.ip_address = 'IP address is required';
    } else {
      const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      if (!ipRegex.test(routerData.ip_address)) {
        newErrors.ip_address = 'Please enter a valid IP address';
      }
    }

    if (!routerData.admin_password.trim()) {
      newErrors.admin_password = 'Admin password is required';
    } else if (routerData.admin_password.length < 4) {
      newErrors.admin_password = 'Password must be at least 4 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inventoryItem) {
      toast({
        title: "Error",
        description: "No inventory item selected.",
        variant: "destructive",
      });
      return;
    }

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form.",
        variant: "destructive",
      });
      return;
    }

    promoteToRouter(
      {
        inventoryItemId: inventoryItem.id,
        routerData: routerData,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  const handleInputChange = (field: string, value: string | number) => {
    setRouterData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Router className="h-5 w-5" />
            Promote to MikroTik Router
          </DialogTitle>
          {inventoryItem && (
            <p className="text-sm text-muted-foreground">
              Promoting: {inventoryItem.name || inventoryItem.type}
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Router Name *</Label>
            <Input
              type="text"
              id="name"
              value={routerData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.name}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="ip_address">IP Address *</Label>
            <Input
              type="text"
              id="ip_address"
              placeholder="192.168.1.1"
              value={routerData.ip_address}
              onChange={(e) => handleInputChange('ip_address', e.target.value)}
              className={errors.ip_address ? 'border-red-500' : ''}
            />
            {errors.ip_address && (
              <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.ip_address}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="admin_username">Admin Username</Label>
              <Input
                type="text"
                id="admin_username"
                value={routerData.admin_username}
                onChange={(e) => handleInputChange('admin_username', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="admin_password">Admin Password *</Label>
              <Input
                type="password"
                id="admin_password"
                value={routerData.admin_password}
                onChange={(e) => handleInputChange('admin_password', e.target.value)}
                className={errors.admin_password ? 'border-red-500' : ''}
              />
              {errors.admin_password && (
                <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.admin_password}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="snmp_community">SNMP Community</Label>
              <Input
                type="text"
                id="snmp_community"
                value={routerData.snmp_community}
                onChange={(e) => handleInputChange('snmp_community', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="snmp_version">SNMP Version</Label>
              <Input
                type="number"
                id="snmp_version"
                min="1"
                max="3"
                value={routerData.snmp_version}
                onChange={(e) => handleInputChange('snmp_version', parseInt(e.target.value, 10))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="client_network">Client Network</Label>
            <Input
              type="text"
              id="client_network"
              placeholder="10.0.0.0/24"
              value={routerData.client_network}
              onChange={(e) => handleInputChange('client_network', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="dns_servers">DNS Servers</Label>
            <Input
              type="text"
              id="dns_servers"
              placeholder="8.8.8.8,8.8.4.4"
              value={routerData.dns_servers}
              onChange={(e) => handleInputChange('dns_servers', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pppoe_interface">PPPoE Interface</Label>
              <Input
                type="text"
                id="pppoe_interface"
                value={routerData.pppoe_interface}
                onChange={(e) => handleInputChange('pppoe_interface', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="gateway">Gateway</Label>
              <Input
                type="text"
                id="gateway"
                placeholder="192.168.1.1"
                value={routerData.gateway}
                onChange={(e) => handleInputChange('gateway', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
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
