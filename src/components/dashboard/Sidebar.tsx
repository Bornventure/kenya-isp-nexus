
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
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Billing', href: '/billing', icon: CreditCard },
  { name: 'Network Map', href: '/network-map', icon: Network },
  { name: 'Equipment', href: '/equipment', icon: Laptop },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Network Status', href: '/network', icon: Wifi },
  { name: 'Support', href: '/support', icon: HeadphonesIcon },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const Sidebar = () => {
  const { logout, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

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

      {/* User Info */}
      {profile && (
        <div className="px-4 py-3 border-b bg-white">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Building2 className="h-4 w-4 text-blue-600" />
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
