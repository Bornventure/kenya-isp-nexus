
import React from 'react';
import { useClientAuth } from '@/contexts/ClientAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  LayoutDashboard, 
  Wallet, 
  FileText, 
  Headphones, 
  User, 
  LogOut,
  Wifi,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClientDashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'invoices', label: 'Invoices', icon: FileText },
  { id: 'support', label: 'Support', icon: Headphones },
  { id: 'profile', label: 'Profile', icon: User },
];

const ClientDashboardLayout: React.FC<ClientDashboardLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
}) => {
  const { client, logout, refreshClientData } = useClientAuth();

  if (!client) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Wifi className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Client Portal</h1>
                <p className="text-sm text-gray-500">Welcome, {client.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
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
            <Card>
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
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboardLayout;
