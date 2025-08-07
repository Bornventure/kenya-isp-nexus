
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-background">
      <div className="w-64 bg-card border-r">
        <Sidebar />
      </div>
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
