
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Network,
  FileText,
  CreditCard,
  Settings,
  HelpCircle,
  Wifi,
  Map,
  Package,
  BarChart3,
  UserCircle,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

const sidebarItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Clients',
    href: '/clients',
    icon: Users,
  },
  {
    title: 'Network Map',
    href: '/network-map',
    icon: Map,
  },
  {
    title: 'Equipment',
    href: '/equipment',
    icon: Package,
    roles: ['isp_admin', 'manager', 'technician']
  },
  {
    title: 'Billing',
    href: '/billing',
    icon: CreditCard,
    roles: ['isp_admin', 'manager', 'billing']
  },
  {
    title: 'Invoices',
    href: '/invoices',
    icon: FileText,
    roles: ['isp_admin', 'manager', 'billing']
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    roles: ['isp_admin', 'manager']
  },
  {
    title: 'Network Status',
    href: '/network',
    icon: Network,
    roles: ['isp_admin', 'manager', 'technician']
  },
  {
    title: 'Support',
    href: '/support',
    icon: HelpCircle,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: ['isp_admin', 'manager']
  },
];

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const filteredItems = sidebarItems.filter(item => 
    !item.roles || item.roles.includes(user?.role || '')
  );

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Wifi className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-gray-900">ISP Portal</h2>
            <p className="text-xs text-gray-500">{user?.company}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {filteredItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-3 p-2">
          <UserCircle className="h-8 w-8 text-gray-400" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.role.replace('_', ' ').toUpperCase()}
            </p>
          </div>
        </div>
        <Button
          onClick={logout}
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
