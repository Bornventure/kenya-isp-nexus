
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Globe,
  HardDrive,
  BarChart3,
  Headphones,
  Settings,
  MapPin,
  FileText,
  Activity,
  Wifi,
  User,
  LogOut,
  Mail,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const Sidebar = () => {
  const { profile } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Role-based navigation items
  const getNavigationItems = () => {
    const role = profile?.role;
    
    const baseItems = [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      { name: 'Messages', href: '/messages', icon: Mail },
      { name: 'Profile', href: '/profile', icon: User },
    ];

    const adminItems = [
      { name: 'Clients', href: '/clients', icon: Users },
      { name: 'Billing', href: '/billing', icon: DollarSign },
      { name: 'Network Map', href: '/network-map', icon: Globe },
      { name: 'Equipment', href: '/equipment', icon: HardDrive },
      { name: 'Inventory', href: '/inventory', icon: HardDrive },
      { name: 'Invoices', href: '/invoices', icon: FileText },
      { name: 'Analytics', href: '/analytics', icon: BarChart3 },
      { name: 'Network Status', href: '/network', icon: Activity },
      { name: 'Support', href: '/support', icon: Headphones },
      { name: 'Hotspots', href: '/hotspots', icon: Wifi },
      { name: 'Settings', href: '/settings', icon: Settings },
    ];

    const departmentItems = {
      customer_support: [
        { name: 'Support', href: '/support', icon: Headphones },
        { name: 'Clients', href: '/clients', icon: Users },
      ],
      sales_manager: [
        { name: 'Clients', href: '/clients', icon: Users },
        { name: 'Analytics', href: '/analytics', icon: BarChart3 },
      ],
      billing_admin: [
        { name: 'Billing', href: '/billing', icon: DollarSign },
        { name: 'Invoices', href: '/invoices', icon: FileText },
        { name: 'Clients', href: '/clients', icon: Users },
      ],
      network_engineer: [
        { name: 'Network Status', href: '/network', icon: Activity },
        { name: 'Network Map', href: '/network-map', icon: Globe },
        { name: 'Equipment', href: '/equipment', icon: HardDrive },
      ],
      infrastructure_manager: [
        { name: 'Equipment', href: '/equipment', icon: HardDrive },
        { name: 'Inventory', href: '/inventory', icon: HardDrive },
        { name: 'Network Map', href: '/network-map', icon: Globe },
      ],
      hotspot_admin: [
        { name: 'Hotspots', href: '/hotspots', icon: Wifi },
        { name: 'Analytics', href: '/analytics', icon: BarChart3 },
      ],
      technician: [
        { name: 'Support', href: '/support', icon: Headphones },
        { name: 'Equipment', href: '/equipment', icon: HardDrive },
      ],
    };

    if (role === 'super_admin' || role === 'isp_admin') {
      return [...baseItems, ...adminItems];
    }

    if (role && departmentItems[role as keyof typeof departmentItems]) {
      return [...baseItems, ...departmentItems[role as keyof typeof departmentItems]];
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800">ISP Manager</h2>
        <p className="text-sm text-gray-600 mt-1">
          {profile?.first_name} {profile?.last_name}
        </p>
        <p className="text-xs text-gray-500 capitalize">
          {profile?.role?.replace('_', ' ')}
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
