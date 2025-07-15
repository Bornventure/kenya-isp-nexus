
import React from 'react';
import RoleBasedDashboard from '@/components/dashboard/RoleBasedDashboard';
import LicenseExpiredBanner from '@/components/license/LicenseExpiredBanner';
import ApplicationVersionInfo from '@/components/license/ApplicationVersionInfo';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <LicenseExpiredBanner />
      <ApplicationVersionInfo />
      <RoleBasedDashboard />
    </div>
  );
};

export default Dashboard;
