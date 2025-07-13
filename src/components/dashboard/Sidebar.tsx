
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Home,
  Users,
  Server,
  CreditCard,
  HeadphonesIcon,
  Wifi,
  Map,
  Zap,
  Package,
  MessageSquare,
  BarChart3,
  Settings,
  User,
  Shield,
  Wrench,
  BookOpen,
  Code,
  Receipt,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { profile } = useAuth();
  const location = useLocation();

  if (!profile) return null;

  const isAdmin = profile.role === 'super_admin' || profile.role === 'isp_admin';
  const canAccessDashboard = ['super_admin', 'isp_admin', 'billing_finance', 'customer_support', 'sales_account_manager', 'network_operations', 'infrastructure_asset', 'hotspot_admin'].includes(profile.role);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home, show: canAccessDashboard },
    { name: 'Clients', href: '/clients', icon: Users, show: canAccessDashboard },
    { name: 'Equipment', href: '/equipment', icon: Server, show: canAccessDashboard },
    { name: 'Billing', href: '/billing', icon: CreditCard, show: canAccessDashboard },
    { name: 'Support', href: '/support', icon: HeadphonesIcon, show: canAccessDashboard },
    { name: 'Network', href: '/network', icon: Wifi, show: canAccessDashboard },
    { name: 'Network Map', href: '/network-map', icon: Map, show: canAccessDashboard },
    { name: 'Network Status', href: '/network-status', icon: Zap, show: canAccessDashboard },
    { name: 'Hotspots', href: '/hotspots', icon: Wifi, show: canAccessDashboard },
    { name: 'Inventory', href: '/inventory', icon: Package, show: canAccessDashboard },
    { name: 'Messages', href: '/messages', icon: MessageSquare, show: canAccessDashboard },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, show: canAccessDashboard },
    { name: 'Invoices', href: '/invoices', icon: Receipt, show: canAccessDashboard },
    { name: 'Packages', href: '/packages', icon: Package, show: isAdmin },
    { name: 'License Management', href: '/license-management', icon: Shield, show: isAdmin },
    { name: 'Settings', href: '/settings', icon: Settings, show: isAdmin },
    { name: 'API Settings', href: '/api-settings', icon: Wrench, show: isAdmin },
    { name: 'Developer Portal', href: '/developer-portal', icon: Code, show: isAdmin },
    { name: 'API Docs', href: '/api-documentation', icon: BookOpen, show: isAdmin },
  ];

  // Super admin only link
  if (profile.role === 'super_admin') {
    navigation.push({ 
      name: 'System License Admin', 
      href: '/system-license-admin', 
      icon: Shield, 
      show: true 
    });
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 z-50 h-full bg-white dark:bg-gray-800 shadow-lg transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-16'}
        border-r border-gray-200 dark:border-gray-700
      `}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className={`font-bold text-xl text-gray-900 dark:text-gray-100 transition-opacity duration-200 ${!isOpen && 'lg:opacity-0'}`}>
            ISP Manager
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="mt-8 px-2 flex-1 overflow-y-auto">
          <div className="space-y-1">
            {navigation.filter(item => item.show).map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => {
                    // Close sidebar on mobile when navigating
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100'
                    }
                    ${!isOpen && 'lg:justify-center'}
                  `}
                >
                  <item.icon className={`
                    flex-shrink-0 h-5 w-5 transition-colors duration-200
                    ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                  `} />
                  <span className={`ml-3 transition-opacity duration-200 ${!isOpen && 'lg:opacity-0 lg:w-0'}`}>
                    {item.name}
                  </span>
                </NavLink>
              );
            })}
          </div>
        </nav>
        
        {/* Profile section */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-gray-700">
          <NavLink
            to="/profile"
            onClick={() => {
              // Close sidebar on mobile when navigating
              if (window.innerWidth < 1024) {
                onClose();
              }
            }}
            className={`
              group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200
              ${location.pathname === '/profile'
                ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100'
              }
              ${!isOpen && 'lg:justify-center'}
            `}
          >
            <User className={`
              flex-shrink-0 h-5 w-5 transition-colors duration-200
              ${location.pathname === '/profile' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
            `} />
            <span className={`ml-3 transition-opacity duration-200 ${!isOpen && 'lg:opacity-0 lg:w-0'}`}>
              Profile
            </span>
          </NavLink>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
