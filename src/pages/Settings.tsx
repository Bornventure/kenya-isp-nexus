
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Settings, Shield, Users, Database } from 'lucide-react';
import UserManagement from '@/components/admin/UserManagement';

const SettingsPage = () => {
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your system configuration and preferences.
        </p>
      </div>

      <div className="grid gap-6">
        {/* User Management - Only for admins */}
        {(profile?.role === 'super_admin' || profile?.role === 'isp_admin') && (
          <UserManagement />
        )}

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Your account details and role information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Name</label>
                <p className="text-sm text-gray-900">
                  {profile?.first_name} {profile?.last_name}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Role</label>
                <p className="text-sm text-gray-900 capitalize">
                  {profile?.role?.replace('_', ' ')}
                </p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Company</label>
              <p className="text-sm text-gray-900">
                {profile?.isp_companies?.name || 'No company assigned'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              System Information
            </CardTitle>
            <CardDescription>
              Current system status and configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">System Version:</span>
                <span>v1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">License Type:</span>
                <span className="capitalize">{profile?.isp_companies?.license_type || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Client Limit:</span>
                <span>{profile?.isp_companies?.client_limit || 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
