
import { supabase } from '@/integrations/supabase/client';

export interface ClientNetworkStatus {
  is_online: boolean;
  last_seen: string;
  current_session?: {
    session_id: string;
    ip_address: string;
    nas_ip_address?: string;
    start_time: string;
    bytes_in: number;
    bytes_out: number;
  };
  speed_limit: {
    download: string;
    upload: string;
  };
  data_usage_today: number;
}

interface NetworkMonitoringConfig {
  enabled: boolean;
  checkInterval: number;
  disconnectionThreshold: number;
}

class LiveNetworkMonitoringService {
  private config: NetworkMonitoringConfig = {
    enabled: false,
    checkInterval: 60000,
    disconnectionThreshold: 300,
  };
  
  private intervalId: NodeJS.Timeout | null = null;
  private monitoredClients: Set<string> = new Set();

  startMonitoring(): void {
    if (this.config.enabled) return;
    
    this.config.enabled = true;
    console.log('Starting live network monitoring service...');
    
    this.intervalId = setInterval(() => {
      this.performNetworkChecks();
    }, this.config.checkInterval);
    
    this.performNetworkChecks();
  }

  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.config.enabled = false;
    console.log('Live network monitoring service stopped');
  }

  addClientToMonitoring(clientId: string): void {
    this.monitoredClients.add(clientId);
    console.log(`Client ${clientId} added to network monitoring`);
  }

  removeClientFromMonitoring(clientId: string): void {
    this.monitoredClients.delete(clientId);
    console.log(`Client ${clientId} removed from network monitoring`);
  }

  async getClientNetworkStatus(clientId: string): Promise<ClientNetworkStatus | null> {
    try {
      // Simulate network status retrieval
      return {
        is_online: Math.random() > 0.1,
        last_seen: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        current_session: Math.random() > 0.2 ? {
          session_id: `session_${clientId}_${Date.now()}`,
          ip_address: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
          nas_ip_address: '192.168.1.1',
          start_time: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          bytes_in: Math.floor(Math.random() * 1000000000),
          bytes_out: Math.floor(Math.random() * 500000000),
        } : undefined,
        speed_limit: {
          download: '20Mbps',
          upload: '10Mbps',
        },
        data_usage_today: Math.random() * 1000,
      };
    } catch (error) {
      console.error('Error getting client network status:', error);
      return null;
    }
  }

  subscribeToClientStatus(clientId: string, callback: (status: ClientNetworkStatus) => void): () => void {
    const interval = setInterval(async () => {
      const status = await this.getClientNetworkStatus(clientId);
      if (status) {
        callback(status);
      }
    }, 30000);

    // Initial call
    this.getClientNetworkStatus(clientId).then(status => {
      if (status) callback(status);
    });

    return () => clearInterval(interval);
  }

  async disconnectClient(clientId: string): Promise<boolean> {
    try {
      console.log(`Disconnecting client ${clientId}`);
      // In a real implementation, this would disconnect the client from MikroTik
      return true;
    } catch (error) {
      console.error('Error disconnecting client:', error);
      return false;
    }
  }

  async changeClientSpeedLimit(clientId: string, newSpeed: string): Promise<boolean> {
    try {
      console.log(`Changing speed limit for client ${clientId} to ${newSpeed}`);
      // In a real implementation, this would update MikroTik speed limits
      return true;
    } catch (error) {
      console.error('Error changing client speed limit:', error);
      return false;
    }
  }

  private async performNetworkChecks(): Promise<void> {
    try {
      const { data: activeClients, error } = await supabase
        .from('clients')
        .select('id, name, phone, status, service_activated_at')
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching active clients:', error);
        return;
      }

      for (const client of activeClients || []) {
        await this.checkClientNetworkStatus(client);
      }

    } catch (error) {
      console.error('Network monitoring error:', error);
    }
  }

  private async checkClientNetworkStatus(client: any): Promise<void> {
    try {
      const isOnline = await this.simulateNetworkCheck(client.id);
      
      if (!isOnline) {
        await this.handleClientDisconnection(client);
      } else {
        await this.updateClientNetworkStatus(client.id, 'online');
      }

    } catch (error) {
      console.error(`Network check failed for client ${client.id}:`, error);
    }
  }

  private async simulateNetworkCheck(clientId: string): Promise<boolean> {
    return Math.random() > 0.05;
  }

  private async handleClientDisconnection(client: any): Promise<void> {
    console.log(`Client ${client.name} appears to be disconnected`);
    
    try {
      await this.updateClientNetworkStatus(client.id, 'offline');
      
      await supabase
        .from('network_events')
        .insert({
          client_id: client.id,
          event_type: 'disconnection_detected',
          description: 'Client appears to be offline during network monitoring',
          event_data: {
            last_seen: new Date().toISOString(),
            monitoring_check: true,
          },
        });

      await this.sendNetworkIssueNotification(client);

    } catch (error) {
      console.error(`Error handling disconnection for client ${client.id}:`, error);
    }
  }

  private async updateClientNetworkStatus(clientId: string, status: 'online' | 'offline'): Promise<void> {
    console.log(`Client ${clientId} network status: ${status}`);
  }

  private async sendNetworkIssueNotification(client: any): Promise<void> {
    try {
      await supabase.functions.invoke('send-notifications', {
        body: {
          client_id: client.id,
          type: 'network_issue',
          data: {
            client_name: client.name,
            eta: '15-30 minutes',
            issue_detected_at: new Date().toISOString(),
          }
        }
      });

    } catch (error) {
      console.error('Failed to send network issue notification:', error);
    }
  }

  async performBandwidthCheck(clientId: string): Promise<{
    downloadSpeed: number;
    uploadSpeed: number;
    latency: number;
  }> {
    return {
      downloadSpeed: Math.random() * 100,
      uploadSpeed: Math.random() * 50,
      latency: Math.random() * 50 + 10,
    };
  }

  async getClientNetworkHistory(clientId: string, hours: number = 24): Promise<any[]> {
    const hoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('network_events')
      .select('*')
      .eq('client_id', clientId)
      .gte('created_at', hoursAgo)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching network history:', error);
      return [];
    }

    return data || [];
  }
}

export const liveNetworkMonitoringService = new LiveNetworkMonitoringService();
