
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Building
} from 'lucide-react';

interface ClientRegistrationFormProps {
  onClose: () => void;
  onSave: (client: Partial<Client>) => void;
}

const ClientRegistrationForm: React.FC<ClientRegistrationFormProps> = ({ onClose, onSave }) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const selectedPackage = servicePackages.find(pkg => pkg.id === formData.servicePackage);
    
    const newClient: Partial<Client> = {
      id: Date.now().toString(),
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
          <Button variant="ghost" size="sm" onClick={onClose}>
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
                  />
                </div>
                <div>
                  <Label htmlFor="idNumber">ID Number *</Label>
                  <Input
                    id="idNumber"
                    value={formData.idNumber}
                    onChange={(e) => updateFormData('idNumber', e.target.value)}
                    className={errors.idNumber ? 'border-red-500' : ''}
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
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="gap-2">
                <Save className="h-4 w-4" />
                Register Client
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientRegistrationForm;
