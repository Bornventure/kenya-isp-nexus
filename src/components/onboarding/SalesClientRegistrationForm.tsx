import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Save, User, MapPin, Wifi, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useServicePackages } from '@/hooks/useServicePackages';
import { supabase } from '@/integrations/supabase/client';

interface SalesClientRegistrationFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const SalesClientRegistrationForm: React.FC<SalesClientRegistrationFormProps> = ({ onClose, onSuccess }) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { servicePackages, isLoading: packagesLoading } = useServicePackages();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if there are active service packages
  const activePackages = servicePackages.filter(pkg => pkg.is_active);
  const hasActivePackages = activePackages.length > 0;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    id_number: '',
    kra_pin_number: '',
    mpesa_number: '',
    client_type: 'individual' as const,
    connection_type: 'fiber' as const,
    address: '',
    county: '',
    sub_county: '',
    latitude: null as number | null,
    longitude: null as number | null,
    service_package_id: '',
    monthly_rate: 0,
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePackageChange = (packageId: string) => {
    const selectedPackage = activePackages.find(p => p.id === packageId);
    updateFormData('service_package_id', packageId);
    updateFormData('monthly_rate', selectedPackage?.monthly_rate || 0);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.id_number.trim()) newErrors.id_number = 'ID Number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.county.trim()) newErrors.county = 'County is required';
    if (!formData.sub_county.trim()) newErrors.sub_county = 'Sub County is required';
    if (!formData.service_package_id) newErrors.service_package_id = 'Service package is required';

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (formData.phone && !/^(\+254|0)[17]\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid Kenyan phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (!hasActivePackages) {
      toast({
        title: "No Service Packages Available",
        description: "Cannot create client without active service packages. Please contact your administrator.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedPackage = activePackages.find(pkg => pkg.id === formData.service_package_id);
      
      const clientData = {
        ...formData,
        isp_company_id: profile?.isp_company_id,
        status: 'pending' as const,
        balance: 0,
        wallet_balance: 0,
        is_active: true,
        monthly_rate: selectedPackage?.monthly_rate || 0,
        submitted_by: profile?.id,
        mpesa_number: formData.mpesa_number || formData.phone,
      };

      const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert(clientData)
        .select()
        .single();

      if (clientError) {
        console.error('Error creating client:', clientError);
        throw clientError;
      }

      toast({
        title: "Client Submitted Successfully",
        description: "Client registration has been submitted and is pending approval from the Network Administrator.",
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error during client submission:', error);
      toast({
        title: "Error",
        description: "Failed to submit client registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (packagesLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Loading Service Packages...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasActivePackages) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              No Service Packages
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-center p-4">
              <p className="text-muted-foreground mb-4">
                No active service packages are available. Client registration requires at least one active service package.
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Please contact your administrator to create service packages before registering customers.
              </p>
              <Button onClick={onClose} variant="outline" className="w-full">
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold">Client Registration - Sales</CardTitle>
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
                  <Select value={formData.client_type} onValueChange={(value) => updateFormData('client_type', value)}>
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
                  <Label htmlFor="email">Email Address</Label>
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
                <div>
                  <Label htmlFor="mpesa_number">M-Pesa Number</Label>
                  <Input
                    id="mpesa_number"
                    placeholder="+254712345678"
                    value={formData.mpesa_number}
                    onChange={(e) => updateFormData('mpesa_number', e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                {formData.client_type !== 'individual' && (
                  <div>
                    <Label htmlFor="kra_pin_number">KRA PIN Number *</Label>
                    <Input
                      id="kra_pin_number"
                      value={formData.kra_pin_number}
                      onChange={(e) => updateFormData('kra_pin_number', e.target.value)}
                      disabled={isSubmitting}
                    />
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
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => updateFormData('address', e.target.value)}
                    className={errors.address ? 'border-red-500' : ''}
                    disabled={isSubmitting}
                    placeholder="Enter full address including house number"
                  />
                  {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
                </div>
                <div>
                  <Label htmlFor="county">County *</Label>
                  <Input
                    id="county"
                    value={formData.county}
                    onChange={(e) => updateFormData('county', e.target.value)}
                    className={errors.county ? 'border-red-500' : ''}
                    disabled={isSubmitting}
                  />
                  {errors.county && <p className="text-sm text-red-500 mt-1">{errors.county}</p>}
                </div>
                <div>
                  <Label htmlFor="sub_county">Sub County *</Label>
                  <Input
                    id="sub_county"
                    value={formData.sub_county}
                    onChange={(e) => updateFormData('sub_county', e.target.value)}
                    className={errors.sub_county ? 'border-red-500' : ''}
                    disabled={isSubmitting}
                  />
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
                  <Select value={formData.connection_type} onValueChange={(value) => updateFormData('connection_type', value)}>
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
                  <Label htmlFor="service_package_id">Service Package *</Label>
                  <Select value={formData.service_package_id} onValueChange={handlePackageChange}>
                    <SelectTrigger className={errors.service_package_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select Package" />
                    </SelectTrigger>
                    <SelectContent>
                      {activePackages.map(pkg => (
                        <SelectItem key={pkg.id} value={pkg.id}>
                          {pkg.name} - {pkg.speed} (KES {pkg.monthly_rate.toLocaleString()}/month)
                        </SelectItem>
                      ))}
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
                    readOnly
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Automatically set based on selected service package
                  </p>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => updateFormData('notes', e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Any additional information about the client or installation requirements"
                  />
                </div>
              </div>
            </div>

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
                {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesClientRegistrationForm;
