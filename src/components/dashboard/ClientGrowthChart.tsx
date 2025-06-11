
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useRevenueData } from '@/hooks/useDashboardAnalytics';

const ClientGrowthChart = () => {
  const { data: revenueData, isLoading } = useRevenueData(6); // Last 6 months

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Client Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-gray-500">Loading growth data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform data for chart and calculate cumulative clients
  let cumulativeClients = 0;
  const chartData = revenueData?.data?.map(item => {
    cumulativeClients += item.clients;
    return {
      month: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short' }),
      new_clients: item.clients,
      total_clients: cumulativeClients
    };
  }) || [];

  // If no data, show sample data
  const displayData = chartData.length > 0 ? chartData : [
    { month: 'Jan', new_clients: 12, total_clients: 120 },
    { month: 'Feb', new_clients: 15, total_clients: 135 },
    { month: 'Mar', new_clients: 18, total_clients: 153 },
    { month: 'Apr', new_clients: 22, total_clients: 175 },
    { month: 'May', new_clients: 25, total_clients: 200 },
    { month: 'Jun', new_clients: 28, total_clients: 228 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Growth</CardTitle>
        <p className="text-sm text-muted-foreground">
          {chartData.length > 0 ? 'New and total clients over the last 6 months' : 'Sample data - add clients to see real growth data'}
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={displayData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="new_clients" 
              stroke="#10b981" 
              strokeWidth={3}
              name="New Clients"
            />
            <Line 
              type="monotone" 
              dataKey="total_clients" 
              stroke="#3b82f6" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Total Clients"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ClientGrowthChart;
