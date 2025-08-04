import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Building2, Shield, Settings, BarChart3, FileText, Database, TestTube } from 'lucide-react';
import UserManagement from '@/components/admin/UserManagement';
import SuperAdminLicenseOverview from '@/components/license/SuperAdminLicenseOverview';
import CompanyRegistrationManager from '@/components/admin/CompanyRegistrationManager';
import LicenseTypeManager from '@/components/admin/LicenseTypeManager';
import SuperAdminInvoiceManager from '@/components/admin/SuperAdminInvoiceManager';
import MigrationRunner from '@/components/admin/MigrationRunner';
import SMSTesting from '@/components/admin/SMSTesting';

const SuperAdminDashboard = () => {
  const [activeView, setActiveView] = useState('overview');

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Users</CardTitle>
                {/* <CardDescription>Total number of registered users</CardDescription> */}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">143</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Active Licenses</CardTitle>
                {/* <CardDescription>Number of currently active licenses</CardDescription> */}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Companies</CardTitle>
                {/* <CardDescription>Number of registered companies</CardDescription> */}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Pending Invoices</CardTitle>
                {/* <CardDescription>Number of invoices awaiting payment</CardDescription> */}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
              </CardContent>
            </Card>
          </div>
        );
      case 'users':
        return <UserManagement />;
      case 'licenses':
        return <SuperAdminLicenseOverview />;
      case 'companies':
        return <CompanyRegistrationManager />;
      case 'license-types':
        return <LicenseTypeManager />;
      case 'invoices':
        return <SuperAdminInvoiceManager />;
      case 'migrations':
        return <MigrationRunner />;
      case 'sms-testing':
        return <SMSTesting />;
      default:
        return <div>Select a view</div>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor and manage all aspects of the system as a super administrator.
        </p>
      </div>

      <Tabs value={activeView} onValueChange={setActiveView} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="licenses" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Licenses</span>
          </TabsTrigger>
          <TabsTrigger value="companies" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Companies</span>
          </TabsTrigger>
          <TabsTrigger value="license-types" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Types</span>
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Invoices</span>
          </TabsTrigger>
          <TabsTrigger value="migrations" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Migrations</span>
          </TabsTrigger>
          <TabsTrigger value="sms-testing" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            <span className="hidden sm:inline">SMS Test</span>
          </TabsTrigger>
        </TabsList>

        {Object.keys({
          overview: null,
          users: null,
          licenses: null,
          companies: null,
          'license-types': null,
          invoices: null,
          migrations: null,
          'sms-testing': null
        }).map(key => (
          <TabsContent key={key} value={key} className="space-y-4">
            {renderContent()}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default SuperAdminDashboard;
