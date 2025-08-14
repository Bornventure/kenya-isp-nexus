
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Wifi,
  Activity,
  Server,
  FileText,
  Settings,
  Package,
  UserCheck,
  Building,
  MapPin,
  MessageSquare
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'Billing', href: '/billing', icon: CreditCard },
    { name: 'Network Status', href: '/network-status', icon: Wifi },
    { name: 'Network Monitoring', href: '/network-monitoring', icon: Activity },
    { name: 'System Infrastructure', href: '/system-infrastructure', icon: Server },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Inventory', href: '/inventory', icon: Package },
    { name: 'User Management', href: '/user-management', icon: UserCheck },
    { name: 'Company Management', href: '/company-management', icon: Building },
    { name: 'Hotspots', href: '/hotspots', icon: MapPin },
    { name: 'Messaging', href: '/messaging', icon: MessageSquare },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200">
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                  )}
                >
                  <Icon
                    className={cn(
                      isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500',
                      'mr-3 flex-shrink-0 h-6 w-6'
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
