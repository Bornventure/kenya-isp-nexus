
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import CompanySpecificDashboard from './CompanySpecificDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Building, User } from 'lucide-react';

export const RoleBasedDashboard = () => {
  const { profile } = useAuth();

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </CardContent>
      </Card>
    );
  }

  const getDashboardTitle = () => {
    switch (profile.role) {
      case 'super_admin':
        return 'Super Admin Dashboard';
      case 'isp_admin':
        return 'ISP Admin Dashboard';
      case 'isp_user':
        return 'ISP User Dashboard';
      default:
        return 'Dashboard';
    }
  };

  const getRoleIcon = () => {
    switch (profile.role) {
      case 'super_admin':
        return <Crown className="h-5 w-5" />;
      case 'isp_admin':
        return <Building className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const getRoleBadgeVariant = () => {
    switch (profile.role) {
      case 'super_admin':
        return 'destructive';
      case 'isp_admin':
        return 'default';
      default:
        return 'secondary';
    }
  };

  // Super Admin gets a different view (could be implemented later for multi-tenancy)
  if (profile.role === 'super_admin') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getRoleIcon()}
            <h1 className="text-2xl font-bold">{getDashboardTitle()}</h1>
          </div>
          <Badge variant={getRoleBadgeVariant()}>
            {profile.role.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Multi-Tenant Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Super Admin dashboard for managing multiple ISP companies will be implemented here.
              For now, you have access to all company data through the regular dashboard.
            </p>
          </CardContent>
        </Card>
        
        {/* For now, show the regular dashboard for super admin too */}
        <CompanySpecificDashboard />
      </div>
    );
  }

  // Regular ISP users get the company-specific dashboard
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getRoleIcon()}
          <h1 className="text-2xl font-bold">{getDashboardTitle()}</h1>
        </div>
        <Badge variant={getRoleBadgeVariant()}>
          {profile.role.replace('_', ' ').toUpperCase()}
        </Badge>
      </div>
      
      <CompanySpecificDashboard />
    </div>
  );
};
