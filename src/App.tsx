
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ClientAuthProvider } from "./contexts/ClientAuthContext";
import AppContent from "./components/AppContent";
import ClientPortal from "./pages/ClientPortal";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Client portal route - standalone with its own auth */}
          <Route 
            path="/client-portal" 
            element={
              <ClientAuthProvider>
                <ClientPortal />
              </ClientAuthProvider>
            } 
          />
          {/* All other routes use the main app auth */}
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
  </QueryClientProvider>
);

export default App;
