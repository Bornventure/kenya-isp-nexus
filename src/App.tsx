
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ClientAuthProvider } from "@/contexts/ClientAuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import AppContent from "@/components/AppContent";
import ClientPortal from "@/pages/ClientPortal";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Client Portal Route */}
            <Route 
              path="/client-portal" 
              element={
                <ClientAuthProvider>
                  <ClientPortal />
                </ClientAuthProvider>
              } 
            />
            
            {/* Main Application Routes */}
            <Route 
              path="/*" 
              element={
                <AuthProvider>
                  <AppContent />
                </AuthProvider>
              } 
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
