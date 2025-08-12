
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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

  // Get network tasks
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['network-tasks'],
    queryFn: async () => {
      if (isRealMode()) {
        const { data, error } = await supabase
          .from('network_tasks')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data as NetworkTask[];
      }
      
      // Demo data
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

  // Get network agents
  const { data: agents = [], isLoading: agentsLoading } = useQuery({
    queryKey: ['network-agents'],
    queryFn: async () => {
      if (isRealMode()) {
        const { data, error } = await supabase
          .from('network_agents')
          .select('*')
          .order('name');
        
        if (error) throw error;
        return data;
      }
      
      // Demo data
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

  // Get device monitoring data
  const { data: deviceStatuses = [], isLoading: devicesLoading } = useQuery({
    queryKey: ['device-monitoring'],
    queryFn: () => enhancedSnmpService.getDeviceStatuses(),
    refetchInterval: 30000
  });

  // Create task mutation
  const { mutateAsync: createTask, isPending: isCreatingTask } = useMutation({
    mutationFn: async (taskData: Partial<NetworkTask>) => {
      if (isRealMode()) {
        const { data, error } = await supabase
          .from('network_tasks')
          .insert([{
            ...taskData,
            isp_company_id: (await supabase.auth.getUser()).data.user?.user_metadata?.isp_company_id
          }])
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
      
      // Demo response
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

  // Update task mutation
  const { mutateAsync: updateTask, isPending: isUpdatingTask } = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<NetworkTask> }) => {
      if (isRealMode()) {
        const { data, error } = await supabase
          .from('network_tasks')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
      
      // Demo response
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

  // Test connectivity
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

  // Get network metrics
  const { data: networkMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['network-metrics'],
    queryFn: () => enhancedSnmpService.getNetworkMetrics(),
    refetchInterval: 30000
  });

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
    isCreatingTask,
    isUpdatingTask,
    isRealMode: isRealMode()
  };
};

export default useProductionNetworkManagement;
