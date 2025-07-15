import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Shield, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLicenseManagement } from '@/hooks/useLicenseManagement';
import { useLicenseValidation } from '@/hooks/useLicenseValidation';

const LicenseManagement = () => {
  const { profile } = useAuth();
  const { licenseInfo, isLoading } = useLicenseManagement();
  const { validation } = useLicenseValidation();
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Super admin gets special treatment - show system overview instead of company-specific license
  if (profile?.role === 'super_admin') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Administrator Access
          </CardTitle>
          <CardDescription>
            You have full system access as a super administrator
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
              <CheckCircle className="h-3 w-3 mr-1" />
              Unlimited Access
            </Badge>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              As a super administrator, you have unrestricted access to all system features including:
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside ml-4 space-y-1">
              <li>License management and activation</li>
              <li>Company registration and management</li>
              <li>System-wide configuration</li>
              <li>All ISP company data and operations</li>
            </ul>
          </div>

          <div className="pt-4 border-t">
            <Button 
              onClick={() => window.location.href = '/system-license-admin'}
              className="w-full"
            >
              <Shield className="h-4 w-4 mr-2" />
              Access System License Administration
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading license information...</div>
        </CardContent>
      </Card>
    );
  }

  if (!licenseInfo) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            No License Information
          </CardTitle>
          <CardDescription>
            Unable to load license information for your company.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Your account may not be properly associated with a company, or there may be an issue with your license.
          </p>
          <Button onClick={() => window.location.reload()}>
            Refresh License Status
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleUpgrade = async (newLicenseType: string) => {
    setIsUpgrading(true);
    // Implementation would depend on your upgrade process
    console.log(`Upgrading to ${newLicenseType}`);
    setIsUpgrading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Current License
          </CardTitle>
          <CardDescription>
            Your current license type and usage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold capitalize">{licenseInfo.license_type} License</h3>
              <p className="text-sm text-gray-600">
                {licenseInfo.current_client_count} of {licenseInfo.client_limit} clients used
              </p>
            </div>
            <Badge variant={licenseInfo.is_active ? "default" : "destructive"}>
              {licenseInfo.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ 
                width: `${Math.min((licenseInfo.current_client_count / licenseInfo.client_limit) * 100, 100)}%` 
              }}
            ></div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Client Limit:</span>
              <span className="ml-2 font-medium">{licenseInfo.client_limit}</span>
            </div>
            <div>
              <span className="text-gray-600">Remaining:</span>
              <span className="ml-2 font-medium">
                {licenseInfo.client_limit - licenseInfo.current_client_count}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            License Features
          </CardTitle>
          <CardDescription>
            Features available with your current license
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(licenseInfo.features).map(([feature, enabled]) => (
              <div key={feature} className="flex items-center gap-2">
                {enabled ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                )}
                <span className={`text-sm ${enabled ? 'text-gray-900' : 'text-gray-500'}`}>
                  {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LicenseManagement;
