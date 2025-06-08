
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Settings, Shield, Users, Database } from 'lucide-react';
import UserManagement from '@/components/admin/UserManagement';

const SettingsPage = () => {
  const { profile } = useAuth();

  // Debug: Log the profile to see what we're getting
  console.log('Settings page - Current profile:', profile);
  console.log('Settings page - User role:', profile?.role);

  const canManageUsers = profile?.role === 'super_admin' || profile?.role === 'isp_admin';
  console.log('Settings page - Can manage users:', canManageUsers);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your system configuration and preferences.
        </p>
      </div>

      <div className="grid gap-6">
        {/* User Management - Only for admins */}
        {canManageUsers && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </h2>
            <UserManagement />
          </div>
        )}

        {/* Debug info for troubleshooting */}
        {profile?.role === 'super_admin' && !canManageUsers && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <p className="text-orange-800">
                Debug: You have super_admin role but UserManagement is not showing. 
                Role: {profile?.role}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Show role info for debugging */}
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
                  {profile?.role?.replace('_', ' ') || 'No role assigned'}
                </p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Company</label>
              <p className="text-sm text-gray-900">
                {profile?.isp_companies?.name || 'No company assigned'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">User ID</label>
              <p className="text-xs text-gray-600 font-mono">
                {profile?.id}
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
