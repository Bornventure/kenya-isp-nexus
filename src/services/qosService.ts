
import { supabase } from '@/integrations/supabase/client';
import { snmpService } from './snmpService';

export interface QoSPolicy {
  id: string;
  name: string;
  maxBandwidthDown: number; // in Mbps
  maxBandwidthUp: number; // in Mbps
  priority: 'high' | 'medium' | 'low';
  burstSize?: number;
  guaranteedBandwidth?: number;
  protocol?: 'tcp' | 'udp' | 'both';
  isActive: boolean;
}

export interface ClientQoSMapping {
  clientId: string;
  packageId: string;
  currentPolicy: QoSPolicy;
  equipmentId: string;
  interfaceId?: string;
  lastUpdated: Date;
}

class QoSService {
  private activePolicies: Map<string, ClientQoSMapping> = new Map();

  async createQoSPolicy(policy: Omit<QoSPolicy, 'id'>): Promise<QoSPolicy> {
    const newPolicy: QoSPolicy = {
      id: `qos-${Date.now()}`,
      ...policy
    };

    // For now, we'll store policies in memory since the database table might not be in types yet
    // This can be updated later when the types are regenerated
    console.log('Creating QoS policy:', newPolicy);

    return newPolicy;
  }

  async applyQoSToClient(clientId: string, packageId: string): Promise<boolean> {
    try {
      // Get service package details
      const { data: servicePackage } = await supabase
        .from('service_packages')
        .select('*')
        .eq('id', packageId)
        .single();

      if (!servicePackage) {
        console.error('Service package not found');
        return false;
      }

      // Parse speed from package (e.g., "50 Mbps" -> 50)
      const speedMatch = servicePackage.speed.match(/(\d+)/);
      const maxSpeed = speedMatch ? parseInt(speedMatch[1]) : 10;

      // Get client's equipment
      const { data: clientEquipment } = await supabase
        .from('client_equipment')
        .select('equipment_id, equipment(*)')
        .eq('client_id', clientId);

      if (!clientEquipment?.length) {
        console.error('No equipment found for client');
        return false;
      }

      let success = true;
      for (const assignment of clientEquipment) {
        const equipment = assignment.equipment as any;
        if (!equipment.ip_address) continue;

        // Apply QoS based on equipment type
        const qosSuccess = await this.configureQoSOnEquipment(
          equipment,
          clientId,
          maxSpeed,
          maxSpeed * 0.8 // Upload typically 80% of download
        );

        if (!qosSuccess) success = false;

        // Store the mapping
        const mapping: ClientQoSMapping = {
          clientId,
          packageId,
          equipmentId: equipment.id,
          currentPolicy: {
            id: `policy-${clientId}-${packageId}`,
            name: `${servicePackage.name} - ${clientId}`,
            maxBandwidthDown: maxSpeed,
            maxBandwidthUp: maxSpeed * 0.8,
            priority: this.getPriorityFromSpeed(maxSpeed),
            isActive: true
          },
          lastUpdated: new Date()
        };

        this.activePolicies.set(clientId, mapping);

        // Log QoS event
        await supabase.from('network_events').insert({
          client_id: clientId,
          equipment_id: equipment.id,
          event_type: 'qos_applied',
          triggered_by: 'package_assignment',
          event_data: {
            package_id: packageId,
            max_download: maxSpeed,
            max_upload: maxSpeed * 0.8,
            device_ip: equipment.ip_address
          } as any,
          success: qosSuccess
        });
      }

      return success;
    } catch (error) {
      console.error('Error applying QoS to client:', error);
      return false;
    }
  }

  private async configureQoSOnEquipment(
    equipment: any,
    clientId: string,
    maxDownload: number,
    maxUpload: number
  ): Promise<boolean> {
    try {
      console.log(`Configuring QoS on ${equipment.brand} ${equipment.model} (${equipment.ip_address})`);
      console.log(`Speed limits: Download ${maxDownload}Mbps, Upload ${maxUpload}Mbps`);

      switch (equipment.type) {
        case 'router':
          return await this.configureRouterQoS(equipment, clientId, maxDownload, maxUpload);
        case 'switch':
          return await this.configureSwitchQoS(equipment, clientId, maxDownload, maxUpload);
        case 'access_point':
          return await this.configureAPQoS(equipment, clientId, maxDownload, maxUpload);
        default:
          console.warn(`QoS configuration not supported for device type: ${equipment.type}`);
          return false;
      }
    } catch (error) {
      console.error('QoS configuration error:', error);
      return false;
    }
  }

  private async configureRouterQoS(
    equipment: any,
    clientId: string,
    maxDownload: number,
    maxUpload: number
  ): Promise<boolean> {
    // Simulate SNMP commands for router QoS configuration
    console.log(`Configuring router QoS for client ${clientId}:`);
    console.log(`- Creating traffic class with ${maxDownload}/${maxUpload} Mbps limits`);
    console.log(`- Applying policy to client interface`);
    console.log(`- Setting burst allowance to ${maxDownload * 0.2}Mbps`);
    
    return true;
  }

