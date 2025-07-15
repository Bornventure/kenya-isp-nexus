
import React, { useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Login from '@/components/Login';
import Dashboard from '@/pages/Dashboard';
import Clients from '@/pages/Clients';
import Billing from '@/pages/Billing';
import Equipment from '@/pages/Equipment';
import NetworkManagement from '@/pages/NetworkManagement';
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
import NotFound from '@/pages/NotFound';
import AccessDenied from '@/components/AccessDenied';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import LicenseGuard from '@/components/license/LicenseGuard';
import RealtimeNotifications from '@/components/dashboard/RealtimeNotifications';

const AppContent: React.FC = () => {
  const { user, profile, isLoading, profileError } = useAuth();

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
            <LicenseGuard>
              <DashboardLayout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  
                  {/* Dashboard Routes accessible to authenticated users */}
                  {canAccessDashboard && (
                    <>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/profile" element={<Profile />} />
                    </>
                  )}
                  
                  {/* Admin Routes */}
                  {isAdmin && (
                    <>
                      <Route path="/clients" element={<Clients />} />
                      <Route path="/billing" element={<Billing />} />
                      <Route path="/equipment" element={<Equipment />} />
                      <Route path="/network" element={<NetworkManagement />} />
                      <Route path="/network-map" element={<NetworkMap />} />
                      <Route path="/inventory" element={<Inventory />} />
                      <Route path="/messages" element={<Messages />} />
                      <Route path="/support" element={<Support />} />
                      <Route path="/hotspots" element={<HotspotManagement />} />
                      <Route path="/packages" element={<PackageManagement />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/license-management" element={<LicenseManagement />} />
                      <Route path="/license-activation" element={<LicenseActivation />} />
                    </>
                  )}
                  
                  {/* Super Admin Only Routes */}
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
            </LicenseGuard>
          }
        />
      </Routes>
    </>
  );
};

export default AppContent;
