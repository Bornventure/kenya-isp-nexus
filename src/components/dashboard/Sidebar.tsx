import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Router, 
  CreditCard, 
  Headphones, 
  Activity, 
  Settings, 
  MapPin, 
  Wifi, 
  Package,
  MessageSquare,
  BarChart,
  Globe,
  User,
  Box,
  FileText,
  Code
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: React.ComponentType<any>;
  label: string;
  path: string;
  roles?: string[];
}

const Sidebar = () => {
  const { profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  if (!profile) return null;

  const isAdmin = profile.role === 'super_admin' || profile.role === 'isp_admin';
  const canAccessDashboard = ['super_admin', 'isp_admin', 'billing_finance', 'customer_support', 'sales_account_manager', 'network_operations', 'infrastructure_asset', 'hotspot_admin'].includes(profile.role);

  // Role-based navigation items
  const getNavigationItems = () => {
    const baseItems = [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/', roles: ['super_admin', 'isp_admin', 'billing_finance', 'customer_support', 'sales_account_manager', 'network_operations', 'infrastructure_asset', 'hotspot_admin'] },
      { icon: Users, label: 'Clients', path: '/clients', roles: ['super_admin', 'isp_admin', 'customer_support', 'sales_account_manager'] },
      { icon: Router, label: 'Equipment', path: '/equipment', roles: ['super_admin', 'isp_admin', 'network_operations', 'infrastructure_asset'] },
      { icon: CreditCard, label: 'Billing', path: '/billing', roles: ['super_admin', 'isp_admin', 'billing_finance'] },
      { icon: Headphones, label: 'Support', path: '/support', roles: ['super_admin', 'isp_admin', 'customer_support'] },
      { icon: Activity, label: 'Network', path: '/network', roles: ['super_admin', 'isp_admin', 'network_operations'] },
      { icon: MapPin, label: 'Network Map', path: '/network-map', roles: ['super_admin', 'isp_admin', 'network_operations'] },
      { icon: Wifi, label: 'Hotspots', path: '/hotspots', roles: ['super_admin', 'isp_admin', 'hotspot_admin'] },
      { icon: Package, label: 'Inventory', path: '/inventory', roles: ['super_admin', 'isp_admin', 'infrastructure_asset'] },
      { icon: MessageSquare, label: 'Messages', path: '/messages', roles: ['super_admin', 'isp_admin', 'customer_support'] },
      { icon: BarChart, label: 'Analytics', path: '/analytics', roles: ['super_admin', 'isp_admin', 'billing_finance', 'sales_account_manager'] },
      { icon: Box, label: 'Packages', path: '/packages', roles: ['super_admin', 'isp_admin'] },
      { icon: FileText, label: 'Invoices', path: '/invoices', roles: ['super_admin', 'isp_admin', 'billing_finance'] },
      { icon: Code, label: 'Developer Portal', path: '/developer-portal', roles: ['super_admin', 'isp_admin'] },
    ];

    return baseItems.filter(item => 
      item.roles.some(role => role === profile.role)
    );
  };

  const adminItems = [
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: Globe, label: 'API Settings', path: '/api-settings' },
  ];

  const navigationItems = getNavigationItems();

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 w-64">
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          DataDefender
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Kenya Internet Services
        </p>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigationItems.map((item) => (
          <a
            key={item.label}
            href={item.path}
            onClick={(e) => {
              e.preventDefault();
              navigate(item.path);
            }}
            className={cn(
              "group flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-gray-100 transition-colors",
              location.pathname === item.path
                ? "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
                : "text-gray-700 dark:text-gray-400"
            )}
          >
            <item.icon className="h-4 w-4 mr-2" />
            {item.label}
          </a>
        ))}
      </nav>
      {isAdmin && (
        <div className="px-2 py-4 space-y-1 border-t border-gray-200 dark:border-gray-800">
          <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
            Admin
          </h3>
          {adminItems.map((item) => (
            <a
              key={item.label}
              href={item.path}
              onClick={(e) => {
                e.preventDefault();
                navigate(item.path);
              }}
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-gray-100 transition-colors",
                location.pathname === item.path
                  ? "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
                  : "text-gray-700 dark:text-gray-400"
              )}
            >
              <item.icon className="h-4 w-4 mr-2" />
              {item.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
