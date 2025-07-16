
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ShieldOff, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLicenseValidation } from '@/hooks/useLicenseValidation';

const LicenseDeactivatedBanner: React.FC = () => {
  const { profile } = useAuth();
  const { validation } = useLicenseValidation();

  // Don't show for super admin
  if (profile?.role === 'super_admin') {
    return null;
  }

  // Only show if license is deactivated
  if (!validation.isDeactivated) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-6 border-red-300 bg-red-50">
      <ShieldOff className="h-4 w-4" />
      <AlertTitle className="text-red-800">License Deactivated</AlertTitle>
      <AlertDescription className="mt-2 text-red-700">
        <div className="space-y-2">
          <p>
            <strong>Your license has been deactivated.</strong>
          </p>
          {validation.deactivationReason && (
            <p>
              <span className="font-medium">Reason:</span> {validation.deactivationReason}
            </p>
          )}
          {validation.deactivatedAt && (
            <p>
              <span className="font-medium">Deactivated on:</span>{' '}
              {new Date(validation.deactivatedAt).toLocaleDateString()}
            </p>
          )}
          <p className="text-sm">
            Most features are now restricted. Please contact your administrator or support team to resolve this issue and reactivate your license.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">
              Service will remain suspended until reactivation
            </span>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default LicenseDeactivatedBanner;
