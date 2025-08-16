
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
  Router,
  MapPin,
  Archive,
  Headphones,
  UserCog,
  Building2,
} from 'lucide-react';
import {
  Sidebar as SidebarBase,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
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
    <SidebarBase>
      <SidebarHeader>
        <div className="flex items-center gap-3 p-4">
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
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive(item.href)}>
                      <NavLink to={item.href}>
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {filteredAdminItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredAdminItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton asChild isActive={isActive(item.href)}>
                        <NavLink to={item.href}>
                          <Icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-3 p-4">
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
      </SidebarFooter>
    </SidebarBase>
  );
};

export default Sidebar;
