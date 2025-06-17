
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { CalendarIcon, TrendingUp, Users, Wifi, DollarSign } from 'lucide-react';
import { HotspotAnalytics as Analytics, Hotspot } from '@/hooks/useHotspots';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface HotspotAnalyticsProps {
  analytics: Analytics[];
  hotspots: Hotspot[];
  isLoading: boolean;
  selectedHotspot: string | null;
}

const HotspotAnalytics: React.FC<HotspotAnalyticsProps> = ({
  analytics,
  hotspots,
  isLoading,
  selectedHotspot
}) => {
  const [timeRange, setTimeRange] = useState('7');
  const [metricType, setMetricType] = useState('sessions');

  const filteredAnalytics = analytics.filter(item => {
    const itemDate = new Date(item.date);
    const daysAgo = parseInt(timeRange);
    const cutoffDate = subDays(new Date(), daysAgo);
    
    const matchesTime = itemDate >= startOfDay(cutoffDate) && itemDate <= endOfDay(new Date());
    const matchesHotspot = !selectedHotspot || item.hotspot_id === selectedHotspot;
    
    return matchesTime && matchesHotspot;
  });

  const chartData = filteredAnalytics.map(item => ({
    date: format(new Date(item.date), 'MMM dd'),
    sessions: item.total_sessions,
    users: item.unique_users,
    revenue: item.revenue_generated,
    data: parseFloat(item.total_data_used_gb.toString()),
    uptime: item.uptime_percentage
  }));

  const sessionTypeData = filteredAnalytics.reduce((acc, item) => {
    acc.client += item.client_sessions || 0;
    acc.guest += item.guest_sessions || 0;
    acc.voucher += item.voucher_sessions || 0;
    return acc;
  }, { client: 0, guest: 0, voucher: 0 });

  const pieData = [
    { name: 'Client Sessions', value: sessionTypeData.client, color: '#3B82F6' },
    { name: 'Guest Sessions', value: sessionTypeData.guest, color: '#10B981' },
    { name: 'Voucher Sessions', value: sessionTypeData.voucher, color: '#8B5CF6' }
  ].filter(item => item.value > 0);

  const totalStats = filteredAnalytics.reduce((acc, item) => ({
    totalSessions: acc.totalSessions + item.total_sessions,
    totalUsers: acc.totalUsers + item.unique_users,
    totalRevenue: acc.totalRevenue + item.revenue_generated,
    totalData: acc.totalData + parseFloat(item.total_data_used_gb.toString()),
    avgUptime: acc.avgUptime + item.uptime_percentage
  }), { totalSessions: 0, totalUsers: 0, totalRevenue: 0, totalData: 0, avgUptime: 0 });

  if (filteredAnalytics.length > 0) {
    totalStats.avgUptime = totalStats.avgUptime / filteredAnalytics.length;
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-48 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <CalendarIcon className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
            </SelectContent>
          </Select>

          <Select value={metricType} onValueChange={setMetricType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sessions">Sessions</SelectItem>
              <SelectItem value="users">Unique Users</SelectItem>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="data">Data Usage</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalSessions.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalUsers.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {totalStats.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Uptime</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.avgUptime.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Trend Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey={metricType} 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Daily Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sessions" fill="#3B82F6" name="Sessions" />
                <Bar dataKey="users" fill="#10B981" name="Users" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {filteredAnalytics.length === 0 && (
        <div className="text-center py-12">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data</h3>
          <p className="text-gray-500">
            Analytics data will appear here once your hotspots start receiving traffic.
          </p>
        </div>
      )}
    </div>
  );
};

export default HotspotAnalytics;
