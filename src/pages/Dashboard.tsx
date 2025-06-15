
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { usePayments } from '@/hooks/usePayments';
import { useInvoices } from '@/hooks/useInvoices';
import { useWalletTransactions } from '@/hooks/useWalletTransactions';
import { formatKenyanCurrency } from '@/utils/kenyanValidation';
import RealtimeNotifications from '@/components/dashboard/RealtimeNotifications';

const Dashboard = () => {
  const { clients, isLoading: clientsLoading, getClientStats } = useClients();
  const { payments, isLoading: paymentsLoading } = usePayments();
  const { invoices, isLoading: invoicesLoading } = useInvoices();
  const { transactions, isLoading: transactionsLoading } = useWalletTransactions();

  const clientStats = getClientStats();
  
  // Calculate financial metrics
  const todaysPayments = payments.filter(p => 
    new Date(p.payment_date).toDateString() === new Date().toDateString()
  );
  const todaysRevenue = todaysPayments.reduce((sum, p) => sum + p.amount, 0);
  
  const thisMonthPayments = payments.filter(p => {
    const paymentDate = new Date(p.payment_date);
    const now = new Date();
    return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear();
  });
  const monthlyRevenue = thisMonthPayments.reduce((sum, p) => sum + p.amount, 0);

  const pendingInvoices = invoices.filter(inv => inv.status === 'pending');
  const pendingRevenue = pendingInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);

  if (clientsLoading || paymentsLoading || invoicesLoading || transactionsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <RealtimeNotifications />
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Real-time overview of your ISP operations
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold">{clientStats.totalClients}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                <Wifi className="h-3 w-3 mr-1" />
                {clientStats.activeClients} Active
              </Badge>
              <Badge variant="destructive" className="text-xs">
                <WifiOff className="h-3 w-3 mr-1" />
                {clientStats.suspendedClients} Suspended
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatKenyanCurrency(todaysRevenue)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {todaysPayments.length} payments today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatKenyanCurrency(monthlyRevenue)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {thisMonthPayments.length} payments this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Revenue</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatKenyanCurrency(pendingRevenue)}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {pendingInvoices.length} pending invoices
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Recent Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {payments.slice(0, 5).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{payment.clients?.name || 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground">
                      {payment.payment_method.toUpperCase()} • {new Date(payment.payment_date).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="font-bold text-green-600">
                    {formatKenyanCurrency(payment.amount)}
                  </p>
                </div>
              ))}
              {payments.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No payments yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Client Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Client Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Active Clients</span>
                </div>
                <span className="font-bold">{clientStats.activeClients}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Suspended Clients</span>
                </div>
                <span className="font-bold">{clientStats.suspendedClients}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Pending Activation</span>
                </div>
                <span className="font-bold">{clientStats.pendingClients}</span>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total Wallet Balance</span>
                  <span className="font-bold text-blue-600">
                    {formatKenyanCurrency(clientStats.totalRevenue)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5 text-green-600" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-medium">Payment System</p>
                <p className="text-sm text-muted-foreground">Operational</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-medium">Billing System</p>
                <p className="text-sm text-muted-foreground">Operational</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-medium">Notifications</p>
                <p className="text-sm text-muted-foreground">Operational</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
