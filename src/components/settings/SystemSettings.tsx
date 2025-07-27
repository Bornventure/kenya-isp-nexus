
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import CompanySettings from './CompanySettings';
import SecuritySettings from './SecuritySettings';
import InstallationFeeSettings from './InstallationFeeSettings';

const SystemSettings = () => {
  const { profile } = useAuth();

  // Only show installation fee settings for isp_admin
  const canManageInstallationFee = profile?.role === 'isp_admin' || profile?.role === 'super_admin';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">System Settings</h2>
        <p className="text-gray-600">Configure your system preferences and company settings.</p>
      </div>

      <CompanySettings />
      
      {canManageInstallationFee && <InstallationFeeSettings />}
      
      <SecuritySettings />
    </div>
  );
};

export default SystemSettings;
