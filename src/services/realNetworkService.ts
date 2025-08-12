
import { supabase } from '@/integrations/supabase/client';

export interface NetworkAgent {
  id: string;
  name: string;
  description?: string;
  ip_address: string;
  port: number;
  api_key: string;
  status: 'online' | 'offline';
  last_heartbeat?: string;
  capabilities: string[];
  isp_company_id: string;
  created_at: string;
  updated_at: string;
}

export interface NetworkTask {
  id: string;
  agent_id: string;
  task_type: 'ping' | 'snmp_test' | 'mikrotik_connect' | 'speed_test';
  target_ip: string;
  target_config: any;
  priority: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  scheduled_at: string;
  started_at?: string;
  completed_at?: string;
  retry_count: number;
  max_retries: number;
  timeout_seconds: number;
  created_by: string;
  isp_company_id: string;
  created_at: string;
  updated_at: string;
}

export interface NetworkTaskResult {
  id: string;
  task_id: string;
  success: boolean;
  response_time_ms?: number;
  result_data: any;
  error_message?: string;
  raw_response?: string;
  completed_at: string;
}

class RealNetworkService {
  private readonly isDemoMode: boolean;

  constructor() {
    // Check if we're in demo mode (no environment variable or explicitly set to true)
    this.isDemoMode = !import.meta.env.VITE_REAL_NETWORK_MODE || 
                      import.meta.env.VITE_REAL_NETWORK_MODE !== 'true';
  }

  async testConnection(ipAddress: string, testType: 'ping' | 'snmp' | 'mikrotik' = 'ping'): Promise<{
    success: boolean;
    responseTime?: number;
    error?: string;
    isDemoResult?: boolean;
  }> {
    if (this.isDemoMode) {
      console.log('🚨 DEMO MODE: Network test simulation active');
      // Return simulated results with demo indicator
      return {
        success: Math.random() > 0.3, // 70% success rate in demo
        responseTime: Math.floor(Math.random() * 100) + 10,
        isDemoResult: true
      };
    }

    try {
      // Create a network task for real testing
      const taskId = await this.createNetworkTask(testType, ipAddress);
      if (!taskId) {
        return {
          success: false,
          error: 'No network agents available'
        };
      }

      // Wait for task completion (with timeout)
      const result = await this.waitForTaskCompletion(taskId, 30000); // 30 second timeout
      
      return {
        success: result.success,
        responseTime: result.response_time_ms,
        error: result.error_message
      };
    } catch (error) {
      console.error('Network test failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async createNetworkTask(
    taskType: 'ping' | 'snmp_test' | 'mikrotik_connect',
    targetIp: string,
    config: any = {}
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('create_network_task', {
        p_task_type: taskType,
        p_target_ip: targetIp,
        p_target_config: config
      });

      if (error) {
        console.error('Failed to create network task:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating network task:', error);
      return null;
    }
  }

  async waitForTaskCompletion(taskId: string, timeoutMs: number = 30000): Promise<NetworkTaskResult> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      try {
        // Check if task is completed
        const { data: task, error: taskError } = await supabase
          .from('network_tasks')
          .select('status')
          .eq('id', taskId)
          .single();

        if (taskError) {
          throw new Error(`Failed to check task status: ${taskError.message}`);
        }

        if (task.status === 'completed' || task.status === 'failed') {
          // Get the result
          const { data: result, error: resultError } = await supabase
            .from('network_task_results')
            .select('*')
            .eq('task_id', taskId)
            .single();

          if (resultError) {
            throw new Error(`Failed to get task result: ${resultError.message}`);
          }

          return result;
        }

        // Wait 1 second before checking again
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Error waiting for task completion:', error);
        throw error;
      }
    }

    throw new Error('Task timeout');
  }

  async getNetworkAgents(): Promise<NetworkAgent[]> {
    try {
      const { data, error } = await supabase
        .from('network_agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch network agents:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching network agents:', error);
      return [];
    }
  }

  async createNetworkAgent(agent: Omit<NetworkAgent, 'id' | 'created_at' | 'updated_at'>): Promise<NetworkAgent | null> {
    try {
      const { data, error } = await supabase
        .from('network_agents')
        .insert(agent)
        .select()
        .single();

      if (error) {
        console.error('Failed to create network agent:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating network agent:', error);
      return null;
    }
  }

  getDemoModeStatus(): boolean {
    return this.isDemoMode;
  }
}

export const realNetworkService = new RealNetworkService();
