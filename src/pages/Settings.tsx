
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Settings, Shield, Users, Database, Key, Cog } from 'lucide-react';
import { Link } from 'react-router-dom';
import UserManagement from '@/components/admin/UserManagement';

const SettingsPage = () => {
  const { profile } = useAuth();

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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link to="/api-settings">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Key className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">API & Integrations</CardTitle>
                  <CardDescription>
                    Configure M-Pesa, SMS, and other API settings
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Cog className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg">System Settings</CardTitle>
                <CardDescription>
                  General system configuration options
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" className="w-full">
              Configure
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Security</CardTitle>
                <CardDescription>
                  Password policies and security settings
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" className="w-full">
              Manage
            </Button>
          </CardContent>
        </Card>
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

        {/* Profile Information */}
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
              <div className="flex justify-between">
                <span className="font-medium">Environment:</span>
                <span>Production</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
