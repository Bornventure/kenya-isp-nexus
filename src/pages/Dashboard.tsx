
import React from 'react';
import { RoleBasedDashboard } from '@/components/dashboard/RoleBasedDashboard';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const { profile } = useAuth();

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
      </div>
      
      <RoleBasedDashboard />
    </div>
  );
};

export default Dashboard;
