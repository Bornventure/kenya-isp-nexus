
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import UserManagement from '@/components/admin/UserManagement';
import SecuritySettings from '@/components/settings/SecuritySettings';
import SystemSettings from '@/components/settings/SystemSettings';
import CompanySettings from '@/components/settings/CompanySettings';
import DataManagement from '@/components/settings/DataManagement';
import { useAuth } from '@/contexts/AuthContext';

const Settings = () => {
  const { profile } = useAuth();
  const isSuperAdmin = profile?.role === 'super_admin';

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your system settings and configurations.
          </p>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="company">Company</TabsTrigger>
            <TabsTrigger value="data">Data Management</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card className="p-6">
              <UserManagement />
            </Card>
          </TabsContent>

          <TabsContent value="company" className="space-y-4">
            {isSuperAdmin ? (
              <CompanySettings />
            ) : (
              <Card className="p-6">
                <p className="text-center text-muted-foreground">
                  You don't have permission to access company settings.
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            {isSuperAdmin ? (
              <DataManagement />
            ) : (
              <Card className="p-6">
                <p className="text-center text-muted-foreground">
                  You don't have permission to access data management settings.
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            {isSuperAdmin ? (
              <SecuritySettings />
            ) : (
              <Card className="p-6">
                <p className="text-center text-muted-foreground">
                  You don't have permission to access security settings.
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            {isSuperAdmin ? (
              <SystemSettings />
            ) : (
              <Card className="p-6">
                <p className="text-center text-muted-foreground">
                  You don't have permission to access system settings.
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
