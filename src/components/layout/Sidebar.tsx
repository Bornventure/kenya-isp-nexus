
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
  Router,
  MapPin,
  Archive,
  FileText,
  Headphones,
  BarChart3,
  Key,
  Code,
  Database,
  Server,
  Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { profile } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Define role-based permissions
  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'isp_admin';
  
  const hasPermission = {
    clients: isAdmin || ['customer_support', 'sales_manager', 'sales_account_manager'].includes(profile?.role || ''),
    equipment: isAdmin || ['network_engineer', 'network_operations', 'infrastructure_manager', 'infrastructure_asset', 'technician'].includes(profile?.role || ''),
    inventory: isAdmin || ['infrastructure_manager', 'infrastructure_asset', 'technician'].includes(profile?.role || ''),
    network: isAdmin || ['network_engineer', 'network_operations'].includes(profile?.role || ''),
    billing: isAdmin || ['billing_admin', 'billing_finance'].includes(profile?.role || ''),
    support: isAdmin || ['customer_support'].includes(profile?.role || ''),
  };

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      show: true
    },
    {
      name: 'Clients',
      href: '/clients',
      icon: Users,
      show: hasPermission.clients
    },
    {
      name: 'Equipment',
      href: '/equipment',
      icon: Router,
      show: hasPermission.equipment
    },
    {
      name: 'Inventory',
      href: '/inventory',
      icon: Archive,
      show: hasPermission.inventory
    },
    {
      name: 'Network Management',
      href: '/network-management',
      icon: Network,
      show: hasPermission.network
    },
    {
      name: 'Network Map',
      href: '/network-map',
      icon: MapPin,
      show: hasPermission.network
    },
    {
      name: 'Billing',
      href: '/billing',
      icon: CreditCard,
      show: hasPermission.billing
    },
    {
      name: 'Support',
      href: '/support',
      icon: Headphones,
      show: hasPermission.support
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      show: isAdmin
    }
  ];

  const adminMenuItems = [
    {
      name: 'User Management',
      href: '/user-management',
      icon: UserCog,
      show: isAdmin
    },
    {
      name: 'Company Management',
      href: '/company-management',
      icon: Building2,
      show: profile?.role === 'super_admin'
    }
  ];

  const filteredMenuItems = menuItems.filter(item => item.show);
  const filteredAdminItems = adminMenuItems.filter(item => item.show);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <div className="flex items-center gap-3">
          <img 
            src="/lovable-uploads/29dec1bf-11a7-44c4-b61f-4cdfe1cbdc5c.png" 
            alt="DataDefender Logo" 
            className="h-8 w-8 object-contain"
          />
          <div>
            <h2 className="text-lg font-bold text-foreground">DataDefender</h2>
            <p className="text-xs text-blue-600 font-medium">ISP Management</p>
          </div>
        </div>
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

      {/* User Profile Section */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-medium">
              {profile?.first_name?.[0] || profile?.role?.[0]?.toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {profile?.first_name} {profile?.last_name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {profile?.role?.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
