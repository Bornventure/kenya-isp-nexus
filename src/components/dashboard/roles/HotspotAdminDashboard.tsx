
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Wifi, 
  Users, 
  Activity, 
  DollarSign,
  MapPin,
  Signal,
  Clock,
  Ticket
} from 'lucide-react';
import { useHotspots, useHotspotSessions, useHotspotAnalytics } from '@/hooks/useHotspots';

const HotspotAdminDashboard = () => {
  const { data: hotspots } = useHotspots();
  const { data: sessions } = useHotspotSessions();
  const { data: analytics } = useHotspotAnalytics();

  const activeHotspots = hotspots?.filter(h => h.status === 'active').length || 0;
  const activeSessions = sessions?.filter(s => s.session_status === 'active').length || 0;
  const todaysRevenue = analytics?.reduce((sum, a) => sum + (a.revenue_generated || 0), 0) || 0;
  const totalUsers = sessions?.length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Wifi className="h-6 w-6 text-cyan-600" />
        <h1 className="text-3xl font-bold">Hotspot Administration Dashboard</h1>
      </div>

      {/* Hotspot Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-cyan-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Hotspots</p>
                <p className="text-2xl font-bold text-cyan-600">{activeHotspots}</p>
              </div>
              <Wifi className="h-8 w-8 text-cyan-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                <p className="text-2xl font-bold text-green-600">{activeSessions}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Revenue</p>
                <p className="text-2xl font-bold text-purple-600">KES {todaysRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-orange-600">{totalUsers}</p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hotspot Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-cyan-600" />
            Hotspot Locations Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {hotspots?.slice(0, 5).map((hotspot) => (
              <div key={hotspot.id} className="flex items-center justify-between p-3 bg-cyan-50 rounded-lg border border-cyan-100">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    hotspot.status === 'active' ? 'bg-green-500' :
                    hotspot.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <p className="font-medium">{hotspot.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {hotspot.location} • {hotspot.current_users}/{hotspot.max_capacity} users
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Signal className="h-4 w-4 text-cyan-600" />
                  <Badge 
                    variant={hotspot.status === 'active' ? 'default' : 'secondary'}
                    className={hotspot.status === 'active' ? 'bg-cyan-100 text-cyan-800 border-cyan-200' : ''}
                  >
                    {hotspot.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-cyan-600" />
            Current User Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sessions?.filter(s => s.session_status === 'active').slice(0, 5).map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-cyan-50 rounded-lg border border-cyan-100">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">{session.clients?.name || 'Guest User'}</p>
                    <p className="text-sm text-muted-foreground">
                      {session.hotspots.name} • Started: {new Date(session.start_time).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="bg-cyan-100 text-cyan-800 border-cyan-200">
                    {session.session_type}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {session.data_used_mb || 0}MB used
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-cyan-600" />
              Usage Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Peak Hours Utilization</span>
                  <span>78%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-cyan-500 h-2 rounded-full" style={{width: '78%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Average Session Duration</span>
                  <span>45 min</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-cyan-500 h-2 rounded-full" style={{width: '65%'}}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-cyan-600" />
              Access Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-cyan-50 rounded border border-cyan-100">
                <span className="text-sm">Subscribed Clients</span>
                <span className="text-sm font-medium text-cyan-600">65%</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-cyan-50 rounded border border-cyan-100">
                <span className="text-sm">Guest Access</span>
                <span className="text-sm font-medium text-cyan-600">25%</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-cyan-50 rounded border border-cyan-100">
                <span className="text-sm">Voucher Users</span>
                <span className="text-sm font-medium text-cyan-600">10%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HotspotAdminDashboard;
