
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';
import { usePayments } from '@/hooks/usePayments';
import { useInvoices } from '@/hooks/useInvoices';
import { formatKenyanCurrency } from '@/utils/kenyanValidation';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const FinancialManagement: React.FC = () => {
  const { payments, isLoading: paymentsLoading } = usePayments();
  const { invoices, isLoading: invoicesLoading } = useInvoices();
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  const isLoading = paymentsLoading || invoicesLoading;

  // Calculate financial metrics
  const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalInvoiced = invoices.reduce((sum, invoice) => sum + invoice.total_amount, 0);
  const totalPaid = invoices.filter(inv => inv.status === 'paid').reduce((sum, invoice) => sum + invoice.total_amount, 0);
  const totalOutstanding = invoices.filter(inv => inv.status !== 'paid').reduce((sum, invoice) => sum + invoice.total_amount, 0);

  // Monthly revenue data
  const monthlyRevenue = payments.reduce((acc: any, payment) => {
    const month = new Date(payment.payment_date).toLocaleDateString('en-US', { month: 'short' });
    acc[month] = (acc[month] || 0) + payment.amount;
    return acc;
  }, {});

  const revenueData = Object.entries(monthlyRevenue).map(([month, revenue]) => ({
    month,
    revenue: revenue as number
  }));

  // Payment method distribution
  const paymentMethods = payments.reduce((acc: any, payment) => {
    acc[payment.payment_method] = (acc[payment.payment_method] || 0) + 1;
    return acc;
  }, {});

  const paymentMethodData = Object.entries(paymentMethods).map(([method, count]) => ({
    name: method.toUpperCase(),
    value: count as number,
    color: method === 'mpesa' ? '#10b981' : method === 'bank' ? '#3b82f6' : '#f59e0b'
  }));

  const exportFinancialReport = () => {
    const reportData = [
      ['Financial Report'],
      ['Generated on:', new Date().toLocaleDateString()],
      [''],
      ['Summary:'],
      ['Total Revenue:', formatKenyanCurrency(totalRevenue)],
      ['Total Invoiced:', formatKenyanCurrency(totalInvoiced)],
      ['Total Paid:', formatKenyanCurrency(totalPaid)],
      ['Outstanding Amount:', formatKenyanCurrency(totalOutstanding)],
      [''],
      ['Payment Methods:'],
      ...Object.entries(paymentMethods).map(([method, count]) => [
        `${method.toUpperCase()}:`, count.toString()
      ]),
    ];

    const csvContent = reportData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `financial-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Loading financial data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Financial Management</h2>
          <p className="text-muted-foreground">
            Monitor revenue, expenses, and financial performance
          </p>
        </div>
        <Button onClick={exportFinancialReport}>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatKenyanCurrency(totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Invoiced</p>
                <p className="text-2xl font-bold">{formatKenyanCurrency(totalInvoiced)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Paid Invoices</p>
                <p className="text-2xl font-bold text-green-600">{formatKenyanCurrency(totalPaid)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold text-red-600">{formatKenyanCurrency(totalOutstanding)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
          <TabsTrigger value="payments">Payment Methods</TabsTrigger>
          <TabsTrigger value="aging">Aging Report</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatKenyanCurrency(value as number)} />
                  <Bar dataKey="revenue" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aging" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Accounts Receivable Aging</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {invoices.filter(inv => inv.status === 'paid').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Paid</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">
                      {invoices.filter(inv => inv.status === 'pending').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {invoices.filter(inv => inv.status === 'overdue').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Overdue</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-600">
                      {invoices.filter(inv => inv.status === 'draft').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Draft</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialManagement;
