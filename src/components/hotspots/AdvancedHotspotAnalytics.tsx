
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Wifi, 
  DollarSign,
  Clock,
  BarChart3,
  PieChart
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';
import { useHotspotAnalytics } from '@/hooks/useHotspots';

interface AdvancedHotspotAnalyticsProps {
  selectedHotspot: string | null;
}

const AdvancedHotspotAnalytics: React.FC<AdvancedHotspotAnalyticsProps> = ({ selectedHotspot }) => {
  const { data: analyticsData, isLoading } = useHotspotAnalytics();
  const [timeRange, setTimeRange] = useState('7d');
  const [viewType, setViewType] = useState('overview');

  // Filter data by selected hotspot if specified
  const filteredData = selectedHotspot 
    ? analyticsData?.filter(item => item.hotspot_id === selectedHotspot)
    : analyticsData;

  // Mock chart data - in real implementation, this would be processed from analytics data
  const usageData = [
    { date: '2024-01-01', sessions: 45, users: 32, data: 2.1, revenue: 850 },
    { date: '2024-01-02', sessions: 52, users: 38, data: 2.8, revenue: 920 },
    { date: '2024-01-03', sessions: 38, users: 29, data: 1.9, revenue: 780 },
    { date: '2024-01-04', sessions: 61, users: 42, data: 3.2, revenue: 1100 },
    { date: '2024-01-05', sessions: 49, users: 35, data: 2.4, revenue: 890 },
    { date: '2024-01-06', sessions: 67, users: 48, data: 3.8, revenue: 1250 },
    { date: '2024-01-07', sessions: 73, users: 52, data: 4.1, revenue: 1350 }
  ];

  const deviceTypeData = [
    { name: 'Mobile', value: 65, count: 156 },
    { name: 'Laptop', value: 25, count: 60 },
    { name: 'Tablet', value: 10, count: 24 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Advanced Analytics</h3>
          <p className="text-sm text-muted-foreground">
            {selectedHotspot ? 'Hotspot-specific analytics' : 'Comprehensive hotspot performance analytics'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewType === 'overview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewType('overview')}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </Button>
          <Button
            variant={viewType === 'detailed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewType('detailed')}
          >
            <PieChart className="h-4 w-4 mr-2" />
            Detailed
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                <p className="text-2xl font-bold">385</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center text-sm text-green-600 mt-2">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.5% from last week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unique Users</p>
                <p className="text-2xl font-bold">276</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex items-center text-sm text-green-600 mt-2">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8.3% from last week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Data Usage</p>
                <p className="text-2xl font-bold">18.3 GB</p>
              </div>
              <Wifi className="h-8 w-8 text-purple-500" />
            </div>
            <div className="flex items-center text-sm text-red-600 mt-2">
              <TrendingDown className="h-3 w-3 mr-1" />
              -2.1% from last week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">KES 7,140</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center text-sm text-green-600 mt-2">
              <TrendingUp className="h-3 w-3 mr-1" />
              +15.7% from last week
            </div>
          </CardContent>
        </Card>
      </div>

      {viewType === 'overview' ? (
        <>
          {/* Usage Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sessions" stroke="#8884d8" />
                  <Line type="monotone" dataKey="users" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Daily Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Device Types Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Device Types</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={deviceTypeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {deviceTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Peak Hours */}
            <Card>
              <CardHeader>
                <CardTitle>Peak Usage Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { hour: '9:00 AM', usage: 85, sessions: 42 },
                    { hour: '1:00 PM', usage: 92, sessions: 38 },
                    { hour: '6:00 PM', usage: 78, sessions: 35 },
                    { hour: '8:00 PM', usage: 95, sessions: 48 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{item.hour}</p>
                        <p className="text-sm text-muted-foreground">{item.sessions} sessions</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${item.usage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{item.usage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default AdvancedHotspotAnalytics;
