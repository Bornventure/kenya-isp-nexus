
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useServicePackages } from '@/hooks/useServicePackages';
import { useClients } from '@/hooks/useClients';
import { useToast } from '@/hooks/use-toast';
import { X, Save, Loader2 } from 'lucide-react';
import { DatabaseClient } from '@/types/database';

interface CustomerRegistrationFormProps {
  onClose: () => void;
  onSave?: (client: Partial<DatabaseClient>) => void;
}

const CustomerRegistrationForm: React.FC<CustomerRegistrationFormProps> = ({ onClose, onSave }) => {
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
    service_package_id: '',
    client_type: 'individual' as const,
    connection_type: 'fiber' as const,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { servicePackages, isLoading: packagesLoading } = useServicePackages();
  const { createClient } = useClients();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const selectedPackage = servicePackages.find(pkg => pkg.id === formData.service_package_id);
      
      const clientData: Omit<DatabaseClient, 'id' | 'created_at' | 'updated_at'> = {
        ...formData,
        status: 'pending',
        monthly_rate: selectedPackage?.monthly_rate || 0,
        balance: 0,
        wallet_balance: 0,
        installation_date: '',
        subscription_start_date: '',
        subscription_end_date: '',
        subscription_type: 'monthly',
        approved_at: '',
        approved_by: '',
        isp_company_id: '',
        notes: null,
        rejection_reason: null,
        rejected_at: null,
        rejected_by: null,
        latitude: null,
        longitude: null,
        installation_status: 'pending',
        submitted_by: 'customer',
        service_activated_at: null,
      };

      const result = await createClient(clientData);
      
      toast({
        title: "Registration Successful",
        description: "Your application has been submitted for review.",
      });

      if (onSave) {
        onSave(result);
      }
      
      onClose();
    } catch (error) {
      console.error('Error creating client:', error);
      toast({
        title: "Registration Failed",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Customer Registration</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="id_number">ID Number</Label>
                <Input
                  id="id_number"
                  value={formData.id_number}
                  onChange={(e) => updateFormData('id_number', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => updateFormData('address', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="county">County</Label>
                <Input
                  id="county"
                  value={formData.county}
                  onChange={(e) => updateFormData('county', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="sub_county">Sub County</Label>
                <Input
                  id="sub_county"
                  value={formData.sub_county}
                  onChange={(e) => updateFormData('sub_county', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="service_package">Service Package</Label>
              <Select value={formData.service_package_id} onValueChange={(value) => updateFormData('service_package_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a service package" />
                </SelectTrigger>
                <SelectContent>
                  {servicePackages.map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      {pkg.name} - KSh {pkg.monthly_rate}/month
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || packagesLoading}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Save className="h-4 w-4 mr-2" />
                Submit Application
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerRegistrationForm;
