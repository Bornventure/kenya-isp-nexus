
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import SuperAdminLicenseOverview from '@/components/license/SuperAdminLicenseOverview';
import ISPCompanyLicenseManager from '@/components/license/ISPCompanyLicenseManager';
import LicenseActivationPanel from '@/components/license/LicenseActivationPanel';
import CompanyRegistrationManager from '@/components/admin/CompanyRegistrationManager';
import SuperAdminInvoiceManager from '@/components/admin/SuperAdminInvoiceManager';
import LicenseTypeManager from '@/components/admin/LicenseTypeManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SuperAdminLicenseManagement = () => {
  const { profile } = useAuth();

  // Only super_admin can access this page
  if (profile?.role !== 'super_admin') {
    return <Navigate to="/access-denied" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Super Admin License Management
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage licenses, activations, and limits for all ISP companies
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">License Overview</TabsTrigger>
          <TabsTrigger value="license-types">License Types</TabsTrigger>
          <TabsTrigger value="requests">Registration Requests</TabsTrigger>
          <TabsTrigger value="invoices">Invoices & Payments</TabsTrigger>
          <TabsTrigger value="companies">Company Management</TabsTrigger>
          <TabsTrigger value="activation">License Activation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <SuperAdminLicenseOverview />
        </TabsContent>

        <TabsContent value="license-types">
          <LicenseTypeManager />
        </TabsContent>

        <TabsContent value="requests">
          <CompanyRegistrationManager />
        </TabsContent>

        <TabsContent value="invoices">
          <SuperAdminInvoiceManager />
        </TabsContent>

        <TabsContent value="companies">
          <ISPCompanyLicenseManager />
        </TabsContent>

        <TabsContent value="activation">
          <LicenseActivationPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SuperAdminLicenseManagement;
