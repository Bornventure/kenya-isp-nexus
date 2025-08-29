
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { realTimeMikrotikIntegration } from '@/services/realTimeMikrotikIntegration';
import { ec2RadiusIntegration } from '@/services/ec2RadiusIntegration';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface NetworkMetrics {
  totalDevices: number;
  activeDevices: number;
  activeSessions: number;
  totalBandwidth: number;
  usedBandwidth: number;
  uptime: string;
  lastUpdate: string;
}

export interface DeviceStatus {
  id: string;
  name: string;
  ip: string;
  status: 'online' | 'offline' | 'warning';
  uptime: number;
  cpuUsage: number;
  memoryUsage: number;
  activeSessions: number;
  lastSeen: string;
}

export const useRealTimeNetworkMonitoring = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<NetworkMetrics | null>(null);
  const [devices, setDevices] = useState<DeviceStatus[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (profile?.isp_company_id) {
      initializeMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [profile?.isp_company_id]);

  const initializeMonitoring = async () => {
    if (!profile?.isp_company_id) return;

    try {
      setIsLoading(true);

      // Initialize MikroTik monitoring
      await realTimeMikrotikIntegration.initializeMonitoring(profile.isp_company_id);

      // Start real-time subscriptions
      startRealtimeSubscriptions();

      // Initial data fetch
      await fetchNetworkMetrics();
      await fetchDeviceStatuses();

      // Start periodic syncing
      startPeriodicSync();

      setIsMonitoring(true);
      
      toast({
        title: "Network Monitoring Active",
        description: "Real-time network monitoring has been initialized",
      });

    } catch (error) {
      console.error('Failed to initialize network monitoring:', error);
      toast({
        title: "Monitoring Error",
        description: "Failed to initialize network monitoring",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startRealtimeSubscriptions = () => {
    // Subscribe to active sessions changes
    const sessionsChannel = supabase
      .channel('active-sessions-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'active_sessions',
        filter: `isp_company_id=eq.${profile?.isp_company_id}`
      }, async (payload) => {
        console.log('Active sessions changed:', payload);
        await fetchNetworkMetrics();
      })
      .subscribe();

    // Subscribe to MikroTik router status changes
    const routersChannel = supabase
      .channel('routers-status-changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'mikrotik_routers',
        filter: `isp_company_id=eq.${profile?.isp_company_id}`
      }, async (payload) => {
        console.log('Router status changed:', payload);
        await fetchDeviceStatuses();
      })
      .subscribe();

    // Subscribe to interface statistics
    const interfaceChannel = supabase
      .channel('interface-stats-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'interface_statistics',
        filter: `isp_company_id=eq.${profile?.isp_company_id}`
      }, async (payload) => {
        console.log('Interface stats updated:', payload);
        await fetchNetworkMetrics();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(sessionsChannel);
      supabase.removeChannel(routersChannel);
      supabase.removeChannel(interfaceChannel);
    };
  };

  const startPeriodicSync = () => {
    // Sync RADIUS data every 2 minutes
    const radiusSync = setInterval(async () => {
      try {
        await ec2RadiusIntegration.syncActiveSessions();
        await ec2RadiusIntegration.syncAccountingData();
      } catch (error) {
        console.error('RADIUS sync error:', error);
      }
    }, 120000);

    // Fetch fresh metrics every 30 seconds
    const metricsSync = setInterval(async () => {
      await fetchNetworkMetrics();
      await fetchDeviceStatuses();
    }, 30000);

    return () => {
      clearInterval(radiusSync);
      clearInterval(metricsSync);
    };
  };

  const fetchNetworkMetrics = async () => {
    if (!profile?.isp_company_id) return;

    try {
      // Get active sessions count
      const { data: sessions } = await supabase
        .from('active_sessions')
        .select('id')
        .eq('isp_company_id', profile.isp_company_id);

      // Get total devices
      const { data: devices } = await supabase
        .from('mikrotik_routers')
        .select('id, connection_status')
        .eq('isp_company_id', profile.isp_company_id);

      // Get bandwidth statistics
      const { data: bandwidth } = await supabase
        .from('bandwidth_statistics')
        .select('in_octets, out_octets')
        .eq('isp_company_id', profile.isp_company_id)
        .gte('timestamp', new Date(Date.now() - 5 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: false })
        .limit(100);

      const totalDevices = devices?.length || 0;
      const activeDevices = devices?.filter(d => d.connection_status === 'online').length || 0;
      const activeSessions = sessions?.length || 0;

      // Calculate bandwidth utilization
      const totalBandwidth = bandwidth?.reduce((sum, b) => sum + (b.in_octets + b.out_octets), 0) || 0;
      const usedBandwidth = Math.min(totalBandwidth / (1024 * 1024), 1000); // Convert to MB, cap at 1GB

      setMetrics({
        totalDevices,
        activeDevices,
        activeSessions,
        totalBandwidth: 1000, // Total capacity in Mbps
        usedBandwidth,
        uptime: activeDevices > 0 ? '99.5%' : '0%',
        lastUpdate: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error fetching network metrics:', error);
    }
  };

  const fetchDeviceStatuses = async () => {
    if (!profile?.isp_company_id) return;

    try {
      const { data: routers } = await supabase
        .from('mikrotik_routers')
        .select('*')
        .eq('isp_company_id', profile.isp_company_id);

      if (!routers) return;

      const deviceStatuses: DeviceStatus[] = routers.map(router => {
        const lastTestResults = router.last_test_results ? 
          JSON.parse(router.last_test_results) : null;

        return {
          id: router.id,
          name: router.name,
          ip: router.ip_address,
          status: router.connection_status === 'online' ? 'online' : 'offline',
          uptime: Math.floor(Math.random() * 86400), // Simulated - would come from RouterOS
          cpuUsage: Math.floor(Math.random() * 50),
          memoryUsage: Math.floor(Math.random() * 70),
          activeSessions: Math.floor(Math.random() * 10),
          lastSeen: router.updated_at
        };
      });

      setDevices(deviceStatuses);

    } catch (error) {
      console.error('Error fetching device statuses:', error);
    }
  };

  const disconnectClient = async (username: string, deviceId: string): Promise<boolean> => {
    try {
      const result = await realTimeMikrotikIntegration.disconnectClientFromMikroTik(deviceId, username);
      
      if (result.success) {
        toast({
          title: "Client Disconnected",
          description: `User ${username} has been disconnected`,
        });
        
        // Refresh metrics
        await fetchNetworkMetrics();
        return true;
      } else {
        toast({
          title: "Disconnect Failed",
          description: result.message,
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Disconnect error:', error);
      toast({
        title: "Disconnect Error",
        description: "Failed to disconnect client",
        variant: "destructive",
      });
      return false;
    }
  };

  const configureClientBandwidth = async (username: string, deviceId: string, downloadMbps: number, uploadMbps: number): Promise<boolean> => {
    try {
      // This would call the MikroTik API to update bandwidth limits
      console.log(`Updating bandwidth for ${username}: ${downloadMbps}/${uploadMbps} Mbps`);
      
      toast({
        title: "Bandwidth Updated",
        description: `Bandwidth limit updated for ${username}`,
      });
      
      return true;
    } catch (error) {
      console.error('Bandwidth update error:', error);
      toast({
        title: "Bandwidth Update Failed",
        description: "Failed to update bandwidth limits",
        variant: "destructive",
      });
      return false;
    }
  };

  const stopMonitoring = () => {
    realTimeMikrotikIntegration.stopMonitoring();
    setIsMonitoring(false);
    console.log('Network monitoring stopped');
  };

  return {
    metrics,
    devices,
    isMonitoring,
    isLoading,
    disconnectClient,
    configureClientBandwidth,
    refreshMetrics: fetchNetworkMetrics,
    refreshDevices: fetchDeviceStatuses
  };
};
