
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const chartData = [
  { month: 'Jan', revenue: 2100000, target: 2200000 },
  { month: 'Feb', revenue: 2350000, target: 2300000 },
  { month: 'Mar', revenue: 2680000, target: 2400000 },
  { month: 'Apr', revenue: 2520000, target: 2500000 },
  { month: 'May', revenue: 2750000, target: 2600000 },
  { month: 'Jun', revenue: 2847500, target: 2700000 },
];

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'hsl(var(--chart-1))',
  },
  target: {
    label: 'Target',
    color: 'hsl(var(--chart-2))',
  },
};

const RevenueChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Trend</CardTitle>
        <p className="text-sm text-muted-foreground">
          Monthly revenue vs targets (KES)
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
            <ChartTooltip 
              content={<ChartTooltipContent />}
              formatter={(value: number) => [`KES ${value.toLocaleString()}`, '']}
            />
            <Area
              type="monotone"
              dataKey="target"
              stackId="1"
              stroke="var(--color-target)"
              fill="var(--color-target)"
              fillOpacity={0.2}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stackId="2"
              stroke="var(--color-revenue)"
              fill="var(--color-revenue)"
              fillOpacity={0.6}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
