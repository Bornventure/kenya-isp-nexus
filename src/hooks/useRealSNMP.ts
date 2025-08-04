
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { realSnmpService } from '@/services/realSnmpService';

interface SNMPDevice {
  id: string;
  name: string;
  ip: string;
  community: string;
  version: number;
  status: 'online' | 'offline';
  type: 'router' | 'switch' | 'access_point';
  uptime: number;
  cpuUsage: number;
  memoryUsage: number;
  interfaces: Array<{
    index: number;
    name: string;
    status: 'up' | 'down';
    speed: number;
    utilization: number;
    bytesIn: number;
    bytesOut: number;
  }>;
}

export const useRealSNMP = () => {
  const [devices, setDevices] = useState<SNMPDevice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const { toast } = useToast();

  const refreshDevices = useCallback(async () => {
    try {
      const deviceList = await realSnmpService.getDevices();
      setDevices(deviceList);
    } catch (error) {
      console.error('Error refreshing devices:', error);
    }
  }, []);

  const addDevice = useCallback(async (ip: string, community: string = 'public', version: number = 2) => {
    setIsLoading(true);
    try {
      const device = await realSnmpService.addDevice(ip, community, version);
      if (device) {
        await refreshDevices();
        toast({
          title: "Device Added",
          description: `Successfully added ${device.name} (${ip}) to network monitoring.`,
        });
        return device;
      }
      return null;
    } catch (error: any) {
      console.error('Error adding device:', error);
      toast({
        title: "Failed to Add Device",
        description: error.message || "Could not connect to the device. Please check the IP address and SNMP settings.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [refreshDevices, toast]);

  const testConnection = useCallback(async (ip: string, community: string = 'public', version: number = 2) => {
    setIsLoading(true);
    try {
      const isOnline = await realSnmpService.testConnection(ip, community, version);
      toast({
        title: isOnline ? "Connection Successful" : "Connection Failed",
        description: isOnline 
          ? `Successfully connected to ${ip} via SNMP.`
          : `Could not connect to ${ip}. Please check the device configuration.`,
        variant: isOnline ? "default" : "destructive",
      });
      return isOnline;
    } catch (error) {
      console.error('Error testing connection:', error);
      toast({
        title: "Connection Test Failed",
        description: "An error occurred while testing the connection.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const disconnectClient = useCallback(async (deviceIp: string, clientMac: string) => {
    setIsLoading(true);
    try {
      const success = await realSnmpService.disconnectClient(deviceIp, clientMac);
      if (success) {
        toast({
          title: "Client Disconnected",
          description: `Successfully disconnected client ${clientMac} from device ${deviceIp}.`,
        });
      } else {
        toast({
          title: "Disconnection Failed",
          description: "Could not disconnect the client. Please check the device status.",
          variant: "destructive",
        });
      }
      return success;
    } catch (error) {
      console.error('Error disconnecting client:', error);
      toast({
        title: "Disconnection Error",
        description: "An error occurred while disconnecting the client.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const reconnectClient = useCallback(async (deviceIp: string, clientMac: string) => {
    setIsLoading(true);
    try {
      const success = await realSnmpService.reconnectClient(deviceIp, clientMac);
      if (success) {
        toast({
          title: "Client Reconnected",
          description: `Successfully reconnected client ${clientMac} to device ${deviceIp}.`,
        });
      } else {
        toast({
          title: "Reconnection Failed",
          description: "Could not reconnect the client. Please check the device status.",
          variant: "destructive",
        });
      }
      return success;
    } catch (error) {
      console.error('Error reconnecting client:', error);
      toast({
        title: "Reconnection Error",
        description: "An error occurred while reconnecting the client.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const startMonitoring = useCallback(() => {
    realSnmpService.startMonitoring();
    setIsMonitoring(true);
    toast({
      title: "Monitoring Started",
      description: "Real-time SNMP monitoring has been enabled.",
    });
  }, [toast]);

  const stopMonitoring = useCallback(() => {
    realSnmpService.stopMonitoring();
    setIsMonitoring(false);
    toast({
      title: "Monitoring Stopped",
      description: "Real-time SNMP monitoring has been disabled.",
    });
  }, [toast]);

  useEffect(() => {
    refreshDevices();
  }, [refreshDevices]);

  // Auto-refresh devices every 30 seconds if monitoring is enabled
  useEffect(() => {
    if (isMonitoring) {
      const interval = setInterval(refreshDevices, 30000);
      return () => clearInterval(interval);
    }
  }, [isMonitoring, refreshDevices]);

  return {
    devices,
    isLoading,
    isMonitoring,
    addDevice,
    testConnection,
    disconnectClient,
    reconnectClient,
    startMonitoring,
    stopMonitoring,
    refreshDevices,
  };
};
