
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Settings, 
  Network, 
  Monitor, 
  Package, 
  CreditCard, 
  MessageSquare,
  BarChart3,
  Shield,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Radio,
  Archive,
  FileText,
  Code,
  Calendar,
  Building2,
  Headphones,
  Key,
  Activity,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const { profile, logout } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const onToggle = () => setIsOpen(!isOpen);
  const onClose = () => setIsOpen(false);

  const handleLogout = async () => {
    await logout();
  };

  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'isp_admin';
  const canAccessDashboard = [
    'super_admin', 'isp_admin', 'billing_finance', 'customer_support', 
    'sales_account_manager', 'network_operations', 'infrastructure_asset', 'hotspot_admin'
  ].includes(profile?.role || '');

  const navigationItems = [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: Home,
      show: canAccessDashboard
    },
    { 
      name: 'Clients', 
      path: '/clients', 
      icon: Users,
      show: canAccessDashboard
    },
    { 
      name: 'Equipment', 
      path: '/equipment', 
      icon: Monitor,
      show: canAccessDashboard
    },
    { 
      name: 'Inventory', 
      path: '/inventory', 
      icon: Archive,
      show: canAccessDashboard
    },
    { 
      name: 'Network', 
      path: '/network', 
      icon: Network,
      show: canAccessDashboard
    },
    { 
      name: 'Network Map', 
      path: '/network-map', 
      icon: MapPin,
      show: canAccessDashboard
    },
    { 
      name: 'Network Status', 
      path: '/network-status', 
      icon: Activity,
      show: canAccessDashboard
    },
    { 
      name: 'Hotspots', 
      path: '/hotspots', 
      icon: Radio,
      show: canAccessDashboard
    },
    { 
      name: 'Billing', 
      path: '/billing', 
      icon: CreditCard,
      show: canAccessDashboard
    },
    { 
      name: 'Invoices', 
      path: '/invoices', 
      icon: FileText,
      show: canAccessDashboard
    },
    { 
      name: 'Support', 
      path: '/support', 
      icon: Headphones,
      show: canAccessDashboard
    },
    { 
      name: 'Messages', 
      path: '/messages', 
      icon: MessageSquare,
      show: canAccessDashboard
    },
    { 
      name: 'Analytics', 
      path: '/analytics', 
      icon: BarChart3,
      show: canAccessDashboard
    },
    { 
      name: 'Packages', 
      path: '/packages', 
      icon: Package,
      show: isAdmin
    },
    { 
      name: 'License Management', 
      path: '/license-management', 
      icon: Key,
      show: isAdmin
    },
    { 
      name: 'System License Admin', 
      path: '/system-license-admin', 
      icon: Shield,
      show: profile?.role === 'super_admin'
    },
    { 
      name: 'Developer Portal', 
      path: '/developer-portal', 
      icon: Code,
      show: isAdmin
    },
    { 
      name: 'Settings', 
      path: '/settings', 
      icon: Settings,
      show: isAdmin
    },
  ];

  const filteredItems = navigationItems.filter(item => item.show);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-50 transition-all duration-300 ease-in-out flex flex-col",
        isOpen ? "w-64" : "w-16",
        "lg:relative lg:translate-x-0"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
          <div className={cn(
            "flex items-center gap-3 transition-opacity duration-200 overflow-hidden",
            isOpen ? "opacity-100" : "opacity-0"
          )}>
            <img 
              src="/lovable-uploads/29dec1bf-11a7-44c4-b61f-4cdfe1cbdc5c.png" 
              alt="DataDefender Logo" 
              className="h-8 w-8 object-contain flex-shrink-0"
            />
            {isOpen && (
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">DataDefender</h1>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium truncate">ISP Management</p>
              </div>
            )}
          </div>
          
          {/* Toggle button - visible on desktop */}
          <button
            onClick={onToggle}
            className="hidden lg:flex p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
          >
            {isOpen ? (
              <ChevronLeft className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-500" />
            )}
          </button>
          
          {/* Close button - visible on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium relative",
                  isActive(item.path) 
                    ? "bg-blue-600 text-white" 
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                  !isOpen && "justify-center"
                )}
                title={!isOpen ? item.name : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {isOpen && (
                  <span className="truncate">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Info and Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          {isOpen ? (
            <div className="space-y-3">
              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-medium">
                    {profile?.first_name?.[0] || profile?.role?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {profile?.first_name} {profile?.last_name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {profile?.role?.replace('_', ' ')}
                  </p>
                </div>
              </div>
              
              {/* Logout Button */}
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              {/* User Avatar */}
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {profile?.first_name?.[0] || profile?.role?.[0]?.toUpperCase()}
                </span>
              </div>
              
              {/* Logout Button - Icon only */}
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
