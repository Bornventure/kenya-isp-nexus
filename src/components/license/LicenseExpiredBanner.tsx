
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, Shield } from 'lucide-react';
import { useLicenseValidation } from '@/hooks/useLicenseValidation';
import { useAuth } from '@/contexts/AuthContext';

const LicenseExpiredBanner: React.FC = () => {
  const { validation } = useLicenseValidation();
  const { profile, user } = useAuth();

  // Don't show banner if user is not authenticated
  if (!user || !profile) {
    return null;
  }

  // Don't show banner for super admin - they have unlimited access
  if (profile?.role === 'super_admin') {
    return null;
  }

  // Only show banner for actual problems: deactivated or expired licenses
  if (validation.isActive && !validation.isExpired && !validation.restrictionMessage) {
    return null;
  }

  // Don't show if license is valid and active
  if (validation.canAccessFeatures && validation.isActive && !validation.isExpired) {
    return null;
  }

  const getAlertVariant = () => {
    if (validation.isDeactivated || validation.isExpired) return 'destructive';
    if (validation.daysUntilExpiry !== null && validation.daysUntilExpiry <= 3) return 'destructive';
    return 'default';
  };

  const getIcon = () => {
    if (validation.isDeactivated) return Shield;
    if (validation.isExpired) return AlertTriangle;
    if (validation.daysUntilExpiry !== null && validation.daysUntilExpiry <= 7) return Clock;
    return Shield;
  };

  const getTitle = () => {
    if (validation.isDeactivated) return 'License Deactivated';
    if (validation.isExpired) return 'License Expired';
    return 'License Expiring Soon';
  };

  const Icon = getIcon();

  return (
    <Alert variant={getAlertVariant()} className="mb-6">
      <Icon className="h-4 w-4" />
      <AlertTitle>{getTitle()}</AlertTitle>
      <AlertDescription className="mt-2">
        <p>{validation.restrictionMessage}</p>
        {(validation.isExpired || validation.isDeactivated) && (
          <div className="mt-3">
            <p className="text-sm mb-2">
              {validation.isDeactivated 
                ? 'Your license has been deactivated. Please contact your administrator to reactivate.'
                : 'Your access to most features has been restricted. Please contact your administrator to renew the license.'
              }
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
