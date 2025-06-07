
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const paymentData = [
  { month: 'Jan', mpesa: 1200000, bank: 800000, cash: 200000 },
  { month: 'Feb', mpesa: 1350000, bank: 750000, cash: 180000 },
  { month: 'Mar', mpesa: 1500000, bank: 900000, cash: 220000 },
  { month: 'Apr', mpesa: 1400000, bank: 850000, cash: 190000 },
  { month: 'May', mpesa: 1600000, bank: 950000, cash: 250000 },
  { month: 'Jun', mpesa: 1750000, bank: 1000000, cash: 280000 },
];

const paymentMethodData = [
  { name: 'M-Pesa', value: 65, color: '#22c55e' },
  { name: 'Bank Transfer', value: 30, color: '#3b82f6' },
  { name: 'Cash', value: 5, color: '#f59e0b' },
];

const recentPayments = [
  {
    id: 'PAY-001',
    client: 'John Doe',
    amount: 3500,
    method: 'M-Pesa',
    date: '2024-01-15',
    status: 'completed',
    reference: 'QA12345678'
  },
  {
    id: 'PAY-002',
    client: 'Tech Solutions Ltd',
    amount: 15000,
    method: 'Bank Transfer',
    date: '2024-01-14',
    status: 'completed',
    reference: 'BNK987654321'
  },
  {
    id: 'PAY-003',
    client: 'Mary Johnson',
    amount: 2200,
    method: 'M-Pesa',
    date: '2024-01-13',
    status: 'pending',
    reference: 'QA87654321'
  },
];

const chartConfig = {
  mpesa: {
    label: 'M-Pesa',
    color: 'hsl(var(--chart-1))',
  },
  bank: {
    label: 'Bank Transfer',
    color: 'hsl(var(--chart-2))',
  },
  cash: {
    label: 'Cash',
    color: 'hsl(var(--chart-3))',
  },
};

const PaymentTracker = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'M-Pesa':
        return 'bg-green-100 text-green-800';
      case 'Bank Transfer':
        return 'bg-blue-100 text-blue-800';
      case 'Cash':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Payment Methods Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px]">
            <PieChart>
              <Pie
                data={paymentMethodData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {paymentMethodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value: number) => [`${value}%`, '']}
              />
            </PieChart>
          </ChartContainer>
          <div className="mt-4 space-y-2">
            {paymentMethodData.map((method) => (
              <div key={method.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: method.color }}
                  />
                  <span className="text-sm">{method.name}</span>
                </div>
                <span className="text-sm font-medium">{method.value}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Payments Trend */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Monthly Payments by Method</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px]">
            <BarChart data={paymentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value: number) => [`KES ${value.toLocaleString()}`, '']}
              />
              <Bar dataKey="mpesa" stackId="a" fill="var(--color-mpesa)" />
              <Bar dataKey="bank" stackId="a" fill="var(--color-bank)" />
              <Bar dataKey="cash" stackId="a" fill="var(--color-cash)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium">{payment.client}</p>
                      <p className="text-sm text-gray-500">
                        {payment.date} • {payment.reference}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge className={getMethodColor(payment.method)}>
                    {payment.method}
                  </Badge>
                  <Badge className={getStatusColor(payment.status)}>
                    {payment.status}
                  </Badge>
                  <div className="text-right">
                    <p className="font-semibold">KES {payment.amount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentTracker;
