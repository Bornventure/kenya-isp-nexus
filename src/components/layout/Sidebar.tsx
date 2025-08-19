
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  Wifi,
  Package,
  Radio,
  Map,
  CreditCard,
  Receipt,
  FileText,
  BarChart3,
  MessageSquare,
  HelpCircle,
  Settings,
  Shield,
  Building2,
  Briefcase,
  UserPlus,
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

const Sidebar = () => {
  const { collapsed } = useSidebar();
  const location = useLocation();
  const { profile } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const mainMenuItems = [
    { title: 'Dashboard', url: '/', icon: LayoutDashboard },
    { title: 'Clients', url: '/clients', icon: Users },
    { title: 'Hotspots', url: '/hotspots', icon: Wifi },
    { title: 'Service Packages', url: '/service-packages', icon: Package },
    { title: 'Equipment', url: '/equipment', icon: Radio },
    { title: 'Base Stations', url: '/base-stations', icon: Radio },
    { title: 'Network Map', url: '/network-map', icon: Map },
    { title: 'Inventory', url: '/inventory', icon: Package },
  ];

  const billingItems = [
    { title: 'Billing', url: '/billing', icon: CreditCard },
    { title: 'Invoices', url: '/invoices', icon: Receipt },
    { title: 'Reports', url: '/reports', icon: FileText },
  ];

  const analyticsItems = [
    { title: 'Analytics', url: '/analytics', icon: BarChart3 },
  ];

  const supportItems = [
    { title: 'Messages', url: '/messages', icon: MessageSquare },
    { title: 'Support', url: '/support', icon: HelpCircle },
  ];

  const settingsItems = [
    { title: 'Settings', url: '/settings', icon: Settings },
  ];

  // Admin only items
  const adminItems = profile?.role === 'super_admin' ? [
    { title: 'User Management', url: '/admin/users', icon: Shield },
    { title: 'Companies', url: '/admin/companies', icon: Building2 },
    { title: 'System Settings', url: '/admin/system', icon: Settings },
  ] : [];

  const contractorItems = profile?.role === 'contractor' ? [
    { title: 'Job Assignments', url: '/contractor/jobs', icon: Briefcase },
    { title: 'Available Jobs', url: '/contractor/available', icon: UserPlus },
  ] : [];

  return (
    <ShadcnSidebar className={collapsed ? 'w-14' : 'w-60'} collapsible>
      <SidebarHeader className="border-b border-border/40 p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Shield className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-semibold">DataDefender</span>
              <span className="text-xs text-muted-foreground">ISP Management</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                          isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Billing</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {billingItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                          isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Analytics</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analyticsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                          isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Support</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {supportItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                          isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {contractorItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Contractor</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {contractorItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={({ isActive }) =>
                          `flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                            isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                          }`
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {adminItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={({ isActive }) =>
                          `flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                            isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                          }`
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                          isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40 p-4">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback>
              {profile?.first_name?.[0]}{profile?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex flex-1 flex-col">
              <span className="text-sm font-medium">
                {profile?.first_name} {profile?.last_name}
              </span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {profile?.role?.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </SidebarFooter>
    </ShadcnSidebar>
  );
};

export default Sidebar;
