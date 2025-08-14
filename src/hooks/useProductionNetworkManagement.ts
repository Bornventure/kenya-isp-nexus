
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { enhancedSnmpService } from '@/services/enhancedSnmpService';

export interface NetworkTask {
  id: string;
  title: string;
  description: string;
  type: 'maintenance' | 'configuration' | 'troubleshooting' | 'monitoring';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  deviceId?: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
}

export const useProductionNetworkManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isRealMode = (): boolean => {
    return import.meta.env.VITE_REAL_NETWORK_MODE === 'true';
  };

  // Always use demo data since database tables don't exist yet
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['network-tasks'],
    queryFn: async () => {
      return [
        {
          id: '1',
          title: 'Router Firmware Update',
          description: 'Update core router firmware to latest version',
          type: 'maintenance' as const,
          status: 'pending' as const,
          priority: 'high' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deviceId: '1',
          dueDate: new Date(Date.now() + 86400000).toISOString()
        }
      ] as NetworkTask[];
    },
    refetchInterval: 30000
  });

  const { data: agents = [], isLoading: agentsLoading } = useQuery({
    queryKey: ['network-agents'],
    queryFn: async () => {
      return [
        {
          id: '1',
          name: 'Main Network Agent',
          ip_address: '192.168.1.100',
          status: 'active',
          last_seen: new Date().toISOString(),
          capabilities: ['snmp', 'ping', 'bandwidth_monitoring'],
          created_at: new Date().toISOString()
        }
      ];
    },
    refetchInterval: 30000
  });

  const { data: deviceStatuses = [], isLoading: devicesLoading } = useQuery({
    queryKey: ['device-monitoring'],
    queryFn: () => enhancedSnmpService.getDeviceStatuses(),
    refetchInterval: 30000
  });

  const { mutateAsync: createTask, isPending: isCreatingTask } = useMutation({
    mutationFn: async (taskData: Partial<NetworkTask>) => {
      return { ...taskData, id: Math.random().toString() } as NetworkTask;
    },
    onSuccess: () => {
      toast({
        title: "Task Created",
        description: "Network task has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['network-tasks'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
      console.error('Error creating task:', error);
    }
  });

  const { mutateAsync: updateTask, isPending: isUpdatingTask } = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<NetworkTask> }) => {
      return { id, ...updates } as NetworkTask;
    },
    onSuccess: () => {
      toast({
        title: "Task Updated",
        description: "Network task has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['network-tasks'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
      console.error('Error updating task:', error);
    }
  });

  const testConnectivity = async (ipAddress: string) => {
    try {
      const result = await enhancedSnmpService.testConnectivity(ipAddress);
      
      toast({
        title: result.success ? "Connection Successful" : "Connection Failed",
        description: result.success 
          ? `Response time: ${result.responseTime}ms`
          : result.error || "Unable to reach device",
        variant: result.success ? "default" : "destructive",
      });
      
      return result;
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Unable to test connectivity",
        variant: "destructive",
      });
      throw error;
    }
  };

  const { data: networkMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['network-metrics'],
    queryFn: () => enhancedSnmpService.getNetworkMetrics(),
    refetchInterval: 30000
  });

  // Add missing methods that components expect
  const disconnectClient = async (clientId: string): Promise<boolean> => {
    try {
      const success = await enhancedSnmpService.disconnectClient(clientId);
      if (success) {
        toast({
          title: "Client Disconnected",
          description: "Client has been successfully disconnected.",
          variant: "destructive",
        });
      }
      return success;
    } catch (error) {
      console.error('Error disconnecting client:', error);
      toast({
        title: "Disconnect Failed",
        description: "Failed to disconnect client. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const reconnectClient = async (clientId: string): Promise<boolean> => {
    try {
      const success = await enhancedSnmpService.reconnectClient(clientId);
      if (success) {
        toast({
          title: "Client Reconnected",
          description: "Client has been successfully reconnected.",
        });
      }
      return success;
    } catch (error) {
      console.error('Error reconnecting client:', error);
      toast({
        title: "Reconnect Failed",
        description: "Failed to reconnect client. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const applySpeedLimit = async (clientId: string, packageId: string): Promise<boolean> => {
    try {
      const success = await enhancedSnmpService.applySpeedLimit(clientId, packageId);
      if (success) {
        toast({
          title: "Speed Limit Applied",
          description: "Speed limit has been successfully applied.",
        });
      }
      return success;
    } catch (error) {
      console.error('Error applying speed limit:', error);
      toast({
        title: "Speed Limit Failed",
        description: "Failed to apply speed limit. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const getDeviceStatus = async () => {
    return await enhancedSnmpService.getDeviceStatus();
  };

  return {
    tasks,
    agents,
    deviceStatuses,
    networkMetrics,
    tasksLoading,
    agentsLoading,
    devicesLoading,
    metricsLoading,
    createTask,
    updateTask,
    testConnectivity,
    disconnectClient,
    reconnectClient,
    applySpeedLimit,
    getDeviceStatus,
    isCreatingTask,
    isUpdatingTask,
    isRealMode: isRealMode()
  };
};

export default useProductionNetworkManagement;
