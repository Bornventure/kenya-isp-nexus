
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
    revenue: Number(item.revenue) / 1000, // Convert to thousands for better display
    clients: item.clients
  })) || [];

  // Show message if no data
  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground">No revenue data available</p>
              <p className="text-sm text-muted-foreground mt-2">
                Record payments to see revenue trends
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Revenue</CardTitle>
        <p className="text-sm text-muted-foreground">
          Revenue and client growth over the last 6 months
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                name === 'revenue' ? `KES ${(Number(value) * 1000).toLocaleString()}` : value,
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
