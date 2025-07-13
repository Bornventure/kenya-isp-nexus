
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LicenseManagement from '@/components/license/LicenseManagement';
import LicenseStatusCard from '@/components/license/LicenseStatusCard';

const LicenseManagementPage = () => {
  const { profile } = useAuth();

  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'isp_admin';

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          License Management
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your system license, client limits, and subscription settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LicenseManagement />
        </div>
        <div>
          <LicenseStatusCard />
        </div>
      </div>
    </div>
  );
};

export default LicenseManagementPage;
