
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LayoutDashboard, 
  Users, 
  GitBranch,
  Router, 
  Package, 
  CreditCard, 
  FileText, 
  DollarSign, 
  BarChart3, 
  Activity, 
  Wifi, 
  HelpCircle, 
  MessageSquare, 
  FileBarChart, 
  Shield, 
  Settings,
  ChevronLeft,
  ChevronRight,
  MapPin
} from 'lucide-react';

const Sidebar = () => {
  const { profile } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const navigationItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', roles: ['super_admin', 'isp_admin', 'network_admin', 'sales_account_manager', 'support_agent', 'technician'] },
    { icon: Users, label: 'Clients', href: '/clients', roles: ['super_admin', 'isp_admin', 'network_admin', 'sales_account_manager'] },
    { icon: GitBranch, label: 'Workflow', href: '/workflow', roles: ['super_admin', 'isp_admin', 'network_admin', 'sales_account_manager'] },
    { icon: Router, label: 'Equipment', href: '/equipment', roles: ['super_admin', 'isp_admin', 'network_admin'] },
    { icon: Package, label: 'Inventory', href: '/inventory', roles: ['super_admin', 'isp_admin', 'network_admin'] },
    { icon: CreditCard, label: 'Billing', href: '/billing', roles: ['super_admin', 'isp_admin', 'network_admin'] },
    { icon: BarChart3, label: 'Analytics', href: '/analytics', roles: ['super_admin', 'isp_admin', 'network_admin'] },
    { icon: Activity, label: 'Network Monitoring', href: '/network-monitoring', roles: ['super_admin', 'isp_admin', 'network_admin'] },
    { icon: MapPin, label: 'Network Map', href: '/network-map', roles: ['super_admin', 'isp_admin', 'network_admin'] },
    { icon: Wifi, label: 'Hotspots', href: '/hotspots', roles: ['super_admin', 'isp_admin', 'network_admin'] },
    { icon: HelpCircle, label: 'Support', href: '/support', roles: ['super_admin', 'isp_admin', 'support_agent'] },
    { icon: MessageSquare, label: 'Messaging', href: '/messaging', roles: ['super_admin', 'isp_admin', 'network_admin', 'support_agent'] },
    { icon: FileBarChart, label: 'Reports', href: '/reports', roles: ['super_admin', 'isp_admin'] },
    { icon: Shield, label: 'User Management', href: '/user-management', roles: ['super_admin'] },
    { icon: Shield, label: 'Company Management', href: '/company-management', roles: ['super_admin'] },
    { icon: Settings, label: 'Settings', href: '/settings', roles: ['super_admin', 'isp_admin'] },
  ];

  console.log('Sidebar - Profile data:', { 
    profileExists: !!profile, 
    role: profile?.role, 
    allProfileData: profile 
  });

  const filteredNavigation = navigationItems.filter(item => {
    if (!profile || !profile.role) {
      console.log('Sidebar - No profile or role found');
      return false;
    }
    const hasAccess = item.roles.includes(profile.role);
    console.log(`Sidebar - ${item.label}: role ${profile.role} has access: ${hasAccess}`);
    return hasAccess;
  });

  console.log('Sidebar - Filtered navigation items:', filteredNavigation.length);

  return (
    <div className={cn(
      "flex flex-col h-full bg-secondary border-r transition-all duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-60"
    )}>
      {/* Header with Company Logo/Name */}
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Wifi className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm font-bold text-foreground">NetGuard</h1>
              <p className="text-xs text-muted-foreground">ISP Management</p>
            </div>
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={toggleCollapse} className="hover:bg-accent">
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {filteredNavigation.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={cn(
                "group flex items-center text-sm font-medium rounded-lg transition-all duration-200 ease-in-out hover:bg-accent hover:text-accent-foreground",
                isCollapsed ? "p-2 justify-center" : "p-3",
                location.pathname === item.href 
                  ? "bg-accent text-accent-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn(
                "flex-shrink-0 transition-all duration-200",
                isCollapsed ? "h-5 w-5" : "h-4 w-4 mr-3"
              )} />
              {!isCollapsed && (
                <span className="transition-opacity duration-200">{item.label}</span>
              )}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </Link>
          ))}
        </div>
      </ScrollArea>

      {/* User Profile Section */}
      {!isCollapsed && (
        <div className="p-4 border-t">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-muted-foreground">
                {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {profile?.full_name || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {profile?.role?.replace('_', ' ').toUpperCase() || 'User'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
