
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import RoleBasedDashboard from '@/components/dashboard/RoleBasedDashboard';
import RealtimeNotifications from '@/components/dashboard/RealtimeNotifications';

const Dashboard = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <RealtimeNotifications />
      <RoleBasedDashboard />
    </div>
  );
};

export default Dashboard;
