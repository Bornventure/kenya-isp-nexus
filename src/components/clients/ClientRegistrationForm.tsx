
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { registerClientAuthenticated } from '@/services/customerPortalApi';
import { useToast } from '@/hooks/use-toast';
import { Client } from '@/types/client';
import { servicePackages } from '@/data/mockData';
import {
  X,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Wifi,
  Building,
  Loader2
} from 'lucide-react';

interface ClientRegistrationFormProps {
  onClose: () => void;
  onSave: (client: Partial<Client>) => void;
}

const ClientRegistrationForm: React.FC<ClientRegistrationFormProps> = ({ onClose, onSave }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    mpesaNumber: '',
    idNumber: '',
    kraPinNumber: '',
    clientType: 'individual' as Client['clientType'],
    connectionType: 'fiber' as Client['connectionType'],
    servicePackage: '',
    address: '',
    county: 'Kisumu',
    subCounty: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const counties = ['Kisumu', 'Nairobi', 'Mombasa', 'Nakuru', 'Eldoret'];
  const kisumuSubCounties = ['Kisumu Central', 'Kisumu East', 'Kisumu West', 'Nyando', 'Muhoroni', 'Nyakach'];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.idNumber.trim()) newErrors.idNumber = 'ID Number is required';
    if (!formData.servicePackage) newErrors.servicePackage = 'Service package is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.subCounty) newErrors.subCounty = 'Sub-county is required';

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Validate phone format
    const phoneRegex = /^\+254[0-9]{9}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Phone must be in format +254XXXXXXXXX';
    }

    // Validate KRA PIN for business clients
    if (formData.clientType !== 'individual' && !formData.kraPinNumber.trim()) {
      newErrors.kraPinNumber = 'KRA PIN is required for business clients';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to register clients.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedPackage = servicePackages.find(pkg => pkg.id === formData.servicePackage);
      
      const clientData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        mpesa_number: formData.mpesaNumber || formData.phone,
        id_number: formData.idNumber,
        kra_pin_number: formData.kraPinNumber || null,
        client_type: formData.clientType,
        connection_type: formData.connectionType,
        address: formData.address,
        county: formData.county,
        sub_county: formData.subCounty,
        service_package_id: formData.servicePackage,
        monthly_rate: selectedPackage?.monthlyRate || 0,
      };

      // Get the user's access token using the supabase client directly
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No valid session found');
      }

      const result = await registerClientAuthenticated(clientData, session.access_token);

      toast({
        title: "Success",
        description: result.message || "Client registered successfully! Login credentials have been sent to their email.",
      });

      // Create a client object for the parent component
      const newClient: Partial<Client> = {
        id: result.user_id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        mpesaNumber: formData.mpesaNumber || formData.phone,
        idNumber: formData.idNumber,
        kraPinNumber: formData.kraPinNumber || undefined,
        clientType: formData.clientType,
        status: 'pending',
        connectionType: formData.connectionType,
        servicePackage: selectedPackage?.name || '',
        monthlyRate: selectedPackage?.monthlyRate || 0,
        installationDate: new Date().toISOString().split('T')[0],
        location: {
          address: formData.address,
          county: formData.county,
          subCounty: formData.subCounty
        },
        balance: 0
      };

      onSave(newClient);
      onClose();

    } catch (error: any) {
      console.error('Registration failed:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register client. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold">Register New Client</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700">
              <Mail className="h-4 w-4" />
              <span className="font-medium">Account Creation</span>
            </div>
            <p className="text-sm text-blue-600 mt-1">
              A user account will be automatically created and login credentials will be sent to the client's email address.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    className={errors.name ? 'border-red-500' : ''}
                    disabled={isSubmitting}
                  />
                  {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <Label htmlFor="clientType">Client Type</Label>
                  <select
                    id="clientType"
                    value={formData.clientType}
                    onChange={(e) => updateFormData('clientType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    disabled={isSubmitting}
                  >
                    <option value="individual">Individual</option>
                    <option value="business">Business</option>
                    <option value="corporate">Corporate</option>
                    <option value="government">Government</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className={errors.email ? 'border-red-500' : ''}
                    disabled={isSubmitting}
                  />
                  {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    placeholder="+254712345678"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    className={errors.phone ? 'border-red-500' : ''}
                    disabled={isSubmitting}
                  />
                  {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <Label htmlFor="mpesaNumber">M-Pesa Number</Label>
                  <Input
                    id="mpesaNumber"
                    placeholder="+254712345678 (optional)"
                    value={formData.mpesaNumber}
                    onChange={(e) => updateFormData('mpesaNumber', e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="idNumber">ID Number *</Label>
                  <Input
                    id="idNumber"
                    value={formData.idNumber}
                    onChange={(e) => updateFormData('idNumber', e.target.value)}
                    className={errors.idNumber ? 'border-red-500' : ''}
                    disabled={isSubmitting}
                  />
                  {errors.idNumber && <p className="text-sm text-red-500 mt-1">{errors.idNumber}</p>}
                </div>
                {formData.clientType !== 'individual' && (
                  <div>
                    <Label htmlFor="kraPinNumber">KRA PIN Number *</Label>
                    <Input
                      id="kraPinNumber"
                      value={formData.kraPinNumber}
                      onChange={(e) => updateFormData('kraPinNumber', e.target.value)}
                      className={errors.kraPinNumber ? 'border-red-500' : ''}
                      disabled={isSubmitting}
                    />
                    {errors.kraPinNumber && <p className="text-sm text-red-500 mt-1">{errors.kraPinNumber}</p>}
                  </div>
                )}
              </div>
            </div>

            {/* Location Information */}
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => updateFormData('address', e.target.value)}
                    className={errors.address ? 'border-red-500' : ''}
                    disabled={isSubmitting}
                  />
                  {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
                </div>
                <div>
                  <Label htmlFor="county">County</Label>
                  <select
                    id="county"
                    value={formData.county}
                    onChange={(e) => updateFormData('county', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    disabled={isSubmitting}
                  >
                    {counties.map(county => (
                      <option key={county} value={county}>{county}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="subCounty">Sub-County *</Label>
                  <select
                    id="subCounty"
                    value={formData.subCounty}
                    onChange={(e) => updateFormData('subCounty', e.target.value)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md ${errors.subCounty ? 'border-red-500' : ''}`}
                    disabled={isSubmitting}
                  >
                    <option value="">Select Sub-County</option>
                    {kisumuSubCounties.map(subCounty => (
                      <option key={subCounty} value={subCounty}>{subCounty}</option>
                    ))}
                  </select>
                  {errors.subCounty && <p className="text-sm text-red-500 mt-1">{errors.subCounty}</p>}
                </div>
              </div>
            </div>

            {/* Service Information */}
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Wifi className="h-5 w-5" />
                Service Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="connectionType">Connection Type</Label>
                  <select
                    id="connectionType"
                    value={formData.connectionType}
                    onChange={(e) => updateFormData('connectionType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    disabled={isSubmitting}
                  >
                    <option value="fiber">Fiber</option>
                    <option value="wireless">Wireless</option>
                    <option value="satellite">Satellite</option>
                    <option value="dsl">DSL</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="servicePackage">Service Package *</Label>
                  <select
                    id="servicePackage"
                    value={formData.servicePackage}
                    onChange={(e) => updateFormData('servicePackage', e.target.value)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md ${errors.servicePackage ? 'border-red-500' : ''}`}
                    disabled={isSubmitting}
                  >
                    <option value="">Select Package</option>
                    {servicePackages.map(pkg => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} - {pkg.speed} (KES {pkg.monthlyRate.toLocaleString()}/month)
                      </option>
                    ))}
                  </select>
                  {errors.servicePackage && <p className="text-sm text-red-500 mt-1">{errors.servicePackage}</p>}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" className="gap-2" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSubmitting ? 'Creating Account...' : 'Register Client'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientRegistrationForm;
