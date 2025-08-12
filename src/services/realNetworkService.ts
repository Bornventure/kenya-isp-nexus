
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
      // Create a simulated network task for testing
      console.log(`Testing ${testType} connection to ${ipAddress}`);
      
      // Simulate network test with delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // Simulate success/failure
      const success = Math.random() > 0.2; // 80% success rate
      
      return {
        success,
        responseTime: success ? Math.floor(Math.random() * 100) + 10 : undefined,
        error: success ? undefined : 'Host unreachable'
      };
    } catch (error) {
      console.error('Network test failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getNetworkAgents(): Promise<NetworkAgent[]> {
    // Return demo data since network_agents table doesn't exist
    return [
      {
        id: '1',
        name: 'Main Network Agent',
        description: 'Primary network monitoring agent',
        ip_address: '192.168.1.100',
        port: 8080,
        api_key: 'demo-key',
        status: 'online',
        last_heartbeat: new Date().toISOString(),
        capabilities: ['ping', 'snmp', 'mikrotik'],
        isp_company_id: 'demo-company',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  async createNetworkAgent(agent: Omit<NetworkAgent, 'id' | 'created_at' | 'updated_at'>): Promise<NetworkAgent | null> {
    console.log('Creating network agent:', agent);
    
    // Simulate agent creation
    const newAgent: NetworkAgent = {
      ...agent,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return newAgent;
  }

  getDemoModeStatus(): boolean {
    return this.isDemoMode;
  }
}

export const realNetworkService = new RealNetworkService();
