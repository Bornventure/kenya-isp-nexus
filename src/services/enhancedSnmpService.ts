
import { supabase } from '@/integrations/supabase/client';

export interface DeviceStatus {
  routerId: string;
  name: string;
  ip: string;
  status: 'online' | 'offline';
  uptime: string;
  cpuUsage: number;
  memoryUsage: number;
  connectedClients: number;
}

export interface ClientSession {
  username: string;
  ipAddress: string;
  macAddress: string;
  startTime: Date;
  bytesIn: number;
  bytesOut: number;
  status: 'active' | 'disconnected';
}

class EnhancedSnmpService {
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;

  async disconnectClient(clientId: string): Promise<boolean> {
    try {
      console.log(`Disconnecting client: ${clientId}`);
      
      // Get client information
      const { data: client, error: clientError } = await supabase
        .from('clients' as any)
        .select('*')
        .eq('id', clientId)
        .single();

      if (clientError || !client) {
        console.error('Client not found:', clientError);
        return false;
      }

      // Get all active RADIUS sessions for this client
      const { data: sessions, error: sessionError } = await supabase
        .from('radius_sessions' as any)
        .select('*')
        .eq('client_id', clientId)
        .eq('status', 'active');

      if (sessionError) {
        console.error('Error fetching sessions:', sessionError);
        return false;
      }

      const radiusSessions = (sessions || []) as any[];

      // Disconnect from all MikroTik devices
      for (const session of radiusSessions) {
        try {
          await this.disconnectFromMikroTik(session.nas_ip_address, session.username);
          
          // Update session status
          await supabase
            .from('radius_sessions' as any)
            .update({
              status: 'disconnected',
              stop_time: new Date().toISOString(),
              updated_at: new Date().toISOString()
            } as any)
            .eq('id', session.id);
        } catch (error) {
          console.error(`Error disconnecting from ${session.nas_ip_address}:`, error);
        }
      }

      // Update client status
      await supabase
        .from('clients' as any)
        .update({
          status: 'suspended',
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', clientId);

      return true;
    } catch (error) {
      console.error('Error in disconnectClient:', error);
      return false;
    }
  }

  async reconnectClient(clientId: string): Promise<boolean> {
    try {
      console.log(`Reconnecting client: ${clientId}`);
      
      // Update client status to active
      await supabase
        .from('clients' as any)
        .update({
          status: 'active',
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', clientId);

      // The client will need to reconnect through normal authentication
      // This just enables them to authenticate again
      return true;
    } catch (error) {
      console.error('Error in reconnectClient:', error);
      return false;
    }
  }

  async applySpeedLimit(clientId: string, packageId: string): Promise<boolean> {
    try {
      console.log(`Applying speed limit for client: ${clientId}, package: ${packageId}`);
      
      // Get client and package information
      const { data: client, error: clientError } = await supabase
        .from('clients' as any)
        .select(`
          *,
          service_packages(*)
        `)
        .eq('id', clientId)
        .single();

      if (clientError || !client) {
        console.error('Client not found:', clientError);
        return false;
      }

      const clientData = client as any;

      // Get active sessions for this client
      const { data: sessions, error: sessionError } = await supabase
        .from('radius_sessions' as any)
        .select('*')
        .eq('client_id', clientId)
        .eq('status', 'active');

      if (sessionError) {
        console.error('Error fetching sessions:', sessionError);
        return false;
      }

      const radiusSessions = (sessions || []) as any[];

      // Apply speed limits on all active sessions
      for (const session of radiusSessions) {
        try {
          await this.applySpeedLimitToMikroTik(
            session.nas_ip_address,
            session.username,
            clientData.service_packages?.speed || '10M/10M'
          );
        } catch (error) {
          console.error(`Error applying speed limit on ${session.nas_ip_address}:`, error);
        }
      }

      return true;
    } catch (error) {
      console.error('Error in applySpeedLimit:', error);
      return false;
    }
  }

  async getDeviceStatus(): Promise<DeviceStatus[]> {
    try {
      const { data: routers, error } = await supabase
        .from('mikrotik_routers' as any)
        .select('*');

      if (error) {
        console.error('Error fetching routers:', error);
        return [];
      }

      const routerData = (routers || []) as any[];

      return routerData.map(router => ({
        routerId: router.id,
        name: router.name,
        ip: router.ip_address,
        status: router.connection_status || 'offline',
        uptime: this.calculateUptime(router.last_test_results?.timestamp),
        cpuUsage: Math.random() * 100, // Simulated
        memoryUsage: Math.random() * 100, // Simulated
        connectedClients: Math.floor(Math.random() * 50) // Simulated
      }));
    } catch (error) {
      console.error('Error getting device status:', error);
      return [];
    }
  }

  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('Started network monitoring');
    
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.performMonitoringCheck();
      } catch (error) {
        console.error('Monitoring check failed:', error);
      }
    }, 30000); // Monitor every 30 seconds
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log('Stopped network monitoring');
  }

  private async disconnectFromMikroTik(nasIp: string, username: string): Promise<void> {
    // Simulate MikroTik API call to disconnect user
    console.log(`Disconnecting ${username} from MikroTik ${nasIp}`);
    // In real implementation, this would use MikroTik API
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async applySpeedLimitToMikroTik(nasIp: string, username: string, speed: string): Promise<void> {
    // Simulate MikroTik API call to apply speed limit
    console.log(`Applying speed limit ${speed} to ${username} on MikroTik ${nasIp}`);
    // In real implementation, this would use MikroTik API
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private calculateUptime(lastTestTimestamp?: string): string {
    if (!lastTestTimestamp) return 'Unknown';
    
    const now = new Date();
    const lastTest = new Date(lastTestTimestamp);
    const diffMs = now.getTime() - lastTest.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} days`;
    } else if (diffHours > 0) {
      return `${diffHours} hours`;
    } else {
      return '< 1 hour';
    }
  }

  private async performMonitoringCheck(): Promise<void> {
    // Get active sessions and check their status
    const { data: sessions } = await supabase
      .from('radius_sessions' as any)
      .select('*')
      .eq('status', 'active');

    const activeSessions = (sessions || []) as any[];

    for (const session of activeSessions) {
      // Simulate checking session status
      const sessionData = session as any;
      const isStillActive = Math.random() > 0.1; // 90% chance session is still active
      
      if (!isStillActive) {
        // Mark session as disconnected
        await supabase
          .from('radius_sessions' as any)
          .update({
            status: 'disconnected',
            stop_time: new Date().toISOString(),
            bytes_in: sessionData.bytes_in + Math.floor(Math.random() * 1000000),
            bytes_out: sessionData.bytes_out + Math.floor(Math.random() * 1000000)
          } as any)
          .eq('id', sessionData.id);
      } else {
        // Update session with new data usage
        await supabase
          .from('radius_sessions' as any)
          .update({
            bytes_in: sessionData.bytes_in + Math.floor(Math.random() * 100000),
            bytes_out: sessionData.bytes_out + Math.floor(Math.random() * 100000)
          } as any)
          .eq('id', sessionData.id);
      }
    }
  }
}

export const enhancedSnmpService = new EnhancedSnmpService();
