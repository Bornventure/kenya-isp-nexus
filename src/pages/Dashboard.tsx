
import React from 'react';
import { RoleBasedDashboard } from '@/components/dashboard/RoleBasedDashboard';
import LicenseExpiredBanner from '@/components/license/LicenseExpiredBanner';
import LicenseDeactivatedBanner from '@/components/license/LicenseDeactivatedBanner';
import ApplicationVersionInfo from '@/components/license/ApplicationVersionInfo';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <LicenseExpiredBanner />
      <LicenseDeactivatedBanner />
      <ApplicationVersionInfo />
      <RoleBasedDashboard />
    </div>
  );
};

export default Dashboard;
