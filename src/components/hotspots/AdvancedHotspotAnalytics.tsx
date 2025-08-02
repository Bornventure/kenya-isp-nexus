import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp,
  Users,
  Wifi,
  Activity,
  BarChart3,
  Globe,
  Clock,
  Download
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useHotspotAnalytics } from '@/hooks/useHotspots';

interface AdvancedHotspotAnalyticsProps {
  selectedHotspot: string | null;
}

const AdvancedHotspotAnalytics: React.FC<AdvancedHotspotAnalyticsProps> = ({ selectedHotspot }) => {
  const { data: analytics = [] } = useHotspotAnalytics();
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  const [realTimeStats, setRealTimeStats] = useState({
    activeUsers: 0,
    totalBandwidth: 0,
    networkLatency: 0,
    uptime: 99.9
  });

  const filteredAnalytics = selectedHotspot 
    ? analytics.filter(a => a.hotspot_id === selectedHotspot)
    : analytics;

  // Mock real-time data generation
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeStats({
        activeUsers: Math.floor(Math.random() * 50) + 10,
        totalBandwidth: Math.floor(Math.random() * 100) + 50,
        networkLatency: Math.floor(Math.random() * 50) + 10,
        uptime: 99.5 + Math.random() * 0.5
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Prepare chart data
  const chartData = filteredAnalytics.slice(-30).map(item => ({
    date: new Date(item.date).toLocaleDateString(),
    sessions: item.total_sessions,
    users: item.unique_users,
    data: item.total_data_mb / 1024, // Convert to GB
    revenue: item.revenue_generated,
    duration: item.avg_session_duration
  }));

  const totalStats = filteredAnalytics.reduce((acc, item) => ({
    totalSessions: acc.totalSessions + item.total_sessions,
    totalUsers: acc.totalUsers + item.unique_users,
    totalData: acc.totalData + item.total_data_mb,
    totalRevenue: acc.totalRevenue + item.revenue_generated
  }), { totalSessions: 0, totalUsers: 0, totalData: 0, totalRevenue: 0 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Advanced Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Real-time performance metrics and business intelligence
          </p>
        </div>
        <div className="flex gap-2">
          {(['24h', '7d', '30d'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {!selectedHotspot && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <p className="text-blue-800">
              Showing aggregated analytics for all hotspots. Select a specific hotspot for detailed metrics.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold text-blue-600">{realTimeStats.activeUsers}</p>
                <p className="text-xs text-green-600">+12% from last hour</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bandwidth Usage</p>
                <p className="text-2xl font-bold text-green-600">{realTimeStats.totalBandwidth} Mbps</p>
                <p className="text-xs text-green-600">85% capacity</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Network Latency</p>
                <p className="text-2xl font-bold text-orange-600">{realTimeStats.networkLatency}ms</p>
                <p className="text-xs text-green-600">Excellent</p>
              </div>
              <Globe className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                <p className="text-2xl font-bold text-purple-600">{realTimeStats.uptime.toFixed(1)}%</p>
                <p className="text-xs text-green-600">Excellent</p>
              </div>
              <Wifi className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Usage Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="sessions" stroke="#3b82f6" name="Sessions" />
              <Line type="monotone" dataKey="users" stroke="#10b981" name="Unique Users" />
              <Line type="monotone" dataKey="data" stroke="#f59e0b" name="Data (GB)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Revenue Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Revenue Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData.slice(-7)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Session Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Average Session Duration</span>
                <Badge variant="secondary">
                  {Math.round(filteredAnalytics.reduce((acc, a) => acc + a.avg_session_duration, 0) / filteredAnalytics.length || 0)} min
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Peak Concurrent Users</span>
                <Badge variant="secondary">
                  {Math.max(...filteredAnalytics.map(a => a.peak_concurrent_users))}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Data Consumed</span>
                <Badge variant="secondary">
                  {(totalStats.totalData / 1024 / 1024).toFixed(2)} TB
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Revenue</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  KES {totalStats.totalRevenue.toFixed(2)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {((totalStats.totalSessions / filteredAnalytics.length) || 0).toFixed(0)}
              </div>
              <p className="text-sm text-muted-foreground">Avg Sessions/Day</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {totalStats.totalUsers.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Total Unique Users</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {(totalStats.totalRevenue / totalStats.totalSessions || 0).toFixed(2)}
              </div>
              <p className="text-sm text-muted-foreground">Revenue per Session (KES)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedHotspotAnalytics;
