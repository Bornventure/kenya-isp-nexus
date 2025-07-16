
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, RefreshCw } from 'lucide-react';
import { useLicenseValidation } from '@/hooks/useLicenseValidation';
import { useAuth } from '@/contexts/AuthContext';

interface LicenseGuardProps {
  children: React.ReactNode;
  feature?: string;
  allowReadOnly?: boolean;
}

const LicenseGuard: React.FC<LicenseGuardProps> = ({ 
  children, 
  feature = 'this feature',
  allowReadOnly = false 
}) => {
  const { validation, isLoading } = useLicenseValidation();
  const { profile } = useAuth();

  // Super admin bypasses all license checks
  if (profile?.role === 'super_admin') {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Verifying license...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If license is valid and active, show content normally
  if (validation.canAccessFeatures && validation.isActive && !validation.isExpired) {
    return <>{children}</>;
  }

  // If company is deactivated, show deactivation message and read-only content
  if (validation.isDeactivated) {
    return (
      <div className="space-y-4">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-700">
              <Shield className="h-5 w-5" />
              <span>License Deactivated</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-red-700 font-medium">
                Your license has been deactivated and most features are now restricted.
              </p>
              {validation.deactivationReason && (
                <p className="text-sm text-red-600">
                  <span className="font-medium">Reason:</span> {validation.deactivationReason}
                </p>
              )}
              {validation.deactivatedAt && (
                <p className="text-sm text-red-600">
                  <span className="font-medium">Deactivated on:</span>{' '}
                  {new Date(validation.deactivatedAt).toLocaleDateString()}
                </p>
              )}
              <p className="text-sm text-red-600">
                Please contact your administrator or support team to resolve this issue and reactivate your license.
              </p>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh Status
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Show children in read-only mode for deactivated licenses */}
        <div className="opacity-60 pointer-events-none">
          {children}
        </div>
      </div>
    );
  }

  // If expired (but not deactivated), show expiration message
  if (validation.isExpired) {
    if (allowReadOnly) {
      return (
        <div className="space-y-4">
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-orange-700">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  License expired - Read-only mode
                </span>
              </div>
            </CardContent>
          </Card>
          <div className="opacity-75 pointer-events-none">
            {children}
          </div>
        </div>
      );
    }

    return (
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-orange-700">
            <AlertTriangle className="h-5 w-5" />
            <span>License Expired</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            {validation.restrictionMessage || `Your license has expired. Please renew to access ${feature}.`}
          </p>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh Status
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // For all other cases (valid licenses), show content
  return <>{children}</>;
};

export default LicenseGuard;
