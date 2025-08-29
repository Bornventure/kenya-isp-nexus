import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Wifi,
  Package,
  Monitor,
  Radio,
  Map,
  Archive,
  CreditCard,
  FileText,
  BarChart3,
  TrendingUp,
  MessageSquare,
  HelpCircle,
  Settings,
  ChevronDown,
  Building,
  UserCog,
  Database,
  Shield
} from 'lucide-react';

interface MenuItem {
  name: string;
  href?: string;
  icon: React.ComponentType<any>;
  children?: MenuItem[];
  roles?: string[];
}

const Sidebar = () => {
  const { profile } = useAuth();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(['admin']);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    );
  };

  const menuItems: MenuItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Clients',
      href: '/clients',
      icon: Users,
    },
    {
      name: 'Hotspots',
      href: '/hotspots',
      icon: Wifi,
    },
    {
      name: 'Service Packages',
      href: '/service-packages',
      icon: Package,
    },
    {
      name: 'Equipment',
      href: '/equipment',
      icon: Monitor,
    },
    {
      name: 'Base Stations',
      href: '/base-stations',
      icon: Radio,
    },
    {
      name: 'Network Map',
      href: '/network-map',
      icon: Map,
    },
    {
      name: 'Inventory',
      href: '/inventory',
      icon: Archive,
    },
    {
      name: 'Billing',
      href: '/billing',
      icon: CreditCard,
    },
    {
      name: 'Invoices',
      href: '/invoices',
      icon: FileText,
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: BarChart3,
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: TrendingUp,
    },
    {
      name: 'Messages',
      href: '/messages',
      icon: MessageSquare,
    },
    {
      name: 'Support',
      href: '/support',
      icon: HelpCircle,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
    },
    {
      name: 'Admin',
      icon: Shield,
      roles: ['super_admin', 'isp_admin'],
      children: [
        {
          name: 'User Management',
          href: '/admin/users',
          icon: UserCog,
          roles: ['super_admin', 'isp_admin'],
        },
        {
          name: 'Company Management',
          href: '/admin/companies',
          icon: Building,
          roles: ['super_admin'],
        },
        {
          name: 'System Settings',
          href: '/admin/system',
          icon: Database,
          roles: ['super_admin', 'isp_admin'],
        },
      ],
    },
  ];

  const hasAccess = (item: MenuItem) => {
    if (!item.roles) return true;
    return item.roles.includes(profile?.role || '');
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    if (!hasAccess(item)) return null;

    const isExpanded = expandedItems.includes(item.name);
    const hasChildren = item.children && item.children.length > 0;
    const isActive = item.href ? location.pathname === item.href : false;

    if (hasChildren) {
      return (
        <div key={item.name}>
          <button
            onClick={() => toggleExpanded(item.name)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
              "text-gray-700 hover:text-gray-900 hover:bg-gray-100",
              depth > 0 && "ml-4"
            )}
          >
            <div className="flex items-center">
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </div>
            <ChevronDown 
              className={cn(
                "h-4 w-4 transition-transform",
                isExpanded && "rotate-180"
              )} 
            />
          </button>
          {isExpanded && (
            <div className="mt-1 space-y-1">
              {item.children?.map(child => renderMenuItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        key={item.name}
        to={item.href!}
        className={({ isActive }) =>
          cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
            isActive
              ? "bg-primary text-primary-foreground"
              : "text-gray-700 hover:text-gray-900 hover:bg-gray-100",
            depth > 0 && "ml-8"
          )
        }
      >
        <item.icon className="mr-3 h-5 w-5" />
        {item.name}
      </NavLink>
    );
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <Shield className="h-8 w-8 text-primary" />
          <span className="ml-2 text-xl font-bold text-gray-900">DataDefender</span>
        </div>
        <nav className="mt-8 flex-1 px-3 space-y-1">
          {menuItems.map(item => renderMenuItem(item))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
