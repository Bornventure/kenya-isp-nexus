
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Key, Building2 } from 'lucide-react';

const LicenseActivationPanel = () => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    county: '',
    sub_county: '',
    kra_pin: '',
    ca_license_number: '',
    license_type: 'starter' as 'starter' | 'professional' | 'enterprise',
    client_limit: 50,
    subscription_months: 12
  });

  const licenseDefaults = {
    starter: { limit: 50, price: 29 },
    professional: { limit: 200, price: 99 },
    enterprise: { limit: 1000, price: 299 }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLicenseTypeChange = (type: 'starter' | 'professional' | 'enterprise') => {
    setFormData(prev => ({
      ...prev,
      license_type: type,
      client_limit: licenseDefaults[type].limit
    }));
  };

  const generateLicenseKey = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 12);
    return `lic_${timestamp}_${random}`.toUpperCase();
  };

  const handleCreateCompany = async () => {
    if (!formData.name || !formData.email) {
      toast({
        title: "Validation Error",
        description: "Company name and email are required.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const licenseKey = generateLicenseKey();
      const subscriptionEndDate = new Date();
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + formData.subscription_months);

      const { data, error } = await supabase
        .from('isp_companies')
        .insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          address: formData.address || null,
          county: formData.county || null,
          sub_county: formData.sub_county || null,
          kra_pin: formData.kra_pin || null,
          ca_license_number: formData.ca_license_number || null,
          license_type: formData.license_type,
          client_limit: formData.client_limit,
          license_key: licenseKey,
          is_active: true,
          subscription_end_date: subscriptionEndDate.toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Company Created",
        description: `${formData.name} has been successfully registered with license key: ${licenseKey}`,
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        county: '',
        sub_county: '',
        kra_pin: '',
        ca_license_number: '',
        license_type: 'starter',
        client_limit: 50,
        subscription_months: 12
      });
    } catch (error) {
      console.error('Error creating company:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create company. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* New Company Registration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Register New ISP Company
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company-name">Company Name *</Label>
              <Input
                id="company-name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter company name"
              />
            </div>
            <div>
              <Label htmlFor="company-email">Email Address *</Label>
              <Input
                id="company-email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter company email"
              />
            </div>
            <div>
              <Label htmlFor="company-phone">Phone Number</Label>
              <Input
                id="company-phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <Label htmlFor="kra-pin">KRA PIN</Label>
              <Input
                id="kra-pin"
                value={formData.kra_pin}
                onChange={(e) => handleInputChange('kra_pin', e.target.value)}
                placeholder="Enter KRA PIN"
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter company address"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="county">County</Label>
              <Input
                id="county"
                value={formData.county}
                onChange={(e) => handleInputChange('county', e.target.value)}
                placeholder="Enter county"
              />
            </div>
            <div>
              <Label htmlFor="sub-county">Sub County</Label>
              <Input
                id="sub-county"
                value={formData.sub_county}
                onChange={(e) => handleInputChange('sub_county', e.target.value)}
                placeholder="Enter sub county"
              />
            </div>
          </div>

          {/* License Configuration */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Key className="h-5 w-5" />
              License Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="license-type">License Type</Label>
                <Select
                  value={formData.license_type}
                  onValueChange={handleLicenseTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">
                      Starter - ${licenseDefaults.starter.price}/mo
                    </SelectItem>
                    <SelectItem value="professional">
                      Professional - ${licenseDefaults.professional.price}/mo
                    </SelectItem>
                    <SelectItem value="enterprise">
                      Enterprise - ${licenseDefaults.enterprise.price}/mo
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="client-limit">Client Limit</Label>
                <Input
                  id="client-limit"
                  type="number"
                  value={formData.client_limit}
                  onChange={(e) => handleInputChange('client_limit', parseInt(e.target.value))}
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="subscription-months">Subscription (Months)</Label>
                <Select
                  value={formData.subscription_months.toString()}
                  onValueChange={(value) => handleInputChange('subscription_months', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Month</SelectItem>
                    <SelectItem value="3">3 Months</SelectItem>
                    <SelectItem value="6">6 Months</SelectItem>
                    <SelectItem value="12">12 Months</SelectItem>
                    <SelectItem value="24">24 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* CA License */}
            <div className="mt-4">
              <Label htmlFor="ca-license">CA License Number</Label>
              <Input
                id="ca-license"
                value={formData.ca_license_number}
                onChange={(e) => handleInputChange('ca_license_number', e.target.value)}
                placeholder="Enter Communications Authority license number"
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={handleCreateCompany}
              disabled={isCreating}
              size="lg"
            >
              <Building2 className="h-4 w-4 mr-2" />
              {isCreating ? 'Creating Company...' : 'Create ISP Company'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* License Information */}
      <Card>
        <CardHeader>
          <CardTitle>License Type Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(licenseDefaults).map(([type, config]) => (
              <div key={type} className="p-4 border rounded-lg">
                <h4 className="font-semibold capitalize mb-2">{type}</h4>
                <div className="space-y-2 text-sm">
                  <div>Client Limit: {config.limit}</div>
                  <div>Price: ${config.price}/month</div>
                  <div>User Management: {type !== 'starter' ? '✓' : '✗'}</div>
                  <div>Data Export: {type !== 'starter' ? '✓' : '✗'}</div>
                  <div>Custom Branding: {type === 'enterprise' ? '✓' : '✗'}</div>
                  <div>Priority Support: {type === 'enterprise' ? '✓' : '✗'}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LicenseActivationPanel;