  private async configureSwitchQoS(
    equipment: any,
    clientId: string,
    maxDownload: number,
    maxUpload: number
  ): Promise<boolean> {
    // Simulate SNMP commands for switch QoS configuration
    console.log(`Configuring switch QoS for client ${clientId}:`);
    console.log(`- Setting port rate limiting to ${maxDownload}Mbps`);
    console.log(`- Configuring ingress/egress policers`);
    console.log(`- Setting DSCP marking for traffic prioritization`);
    
    return true;
  }

  private async configureAPQoS(
    equipment: any,
    clientId: string,
    maxDownload: number,
    maxUpload: number
  ): Promise<boolean> {
    // Simulate SNMP commands for access point QoS configuration
    console.log(`Configuring AP QoS for client ${clientId}:`);
    console.log(`- Setting wireless client rate limiting`);
    console.log(`- Configuring WMM parameters`);
    console.log(`- Setting airtime fairness policies`);
    
    return true;
  }

  private getPriorityFromSpeed(speed: number): 'high' | 'medium' | 'low' {
    if (speed >= 100) return 'high';
    if (speed >= 50) return 'medium';
    return 'low';
  }

  async removeQoSFromClient(clientId: string): Promise<boolean> {
    try {
      const mapping = this.activePolicies.get(clientId);
      if (!mapping) {
        console.warn(`No active QoS policy found for client ${clientId}`);
        return true;
      }

      // Get equipment details
      const { data: equipment } = await supabase
        .from('equipment')
        .select('*')
        .eq('id', mapping.equipmentId)
        .single();

      if (!equipment) {
        console.error('Equipment not found for QoS removal');
        return false;
      }

      // Remove QoS configuration
      const success = await this.removeQoSFromEquipment(equipment, clientId);

      if (success) {
        this.activePolicies.delete(clientId);

        // Log removal event
        await supabase.from('network_events').insert({
          client_id: clientId,
          equipment_id: equipment.id,
          event_type: 'qos_removed',
          triggered_by: 'client_suspension',
          event_data: {
            policy_removed: mapping.currentPolicy.name,
            device_ip: equipment.ip_address
          } as any,
          success: true
        });
      }

      return success;
    } catch (error) {
      console.error('Error removing QoS from client:', error);
      return false;
    }
  }

  private async removeQoSFromEquipment(equipment: any, clientId: string): Promise<boolean> {
    console.log(`Removing QoS configuration for client ${clientId} from ${equipment.brand} ${equipment.model}`);
    
    // Simulate removal of QoS policies via SNMP
    switch (equipment.type) {
      case 'router':
        console.log('- Removing policy-map from interface');
        console.log('- Deleting class-map configuration');
        break;
      case 'switch':
        console.log('- Removing port rate limiting');
        console.log('- Resetting policer configuration');
        break;
      case 'access_point':
        console.log('- Removing client rate limiting');
        console.log('- Resetting WMM parameters');
        break;
    }
    
    return true;
  }

  async updateClientQoS(clientId: string, newPackageId: string): Promise<boolean> {
    // Remove existing QoS
    await this.removeQoSFromClient(clientId);
    
    // Apply new QoS
    return await this.applyQoSToClient(clientId, newPackageId);
  }

  async monitorQoSCompliance(): Promise<void> {
    console.log('Starting QoS compliance monitoring...');
    
    for (const [clientId, mapping] of this.activePolicies) {
      try {
        // Get current bandwidth usage
        const usage = await this.getCurrentBandwidthUsage(mapping.equipmentId, clientId);
        
        if (usage.download > mapping.currentPolicy.maxBandwidthDown * 1.1) {
          console.warn(`Client ${clientId} exceeding download limit: ${usage.download}Mbps > ${mapping.currentPolicy.maxBandwidthDown}Mbps`);
          
          // Log compliance violation
          await supabase.from('network_events').insert({
            client_id: clientId,
            equipment_id: mapping.equipmentId,
            event_type: 'qos_violation',
            triggered_by: 'automatic_monitoring',
            event_data: {
              current_usage: usage.download,
              allowed_limit: mapping.currentPolicy.maxBandwidthDown,
              violation_type: 'download_exceeded'
            } as any,
            success: false
          });
        }
      } catch (error) {
        console.error(`Error monitoring QoS for client ${clientId}:`, error);
      }
    }
  }

  private async getCurrentBandwidthUsage(equipmentId: string, clientId: string): Promise<{download: number, upload: number}> {
    // Simulate bandwidth monitoring via SNMP
    return {
      download: Math.random() * 100, // Simulated current usage
      upload: Math.random() * 50
    };
  }

  getActiveQoSPolicies(): ClientQoSMapping[] {
    return Array.from(this.activePolicies.values());
  }

  async initializeQoSFromDatabase(): Promise<void> {
    try {
      // Load existing clients with service packages
      const { data: clients } = await supabase
        .from('clients')
        .select(`
          id,
          service_package_id,
          service_packages(*)
        `)
        .eq('status', 'active')
        .not('service_package_id', 'is', null);

      if (clients) {
        for (const client of clients) {
          if (client.service_package_id) {
            await this.applyQoSToClient(
              client.id,
              client.service_package_id
            );
          }
        }
      }

      console.log(`Initialized ${this.activePolicies.size} QoS policies from database`);
    } catch (error) {
      console.error('Error initializing QoS from database:', error);
    }
  }
}

export const qosService = new QoSService();
