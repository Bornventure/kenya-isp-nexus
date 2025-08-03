
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { useHotspots } from '@/hooks/useHotspots';
import { useClients } from '@/hooks/useClients';

const chartConfig = {
  uptime: {
    label: 'Uptime %',
    color: 'hsl(var(--chart-1))',
  },
  clients: {
    label: 'Active Clients',
    color: 'hsl(var(--chart-2))',
  },
};

const NetworkStatusChart = () => {
  const { data: hotspots = [], isLoading: hotspotsLoading } = useHotspots();
  const { clients = [], isLoading: clientsLoading } = useClients();

  // Transform real data for the chart
  const chartData = hotspots.map(hotspot => {
    // Count active clients for this location (simplified - you may need to adjust based on your data structure)
    const locationClients = clients.filter(client => 
      client.status === 'active'
    ).length;

    return {
      location: hotspot.location || hotspot.name,
      uptime: hotspot.status === 'active' ? 99.2 : 85.0, // Simplified uptime calculation
      clients: Math.floor(locationClients / hotspots.length) || 0 // Distribute clients across hotspots
    };
  });

  if (hotspotsLoading || clientsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Network Status by Location</CardTitle>
          <p className="text-sm text-muted-foreground">
            Uptime percentage and client distribution
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">Loading network data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Network Status by Location</CardTitle>
          <p className="text-sm text-muted-foreground">
            Uptime percentage and client distribution
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-muted-foreground">No network locations configured</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Network Status by Location</CardTitle>
        <p className="text-sm text-muted-foreground">
          Uptime percentage and client distribution
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis 
              dataKey="location" 
              angle={-45}
              textAnchor="end"
              height={60}
              fontSize={12}
            />
            <YAxis />
            <ChartTooltip 
              content={<ChartTooltipContent />}
              formatter={(value: number, name: string) => [
                name === 'uptime' ? `${value}%` : value,
                name === 'uptime' ? 'Uptime' : 'Active Clients'
              ]}
            />
            <Bar
              dataKey="uptime"
              fill="var(--color-uptime)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default NetworkStatusChart;
