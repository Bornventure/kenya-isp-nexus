
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useClientAuth } from '@/contexts/ClientAuthContext';
import { formatKenyanCurrency } from '@/utils/kenyanValidation';
import { 
  Wifi, 
  Wallet, 
  Calendar, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Smartphone
} from 'lucide-react';
import ExpiryCountdown from './ExpiryCountdown';
import ServiceStatusCard from './ServiceStatusCard';
import WalletOverview from './WalletOverview';

interface ClientDashboardProps {
  onTabChange: (tab: string) => void;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ onTabChange }) => {
  const { client } = useClientAuth();

  if (!client) return null;

  const isLowBalance = client.wallet_balance < client.monthly_rate;
  const recentTransactions = (client.wallet_transactions || []).slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {client.name.split(' ')[0]}!</h1>
        <p className="text-gray-600 mt-2">Here's an overview of your internet service and account</p>
      </div>

      {/* Quick Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Service Status</p>
                <div className="flex items-center gap-2 mt-1">
                  {client.status === 'active' ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">Active</span>
                    </>
                  ) : client.status === 'suspended' ? (
                    <>
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-600">Suspended</span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-600">Pending</span>
                    </>
                  )}
                </div>
              </div>
              <Wifi className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Wallet Balance</p>
                <p className={`text-lg font-bold ${isLowBalance ? 'text-red-600' : 'text-green-600'}`}>
                  {formatKenyanCurrency(client.wallet_balance)}
                </p>
              </div>
              <Wallet className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Rate</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatKenyanCurrency(client.monthly_rate)}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Package</p>
                <p className="text-sm font-medium text-gray-900">
                  {client.service_package?.name || 'Standard Package'}
                </p>
                <p className="text-xs text-gray-600">
                  {client.service_package?.speed || 'N/A'}
                </p>
              </div>
              <Wifi className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Service Status & Expiry */}
        <div className="lg:col-span-2 space-y-6">
          <ServiceStatusCard />
          <ExpiryCountdown />
          
          {/* M-Pesa Payment Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Quick Payment Guide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Paybill Number:</span>
                  <span className="font-mono text-lg">{client.payment_settings?.paybill_number || '174379'}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Account Number:</span>
                  <span className="font-mono text-lg">{client.payment_settings?.account_number}</span>
                </div>
                <Button 
                  onClick={() => onTabChange('wallet')} 
                  className="w-full"
                >
                  Go to Wallet for Payment Options
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Wallet & Recent Activity */}
        <div className="space-y-6">
          <WalletOverview onCreditClick={() => onTabChange('wallet')} />

          {/* Recent Transactions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onTabChange('wallet')}
              >
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {recentTransactions.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No recent transactions</p>
              ) : (
                <div className="space-y-3">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{transaction.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`text-sm font-medium ${
                        transaction.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.transaction_type === 'credit' ? '+' : '-'}
                        {formatKenyanCurrency(transaction.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => onTabChange('wallet')}
              >
                <Wallet className="h-4 w-4 mr-2" />
                Top Up Wallet
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => onTabChange('invoices')}
              >
                <FileText className="h-4 w-4 mr-2" />
                View Invoices
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => onTabChange('support')}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Get Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
