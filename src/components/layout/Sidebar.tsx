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
  ChevronRight
} from 'lucide-react';

const Sidebar = () => {
  const { profile } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const navigationItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/', roles: ['super_admin', 'isp_admin', 'network_admin', 'sales_account_manager', 'support_agent'] },
    { icon: Users, label: 'Clients', href: '/clients', roles: ['isp_admin', 'network_admin', 'sales_account_manager'] },
    { icon: GitBranch, label: 'Workflow', href: '/workflow', roles: ['isp_admin', 'network_admin', 'sales_account_manager'] },
    { icon: Router, label: 'Equipment', href: '/equipment', roles: ['isp_admin', 'network_admin'] },
    { icon: Package, label: 'Inventory', href: '/inventory', roles: ['isp_admin', 'network_admin'] },
    { icon: CreditCard, label: 'Billing', href: '/billing', roles: ['isp_admin', 'network_admin'] },
    { icon: FileText, label: 'Invoices', href: '/invoices', roles: ['isp_admin', 'network_admin'] },
    { icon: DollarSign, label: 'Payments', href: '/payments', roles: ['isp_admin', 'network_admin'] },
    { icon: BarChart3, label: 'Analytics', href: '/analytics', roles: ['isp_admin', 'network_admin'] },
    { icon: Activity, label: 'Network Monitoring', href: '/network-monitoring', roles: ['isp_admin', 'network_admin'] },
    { icon: Wifi, label: 'Hotspots', href: '/hotspots', roles: ['isp_admin', 'network_admin'] },
    { icon: HelpCircle, label: 'Support', href: '/support', roles: ['isp_admin', 'support_agent'] },
    { icon: MessageSquare, label: 'Messaging', href: '/messaging', roles: ['isp_admin', 'network_admin', 'support_agent'] },
    { icon: FileBarChart, label: 'Reports', href: '/reports', roles: ['super_admin', 'isp_admin'] },
    { icon: Shield, label: 'Admin Panel', href: '/admin', roles: ['super_admin'] },
    { icon: Settings, label: 'Settings', href: '/settings', roles: ['super_admin', 'isp_admin'] },
  ];

  const filteredNavigation = navigationItems.filter(item => {
    if (!profile || !profile.role) return false;
    return item.roles.includes(profile.role);
  });

  return (
    <div className={cn(
      "flex flex-col h-full bg-secondary border-r",
      isCollapsed ? "w-16" : "w-60"
    )}>
      <div className="flex items-center justify-end p-4">
        <Button variant="ghost" size="icon" onClick={toggleCollapse}>
          {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>
      </div>
      <ScrollArea className="flex-1 space-y-4 p-4">
        <div className="space-y-4">
          {filteredNavigation.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={cn(
                "group flex items-center text-sm font-medium hover:text-primary hover:bg-accent p-3 rounded-md transition-colors",
                location.pathname === item.href ? "text-primary bg-accent" : "text-muted-foreground"
              )}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Sidebar;
