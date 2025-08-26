
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { ClientType, ConnectionType } from '@/types/client';
import { useServicePackages } from '@/hooks/useServicePackages';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ClientAddDialogProps {
  onAddClient: (clientData: any) => void;
  isLoading?: boolean;
}

const ClientAddDialog: React.FC<ClientAddDialogProps> = ({ onAddClient, isLoading = false }) => {
  const [open, setOpen] = useState(false);
  const { servicePackages, isLoading: packagesLoading } = useServicePackages();
  const { profile } = useAuth();
  const { toast } = useToast();
  
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
    service_package_id: '',
    monthly_rate: 0,
  });

  // Check if there are active service packages
  const activePackages = servicePackages.filter(pkg => pkg.is_active);
  const hasActivePackages = activePackages.length > 0;

  // Update monthly rate when service package changes
  useEffect(() => {
    if (formData.service_package_id) {
      const selectedPackage = activePackages.find(pkg => pkg.id === formData.service_package_id);
      if (selectedPackage) {
        setFormData(prev => ({ ...prev, monthly_rate: selectedPackage.monthly_rate }));
      }
    }
  }, [formData.service_package_id, activePackages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasActivePackages) {
      toast({
        title: "No Service Packages Available",
        description: "Cannot create client without active service packages. Please contact your administrator.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.service_package_id) {
      toast({
        title: "Service Package Required",
        description: "Please select a service package to continue.",
        variant: "destructive",
      });
      return;
    }
    
    onAddClient(formData);
    setOpen(false);
    setFormData({
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
      service_package_id: '',
      monthly_rate: 0,
    });
  };

  if (packagesLoading) {
    return (
      <Button disabled>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Loading Packages...
      </Button>
    );
  }

  if (!hasActivePackages) {
    return (
      <Button disabled variant="outline" className="gap-2">
        <AlertCircle className="h-4 w-4" />
        No Service Packages Available
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="id_number">ID Number *</Label>
              <Input
                id="id_number"
                value={formData.id_number}
                onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="client_type">Client Type</Label>
              <Select value={formData.client_type} onValueChange={(value: ClientType) => setFormData({ ...formData, client_type: value })}>
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
            <div>
              <Label htmlFor="connection_type">Connection Type</Label>
              <Select value={formData.connection_type} onValueChange={(value: ConnectionType) => setFormData({ ...formData, connection_type: value })}>
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
          </div>
          
          <div>
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="county">County *</Label>
              <Input
                id="county"
                value={formData.county}
                onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="sub_county">Sub County *</Label>
              <Input
                id="sub_county"
                value={formData.sub_county}
                onChange={(e) => setFormData({ ...formData, sub_county: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="kra_pin_number">KRA PIN</Label>
              <Input
                id="kra_pin_number"
                value={formData.kra_pin_number}
                onChange={(e) => setFormData({ ...formData, kra_pin_number: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="mpesa_number">M-Pesa Number</Label>
              <Input
                id="mpesa_number"
                value={formData.mpesa_number}
                onChange={(e) => setFormData({ ...formData, mpesa_number: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="service_package_id">Service Package *</Label>
              <Select 
                value={formData.service_package_id} 
                onValueChange={(value) => setFormData({ ...formData, service_package_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a service package" />
                </SelectTrigger>
                <SelectContent>
                  {activePackages.map(pkg => (
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

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.service_package_id}>
              {isLoading ? 'Adding...' : 'Add Client'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClientAddDialog;
