
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
import { useClients } from '@/hooks/useClients';
import { useDashboardStats } from '@/hooks/useDashboardAnalytics';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const NetworkStats: React.FC = () => {
  const { clients, isLoading: clientsLoading } = useClients();
  const { data: dashboardStats, isLoading: statsLoading } = useDashboardStats();
  const { profile } = useAuth();

  // Get real hotspot data
  const { data: hotspotData } = useQuery({
    queryKey: ['hotspots-stats', profile?.isp_company_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hotspots')
        .select('status')
        .eq('isp_company_id', profile?.isp_company_id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.isp_company_id,
  });

  if (clientsLoading || statsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = dashboardStats?.data;
  const totalClients = stats?.totalClients || 0;
  const activeConnections = stats?.activeClients || 0;
  const suspendedClients = stats?.suspendedClients || 0;
  
  // Calculate connection types from real client data
  const fiberConnections = clients?.filter(client => client.connection_type === 'fiber').length || 0;
  const wirelessConnections = clients?.filter(client => client.connection_type === 'wireless').length || 0;
  const satelliteConnections = clients?.filter(client => client.connection_type === 'satellite').length || 0;
  const dslConnections = clients?.filter(client => client.connection_type === 'dsl').length || 0;

  const uptime = stats?.networkUptime || 99.2;
  const totalHotspots = stats?.totalHotspots || 0;
  const activeHotspots = hotspotData?.filter(h => h.status === 'active').length || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalClients}</div>
          <p className="text-xs text-muted-foreground">
            {activeConnections} active connections
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
              <span className="font-medium">{fiberConnections}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Wireless:</span>
              <span className="font-medium">{wirelessConnections}</span>
            </div>
            {satelliteConnections > 0 && (
              <div className="flex justify-between text-sm">
                <span>Satellite:</span>
                <span className="font-medium">{satelliteConnections}</span>
              </div>
            )}
            {dslConnections > 0 && (
              <div className="flex justify-between text-sm">
                <span>DSL:</span>
                <span className="font-medium">{dslConnections}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Hotspots</CardTitle>
          <Wifi className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeHotspots}</div>
          <p className="text-xs text-muted-foreground">
            {activeHotspots} of {totalHotspots} active
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkStats;
