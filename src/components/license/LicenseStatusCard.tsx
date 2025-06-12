
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Users, 
  Calendar, 
  AlertTriangle,
  CheckCircle 
} from 'lucide-react';
import { useLicenseManagement } from '@/hooks/useLicenseManagement';

const LicenseStatusCard: React.FC = () => {
  const { licenseInfo, isLoading } = useLicenseManagement();

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

  const clientUsagePercentage = (licenseInfo.current_client_count / licenseInfo.client_limit) * 100;
  const isNearLimit = clientUsagePercentage > 80;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          License Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Plan Type:</span>
          <Badge variant={licenseInfo.is_active ? "default" : "destructive"}>
            {licenseInfo.license_type.toUpperCase()}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-1">
              <Users className="h-4 w-4" />
              Client Usage:
            </span>
            <span className="text-sm">
              {licenseInfo.current_client_count} / {licenseInfo.client_limit}
            </span>
          </div>
          <Progress 
            value={clientUsagePercentage} 
            className={isNearLimit ? "bg-red-100" : ""}
          />
          {isNearLimit && (
            <div className="flex items-center gap-1 text-orange-600 text-xs">
              <AlertTriangle className="h-3 w-3" />
              Approaching client limit
            </div>
          )}
        </div>

        {licenseInfo.subscription_end_date && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Expires:
            </span>
            <span className="text-sm">
              {new Date(licenseInfo.subscription_end_date).toLocaleDateString()}
            </span>
          </div>
        )}

        <div className="pt-2 border-t space-y-2">
          <div className="text-sm font-medium">Features:</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              {licenseInfo.features.canAddClients ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <div className="h-3 w-3 rounded-full bg-gray-300" />
              )}
              Client Management
            </div>
            <div className="flex items-center gap-1">
              {licenseInfo.features.canManageUsers ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <div className="h-3 w-3 rounded-full bg-gray-300" />
              )}
              User Management
            </div>
            <div className="flex items-center gap-1">
              {licenseInfo.features.canExportData ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <div className="h-3 w-3 rounded-full bg-gray-300" />
              )}
              Data Export
            </div>
            <div className="flex items-center gap-1">
              {licenseInfo.features.canCustomizeBranding ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <div className="h-3 w-3 rounded-full bg-gray-300" />
              )}
              Custom Branding
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LicenseStatusCard;
