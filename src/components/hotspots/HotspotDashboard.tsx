
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wifi, Users, Activity, TrendingUp, MapPin, Clock } from 'lucide-react';
import { Hotspot, HotspotSession, HotspotAnalytics } from '@/hooks/useHotspots';

interface HotspotDashboardProps {
  hotspots: Hotspot[];
  sessions: HotspotSession[];
  analytics: HotspotAnalytics[];
  isLoading: boolean;
}

const HotspotDashboard: React.FC<HotspotDashboardProps> = ({
  hotspots,
  sessions,
  analytics,
  isLoading
}) => {
  const activeHotspots = hotspots.filter(h => h.status === 'active');
  const activeSessions = sessions.filter(s => s.session_status === 'active');
  const todayAnalytics = analytics.filter(a => 
    new Date(a.date).toDateString() === new Date().toDateString()
  );

  const totalRevenue = todayAnalytics.reduce((sum, a) => sum + (a.revenue_generated || 0), 0);
  const totalDataUsed = todayAnalytics.reduce((sum, a) => sum + (a.total_data_used_gb || 0), 0);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real-time Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Hotspots</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeHotspots.length}</div>
            <p className="text-xs text-muted-foreground">
              of {hotspots.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSessions.length}</div>
            <p className="text-xs text-muted-foreground">
              users connected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              from guest access
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDataUsed.toFixed(1)} GB</div>
            <p className="text-xs text-muted-foreground">
              today's total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessions.slice(0, 5).map((session) => (
                <div key={session.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        session.session_status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                      <span className="text-sm font-medium">
                        {session.session_type === 'client' ? 'Client' : 'Guest'}
                      </span>
                    </div>
                    <Badge variant={session.session_status === 'active' ? 'default' : 'secondary'}>
                      {session.session_status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {session.data_used_mb} MB
                  </div>
                </div>
              ))}
              {sessions.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent sessions
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hotspot Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {hotspots.slice(0, 5).map((hotspot) => (
                <div key={hotspot.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{hotspot.name}</p>
                      <p className="text-xs text-muted-foreground">{hotspot.location}</p>
                    </div>
                  </div>
                  <Badge variant={hotspot.status === 'active' ? 'default' : 'secondary'}>
                    {hotspot.status}
                  </Badge>
                </div>
              ))}
              {hotspots.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hotspots configured
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HotspotDashboard;
