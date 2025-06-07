
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const chartData = [
  { month: 'Jan', clients: 1089, newClients: 45 },
  { month: 'Feb', clients: 1124, newClients: 62 },
  { month: 'Mar', clients: 1168, newClients: 78 },
  { month: 'Apr', clients: 1195, newClients: 56 },
  { month: 'May', clients: 1228, newClients: 84 },
  { month: 'Jun', clients: 1247, newClients: 89 },
];

const chartConfig = {
  clients: {
    label: 'Total Clients',
    color: 'hsl(var(--chart-1))',
  },
  newClients: {
    label: 'New Clients',
    color: 'hsl(var(--chart-2))',
  },
};

const ClientGrowthChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Growth</CardTitle>
        <p className="text-sm text-muted-foreground">
          Total clients and monthly acquisitions
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="month" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="clients"
              stroke="var(--color-clients)"
              strokeWidth={3}
              dot={{ fill: 'var(--color-clients)', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="newClients"
              stroke="var(--color-newClients)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: 'var(--color-newClients)', strokeWidth: 2 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ClientGrowthChart;
