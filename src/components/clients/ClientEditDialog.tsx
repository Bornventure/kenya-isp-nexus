
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useServicePackages } from '@/hooks/useServicePackages';
import { DatabaseClient } from '@/hooks/useClients';
import { X, Save, Loader2 } from 'lucide-react';

interface ClientEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: DatabaseClient | null;
  onSave: (id: string, updates: Partial<DatabaseClient>) => void;
}

const ClientEditDialog: React.FC<ClientEditDialogProps> = ({
  open,
  onOpenChange,
  client,
  onSave,
}) => {
  const { servicePackages, isLoading: packagesLoading } = useServicePackages();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    id_number: '',
    kra_pin_number: '',
    mpesa_number: '',
    address: '',
    county: '',
    sub_county: '',
    client_type: 'individual' as const,
    connection_type: 'fiber' as const,
    service_package_id: '',
    monthly_rate: 0,
    status: 'pending' as const,
  });

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        id_number: client.id_number || '',
        kra_pin_number: client.kra_pin_number || '',
        mpesa_number: client.mpesa_number || '',
        address: client.address || '',
        county: client.county || '',
        sub_county: client.sub_county || '',
        client_type: client.client_type || 'individual',
        connection_type: client.connection_type || 'fiber',
        service_package_id: client.service_package_id || '',
        monthly_rate: client.monthly_rate || 0,
        status: client.status || 'pending',
      });
    }
  }, [client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    setIsSubmitting(true);
    try {
      onSave(client.id, formData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating client:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleServicePackageChange = (packageId: string) => {
    const selectedPackage = servicePackages.find(pkg => pkg.id === packageId);
    setFormData({
      ...formData,
      service_package_id: packageId,
      monthly_rate: selectedPackage?.monthly_rate || 0,
    });
  };

  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold">Edit Client</DialogTitle>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
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
                <Label htmlFor="kra_pin">KRA PIN</Label>
                <Input
                  id="kra_pin"
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Location Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="address">Physical Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Service Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client_type">Client Type</Label>
                <Select value={formData.client_type} onValueChange={(value: any) => setFormData({ ...formData, client_type: value })}>
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
                <Select value={formData.connection_type} onValueChange={(value: any) => setFormData({ ...formData, connection_type: value })}>
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
                <Label htmlFor="service_package">Service Package</Label>
                <Select value={formData.service_package_id} onValueChange={handleServicePackageChange} disabled={packagesLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a package" />
                  </SelectTrigger>
                  <SelectContent>
                    {servicePackages.map((pkg) => (
                      <SelectItem key={pkg.id} value={pkg.id}>
                        {pkg.name} - KSh {pkg.monthly_rate?.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
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
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="gap-2" disabled={isSubmitting || packagesLoading}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSubmitting ? 'Updating...' : 'Update Client'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClientEditDialog;
