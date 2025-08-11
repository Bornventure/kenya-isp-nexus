import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save } from 'lucide-react';
import { useServicePackages } from '@/hooks/useServicePackages';
import { useAuth } from '@/contexts/AuthContext';
import { usePersistedFormState } from '@/hooks/usePersistedFormState';
import { useLicenseLimitCheck } from './useLicenseLimitCheck';
import type { Client } from '@/types/client';

interface ClientRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (client: Partial<Client>) => void;
  isSubmitting?: boolean;
}

interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  id_number: string;
  kra_pin_number: string;
  mpesa_number: string;
  address: string;
  county: string;
  sub_county: string;
  latitude: number | null;
  longitude: number | null;
  service_package_id: string;
  monthly_rate: number;
  connection_type: 'fiber' | 'wireless' | 'satellite';
  client_type: 'individual' | 'business' | 'corporate';
  installation_date: string;
}

const ClientRegistrationDialog: React.FC<ClientRegistrationDialogProps> = ({
  open,
  onOpenChange,
  onSave,
  isSubmitting = false,
}) => {
  const { profile } = useAuth();
  const { servicePackages, isLoading: packagesLoading } = useServicePackages();
  const { checkCanAddClient } = useLicenseLimitCheck();

  const initialFormData: ClientFormData = {
    // Personal Information
    name: '',
    email: '',
    phone: '',
    id_number: '',
    kra_pin_number: '',
    mpesa_number: '',
    
    // Location Information
    address: '',
    county: '',
    sub_county: '',
    latitude: null,
    longitude: null,
    
    // Service Information
    service_package_id: '',
    monthly_rate: 0,
    connection_type: 'fiber',
    client_type: 'individual',
    installation_date: '',
  };

  const {
    formData,
    updateFormData,
    handleSubmitSuccess,
    clearPersistedData,
  } = usePersistedFormState<ClientFormData>({
    key: 'clientRegistration',
    initialState: initialFormData,
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleFieldChange = (field: keyof ClientFormData, value: any) => {
    console.log('Updating form field:', field, 'with value:', value);
    updateFormData(field, value);
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Auto-fill monthly rate when service package is selected
    if (field === 'service_package_id' && value) {
      const selectedPackage = servicePackages.find(pkg => pkg.id === value);
      if (selectedPackage) {
        updateFormData('monthly_rate', selectedPackage.monthly_rate);
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    console.log('Validating form with data:', formData);

    // Required field validation
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.id_number.trim()) newErrors.id_number = 'ID Number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.county.trim()) newErrors.county = 'County is required';
    if (!formData.sub_county.trim()) newErrors.sub_county = 'Sub County is required';
    if (!formData.service_package_id) newErrors.service_package_id = 'Service package is required';
    if (!formData.connection_type) newErrors.connection_type = 'Connection type is required';
    if (!formData.client_type) newErrors.client_type = 'Client type is required';

    // Email validation (if provided)
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (formData.phone && !/^(\+254|0)[17]\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid Kenyan phone number';
    }

    // M-Pesa number validation (if provided)
    if (formData.mpesa_number && !/^(\+254|0)[17]\d{8}$/.test(formData.mpesa_number.replace(/\s/g, ''))) {
      newErrors.mpesa_number = 'Please enter a valid M-Pesa number';
    }

    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submission started');
    
    // Check if user profile exists
    if (!profile?.isp_company_id) {
      console.error('No user profile or company ID found');
      return;
    }

    console.log('User profile:', profile);
    
    // Check license limits first
    if (!checkCanAddClient()) {
      console.log('License limit check failed');
      return;
    }
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    try {
      // Prepare client data
      const clientData = {
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone,
        id_number: formData.id_number,
        kra_pin_number: formData.kra_pin_number || null,
        mpesa_number: formData.mpesa_number || formData.phone,
        address: formData.address,
        county: formData.county,
        sub_county: formData.sub_county,
        latitude: formData.latitude,
        longitude: formData.longitude,
        service_package_id: formData.service_package_id,
        monthly_rate: formData.monthly_rate,
        connection_type: formData.connection_type,
        client_type: formData.client_type,
        installation_date: formData.installation_date || null,
        isp_company_id: profile.isp_company_id,
        status: 'pending' as const,
        balance: 0,
        wallet_balance: 0,
        is_active: true,
        submitted_by: profile.id,
      };

      console.log('Submitting client data:', clientData);
      
      await onSave(clientData);
      handleSubmitSuccess(); // Clear persisted data on successful submission
    } catch (error) {
      console.error('Error during client registration:', error);
      // Don't clear data if submission fails
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Don't clear data on cancel - user might want to continue later
  };

  const handleClearForm = () => {
    clearPersistedData();
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register New Client</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    placeholder="254700000000"
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <Label htmlFor="id_number">ID Number *</Label>
                  <Input
                    id="id_number"
                    value={formData.id_number}
                    onChange={(e) => handleFieldChange('id_number', e.target.value)}
                    className={errors.id_number ? 'border-red-500' : ''}
                  />
                  {errors.id_number && <p className="text-sm text-red-500 mt-1">{errors.id_number}</p>}
                </div>

                <div>
                  <Label htmlFor="kra_pin_number">KRA PIN</Label>
                  <Input
                    id="kra_pin_number"
                    value={formData.kra_pin_number}
                    onChange={(e) => handleFieldChange('kra_pin_number', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="mpesa_number">M-Pesa Number</Label>
                  <Input
                    id="mpesa_number"
                    value={formData.mpesa_number}
                    onChange={(e) => handleFieldChange('mpesa_number', e.target.value)}
                    placeholder="254700000000"
                    className={errors.mpesa_number ? 'border-red-500' : ''}
                  />
                  {errors.mpesa_number && <p className="text-sm text-red-500 mt-1">{errors.mpesa_number}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Location Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleFieldChange('address', e.target.value)}
                  className={errors.address ? 'border-red-500' : ''}
                />
                {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="county">County *</Label>
                  <Input
                    id="county"
                    value={formData.county}
                    onChange={(e) => handleFieldChange('county', e.target.value)}
                    className={errors.county ? 'border-red-500' : ''}
                  />
                  {errors.county && <p className="text-sm text-red-500 mt-1">{errors.county}</p>}
                </div>

                <div>
                  <Label htmlFor="sub_county">Sub County *</Label>
                  <Input
                    id="sub_county"
                    value={formData.sub_county}
                    onChange={(e) => handleFieldChange('sub_county', e.target.value)}
                    className={errors.sub_county ? 'border-red-500' : ''}
                  />
                  {errors.sub_county && <p className="text-sm text-red-500 mt-1">{errors.sub_county}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Service Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="service_package_id">Service Package *</Label>
                  <Select
                    value={formData.service_package_id}
                    onValueChange={(value) => handleFieldChange('service_package_id', value)}
                  >
                    <SelectTrigger className={errors.service_package_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select a service package" />
                    </SelectTrigger>
                    <SelectContent>
                      {packagesLoading ? (
                        <SelectItem value="loading" disabled>Loading packages...</SelectItem>
                      ) : (
                        servicePackages.map((pkg) => (
                          <SelectItem key={pkg.id} value={pkg.id}>
                            {pkg.name} - {pkg.speed} (KES {pkg.monthly_rate}/month)
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {errors.service_package_id && <p className="text-sm text-red-500 mt-1">{errors.service_package_id}</p>}
                </div>

                <div>
                  <Label htmlFor="monthly_rate">Monthly Rate (KES)</Label>
                  <Input
                    id="monthly_rate"
                    type="number"
                    value={formData.monthly_rate}
                    onChange={(e) => handleFieldChange('monthly_rate', Number(e.target.value))}
                    readOnly
                  />
                </div>

                <div>
                  <Label htmlFor="connection_type">Connection Type *</Label>
                  <Select
                    value={formData.connection_type}
                    onValueChange={(value) => handleFieldChange('connection_type', value as ClientFormData['connection_type'])}
                  >
                    <SelectTrigger className={errors.connection_type ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select connection type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fiber">Fiber</SelectItem>
                      <SelectItem value="wireless">Wireless</SelectItem>
                      <SelectItem value="satellite">Satellite</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.connection_type && <p className="text-sm text-red-500 mt-1">{errors.connection_type}</p>}
                </div>

                <div>
                  <Label htmlFor="client_type">Client Type *</Label>
                  <Select
                    value={formData.client_type}
                    onValueChange={(value) => handleFieldChange('client_type', value as ClientFormData['client_type'])}
                  >
                    <SelectTrigger className={errors.client_type ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select client type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.client_type && <p className="text-sm text-red-500 mt-1">{errors.client_type}</p>}
                </div>

                <div>
                  <Label htmlFor="installation_date">Installation Date</Label>
                  <Input
                    id="installation_date"
                    type="date"
                    value={formData.installation_date}
                    onChange={(e) => handleFieldChange('installation_date', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClearForm}
              disabled={isSubmitting}
              className="text-sm"
            >
              Clear Form
            </Button>
            
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Register Client
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClientRegistrationDialog;
