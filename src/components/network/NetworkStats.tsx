
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Wifi, 
  Router, 
  Signal, 
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface NetworkStatsProps {
  stats: {
    totalClients: number;
    activeConnections: number;
    fiberConnections: number;
    wirelessConnections: number;
    suspendedClients: number;
  };
}

const NetworkStats: React.FC<NetworkStatsProps> = ({ stats }) => {
  const uptime = 99.2; // Mock uptime percentage
  const avgSpeed = 42.5; // Mock average speed in Mbps

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalClients}</div>
          <p className="text-xs text-muted-foreground">
            {stats.activeConnections} active connections
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Network Status</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{uptime}%</div>
          <p className="text-xs text-muted-foreground">Network uptime</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Connection Types</CardTitle>
          <Signal className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Fiber:</span>
              <span className="font-medium">{stats.fiberConnections}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Wireless:</span>
              <span className="font-medium">{stats.wirelessConnections}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Issues</CardTitle>
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{stats.suspendedClients}</div>
          <p className="text-xs text-muted-foreground">Suspended clients</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkStats;
