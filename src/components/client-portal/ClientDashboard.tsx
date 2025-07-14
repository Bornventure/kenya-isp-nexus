
import React from 'react';
import { useClientAuth } from '@/contexts/ClientAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ExpiryCountdown from './ExpiryCountdown';
import ServiceStatusCard from './ServiceStatusCard';
import { 
  Wallet, 
  FileText, 
  CreditCard, 
  TrendingUp,
  RefreshCw
} from 'lucide-react';

interface ClientDashboardProps {
  onTabChange: (tab: string) => void;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ onTabChange }) => {
  const { client, refreshClientData } = useClientAuth();

  if (!client) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  const getWalletStatus = () => {
    const balance = client.wallet_balance || 0;
    const monthlyRate = client.monthly_rate || 0;
    
    if (balance >= monthlyRate) {
      return { status: 'sufficient', color: 'text-green-600', message: 'Wallet has sufficient funds' };
    } else if (balance > 0) {
      return { status: 'partial', color: 'text-yellow-600', message: 'Wallet needs top-up' };
    }
    return { status: 'empty', color: 'text-red-600', message: 'Wallet is empty' };
  };

  const walletStatus = getWalletStatus();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {client.name}!</h1>
          <p className="text-gray-600 mt-1">Manage your internet service and account</p>
        </div>
        <Button onClick={refreshClientData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Expiry Countdown */}
      <ExpiryCountdown 
        expiryDate={client.subscription_end_date} 
        status={client.status}
      />

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Wallet Balance */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onTabChange('wallet')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(client.wallet_balance || 0)}</div>
            <p className={`text-xs ${walletStatus.color}`}>
              {walletStatus.message}
            </p>
          </CardContent>
        </Card>

        {/* Monthly Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Rate</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(client.monthly_rate)}</div>
            <p className="text-xs text-muted-foreground">
              {client.subscription_type} subscription
            </p>
          </CardContent>
        </Card>

        {/* Next Payment */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Payment</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {client.subscription_end_date 
                ? new Date(client.subscription_end_date).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })
                : 'Not set'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Due date
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Service Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ServiceStatusCard client={client} />
        
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => onTabChange('wallet')}
            >
              <Wallet className="h-4 w-4 mr-2" />
              Top Up Wallet
            </Button>
            
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => onTabChange('invoices')}
            >
              <FileText className="h-4 w-4 mr-2" />
              View Invoices
            </Button>
            
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => onTabChange('support')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Payment Instructions */}
      {client.payment_settings && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Payment Information</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="font-medium">M-Pesa Paybill Number</div>
                <div className="text-lg font-bold">{client.payment_settings.paybill_number}</div>
              </div>
              <div>
                <div className="font-medium">Account Number</div>
                <div className="text-lg font-bold">{client.payment_settings.account_number}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientDashboard;
