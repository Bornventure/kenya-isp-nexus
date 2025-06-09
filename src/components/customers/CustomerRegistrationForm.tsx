
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { registerClient } from '@/services/customerPortalApi';
import {
  X,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  Wifi,
  Loader2
} from 'lucide-react';

interface CustomerRegistrationFormProps {
  onClose: () => void;
  onSuccess?: (client: any) => void;
}

const CustomerRegistrationForm: React.FC<CustomerRegistrationFormProps> = ({ onClose, onSuccess }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    mpesa_number: '',
    id_number: '',
    kra_pin_number: '',
    client_type: 'individual' as const,
    connection_type: 'fiber' as const,
    address: '',
    county: 'Kisumu',
    sub_county: '',
    service_package_id: '',
    isp_company_id: 'test-isp-company-id' // You'll need to get this from your ISP admin
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const counties = ['Kisumu', 'Nairobi', 'Mombasa', 'Nakuru', 'Eldoret'];
  const kisumuSubCounties = ['Kisumu Central', 'Kisumu East', 'Kisumu West', 'Nyando', 'Muhoroni', 'Nyakach'];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.id_number.trim()) newErrors.id_number = 'ID Number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.sub_county) newErrors.sub_county = 'Sub-county is required';

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
    if (formData.client_type !== 'individual' && !formData.kra_pin_number.trim()) {
      newErrors.kra_pin_number = 'KRA PIN is required for business clients';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    console.log('Submitting registration form with data:', formData);

    try {
      const result = await registerClient(formData);
      console.log('Registration successful:', result);
      
      toast({
        title: "Registration Successful",
        description: result.message || "Your application has been submitted successfully.",
      });
      
      if (onSuccess) {
        onSuccess(result.client);
      }
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
          <CardTitle className="text-xl font-semibold">Register for Internet Service</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
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
                  <Label htmlFor="client_type">Client Type</Label>
                  <select
                    id="client_type"
                    value={formData.client_type}
                    onChange={(e) => updateFormData('client_type', e.target.value)}
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
                  <Label htmlFor="mpesa_number">M-Pesa Number</Label>
                  <Input
                    id="mpesa_number"
                    placeholder="+254712345678 (optional)"
                    value={formData.mpesa_number}
                    onChange={(e) => updateFormData('mpesa_number', e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="id_number">ID Number *</Label>
                  <Input
                    id="id_number"
                    value={formData.id_number}
                    onChange={(e) => updateFormData('id_number', e.target.value)}
                    className={errors.id_number ? 'border-red-500' : ''}
                    disabled={isSubmitting}
                  />
                  {errors.id_number && <p className="text-sm text-red-500 mt-1">{errors.id_number}</p>}
                </div>
                {formData.client_type !== 'individual' && (
                  <div>
                    <Label htmlFor="kra_pin_number">KRA PIN Number *</Label>
                    <Input
                      id="kra_pin_number"
                      value={formData.kra_pin_number}
                      onChange={(e) => updateFormData('kra_pin_number', e.target.value)}
                      className={errors.kra_pin_number ? 'border-red-500' : ''}
                      disabled={isSubmitting}
                    />
                    {errors.kra_pin_number && <p className="text-sm text-red-500 mt-1">{errors.kra_pin_number}</p>}
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
                  <Label htmlFor="sub_county">Sub-County *</Label>
                  <select
                    id="sub_county"
                    value={formData.sub_county}
                    onChange={(e) => updateFormData('sub_county', e.target.value)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md ${errors.sub_county ? 'border-red-500' : ''}`}
                    disabled={isSubmitting}
                  >
                    <option value="">Select Sub-County</option>
                    {kisumuSubCounties.map(subCounty => (
                      <option key={subCounty} value={subCounty}>{subCounty}</option>
                    ))}
                  </select>
                  {errors.sub_county && <p className="text-sm text-red-500 mt-1">{errors.sub_county}</p>}
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
                  <Label htmlFor="connection_type">Connection Type</Label>
                  <select
                    id="connection_type"
                    value={formData.connection_type}
                    onChange={(e) => updateFormData('connection_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    disabled={isSubmitting}
                  >
                    <option value="fiber">Fiber</option>
                    <option value="wireless">Wireless</option>
                    <option value="satellite">Satellite</option>
                    <option value="dsl">DSL</option>
                  </select>
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
                {isSubmitting ? 'Registering...' : 'Register Client'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerRegistrationForm;
