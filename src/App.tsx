
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Login from "@/components/Login";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Dashboard from "@/pages/Dashboard";
import Clients from "@/pages/Clients";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Login />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="clients" element={<Clients />} />
        <Route path="network-map" element={<div className="p-6"><h1 className="text-2xl">Network Map - Coming Soon</h1></div>} />
        <Route path="equipment" element={<div className="p-6"><h1 className="text-2xl">Equipment - Coming Soon</h1></div>} />
        <Route path="billing" element={<div className="p-6"><h1 className="text-2xl">Billing - Coming Soon</h1></div>} />
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
