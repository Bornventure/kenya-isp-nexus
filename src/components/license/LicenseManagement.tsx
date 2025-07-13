
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLicenseManagement } from '@/hooks/useLicenseManagement';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Settings, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Save,
  RefreshCw
} from 'lucide-react';

const LicenseManagement: React.FC = () => {
  const { profile } = useAuth();
  const { licenseInfo, isLoading } = useLicenseManagement();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [newClientLimit, setNewClientLimit] = useState<number>(0);
  const [newLicenseType, setNewLicenseType] = useState<string>('');

  React.useEffect(() => {
    if (licenseInfo) {
      setNewClientLimit(licenseInfo.client_limit);
      setNewLicenseType(licenseInfo.license_type);
    }
  }, [licenseInfo]);

  const handleUpdateLicense = async () => {
    if (!profile?.isp_company_id) {
      toast({
        title: "Error",
        description: "No company ID found",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('isp_companies')
        .update({
          client_limit: newClientLimit,
          license_type: newLicenseType as any,
        })
        .eq('id', profile.isp_company_id);

      if (error) throw error;

      toast({
        title: "License Updated",
        description: "License settings have been updated successfully.",
      });

      // Refresh the page to reload license info
      window.location.reload();
    } catch (error) {
      console.error('Error updating license:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update license settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getLicenseTypeDefaults = (type: string) => {
    switch (type) {
      case 'starter':
        return { limit: 50, color: 'bg-blue-500' };
      case 'professional':
        return { limit: 200, color: 'bg-green-500' };
      case 'enterprise':
        return { limit: 1000, color: 'bg-purple-500' };
      default:
        return { limit: 100, color: 'bg-gray-500' };
    }
  };

  const handleLicenseTypeChange = (type: string) => {
    setNewLicenseType(type);
    const defaults = getLicenseTypeDefaults(type);
    setNewClientLimit(defaults.limit);
  };

  if (isLoading || !licenseInfo) {
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

  const usagePercentage = (licenseInfo.current_client_count / licenseInfo.client_limit) * 100;
  const isNearLimit = usagePercentage > 80;
  const isAtLimit = usagePercentage >= 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            License Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current License Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Current License Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-700">License Type</span>
                  <Badge variant="default" className="capitalize">
                    {licenseInfo.license_type}
                  </Badge>
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-700">Client Usage</span>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-800">
                      {licenseInfo.current_client_count} / {licenseInfo.client_limit}
                    </div>
                    <div className="text-xs text-green-600">
                      {usagePercentage.toFixed(1)}% used
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Status</span>
                  <div className="flex items-center gap-1">
                    {isAtLimit ? (
                      <>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-red-600 text-sm font-medium">At Limit</span>
                      </>
                    ) : isNearLimit ? (
                      <>
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <span className="text-orange-600 text-sm font-medium">Near Limit</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-green-600 text-sm font-medium">Active</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* License Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">License Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="license-type">License Type</Label>
                <Select value={newLicenseType} onValueChange={handleLicenseTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select license type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-limit">Client Limit</Label>
                <Input
                  id="client-limit"
                  type="number"
                  min="1"
                  value={newClientLimit}
                  onChange={(e) => setNewClientLimit(Number(e.target.value))}
                  placeholder="Enter client limit"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              disabled={isUpdating}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={handleUpdateLicense}
              disabled={isUpdating || newClientLimit === licenseInfo.client_limit}
            >
              <Save className="h-4 w-4 mr-2" />
              {isUpdating ? 'Updating...' : 'Update License'}
            </Button>
          </div>

          {/* Warning Messages */}
          {newClientLimit < licenseInfo.current_client_count && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Warning</span>
              </div>
              <p className="text-sm text-red-600 mt-1">
                The new limit ({newClientLimit}) is lower than your current client count ({licenseInfo.current_client_count}). 
                This may affect existing clients.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* License Type Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>License Type Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['starter', 'professional', 'enterprise'].map((type) => {
              const defaults = getLicenseTypeDefaults(type);
              return (
                <div key={type} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold capitalize">{type}</h4>
                    <Badge variant={type === licenseInfo.license_type ? "default" : "outline"}>
                      {type === licenseInfo.license_type ? 'Current' : 'Available'}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Client Limit:</span>
                      <span className="font-medium">{defaults.limit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>User Management:</span>
                      <span>{type !== 'starter' ? '✓' : '✗'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Data Export:</span>
                      <span>{type !== 'starter' ? '✓' : '✗'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Custom Branding:</span>
                      <span>{type === 'enterprise' ? '✓' : '✗'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LicenseManagement;
