
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useRevenueData } from '@/hooks/useDashboardAnalytics';

const RevenueChart = () => {
  const { data: revenueData, isLoading } = useRevenueData(6); // Last 6 months

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-gray-500">Loading revenue data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform data for chart
  const chartData = revenueData?.data?.map(item => ({
    month: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short' }),
    revenue: item.revenue / 1000, // Convert to thousands for better display
    clients: item.clients
  })) || [];

  // If no data, show sample data
  const displayData = chartData.length > 0 ? chartData : [
    { month: 'Jan', revenue: 245, clients: 12 },
    { month: 'Feb', revenue: 280, clients: 15 },
    { month: 'Mar', revenue: 320, clients: 18 },
    { month: 'Apr', revenue: 390, clients: 22 },
    { month: 'May', revenue: 420, clients: 25 },
    { month: 'Jun', revenue: 485, clients: 28 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Revenue</CardTitle>
        <p className="text-sm text-muted-foreground">
          {chartData.length > 0 ? 'Revenue and client growth over the last 6 months' : 'Sample data - connect clients and payments for real data'}
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={displayData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                name === 'revenue' ? `KES ${(value * 1000).toLocaleString()}` : value,
                name === 'revenue' ? 'Revenue' : 'New Clients'
              ]}
            />
            <Bar dataKey="revenue" fill="#3b82f6" name="revenue" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
