
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useClients, type DatabaseClient } from '@/hooks/useClients';
import { useServicePackages } from '@/hooks/useServicePackages';
import type { ClientType, ConnectionType, ClientStatus } from '@/types/client';

interface ClientEditDialogProps {
  client: DatabaseClient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateClient?: (clientData: any) => void;
}

const ClientEditDialog: React.FC<ClientEditDialogProps> = ({ 
  client, 
  open, 
  onOpenChange,
  onUpdateClient 
}) => {
  const { updateClient } = useClients();
  const { servicePackages } = useServicePackages();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    county: '',
    sub_county: '',
    id_number: '',
    kra_pin_number: '',
    mpesa_number: '',
    client_type: 'individual' as ClientType,
    connection_type: 'fiber' as ConnectionType,
    monthly_rate: 0,
    status: 'pending' as ClientStatus,
    service_package_id: '',
    latitude: null as number | null,
    longitude: null as number | null,
  });

  // Filter active service packages
  const activePackages = servicePackages.filter(pkg => pkg.is_active);

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        county: client.county || '',
        sub_county: client.sub_county || '',
        id_number: client.id_number || '',
        kra_pin_number: client.kra_pin_number || '',
        mpesa_number: client.mpesa_number || '',
        client_type: client.client_type as ClientType,
        connection_type: client.connection_type as ConnectionType,
        monthly_rate: Number(client.monthly_rate) || 0,
        status: client.status as ClientStatus,
        service_package_id: client.service_package_id || '',
        latitude: client.latitude ? Number(client.latitude) : null,
        longitude: client.longitude ? Number(client.longitude) : null,
      });
    }
  }, [client]);

  // Auto-update monthly rate when service package changes
  useEffect(() => {
    if (formData.service_package_id) {
      const selectedPackage = activePackages.find(pkg => pkg.id === formData.service_package_id);
      if (selectedPackage && selectedPackage.monthly_rate !== formData.monthly_rate) {
        setFormData(prev => ({ ...prev, monthly_rate: selectedPackage.monthly_rate }));
      }
    }
  }, [formData.service_package_id, activePackages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    if (onUpdateClient) {
      onUpdateClient(formData);
    } else {
      updateClient({
        id: client.id,
        updates: formData
      });
    }
    onOpenChange(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label>Client Type</Label>
              <Select value={formData.client_type} onValueChange={(value) => handleInputChange('client_type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="government">Government</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address *</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="county">County *</Label>
              <Input
                id="county"
                value={formData.county}
                onChange={(e) => handleInputChange('county', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="sub_county">Sub County *</Label>
              <Input
                id="sub_county"
                value={formData.sub_county}
                onChange={(e) => handleInputChange('sub_county', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Connection Type</Label>
              <Select value={formData.connection_type} onValueChange={(value) => handleInputChange('connection_type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fiber">Fiber</SelectItem>
                  <SelectItem value="wireless">Wireless</SelectItem>
                  <SelectItem value="satellite">Satellite</SelectItem>
                  <SelectItem value="dsl">DSL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="disconnected">Disconnected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Service Package</Label>
              <Select value={formData.service_package_id} onValueChange={(value) => handleInputChange('service_package_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select package" />
                </SelectTrigger>
                <SelectContent>
                  {activePackages.map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      {pkg.name} - {pkg.speed} (KES {pkg.monthly_rate.toLocaleString()}/month)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="monthly_rate">Monthly Rate (KES)</Label>
              <Input
                id="monthly_rate"
                type="number"
                value={formData.monthly_rate}
                readOnly
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Automatically set based on selected service package
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Update Client
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClientEditDialog;
