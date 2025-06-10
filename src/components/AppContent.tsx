
import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Login from "@/components/Login";
import CustomerPortal from "@/pages/CustomerPortal";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Dashboard from "@/pages/Dashboard";
import Clients from "@/pages/Clients";
import Billing from "@/pages/Billing";
import NetworkMap from "@/pages/NetworkMap";
import Equipment from "@/pages/Equipment";
import Invoices from "@/pages/Invoices";
import Analytics from "@/pages/Analytics";
import NetworkStatus from "@/pages/NetworkStatus";
import Support from "@/pages/Support";
import Settings from "@/pages/Settings";

const AppContent: React.FC = () => {
  const { user, profile, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Define roles that have access to ISP management system
  const ispManagementRoles = ['super_admin', 'isp_admin', 'technician', 'readonly'];
  const hasIspAccess = user && profile && ispManagementRoles.includes(profile.role);

  console.log('Auth state:', { user: !!user, profile, hasIspAccess });
  
  return (
    <Routes>
      {/* Public customer portal - accessible without authentication */}
      <Route path="/customer-portal" element={<CustomerPortal />} />
      
      {/* Authentication and Admin routes */}
      {!user ? (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : hasIspAccess ? (
        // User is authenticated AND has ISP management access - go to dashboard
        <>
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="clients" element={<Clients />} />
            <Route path="billing" element={<Billing />} />
            <Route path="network-map" element={<NetworkMap />} />
            <Route path="equipment" element={<Equipment />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="network" element={<NetworkStatus />} />
            <Route path="support" element={<Support />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      ) : (
        // User is authenticated but doesn't have ISP access - show access denied
        <>
          <Route path="/login" element={<Navigate to="/access-denied" replace />} />
          <Route path="/access-denied" element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
                  <p className="text-gray-600 mb-6">
                    You don't have permission to access the ISP management system. 
                    Please contact your administrator if you believe this is an error.
                  </p>
                  <button 
                    onClick={() => window.location.href = '/customer-portal'}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Go to Customer Portal
                  </button>
                </div>
              </div>
            </div>
          } />
          <Route path="*" element={<Navigate to="/access-denied" replace />} />
        </>
      )}
    </Routes>
  );
};

export default AppContent;
