import React from 'react';
import {
  BarChart3,
  Users,
  HardDrive,
  Package,
  Wifi,
  Radio,
  Map,
  CreditCard,
  Settings,
  TrendingUp,
  Activity,
  Shield,
  FileText,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface MenuItem {
  icon: React.ComponentType<any>;
  label: string;
  path?: string;
  submenu?: { label: string; path: string }[];
  roles: string[];
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { profile } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const hasRequiredRole = (roles: string[]) => {
    return profile && roles.includes(profile.role);
  };

  const menuItems = [
    { 
      icon: BarChart3, 
      label: 'Dashboard', 
      path: '/', 
      roles: ['super_admin', 'isp_admin', 'technician', 'sales'] 
    },
    { 
      icon: Users, 
      label: 'Clients', 
      path: '/clients',
      submenu: [
        { label: 'All Clients', path: '/clients' },
        { label: 'Workflow Management', path: '/clients/workflow' }
      ],
      roles: ['super_admin', 'isp_admin', 'sales', 'technician'] 
    },
    { 
      icon: HardDrive, 
      label: 'Equipment', 
      path: '/equipment', 
      roles: ['super_admin', 'isp_admin', 'technician'] 
    },
    { 
      icon: Package, 
      label: 'Inventory', 
      path: '/inventory', 
      roles: ['super_admin', 'isp_admin', 'technician'] 
    },
    { 
      icon: Wifi, 
      label: 'Service Packages', 
      path: '/service-packages', 
      roles: ['super_admin', 'isp_admin'] 
    },
    { 
      icon: Radio, 
      label: 'Base Stations', 
      path: '/base-stations', 
      roles: ['super_admin', 'isp_admin', 'technician'] 
    },
    {
      icon: Map,
      label: 'Network Map',
      path: '/network-map',
      roles: ['super_admin', 'isp_admin', 'technician']
    },
    {
      icon: CreditCard,
      label: 'Billing',
      submenu: [
        { label: 'Invoices', path: '/billing/invoices' },
        { label: 'Payments', path: '/billing/payments' },
        { label: 'Installation Invoices', path: '/billing/installation-invoices' }
      ],
      roles: ['super_admin', 'isp_admin', 'sales']
    },
    {
      icon: Settings,
      label: 'Operations',
      submenu: [
        { label: 'Hotspots', path: '/operations/hotspots' },
        { label: 'Support Tickets', path: '/operations/support-tickets' }
      ],
      roles: ['super_admin', 'isp_admin', 'technician']
    },
    {
      icon: TrendingUp,
      label: 'Analytics',
      submenu: [
        { label: 'Network Analytics', path: '/analytics/network' },
        { label: 'Reports', path: '/analytics/reports' }
      ],
      roles: ['super_admin', 'isp_admin']
    },
    {
      icon: Activity,
      label: 'Network Monitoring',
      submenu: [
        { label: 'Network Status', path: '/monitoring/network' },
        { label: 'RADIUS Monitoring', path: '/monitoring/radius' }
      ],
      roles: ['super_admin', 'isp_admin', 'technician']
    },
    {
      icon: Shield,
      label: 'Administration',
      submenu: [
        { label: 'System Settings', path: '/administration/system-settings' },
        { label: 'User Management', path: '/administration/user-management' },
        { label: 'Message Templates', path: '/administration/templates' }
      ],
      roles: ['super_admin', 'isp_admin']
    },
    { 
      icon: FileText, 
      label: 'Audit Logs', 
      path: '/audit-logs', 
      roles: ['super_admin', 'isp_admin'] 
    },
  ];

  return (
    <div className="flex flex-col h-full py-4 bg-gray-50 border-r">
      <div className="px-6">
        <h1 className="font-bold text-2xl">Lake Link</h1>
        <p className="text-sm text-gray-500">Control Panel</p>
      </div>
      <nav className="flex-1 mt-6 space-y-0.5">
        {menuItems.map((item, index) => {
          if (!hasRequiredRole(item.roles)) {
            return null;
          }

          if (item.submenu) {
            return (
              <div key={index} className="space-y-0.5">
                <p className="px-6 text-xs font-semibold text-gray-500 uppercase">{item.label}</p>
                {item.submenu.map((sub, i) => (
                  <NavLink
                    key={i}
                    to={sub.path}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center h-9 px-6 text-sm font-medium rounded-md transition-colors hover:bg-gray-100",
                        isActive ? "bg-gray-100 text-primary" : "text-gray-700"
                      )
                    }
                  >
                    {sub.label}
                  </NavLink>
                ))}
              </div>
            );
          }

          return (
            <NavLink
              key={index}
              to={item.path || ""}
              className={({ isActive }) =>
                cn(
                  "flex items-center h-9 px-6 text-sm font-medium rounded-md transition-colors hover:bg-gray-100",
                  isActive ? "bg-gray-100 text-primary" : "text-gray-700"
                )
              }
            >
              <item.icon className="w-4 h-4 mr-2" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
