
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Users,
  CreditCard,
  Network,
  Package,
  MessageCircle,
  Settings,
  Home,
  Wrench,
  Shield,
  Building2,
  UserCog,
  Wifi,
  Bell,
  TestTube,
  Router
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { profile } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: Home,
      roles: ['super_admin', 'isp_admin', 'network_engineer', 'support_agent', 'technician', 'sales_agent']
    },
    {
      name: 'Clients',
      href: '/clients',
      icon: Users,
      roles: ['super_admin', 'isp_admin', 'network_engineer', 'support_agent', 'sales_agent']
    },
    {
      name: 'Billing',
      href: '/billing',
      icon: CreditCard,
      roles: ['super_admin', 'isp_admin', 'network_engineer']
    },
    {
      name: 'Network',
      href: '/network',
      icon: Network,
      roles: ['super_admin', 'isp_admin', 'network_engineer']
    },
    {
      name: 'Network Management',
      href: '/network-management',
      icon: Router,
      roles: ['super_admin', 'isp_admin', 'network_engineer']
    },
    {
      name: 'Inventory',
      href: '/inventory',
      icon: Package,
      roles: ['super_admin', 'isp_admin', 'network_engineer', 'technician']
    },
    {
      name: 'Hotspot',
      href: '/hotspot',
      icon: Wifi,
      roles: ['super_admin', 'isp_admin', 'network_engineer']
    },
    {
      name: 'Support',
      href: '/support',
      icon: MessageCircle,
      roles: ['super_admin', 'isp_admin', 'support_agent', 'network_engineer']
    },
    {
      name: 'Infrastructure',
      href: '/infrastructure',
      icon: Wrench,
      roles: ['super_admin', 'isp_admin', 'network_engineer', 'technician']
    },
    {
      name: 'System Test',
      href: '/system-test',
      icon: TestTube,
      roles: ['super_admin', 'isp_admin', 'network_engineer']
    },
    {
      name: 'Notifications',
      href: '/notifications',
      icon: Bell,
      roles: ['super_admin', 'isp_admin', 'network_engineer', 'support_agent']
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      roles: ['super_admin', 'isp_admin', 'network_engineer']
    }
  ];

  const adminMenuItems = [
    {
      name: 'Super Admin',
      href: '/super-admin',
      icon: Shield,
      roles: ['super_admin']
    },
    {
      name: 'User Management',
      href: '/user-management',
      icon: UserCog,
      roles: ['super_admin', 'isp_admin']
    },
    {
      name: 'Company Management',
      href: '/company-management',
      icon: Building2,
      roles: ['super_admin']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(profile?.role || '')
  );

  const filteredAdminItems = adminMenuItems.filter(item => 
    item.roles.includes(profile?.role || '')
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-foreground">ISP Manager</h2>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                isActive(item.href)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </NavLink>
          );
        })}
        
        {filteredAdminItems.length > 0 && (
          <>
            <div className="pt-4 pb-2">
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Administration
              </h3>
            </div>
            {filteredAdminItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </NavLink>
              );
            })}
          </>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
