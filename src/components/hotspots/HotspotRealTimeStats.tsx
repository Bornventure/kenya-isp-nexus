
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Wifi,
  TrendingUp,
  Activity,
  Download,
  Upload,
  Clock,
  Signal
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface RealTimeData {
  timestamp: string;
  activeUsers: number;
  bandwidth: number;
  dataTransfer: number;
  signalStrength: number;
}

interface HotspotRealTimeStatsProps {
  selectedHotspot: string | null;
}

const HotspotRealTimeStats: React.FC<HotspotRealTimeStatsProps> = ({ selectedHotspot }) => {
  const [realTimeData, setRealTimeData] = useState<RealTimeData[]>([]);
  const [currentStats, setCurrentStats] = useState({
    activeUsers: 0,
    totalBandwidth: 0,
    dataTransferRate: 0,
    avgSignalStrength: 0,
    uptime: 0
  });

  // Simulate real-time data updates
  useEffect(() => {
    const generateDataPoint = (): RealTimeData => ({
      timestamp: new Date().toLocaleTimeString(),
      activeUsers: Math.floor(Math.random() * 50) + 10,
      bandwidth: Math.floor(Math.random() * 80) + 20,
      dataTransfer: Math.floor(Math.random() * 1000) + 100,
      signalStrength: Math.floor(Math.random() * 20) - 70
    });

    // Initialize with some data
    const initialData = Array.from({ length: 20 }, () => generateDataPoint());
    setRealTimeData(initialData);

    const interval = setInterval(() => {
      const newDataPoint = generateDataPoint();
      
      setRealTimeData(prev => {
        const updated = [...prev.slice(-19), newDataPoint];
        return updated;
      });

      // Update current stats
      setCurrentStats({
        activeUsers: newDataPoint.activeUsers,
        totalBandwidth: newDataPoint.bandwidth,
        dataTransferRate: newDataPoint.dataTransfer,
        avgSignalStrength: newDataPoint.signalStrength,
        uptime: Math.random() * 100
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedHotspot]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Real-time Statistics</h3>
        <p className="text-sm text-muted-foreground">
          Live performance metrics and usage statistics
        </p>
      </div>

      {/* Current Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{currentStats.activeUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bandwidth</p>
                <p className="text-2xl font-bold">{currentStats.totalBandwidth}</p>
                <p className="text-xs text-muted-foreground">Mbps</p>
              </div>
              <Wifi className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Data Transfer</p>
                <p className="text-2xl font-bold">{formatBytes(currentStats.dataTransferRate * 1024)}</p>
                <p className="text-xs text-muted-foreground">per second</p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Signal</p>
                <p className="text-2xl font-bold">{currentStats.avgSignalStrength}</p>
                <p className="text-xs text-muted-foreground">dBm</p>
              </div>
              <Signal className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Users Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={realTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="activeUsers" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bandwidth Usage Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Bandwidth Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={realTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} Mbps`, 'Bandwidth']} />
                <Area
                  type="monotone"
                  dataKey="bandwidth"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Data Transfer Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Data Transfer Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={realTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip formatter={(value) => [formatBytes(Number(value) * 1024), 'Transfer Rate']} />
                <Line 
                  type="monotone" 
                  dataKey="dataTransfer" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Signal Strength Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Signal className="h-5 w-5" />
              Signal Strength
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={realTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} dBm`, 'Signal Strength']} />
                <Line 
                  type="monotone" 
                  dataKey="signalStrength" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Status Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div>
                <p className="text-sm font-medium">Network</p>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div>
                <p className="text-sm font-medium">Authentication</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div>
                <p className="text-sm font-medium">Monitoring</p>
                <p className="text-xs text-muted-foreground">Warning</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div>
                <p className="text-sm font-medium">Uptime</p>
                <p className="text-xs text-muted-foreground">{currentStats.uptime.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HotspotRealTimeStats;
