
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Wifi, 
  Users, 
  Activity, 
  TrendingUp,
  MapPin,
  Settings,
  Zap,
  BarChart3
} from 'lucide-react';
import { useHotspots, useHotspotSessions, useHotspotAnalytics } from '@/hooks/useHotspots';

const HotspotAdminDashboard = () => {
  const { data: hotspots = [], isLoading: hotspotsLoading } = useHotspots();
  const { data: sessions = [], isLoading: sessionsLoading } = useHotspotSessions();
  const { data: analytics = [], isLoading: analyticsLoading } = useHotspotAnalytics();

  const activeHotspots = hotspots.filter(h => h.status === 'active');
  const activeSessions = sessions.filter(s => s.session_status === 'active');
  const todayAnalytics = analytics.filter(a => 
    new Date(a.date).toDateString() === new Date().toDateString()
  );

  const totalRevenue = todayAnalytics.reduce((sum, a) => sum + (a.revenue_generated || 0), 0);
  const totalDataUsed = todayAnalytics.reduce((sum, a) => sum + (a.total_data_mb || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Wifi className="h-6 w-6 text-cyan-600" />
        <h1 className="text-3xl font-bold">Hotspot Administration</h1>
      </div>

      {/* Hotspot Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-cyan-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Hotspots</p>
                <p className="text-2xl font-bold text-cyan-600">{activeHotspots.length}</p>
              </div>
              <Wifi className="h-8 w-8 text-cyan-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                <p className="text-2xl font-bold text-blue-600">{activeSessions.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Revenue</p>
                <p className="text-2xl font-bold text-green-600">KES {totalRevenue.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Data Usage</p>
                <p className="text-2xl font-bold text-orange-600">{(totalDataUsed / 1024).toFixed(1)} GB</p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hotspot Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-cyan-600" />
            Hotspot Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {hotspots.slice(0, 5).map((hotspot) => (
              <div key={hotspot.id} className="flex items-center justify-between p-3 bg-cyan-50 rounded-lg border border-cyan-100">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">{hotspot.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {hotspot.location} • Users: {activeSessions.filter(s => s.hotspot_id === hotspot.id).length}/{hotspot.max_concurrent_users}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={hotspot.status === 'active' ? 'default' : 
                            hotspot.status === 'maintenance' ? 'destructive' : 'secondary'}
                    className={hotspot.status === 'active' ? 'bg-cyan-100 text-cyan-800 border-cyan-200' : ''}
                  >
                    {hotspot.status}
                  </Badge>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {hotspot.bandwidth_limit} Mbps
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-cyan-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-cyan-50 rounded-lg border border-cyan-100">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div>
                <p className="font-medium">Voucher Management</p>
                <p className="text-sm text-muted-foreground">
                  Create and manage access vouchers
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-cyan-50 rounded-lg border border-cyan-100">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium">Session Monitoring</p>
                <p className="text-sm text-muted-foreground">
                  Monitor active user sessions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-cyan-50 rounded-lg border border-cyan-100">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <div>
                <p className="font-medium">Performance Analytics</p>
                <p className="text-sm text-muted-foreground">
                  View detailed usage analytics
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HotspotAdminDashboard;
