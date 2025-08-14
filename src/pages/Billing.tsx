
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DollarSign, 
  CreditCard, 
  Users, 
  TrendingUp,
  Calendar,
  Search,
  Filter,
  Download,
  Plus,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useClients } from '@/hooks/useClients';

const Billing = () => {
  const { clients } = useClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Calculate billing metrics
  const totalRevenue = clients.reduce((sum, client) => sum + client.monthly_rate, 0);
  const averageRevenue = clients.length > 0 ? totalRevenue / clients.length : 0;
  const activeClients = clients.filter(c => c.status === 'active').length;
  const pendingPayments = clients.filter(c => c.balance < 0).length;

  // Mock billing data
  const recentTransactions = [
    {
      id: 1,
      client: 'John Doe',
      amount: 2500,
      method: 'M-Pesa',
      status: 'completed',
      date: '2024-01-15',
      reference: 'MP240115001'
    },
    {
      id: 2,
      client: 'Jane Smith',
      amount: 5000,
      method: 'Bank Transfer',
      status: 'pending',
      date: '2024-01-15',
      reference: 'BT240115002'
    },
    {
      id: 3,
      client: 'Mike Johnson',
      amount: 3500,
      method: 'M-Pesa',
      status: 'completed',
      date: '2024-01-14',
      reference: 'MP240114003'
    },
    {
      id: 4,
      client: 'Sarah Wilson',
      amount: 4000,
      method: 'Cash',
      status: 'completed',
      date: '2024-01-14',
      reference: 'CA240114004'
    }
  ];

  const outstandingInvoices = [
    {
      id: 1,
      client: 'ABC Company',
      amount: 15000,
      dueDate: '2024-01-20',
      daysOverdue: 5,
      invoiceNumber: 'INV-001234'
    },
    {
      id: 2,
      client: 'XYZ Corp',
      amount: 8500,
      dueDate: '2024-01-18',
      daysOverdue: 7,
      invoiceNumber: 'INV-001235'
    },
    {
      id: 3,
      client: 'Tech Solutions',
      amount: 12000,
      dueDate: '2024-01-22',
      daysOverdue: 3,
      invoiceNumber: 'INV-001236'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOverdueColor = (days: number) => {
    if (days <= 7) return 'text-yellow-600';
    if (days <= 30) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing Management</h1>
          <p className="text-muted-foreground">
            Track payments, invoices, and revenue analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12.3% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Revenue per Client</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {Math.round(averageRevenue).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +5.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeClients}</div>
            <p className="text-xs text-muted-foreground">
              {clients.length - activeClients} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{pendingPayments}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Client</th>
                  <th className="text-left py-3 px-4">Amount</th>
                  <th className="text-left py-3 px-4">Method</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Reference</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{transaction.client}</td>
                    <td className="py-3 px-4">KES {transaction.amount.toLocaleString()}</td>
                    <td className="py-3 px-4">{transaction.method}</td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{new Date(transaction.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-mono text-sm">{transaction.reference}</td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Outstanding Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Outstanding Invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {outstandingInvoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">{invoice.client}</h4>
                  <p className="text-sm text-muted-foreground">Invoice: {invoice.invoiceNumber}</p>
                  <p className="text-sm text-muted-foreground">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">KES {invoice.amount.toLocaleString()}</p>
                  <p className={`text-sm font-medium ${getOverdueColor(invoice.daysOverdue)}`}>
                    {invoice.daysOverdue} days overdue
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Send Reminder
                  </Button>
                  <Button size="sm">
                    View Invoice
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Revenue chart will be displayed here</p>
              <p className="text-sm text-muted-foreground">Integration with analytics coming soon</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Billing;
