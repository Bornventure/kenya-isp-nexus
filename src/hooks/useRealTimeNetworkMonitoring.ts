
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NetworkDevice {
  id: string;
  type: string;
  brand?: string;
  model?: string;
  status: string;
  ip_address?: string;
  last_seen?: string;
  uptime?: number;
  cpu_usage?: number;
  memory_usage?: number;
  interface_count?: number;
}

interface NetworkAlert {
  id: string;
  device_id: string;
  alert_type: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  resolved: boolean;
}

export const useRealTimeNetworkMonitoring = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [alerts, setAlerts] = useState<NetworkAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchDevices = async () => {
    if (!profile?.isp_company_id) return;

    try {
      const { data: equipment, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('isp_company_id', profile.isp_company_id)
        .eq('status', 'active');

      if (error) throw error;

      const networkDevices: NetworkDevice[] = (equipment || []).map(eq => ({
        id: eq.id,
        type: eq.type || 'Unknown',
        brand: eq.brand || undefined,
        model: eq.model || undefined,
        status: eq.status || 'unknown',
        ip_address: eq.ip_address ? String(eq.ip_address) : undefined,
        last_seen: eq.updated_at || eq.created_at,
        uptime: Math.floor(Math.random() * 168), // Simulated uptime in hours
        cpu_usage: Math.floor(Math.random() * 100),
        memory_usage: Math.floor(Math.random() * 100),
        interface_count: Math.floor(Math.random() * 8) + 1,
      }));

      setDevices(networkDevices);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching network devices:', error);
      toast({
        title: "Network Monitoring Error",
        description: "Failed to fetch network devices",
        variant: "destructive",
      });
    }
  };

  const generateMockAlerts = (): NetworkAlert[] => {
    const alertTypes = ['High CPU Usage', 'Interface Down', 'Connection Timeout', 'Memory Warning'];
    const severities: ('low' | 'medium' | 'high' | 'critical')[] = ['low', 'medium', 'high', 'critical'];
    
    return devices.slice(0, 3).map((device, index) => ({
      id: `alert-${device.id}-${index}`,
      device_id: device.id,
      alert_type: alertTypes[index % alertTypes.length],
      message: `${alertTypes[index % alertTypes.length]} detected on ${device.brand || 'Device'} ${device.model || device.type}`,
      severity: severities[index % severities.length],
      created_at: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      resolved: Math.random() > 0.7,
    }));
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
    fetchDevices();
    
    // Set up periodic updates
    const interval = setInterval(() => {
      fetchDevices();
      setAlerts(generateMockAlerts());
    }, 30000); // Update every 30 seconds

    return () => {
      clearInterval(interval);
      setIsMonitoring(false);
    };
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
    
    toast({
      title: "Alert Resolved",
      description: "Network alert has been marked as resolved",
    });
  };

  useEffect(() => {
    if (profile?.isp_company_id) {
      const cleanup = startMonitoring();
      return cleanup;
    }
  }, [profile?.isp_company_id]);

  const networkStats = {
    totalDevices: devices.length,
    onlineDevices: devices.filter(d => d.status === 'active').length,
    offlineDevices: devices.filter(d => d.status !== 'active').length,
    criticalAlerts: alerts.filter(a => a.severity === 'critical' && !a.resolved).length,
    avgUptime: devices.length > 0 
      ? Math.round(devices.reduce((sum, d) => sum + (d.uptime || 0), 0) / devices.length)
      : 0,
  };

  return {
    devices,
    alerts: alerts.filter(a => !a.resolved),
    networkStats,
    isMonitoring,
    lastUpdate,
    startMonitoring,
    stopMonitoring,
    resolveAlert,
    refreshDevices: fetchDevices,
  };
};
