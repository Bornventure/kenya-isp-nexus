import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClients, DatabaseClient } from '@/hooks/useClients';
import { useToast } from '@/hooks/use-toast';

interface CustomerRegistrationFormProps {
  onClose: () => void;
  onSave: (client: Partial<DatabaseClient>) => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  idNumber: string;
  kraPinNumber?: string;
  mpesaNumber?: string;
  address: string;
  county: string;
  subCounty: string;
  clientType: 'individual' | 'business' | 'corporate' | 'government';
  connectionType: 'fiber' | 'wireless' | 'satellite' | 'dsl';
  servicePackage: string;
  monthlyRate: number;
  installationDate?: string;
  latitude?: number;
  longitude?: number;
}

const CustomerRegistrationForm: React.FC<CustomerRegistrationFormProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    idNumber: '',
    address: '',
    county: '',
    subCounty: '',
    clientType: 'individual',
    connectionType: 'fiber',
    servicePackage: '',
    monthlyRate: 0,
    kraPinNumber: '',
    mpesaNumber: '',
    installationDate: '',
    latitude: null,
    longitude: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createClient } = useClients();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    let valid = true;
    const newErrors: Record<string, string> = {};

    if (!formData.name) {
      newErrors.name = 'Name is required';
      valid = false;
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
      valid = false;
    }
    if (!formData.phone) {
      newErrors.phone = 'Phone is required';
      valid = false;
    }
    if (!formData.idNumber) {
      newErrors.idNumber = 'ID Number is required';
      valid = false;
    }
    if (!formData.address) {
      newErrors.address = 'Address is required';
      valid = false;
    }
    if (!formData.county) {
      newErrors.county = 'County is required';
      valid = false;
    }
    if (!formData.subCounty) {
      newErrors.subCounty = 'Sub County is required';
      valid = false;
    }
    if (!formData.clientType) {
      newErrors.clientType = 'Client Type is required';
      valid = false;
    }
    if (!formData.connectionType) {
      newErrors.connectionType = 'Connection Type is required';
      valid = false;
    }
    if (!formData.servicePackage) {
      newErrors.servicePackage = 'Service Package is required';
      valid = false;
    }
    if (!formData.monthlyRate) {
      newErrors.monthlyRate = 'Monthly Rate is required';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const clientData: Omit<DatabaseClient, 'id' | 'created_at' | 'updated_at'> = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        id_number: formData.idNumber,
        kra_pin_number: formData.kraPinNumber || '',
        mpesa_number: formData.mpesaNumber || '',
        address: formData.address,
        county: formData.county,
        sub_county: formData.subCounty,
        client_type: formData.clientType,
        connection_type: formData.connectionType,
        service_package_id: formData.servicePackage,
        monthly_rate: formData.monthlyRate,
        installation_date: formData.installationDate || '',
        status: 'pending',
        balance: 0,
        wallet_balance: 0,
        subscription_start_date: '',
        subscription_end_date: '',
        subscription_type: 'monthly',
        isp_company_id: '',
        approved_at: '',
        approved_by: '',
        notes: null,
        rejection_reason: null,
        rejected_at: null,
        rejected_by: null,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        installation_status: 'pending',
        submitted_by: 'customer',
        service_activated_at: null,
      };

      const result = await createClient(clientData);
      
      toast({
        title: "Registration Successful",
        description: "Your registration has been submitted for approval.",
      });

      onSave(result);
      onClose();
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: 'Registration failed. Please try again.' });
      toast({
        title: "Registration Failed",
        description: "Please check your information and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Customer Registration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
            </div>
            <div>
              <Label htmlFor="idNumber">ID Number</Label>
              <Input
                type="text"
                id="idNumber"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                required
              />
              {errors.idNumber && <p className="text-red-500 text-sm">{errors.idNumber}</p>}
            </div>
            <div>
              <Label htmlFor="kraPinNumber">KRA PIN Number (Optional)</Label>
              <Input
                type="text"
                id="kraPinNumber"
                name="kraPinNumber"
                value={formData.kraPinNumber}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="mpesaNumber">M-Pesa Number (Optional)</Label>
              <Input
                type="text"
                id="mpesaNumber"
                name="mpesaNumber"
                value={formData.mpesaNumber}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
              {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
            </div>
            <div>
              <Label htmlFor="county">County</Label>
              <Input
                type="text"
                id="county"
                name="county"
                value={formData.county}
                onChange={handleChange}
                required
              />
              {errors.county && <p className="text-red-500 text-sm">{errors.county}</p>}
            </div>
            <div>
              <Label htmlFor="subCounty">Sub County</Label>
              <Input
                type="text"
                id="subCounty"
                name="subCounty"
                value={formData.subCounty}
                onChange={handleChange}
                required
              />
              {errors.subCounty && <p className="text-red-500 text-sm">{errors.subCounty}</p>}
            </div>
            <div>
              <Label htmlFor="clientType">Client Type</Label>
              <Select onValueChange={(value) => handleSelectChange("clientType", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select client type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="government">Government</SelectItem>
                </SelectContent>
              </Select>
              {errors.clientType && <p className="text-red-500 text-sm">{errors.clientType}</p>}
            </div>
            <div>
              <Label htmlFor="connectionType">Connection Type</Label>
              <Select onValueChange={(value) => handleSelectChange("connectionType", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select connection type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fiber">Fiber</SelectItem>
                  <SelectItem value="wireless">Wireless</SelectItem>
                  <SelectItem value="satellite">Satellite</SelectItem>
                  <SelectItem value="dsl">DSL</SelectItem>
                </SelectContent>
              </Select>
              {errors.connectionType && <p className="text-red-500 text-sm">{errors.connectionType}</p>}
            </div>
            <div>
              <Label htmlFor="servicePackage">Service Package</Label>
              <Input
                type="text"
                id="servicePackage"
                name="servicePackage"
                value={formData.servicePackage}
                onChange={handleChange}
                required
              />
              {errors.servicePackage && <p className="text-red-500 text-sm">{errors.servicePackage}</p>}
            </div>
            <div>
              <Label htmlFor="monthlyRate">Monthly Rate</Label>
              <Input
                type="number"
                id="monthlyRate"
                name="monthlyRate"
                value={formData.monthlyRate}
                onChange={handleChange}
                required
              />
              {errors.monthlyRate && <p className="text-red-500 text-sm">{errors.monthlyRate}</p>}
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Register'}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerRegistrationForm;
