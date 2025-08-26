
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useClients } from '@/hooks/useClients';
import { useServicePackages } from '@/hooks/useServicePackages';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Client, ClientType, ConnectionType } from '@/types/client';

interface CustomerRegistrationFormProps {
  onClose: () => void;
  onSuccess?: (client: any) => void;
}

const CustomerRegistrationForm: React.FC<CustomerRegistrationFormProps> = ({ onClose, onSuccess }) => {
  const { createClient } = useClients();
  const { servicePackages, isLoading: packagesLoading } = useServicePackages();
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    id_number: '',
    mpesa_number: '',
    address: '',
    county: '',
    sub_county: '',
    client_type: 'individual' as ClientType,
    connection_type: 'fiber' as ConnectionType,
    service_package_id: '',
    monthly_rate: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if there are active service packages
  const activePackages = servicePackages.filter(pkg => pkg.is_active);
  const hasActivePackages = activePackages.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.isp_company_id) {
      toast({
        title: "Error",
        description: "No ISP company ID found",
        variant: "destructive",
      });
      return;
    }

    if (!hasActivePackages) {
      toast({
        title: "No Service Packages Available",
        description: "Cannot create client without active service packages. Please contact your administrator to create service packages first.",
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
    
    setIsSubmitting(true);
    
    // Create client data that matches the Client interface exactly
    const clientData: Omit<Client, 'id' | 'created_at' | 'updated_at' | 'isp_company_id'> = {
      name: formData.name,
      email: formData.email || undefined,
      phone: formData.phone,
      id_number: formData.id_number,
      kra_pin_number: undefined,
      mpesa_number: formData.mpesa_number || undefined,
      address: formData.address,
      county: formData.county,
      sub_county: formData.sub_county,
      latitude: undefined,
      longitude: undefined,
      client_type: formData.client_type,
      connection_type: formData.connection_type,
      monthly_rate: formData.monthly_rate,
      status: 'pending',
      service_package_id: formData.service_package_id || undefined,
      balance: 0,
      wallet_balance: 0,
      subscription_start_date: undefined,
      subscription_end_date: undefined,
      subscription_type: 'monthly',
      is_active: false,
      submitted_by: profile?.id,
      approved_by: undefined,
      approved_at: undefined,
      installation_status: 'pending',
      installation_completed_by: undefined,
      installation_completed_at: undefined,
      service_activated_at: undefined,
      installation_date: undefined,
      
      // Legacy camelCase properties for backwards compatibility
      clientType: formData.client_type,
      connectionType: formData.connection_type,
      servicePackage: undefined,
      monthlyRate: formData.monthly_rate,
      installationDate: undefined,
      idNumber: formData.id_number,
      kraPinNumber: undefined,
      mpesaNumber: formData.mpesa_number || undefined,
      
      // Nested objects
      location: {
        address: formData.address,
        county: formData.county,
        subCounty: formData.sub_county,
      },
      
      equipment: {
        serialNumbers: [],
      },
      
      service_packages: undefined,
      equipment_assignments: [],
      lastPayment: undefined,
      payments: [],
      invoices: [],
      supportTickets: [],
    };
    
    createClient(clientData);
    
    if (onSuccess) {
      onSuccess(clientData);
    }
    
    setIsSubmitting(false);
    onClose();
  };

  const handlePackageChange = (packageId: string) => {
    const selectedPackage = activePackages.find(p => p.id === packageId);
    setFormData(prev => ({
      ...prev,
      service_package_id: packageId,
      monthly_rate: selectedPackage?.monthly_rate || 0
    }));
  };

  if (packagesLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Service Packages...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasActivePackages) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Service Packages Available</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8">
            <p className="text-muted-foreground mb-4">
              No active service packages are available. Customer registration requires at least one active service package.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Please contact your administrator to create service packages before registering customers.
            </p>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Registration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <Label htmlFor="id_number">ID Number *</Label>
              <Input
                id="id_number"
                value={formData.id_number}
                onChange={(e) => setFormData(prev => ({ ...prev, id_number: e.target.value }))}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <Label htmlFor="mpesa_number">M-Pesa Number</Label>
              <Input
                id="mpesa_number"
                value={formData.mpesa_number}
                onChange={(e) => setFormData(prev => ({ ...prev, mpesa_number: e.target.value }))}
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <Label htmlFor="county">County *</Label>
              <Input
                id="county"
                value={formData.county}
                onChange={(e) => setFormData(prev => ({ ...prev, county: e.target.value }))}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <Label htmlFor="sub_county">Sub County</Label>
              <Input
                id="sub_county"
                value={formData.sub_county}
                onChange={(e) => setFormData(prev => ({ ...prev, sub_county: e.target.value }))}
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <Label htmlFor="client_type">Client Type</Label>
              <select
                id="client_type"
                value={formData.client_type}
                onChange={(e) => setFormData(prev => ({ ...prev, client_type: e.target.value as ClientType }))}
                className="w-full p-2 border rounded"
                disabled={isSubmitting}
              >
                <option value="individual">Individual</option>
                <option value="business">Business</option>
                <option value="corporate">Corporate</option>
                <option value="government">Government</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="connection_type">Connection Type</Label>
              <select
                id="connection_type"
                value={formData.connection_type}
                onChange={(e) => setFormData(prev => ({ ...prev, connection_type: e.target.value as ConnectionType }))}
                className="w-full p-2 border rounded"
                disabled={isSubmitting}
              >
                <option value="fiber">Fiber</option>
                <option value="wireless">Wireless</option>
                <option value="satellite">Satellite</option>
                <option value="dsl">DSL</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="service_package_id">Service Package *</Label>
              <select
                id="service_package_id"
                value={formData.service_package_id}
                onChange={(e) => handlePackageChange(e.target.value)}
                className="w-full p-2 border rounded"
                required
                disabled={isSubmitting}
              >
                <option value="">Select a package</option>
                {activePackages.map(pkg => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} - {pkg.speed} - KSh {pkg.monthly_rate.toLocaleString()}/month
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="monthly_rate">Monthly Rate (KSh)</Label>
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
          
          <div>
            <Label htmlFor="address">Address *</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Register Customer'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CustomerRegistrationForm;
