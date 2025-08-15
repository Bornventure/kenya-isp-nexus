import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from './components/theme-provider';
import { AuthProvider } from './contexts/AuthContext';
import { AuthGuard } from './components/AuthGuard';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ServicePackages from './pages/ServicePackages';
import Equipment from './pages/Equipment';
import Invoices from './pages/Invoices';
import Payments from './pages/Payments';
import SupportTickets from './pages/SupportTickets';
import Settings from './pages/Settings';
import BaseStations from './pages/BaseStations';
import { Toaster } from '@/components/ui/toaster';
import WorkflowDashboard from './pages/WorkflowDashboard';
import SMSTemplates from './pages/SMSTemplates';
import InvoiceDistribution from './pages/InvoiceDistribution';

const queryClient = new QueryClient();

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <div className="min-h-screen bg-background">
              <Routes>
                <Route
                  path="/"
                  element={
                    <AuthGuard>
                      <Layout>
                        <Dashboard />
                      </Layout>
                    </AuthGuard>
                  }
                />
                <Route
                  path="/clients"
                  element={
                    <AuthGuard>
                      <Layout>
                        <Clients />
                      </Layout>
                    </AuthGuard>
                  }
                />
                <Route
                  path="/service-packages"
                  element={
                    <AuthGuard>
                      <Layout>
                        <ServicePackages />
                      </Layout>
                    </AuthGuard>
                  }
                />
                <Route
                  path="/equipment"
                  element={
                    <AuthGuard>
                      <Layout>
                        <Equipment />
                      </Layout>
                    </AuthGuard>
                  }
                />
                <Route
                  path="/invoices"
                  element={
                    <AuthGuard>
                      <Layout>
                        <Invoices />
                      </Layout>
                    </AuthGuard>
                  }
                />
                <Route
                  path="/payments"
                  element={
                    <AuthGuard>
                      <Layout>
                        <Payments />
                      </Layout>
                    </AuthGuard>
                  }
                />
                <Route
                  path="/support-tickets"
                  element={
                    <AuthGuard>
                      <Layout>
                        <SupportTickets />
                      </Layout>
                    </AuthGuard>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <AuthGuard>
                      <Layout>
                        <Settings />
                      </Layout>
                    </AuthGuard>
                  }
                />
                <Route
                  path="/base-stations"
                  element={
                    <AuthGuard>
                      <Layout>
                        <BaseStations />
                      </Layout>
                    </AuthGuard>
                  }
                />
                
                {/* New workflow routes */}
                <Route
                  path="/workflow"
                  element={
                    <AuthGuard>
                      <Layout>
                        <WorkflowDashboard />
                      </Layout>
                    </AuthGuard>
                  }
                />
                <Route
                  path="/sms-templates"
                  element={
                    <AuthGuard>
                      <Layout>
                        <SMSTemplates />
                      </Layout>
                    </AuthGuard>
                  }
                />
                <Route
                  path="/invoice-distribution"
                  element={
                    <AuthGuard>
                      <Layout>
                        <InvoiceDistribution />
                      </Layout>
                    </AuthGuard>
                  }
                />
              </Routes>
            </div>
            <Toaster />
            <ReactQueryDevtools initialIsOpen={false} />
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
