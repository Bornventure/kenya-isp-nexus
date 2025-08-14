
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Login from '@/components/Login';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import LicenseExpiredBanner from '@/components/license/LicenseExpiredBanner';

const AppContent = () => {
  const { user, profile, isLoading } = useAuth();

  console.log('AppContent auth state:', { user: !!user, profile: !!profile, isLoading });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      
      {/* Protected routes - only accessible when authenticated */}
      <Route path="/dashboard" element={
        user && profile ? (
          <DashboardLayout>
            <LicenseExpiredBanner />
            <Dashboard />
          </DashboardLayout>
        ) : (
          <Navigate to="/login" replace />
        )
      } />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppContent;
