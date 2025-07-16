
import React, { useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Login from '@/components/Login';
import Dashboard from '@/pages/Dashboard';
import Clients from '@/pages/Clients';
import Billing from '@/pages/Billing';
import Equipment from '@/pages/Equipment';
import NetworkManagement from '@/pages/NetworkManagement';
import NetworkStatus from '@/pages/NetworkStatus';
import NetworkMap from '@/pages/NetworkMap';
import Settings from '@/pages/Settings';
import LicenseManagement from '@/pages/LicenseManagement';
import LicenseActivation from '@/pages/LicenseActivation';
import SuperAdminLicenseManagement from '@/pages/SuperAdminLicenseManagement';
import Inventory from '@/pages/Inventory';
import Messages from '@/pages/Messages';
import Support from '@/pages/Support';
import HotspotManagement from '@/pages/HotspotManagement';
import PackageManagement from '@/pages/PackageManagement';
import ClientPortal from '@/pages/ClientPortal';
import Profile from '@/pages/Profile';
import Invoices from '@/pages/Invoices';
import Analytics from '@/pages/Analytics';
import DeveloperPortal from '@/pages/DeveloperPortal';
import NotFound from '@/pages/NotFound';
import AccessDenied from '@/components/AccessDenied';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import LicenseGuard from '@/components/license/LicenseGuard';
import RealtimeNotifications from '@/components/dashboard/RealtimeNotifications';
import { useLicenseValidation } from '@/hooks/useLicenseValidation';

const AppContent: React.FC = () => {
  const { user, profile, isLoading, profileError } = useAuth();
  const { validation } = useLicenseValidation();

  // Simplified authentication state logic
  const authState = useMemo(() => {
    if (isLoading) return 'loading';
    if (!user) return 'unauthenticated';
    if (profileError) return 'profile_error';
    if (!profile) return 'profile_loading';
    return 'authenticated';
  }, [user, profile, isLoading, profileError]);

  // User role calculations
  const { isAdmin, canAccessDashboard, isSuperAdmin } = useMemo(() => {
    if (!profile) return { isAdmin: false, canAccessDashboard: false, isSuperAdmin: false };
    
    const isAdmin = ['super_admin', 'isp_admin'].includes(profile.role);
    const isSuperAdmin = profile.role === 'super_admin';
    const canAccessDashboard = ['super_admin', 'isp_admin', 'billing_finance', 'customer_support', 'sales_account_manager', 'network_operations', 'infrastructure_asset', 'hotspot_admin'].includes(profile.role);
    
    return { isAdmin, canAccessDashboard, isSuperAdmin };
  }, [profile]);

  // Loading initial auth state
  if (authState === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show login
  if (authState === 'unauthenticated') {
    return <Login />;
  }

  // Profile error - show error message with login option
  if (authState === 'profile_error') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <h2 className="text-2xl font-bold text-red-600">Profile Loading Error</h2>
          <p className="text-gray-600">
            Unable to load your profile: {profileError?.message}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Profile loading
  if (authState === 'profile_loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Authenticated routes
  return (
    <>
      <RealtimeNotifications />
      <Routes>
        {/* Client Portal Route */}
        <Route path="/client-portal/*" element={<ClientPortal />} />
        
        {/* Protected Dashboard Routes */}
        <Route
          path="/*"
          element={
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                {/* Dashboard Routes accessible to authenticated users */}
                {canAccessDashboard && (
                  <>
                    <Route path="/dashboard" element={
                      <LicenseGuard allowReadOnly={validation.isDeactivated}>
                        <Dashboard />
                      </LicenseGuard>
                    } />
                    <Route path="/profile" element={
                      <LicenseGuard allowReadOnly={validation.isDeactivated}>
                        <Profile />
                      </LicenseGuard>
                    } />
                  </>
                )}
                
                {/* Admin Routes - only wrap with LicenseGuard if license has issues */}
                {isAdmin && (
                  <>
                    <Route path="/clients" element={
                      validation.isDeactivated || validation.isExpired ? (
                        <LicenseGuard allowReadOnly={validation.isDeactivated}>
                          <Clients />
                        </LicenseGuard>
                      ) : (
                        <Clients />
                      )
                    } />
                    <Route path="/billing" element={
                      validation.isDeactivated || validation.isExpired ? (
                        <LicenseGuard allowReadOnly={validation.isDeactivated}>
                          <Billing />
                        </LicenseGuard>
                      ) : (
                        <Billing />
                      )
                    } />
                    <Route path="/invoices" element={
                      validation.isDeactivated || validation.isExpired ? (
                        <LicenseGuard allowReadOnly={validation.isDeactivated}>
                          <Invoices />
                        </LicenseGuard>
                      ) : (
                        <Invoices />
                      )
                    } />
                    <Route path="/analytics" element={
                      validation.isDeactivated || validation.isExpired ? (
                        <LicenseGuard allowReadOnly={validation.isDeactivated}>
                          <Analytics />
                        </LicenseGuard>
                      ) : (
                        <Analytics />
                      )
                    } />
                    <Route path="/equipment" element={
                      validation.isDeactivated || validation.isExpired ? (
                        <LicenseGuard allowReadOnly={validation.isDeactivated}>
                          <Equipment />
                        </LicenseGuard>
                      ) : (
                        <Equipment />
                      )
                    } />
                    <Route path="/network" element={
                      validation.isDeactivated || validation.isExpired ? (
                        <LicenseGuard allowReadOnly={validation.isDeactivated}>
                          <NetworkManagement />
                        </LicenseGuard>
                      ) : (
                        <NetworkManagement />
                      )
                    } />
                    <Route path="/network-status" element={
                      validation.isDeactivated || validation.isExpired ? (
                        <LicenseGuard allowReadOnly={validation.isDeactivated}>
                          <NetworkStatus />
                        </LicenseGuard>
                      ) : (
                        <NetworkStatus />
                      )
                    } />
                    <Route path="/network-map" element={
                      validation.isDeactivated || validation.isExpired ? (
                        <LicenseGuard allowReadOnly={validation.isDeactivated}>
                          <NetworkMap />
                        </LicenseGuard>
                      ) : (
                        <NetworkMap />
                      )
                    } />
                    <Route path="/inventory" element={
                      validation.isDeactivated || validation.isExpired ? (
                        <LicenseGuard allowReadOnly={validation.isDeactivated}>
                          <Inventory />
                        </LicenseGuard>
                      ) : (
                        <Inventory />
                      )
                    } />
                    <Route path="/messages" element={
                      validation.isDeactivated || validation.isExpired ? (
                        <LicenseGuard allowReadOnly={validation.isDeactivated}>
                          <Messages />
                        </LicenseGuard>
                      ) : (
                        <Messages />
                      )
                    } />
                    <Route path="/support" element={
                      validation.isDeactivated || validation.isExpired ? (
                        <LicenseGuard allowReadOnly={validation.isDeactivated}>
                          <Support />
                        </LicenseGuard>
                      ) : (
                        <Support />
                      )
                    } />
                    <Route path="/hotspots" element={
                      validation.isDeactivated || validation.isExpired ? (
                        <LicenseGuard allowReadOnly={validation.isDeactivated}>
                          <HotspotManagement />
                        </LicenseGuard>
                      ) : (
                        <HotspotManagement />
                      )
                    } />
                    <Route path="/packages" element={
                      validation.isDeactivated || validation.isExpired ? (
                        <LicenseGuard allowReadOnly={validation.isDeactivated}>
                          <PackageManagement />
                        </LicenseGuard>
                      ) : (
                        <PackageManagement />
                      )
                    } />
                    <Route path="/developer-portal" element={
                      validation.isDeactivated || validation.isExpired ? (
                        <LicenseGuard allowReadOnly={validation.isDeactivated}>
                          <DeveloperPortal />
                        </LicenseGuard>
                      ) : (
                        <DeveloperPortal />
                      )
                    } />
                    <Route path="/settings" element={
                      validation.isDeactivated || validation.isExpired ? (
                        <LicenseGuard allowReadOnly={validation.isDeactivated}>
                          <Settings />
                        </LicenseGuard>
                      ) : (
                        <Settings />
                      )
                    } />
                    <Route path="/license-management" element={
                      validation.isDeactivated || validation.isExpired ? (
                        <LicenseGuard allowReadOnly={validation.isDeactivated}>
                          <LicenseManagement />
                        </LicenseGuard>
                      ) : (
                        <LicenseManagement />
                      )
                    } />
                    <Route path="/license-activation" element={<LicenseActivation />} />
                  </>
                )}
                
                {/* Super Admin Only Routes - no license restrictions */}
                {isSuperAdmin && (
                  <Route path="/system-license-admin" element={<SuperAdminLicenseManagement />} />
                )}
                
                {/* Access Denied for restricted routes */}
                <Route
                  path="/system-license-admin"
                  element={
                    isSuperAdmin ? (
                      <SuperAdminLicenseManagement />
                    ) : (
                      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                        <div className="text-center space-y-4 p-8">
                          <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
                          <p className="text-gray-600">
                            You do not have permission to access this page. Super admin role required.
                          </p>
                          <p className="text-sm text-gray-600 mt-2">
                            Current role: {profile?.role || 'Unknown'}
                          </p>
                        </div>
                      </div>
                    )
                  }
                />
                
                {/* Catch all for other protected routes */}
                <Route
                  path="*"
                  element={
                    !canAccessDashboard ? (
                      <AccessDenied />
                    ) : (
                      <NotFound />
                    )
                  }
                />
              </Routes>
            </DashboardLayout>
          }
        />
      </Routes>
    </>
  );
};

export default AppContent;
