
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
  Shield,
  Network,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
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
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    );
  };

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);
  const closeMobileSidebar = () => setIsMobileOpen(false);

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
      name: 'Network Management',
      href: '/network-management',
      icon: Network,
      roles: ['isp_admin', 'super_admin'],
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
              "text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-800",
              depth > 0 && "ml-4",
              !isOpen && "justify-center"
            )}
          >
            <div className="flex items-center">
              <item.icon className="mr-3 h-5 w-5" />
              {(isOpen || isMobileOpen) && item.name}
            </div>
            {(isOpen || isMobileOpen) && (
              <ChevronDown 
                className={cn(
                  "h-4 w-4 transition-transform",
                  isExpanded && "rotate-180"
                )} 
              />
            )}
          </button>
          {isExpanded && (isOpen || isMobileOpen) && (
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
        onClick={closeMobileSidebar}
        className={({ isActive }) =>
          cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
            isActive
              ? "bg-primary text-primary-foreground"
              : "text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-800",
            depth > 0 && "ml-8",
            !isOpen && "justify-center"
          )
        }
        title={!isOpen ? item.name : undefined}
      >
        <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
        {(isOpen || isMobileOpen) && (
          <span className="truncate">
            {item.name}
          </span>
        )}
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Mobile toggle button */}
      <button
        onClick={toggleMobileSidebar}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg"
      >
        {isMobileOpen ? (
          <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        ) : (
          <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        )}
      </button>

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-50 transition-all duration-300 ease-in-out flex flex-col",
        // Desktop behavior
        "hidden lg:flex",
        isOpen ? "lg:w-64" : "lg:w-16",
        // Mobile behavior
        "lg:relative lg:translate-x-0",
        isMobileOpen ? "flex w-64 lg:hidden" : "lg:flex"
      )}>
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          {/* Header with logo and toggle */}
          <div className="flex items-center justify-between px-4 mb-8">
            <div className={cn(
              "flex items-center transition-opacity duration-200",
              (!isOpen && !isMobileOpen) ? "opacity-0" : "opacity-100"
            )}>
              <img 
                src="/lovable-uploads/29dec1bf-11a7-44c4-b61f-4cdfe1cbdc5c.png" 
                alt="DataDefender Logo" 
                className="h-8 w-8 object-contain flex-shrink-0"
              />
              {(isOpen || isMobileOpen) && (
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-gray-100">DataDefender</span>
              )}
            </div>
            
            {/* Desktop toggle button */}
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isOpen ? (
                <ChevronLeft className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-500" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            {menuItems.map(item => renderMenuItem(item))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
