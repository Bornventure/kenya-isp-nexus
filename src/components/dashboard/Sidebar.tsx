
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Router, 
  CreditCard, 
  MessageSquare, 
  Network,
  Wifi,
  Package2,
  Mail,
  BarChart3,
  Settings,
  User,
  Zap,
  MapPin,
  Monitor,
  Receipt,
  Package,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Sidebar = () => {
  const location = useLocation();
  const { profile } = useAuth();
  const { toast } = useToast();

  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'isp_admin';
  const canAccessDashboard = ['super_admin', 'isp_admin', 'billing_finance', 'customer_support', 'sales_account_manager', 'network_operations', 'infrastructure_asset', 'hotspot_admin'].includes(profile?.role || '');

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const menuItems = [
    ...(canAccessDashboard ? [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      { name: 'Clients', href: '/clients', icon: Users },
      { name: 'Equipment', href: '/equipment', icon: Router },
      { name: 'Billing', href: '/billing', icon: CreditCard },
      { name: 'Support', href: '/support', icon: MessageSquare },
      { name: 'Network', href: '/network', icon: Network },
      { name: 'Network Map', href: '/network-map', icon: MapPin },
      { name: 'Network Status', href: '/network-status', icon: Monitor },
      { name: 'Hotspots', href: '/hotspots', icon: Wifi },
      { name: 'Inventory', href: '/inventory', icon: Package2 },
      { name: 'Messages', href: '/messages', icon: Mail },
      { name: 'Analytics', href: '/analytics', icon: BarChart3 },
      { name: 'Invoices', href: '/invoices', icon: Receipt },
    ] : []),
    
    ...(isAdmin ? [
      { name: 'Packages', href: '/packages', icon: Package },
      { name: 'Settings', href: '/settings', icon: Settings },
    ] : []),
    
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <div className="pb-12 w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="space-y-4 py-4 flex-1">
        <div className="px-3 py-2">
          <div className="flex items-center mb-6">
            <Zap className="h-8 w-8 text-blue-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">ISP Manager</h2>
          </div>
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                  location.pathname === item.href && 'bg-blue-50 text-blue-700'
                )}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
      
      {/* Logout Button */}
      <div className="px-3 py-2 border-t border-gray-200">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        >
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
