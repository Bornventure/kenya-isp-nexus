
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, Shield } from 'lucide-react';
import { useLicenseValidation } from '@/hooks/useLicenseValidation';
import { useAuth } from '@/contexts/AuthContext';

const LicenseExpiredBanner: React.FC = () => {
  const { validation } = useLicenseValidation();
  const { profile } = useAuth();

  // Don't show banner for super admin
  if (profile?.role === 'super_admin') {
    return null;
  }

  // Don't show if license is valid
  if (validation.canAccessFeatures && !validation.restrictionMessage) {
    return null;
  }

  const getAlertVariant = () => {
    if (validation.isExpired || !validation.isActive) return 'destructive';
    if (validation.daysUntilExpiry !== null && validation.daysUntilExpiry <= 3) return 'destructive';
    return 'default';
  };

  const getIcon = () => {
    if (validation.isExpired || !validation.isActive) return AlertTriangle;
    if (validation.daysUntilExpiry !== null && validation.daysUntilExpiry <= 7) return Clock;
    return Shield;
  };

  const Icon = getIcon();

  return (
    <Alert variant={getAlertVariant()} className="mb-6">
      <Icon className="h-4 w-4" />
      <AlertTitle>
        {validation.isExpired ? 'License Expired' : 
         !validation.isActive ? 'License Inactive' : 
         'License Expiring Soon'}
      </AlertTitle>
      <AlertDescription className="mt-2">
        <p>{validation.restrictionMessage}</p>
        {validation.isExpired && (
          <div className="mt-3">
            <p className="text-sm mb-2">
              Your access to most features has been restricted. Please contact your administrator to renew the license.
            </p>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <Shield className="h-3 w-3 mr-1" />
              Check License Status
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default LicenseExpiredBanner;
