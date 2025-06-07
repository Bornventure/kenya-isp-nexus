
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const chartData = [
  { location: 'Kisumu Central', uptime: 99.8, clients: 312 },
  { location: 'Kondele', uptime: 98.5, clients: 298 },
  { location: 'Mamboleo', uptime: 99.2, clients: 245 },
  { location: 'Nyalenda', uptime: 97.8, clients: 189 },
  { location: 'Dunga', uptime: 99.5, clients: 203 },
];

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
