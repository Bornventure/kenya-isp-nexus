
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  Wifi,
  Activity,
  Signal,
  Router,
  RefreshCw,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface HotspotStatus {
  id: string;
  name: string;
  location: string;
  status: string;
  ip_address?: string;
  last_ping?: string;
  uptime_percentage: number;
  current_users: number;
  max_concurrent_users: number;
  bandwidth_usage: number;
  bandwidth_limit: number;
  signal_strength?: number;
  temperature?: number;
  issues: string[];
}

interface HotspotNetworkMonitorProps {
  selectedHotspot: string | null;
}

const HotspotNetworkMonitor: React.FC<HotspotNetworkMonitorProps> = ({ selectedHotspot }) => {
  const { profile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const { data: hotspotStatuses, isLoading, refetch } = useQuery({
    queryKey: ['hotspot-network-status', profile?.isp_company_id, selectedHotspot],
    queryFn: async () => {
      // Simulate network monitoring data - in real implementation, this would come from network management system
      const mockStatuses: HotspotStatus[] = [
        {
          id: '1',
          name: 'Main Plaza Hotspot',
          location: 'City Center',
          status: 'online',
          ip_address: '192.168.1.100',
          last_ping: new Date().toISOString(),
          uptime_percentage: 99.5,
          current_users: 25,
          max_concurrent_users: 50,
          bandwidth_usage: 75,
          bandwidth_limit: 100,
          signal_strength: -45,
          temperature: 45,
          issues: []
        },
        {
          id: '2',
          name: 'Coffee Shop WiFi',
          location: 'Downtown',
          status: 'warning',
          ip_address: '192.168.1.101',
          last_ping: new Date(Date.now() - 300000).toISOString(),
          uptime_percentage: 85.2,
          current_users: 12,
          max_concurrent_users: 30,
          bandwidth_usage: 90,
          bandwidth_limit: 50,
          signal_strength: -65,
          temperature: 52,
          issues: ['High bandwidth usage', 'Elevated temperature']
        },
        {
          id: '3',
          name: 'Library Access Point',
          location: 'Public Library',
          status: 'offline',
          ip_address: '192.168.1.102',
          last_ping: new Date(Date.now() - 1800000).toISOString(),
          uptime_percentage: 45.8,
          current_users: 0,
          max_concurrent_users: 40,
          bandwidth_usage: 0,
          bandwidth_limit: 75,
          signal_strength: null,
          temperature: null,
          issues: ['Device unreachable', 'Connection timeout']
        }
      ];

      return selectedHotspot 
        ? mockStatuses.filter(s => s.id === selectedHotspot)
        : mockStatuses;
    },
    enabled: !!profile?.isp_company_id,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <Wifi className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'offline': return <Router className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Network Monitoring</h3>
          <p className="text-sm text-muted-foreground">
            Real-time status and performance monitoring of your hotspots
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {hotspotStatuses?.map((hotspot) => (
          <Card key={hotspot.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(hotspot.status)}
                    <CardTitle className="text-lg">{hotspot.name}</CardTitle>
                  </div>
                  <Badge className={getStatusColor(hotspot.status)}>
                    {hotspot.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {hotspot.location}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Connection Info */}
                <div className="space-y-1">
                  <p className="text-sm font-medium">Connection</p>
                  <p className="text-sm text-muted-foreground">
                    IP: {hotspot.ip_address || 'N/A'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Uptime: {hotspot.uptime_percentage}%
                  </p>
                </div>

                {/* Users */}
                <div className="space-y-1">
                  <p className="text-sm font-medium">Users</p>
                  <p className="text-2xl font-bold">{hotspot.current_users}</p>
                  <p className="text-sm text-muted-foreground">
                    of {hotspot.max_concurrent_users} max
                  </p>
                </div>

                {/* Bandwidth */}
                <div className="space-y-1">
                  <p className="text-sm font-medium">Bandwidth</p>
                  <div className="flex items-center gap-1">
                    <p className="text-2xl font-bold">{hotspot.bandwidth_usage}</p>
                    <p className="text-sm text-muted-foreground">Mbps</p>
                    {hotspot.bandwidth_usage > hotspot.bandwidth_limit * 0.8 ? (
                      <TrendingUp className="h-4 w-4 text-red-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Limit: {hotspot.bandwidth_limit} Mbps
                  </p>
                </div>

                {/* Signal/Performance */}
                <div className="space-y-1">
                  <p className="text-sm font-medium">Performance</p>
                  {hotspot.signal_strength && (
                    <div className="flex items-center gap-1">
                      <Signal className="h-3 w-3" />
                      <span className="text-sm">{hotspot.signal_strength} dBm</span>
                    </div>
                  )}
                  {hotspot.temperature && (
                    <p className="text-sm text-muted-foreground">
                      Temp: {hotspot.temperature}°C
                    </p>
                  )}
                </div>
              </div>

              {/* Issues */}
              {hotspot.issues.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Active Issues</p>
                      <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                        {hotspot.issues.map((issue, index) => (
                          <li key={index}>• {issue}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Last Update */}
              <div className="mt-4 text-xs text-muted-foreground">
                Last ping: {hotspot.last_ping ? new Date(hotspot.last_ping).toLocaleString() : 'Never'}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!hotspotStatuses || hotspotStatuses.length === 0) && (
        <div className="text-center py-12">
          <Router className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hotspots to monitor</h3>
          <p className="text-gray-500">
            Add hotspots to start monitoring their network status and performance.
          </p>
        </div>
      )}
    </div>
  );
};

export default HotspotNetworkMonitor;
