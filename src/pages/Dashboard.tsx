
import React from 'react';
import { RoleBasedDashboard } from '@/components/dashboard/RoleBasedDashboard';
import LicenseExpiredBanner from '@/components/license/LicenseExpiredBanner';
import LicenseDeactivatedBanner from '@/components/license/LicenseDeactivatedBanner';
import ApplicationVersionInfo from '@/components/license/ApplicationVersionInfo';
import { useLicenseValidation } from '@/hooks/useLicenseValidation';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const { validation } = useLicenseValidation();
  const { profile } = useAuth();

  // Don't show license banners for super admin
  const shouldShowLicenseBanners = profile?.role !== 'super_admin';

  return (
    <div className="space-y-6">
      {shouldShowLicenseBanners && <LicenseExpiredBanner />}
      {shouldShowLicenseBanners && validation.isDeactivated && (
        <LicenseDeactivatedBanner 
          deactivationReason={validation.deactivationReason}
          deactivatedAt={validation.deactivatedAt}
        />
      )}
      <ApplicationVersionInfo />
      <RoleBasedDashboard />
    </div>
  );
};

export default Dashboard;
