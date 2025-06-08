
import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Login from "@/components/Login";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Dashboard from "@/pages/Dashboard";
import Clients from "@/pages/Clients";
import Billing from "@/pages/Billing";
import NetworkMap from "@/pages/NetworkMap";
import Equipment from "@/pages/Equipment";

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }
  
  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="clients" element={<Clients />} />
        <Route path="billing" element={<Billing />} />
        <Route path="network-map" element={<NetworkMap />} />
        <Route path="equipment" element={<Equipment />} />
        <Route path="invoices" element={<div className="p-6"><h1 className="text-2xl">Invoices - Coming Soon</h1></div>} />
        <Route path="analytics" element={<div className="p-6"><h1 className="text-2xl">Analytics - Coming Soon</h1></div>} />
        <Route path="network" element={<div className="p-6"><h1 className="text-2xl">Network Status - Coming Soon</h1></div>} />
        <Route path="support" element={<div className="p-6"><h1 className="text-2xl">Support - Coming Soon</h1></div>} />
        <Route path="settings" element={<div className="p-6"><h1 className="text-2xl">Settings - Coming Soon</h1></div>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppContent;
