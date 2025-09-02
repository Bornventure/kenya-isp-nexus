
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PublicRoute from "@/components/auth/PublicRoute";
import Layout from "@/components/layout/Layout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Clients from "@/pages/Clients";
import NetworkManagement from "@/pages/NetworkManagement";
import Hotspots from "@/pages/Hotspots";
import ServicePackages from "@/pages/ServicePackages";
import Equipment from "@/pages/Equipment";
import BaseStations from "@/pages/BaseStations";
import NetworkMap from "@/pages/NetworkMap";
import Inventory from "@/pages/Inventory";
import Billing from "@/pages/Billing";
import Invoices from "@/pages/Invoices";
import Reports from "@/pages/Reports";
import Analytics from "@/pages/Analytics";
import Messages from "@/pages/Messages";
import Support from "@/pages/Support";
import Settings from "@/pages/Settings";
import UserManagement from "@/pages/admin/UserManagement";
import CompanyManagement from "@/pages/admin/CompanyManagement";
import SystemSettings from "@/pages/admin/SystemSettings";
import CompanyRegistration from "@/pages/CompanyRegistration";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/register-company" element={<CompanyRegistration />} />
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="clients" element={<Clients />} />
              <Route path="network-management" element={<NetworkManagement />} />
              <Route path="hotspots" element={<Hotspots />} />
              <Route path="service-packages" element={<ServicePackages />} />
              <Route path="equipment" element={<Equipment />} />
              <Route path="base-stations" element={<BaseStations />} />
              <Route path="network-map" element={<NetworkMap />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="billing" element={<Billing />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="reports" element={<Reports />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="messages" element={<Messages />} />
              <Route path="support" element={<Support />} />
              <Route path="settings" element={<Settings />} />
              <Route path="admin/users" element={<UserManagement />} />
              <Route path="admin/companies" element={<CompanyManagement />} />
              <Route path="admin/system" element={<SystemSettings />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
