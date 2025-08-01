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
import DataMigration from '@/pages/DataMigration';
import NotFound from '@/pages/NotFound';
import AccessDenied from '@/components/AccessDenied';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import LicenseGuard from '@/components/license/LicenseGuard';
import RealtimeNotifications from '@/components/dashboard/RealtimeNotifications';
import { useLicenseValidation } from '@/hooks/useLicenseValidation';

interface RolePermissions {
  clients: boolean;
  billing: boolean;
  invoices: boolean;
  analytics: boolean;
  equipment: boolean;
  inventory: boolean;
  network: boolean;
  networkStatus: boolean;
  networkMap: boolean;
  messages: boolean;
  support: boolean;
  hotspots: boolean;
  packages: boolean;
  developerPortal: boolean;
  settings: boolean;
  licenseManagement: boolean;
  dataMigration: boolean;
  licenseActivation: boolean;
}

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

  // User role calculations with role-based permissions
  const { isAdmin, canAccessDashboard, isSuperAdmin, rolePermissions } = useMemo(() => {
    const defaultPermissions: RolePermissions = {
      clients: false,
      billing: false,
      invoices: false,
      analytics: false,
      equipment: false,
      inventory: false,
      network: false,
      networkStatus: false,
      networkMap: false,
      messages: false,
      support: false,
      hotspots: false,
      packages: false,
      developerPortal: false,
      settings: false,
      licenseManagement: false,
      dataMigration: false,
      licenseActivation: false
    };

    if (!profile) return { 
      isAdmin: false, 
      canAccessDashboard: false, 
      isSuperAdmin: false, 
      rolePermissions: defaultPermissions 
    };
    
    const isAdmin = ['super_admin', 'isp_admin'].includes(profile.role);
    const isSuperAdmin = profile.role === 'super_admin';
    
    // Complete list of roles that can access the dashboard
    const dashboardRoles = [
      'super_admin',
      'isp_admin', 
      'billing_admin',
      'billing_finance',
      'customer_support',
      'sales_manager',
      'sales_account_manager', 
      'network_engineer',
      'network_operations',
      'infrastructure_manager',
      'infrastructure_asset',
      'hotspot_admin',
      'technician',
      'readonly'
    ];
    
    const canAccessDashboard = dashboardRoles.includes(profile.role);
    
    // Define role-based permissions
    const rolePermissions: RolePermissions = {
      // Admin routes - full access
      clients: isAdmin || ['customer_support', 'sales_manager', 'sales_account_manager'].includes(profile.role),
      billing: isAdmin || ['billing_admin', 'billing_finance'].includes(profile.role),
      invoices: isAdmin || ['billing_admin', 'billing_finance'].includes(profile.role),
      analytics: isAdmin || ['billing_admin', 'billing_finance', 'sales_manager'].includes(profile.role),
      
      // Equipment and infrastructure
      equipment: isAdmin || ['network_engineer', 'network_operations', 'infrastructure_manager', 'infrastructure_asset', 'technician'].includes(profile.role),
      inventory: isAdmin || ['infrastructure_manager', 'infrastructure_asset', 'technician'].includes(profile.role),
      
      // Network management
      network: isAdmin || ['network_engineer', 'network_operations'].includes(profile.role),
      networkStatus: isAdmin || ['network_engineer', 'network_operations'].includes(profile.role),
      networkMap: isAdmin || ['network_engineer', 'network_operations'].includes(profile.role),
      
      // Communication
      messages: canAccessDashboard, // All dashboard users can access messages
      support: isAdmin || ['customer_support'].includes(profile.role),
      
      // Hotspots
      hotspots: isAdmin || ['hotspot_admin', 'network_engineer'].includes(profile.role),
      
      // Admin-only routes
      packages: isAdmin,
      developerPortal: isAdmin,
      settings: isAdmin,
      licenseManagement: isAdmin,
      dataMigration: isAdmin,
      licenseActivation: isAdmin
    };
    
    console.log('User role check:', {
      role: profile.role,
      isAdmin,
      canAccessDashboard,
      isSuperAdmin,
      rolePermissions
    });
    
    return { isAdmin, canAccessDashboard, isSuperAdmin, rolePermissions };
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

  // Show access denied if user doesn't have dashboard access
  if (!canAccessDashboard) {
    console.log('Access denied for role:', profile?.role);
    return <AccessDenied />;
  }

  // Authenticated routes
  return (
    <>
      <RealtimeNotifications />
      <Routes>
        {/* Client Portal Route */}
        <Route path="/client-portal/*" element={<ClientPortal />} />
        
        {/* Portal redirect route - redirects /portal to /client-portal */}
        <Route path="/portal" element={<Navigate to="/client-portal" replace />} />
        
        {/* Protected Dashboard Routes */}
        <Route
          path="/*"
          element={
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                {/* Dashboard Routes accessible to authenticated users with dashboard access */}
                <Route path="/dashboard" element={
                  <LicenseGuard allowReadOnly={validation?.isDeactivated}>
                    <Dashboard />
                  </LicenseGuard>
                } />
                <Route path="/profile" element={
                  <LicenseGuard allowReadOnly={validation?.isDeactivated}>
                    <Profile />
                  </LicenseGuard>
                } />
                
                {/* Role-based access routes */}
                {rolePermissions.clients && (
                  <Route path="/clients" element={
                    validation?.isDeactivated || validation?.isExpired ? (
                      <LicenseGuard allowReadOnly={validation?.isDeactivated}>
                        <Clients />
                      </LicenseGuard>
                    ) : (
                      <Clients />
                    )
                  } />
                )}
                
                {rolePermissions.billing && (
                  <Route path="/billing" element={
                    validation?.isDeactivated || validation?.isExpired ? (
                      <LicenseGuard allowReadOnly={validation?.isDeactivated}>
                        <Billing />
                      </LicenseGuard>
                    ) : (
                      <Billing />
                    )
                  } />
                )}
                
                {rolePermissions.invoices && (
                  <Route path="/invoices" element={
                    validation?.isDeactivated || validation?.isExpired ? (
                      <LicenseGuard allowReadOnly={validation?.isDeactivated}>
                        <Invoices />
                      </LicenseGuard>
                    ) : (
                      <Invoices />
                    )
                  } />
                )}
                
                {rolePermissions.analytics && (
                  <Route path="/analytics" element={
                    validation?.isDeactivated || validation?.isExpired ? (
                      <LicenseGuard allowReadOnly={validation?.isDeactivated}>
                        <Analytics />
                      </LicenseGuard>
                    ) : (
                      <Analytics />
                    )
                  } />
                )}
                
                {rolePermissions.equipment && (
                  <Route path="/equipment" element={
                    validation?.isDeactivated || validation?.isExpired ? (
                      <LicenseGuard allowReadOnly={validation?.isDeactivated}>
                        <Equipment />
                      </LicenseGuard>
                    ) : (
                      <Equipment />
                    )
                  } />
                )}
                
                {rolePermissions.inventory && (
                  <Route path="/inventory" element={
                    validation?.isDeactivated || validation?.isExpired ? (
                      <LicenseGuard allowReadOnly={validation?.isDeactivated}>
                        <Inventory />
                      </LicenseGuard>
                    ) : (
                      <Inventory />
                    )
                  } />
                )}
                
                {rolePermissions.network && (
                  <Route path="/network" element={
                    validation?.isDeactivated || validation?.isExpired ? (
                      <LicenseGuard allowReadOnly={validation?.isDeactivated}>
                        <NetworkManagement />
                      </LicenseGuard>
                    ) : (
                      <NetworkManagement />
                    )
                  } />
                )}
                
                {rolePermissions.networkStatus && (
                  <Route path="/network-status" element={
                    validation?.isDeactivated || validation?.isExpired ? (
                      <LicenseGuard allowReadOnly={validation?.isDeactivated}>
                        <NetworkStatus />
                      </LicenseGuard>
                    ) : (
                      <NetworkStatus />
                    )
                  } />
                )}
                
                {rolePermissions.networkMap && (
                  <Route path="/network-map" element={
                    validation?.isDeactivated || validation?.isExpired ? (
                      <LicenseGuard allowReadOnly={validation?.isDeactivated}>
                        <NetworkMap />
                      </LicenseGuard>
                    ) : (
                      <NetworkMap />
                    )
                  } />
                )}
                
                {rolePermissions.messages && (
                  <Route path="/messages" element={
                    validation?.isDeactivated || validation?.isExpired ? (
                      <LicenseGuard allowReadOnly={validation?.isDeactivated}>
                        <Messages />
                      </LicenseGuard>
                    ) : (
                      <Messages />
                    )
                  } />
                )}
                
                {rolePermissions.support && (
                  <Route path="/support" element={
                    validation?.isDeactivated || validation?.isExpired ? (
                      <LicenseGuard allowReadOnly={validation?.isDeactivated}>
                        <Support />
                      </LicenseGuard>
                    ) : (
                      <Support />
                    )
                  } />
                )}
                
                {rolePermissions.hotspots && (
                  <Route path="/hotspots" element={
                    validation?.isDeactivated || validation?.isExpired ? (
                      <LicenseGuard allowReadOnly={validation?.isDeactivated}>
                        <HotspotManagement />
                      </LicenseGuard>
                    ) : (
                      <HotspotManagement />
                    )
                  } />
                )}
                
                {/* Admin-only routes */}
                {rolePermissions.packages && (
                  <Route path="/packages" element={
                    validation?.isDeactivated || validation?.isExpired ? (
                      <LicenseGuard allowReadOnly={validation?.isDeactivated}>
                        <PackageManagement />
                      </LicenseGuard>
                    ) : (
                      <PackageManagement />
                    )
                  } />
                )}
                
                {rolePermissions.developerPortal && (
                  <Route path="/developer-portal" element={
                    validation?.isDeactivated || validation?.isExpired ? (
                      <LicenseGuard allowReadOnly={validation?.isDeactivated}>
                        <DeveloperPortal />
                      </LicenseGuard>
                    ) : (
                      <DeveloperPortal />
                    )
                  } />
                )}
                
                {rolePermissions.settings && (
                  <Route path="/settings" element={
                    validation?.isDeactivated || validation?.isExpired ? (
                      <LicenseGuard allowReadOnly={validation?.isDeactivated}>
                        <Settings />
                      </LicenseGuard>
                    ) : (
                      <Settings />
                    )
                  } />
                )}
                
                {rolePermissions.licenseManagement && (
                  <Route path="/license-management" element={
                    validation?.isDeactivated || validation?.isExpired ? (
                      <LicenseGuard allowReadOnly={validation?.isDeactivated}>
                        <LicenseManagement />
                      </LicenseGuard>
                    ) : (
                      <LicenseManagement />
                    )
                  } />
                )}
                
                {rolePermissions.dataMigration && (
                  <Route path="/data-migration" element={<DataMigration />} />
                )}
                
                {rolePermissions.licenseActivation && (
                  <Route path="/license-activation" element={<LicenseActivation />} />
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
                
                {/* Catch all for other routes */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </DashboardLayout>
          }
        />
      </Routes>
    </>
  );
};

export default AppContent;
