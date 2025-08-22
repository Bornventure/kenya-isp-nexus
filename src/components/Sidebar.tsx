
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
  MessageSquare,
  Receipt,
  BarChart3,
  Archive,
  Monitor,
  Network,
  Radio,
  Headphones
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Clients', href: '/clients', icon: Users },
    { 
      name: 'Billing', 
      href: '/billing', 
      icon: CreditCard,
      subItems: [
        { name: 'Overview', href: '/billing' },
        { name: 'Invoices', href: '/invoices' },
        { name: 'Payments', href: '/billing/payments' },
        { name: 'Reports', href: '/billing/reports' }
      ]
    },
    { name: 'Equipment', href: '/equipment', icon: Monitor },
    { name: 'Inventory', href: '/inventory', icon: Archive },
    { name: 'Network', href: '/network', icon: Network },
    { name: 'Network Status', href: '/network-status', icon: Wifi },
    { name: 'Network Monitoring', href: '/network-monitoring', icon: Activity },
    { name: 'System Infrastructure', href: '/system-infrastructure', icon: Server },
    { name: 'Hotspots', href: '/hotspots', icon: Radio },
    { name: 'Service Packages', href: '/service-packages', icon: Package },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Messages', href: '/messages', icon: MessageSquare },
    { name: 'Support', href: '/support', icon: Headphones },
    { name: 'User Management', href: '/user-management', icon: UserCheck },
    { name: 'Company Management', href: '/company-management', icon: Building },
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
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isParentActive = hasSubItems && item.subItems.some(sub => location.pathname === sub.href);
              
              return (
                <div key={item.name}>
                  <Link
                    to={item.href}
                    className={cn(
                      (isActive || isParentActive)
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                    )}
                  >
                    <Icon
                      className={cn(
                        (isActive || isParentActive) ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500',
                        'mr-3 flex-shrink-0 h-6 w-6'
                      )}
                    />
                    {item.name}
                  </Link>
                  
                  {/* Sub-menu items */}
                  {hasSubItems && (isParentActive || isActive) && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.href}
                          className={cn(
                            location.pathname === subItem.href
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                            'group flex items-center px-2 py-1 text-sm rounded-md'
                          )}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
