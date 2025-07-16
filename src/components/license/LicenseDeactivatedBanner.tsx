
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LicenseDeactivatedBannerProps {
  deactivationReason?: string;
  deactivatedAt?: string;
}

const LicenseDeactivatedBanner = ({ deactivationReason, deactivatedAt }: LicenseDeactivatedBannerProps) => {
  const navigate = useNavigate();

  const handleActivationRedirect = () => {
    navigate('/license-activation');
  };

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>License Deactivated</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-2">
          Your company license has been deactivated and access to system features is restricted.
        </p>
        {deactivationReason && (
          <p className="mb-2">
            <strong>Reason:</strong> {deactivationReason}
          </p>
        )}
        {deactivatedAt && (
          <p className="mb-3">
            <strong>Deactivated on:</strong> {new Date(deactivatedAt).toLocaleDateString()}
          </p>
        )}
        <div className="flex gap-2 mt-3">
          <Button 
            onClick={handleActivationRedirect}
            size="sm" 
            variant="outline"
            className="bg-white text-red-700 border-red-300 hover:bg-red-50"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Reactivate License
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default LicenseDeactivatedBanner;
