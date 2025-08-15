
import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ClientAuthProvider } from '@/contexts/ClientAuthContext';
import Layout from '@/components/layout/Layout';
import Login from './Login';
import ProtectedRoute from './auth/ProtectedRoute';
import Index from '@/pages/Index';
import Clients from '@/pages/Clients';
import Equipment from '@/pages/Equipment';
import Inventory from '@/pages/Inventory';
import NetworkManagement from '@/pages/NetworkManagement';
import NetworkMap from '@/pages/NetworkMap';
import Billing from '@/pages/Billing';
import Support from '@/pages/Support';
import Settings from '@/pages/Settings';
import ClientPortal from '@/pages/ClientPortal';
import { Toaster } from '@/components/ui/toaster';

const AppContent = () => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only redirect authenticated users away from login
    if (user && profile && !isLoading && location.pathname === '/login') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, profile, isLoading, location.pathname, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={<Login />} 
        />
        <Route 
          path="/client-portal" 
          element={
            <ClientAuthProvider>
              <ClientPortal />
            </ClientAuthProvider>
          } 
        />
        
        {/* Protected routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Index />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/equipment" element={<Equipment />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/network-management" element={<NetworkManagement />} />
                  <Route path="/network-map" element={<NetworkMap />} />
                  <Route path="/billing" element={<Billing />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster />
    </>
  );
};

export default AppContent;
