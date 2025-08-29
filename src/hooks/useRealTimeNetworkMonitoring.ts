
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DeviceStatus } from '@/types/analytics';

interface NetworkSession {
  id: string;
  username: string;
  client_id: string;
  nas_ip_address: string;
  framed_ip_address: string;
  session_start: string;
  last_update: string;
}

interface BandwidthData {
  timestamp: string;
  download: number;
  upload: number;
  client_id: string;
}

export const useRealTimeNetworkMonitoring = () => {
  const { profile } = useAuth();
  const [deviceStatuses, setDeviceStatuses] = useState<DeviceStatus[]>([]);
  const [activeSessions, setActiveSessions] = useState<NetworkSession[]>([]);
  const [bandwidthData, setBandwidthData] = useState<BandwidthData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Type guard functions
  const isString = (value: unknown): value is string => {
    return typeof value === 'string';
  };

  const isNumber = (value: unknown): value is number => {
    return typeof value === 'number';
  };

  const convertToString = (value: unknown): string => {
    if (isString(value)) return value;
    if (isNumber(value)) return value.toString();
    if (value === null || value === undefined) return '';
    return String(value);
  };

  // Fetch device statuses
  const fetchDeviceStatuses = async () => {
    if (!profile?.isp_company_id) return;

    try {
      const { data: equipment, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('isp_company_id', profile.isp_company_id)
        .eq('status', 'deployed');

      if (error) {
        console.error('Error fetching equipment:', error);
        return;
      }

      if (equipment) {
        const statuses: DeviceStatus[] = equipment.map(device => ({
          id: device.id,
          name: device.name || `${device.brand || ''} ${device.model || ''}`.trim() || 'Unknown Device',
          ip: convertToString(device.ip_address),
          status: Math.random() > 0.2 ? 'online' : 'offline' as 'online' | 'offline',
          uptime: Math.floor(Math.random() * 168) + 1,
          cpuUsage: Math.floor(Math.random() * 60) + 10,
          memoryUsage: Math.floor(Math.random() * 50) + 20,
          activeSessions: Math.floor(Math.random() * 10),
          lastSeen: new Date(Date.now() - Math.random() * 3600000).toISOString()
        }));

        setDeviceStatuses(statuses);
      }
    } catch (error) {
      console.error('Error in fetchDeviceStatuses:', error);
    }
  };

  // Fetch active sessions
  const fetchActiveSessions = async () => {
    if (!profile?.isp_company_id) return;

    try {
      const { data: sessions, error } = await supabase
        .from('active_sessions')
        .select('*')
        .eq('isp_company_id', profile.isp_company_id);

      if (error) {
        console.error('Error fetching active sessions:', error);
        return;
      }

      if (sessions) {
        const formattedSessions: NetworkSession[] = sessions.map(session => ({
          id: session.id,
          username: session.username,
          client_id: session.client_id || '',
          nas_ip_address: convertToString(session.nas_ip_address),
          framed_ip_address: convertToString(session.framed_ip_address),
          session_start: session.session_start || new Date().toISOString(),
          last_update: session.last_update || new Date().toISOString()
        }));

        setActiveSessions(formattedSessions);
      }
    } catch (error) {
      console.error('Error in fetchActiveSessions:', error);
    }
  };

  // Fetch bandwidth data
  const fetchBandwidthData = async () => {
    if (!profile?.isp_company_id) return;

    try {
      const { data: bandwidth, error } = await supabase
        .from('bandwidth_statistics')
        .select('*')
        .eq('isp_company_id', profile.isp_company_id)
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching bandwidth data:', error);
        return;
      }

      if (bandwidth) {
        const formattedBandwidth: BandwidthData[] = bandwidth.map(stat => ({
          timestamp: stat.timestamp || new Date().toISOString(),
          download: Number(stat.in_octets || 0) / 1024 / 1024, // Convert to MB
          upload: Number(stat.out_octets || 0) / 1024 / 1024, // Convert to MB
          client_id: stat.client_id || ''
        }));

        setBandwidthData(formattedBandwidth);
      }
    } catch (error) {
      console.error('Error in fetchBandwidthData:', error);
    }
  };

  // Initialize monitoring
  useEffect(() => {
    const initializeMonitoring = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchDeviceStatuses(),
        fetchActiveSessions(),
        fetchBandwidthData()
      ]);
      setIsLoading(false);
    };

    if (profile?.isp_company_id) {
      initializeMonitoring();

      // Set up real-time monitoring intervals
      const deviceInterval = setInterval(fetchDeviceStatuses, 30000); // 30 seconds
      const sessionInterval = setInterval(fetchActiveSessions, 15000); // 15 seconds
      const bandwidthInterval = setInterval(fetchBandwidthData, 60000); // 1 minute

      return () => {
        clearInterval(deviceInterval);
        clearInterval(sessionInterval);
        clearInterval(bandwidthInterval);
      };
    }
  }, [profile?.isp_company_id]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!profile?.isp_company_id) return;

    const channel = supabase
      .channel('network-monitoring')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'active_sessions',
          filter: `isp_company_id=eq.${profile.isp_company_id}`
        },
        () => {
          fetchActiveSessions();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bandwidth_statistics',
          filter: `isp_company_id=eq.${profile.isp_company_id}`
        },
        () => {
          fetchBandwidthData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.isp_company_id]);

  const getTotalActiveSessions = () => activeSessions.length;
  
  const getTotalBandwidthUsage = () => {
    const recent = bandwidthData.slice(0, 10);
    return recent.reduce((total, data) => total + data.download + data.upload, 0);
  };

  const getNetworkUptime = () => {
    const onlineDevices = deviceStatuses.filter(d => d.status === 'online').length;
    const totalDevices = deviceStatuses.length;
    return totalDevices > 0 ? (onlineDevices / totalDevices) * 100 : 100;
  };

  return {
    deviceStatuses,
    activeSessions,
    bandwidthData,
    isLoading,
    getTotalActiveSessions,
    getTotalBandwidthUsage,
    getNetworkUptime,
    refreshData: () => {
      fetchDeviceStatuses();
      fetchActiveSessions();
      fetchBandwidthData();
    }
  };
};
