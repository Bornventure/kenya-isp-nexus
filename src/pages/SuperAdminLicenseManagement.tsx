
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LicenseActivationPanel from '@/components/license/LicenseActivationPanel';
import SuperAdminLicenseOverview from '@/components/license/SuperAdminLicenseOverview';
import LicenseDeactivationManager from '@/components/license/LicenseDeactivationManager';

const SuperAdminLicenseManagement = () => {
  const { profile } = useAuth();

  if (profile?.role !== 'super_admin') {
    return <Navigate to="/access-denied" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          System License Administration
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage ISP company licenses, registrations, and system-wide license operations
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activation">License Activation</TabsTrigger>
          <TabsTrigger value="management">License Management</TabsTrigger>
          <TabsTrigger value="deactivation">Deactivation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <SuperAdminLicenseOverview />
        </TabsContent>

        <TabsContent value="activation">
          <LicenseActivationPanel />
        </TabsContent>

        <TabsContent value="management">
          <div className="text-center py-8">
            <p className="text-gray-600">Advanced license management features coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="deactivation">
          <LicenseDeactivationManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SuperAdminLicenseManagement;
