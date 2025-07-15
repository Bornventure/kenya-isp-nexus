
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useClientAuth } from '@/contexts/ClientAuthContext';
import { useAutoRenewal } from '@/hooks/useAutoRenewal';
import { formatKenyanCurrency } from '@/utils/kenyanValidation';
import { 
  Wallet, 
  Wifi, 
  Calendar, 
  CreditCard,
  TrendingUp,
  Globe,
  Settings,
  FileText
} from 'lucide-react';
import ServiceStatusCard from './ServiceStatusCard';
import ExpiryCountdown from './ExpiryCountdown';

interface ClientDashboardProps {
  onTabChange: (tab: string) => void;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ onTabChange }) => {
  const { client } = useClientAuth();
  
  // Initialize auto-renewal monitoring
  useAutoRenewal();

  if (!client) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading client data...</p>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      title: 'Top Up Wallet',
      description: 'Add funds to your account',
      icon: Wallet,
      action: () => onTabChange('wallet'),
      color: 'bg-blue-500'
    },
    {
      title: 'View Invoices',
      description: 'Check your billing history',
      icon: FileText,
      action: () => onTabChange('invoices'),
      color: 'bg-green-500'
    },
    {
      title: 'Renew Package',
      description: 'Extend your subscription',
      icon: Calendar,
      action: () => onTabChange('invoices'),
      color: 'bg-purple-500'
    },
    {
      title: 'Get Support',
      description: 'Contact our support team',
      icon: Settings,
      action: () => onTabChange('support'),
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Welcome back, {client.name}!</h2>
        <p className="text-muted-foreground">
          Here's an overview of your account and services
        </p>
      </div>

      {/* Account Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatKenyanCurrency(client.wallet_balance)}</div>
            <p className="text-xs text-muted-foreground">
              Available for services
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Service Status</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{client.status}</div>
            <p className="text-xs text-muted-foreground">
              Current connection status
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Rate</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatKenyanCurrency(client.monthly_rate)}</div>
            <p className="text-xs text-muted-foreground">
              {client.subscription_type || 'Monthly'} subscription
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Package</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{client.service_package?.name || 'Standard'}</div>
            <p className="text-xs text-muted-foreground">
              {client.service_package?.speed || 'Standard speed'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Service Status and Expiry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ServiceStatusCard />
        <ExpiryCountdown />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={action.action}
              >
                <div className={`p-2 rounded-full ${action.color} text-white`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDashboard;
