
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  DollarSign, 
  Users, 
  Activity, 
  TrendingUp,
  Download,
  Calendar,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatKenyanCurrency } from '@/utils/kenyanValidation';

const Analytics = () => {
  const { profile } = useAuth();
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });
  const [filterType, setFilterType] = useState('all');

  // Fetch real analytics data
  const { data: analyticsData, isLoading, error, refetch } = useQuery({
    queryKey: ['analytics', profile?.isp_company_id, dateRange, filterType],
    queryFn: async () => {
      if (!profile?.isp_company_id) return null;

      const startDate = dateRange.from.toISOString();
      const endDate = dateRange.to.toISOString();

      // Fetch clients data
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('isp_company_id', profile.isp_company_id)
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (clientsError) throw clientsError;

      // Fetch invoices data
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('*, clients!inner(*)')
        .eq('clients.isp_company_id', profile.isp_company_id)
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (invoicesError) throw invoicesError;

      // Fetch payments data
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*, clients!inner(*)')
        .eq('clients.isp_company_id', profile.isp_company_id)
        .gte('payment_date', startDate)
        .lte('payment_date', endDate);

      if (paymentsError) throw paymentsError;

      // Calculate metrics
      const totalRevenue = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
      const totalClients = clients?.length || 0;
      const activeClients = clients?.filter(c => c.status === 'active').length || 0;
      const suspendedClients = clients?.filter(c => c.status === 'suspended').length || 0;
      const newClients = clients?.length || 0;

      // Monthly revenue data
      const monthlyRevenue = payments?.reduce((acc: any, payment) => {
        const month = new Date(payment.payment_date).toLocaleDateString('en-US', { month: 'short' });
        acc[month] = (acc[month] || 0) + payment.amount;
        return acc;
      }, {});

      const revenueData = Object.entries(monthlyRevenue || {}).map(([month, revenue]) => ({
        month,
        revenue: revenue as number
      }));

      // Client status distribution
      const clientStatusData = [
        { name: 'Active', value: activeClients, color: '#10b981' },
        { name: 'Suspended', value: suspendedClients, color: '#ef4444' },
        { name: 'New', value: newClients, color: '#3b82f6' }
      ];

      // Payment methods distribution
      const paymentMethods = payments?.reduce((acc: any, payment) => {
        acc[payment.payment_method] = (acc[payment.payment_method] || 0) + 1;
        return acc;
      }, {});

      const paymentMethodData = Object.entries(paymentMethods || {}).map(([method, count]) => ({
        method,
        count: count as number
      }));

      return {
        totalRevenue,
        totalClients,
        activeClients,
        suspendedClients,
        newClients,
        revenueData,
        clientStatusData,
        paymentMethodData,
        invoices: invoices || [],
        payments: payments || []
      };
    },
    enabled: !!profile?.isp_company_id,
  });

  const handleExportData = () => {
    if (!analyticsData) return;

    const csvData = [
      ['Metric', 'Value'],
      ['Total Revenue', formatKenyanCurrency(analyticsData.totalRevenue)],
      ['Total Clients', analyticsData.totalClients.toString()],
      ['Active Clients', analyticsData.activeClients.toString()],
      ['Suspended Clients', analyticsData.suspendedClients.toString()],
      ['New Clients', analyticsData.newClients.toString()],
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600">Error loading analytics data</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Business insights and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <DatePickerWithRange
                date={dateRange}
                onDateChange={(range) => range && setDateRange(range)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Data</SelectItem>
                <SelectItem value="active">Active Clients Only</SelectItem>
                <SelectItem value="revenue">Revenue Focus</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatKenyanCurrency(analyticsData?.totalRevenue || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold">{analyticsData?.totalClients || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Clients</p>
                <p className="text-2xl font-bold text-green-600">{analyticsData?.activeClients || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">New Clients</p>
                <p className="text-2xl font-bold text-purple-600">{analyticsData?.newClients || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData?.revenueData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatKenyanCurrency(value as number)} />
                <Bar dataKey="revenue" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Client Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Client Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData?.clientStatusData || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {analyticsData?.clientStatusData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData?.paymentMethodData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="method" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
