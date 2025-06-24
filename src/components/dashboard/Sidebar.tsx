import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import GlobalSearch from '@/components/common/GlobalSearch';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import {
  LayoutDashboard,
  Users,
  Router,
  CreditCard,
  HeadphonesIcon,
  Network,
  MapPin,
  Wifi,
  Package,
  MessageSquare,
  BarChart3,
  User,
  Settings,
  LogOut,
  Search,
  FileText,
  Monitor,
  Building2,
  MessageCircle,
  Server
} from 'lucide-react';

const Sidebar = () => {
  const { logout, profile } = useAuth();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'k',
      ctrlKey: true,
      callback: () => setSearchOpen(true),
      description: 'Open global search'
    }
  ]);

  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'isp_admin';

  const menuItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['all'] },
    { name: 'Clients', href: '/clients', icon: Users, roles: ['all'] },
    { name: 'Equipment', href: '/equipment', icon: Router, roles: ['all'] },
    { name: 'Inventory', href: '/inventory', icon: Package, roles: ['all'] },
    { name: 'Billing', href: '/billing', icon: CreditCard, roles: ['all'] },
    { name: 'Invoices', href: '/invoices', icon: FileText, roles: ['all'] },
    { name: 'Support', href: '/support', icon: HeadphonesIcon, roles: ['all'] },
    { name: 'Network', href: '/network', icon: Network, roles: ['all'] },
    { name: 'Network Map', href: '/network-map', icon: MapPin, roles: ['all'] },
    { name: 'Network Status', href: '/network-status', icon: Monitor, roles: ['all'] },
    { name: 'Hotspots', href: '/hotspots', icon: Wifi, roles: ['all'] },
    { name: 'Messages', href: '/messages', icon: MessageSquare, roles: ['all'] },
    { name: 'Communication', href: '/communication', icon: MessageCircle, roles: ['all'] },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['all'] },
    { name: 'Packages', href: '/packages', icon: Package, roles: ['admin'] },
    { name: 'Infrastructure', href: '/infrastructure', icon: Server, roles: ['admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (item.roles.includes('all')) return true;
    if (item.roles.includes('admin') && isAdmin) return true;
    return false;
  });

  return (
    <>
      <div className="h-full bg-white dark:bg-gray-900 border-r dark:border-gray-800 flex flex-col">
        {/* Logo and Company Info */}
        <div className="p-6 border-b dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/29dec1bf-11a7-44c4-b61f-4cdfe1cbdc5c.png" 
              alt="DataDefender Logo" 
              className="h-10 w-10 object-contain"
            />
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">DataDefender</h2>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Kenya Internet Services</p>
            </div>
          </div>
        </div>

        {/* Search Button */}
        <div className="px-4 py-3 border-b dark:border-gray-800">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="mr-2 h-4 w-4" />
            Search... <kbd className="ml-auto text-xs">Ctrl+K</kbd>
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <Link
              to="/profile"
              className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <User className="h-4 w-4" />
              <span>{profile?.first_name}</span>
            </Link>
            <ThemeToggle />
          </div>
          
          <div className="flex space-x-2">
            {isAdmin && (
              <Link to="/settings" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </Link>
            )}
            <Button variant="outline" size="sm" onClick={logout} className="flex-1">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
};

export default Sidebar;
