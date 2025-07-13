
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Key, Building2, CheckCircle, AlertCircle } from 'lucide-react';

const LicenseActivation = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [licenseKey, setLicenseKey] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [activationSuccess, setActivationSuccess] = useState(false);

  // Only allow access if user doesn't have an active company or is super admin
  if (profile?.isp_company_id && profile?.role !== 'super_admin') {
    return <Navigate to="/" />;
  }

  const handleActivation = async () => {
    if (!licenseKey.trim() || !companyId.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter both license key and company ID.",
        variant: "destructive",
      });
      return;
    }

    setIsActivating(true);
    try {
      // Verify the license key and company ID match
      const { data: company, error: companyError } = await supabase
        .from('isp_companies')
        .select('*')
        .eq('license_key', licenseKey.toUpperCase())
        .eq('id', companyId)
        .single();

      if (companyError || !company) {
        toast({
          title: "Invalid License",
          description: "The license key and company ID combination is invalid or doesn't exist.",
          variant: "destructive",
        });
        return;
      }

      // Check if license is active and not expired
      if (!company.is_active) {
        toast({
          title: "License Inactive",
          description: "This license has been deactivated. Please contact support.",
          variant: "destructive",
        });
        return;
      }

      if (company.subscription_end_date && new Date(company.subscription_end_date) < new Date()) {
        toast({
          title: "License Expired",
          description: "This license has expired. Please renew your subscription.",
          variant: "destructive",
        });
        return;
      }

      // Update user profile to link to the company
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          isp_company_id: company.id,
          role: 'isp_admin' // Set as admin for the company
        })
        .eq('id', profile?.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        toast({
          title: "Activation Failed",
          description: "Failed to activate license. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setActivationSuccess(true);
      toast({
        title: "License Activated Successfully",
        description: `Welcome to ${company.name}! Your application is now activated.`,
      });

      // Redirect after success
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);

    } catch (error) {
      console.error('License activation error:', error);
      toast({
        title: "Activation Failed",
        description: "An error occurred during activation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsActivating(false);
    }
  };

  if (activationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-green-200">
          <CardHeader className="text-center">
            <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-700">License Activated!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Your license has been successfully activated. You will be redirected to the dashboard shortly.
            </p>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-700">
                Welcome to your ISP management system. You can now access all features and manage your network.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-4">
            <Key className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Activate Your License</CardTitle>
          <p className="text-gray-600 mt-2">
            Enter your license key and company ID to activate your ISP management system.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="company-id">Company ID</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="company-id"
                  type="text"
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  placeholder="Enter your company ID"
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                This was provided when your company was registered
              </p>
            </div>

            <div>
              <Label htmlFor="license-key">License Key</Label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="license-key"
                  type="text"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                  placeholder="LIC_XXXXXXXXXX"
                  className="pl-10 font-mono"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter the license key provided by your administrator
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-700">
                <p className="font-medium">Security Notice</p>
                <p className="mt-1">
                  Your license key is tied to your specific company ID for security. 
                  Both must match exactly for activation to succeed.
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleActivation}
            disabled={isActivating || !licenseKey.trim() || !companyId.trim()}
            className="w-full"
            size="lg"
          >
            {isActivating ? 'Activating License...' : 'Activate License'}
          </Button>

          <div className="text-center text-sm text-gray-500">
            <p>Need help? Contact your system administrator</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LicenseActivation;
