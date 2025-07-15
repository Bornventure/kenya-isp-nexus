
import React from 'react';
import { useClientAuth } from '@/contexts/ClientAuthContext';
import { useClientRealtimeUpdates } from '@/hooks/useClientRealtimeUpdates';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { 
  LayoutDashboard, 
  Wallet, 
  FileText, 
  Headphones, 
  User, 
  LogOut,
  Wifi,
  RefreshCw,
  Files
} from 'lucide-react';
import { cn } from '@/lib/utils';
import MobileOptimizations from './MobileOptimizations';

interface ClientDashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'invoices', label: 'Invoices', icon: FileText },
  { id: 'documents', label: 'Documents', icon: Files },
  { id: 'support', label: 'Support', icon: Headphones },
  { id: 'profile', label: 'Profile', icon: User },
];

const ClientDashboardLayout: React.FC<ClientDashboardLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
}) => {
  const { client, logout, refreshClientData } = useClientAuth();

  // Enable real-time updates
  useClientRealtimeUpdates();

  if (!client) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Wifi className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Client Portal</h1>
                <p className="text-sm text-gray-500 truncate max-w-[200px]">Welcome, {client.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={refreshClientData}
                className="hidden sm:flex"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64">
            <Card className="sticky top-24">
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.id}
                        variant={activeTab === item.id ? 'default' : 'ghost'}
                        className={cn(
                          'w-full justify-start',
                          activeTab === item.id && 'bg-blue-600 text-white'
                        )}
                        onClick={() => onTabChange(item.id)}
                      >
                        <Icon className="h-4 w-4 mr-3" />
                        {item.label}
                      </Button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>

            {/* Account Status Card */}
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className={cn(
                    'inline-flex px-3 py-1 rounded-full text-xs font-medium mb-2',
                    client.status === 'active' ? 'bg-green-100 text-green-800' :
                    client.status === 'suspended' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  )}>
                    {client.status?.toUpperCase()}
                  </div>
                  <p className="text-sm text-gray-600">Account Status</p>
                  
                  {/* Quick Stats */}
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Wallet:</span>
                      <span className="font-medium">KES {client.wallet_balance?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Plan:</span>
                      <span className="font-medium">KES {client.monthly_rate?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
      </div>

      {/* Mobile Optimizations & PWA */}
      <MobileOptimizations />
    </div>
  );
};

export default ClientDashboardLayout;
