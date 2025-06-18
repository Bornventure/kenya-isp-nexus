
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Network,
  Laptop,
  FileText,
  BarChart3,
  Wifi,
  HeadphonesIcon,
  Settings,
  LogOut,
  Building2,
  Package,
  TrendingUp,
  Shield,
  DollarSign,
  Wrench
} from 'lucide-react';

const Sidebar = () => {
  const { logout, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Role-based navigation
  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['all'] }
    ];

    const roleBasedItems = [
      // Customer Support Representative
      { name: 'Support', href: '/support', icon: HeadphonesIcon, roles: ['customer_support', 'super_admin', 'isp_admin'] },
      { name: 'Clients', href: '/clients', icon: Users, roles: ['customer_support', 'sales_manager', 'super_admin', 'isp_admin'] },
      { name: 'Network Status', href: '/network', icon: Wifi, roles: ['customer_support', 'network_engineer', 'super_admin', 'isp_admin'] },

      // Sales & Account Manager
      { name: 'Analytics', href: '/analytics', icon: TrendingUp, roles: ['sales_manager', 'super_admin', 'isp_admin'] },

      // Billing & Finance Administrator
      { name: 'Billing', href: '/billing', icon: DollarSign, roles: ['billing_admin', 'super_admin', 'isp_admin'] },
      { name: 'Invoices', href: '/invoices', icon: FileText, roles: ['billing_admin', 'super_admin', 'isp_admin'] },

      // Network Operations Engineer
      { name: 'Network Map', href: '/network-map', icon: Network, roles: ['network_engineer', 'super_admin', 'isp_admin'] },
      { name: 'Equipment', href: '/equipment', icon: Laptop, roles: ['network_engineer', 'infrastructure_manager', 'super_admin', 'isp_admin'] },

      // Infrastructure & Asset Manager
      { name: 'Inventory', href: '/inventory', icon: Package, roles: ['infrastructure_manager', 'super_admin', 'isp_admin'] },

      // Hotspot Administrator
      { name: 'Hotspots', href: '/hotspots', icon: Wifi, roles: ['hotspot_admin', 'super_admin', 'isp_admin'] },

      // Super Admin / System Administrator
      { name: 'Settings', href: '/settings', icon: Settings, roles: ['super_admin', 'isp_admin'] }
    ];

    const filteredItems = roleBasedItems.filter(item => 
      item.roles.includes('all') || 
      item.roles.includes(profile?.role || '') ||
      profile?.role === 'super_admin' ||
      profile?.role === 'isp_admin'
    );

    return [...baseItems, ...filteredItems];
  };

  const navigation = getNavigationItems();

  // Role-based styling
  const getRoleColor = () => {
    switch (profile?.role) {
      case 'customer_support': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'sales_manager': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'billing_admin': return 'text-green-600 bg-green-100 border-green-200';
      case 'network_engineer': return 'text-indigo-600 bg-indigo-100 border-indigo-200';
      case 'infrastructure_manager': return 'text-teal-600 bg-teal-100 border-teal-200';
      case 'hotspot_admin': return 'text-cyan-600 bg-cyan-100 border-cyan-200';
      case 'super_admin': 
      case 'isp_admin': return 'text-slate-600 bg-slate-100 border-slate-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getRoleIcon = () => {
    switch (profile?.role) {
      case 'customer_support': return HeadphonesIcon;
      case 'sales_manager': return TrendingUp;
      case 'billing_admin': return DollarSign;
      case 'network_engineer': return Network;
      case 'infrastructure_manager': return Wrench;
      case 'hotspot_admin': return Wifi;
      case 'super_admin':
      case 'isp_admin': return Shield;
      default: return Building2;
    }
  };

  const RoleIcon = getRoleIcon();

  return (
    <div className="flex h-full w-64 flex-col bg-gray-50 border-r">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b px-4">
        <div className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/bfa196dc-eae7-40b2-826b-7a96fffbd83d.png" 
            alt="DataDefender Logo" 
            className="h-8 w-8 object-contain"
          />
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-gray-900">DataDefender</span>
            <span className="text-xs text-gray-500">Kenya Internet Services</span>
          </div>
        </div>
      </div>

      {/* User Info with Role-based styling */}
      {profile && (
        <div className="px-4 py-3 border-b bg-white">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${getRoleColor()}`}>
              <RoleIcon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {profile.first_name} {profile.last_name}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {profile.role?.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <item.icon
              className={`mr-3 h-5 w-5 flex-shrink-0`}
              aria-hidden="true"
            />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
