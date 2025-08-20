
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Building2, Save } from 'lucide-react';

const CompanySettings = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [companyData, setCompanyData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    license_type: '',
    client_limit: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchCompanyData();
  }, [profile?.isp_company_id]);

  const fetchCompanyData = async () => {
    if (!profile?.isp_company_id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('isp_companies')
        .select('*')
        .eq('id', profile.isp_company_id)
        .single();

      if (error) throw error;

      if (data) {
        setCompanyData({
          name: data.name || '',
          contact_person: data.contact_person || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          license_type: data.license_type || '',
          client_limit: data.client_limit || 0,
          is_active: data.is_active ?? true,
        });
      }
    } catch (error) {
      console.error('Error fetching company data:', error);
      toast({
        title: "Error",
        description: "Failed to load company settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile?.isp_company_id) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('isp_companies')
        .update({
          name: companyData.name,
          email: companyData.email,
          phone: companyData.phone,
          address: companyData.address,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.isp_company_id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Company settings updated successfully",
      });
    } catch (error) {
      console.error('Error updating company data:', error);
      toast({
        title: "Error",
        description: "Failed to update company settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setCompanyData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Company Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              value={companyData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter company name"
            />
          </div>

          <div>
            <Label htmlFor="contact_person">Contact Person</Label>
            <Input
              id="contact_person"
              value={companyData.contact_person}
              onChange={(e) => handleInputChange('contact_person', e.target.value)}
              placeholder="Contact person name"
            />
          </div>

          <div>
            <Label htmlFor="company_email">Email</Label>
            <Input
              id="company_email"
              type="email"
              value={companyData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="company@example.com"
            />
          </div>

          <div>
            <Label htmlFor="company_phone">Phone</Label>
            <Input
              id="company_phone"
              value={companyData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+254700000000"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="company_address">Address</Label>
          <Textarea
            id="company_address"
            value={companyData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Company address"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="license_type">License Type</Label>
            <Input
              id="license_type"
              value={companyData.license_type}
              disabled
              className="bg-gray-100"
            />
          </div>

          <div>
            <Label htmlFor="client_limit">Client Limit</Label>
            <Input
              id="client_limit"
              value={companyData.client_limit}
              disabled
              className="bg-gray-100"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanySettings;
