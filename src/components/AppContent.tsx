
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
import AccessDenied from "@/components/AccessDenied";

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
          <Route path="/access-denied" element={<Navigate to="/" replace />} />
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
          <Route path="/access-denied" element={<AccessDenied />} />
          <Route path="*" element={<Navigate to="/access-denied" replace />} />
        </>
      )}
    </Routes>
  );
};

export default AppContent;
