
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Client, ClientType, ConnectionType } from '@/types/client';
import { X, Save } from 'lucide-react';

interface ClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientData: Partial<Client>) => void;
  initialClient?: Client | null;
}

const ClientForm: React.FC<ClientFormProps> = ({
  isOpen,
  onClose,
  onSave,
  initialClient
}) => {
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    email: '',
    phone: '',
    idNumber: '',
    kraPinNumber: '',
    mpesaNumber: '',
    clientType: 'individual',
    status: 'pending',
    connectionType: 'fiber',
    servicePackage: '',
    monthlyRate: 0,
    balance: 0,
    installationDate: '',
    location: {
      address: '',
      county: '',
      subCounty: '',
    },
  });

  useEffect(() => {
    if (initialClient) {
      setFormData(initialClient);
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        idNumber: '',
        kraPinNumber: '',
        mpesaNumber: '',
        clientType: 'individual',
        status: 'pending',
        connectionType: 'fiber',
        servicePackage: '',
        monthlyRate: 0,
        balance: 0,
        installationDate: '',
        location: {
          address: '',
          county: '',
          subCounty: '',
        },
      });
    }
  }, [initialClient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateFormData = (field: string, value: any) => {
    if (field.startsWith('location.')) {
      const locationField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {initialClient ? 'Edit Client' : 'Add New Client'}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => updateFormData('name', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => updateFormData('email', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => updateFormData('phone', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="idNumber">ID Number</Label>
              <Input
                id="idNumber"
                value={formData.idNumber || ''}
                onChange={(e) => updateFormData('idNumber', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clientType">Client Type</Label>
              <Select value={formData.clientType} onValueChange={(value) => updateFormData('clientType', value as ClientType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="government">Government</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="connectionType">Connection Type</Label>
              <Select value={formData.connectionType} onValueChange={(value) => updateFormData('connectionType', value as ConnectionType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select connection type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fiber">Fiber</SelectItem>
                  <SelectItem value="wireless">Wireless</SelectItem>
                  <SelectItem value="satellite">Satellite</SelectItem>
                  <SelectItem value="dsl">DSL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.location?.address || ''}
              onChange={(e) => updateFormData('location.address', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="county">County</Label>
              <Input
                id="county"
                value={formData.location?.county || ''}
                onChange={(e) => updateFormData('location.county', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="subCounty">Sub County</Label>
              <Input
                id="subCounty"
                value={formData.location?.subCounty || ''}
                onChange={(e) => updateFormData('location.subCounty', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="gap-2">
              <Save className="h-4 w-4" />
              {initialClient ? 'Update' : 'Create'} Client
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClientForm;
