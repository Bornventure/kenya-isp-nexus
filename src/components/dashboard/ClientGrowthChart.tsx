
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useClientGrowthData } from '@/hooks/useDashboardAnalytics';

const ClientGrowthChart = () => {
  const { data: growthData, isLoading } = useClientGrowthData(6); // Last 6 months

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

  // Transform data for chart
  const chartData = growthData?.data?.map(item => ({
    month: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short' }),
    new_clients: item.new_clients,
    total_clients: item.total_clients
  })) || [];

  // Show message if no data
  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Client Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground">No client data available</p>
              <p className="text-sm text-muted-foreground mt-2">
                Add clients to see growth trends
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
        <CardTitle>Client Growth</CardTitle>
        <p className="text-sm text-muted-foreground">
          New and total clients over the last 6 months
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
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
